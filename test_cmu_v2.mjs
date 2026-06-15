import { chromium } from 'playwright';

const TARGET_URL = 'https://ams-public-website-neon.vercel.app/services/cmu-block-installation';

let geminiCalled = false;
let geminiStatus = null;
let reportGenerated = false;
let errorShown = false;
let errorMessage = '';
let formFilled = false;
const notes = [];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

// Monitor network requests for Gemini API calls
page.on('response', async (response) => {
  const url = response.url();
  if (url.includes('generativelanguage.googleapis.com')) {
    geminiCalled = true;
    geminiStatus = response.status();
    notes.push(`Gemini API called: status=${geminiStatus}`);
    console.log(`Gemini API response: ${response.status()} - ${url.substring(0, 100)}`);
  }
});

page.on('request', (request) => {
  const url = request.url();
  if (url.includes('generativelanguage.googleapis.com') || url.includes('gemini')) {
    notes.push(`Gemini request detected: ${url.substring(0, 100)}`);
    console.log(`Gemini request: ${url.substring(0, 100)}`);
  }
});

try {
  console.log('Navigating to page...');
  await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Page loaded');

  // Scroll to calculator section
  await page.evaluate(() => {
    const section = document.getElementById('cmu-calculator');
    if (section) section.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(500);

  // === STEP 1: Wall dimensions and project info ===
  console.log('\n=== Filling Step 1 ===');

  // Wall length
  await page.fill('#cmu-length', '120');
  console.log('Filled wall length: 120');

  // Wall height
  await page.fill('#cmu-height', '16');
  console.log('Filled wall height: 16');

  // CMU block size - select first option (already default)
  const blockSizeOptions = await page.evaluate(() => {
    const sel = document.getElementById('cmu-block-size');
    return Array.from(sel.options).map(o => ({ value: o.value, text: o.text }));
  });
  console.log('Block size options:', blockSizeOptions);
  if (blockSizeOptions.length > 0) {
    await page.selectOption('#cmu-block-size', blockSizeOptions[0].value);
    console.log(`Selected block size: ${blockSizeOptions[0].text}`);
  }

  // Application type
  const appTypeOptions = await page.evaluate(() => {
    const sel = document.getElementById('cmu-app-type');
    return Array.from(sel.options).map(o => ({ value: o.value, text: o.text }));
  });
  console.log('App type options:', appTypeOptions);
  if (appTypeOptions.length > 0) {
    await page.selectOption('#cmu-app-type', appTypeOptions[0].value);
    console.log(`Selected app type: ${appTypeOptions[0].text}`);
  }

  // Number of stories
  const storiesOptions = await page.evaluate(() => {
    const sel = document.getElementById('cmu-stories');
    return Array.from(sel.options).map(o => ({ value: o.value, text: o.text }));
  });
  console.log('Stories options:', storiesOptions);
  if (storiesOptions.length > 0) {
    await page.selectOption('#cmu-stories', storiesOptions[0].value);
    console.log(`Selected stories: ${storiesOptions[0].text}`);
  }

  // Openings/deductions
  await page.fill('#cmu-openings', '80');
  console.log('Filled openings: 80');

  // Project name
  await page.fill('#cmu-project-name', 'Naperville Warehouse — Sarah Williams Construction');
  console.log('Filled project name');

  // Additional notes
  await page.fill('#cmu-notes', 'Standard reinforcement per IBC 2021. Clay soil conditions. Exterior-grade mortar required.');
  console.log('Filled notes');

  formFilled = true;
  await page.screenshot({ path: 'cmu_step1_filled.png' });

  // Click Next button (by ID to avoid hitting invisible buttons)
  console.log('\nClicking Next button (cmu-to-step2)...');
  await page.click('#cmu-to-step2');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'cmu_step2.png' });

  // === STEP 2: Contact info ===
  console.log('\n=== Filling Step 2 ===');

  // Check if step 2 is visible
  const step2Visible = await page.evaluate(() => {
    const step2 = document.getElementById('cmu-step1');
    const name = document.getElementById('cmu-name');
    if (!name) return false;
    const rect = name.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
  console.log('Step 2 name field visible:', step2Visible);

  // Check what step we're on
  const currentStep = await page.evaluate(() => {
    const steps = document.querySelectorAll('.step');
    return Array.from(steps).map(s => ({
      id: s.id,
      active: s.classList.contains('active'),
      classes: s.className
    }));
  });
  console.log('Steps state:', JSON.stringify(currentStep));

  // Fill contact info
  await page.fill('#cmu-name', 'Sarah Williams');
  console.log('Filled name: Sarah Williams');

  await page.fill('#cmu-phone', '7735559876');
  console.log('Filled phone: 7735559876');

  await page.fill('#cmu-email', 'sarah@example.com');
  console.log('Filled email: sarah@example.com');

  await page.fill('#cmu-address', '321 Pine St, Naperville, IL');
  console.log('Filled address: 321 Pine St, Naperville, IL');

  await page.fill('#cmu-zip', '60540');
  console.log('Filled zip: 60540');

  formFilled = true;
  await page.screenshot({ path: 'cmu_step2_filled.png' });

  // === Submit the form ===
  console.log('\nClicking Generate Quantity Report button...');

  // Scroll submit button into view
  await page.evaluate(() => {
    const btn = document.getElementById('cmu-submit');
    if (btn) btn.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(300);

  await page.click('#cmu-submit');
  notes.push('Clicked Generate Quantity Report button');
  console.log('Submit button clicked, waiting for Gemini API response...');

  // Wait for Gemini API call OR result/error to appear (up to 25 seconds)
  const startTime = Date.now();
  let responseReceived = false;

  try {
    await Promise.race([
      // Wait for Gemini API network response
      page.waitForResponse(
        resp => resp.url().includes('generativelanguage.googleapis.com'),
        { timeout: 25000 }
      ).then(() => { responseReceived = true; console.log('Gemini API response received'); }),

      // Wait for result or error section to appear
      page.waitForFunction(() => {
        const resultEl = document.getElementById('cmu-result');
        const errorEl = document.getElementById('cmu-error');
        if (resultEl) {
          const style = window.getComputedStyle(resultEl);
          if (style.display !== 'none' && resultEl.textContent.trim().length > 50) return 'result';
        }
        if (errorEl) {
          const style = window.getComputedStyle(errorEl);
          if (style.display !== 'none' && errorEl.textContent.trim().length > 0) return 'error';
        }
        return false;
      }, { timeout: 25000 }).then(() => { console.log('Result/error element appeared'); })
    ]);
  } catch (e) {
    console.log(`Timeout waiting for response: ${e.message}`);
    notes.push('Timed out waiting for Gemini response after 25s');
  }

  const elapsed = Date.now() - startTime;
  console.log(`Time elapsed: ${elapsed}ms`);

  // Extra wait for rendering
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'cmu_after_submit.png', fullPage: true });

  // === Check results ===
  console.log('\n=== Checking Results ===');

  const resultCheck = await page.evaluate(() => {
    // Check all possible result/error elements
    const ids = ['cmu-result', 'cmu-error', 'cmu-output', 'cmu-report'];
    const found = {};
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) {
        const style = window.getComputedStyle(el);
        found[id] = {
          display: style.display,
          visibility: style.visibility,
          text: el.textContent?.trim().substring(0, 200),
          height: el.getBoundingClientRect().height
        };
      }
    }

    // Also check by class
    const resultByClass = Array.from(document.querySelectorAll('[class*="result"], [class*="report"], [class*="output"]'))
      .filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.height > 0 && el.textContent.trim().length > 50;
      })
      .slice(0, 5)
      .map(el => ({
        id: el.id,
        class: el.className?.substring(0, 60),
        text: el.textContent?.trim().substring(0, 150)
      }));

    // Check entire page for indicators
    const body = document.body.innerText;
    const keywords = ['blocks required', 'block count', 'sq ft', 'quantity', 'mortar', 'grout', 'bags', 'pallets', 'Report Generated', 'Error'];
    const foundKeywords = keywords.filter(k => body.toLowerCase().includes(k.toLowerCase()));

    // Check cmu-root for visible content
    const cmuRoot = document.getElementById('cmu-root');
    const cmuRootText = cmuRoot ? cmuRoot.innerText.trim() : '';

    return {
      byId: found,
      byClass: resultByClass,
      foundKeywords,
      cmuRootText: cmuRootText.substring(0, 500),
      pageContainsError: body.toLowerCase().includes('error') || body.toLowerCase().includes('failed'),
      pageContainsResult: body.includes('blocks') || body.includes('Report') || body.includes('quantity')
    };
  });

  console.log('Result check:', JSON.stringify(resultCheck, null, 2));

  // Determine outcomes
  if (resultCheck.byId['cmu-result']) {
    const r = resultCheck.byId['cmu-result'];
    if (r.display !== 'none' && r.text && r.text.length > 50) {
      reportGenerated = true;
      notes.push(`Report generated - cmu-result visible with content: "${r.text.substring(0, 80)}"`);
    }
  }

  if (resultCheck.byId['cmu-error']) {
    const e = resultCheck.byId['cmu-error'];
    if (e.display !== 'none' && e.text) {
      errorShown = true;
      errorMessage = e.text.substring(0, 200);
      notes.push(`Error shown: ${errorMessage}`);
    }
  }

  if (resultCheck.foundKeywords.length > 2) {
    reportGenerated = true;
    notes.push(`Page has report keywords: ${resultCheck.foundKeywords.join(', ')}`);
  }

  if (resultCheck.pageContainsError && !reportGenerated) {
    errorShown = true;
    notes.push('Page contains error text');
  }

  // Check for any content in cmu-root that suggests a result
  if (resultCheck.cmuRootText.includes('block') || resultCheck.cmuRootText.includes('Report') || resultCheck.cmuRootText.includes('qty')) {
    reportGenerated = true;
    notes.push('cmu-root contains result content');
  }

  console.log('\nFinal state:');
  console.log('- geminiCalled:', geminiCalled);
  console.log('- geminiStatus:', geminiStatus);
  console.log('- reportGenerated:', reportGenerated);
  console.log('- errorShown:', errorShown);
  console.log('- formFilled:', formFilled);

} catch (e) {
  console.error('Script error:', e.message);
  notes.push(`Script error: ${e.message}`);
} finally {
  await browser.close();
}

// Determine verdict
let verdict;
if (geminiCalled && reportGenerated) {
  verdict = 'PASS';
} else if (errorShown) {
  verdict = 'FAIL';
} else if (!geminiCalled && !reportGenerated) {
  verdict = 'FAIL';
} else {
  verdict = 'ERROR';
}

const result = {
  toolName: 'CMULoadCalculator',
  page: '/services/cmu-block-installation',
  geminiCalled,
  geminiStatus,
  reportGenerated,
  errorShown,
  errorMessage,
  formFilled,
  verdict,
  notes: notes.join('; ')
};

console.log('\n=== FINAL RESULT ===');
console.log(JSON.stringify(result, null, 2));
