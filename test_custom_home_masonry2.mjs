import { chromium } from 'playwright';

const results = {
  toolName: "CustomHomeMasonryPlanner",
  page: "/services/custom-home-masonry",
  geminiCalled: false,
  geminiStatus: null,
  reportGenerated: false,
  errorShown: false,
  errorMessage: "",
  formFilled: false,
  verdict: "ERROR",
  notes: ""
};

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Track ALL network requests
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('generativelanguage.googleapis.com')) {
        console.log('[GEMINI REQUEST]', url.substring(0, 100));
        results.geminiCalled = true;
      }
      if (url.includes('/api/')) {
        console.log('[API REQUEST]', url);
      }
    });

    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('generativelanguage.googleapis.com')) {
        results.geminiStatus = response.status();
        results.geminiCalled = true;
        console.log('[GEMINI RESPONSE]', response.status(), url.substring(0, 100));
      }
      if (url.includes('/api/')) {
        const status = response.status();
        console.log('[API RESPONSE]', status, url);
        if (status === 200 && !results.geminiCalled) {
          // Check if this is an AI response
          try {
            const body = await response.text();
            if (body.includes('masonry') || body.includes('plan') || body.includes('recommendation') || body.length > 200) {
              console.log('[API RESPONSE BODY preview]', body.substring(0, 300));
              results.geminiCalled = true;
              results.geminiStatus = status;
            }
          } catch (e) {}
        }
      }
    });

    console.log('Loading page...');
    await page.goto('https://ams-public-website-neon.vercel.app/services/custom-home-masonry', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await page.waitForTimeout(2000);
    console.log('Page loaded. Title:', await page.title());

    // Scroll down to find the tool
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(500);

    // Inspect what's visible on page
    const visibleSelects = await page.locator('select:visible').all();
    console.log(`Visible selects: ${visibleSelects.length}`);

    for (let i = 0; i < visibleSelects.length; i++) {
      const sel = visibleSelects[i];
      const id = await sel.getAttribute('id');
      const options = await sel.locator('option').allTextContents();
      console.log(`Select[${i}] id=${id}, options:`, options);
    }

    // Scroll down to find the tool section
    await page.evaluate(() => {
      const toolSection = document.querySelector('#custom-home-tool, .tool-section, [id*="planner"], [id*="tool"], [id*="form"]');
      if (toolSection) toolSection.scrollIntoView();
    });
    await page.waitForTimeout(500);

    // Take initial screenshot
    await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/debug2_initial.png', fullPage: false });

    // ======= STEP 1: Fill visible selects =======
    console.log('\n--- STEP 1: Filling selects ---');

    // Project type select
    const projectTypeSelect = page.locator('#ch-project-type');
    if (await projectTypeSelect.count() > 0 && await projectTypeSelect.isVisible()) {
      const options = await projectTypeSelect.locator('option').all();
      if (options.length > 1) {
        const val = await options[1].getAttribute('value');
        await projectTypeSelect.selectOption(val);
        console.log('Selected project type:', val);
      }
    }

    // Material select
    const materialSelect = page.locator('#ch-material');
    if (await materialSelect.count() > 0 && await materialSelect.isVisible()) {
      const options = await materialSelect.locator('option').all();
      if (options.length > 1) {
        const val = await options[1].getAttribute('value');
        await materialSelect.selectOption(val);
        console.log('Selected material:', val);
      }
    }

    // Size select
    const sizeSelect = page.locator('#ch-size');
    if (await sizeSelect.count() > 0 && await sizeSelect.isVisible()) {
      const options = await sizeSelect.locator('option').all();
      if (options.length > 1) {
        const val = await options[1].getAttribute('value');
        await sizeSelect.selectOption(val);
        console.log('Selected size:', val);
      }
    }

    // Timeline select
    const timelineSelect = page.locator('#ch-timeline');
    if (await timelineSelect.count() > 0 && await timelineSelect.isVisible()) {
      const options = await timelineSelect.locator('option').all();
      if (options.length > 1) {
        const val = await options[1].getAttribute('value');
        await timelineSelect.selectOption(val);
        console.log('Selected timeline:', val);
      }
    }

    // Handle checkboxes in step 1 (click labels)
    const checkboxLabels = await page.locator('label:has(input[type="checkbox"]):visible').all();
    console.log(`Found ${checkboxLabels.length} visible checkbox labels`);
    for (let i = 0; i < Math.min(checkboxLabels.length, 5); i++) {
      try {
        await checkboxLabels[i].click();
        console.log(`Clicked checkbox label ${i}`);
        await page.waitForTimeout(150);
      } catch (e) {
        console.log(`Could not click checkbox label ${i}:`, e.message);
      }
    }

    // Also check for custom checkbox divs
    const customCheckboxes = await page.locator('.checkbox:visible, .option-checkbox:visible, [data-checkbox]:visible').all();
    console.log(`Found ${customCheckboxes.length} custom checkboxes`);
    for (let i = 0; i < Math.min(customCheckboxes.length, 5); i++) {
      try {
        await customCheckboxes[i].click();
        console.log(`Clicked custom checkbox ${i}`);
        await page.waitForTimeout(150);
      } catch (e) {}
    }

    await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/debug2_step1.png', fullPage: false });

    // Look for a "Next" button to proceed to step 2
    console.log('\n--- Looking for Next button ---');
    const nextBtnSelectors = [
      'button:has-text("Next")',
      'button:has-text("Continue")',
      'button:has-text("Next Step")',
      'button:has-text("next")',
      '[data-action="next"]',
      '.btn-next',
      '#next-btn',
      '.next-step'
    ];

    let nextClicked = false;
    for (const sel of nextBtnSelectors) {
      const btn = page.locator(sel).first();
      if (await btn.count() > 0 && await btn.isVisible()) {
        const text = await btn.textContent();
        console.log(`Found next button: "${text?.trim()}"`);
        await btn.scrollIntoViewIfNeeded();
        await btn.click();
        nextClicked = true;
        console.log('Clicked Next button');
        await page.waitForTimeout(1500);
        break;
      }
    }

    if (!nextClicked) {
      console.log('No Next button found, checking all visible buttons:');
      const allBtns = await page.locator('button:visible').all();
      for (const btn of allBtns) {
        const text = await btn.textContent();
        const id = await btn.getAttribute('id');
        const cls = await btn.getAttribute('class');
        console.log(`  Button: text="${text?.trim()}", id="${id}", class="${cls}"`);
      }

      // Try clicking the first button that's not a nav button
      for (const btn of allBtns) {
        const text = (await btn.textContent() || '').trim().toLowerCase();
        if (!text.includes('menu') && !text.includes('home') && !text.includes('about') && text.length > 0) {
          await btn.click();
          nextClicked = true;
          console.log(`Clicked button: "${text}"`);
          await page.waitForTimeout(1500);
          break;
        }
      }
    }

    await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/debug2_after_next.png', fullPage: false });

    // ======= STEP 2: Fill text inputs (contact info) =======
    console.log('\n--- STEP 2: Filling contact info ---');

    // Wait for contact fields to become visible
    await page.waitForTimeout(500);

    // Try filling by ID directly with force
    const fieldsToFill = [
      { id: 'ch-name', value: 'Sarah Williams' },
      { id: 'ch-phone', value: '7735559876' },
      { id: 'ch-email', value: 'sarah@example.com' },
      { id: 'ch-address', value: '321 Pine St, Naperville, IL' },
      { id: 'ch-zip', value: '60540' },
    ];

    let filledCount = 0;
    for (const field of fieldsToFill) {
      const input = page.locator(`#${field.id}`);
      if (await input.count() > 0) {
        const isVisible = await input.isVisible();
        console.log(`Field #${field.id}: visible=${isVisible}`);
        if (isVisible) {
          try {
            await input.fill(field.value);
            filledCount++;
            console.log(`  Filled #${field.id} with "${field.value}"`);
          } catch (e) {
            console.log(`  Could not fill #${field.id}:`, e.message);
            // Try with force click then type
            try {
              await input.click({ force: true });
              await input.type(field.value);
              filledCount++;
              console.log(`  Force-typed #${field.id}`);
            } catch (e2) {
              console.log(`  Force-type also failed:`, e2.message);
            }
          }
        } else {
          console.log(`  Field #${field.id} not visible, trying force fill`);
          try {
            await input.fill(field.value, { timeout: 5000 });
            filledCount++;
          } catch (e) {
            console.log(`  Force fill failed:`, e.message);
          }
        }
      }
    }

    // Also check for any visible number inputs on step 2
    const visibleNumberInputs = await page.locator('input[type="number"]:visible').all();
    console.log(`Found ${visibleNumberInputs.length} visible number inputs`);
    for (const ni of visibleNumberInputs) {
      const id = await ni.getAttribute('id') || '';
      const name = await ni.getAttribute('name') || '';
      let val = '500';
      if (id.includes('height') || name.includes('height')) val = '10';
      else if (id.includes('budget') || name.includes('budget')) val = '25000';
      await ni.fill(val);
      filledCount++;
      console.log(`Filled number input ${id}/${name} with ${val}`);
    }

    // Look for additional checkboxes on step 2
    const step2Checkboxes = await page.locator('label:has(input[type="checkbox"]):visible').all();
    console.log(`Found ${step2Checkboxes.length} visible checkbox labels on step 2`);
    for (let i = 0; i < Math.min(step2Checkboxes.length, 5); i++) {
      try {
        await step2Checkboxes[i].click();
        console.log(`Clicked step2 checkbox label ${i}`);
        await page.waitForTimeout(150);
        filledCount++;
      } catch (e) {}
    }

    if (filledCount > 0) results.formFilled = true;
    console.log(`Total fields filled: ${filledCount}`);

    await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/debug2_step2.png', fullPage: false });

    // Look for another Next button or the generate button
    console.log('\n--- Looking for Next or Generate button ---');

    // Check if there's another step
    const nextBtn2 = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
    if (await nextBtn2.count() > 0 && await nextBtn2.isVisible()) {
      console.log('Found another Next button, clicking...');
      await nextBtn2.click();
      await page.waitForTimeout(1500);
    }

    await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/debug2_step3.png', fullPage: false });

    // Fill any remaining visible fields
    const remainingInputs = await page.locator('input:visible').all();
    console.log(`Remaining visible inputs: ${remainingInputs.length}`);
    for (const inp of remainingInputs) {
      const type = await inp.getAttribute('type');
      const id = await inp.getAttribute('id') || '';
      const isAlreadyFilled = (await inp.inputValue()).length > 0;
      if (!isAlreadyFilled) {
        if (type === 'text') await inp.fill('Test input');
        else if (type === 'tel') await inp.fill('7735559876');
        else if (type === 'email') await inp.fill('sarah@example.com');
        else if (type === 'number') await inp.fill('500');
        console.log(`Filled remaining input type=${type} id=${id}`);
      }
    }

    const remainingSelects = await page.locator('select:visible').all();
    console.log(`Remaining visible selects: ${remainingSelects.length}`);
    for (const sel of remainingSelects) {
      const id = await sel.getAttribute('id') || '';
      const currentVal = await sel.inputValue();
      if (!currentVal || currentVal === '') {
        const options = await sel.locator('option').all();
        if (options.length > 1) {
          const val = await options[1].getAttribute('value');
          await sel.selectOption(val);
          console.log(`Filled remaining select id=${id} with ${val}`);
        }
      }
    }

    // ======= SUBMIT / GENERATE =======
    console.log('\n--- Looking for Generate/Submit button ---');

    const generateSelectors = [
      'button:has-text("Generate")',
      'button:has-text("Get My Plan")',
      'button:has-text("Get Plan")',
      'button:has-text("Create Plan")',
      'button:has-text("Get My")',
      'button:has-text("Analyze")',
      'button:has-text("Calculate")',
      'button:has-text("Submit")',
      'button[type="submit"]',
      'button:has-text("Send")',
      'button:has-text("Get Quote")',
      'button:has-text("Get Estimate")',
    ];

    let generateClicked = false;
    for (const sel of generateSelectors) {
      const btn = page.locator(sel).first();
      if (await btn.count() > 0 && await btn.isVisible()) {
        const text = await btn.textContent();
        console.log(`Found generate button: "${text?.trim()}"`);
        await btn.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        await btn.click();
        generateClicked = true;
        console.log('Clicked generate button!');
        break;
      }
    }

    if (!generateClicked) {
      console.log('No generate button found. All visible buttons:');
      const allBtns = await page.locator('button:visible').all();
      for (const btn of allBtns) {
        const text = await btn.textContent();
        const id = await btn.getAttribute('id') || '';
        const type = await btn.getAttribute('type') || '';
        console.log(`  Button: text="${text?.trim()}", id="${id}", type="${type}"`);
      }

      // Click the last visible button (likely submit)
      if (allBtns.length > 0) {
        const lastBtn = allBtns[allBtns.length - 1];
        const text = await lastBtn.textContent();
        console.log(`Trying last button: "${text?.trim()}"`);
        await lastBtn.click();
        generateClicked = true;
        await page.waitForTimeout(1000);
      }
    }

    if (generateClicked) {
      console.log('\n--- Waiting for AI response (up to 25 seconds) ---');

      // Monitor for loading state and results
      let found = false;
      for (let i = 0; i < 25; i++) {
        await page.waitForTimeout(1000);

        // Check for loading indicator
        const loadingEl = await page.locator('.loading, .spinner, [class*="loading"], [class*="spinner"]').first();
        if (await loadingEl.count() > 0 && await loadingEl.isVisible()) {
          console.log(`[${i+1}s] Still loading...`);
        }

        // Check for result elements
        const resultEl = await page.locator('#ch-result, [id*="result"], [class*="result-container"], [class*="output"], [id*="output"], [id*="plan-result"], .plan-output, .ai-result, .masonry-plan').first();
        const errorEl = await page.locator('#ch-error, [id*="error"], .error, [class*="error"]').first();

        const resultVisible = await resultEl.count() > 0 && await resultEl.isVisible();
        const errorVisible = await errorEl.count() > 0 && await errorEl.isVisible();

        if (resultVisible) {
          const resultText = await resultEl.textContent();
          console.log(`[${i+1}s] RESULT FOUND:`, resultText.substring(0, 300));
          results.reportGenerated = true;
          found = true;
          break;
        }

        if (errorVisible) {
          const errorText = await errorEl.textContent();
          console.log(`[${i+1}s] ERROR FOUND:`, errorText);
          results.errorShown = true;
          results.errorMessage = errorText.trim().substring(0, 500);
          found = true;
          break;
        }

        // Check page content for result indicators
        const pageText = await page.evaluate(() => document.body.innerText);
        const hasResult = pageText.includes('masonry plan') || pageText.includes('your plan') ||
          pageText.includes('recommendation') || pageText.includes('Project Summary') ||
          pageText.includes('estimated cost') || pageText.includes('sq ft') ||
          pageText.includes('Material:') || pageText.includes('Timeline:');

        if (hasResult && i > 2) {
          console.log(`[${i+1}s] Result content detected in page text`);
          results.reportGenerated = true;
          found = true;
          break;
        }

        console.log(`[${i+1}s] Waiting... geminiCalled=${results.geminiCalled}`);
      }

      if (!found) {
        console.log('No result found after 25 seconds');
        // Final check
        const pageText = await page.evaluate(() => document.body.innerText);
        if (pageText.toLowerCase().includes('error') || pageText.toLowerCase().includes('failed')) {
          results.errorShown = true;
          results.errorMessage = 'Error detected in page text';
        }
      }
    }

    await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/debug2_final.png', fullPage: true });

    // Determine verdict
    if (results.reportGenerated) {
      results.verdict = 'PASS';
      results.notes = `Multi-step form completed. Gemini called: ${results.geminiCalled} (status: ${results.geminiStatus}). Report generated successfully.`;
    } else if (results.errorShown) {
      results.verdict = 'FAIL';
      results.notes = `Form submitted but error occurred. Error: ${results.errorMessage.substring(0, 200)}`;
    } else if (generateClicked) {
      results.verdict = 'FAIL';
      results.notes = `Form submitted (geminiCalled=${results.geminiCalled}) but no report or error appeared within 25 seconds`;
    } else {
      results.verdict = 'ERROR';
      results.notes = 'Could not find the generate/submit button';
    }

  } catch (err) {
    console.error('Test error:', err.message);
    results.verdict = 'ERROR';
    results.notes = `Script error: ${err.message}`;
    results.errorMessage = err.message;
  } finally {
    if (browser) await browser.close();
  }

  console.log('\n=== FINAL RESULTS ===');
  console.log(JSON.stringify(results, null, 2));
})();
