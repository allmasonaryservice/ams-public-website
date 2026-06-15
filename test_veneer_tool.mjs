import { chromium } from 'playwright';

const URL = 'https://ams-public-website-neon.vercel.app/services/brick-stone-veneers';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let geminiCalled = false;
  let geminiStatus = null;
  let networkErrors = [];

  // Monitor network requests
  page.on('request', (request) => {
    if (request.url().includes('generativelanguage.googleapis.com')) {
      geminiCalled = true;
      console.log('Gemini API called:', request.url());
    }
  });

  page.on('response', (response) => {
    if (response.url().includes('generativelanguage.googleapis.com')) {
      geminiStatus = response.status();
      console.log('Gemini API response status:', geminiStatus);
    }
  });

  page.on('requestfailed', (request) => {
    networkErrors.push({ url: request.url(), failure: request.failure() });
  });

  try {
    console.log('Loading page...');
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Page loaded');

    // Scroll down to find the tool
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(1000);

    // Take a screenshot to understand the page structure
    await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\debug_initial.png', fullPage: false });

    // Look for the lead magnet tool / form
    console.log('Looking for form elements...');

    // Scroll through the page to find the form
    let formFound = false;
    for (let scrollPos = 0; scrollPos <= 5000; scrollPos += 500) {
      await page.evaluate((pos) => window.scrollTo(0, pos), scrollPos);
      await page.waitForTimeout(300);

      // Check for form inputs
      const inputs = await page.$$('input, select, textarea');
      if (inputs.length > 0) {
        console.log(`Found ${inputs.length} inputs at scroll position ${scrollPos}`);
        formFound = true;
        break;
      }
    }

    // Get all form-related elements
    const allInputs = await page.$$eval('input, select, textarea', (els) =>
      els.map(el => ({
        type: el.type || el.tagName.toLowerCase(),
        id: el.id,
        name: el.name,
        placeholder: el.placeholder,
        tagName: el.tagName,
        visible: el.offsetParent !== null
      }))
    );
    console.log('All inputs found:', JSON.stringify(allInputs, null, 2));

    // Look for the tool container
    const toolContainer = await page.$('[id*="calculator"], [id*="veneer"], [id*="tool"], [id*="form"], [class*="calculator"], [class*="veneer"], [class*="lead"], [class*="magnet"]');
    if (toolContainer) {
      console.log('Tool container found');
      await toolContainer.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
    }

    // Try to find and fill name field
    let formFilled = false;

    // Look for name input
    const nameSelectors = ['input[name="name"]', 'input[id*="name"]', 'input[placeholder*="name" i]', 'input[placeholder*="Name"]'];
    let nameInput = null;
    for (const sel of nameSelectors) {
      nameInput = await page.$(sel);
      if (nameInput && await nameInput.isVisible()) {
        console.log('Name input found with selector:', sel);
        break;
      }
    }

    if (nameInput) {
      await nameInput.scrollIntoViewIfNeeded();
      await nameInput.fill('Sarah Williams');
      console.log('Filled name');
      formFilled = true;
    }

    // Look for phone input
    const phoneSelectors = ['input[name="phone"]', 'input[id*="phone"]', 'input[placeholder*="phone" i]', 'input[type="tel"]'];
    let phoneInput = null;
    for (const sel of phoneSelectors) {
      phoneInput = await page.$(sel);
      if (phoneInput && await phoneInput.isVisible()) {
        console.log('Phone input found with selector:', sel);
        break;
      }
    }

    if (phoneInput) {
      await phoneInput.fill('7735559876');
      console.log('Filled phone');
    }

    // Look for email input
    const emailSelectors = ['input[name="email"]', 'input[id*="email"]', 'input[type="email"]', 'input[placeholder*="email" i]'];
    let emailInput = null;
    for (const sel of emailSelectors) {
      emailInput = await page.$(sel);
      if (emailInput && await emailInput.isVisible()) {
        console.log('Email input found with selector:', sel);
        break;
      }
    }

    if (emailInput) {
      await emailInput.fill('sarah@example.com');
      console.log('Filled email');
    }

    // Look for address input
    const addressSelectors = ['input[name="address"]', 'input[id*="address"]', 'input[placeholder*="address" i]'];
    let addressInput = null;
    for (const sel of addressSelectors) {
      addressInput = await page.$(sel);
      if (addressInput && await addressInput.isVisible()) {
        console.log('Address input found with selector:', sel);
        break;
      }
    }

    if (addressInput) {
      await addressInput.fill('321 Pine St, Naperville, IL');
      console.log('Filled address');
    }

    // Look for zip input
    const zipSelectors = ['input[name="zip"]', 'input[id*="zip"]', 'input[placeholder*="zip" i]'];
    let zipInput = null;
    for (const sel of zipSelectors) {
      zipInput = await page.$(sel);
      if (zipInput && await zipInput.isVisible()) {
        console.log('Zip input found with selector:', sel);
        break;
      }
    }

    if (zipInput) {
      await zipInput.fill('60540');
      console.log('Filled zip');
    }

    // Look for number inputs and fill them
    const numberInputs = await page.$$('input[type="number"]');
    console.log(`Found ${numberInputs.length} number inputs`);
    const numberValues = [500, 10, 200, 50, 8];
    for (let i = 0; i < numberInputs.length; i++) {
      if (await numberInputs[i].isVisible()) {
        await numberInputs[i].fill(String(numberValues[i] || 100));
        console.log(`Filled number input ${i} with ${numberValues[i] || 100}`);
      }
    }

    // Handle select dropdowns
    const selects = await page.$$('select');
    console.log(`Found ${selects.length} select elements`);
    for (const select of selects) {
      if (await select.isVisible()) {
        const options = await select.$$eval('option', (opts) => opts.map(o => ({ value: o.value, text: o.text })));
        console.log('Select options:', JSON.stringify(options));
        // Pick first non-empty option
        const firstOption = options.find(o => o.value && o.value !== '' && o.value !== 'placeholder');
        if (firstOption) {
          await select.selectOption(firstOption.value);
          console.log('Selected option:', firstOption.text);
        }
      }
    }

    // Handle custom checkboxes (click label instead of input)
    const checkboxLabels = await page.$$('label:has(input[type="checkbox"])');
    console.log(`Found ${checkboxLabels.length} checkbox labels`);
    const maxCheckboxes = Math.min(5, checkboxLabels.length);
    for (let i = 0; i < maxCheckboxes; i++) {
      if (await checkboxLabels[i].isVisible()) {
        await checkboxLabels[i].scrollIntoViewIfNeeded();
        await checkboxLabels[i].click();
        console.log(`Clicked checkbox label ${i}`);
        await page.waitForTimeout(200);
      }
    }

    // Also try clicking standalone labels that might be checkboxes
    const allLabels = await page.$$('label');
    const checkboxCount = checkboxLabels.length;
    if (checkboxCount === 0) {
      // Look for custom styled checkboxes with data attributes
      const customCheckboxes = await page.$$('[data-type="checkbox"], .checkbox, .check-item, [class*="checkbox"]');
      console.log(`Found ${customCheckboxes.length} custom checkbox elements`);
      for (let i = 0; i < Math.min(5, customCheckboxes.length); i++) {
        if (await customCheckboxes[i].isVisible()) {
          await customCheckboxes[i].click();
          console.log(`Clicked custom checkbox ${i}`);
          await page.waitForTimeout(200);
        }
      }
    }

    await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\debug_after_fill.png', fullPage: false });

    // Look for Next button (multi-step form)
    let stepCount = 0;
    let maxSteps = 5;

    while (stepCount < maxSteps) {
      const nextBtn = await page.$('button:has-text("Next"), button:has-text("Continue"), button:has-text("Proceed"), [type="button"]:has-text("Next")');
      if (nextBtn && await nextBtn.isVisible()) {
        console.log(`Clicking Next button (step ${stepCount + 1})`);
        await nextBtn.click();
        await page.waitForTimeout(1000);
        stepCount++;

        // Fill any new inputs that appeared
        const newInputs = await page.$$('input:visible, select:visible');
        console.log(`New inputs after step: ${newInputs.length}`);
      } else {
        break;
      }
    }

    // Look for generate/calculate/analyze button
    const generateSelectors = [
      'button:has-text("Generate")',
      'button:has-text("Calculate")',
      'button:has-text("Analyze")',
      'button:has-text("Get")',
      'button:has-text("Submit")',
      'button:has-text("Estimate")',
      'button[type="submit"]',
      'input[type="submit"]'
    ];

    let generateBtn = null;
    for (const sel of generateSelectors) {
      generateBtn = await page.$(sel);
      if (generateBtn && await generateBtn.isVisible()) {
        console.log('Generate button found with selector:', sel);
        break;
      }
    }

    if (generateBtn) {
      await generateBtn.scrollIntoViewIfNeeded();
      await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\debug_before_submit.png', fullPage: false });
      console.log('Clicking generate button...');
      await generateBtn.click();

      // Wait for Gemini response (up to 25 seconds)
      console.log('Waiting for AI response...');
      await page.waitForTimeout(3000);

      // Check for result or error elements
      let resultFound = false;
      let errorFound = false;
      let errorMessage = '';

      for (let i = 0; i < 11; i++) { // Check every 2 seconds for 22 seconds
        await page.waitForTimeout(2000);

        // Check for result
        const resultEl = await page.$('[id*="result"], [class*="result"], [id*="report"], [class*="report"], [id*="estimate"], [class*="estimate"]');
        if (resultEl && await resultEl.isVisible()) {
          const resultText = await resultEl.textContent();
          if (resultText && resultText.trim().length > 50) {
            console.log('Result found! Text preview:', resultText.substring(0, 200));
            resultFound = true;
            break;
          }
        }

        // Check for error
        const errorEl = await page.$('[id*="error"], [class*="error"]');
        if (errorEl && await errorEl.isVisible()) {
          errorMessage = await errorEl.textContent();
          console.log('Error element found:', errorMessage);
          errorFound = true;
          break;
        }

        // Check if Gemini was called successfully
        if (geminiCalled && geminiStatus === 200) {
          console.log('Gemini responded successfully, waiting for content...');
        }

        console.log(`Waiting... (${(i + 1) * 2}s elapsed, geminiCalled=${geminiCalled}, geminiStatus=${geminiStatus})`);
      }

      await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\debug_after_submit.png', fullPage: true });

      // Final check for result content
      if (!resultFound && geminiCalled) {
        // Look for any substantial text that appeared after submitting
        const bodyText = await page.evaluate(() => {
          const els = document.querySelectorAll('[id*="result"], [id*="report"], [id*="estimate"], [id*="output"], .result, .report, .output, .estimate, .ai-result, .ai-response');
          for (const el of els) {
            if (el.textContent.trim().length > 100) {
              return { found: true, text: el.textContent.substring(0, 300), id: el.id, className: el.className };
            }
          }
          return { found: false };
        });

        if (bodyText.found) {
          console.log('Late result found:', bodyText);
          resultFound = true;
        }
      }

      // Get page state for analysis
      const pageState = await page.evaluate(() => {
        const allText = document.body.innerText;
        const errorEls = [...document.querySelectorAll('[id*="error"], .error, .alert-error, .text-red')].map(el => ({ id: el.id, class: el.className, text: el.textContent.substring(0, 100), visible: el.offsetParent !== null }));
        const resultEls = [...document.querySelectorAll('[id*="result"], [id*="report"], [id*="estimate"], .result, .report')].map(el => ({ id: el.id, class: el.className, text: el.textContent.substring(0, 100), visible: el.offsetParent !== null }));
        return { errorEls, resultEls, bodyLength: allText.length };
      });

      console.log('Page state:', JSON.stringify(pageState, null, 2));

      const result = {
        toolName: 'VeneerCoverageCalculator',
        page: '/services/brick-stone-veneers',
        geminiCalled,
        geminiStatus,
        reportGenerated: resultFound,
        errorShown: errorFound,
        errorMessage: errorMessage || '',
        formFilled,
        verdict: geminiCalled && geminiStatus === 200 && resultFound ? 'PASS' : (errorFound ? 'FAIL' : (geminiCalled ? 'FAIL' : 'ERROR')),
        notes: `Steps completed: ${stepCount}. Gemini called: ${geminiCalled}. Status: ${geminiStatus}. Result: ${resultFound}. Error: ${errorFound}.`
      };

      console.log('FINAL RESULT:', JSON.stringify(result));
    } else {
      console.log('No generate button found. Checking page content...');

      // Log page HTML for debugging
      const html = await page.content();
      console.log('Page HTML (first 3000 chars):', html.substring(0, 3000));

      const result = {
        toolName: 'VeneerCoverageCalculator',
        page: '/services/brick-stone-veneers',
        geminiCalled: false,
        geminiStatus: null,
        reportGenerated: false,
        errorShown: false,
        errorMessage: 'No generate/submit button found on page',
        formFilled,
        verdict: 'ERROR',
        notes: 'Could not find the generate/calculate button. Form may require scrolling or the tool was not found.'
      };

      console.log('FINAL RESULT:', JSON.stringify(result));
    }

  } catch (err) {
    console.error('Script error:', err.message);
    console.log('FINAL RESULT:', JSON.stringify({
      toolName: 'VeneerCoverageCalculator',
      page: '/services/brick-stone-veneers',
      geminiCalled,
      geminiStatus,
      reportGenerated: false,
      errorShown: true,
      errorMessage: err.message,
      formFilled: false,
      verdict: 'ERROR',
      notes: `Script error: ${err.message}`
    }));
  } finally {
    await browser.close();
  }
})();
