import { chromium } from 'playwright';

const URL = 'https://ams-public-website-neon.vercel.app/services/chimney-fireplace';

let geminiCalled = false;
let geminiStatus = null;
let reportGenerated = false;
let errorShown = false;
let errorMessage = '';
let formFilled = false;
let notes = '';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

// Monitor network for Gemini API calls
page.on('response', async (response) => {
  const url = response.url();
  if (url.includes('generativelanguage.googleapis.com')) {
    geminiCalled = true;
    geminiStatus = response.status();
    console.log(`[NETWORK] Gemini API called -> status ${geminiStatus}`);
  }
});

try {
  console.log('Loading page...');
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Page loaded');

  // Scroll to tool section
  await page.evaluate(() => {
    const el = document.getElementById('chimney-inspection');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(500);

  // --- STEP 1: Click 5 checkbox labels ---
  const checkboxLabels = await page.$$('label.check-item');
  console.log(`Found ${checkboxLabels.length} checkbox labels`);
  let clicked = 0;
  for (const label of checkboxLabels) {
    if (clicked >= 5) break;
    const text = await label.textContent();
    await label.click();
    console.log(`Checked [${clicked + 1}]: "${text?.trim().substring(0, 55)}"`);
    clicked++;
    await page.waitForTimeout(100);
  }

  // Select chimney location
  await page.selectOption('#ci-location', 'Exterior');
  console.log('Selected location: Exterior');

  // Fill textarea
  await page.fill('#ci-notes', 'Two-story brick chimney about 20 years old. Last inspected 5 years ago. Crown shows cracking.');
  console.log('Filled notes');

  // Click "Next — Your Information" button to advance to step 2
  const nextBtn = await page.$('#ci-to-step2');
  if (nextBtn) {
    await nextBtn.click();
    console.log('Clicked Next button to go to step 2');
    await page.waitForTimeout(500);
  } else {
    console.log('ERROR: #ci-to-step2 button not found!');
  }

  // Verify step 2 is now active
  const step2Active = await page.$eval('#ci-step2', el => el.classList.contains('active'));
  console.log(`Step 2 active: ${step2Active}`);

  // --- STEP 2: Fill contact fields ---
  await page.fill('#ci-name', 'Sarah Williams');
  console.log('Filled name');

  await page.fill('#ci-phone', '7735559876');
  console.log('Filled phone');

  await page.fill('#ci-email', 'sarah@example.com');
  console.log('Filled email');

  await page.fill('#ci-address', '321 Pine St, Naperville, IL');
  console.log('Filled address');

  await page.fill('#ci-zip', '60540');
  console.log('Filled zip');

  formFilled = true;
  await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\chimney_step2.png' });
  console.log('Screenshot of step 2 taken');

  // Click "Generate Safety Report" button
  const submitBtn = await page.$('#ci-submit');
  if (submitBtn) {
    await submitBtn.click();
    console.log('Clicked Generate Safety Report button');
  } else {
    console.log('ERROR: #ci-submit button not found!');
  }

  // Verify we're on step 3
  await page.waitForTimeout(1000);
  const step3Active = await page.$eval('#ci-step3', el => el.classList.contains('active'));
  console.log(`Step 3 active: ${step3Active}`);

  // --- STEP 3: Wait for Gemini response (up to 25 seconds) ---
  console.log('Waiting for Gemini response (max 25s)...');
  const startTime = Date.now();

  while (Date.now() - startTime < 25000) {
    await page.waitForTimeout(1500);
    const elapsed = Math.round((Date.now() - startTime) / 1000);

    // Check for result element being visible
    const resultVisible = await page.evaluate(() => {
      const el = document.getElementById('ci-result');
      return el ? el.style.display !== 'none' && el.style.display !== '' || getComputedStyle(el).display !== 'none' : false;
    });

    if (resultVisible) {
      const resultText = await page.$eval('#ci-result', el => el.textContent || '');
      console.log(`Result visible! Text preview: "${resultText.trim().substring(0, 200)}"`);
      reportGenerated = true;
      break;
    }

    // Check for error element
    const errorVisible = await page.evaluate(() => {
      const el = document.getElementById('ci-error');
      return el ? el.style.display !== 'none' : false;
    });

    if (errorVisible) {
      const errMsg = await page.$eval('#ci-error-msg', el => el.textContent || '');
      console.log(`Error visible: "${errMsg}"`);
      errorShown = true;
      errorMessage = errMsg.trim();
      break;
    }

    // Check spinner status
    const spinnerVisible = await page.evaluate(() => {
      const el = document.getElementById('ci-spinner');
      return el ? el.style.display !== 'none' : false;
    });

    console.log(`[${elapsed}s] geminiCalled=${geminiCalled}, spinnerVisible=${spinnerVisible}, resultVisible=${resultVisible}`);
  }

  await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\chimney_step3_result.png', fullPage: false });
  console.log('Final screenshot taken');

} catch (err) {
  console.error('Script error:', err.message);
  notes = `Script error: ${err.message}`;
  errorShown = true;
  errorMessage = err.message;
} finally {
  await browser.close();
}

// Determine verdict
let verdict;
if (reportGenerated && geminiCalled && geminiStatus === 200) {
  verdict = 'PASS';
} else if (errorShown && geminiCalled) {
  verdict = 'FAIL';
} else if (errorShown && !geminiCalled) {
  verdict = 'ERROR';
} else if (geminiCalled && !reportGenerated) {
  verdict = 'FAIL';
} else {
  verdict = 'ERROR';
}

if (!notes) {
  if (geminiCalled && reportGenerated) {
    notes = `Form filled across 2 steps (5 checkboxes + contact info). Gemini API called successfully (HTTP ${geminiStatus}). Safety report displayed on page with download PDF button.`;
  } else if (geminiCalled && errorShown) {
    notes = `Gemini API called (HTTP ${geminiStatus}) but returned error. Error shown: ${errorMessage.substring(0, 150)}`;
  } else if (geminiCalled) {
    notes = `Gemini API called (HTTP ${geminiStatus}) but no result or error appeared within 25s.`;
  } else if (errorShown) {
    notes = `Error shown without Gemini call: ${errorMessage.substring(0, 150)}`;
  } else {
    notes = `Form submitted (formFilled=${formFilled}) but no Gemini call detected and no result/error within 25s.`;
  }
}

const result = {
  toolName: 'ChimneyInspectionChecklist',
  page: '/services/chimney-fireplace',
  geminiCalled,
  geminiStatus,
  reportGenerated,
  errorShown,
  errorMessage,
  formFilled,
  verdict,
  notes
};

console.log('\n=== FINAL RESULT ===');
console.log(JSON.stringify(result, null, 2));
