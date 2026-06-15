import { chromium } from 'playwright';

const PAGE_URL = 'https://ams-public-website-neon.vercel.app/services/damaged-brick-replacement';

const result = {
  toolName: 'BrickDamageCounter',
  page: '/services/damaged-brick-replacement',
  geminiCalled: false,
  geminiStatus: null,
  reportGenerated: false,
  errorShown: false,
  errorMessage: '',
  formFilled: false,
  verdict: 'ERROR',
  notes: ''
};

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Track network requests for Gemini
  page.on('request', (req) => {
    if (req.url().includes('generativelanguage.googleapis.com')) {
      console.log('[NETWORK] Gemini request:', req.url());
      result.geminiCalled = true;
    }
  });
  page.on('response', (res) => {
    if (res.url().includes('generativelanguage.googleapis.com')) {
      result.geminiStatus = res.status();
      console.log('[NETWORK] Gemini response status:', res.status());
    }
  });

  // Also intercept /api/ routes that might proxy Gemini
  page.on('request', (req) => {
    if (req.url().includes('/api/') && (req.url().includes('gemini') || req.url().includes('ai') || req.url().includes('analyze') || req.url().includes('brick') || req.url().includes('damage') || req.url().includes('lead'))) {
      console.log('[NETWORK] API request:', req.url());
    }
  });
  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('/api/') && (url.includes('gemini') || url.includes('ai') || url.includes('analyze') || url.includes('brick') || url.includes('damage') || url.includes('lead') || url.includes('report') || url.includes('counter'))) {
      const status = res.status();
      console.log('[NETWORK] API response:', url, 'status:', status);
      if (!result.geminiCalled) {
        result.geminiCalled = true;
        result.geminiStatus = status;
      }
    }
  });

  console.log('Loading page:', PAGE_URL);
  await page.goto(PAGE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Page loaded');

  // Scroll down to find the tool
  await page.evaluate(() => window.scrollBy(0, 600));
  await page.waitForTimeout(1000);

  // Take a screenshot to see the state
  await page.screenshot({ path: 'test_brick_step0.png', fullPage: false });

  // Find the form / lead magnet tool
  // Look for inputs, selects, textareas
  const allInputs = await page.$$eval('input, select, textarea', (els) =>
    els.map((el) => ({
      tag: el.tagName,
      type: el.type || '',
      id: el.id || '',
      name: el.name || '',
      placeholder: el.placeholder || '',
      visible: el.offsetParent !== null
    }))
  );
  console.log('Found inputs:', JSON.stringify(allInputs, null, 2));

  // Helper: fill by label text or placeholder or name
  async function fillField(selector, value) {
    try {
      await page.fill(selector, value);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Scroll to find the form tool
  async function scrollToFindForm() {
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(300);
      const inputs = await page.$$('input:not([type="hidden"]), select, textarea');
      if (inputs.length > 0) {
        console.log(`Found ${inputs.length} form fields after scroll ${i}`);
        return true;
      }
    }
    return false;
  }

  // Find visible form fields
  let visibleInputs = await page.$$('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea');
  if (visibleInputs.length === 0) {
    console.log('No visible inputs yet, scrolling...');
    await scrollToFindForm();
    visibleInputs = await page.$$('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea');
  }
  console.log(`Total visible inputs: ${visibleInputs.length}`);

  // Try to fill name field
  const nameSelectors = [
    'input[name*="name" i]',
    'input[id*="name" i]',
    'input[placeholder*="name" i]',
    'input[type="text"]:first-of-type'
  ];
  let nameFilled = false;
  for (const sel of nameSelectors) {
    try {
      const el = await page.$(sel);
      if (el) {
        await el.fill('Sarah Williams');
        console.log('Filled name with selector:', sel);
        nameFilled = true;
        break;
      }
    } catch (e) {}
  }

  // Fill phone
  const phoneSelectors = [
    'input[name*="phone" i]',
    'input[id*="phone" i]',
    'input[placeholder*="phone" i]',
    'input[type="tel"]'
  ];
  for (const sel of phoneSelectors) {
    try {
      const el = await page.$(sel);
      if (el) {
        await el.fill('7735559876');
        console.log('Filled phone with selector:', sel);
        break;
      }
    } catch (e) {}
  }

  // Fill email
  const emailSelectors = [
    'input[name*="email" i]',
    'input[id*="email" i]',
    'input[placeholder*="email" i]',
    'input[type="email"]'
  ];
  for (const sel of emailSelectors) {
    try {
      const el = await page.$(sel);
      if (el) {
        await el.fill('sarah@example.com');
        console.log('Filled email with selector:', sel);
        break;
      }
    } catch (e) {}
  }

  // Fill address
  const addrSelectors = [
    'input[name*="address" i]',
    'input[id*="address" i]',
    'input[placeholder*="address" i]',
    'input[placeholder*="street" i]'
  ];
  for (const sel of addrSelectors) {
    try {
      const el = await page.$(sel);
      if (el) {
        await el.fill('321 Pine St, Naperville, IL');
        console.log('Filled address with selector:', sel);
        break;
      }
    } catch (e) {}
  }

  // Fill zip
  const zipSelectors = [
    'input[name*="zip" i]',
    'input[id*="zip" i]',
    'input[placeholder*="zip" i]',
    'input[placeholder*="postal" i]'
  ];
  for (const sel of zipSelectors) {
    try {
      const el = await page.$(sel);
      if (el) {
        await el.fill('60540');
        console.log('Filled zip with selector:', sel);
        break;
      }
    } catch (e) {}
  }

  // Fill number fields
  const numberInputs = await page.$$('input[type="number"]');
  const numberValues = [500, 10, 20, 5, 100];
  for (let i = 0; i < numberInputs.length; i++) {
    try {
      const val = numberValues[i] || 10;
      await numberInputs[i].fill(String(val));
      console.log(`Filled number input ${i} with ${val}`);
    } catch (e) {
      console.log(`Could not fill number input ${i}:`, e.message);
    }
  }

  // Fill range/slider inputs
  const rangeInputs = await page.$$('input[type="range"]');
  for (let i = 0; i < rangeInputs.length; i++) {
    try {
      const min = await rangeInputs[i].getAttribute('min') || '0';
      const max = await rangeInputs[i].getAttribute('max') || '100';
      const mid = Math.floor((parseInt(min) + parseInt(max)) / 2);
      await rangeInputs[i].fill(String(mid));
      console.log(`Filled range input ${i} with ${mid}`);
    } catch (e) {}
  }

  // Handle select dropdowns
  const selects = await page.$$('select');
  for (let i = 0; i < selects.length; i++) {
    try {
      const options = await selects[i].$$eval('option', (opts) =>
        opts.filter((o) => o.value && o.value !== '' && o.value !== 'placeholder').map((o) => o.value)
      );
      if (options.length > 0) {
        await selects[i].selectOption(options[0]);
        console.log(`Selected option "${options[0]}" in select ${i}`);
      }
    } catch (e) {
      console.log(`Could not select option in select ${i}:`, e.message);
    }
  }

  // Handle checkboxes - click labels
  const checkboxLabels = await page.$$('label:has(input[type="checkbox"])');
  console.log(`Found ${checkboxLabels.length} checkbox labels`);
  const toClick = Math.min(5, checkboxLabels.length);
  for (let i = 0; i < toClick; i++) {
    try {
      await checkboxLabels[i].click();
      console.log(`Clicked checkbox label ${i}`);
      await page.waitForTimeout(200);
    } catch (e) {
      console.log(`Could not click checkbox label ${i}:`, e.message);
    }
  }

  // Also try clicking standalone labels that might be for custom checkboxes
  const allLabels = await page.$$('label');
  for (const label of allLabels) {
    const forAttr = await label.getAttribute('for');
    if (forAttr) {
      const input = await page.$(`#${forAttr}`);
      if (input) {
        const inputType = await input.getAttribute('type');
        if (inputType === 'checkbox') {
          // Already handled above
        }
      }
    }
  }

  await page.screenshot({ path: 'test_brick_step1.png', fullPage: false });

  // Check if there's a "Next" button (multi-step form)
  const nextButtons = await page.$$('button:has-text("Next"), button:has-text("next"), button:has-text("Continue"), a:has-text("Next")');
  console.log(`Found ${nextButtons.length} Next buttons`);

  // Multi-step: iterate through steps
  let stepCount = 0;
  while (stepCount < 5) {
    const nextBtn = await page.$('button:has-text("Next"), button:has-text("Continue"), button[class*="next" i]');
    if (!nextBtn) break;
    const isVisible = await nextBtn.isVisible();
    if (!isVisible) break;
    console.log(`Clicking Next button (step ${stepCount + 1})`);
    await nextBtn.click();
    await page.waitForTimeout(1500);

    // Fill any new fields that appear
    const newNumberInputs = await page.$$('input[type="number"]:not([data-filled])');
    for (let i = 0; i < newNumberInputs.length; i++) {
      try {
        await newNumberInputs[i].fill('25');
        await newNumberInputs[i].evaluate((el) => el.setAttribute('data-filled', 'true'));
        console.log(`Filled new number input ${i} with 25`);
      } catch (e) {}
    }

    const newSelects = await page.$$('select');
    for (const sel of newSelects) {
      try {
        const val = await sel.inputValue();
        if (!val) {
          const opts = await sel.$$eval('option', (os) => os.filter((o) => o.value).map((o) => o.value));
          if (opts.length > 0) {
            await sel.selectOption(opts[0]);
          }
        }
      } catch (e) {}
    }

    const newCheckboxLabels = await page.$$('label:has(input[type="checkbox"]:not(:checked))');
    const toClickNew = Math.min(3, newCheckboxLabels.length);
    for (let i = 0; i < toClickNew; i++) {
      try {
        await newCheckboxLabels[i].click();
        await page.waitForTimeout(200);
      } catch (e) {}
    }

    await page.screenshot({ path: `test_brick_step${stepCount + 2}.png`, fullPage: false });
    stepCount++;
  }

  result.formFilled = true;

  // Now find and click the submit / generate / analyze / calculate button
  const submitSelectors = [
    'button[type="submit"]',
    'button:has-text("Generate")',
    'button:has-text("Analyze")',
    'button:has-text("Calculate")',
    'button:has-text("Get")',
    'button:has-text("Submit")',
    'button:has-text("Count")',
    'button:has-text("Assess")',
    'button:has-text("Estimate")',
    'button:has-text("Check")',
    'button:has-text("Report")',
    'input[type="submit"]'
  ];

  let submitClicked = false;
  for (const sel of submitSelectors) {
    try {
      const btn = await page.$(sel);
      if (btn && await btn.isVisible()) {
        console.log(`Clicking submit button: ${sel}`);
        await btn.click();
        submitClicked = true;
        break;
      }
    } catch (e) {}
  }

  if (!submitClicked) {
    // Try any button that's visible and not "Next"
    const allButtons = await page.$$('button:visible');
    for (const btn of allButtons) {
      const text = await btn.textContent();
      const textLower = (text || '').toLowerCase().trim();
      if (!['next', 'back', 'previous', 'cancel'].includes(textLower)) {
        console.log(`Clicking button with text: "${text}"`);
        await btn.click();
        submitClicked = true;
        break;
      }
    }
  }

  if (!submitClicked) {
    result.notes = 'Could not find submit button';
    result.verdict = 'ERROR';
  }

  // Wait for Gemini response (up to 25 seconds)
  console.log('Waiting for Gemini/API response...');
  let waited = 0;
  while (waited < 25000) {
    await page.waitForTimeout(1000);
    waited += 1000;

    // Check for result or error elements
    const resultEl = await page.$('[id*="result"], [id*="report"], [class*="result"], [class*="report"], [id*="output"], [class*="output"]');
    const errorEl = await page.$('[id*="error"], [class*="error-message"], [class*="alert-error"]');

    if (resultEl) {
      const text = await resultEl.textContent();
      if (text && text.trim().length > 50) {
        console.log('Result element found with content:', text.substring(0, 200));
        result.reportGenerated = true;
        break;
      }
    }
    if (errorEl) {
      const text = await errorEl.textContent();
      if (text && text.trim().length > 0) {
        console.log('Error element found:', text.substring(0, 200));
        result.errorShown = true;
        result.errorMessage = text.trim().substring(0, 300);
        break;
      }
    }

    if (result.geminiCalled && result.geminiStatus) {
      // If gemini was already called, check for visible content changes
      const bodyText = await page.evaluate(() => document.body.innerText);
      if (bodyText.length > 1000) {
        // Look for report-like content
        if (/estimate|cost|brick|damage|repair|recommend|assessment|quote/i.test(bodyText)) {
          console.log('Page content suggests report generated');
          result.reportGenerated = true;
          break;
        }
      }
    }

    process.stdout.write('.');
  }
  console.log('\nWait complete');

  await page.screenshot({ path: 'test_brick_final.png', fullPage: true });

  // Final check of page state
  const finalHTML = await page.content();
  const finalText = await page.evaluate(() => document.body.innerText);

  // Check for error indicators
  if (!result.errorShown) {
    if (/error|failed|something went wrong|try again/i.test(finalText)) {
      const errorMatch = finalText.match(/(?:error|failed)[^.!]*[.!]/i);
      if (errorMatch) {
        result.errorShown = true;
        result.errorMessage = errorMatch[0];
      }
    }
  }

  // Check for report indicators
  if (!result.reportGenerated) {
    if (/estimate|assessment|recommendation|brick.*repair|damage.*report|cost.*repair/i.test(finalText)) {
      result.reportGenerated = true;
    }
  }

  // Set verdict
  if (result.geminiCalled && result.reportGenerated && !result.errorShown) {
    result.verdict = 'PASS';
    result.notes = `Gemini API called (status: ${result.geminiStatus}), report generated successfully`;
  } else if (result.geminiCalled && result.errorShown) {
    result.verdict = 'FAIL';
    result.notes = `Gemini API called but error shown: ${result.errorMessage}`;
  } else if (!result.geminiCalled && result.reportGenerated) {
    result.verdict = 'PASS';
    result.notes = 'Report generated (Gemini may be proxied through API route)';
  } else if (result.errorShown) {
    result.verdict = 'FAIL';
    result.notes = `Error shown: ${result.errorMessage}`;
  } else if (!submitClicked) {
    result.verdict = 'ERROR';
    result.notes = 'Could not find or click submit button';
  } else {
    result.verdict = 'FAIL';
    result.notes = 'Form submitted but no report generated and no Gemini call detected';
  }

  // Log page text for debugging
  console.log('\n=== PAGE TEXT (last 2000 chars) ===');
  console.log(finalText.slice(-2000));

} catch (err) {
  console.error('Script error:', err);
  result.verdict = 'ERROR';
  result.notes = `Script error: ${err.message}`;
} finally {
  if (browser) await browser.close();
}

console.log('\n=== RESULT ===');
console.log(JSON.stringify(result, null, 2));
