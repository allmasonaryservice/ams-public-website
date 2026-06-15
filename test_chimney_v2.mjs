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

// Monitor network requests for Gemini API calls
page.on('response', async (response) => {
  const url = response.url();
  if (url.includes('generativelanguage.googleapis.com')) {
    geminiCalled = true;
    geminiStatus = response.status();
    console.log(`[NETWORK] Gemini API called: ${url.substring(0, 120)} -> status ${geminiStatus}`);
  }
});

page.on('console', msg => {
  console.log(`[CONSOLE ${msg.type()}] ${msg.text().substring(0, 200)}`);
});

try {
  console.log('Loading page...');
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Page loaded');

  // Scroll to the tool section
  await page.evaluate(() => {
    const el = document.getElementById('chimney-inspection');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(500);

  // --- Step 1: Click checkboxes via their parent labels ---
  // The checkboxes have class "ci-check", find their parent labels
  const checkboxLabels = await page.$$('label:has(input.ci-check)');
  console.log(`Found ${checkboxLabels.length} checkbox labels`);

  let clicked = 0;
  for (const label of checkboxLabels) {
    if (clicked >= 5) break;
    try {
      const text = await label.textContent();
      await label.click();
      console.log(`Clicked checkbox label [${clicked + 1}]: "${text?.trim().substring(0, 60)}"`);
      clicked++;
      await page.waitForTimeout(150);
    } catch (e) {
      console.log('Error clicking label:', e.message);
    }
  }

  // If no labels found via :has(), try alternative approach
  if (clicked === 0) {
    console.log('Trying alternative checkbox approach...');
    const checkboxes = await page.$$('input.ci-check');
    console.log(`Found ${checkboxes.length} checkbox inputs`);
    for (let i = 0; i < Math.min(5, checkboxes.length); i++) {
      try {
        // Get the parent label or parent element
        const parentLabel = await checkboxes[i].evaluateHandle(el => el.closest('label') || el.parentElement);
        const text = await parentLabel.evaluate(el => el.textContent?.trim());
        await parentLabel.asElement()?.click();
        console.log(`Clicked parent of checkbox [${i + 1}]: "${text?.substring(0, 60)}"`);
        clicked++;
        await page.waitForTimeout(150);
      } catch (e) {
        console.log('Error with alternative checkbox click:', e.message);
      }
    }
  }

  // --- Step 2: Fill select dropdown ---
  const locationSelect = await page.$('#ci-location');
  if (locationSelect) {
    const options = await locationSelect.$$eval('option', opts =>
      opts.map(o => ({ value: o.value, text: o.textContent?.trim() }))
    );
    console.log('Location select options:', JSON.stringify(options));
    const firstValid = options.find(o => o.value && o.value !== '');
    if (firstValid) {
      await locationSelect.selectOption(firstValid.value);
      console.log(`Selected location: "${firstValid.text}"`);
    }
  } else {
    console.log('No #ci-location select found');
    // Try any select
    const anySelect = await page.$('select');
    if (anySelect) {
      const options = await anySelect.$$eval('option', opts =>
        opts.map(o => ({ value: o.value, text: o.textContent?.trim() }))
      );
      console.log('Generic select options:', JSON.stringify(options));
      const firstValid = options.find(o => o.value && o.value !== '');
      if (firstValid) {
        await anySelect.selectOption(firstValid.value);
        console.log(`Selected: "${firstValid.text}"`);
      }
    }
  }

  // --- Step 3: Fill textarea ---
  const notesTextarea = await page.$('#ci-notes');
  if (notesTextarea) {
    await notesTextarea.fill('Two-story brick chimney, approximately 20 years old. Last inspected 5 years ago. Some mortar crumbling noted at the crown.');
    console.log('Filled notes textarea');
  }

  // --- Step 4: Fill contact fields ---
  const nameInput = await page.$('#ci-name');
  if (nameInput) { await nameInput.fill('Sarah Williams'); console.log('Filled name'); }

  const phoneInput = await page.$('#ci-phone');
  if (phoneInput) { await phoneInput.fill('7735559876'); console.log('Filled phone'); }

  const emailInput = await page.$('#ci-email');
  if (emailInput) { await emailInput.fill('sarah@example.com'); console.log('Filled email'); }

  const addressInput = await page.$('#ci-address');
  if (addressInput) { await addressInput.fill('321 Pine St, Naperville, IL'); console.log('Filled address'); }

  const zipInput = await page.$('#ci-zip');
  if (zipInput) { await zipInput.fill('60540'); console.log('Filled zip'); }

  formFilled = (nameInput !== null) || (clicked > 0);

  await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\chimney_filled_v2.png', fullPage: false });
  console.log('Screenshot taken after filling form');

  // --- Step 5: Find and click the submit/generate button ---
  // Look for the generate button in the tool section
  const allButtons = await page.$$eval('button', btns =>
    btns.map(b => ({
      text: b.textContent?.trim().substring(0, 80),
      id: b.id,
      className: b.className.toString().substring(0, 80),
      type: b.type,
      visible: b.offsetParent !== null,
      disabled: b.disabled
    }))
  );
  console.log('All buttons:', JSON.stringify(allButtons, null, 2));

  // Try to find the generate/submit button
  const generateSelectors = [
    '#ci-submit',
    '[id*="generate"]',
    '[id*="submit"]',
    'button[class*="ci-"]',
    'button[class*="generate"]',
    'button[class*="submit"]',
    '.sp-tool button',
    '.sp-tool-embed button',
    'button:has-text("Generate")',
    'button:has-text("Get My")',
    'button:has-text("Analyze")',
    'button:has-text("Check")',
    'button:has-text("Inspect")',
    'button:has-text("Submit")',
    'button[type="submit"]',
  ];

  let submitClicked = false;
  for (const sel of generateSelectors) {
    try {
      const btn = await page.$(sel);
      if (btn) {
        const text = await btn.textContent();
        const isVisible = await btn.isVisible();
        const isDisabled = await btn.isDisabled();
        console.log(`Button "${sel}": text="${text?.trim()}", visible=${isVisible}, disabled=${isDisabled}`);
        if (isVisible && !isDisabled) {
          await btn.scrollIntoViewIfNeeded();
          await btn.click();
          console.log(`Clicked button: "${text?.trim()}"`);
          submitClicked = true;
          break;
        }
      }
    } catch (e) {
      // Continue
    }
  }

  if (!submitClicked) {
    console.log('No specific submit button found. Trying last resort...');
    // Scroll down and try clicking any visible button in the tool
    await page.evaluate(() => {
      const tool = document.getElementById('chimney-inspection');
      if (tool) tool.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(300);

    // Click the first visible button in the tool
    const toolButton = await page.$('#chimney-inspection button:not([disabled])');
    if (toolButton) {
      const text = await toolButton.textContent();
      await toolButton.click();
      console.log(`Clicked tool button: "${text?.trim()}"`);
      submitClicked = true;
    }
  }

  // --- Step 6: Wait for Gemini response (up to 25 seconds) ---
  console.log(`Submit clicked: ${submitClicked}. Waiting for Gemini response...`);
  const startTime = Date.now();

  while (Date.now() - startTime < 25000) {
    await page.waitForTimeout(1500);
    const elapsed = Math.round((Date.now() - startTime) / 1000);

    // Check for result elements
    const resultSelectors = [
      '#ci-result',
      '#ci-output',
      '[id*="result"]',
      '[id*="output"]',
      '[id*="report"]',
      '[class*="ci-result"]',
      '[class*="result-"]',
      '.sp-tool-result',
    ];

    for (const sel of resultSelectors) {
      try {
        const el = await page.$(sel);
        if (el) {
          const text = await el.textContent();
          const isVisible = await el.isVisible();
          if (isVisible && text && text.trim().length > 50) {
            console.log(`Result found at "${sel}"! Length: ${text.length}`);
            console.log(`Result preview: ${text.substring(0, 300)}`);
            reportGenerated = true;
            break;
          }
        }
      } catch (e) {}
    }
    if (reportGenerated) break;

    // Check for error elements
    const errorSelectors = [
      '#ci-error',
      '[id*="error"]',
      '[class*="ci-error"]',
      '[class*="error-msg"]',
    ];
    for (const sel of errorSelectors) {
      try {
        const el = await page.$(sel);
        if (el) {
          const text = await el.textContent();
          const isVisible = await el.isVisible();
          if (isVisible && text && text.trim().length > 3) {
            errorShown = true;
            errorMessage = text.trim().substring(0, 300);
            console.log(`Error found at "${sel}": ${errorMessage}`);
            break;
          }
        }
      } catch (e) {}
    }
    if (errorShown) break;

    console.log(`[${elapsed}s] geminiCalled=${geminiCalled}, geminiStatus=${geminiStatus}, reportGenerated=${reportGenerated}`);
  }

  await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\chimney_result_v2.png', fullPage: true });
  console.log('Final screenshot taken');

  // Final DOM scan for any result content
  if (!reportGenerated && !errorShown) {
    const dynamicContent = await page.evaluate(() => {
      const candidates = [];
      // Look for elements that appeared dynamically (have substantial text)
      const allDivs = document.querySelectorAll('div, section, article, p');
      for (const el of allDivs) {
        const text = el.textContent?.trim() || '';
        if (text.length > 200 && text.length < 5000 &&
            (text.toLowerCase().includes('chimney') || text.toLowerCase().includes('inspect') ||
             text.toLowerCase().includes('recommend') || text.toLowerCase().includes('result')) &&
            el.children.length < 10) {
          candidates.push({ id: el.id, cls: el.className?.toString().substring(0, 60), text: text.substring(0, 200) });
        }
      }
      return candidates.slice(0, 5);
    });
    if (dynamicContent.length > 0) {
      console.log('Dynamic content found:', JSON.stringify(dynamicContent, null, 2));
      // This might be the result
      if (dynamicContent.some(c => c.text.length > 200)) {
        reportGenerated = true;
        notes = 'Report content found in DOM after API call.';
      }
    }
  }

} catch (err) {
  console.error('Script error:', err.message);
  notes = `Script error: ${err.message}`;
  errorShown = true;
  errorMessage = err.message;
} finally {
  await browser.close();
}

// Determine verdict
let verdict = 'ERROR';
if (reportGenerated && geminiCalled && geminiStatus === 200) {
  verdict = 'PASS';
} else if (geminiCalled && geminiStatus !== 200) {
  verdict = 'FAIL';
} else if (errorShown) {
  verdict = 'FAIL';
} else if (geminiCalled) {
  verdict = 'FAIL';
} else {
  verdict = 'ERROR';
}

if (!notes) {
  if (geminiCalled && reportGenerated) {
    notes = `Form filled (${formFilled}). Gemini API called (HTTP ${geminiStatus}). Report/checklist generated and displayed on page.`;
  } else if (geminiCalled && !reportGenerated) {
    notes = `Gemini API called (HTTP ${geminiStatus}) but no report element found visible after 25s wait.`;
  } else if (errorShown) {
    notes = `Error displayed: ${errorMessage.substring(0, 150)}`;
  } else {
    notes = `Form submitted but no Gemini API call detected and no result/error found within 25s. formFilled=${formFilled}`;
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
