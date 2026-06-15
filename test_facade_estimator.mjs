import { chromium } from 'playwright';

const TARGET_URL = 'https://ams-public-website-neon.vercel.app/services/commercial-brick-stone';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const result = {
    toolName: 'FacadeCoverageEstimator',
    page: '/services/commercial-brick-stone',
    geminiCalled: false,
    geminiStatus: null,
    reportGenerated: false,
    errorShown: false,
    errorMessage: '',
    formFilled: false,
    verdict: 'ERROR',
    notes: ''
  };

  const geminiRequests = [];

  // Monitor network requests for Gemini API calls
  page.on('request', req => {
    if (req.url().includes('generativelanguage.googleapis.com')) {
      console.log('[NETWORK] Gemini request:', req.url());
      result.geminiCalled = true;
    }
  });

  page.on('response', async res => {
    if (res.url().includes('generativelanguage.googleapis.com')) {
      console.log('[NETWORK] Gemini response status:', res.status());
      result.geminiStatus = res.status();
      geminiRequests.push({ url: res.url(), status: res.status() });
    }
  });

  // Also monitor for API route calls (Next.js API routes that call Gemini)
  page.on('response', async res => {
    const url = res.url();
    if (url.includes('/api/') && (url.includes('gemini') || url.includes('generate') || url.includes('estimate') || url.includes('facade') || url.includes('coverage'))) {
      console.log('[NETWORK] API route response:', url, res.status());
    }
  });

  try {
    console.log('Navigating to:', TARGET_URL);
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Page loaded successfully');

    // Scroll down to find the tool
    await page.evaluate(() => window.scrollTo(0, 500));
    await sleep(500);

    // Take a screenshot to see the page
    await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/test_screenshot_initial.png', fullPage: false });

    // Find the tool - look for the form
    console.log('Looking for the AI lead magnet form...');

    // Scroll down progressively to find the form
    for (let i = 0; i < 10; i++) {
      await page.evaluate((step) => window.scrollTo(0, step * 800), i);
      await sleep(300);
    }

    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(500);

    // Look for form elements
    const formSelectors = [
      'form',
      '[id*="tool"]',
      '[id*="form"]',
      '[id*="estimator"]',
      '[id*="facade"]',
      '[class*="tool"]',
      '[class*="estimator"]',
      '[class*="lead-magnet"]',
      '[class*="calculator"]'
    ];

    let foundForm = null;
    for (const sel of formSelectors) {
      const el = await page.$(sel);
      if (el) {
        console.log('Found element with selector:', sel);
        foundForm = el;
        break;
      }
    }

    // Get all input elements on the page
    const inputs = await page.$$('input, select, textarea');
    console.log('Total input/select/textarea elements found:', inputs.length);

    // Get page content to understand structure
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
    console.log('Page text preview:', bodyText);

    // Look for specific field patterns
    const nameInput = await page.$('input[name*="name"], input[id*="name"], input[placeholder*="name" i], input[placeholder*="Name"]');
    const phoneInput = await page.$('input[name*="phone"], input[id*="phone"], input[placeholder*="phone" i], input[type="tel"]');
    const emailInput = await page.$('input[name*="email"], input[id*="email"], input[placeholder*="email" i], input[type="email"]');
    const addressInput = await page.$('input[name*="address"], input[id*="address"], input[placeholder*="address" i]');

    console.log('Name input found:', !!nameInput);
    console.log('Phone input found:', !!phoneInput);
    console.log('Email input found:', !!emailInput);
    console.log('Address input found:', !!addressInput);

    // Get all visible inputs with their attributes
    const inputDetails = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input, select, textarea');
      return Array.from(inputs).map(el => ({
        tag: el.tagName,
        type: el.type || '',
        id: el.id || '',
        name: el.name || '',
        placeholder: el.placeholder || '',
        visible: el.offsetParent !== null,
        className: el.className.substring(0, 50)
      }));
    });
    console.log('Input details:', JSON.stringify(inputDetails, null, 2));

    // Get labels on the page
    const labelTexts = await page.evaluate(() => {
      const labels = document.querySelectorAll('label');
      return Array.from(labels).map(l => ({ text: l.innerText.trim(), for: l.htmlFor, className: l.className.substring(0, 50) }));
    });
    console.log('Labels found:', JSON.stringify(labelTexts, null, 2));

    // Try to fill the form step by step
    // Step 1: Fill text/number inputs
    let filledCount = 0;

    // Fill name
    if (nameInput) {
      await nameInput.scrollIntoViewIfNeeded();
      await nameInput.fill('Sarah Williams');
      filledCount++;
      console.log('Filled name');
    }

    // Fill phone
    if (phoneInput) {
      await phoneInput.scrollIntoViewIfNeeded();
      await phoneInput.fill('7735559876');
      filledCount++;
      console.log('Filled phone');
    }

    // Fill email
    if (emailInput) {
      await emailInput.scrollIntoViewIfNeeded();
      await emailInput.fill('sarah@example.com');
      filledCount++;
      console.log('Filled email');
    }

    // Fill address
    if (addressInput) {
      await addressInput.scrollIntoViewIfNeeded();
      await addressInput.fill('321 Pine St, Naperville, IL');
      filledCount++;
      console.log('Filled address');
    }

    // Fill zip
    const zipInput = await page.$('input[name*="zip"], input[id*="zip"], input[placeholder*="zip" i], input[placeholder*="ZIP"]');
    if (zipInput) {
      await zipInput.scrollIntoViewIfNeeded();
      await zipInput.fill('60540');
      filledCount++;
      console.log('Filled zip');
    }

    // Fill number fields
    const numberInputs = await page.$$('input[type="number"]');
    console.log('Number inputs found:', numberInputs.length);

    const numberValues = [500, 10, 3, 2000, 150, 8, 50, 100];
    for (let i = 0; i < numberInputs.length; i++) {
      await numberInputs[i].scrollIntoViewIfNeeded();
      const currentVal = await numberInputs[i].inputValue();
      if (!currentVal) {
        await numberInputs[i].fill(String(numberValues[i] || 100));
        filledCount++;
        console.log(`Filled number input ${i} with ${numberValues[i] || 100}`);
      }
    }

    // Fill any range inputs
    const rangeInputs = await page.$$('input[type="range"]');
    for (const rangeInput of rangeInputs) {
      const min = await rangeInput.getAttribute('min') || '0';
      const max = await rangeInput.getAttribute('max') || '100';
      const midVal = Math.floor((parseInt(min) + parseInt(max)) / 2);
      await rangeInput.fill(String(midVal));
      filledCount++;
    }

    // Handle select dropdowns
    const selectEls = await page.$$('select');
    console.log('Select elements found:', selectEls.length);
    for (const sel of selectEls) {
      const options = await sel.$$('option');
      if (options.length > 1) {
        const secondOption = await options[1].getAttribute('value');
        if (secondOption) {
          await sel.selectOption(secondOption);
          filledCount++;
          console.log('Selected dropdown option:', secondOption);
        }
      }
    }

    // Handle checkboxes - click labels
    const checkboxLabels = await page.$$('label input[type="checkbox"]');
    console.log('Checkbox inputs inside labels:', checkboxLabels.length);

    // Try finding labels that contain checkboxes
    const labelElements = await page.$$('label');
    let checkboxCount = 0;
    for (const label of labelElements) {
      const hasCheckbox = await label.$('input[type="checkbox"]');
      if (hasCheckbox && checkboxCount < 5) {
        await label.scrollIntoViewIfNeeded();
        await label.click();
        checkboxCount++;
        filledCount++;
        console.log('Clicked checkbox label');
        await sleep(100);
      }
    }

    // Also try standalone checkboxes
    const standaloneCheckboxes = await page.$$('input[type="checkbox"]');
    console.log('Total checkboxes:', standaloneCheckboxes.length);
    if (checkboxCount === 0 && standaloneCheckboxes.length > 0) {
      // Click via JavaScript on parent labels
      for (let i = 0; i < Math.min(5, standaloneCheckboxes.length); i++) {
        const cb = standaloneCheckboxes[i];
        const cbId = await cb.getAttribute('id');
        if (cbId) {
          const label = await page.$(`label[for="${cbId}"]`);
          if (label) {
            await label.click();
            checkboxCount++;
            filledCount++;
            console.log('Clicked label for checkbox id:', cbId);
          } else {
            // Click the parent
            await page.evaluate(el => {
              const parent = el.closest('label') || el.parentElement;
              if (parent) parent.click();
            }, cb);
            checkboxCount++;
          }
        }
        await sleep(100);
      }
    }

    await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/test_screenshot_filled.png', fullPage: false });

    result.formFilled = filledCount > 0;
    console.log(`Form filled: ${filledCount} fields`);

    // Look for a "Next" button if multi-step
    const nextBtn = await page.$('button:has-text("Next"), button:has-text("Continue"), button:has-text("next"), [class*="next"]');
    if (nextBtn) {
      console.log('Found Next button, clicking...');
      await nextBtn.click();
      await sleep(1000);

      // Fill second step fields
      const step2Inputs = await page.$$('input:visible, select:visible');
      console.log('Step 2 inputs:', step2Inputs.length);
    }

    // Look for the generate/calculate/analyze button
    const generateBtnSelectors = [
      'button:has-text("Generate")',
      'button:has-text("Calculate")',
      'button:has-text("Analyze")',
      'button:has-text("Estimate")',
      'button:has-text("Get")',
      'button:has-text("Submit")',
      'button[type="submit"]',
      '[class*="generate"]',
      '[class*="calculate"]',
      '[class*="submit"]',
      'button:has-text("Report")',
      'button:has-text("quote")',
    ];

    let generateBtn = null;
    for (const sel of generateBtnSelectors) {
      try {
        const btn = await page.$(sel);
        if (btn) {
          const isVisible = await btn.isVisible();
          if (isVisible) {
            console.log('Found generate button with selector:', sel);
            generateBtn = btn;
            break;
          }
        }
      } catch (e) {}
    }

    if (!generateBtn) {
      // Try to find any button that's not navigation
      const allButtons = await page.$$('button');
      for (const btn of allButtons) {
        const text = await btn.textContent();
        const isVisible = await btn.isVisible();
        if (isVisible && text && !['Menu', 'Close', 'Back', 'Home'].includes(text.trim())) {
          console.log('Found button:', text.trim());
          if (text.toLowerCase().includes('generat') ||
              text.toLowerCase().includes('calcul') ||
              text.toLowerCase().includes('estimat') ||
              text.toLowerCase().includes('analyz') ||
              text.toLowerCase().includes('submit') ||
              text.toLowerCase().includes('report') ||
              text.toLowerCase().includes('get')) {
            generateBtn = btn;
            console.log('Using button:', text.trim());
            break;
          }
        }
      }
    }

    if (generateBtn) {
      await generateBtn.scrollIntoViewIfNeeded();
      await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/test_screenshot_before_submit.png', fullPage: false });

      console.log('Clicking generate button...');
      await generateBtn.click();

      console.log('Waiting up to 25 seconds for Gemini response...');

      // Wait for response - check for result or error elements
      let elapsed = 0;
      while (elapsed < 25000) {
        await sleep(1000);
        elapsed += 1000;

        // Check for result elements
        const resultEl = await page.$('[id*="result"], [id*="report"], [class*="result"], [class*="report"], [id*="output"], [class*="output"]');
        const errorEl = await page.$('[id*="error"], [class*="error"]');

        if (resultEl) {
          const resultVisible = await resultEl.isVisible();
          if (resultVisible) {
            const resultText = await resultEl.textContent();
            if (resultText && resultText.length > 50) {
              result.reportGenerated = true;
              console.log('Result found! Text preview:', resultText.substring(0, 200));
              break;
            }
          }
        }

        if (errorEl) {
          const errorVisible = await errorEl.isVisible();
          if (errorVisible) {
            const errorText = await errorEl.textContent();
            if (errorText && errorText.trim().length > 0) {
              result.errorShown = true;
              result.errorMessage = errorText.trim().substring(0, 200);
              console.log('Error found:', result.errorMessage);
              break;
            }
          }
        }

        // Check if Gemini was called (may come through Next.js API)
        if (result.geminiCalled) {
          console.log(`Gemini called after ${elapsed}ms`);
        }

        // Check for loading state being gone
        const loadingEl = await page.$('[class*="loading"], [class*="spinner"], [class*="pending"]');
        if (!loadingEl && result.geminiCalled) {
          // Gemini was called and loading is done
          await sleep(2000); // Extra wait for render
          break;
        }

        console.log(`Waiting... ${elapsed}ms elapsed, geminiCalled: ${result.geminiCalled}`);
      }

      await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/test_screenshot_after_submit.png', fullPage: false });

      // Final check for results
      const pageContent = await page.evaluate(() => document.body.innerText);

      // Look for result indicators in page text
      const resultKeywords = ['sq ft', 'square feet', 'estimate', 'coverage', 'recommendation', 'report', 'analysis', 'total', 'cost', 'materials'];
      const hasResultContent = resultKeywords.some(kw => pageContent.toLowerCase().includes(kw));

      if (hasResultContent && result.geminiCalled) {
        result.reportGenerated = true;
      }

      // Check for error messages in page
      const errorKeywords = ['error', 'failed', 'sorry', 'unable', 'try again'];
      const hasError = errorKeywords.some(kw => pageContent.toLowerCase().includes(kw));

      // More specific check for actual error display
      const errorEls = await page.$$('[id*="error"],[class*="error-message"],[class*="alert-error"]');
      for (const el of errorEls) {
        try {
          const visible = await el.isVisible();
          const text = await el.textContent();
          if (visible && text && text.trim().length > 5) {
            result.errorShown = true;
            result.errorMessage = text.trim().substring(0, 200);
          }
        } catch(e) {}
      }

      // Check result section more thoroughly
      const resultEls = await page.$$('[id*="result"],[id*="report"],[id*="output"],[class*="result-card"],[class*="report-section"],[class*="output-section"]');
      for (const el of resultEls) {
        try {
          const visible = await el.isVisible();
          const text = await el.textContent();
          if (visible && text && text.trim().length > 100) {
            result.reportGenerated = true;
            console.log('Report section found with text length:', text.length);
          }
        } catch(e) {}
      }

    } else {
      result.notes = 'Could not find generate/calculate button';
      console.log('No generate button found');

      // Log all visible buttons
      const allBtns = await page.$$('button');
      for (const btn of allBtns) {
        try {
          const text = await btn.textContent();
          const visible = await btn.isVisible();
          if (visible) console.log('Visible button:', text?.trim());
        } catch(e) {}
      }
    }

    // Determine verdict
    if (!result.formFilled) {
      result.verdict = 'ERROR';
      result.notes = result.notes || 'Could not fill form fields - form may not be present or visible';
    } else if (result.geminiCalled && result.reportGenerated) {
      result.verdict = 'PASS';
      result.notes = `Form filled, Gemini called (status ${result.geminiStatus}), report generated successfully`;
    } else if (result.geminiCalled && result.errorShown) {
      result.verdict = 'FAIL';
      result.notes = `Gemini called but error shown: ${result.errorMessage}`;
    } else if (result.geminiCalled && !result.reportGenerated) {
      result.verdict = 'FAIL';
      result.notes = `Gemini called (status ${result.geminiStatus}) but no visible report generated`;
    } else if (!result.geminiCalled && result.reportGenerated) {
      result.verdict = 'PASS';
      result.notes = 'Report generated (Gemini may have been called via server-side API route)';
    } else if (!result.geminiCalled) {
      result.verdict = 'FAIL';
      result.notes = result.notes || 'Form filled but Gemini was not called and no report generated';
    }

  } catch (error) {
    console.error('Test error:', error.message);
    result.verdict = 'ERROR';
    result.notes = `Test failed with error: ${error.message}`;
    result.errorShown = true;
    result.errorMessage = error.message;
  } finally {
    await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/test_screenshot_final.png', fullPage: true }).catch(() => {});
    await browser.close();
  }

  console.log('\n=== FINAL RESULT ===');
  console.log(JSON.stringify(result, null, 2));
  return result;
}

runTest().catch(console.error);
