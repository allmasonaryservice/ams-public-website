import { chromium } from 'playwright';

const PAGE_URL = 'https://ams-public-website-neon.vercel.app/services/commercial-masonry-veneers';

const result = {
  toolName: 'CommercialProjectScopeBuilder',
  page: '/services/commercial-masonry-veneers',
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

  // Track network requests for Gemini API calls
  const geminiRequests = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('generativelanguage.googleapis.com') || url.includes('gemini') || url.includes('/api/')) {
      const status = response.status();
      console.log(`[NETWORK] ${response.request().method()} ${url} => ${status}`);
      if (url.includes('generativelanguage.googleapis.com') || url.includes('gemini')) {
        result.geminiCalled = true;
        result.geminiStatus = status;
      }
      // Also check internal API routes that might proxy Gemini
      if (url.includes('/api/') && (url.includes('scope') || url.includes('commercial') || url.includes('veneer') || url.includes('generate') || url.includes('lead') || url.includes('magnet'))) {
        console.log(`[API ROUTE] ${url} => ${status}`);
        geminiRequests.push({ url, status });
      }
    }
  });

  // Also intercept all /api/ calls
  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('/api/')) {
      console.log(`[REQUEST] ${request.method()} ${url}`);
    }
  });

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/')) {
      console.log(`[RESPONSE] ${url} => ${response.status()}`);
      // Check if this might be a Gemini proxy
      try {
        const text = await response.text().catch(() => '');
        if (text.includes('gemini') || text.includes('candidates') || text.includes('generativeai')) {
          console.log(`[GEMINI PROXY DETECTED] ${url}`);
          result.geminiCalled = true;
          result.geminiStatus = response.status();
        }
      } catch (e) {}
    }
  });

  console.log('Navigating to page...');
  await page.goto(PAGE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Page loaded');

  // Scroll down to find the tool
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await page.waitForTimeout(1000);

  // Take a screenshot to see current state
  await page.screenshot({ path: 'test_initial.png', fullPage: false });

  // Look for form elements
  console.log('\n=== Scanning for form elements ===');

  // Find all input fields
  const inputs = await page.$$eval('input', els => els.map(el => ({
    type: el.type,
    name: el.name,
    id: el.id,
    placeholder: el.placeholder,
    className: el.className.substring(0, 50)
  })));
  console.log('Inputs found:', JSON.stringify(inputs, null, 2));

  const selects = await page.$$eval('select', els => els.map(el => ({
    name: el.name,
    id: el.id,
    options: Array.from(el.options).map(o => ({ value: o.value, text: o.text }))
  })));
  console.log('Selects found:', JSON.stringify(selects, null, 2));

  const textareas = await page.$$eval('textarea', els => els.map(el => ({
    name: el.name,
    id: el.id,
    placeholder: el.placeholder
  })));
  console.log('Textareas found:', JSON.stringify(textareas, null, 2));

  // Find buttons
  const buttons = await page.$$eval('button', els => els.map(el => ({
    text: el.textContent.trim(),
    type: el.type,
    id: el.id,
    className: el.className.substring(0, 80)
  })));
  console.log('Buttons found:', JSON.stringify(buttons, null, 2));

  // Find labels
  const labels = await page.$$eval('label', els => els.map(el => ({
    text: el.textContent.trim().substring(0, 50),
    htmlFor: el.htmlFor,
    className: el.className.substring(0, 50)
  })));
  console.log('Labels found:', JSON.stringify(labels, null, 2));

  // Check for multi-step form indicators
  const stepElements = await page.$$eval('[class*="step"], [id*="step"], [data-step]', els =>
    els.map(el => ({ tag: el.tagName, id: el.id, class: el.className.substring(0, 60) }))
  );
  console.log('Step elements:', JSON.stringify(stepElements, null, 2));

  // Try to find the tool section - look for section headings
  const headings = await page.$$eval('h2, h3, h4', els => els.map(el => ({
    tag: el.tagName,
    text: el.textContent.trim(),
    id: el.id
  })));
  console.log('Headings:', JSON.stringify(headings, null, 2));

  // Scroll through the page to find the form
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test_bottom.png', fullPage: false });

  // Try filling the form
  console.log('\n=== Attempting to fill form ===');

  // Helper to safely fill a field
  async function safeFill(selector, value) {
    try {
      const el = await page.$(selector);
      if (el) {
        await el.scrollIntoViewIfNeeded();
        await el.fill(value);
        console.log(`Filled ${selector} with "${value}"`);
        return true;
      }
      return false;
    } catch (e) {
      console.log(`Failed to fill ${selector}: ${e.message}`);
      return false;
    }
  }

  // Try common field selectors
  const fieldMap = {
    name: 'Sarah Williams',
    fullName: 'Sarah Williams',
    full_name: 'Sarah Williams',
    contactName: 'Sarah Williams',
    contact_name: 'Sarah Williams',
    phone: '7735559876',
    phoneNumber: '7735559876',
    phone_number: '7735559876',
    email: 'sarah@example.com',
    address: '321 Pine St, Naperville, IL',
    streetAddress: '321 Pine St, Naperville, IL',
    zip: '60540',
    zipCode: '60540',
    zip_code: '60540',
    postalCode: '60540',
  };

  let filledCount = 0;

  // Try by name attribute
  for (const [name, value] of Object.entries(fieldMap)) {
    if (await safeFill(`input[name="${name}"]`, value)) filledCount++;
    if (await safeFill(`input[id="${name}"]`, value)) filledCount++;
  }

  // Try by placeholder
  const placeholderMap = [
    ['input[placeholder*="Name" i]', 'Sarah Williams'],
    ['input[placeholder*="name" i]', 'Sarah Williams'],
    ['input[placeholder*="Phone" i]', '7735559876'],
    ['input[placeholder*="phone" i]', '7735559876'],
    ['input[placeholder*="Email" i]', 'sarah@example.com'],
    ['input[placeholder*="email" i]', 'sarah@example.com'],
    ['input[placeholder*="Address" i]', '321 Pine St, Naperville, IL'],
    ['input[placeholder*="address" i]', '321 Pine St, Naperville, IL'],
    ['input[placeholder*="Zip" i]', '60540'],
    ['input[placeholder*="zip" i]', '60540'],
  ];

  for (const [selector, value] of placeholderMap) {
    try {
      const els = await page.$$(selector);
      for (const el of els) {
        await el.scrollIntoViewIfNeeded();
        await el.fill(value);
        console.log(`Filled placeholder ${selector}`);
        filledCount++;
      }
    } catch (e) {}
  }

  // Fill number inputs with realistic values
  try {
    const numberInputs = await page.$$('input[type="number"]');
    const numberValues = [500, 10, 3, 25, 100, 200, 8, 15];
    for (let i = 0; i < numberInputs.length; i++) {
      const val = numberValues[i] || 100;
      await numberInputs[i].scrollIntoViewIfNeeded();
      await numberInputs[i].fill(String(val));
      console.log(`Filled number input ${i} with ${val}`);
      filledCount++;
    }
  } catch (e) {
    console.log('Number fill error:', e.message);
  }

  // Handle selects - pick first non-placeholder option
  try {
    const selectEls = await page.$$('select');
    for (const sel of selectEls) {
      const options = await sel.$$eval('option', opts => opts.map(o => ({ value: o.value, text: o.text })));
      console.log('Select options:', options);
      // Pick first non-empty, non-placeholder option
      const validOpt = options.find(o => o.value && o.value !== '' && !o.text.toLowerCase().includes('select') && !o.text.toLowerCase().includes('choose'));
      if (validOpt) {
        await sel.selectOption(validOpt.value);
        console.log(`Selected option: ${validOpt.text}`);
        filledCount++;
      } else if (options.length > 1) {
        await sel.selectOption(options[1].value);
        console.log(`Selected option: ${options[1].text}`);
        filledCount++;
      }
    }
  } catch (e) {
    console.log('Select error:', e.message);
  }

  // Handle checkboxes - click labels
  try {
    const checkboxLabels = await page.$$('label:has(input[type="checkbox"]), label[for]');
    let checkboxCount = 0;
    for (const label of checkboxLabels) {
      if (checkboxCount >= 5) break;
      try {
        await label.scrollIntoViewIfNeeded();
        await label.click();
        console.log(`Clicked checkbox label: ${await label.textContent()}`);
        checkboxCount++;
        filledCount++;
        await page.waitForTimeout(100);
      } catch (e) {
        console.log('Checkbox click error:', e.message);
      }
    }

    // Also try clicking standalone labels that might be for checkboxes
    if (checkboxCount === 0) {
      const allLabels = await page.$$('label');
      for (const label of allLabels.slice(0, 5)) {
        try {
          const forAttr = await label.getAttribute('for');
          if (forAttr) {
            const input = await page.$(`#${forAttr}`);
            if (input) {
              const type = await input.getAttribute('type');
              if (type === 'checkbox') {
                await label.scrollIntoViewIfNeeded();
                await label.click();
                console.log(`Clicked label for checkbox #${forAttr}`);
                checkboxCount++;
                filledCount++;
                await page.waitForTimeout(100);
              }
            }
          }
        } catch (e) {}
      }
    }
  } catch (e) {
    console.log('Checkbox error:', e.message);
  }

  // Fill textareas
  try {
    const textareaEls = await page.$$('textarea');
    for (const ta of textareaEls) {
      await ta.scrollIntoViewIfNeeded();
      await ta.fill('Commercial office building requiring stone veneer installation on exterior facade. Approximately 500 sq ft of wall area, 10 ft height. Need professional grade materials.');
      console.log('Filled textarea');
      filledCount++;
    }
  } catch (e) {
    console.log('Textarea error:', e.message);
  }

  result.formFilled = filledCount > 0;
  console.log(`\nTotal fields filled: ${filledCount}`);

  await page.screenshot({ path: 'test_filled.png', fullPage: false });

  // Look for Next/Submit/Generate button
  console.log('\n=== Looking for submit/generate button ===');

  async function findAndClickButton(keywords) {
    const allButtons = await page.$$('button');
    for (const btn of allButtons) {
      const text = await btn.textContent();
      const trimmed = text.trim().toLowerCase();
      if (keywords.some(k => trimmed.includes(k))) {
        console.log(`Found button: "${text.trim()}"`);
        await btn.scrollIntoViewIfNeeded();
        await btn.click();
        return text.trim();
      }
    }
    // Also try input[type=submit]
    const submitInputs = await page.$$('input[type="submit"]');
    for (const inp of submitInputs) {
      const val = await inp.getAttribute('value');
      if (val && keywords.some(k => val.toLowerCase().includes(k))) {
        await inp.scrollIntoViewIfNeeded();
        await inp.click();
        return val;
      }
    }
    return null;
  }

  // Multi-step: look for Next button first
  let nextClicked = await findAndClickButton(['next', 'continue', 'proceed']);
  if (nextClicked) {
    console.log(`Clicked: ${nextClicked}`);
    await page.waitForTimeout(1500);

    // Fill any new fields that appeared in step 2
    for (const [selector, value] of placeholderMap) {
      try {
        const els = await page.$$(selector);
        for (const el of els) {
          const isVisible = await el.isVisible();
          if (isVisible) {
            await el.fill(value);
            console.log(`Step 2: Filled ${selector}`);
          }
        }
      } catch (e) {}
    }

    // Try next again for step 3
    let nextClicked2 = await findAndClickButton(['next', 'continue', 'proceed']);
    if (nextClicked2) {
      console.log(`Clicked step 3: ${nextClicked2}`);
      await page.waitForTimeout(1500);
    }
  }

  // Now click generate/submit
  const generateBtn = await findAndClickButton([
    'generate', 'calculate', 'analyze', 'get', 'submit', 'build', 'create', 'scope', 'estimate', 'quote', 'send'
  ]);

  if (generateBtn) {
    console.log(`\nClicked generate button: "${generateBtn}"`);

    // Wait for API response (up to 25 seconds)
    console.log('Waiting for Gemini API response...');

    await Promise.race([
      page.waitForTimeout(25000),
      new Promise(async (resolve) => {
        // Poll for result/error elements
        for (let i = 0; i < 25; i++) {
          await new Promise(r => setTimeout(r, 1000));

          // Check for result elements
          const resultEl = await page.$('[id*="result"], [class*="result"], [id*="report"], [class*="report"], [id*="output"], [class*="output"]');
          const errorEl = await page.$('[id*="error"], [class*="error"]');

          if (resultEl) {
            const visible = await resultEl.isVisible();
            if (visible) {
              const text = await resultEl.textContent();
              if (text && text.trim().length > 50) {
                console.log(`Result found after ${i+1}s: ${text.substring(0, 200)}`);
                result.reportGenerated = true;
                resolve();
                return;
              }
            }
          }

          if (errorEl) {
            const visible = await errorEl.isVisible();
            if (visible) {
              const text = await errorEl.textContent();
              if (text && text.trim().length > 0) {
                console.log(`Error found after ${i+1}s: ${text.substring(0, 200)}`);
                result.errorShown = true;
                result.errorMessage = text.trim().substring(0, 500);
                resolve();
                return;
              }
            }
          }

          console.log(`Waiting... ${i+1}s`);
        }
        resolve();
      })
    ]);

    await page.screenshot({ path: 'test_after_submit.png', fullPage: true });

    // Final check for results
    const pageContent = await page.content();

    // Check for Gemini-like content patterns
    if (pageContent.includes('scope') || pageContent.includes('estimate') || pageContent.includes('recommendation') || pageContent.includes('sq ft') || pageContent.includes('square')) {
      const resultEls = await page.$$('[id*="result"], [class*="result"], [class*="output"], [class*="report"], [class*="scope"]');
      for (const el of resultEls) {
        try {
          const visible = await el.isVisible();
          if (visible) {
            const text = await el.textContent();
            if (text && text.trim().length > 100) {
              console.log(`Found result content: ${text.substring(0, 300)}`);
              result.reportGenerated = true;
            }
          }
        } catch (e) {}
      }
    }

    // Check error states
    const errorEls = await page.$$('[id*="error"], .error-message, .error-text, [class*="error"]');
    for (const el of errorEls) {
      try {
        const visible = await el.isVisible();
        if (visible) {
          const text = await el.textContent();
          if (text && text.trim().length > 0) {
            result.errorShown = true;
            result.errorMessage = text.trim().substring(0, 500);
            console.log(`Error element: ${text.substring(0, 200)}`);
          }
        }
      } catch (e) {}
    }

    // Check the page text for any AI response indicators
    const bodyText = await page.$eval('body', el => el.innerText);
    const hasAIContent = bodyText.includes('scope') || bodyText.includes('estimate') || bodyText.includes('recommendation') || bodyText.includes('veneer') || bodyText.includes('masonry');
    console.log(`Page has AI-like content: ${hasAIContent}`);
    console.log(`Body text snippet: ${bodyText.substring(bodyText.length - 1000)}`);

  } else {
    console.log('No generate/submit button found!');
    result.notes = 'Could not find submit/generate button';
  }

  // Check if Gemini was called via API proxy
  if (!result.geminiCalled && geminiRequests.length > 0) {
    result.geminiCalled = true;
    result.geminiStatus = geminiRequests[0].status;
  }

  // Final page state
  console.log('\n=== Final page screenshot ===');
  await page.screenshot({ path: 'test_final.png', fullPage: true });

  // Determine verdict
  if (result.geminiCalled && result.reportGenerated && !result.errorShown) {
    result.verdict = 'PASS';
    result.notes = `Gemini called (HTTP ${result.geminiStatus}), report generated successfully`;
  } else if (result.errorShown) {
    result.verdict = 'FAIL';
    result.notes = `Error shown: ${result.errorMessage.substring(0, 200)}`;
  } else if (result.geminiCalled && !result.reportGenerated) {
    result.verdict = 'FAIL';
    result.notes = `Gemini called (HTTP ${result.geminiStatus}) but no report generated`;
  } else if (!result.geminiCalled && result.reportGenerated) {
    result.verdict = 'PASS';
    result.notes = 'Report generated (Gemini may have been called via server-side proxy)';
  } else if (!result.formFilled) {
    result.verdict = 'ERROR';
    result.notes = 'Could not fill form - tool may not exist on page or selectors changed';
  } else {
    result.verdict = 'FAIL';
    result.notes = 'Form filled but no Gemini call detected and no report generated';
  }

} catch (e) {
  console.error('Script error:', e.message);
  result.verdict = 'ERROR';
  result.notes = `Script error: ${e.message}`;
  result.errorShown = true;
  result.errorMessage = e.message;
} finally {
  if (browser) await browser.close();
}

console.log('\n=== FINAL RESULT ===');
console.log(JSON.stringify(result, null, 2));
