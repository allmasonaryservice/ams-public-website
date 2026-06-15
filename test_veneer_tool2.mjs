import { chromium } from 'playwright';

const URL = 'https://ams-public-website-neon.vercel.app/services/brick-stone-veneers';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let geminiCalled = false;
  let geminiStatus = null;

  page.on('request', (request) => {
    if (request.url().includes('generativelanguage.googleapis.com')) {
      geminiCalled = true;
      console.log('Gemini API called:', request.url().substring(0, 100));
    }
  });

  page.on('response', async (response) => {
    if (response.url().includes('generativelanguage.googleapis.com')) {
      geminiStatus = response.status();
      console.log('Gemini API response status:', geminiStatus);
    }
  });

  try {
    console.log('Loading page...');
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Page loaded');

    // Scroll to find the tool
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);

    // --- STEP 1: Fill measurement inputs ---
    console.log('--- Filling Step 1: Measurements ---');

    // Front wall width and height
    await page.fill('#vc-front-w', '30');
    await page.fill('#vc-front-h', '12');
    console.log('Filled front wall: 30 x 12 ft');

    // Side 1 wall
    await page.fill('#vc-side1-w', '20');
    await page.fill('#vc-side1-h', '12');
    console.log('Filled side 1: 20 x 12 ft');

    // Side 2 wall
    await page.fill('#vc-side2-w', '20');
    await page.fill('#vc-side2-h', '12');
    console.log('Filled side 2: 20 x 12 ft');

    // Other / accent area
    await page.fill('#vc-other-w', '10');
    await page.fill('#vc-other-h', '8');
    console.log('Filled other area: 10 x 8 ft');

    // Veneer type select
    const veneerTypeEl = await page.$('#vc-veneer-type');
    if (veneerTypeEl) {
      const options = await veneerTypeEl.$$eval('option', opts => opts.map(o => ({ value: o.value, text: o.text })));
      console.log('Veneer type options:', JSON.stringify(options));
      const firstValid = options.find(o => o.value && o.value !== '');
      if (firstValid) {
        await page.selectOption('#vc-veneer-type', firstValid.value);
        console.log('Selected veneer type:', firstValid.text);
      }
    }

    // Openings (windows/doors area to deduct)
    await page.fill('#vc-openings', '45');
    console.log('Filled openings: 45 sq ft');

    // Notes textarea
    await page.fill('#vc-notes', 'Full exterior veneer installation for two-story home in Naperville, IL. Mix of brick and natural stone accents.');
    console.log('Filled notes');

    await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\debug_step1_filled.png', fullPage: false });

    // --- Look for checkboxes on this step ---
    const checkboxLabels = await page.$$('label:has(input[type="checkbox"])');
    console.log(`Found ${checkboxLabels.length} checkbox labels`);

    // Also look for custom checkbox elements
    const customCheckEls = await page.$$('[data-checkbox], .checkbox-option, .check-option, input[type="checkbox"]');
    console.log(`Found ${customCheckEls.length} checkbox inputs`);

    if (checkboxLabels.length > 0) {
      const maxClick = Math.min(5, checkboxLabels.length);
      for (let i = 0; i < maxClick; i++) {
        try {
          const isVis = await checkboxLabels[i].isVisible();
          if (isVis) {
            await checkboxLabels[i].scrollIntoViewIfNeeded();
            await checkboxLabels[i].click();
            console.log(`Clicked checkbox label ${i}`);
            await page.waitForTimeout(200);
          }
        } catch (e) {
          console.log(`Could not click label ${i}: ${e.message}`);
        }
      }
    }

    // --- Find and click Next/Calculate button ---
    // Look for the "Calculate / Get Estimate / Next" button
    const btns = await page.$$eval('button', bs => bs.map(b => ({ text: b.textContent.trim(), id: b.id, className: b.className, disabled: b.disabled, visible: b.offsetParent !== null })));
    console.log('Buttons found:', JSON.stringify(btns));

    // Try to find calculate/next button
    let calcBtn = null;
    const calcSelectors = [
      'button:has-text("Calculate")',
      'button:has-text("Get Estimate")',
      'button:has-text("Next")',
      'button:has-text("Generate")',
      'button:has-text("Analyze")',
      'button:has-text("Submit")',
      'button:has-text("Continue")',
      '[id*="calc"]',
      '[id*="next"]',
      '[id*="submit"]',
      '[id*="generate"]',
    ];

    for (const sel of calcSelectors) {
      try {
        calcBtn = await page.$(sel);
        if (calcBtn && await calcBtn.isVisible()) {
          const txt = await calcBtn.textContent();
          console.log(`Found button: "${txt}" with selector: ${sel}`);
          break;
        }
      } catch (e) {}
    }

    if (!calcBtn) {
      // Get all visible buttons
      const allBtns = await page.$$('button');
      for (const btn of allBtns) {
        if (await btn.isVisible()) {
          const txt = await btn.textContent();
          console.log('Visible button:', txt.trim());
          calcBtn = btn;
          break;
        }
      }
    }

    if (calcBtn) {
      const btnText = await calcBtn.textContent();
      console.log(`Clicking button: "${btnText.trim()}"`);
      await calcBtn.scrollIntoViewIfNeeded();
      await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\debug_before_step1_submit.png', fullPage: false });
      await calcBtn.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('No button found in step 1!');
    }

    // Check if we moved to step 2 (contact info becomes visible)
    await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\debug_step2_check.png', fullPage: false });

    // --- STEP 2: Fill contact info if visible ---
    const nameField = await page.$('#vc-name');
    if (nameField) {
      const isNameVisible = await nameField.isVisible();
      console.log('Name field visible:', isNameVisible);

      if (isNameVisible) {
        console.log('--- Filling Step 2: Contact Info ---');
        await page.fill('#vc-name', 'Sarah Williams');
        await page.fill('#vc-phone', '7735559876');
        await page.fill('#vc-email', 'sarah@example.com');
        await page.fill('#vc-address', '321 Pine St, Naperville, IL');
        await page.fill('#vc-zip', '60540');
        console.log('Filled all contact fields');

        await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\debug_step2_filled.png', fullPage: false });

        // Find and click the generate/submit button
        const submitSelectors = [
          'button:has-text("Generate")',
          'button:has-text("Get My")',
          'button:has-text("Calculate")',
          'button:has-text("Submit")',
          'button:has-text("Analyze")',
          'button:has-text("Send")',
          'button[type="submit"]',
          '[id*="submit"]',
          '[id*="generate"]',
        ];

        let submitBtn = null;
        for (const sel of submitSelectors) {
          try {
            submitBtn = await page.$(sel);
            if (submitBtn && await submitBtn.isVisible()) {
              const txt = await submitBtn.textContent();
              console.log(`Found submit button: "${txt}" with selector: ${sel}`);
              break;
            }
          } catch (e) {}
        }

        // Also check all visible buttons
        if (!submitBtn) {
          const allBtns2 = await page.$$('button');
          for (const btn of allBtns2) {
            if (await btn.isVisible()) {
              const txt = (await btn.textContent()).trim();
              console.log('Visible button in step 2:', txt);
              if (!submitBtn) submitBtn = btn;
            }
          }
        }

        if (submitBtn) {
          const btnTxt = await submitBtn.textContent();
          console.log(`Clicking submit button: "${btnTxt.trim()}"`);
          await submitBtn.scrollIntoViewIfNeeded();
          await submitBtn.click();
          console.log('Submit clicked, waiting for Gemini response...');
        } else {
          console.log('No submit button found in step 2!');
          // Log page buttons
          const btns2 = await page.$$eval('button', bs => bs.map(b => ({ text: b.textContent.trim(), id: b.id, visible: b.offsetParent !== null })));
          console.log('All buttons step 2:', JSON.stringify(btns2));
        }
      } else {
        console.log('Name field not visible yet, checking for other form flow...');
        // Maybe we need to look for a different next button or the form refreshed
        const btns2 = await page.$$eval('button', bs => bs.map(b => ({ text: b.textContent.trim(), id: b.id, visible: b.offsetParent !== null })));
        console.log('All buttons after step 1:', JSON.stringify(btns2));
      }
    }

    // Wait up to 25 seconds for the Gemini response and result
    console.log('Waiting for AI response (up to 25s)...');
    let reportGenerated = false;
    let errorShown = false;
    let errorMessage = '';

    for (let i = 0; i < 13; i++) {
      await page.waitForTimeout(2000);

      // Check for result elements
      const state = await page.evaluate(() => {
        const resultSelectors = ['[id*="result"]', '[id*="report"]', '[id*="estimate"]', '[id*="output"]', '.result', '.report', '.ai-result', '.estimate-result', '.coverage-result'];
        const errorSelectors = ['[id*="error"]', '.error', '.alert-danger', '.text-red-500', '.text-red-600'];

        let resultEl = null;
        for (const sel of resultSelectors) {
          const el = document.querySelector(sel);
          if (el && el.offsetParent !== null && el.textContent.trim().length > 100) {
            resultEl = { id: el.id, class: el.className, text: el.textContent.substring(0, 300) };
            break;
          }
        }

        let errorEl = null;
        for (const sel of errorSelectors) {
          const el = document.querySelector(sel);
          if (el && el.offsetParent !== null && el.textContent.trim().length > 5) {
            errorEl = { id: el.id, class: el.className, text: el.textContent.substring(0, 200) };
            break;
          }
        }

        // Also look for loading indicator
        const loadingEl = document.querySelector('[id*="loading"], [class*="loading"], [class*="spinner"]');
        const isLoading = loadingEl && loadingEl.offsetParent !== null;

        return { resultEl, errorEl, isLoading };
      });

      console.log(`Check ${i + 1} (${(i + 1) * 2}s): geminiCalled=${geminiCalled}, status=${geminiStatus}, result=${!!state.resultEl}, error=${!!state.errorEl}, loading=${state.isLoading}`);

      if (state.resultEl) {
        console.log('Result found:', state.resultEl.text);
        reportGenerated = true;
        break;
      }

      if (state.errorEl) {
        console.log('Error found:', state.errorEl.text);
        errorShown = true;
        errorMessage = state.errorEl.text;
        break;
      }

      // If Gemini responded successfully and no longer loading, do a deeper check
      if (geminiCalled && geminiStatus === 200 && !state.isLoading && i > 2) {
        const deepCheck = await page.evaluate(() => {
          // Look for any element with substantial content that wasn't there before
          const allEls = document.querySelectorAll('div, section, article, p');
          for (const el of allEls) {
            const text = el.textContent.trim();
            if (text.length > 200 && (text.includes('sq ft') || text.includes('square') || text.includes('veneer') || text.includes('cost') || text.includes('estimate') || text.includes('coverage'))) {
              return { found: true, text: text.substring(0, 400), id: el.id, class: el.className };
            }
          }
          return { found: false };
        });
        if (deepCheck.found) {
          console.log('Deep check found result:', deepCheck);
          reportGenerated = true;
          break;
        }
      }
    }

    await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\debug_final.png', fullPage: true });

    // Final page analysis
    const finalState = await page.evaluate(() => {
      const buttons = [...document.querySelectorAll('button')].map(b => ({ text: b.textContent.trim().substring(0, 50), visible: b.offsetParent !== null }));
      const inputs = [...document.querySelectorAll('input, textarea, select')].map(i => ({ id: i.id, type: i.type, visible: i.offsetParent !== null, value: i.value }));
      const stepIndicators = [...document.querySelectorAll('[class*="step"], [id*="step"]')].map(e => ({ id: e.id, class: e.className, text: e.textContent.substring(0, 50) }));
      return { buttons, inputs, stepIndicators };
    });
    console.log('Final page state:', JSON.stringify(finalState, null, 2));

    const formFilled = true; // We filled the first step at minimum

    let verdict = 'ERROR';
    if (reportGenerated && geminiCalled && geminiStatus === 200) {
      verdict = 'PASS';
    } else if (errorShown) {
      verdict = 'FAIL';
    } else if (geminiCalled && geminiStatus !== 200) {
      verdict = 'FAIL';
    } else if (!geminiCalled) {
      verdict = 'ERROR';
    }

    const result = {
      toolName: 'VeneerCoverageCalculator',
      page: '/services/brick-stone-veneers',
      geminiCalled,
      geminiStatus,
      reportGenerated,
      errorShown,
      errorMessage,
      formFilled,
      verdict,
      notes: `Multi-step form. Step1: measurements filled. Step2: contact fields. Gemini called: ${geminiCalled}. Status: ${geminiStatus}. Report: ${reportGenerated}. Error: ${errorShown}.`
    };

    console.log('FINAL RESULT:', JSON.stringify(result));

  } catch (err) {
    console.error('Script error:', err.message);
    const result = {
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
    };
    console.log('FINAL RESULT:', JSON.stringify(result));
  } finally {
    await browser.close();
  }
})();
