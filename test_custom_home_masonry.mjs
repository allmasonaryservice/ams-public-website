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

    // Track network requests for Gemini API calls
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('generativelanguage.googleapis.com')) {
        console.log('Gemini API request:', url);
        results.geminiCalled = true;
      }
    });

    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('generativelanguage.googleapis.com')) {
        results.geminiStatus = response.status();
        console.log('Gemini API response status:', response.status());
      }
    });

    // Also track fetch/XHR that might proxy through server
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/') && (url.includes('gemini') || url.includes('generate') || url.includes('ai') || url.includes('plan'))) {
        console.log('Possible AI API call through server:', url);
        results.geminiCalled = true;
      }
    });

    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/') && (url.includes('gemini') || url.includes('generate') || url.includes('ai') || url.includes('plan'))) {
        results.geminiStatus = response.status();
        console.log('Server-proxied AI response status:', response.status(), url);
      }
    });

    console.log('Loading page...');
    await page.goto('https://ams-public-website-neon.vercel.app/services/custom-home-masonry', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('Page loaded. Title:', await page.title());

    // Scroll down to find the form
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1000);

    // Take a screenshot to see what's on the page
    await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/debug_initial.png', fullPage: false });

    // Look for form elements
    console.log('Looking for form elements...');

    // Find all input elements
    const inputs = await page.locator('input').all();
    console.log(`Found ${inputs.length} input elements`);

    const selects = await page.locator('select').all();
    console.log(`Found ${selects.length} select elements`);

    const textareas = await page.locator('textarea').all();
    console.log(`Found ${textareas.length} textarea elements`);

    // Scroll through the page to find the tool
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);

    // Look for form sections
    const formSections = await page.locator('form, .form, [data-form], .tool, .planner, .calculator, .lead-magnet').all();
    console.log(`Found ${formSections.length} form/tool sections`);

    // Try to find inputs by label or placeholder
    const nameInput = page.locator('input[placeholder*="name" i], input[name*="name" i], input[id*="name" i], label:has-text("Name") + input, label:has-text("Name") ~ input').first();
    const phoneInput = page.locator('input[placeholder*="phone" i], input[name*="phone" i], input[id*="phone" i], input[type="tel"]').first();
    const emailInput = page.locator('input[placeholder*="email" i], input[name*="email" i], input[id*="email" i], input[type="email"]').first();
    const addressInput = page.locator('input[placeholder*="address" i], input[name*="address" i], input[id*="address" i]').first();
    const zipInput = page.locator('input[placeholder*="zip" i], input[name*="zip" i], input[id*="zip" i]').first();

    // Check which fields exist
    const nameExists = await nameInput.count() > 0;
    const phoneExists = await phoneInput.count() > 0;
    const emailExists = await emailInput.count() > 0;

    console.log('Name field exists:', nameExists);
    console.log('Phone field exists:', phoneExists);
    console.log('Email field exists:', emailExists);

    // Get all input details
    for (let i = 0; i < Math.min(inputs.length, 20); i++) {
      const input = inputs[i];
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const id = await input.getAttribute('id');
      const placeholder = await input.getAttribute('placeholder');
      const isVisible = await input.isVisible();
      console.log(`Input ${i}: type=${type}, name=${name}, id=${id}, placeholder=${placeholder}, visible=${isVisible}`);
    }

    // Get all select details
    for (let i = 0; i < selects.length; i++) {
      const sel = selects[i];
      const name = await sel.getAttribute('name');
      const id = await sel.getAttribute('id');
      const isVisible = await sel.isVisible();
      console.log(`Select ${i}: name=${name}, id=${id}, visible=${isVisible}`);
    }

    // Scroll down more and take screenshot
    await page.evaluate(() => window.scrollTo(0, 2000));
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/debug_scrolled.png', fullPage: false });

    // Try to fill visible fields
    let filledCount = 0;

    // Fill name field
    if (nameExists) {
      try {
        await nameInput.fill('Sarah Williams');
        filledCount++;
        console.log('Filled name field');
      } catch (e) {
        console.log('Could not fill name:', e.message);
      }
    }

    // Fill phone field
    if (phoneExists) {
      try {
        await phoneInput.fill('7735559876');
        filledCount++;
        console.log('Filled phone field');
      } catch (e) {
        console.log('Could not fill phone:', e.message);
      }
    }

    // Fill email field
    if (emailExists) {
      try {
        await emailInput.fill('sarah@example.com');
        filledCount++;
        console.log('Filled email field');
      } catch (e) {
        console.log('Could not fill email:', e.message);
      }
    }

    // Fill address field
    const addrExists = await addressInput.count() > 0;
    if (addrExists) {
      try {
        await addressInput.fill('321 Pine St, Naperville, IL');
        filledCount++;
        console.log('Filled address field');
      } catch (e) {
        console.log('Could not fill address:', e.message);
      }
    }

    // Fill zip field
    const zipExists = await zipInput.count() > 0;
    if (zipExists) {
      try {
        await zipInput.fill('60540');
        filledCount++;
        console.log('Filled zip field');
      } catch (e) {
        console.log('Could not fill zip:', e.message);
      }
    }

    // Fill number inputs
    const numberInputs = await page.locator('input[type="number"]').all();
    console.log(`Found ${numberInputs.length} number inputs`);
    for (let i = 0; i < numberInputs.length; i++) {
      const numInput = numberInputs[i];
      const isVisible = await numInput.isVisible();
      if (isVisible) {
        const name = await numInput.getAttribute('name') || '';
        const id = await numInput.getAttribute('id') || '';
        let value = '500';
        if (name.toLowerCase().includes('height') || id.toLowerCase().includes('height')) value = '10';
        else if (name.toLowerCase().includes('width') || id.toLowerCase().includes('width')) value = '50';
        else if (name.toLowerCase().includes('length') || id.toLowerCase().includes('length')) value = '50';
        else if (name.toLowerCase().includes('budget') || id.toLowerCase().includes('budget')) value = '25000';
        try {
          await numInput.fill(value);
          filledCount++;
          console.log(`Filled number input ${i} (${name}/${id}) with ${value}`);
        } catch (e) {
          console.log(`Could not fill number input ${i}:`, e.message);
        }
      }
    }

    // Handle selects
    for (let i = 0; i < selects.length; i++) {
      const sel = selects[i];
      const isVisible = await sel.isVisible();
      if (isVisible) {
        try {
          // Get options
          const options = await sel.locator('option').all();
          if (options.length > 1) {
            const firstValue = await options[1].getAttribute('value');
            if (firstValue) {
              await sel.selectOption(firstValue);
              filledCount++;
              console.log(`Selected option ${firstValue} in select ${i}`);
            }
          }
        } catch (e) {
          console.log(`Could not select option in select ${i}:`, e.message);
        }
      }
    }

    // Handle checkboxes - click labels
    const checkboxLabels = await page.locator('label:has(input[type="checkbox"]), .checkbox-label, .check-label').all();
    console.log(`Found ${checkboxLabels.length} checkbox labels`);

    let checkboxClicked = 0;
    for (let i = 0; i < Math.min(checkboxLabels.length, 5); i++) {
      const label = checkboxLabels[i];
      const isVisible = await label.isVisible();
      if (isVisible) {
        try {
          await label.click();
          checkboxClicked++;
          filledCount++;
          console.log(`Clicked checkbox label ${i}`);
          await page.waitForTimeout(200);
        } catch (e) {
          console.log(`Could not click checkbox label ${i}:`, e.message);
        }
      }
    }

    // Also try clicking visible checkbox inputs directly if labels didn't work
    if (checkboxClicked === 0) {
      const checkboxInputs = await page.locator('input[type="checkbox"]').all();
      console.log(`Found ${checkboxInputs.length} checkbox inputs`);
      for (let i = 0; i < Math.min(checkboxInputs.length, 5); i++) {
        const cb = checkboxInputs[i];
        try {
          // Try clicking the parent label
          const parentLabel = cb.locator('xpath=ancestor::label').first();
          const labelExists = await parentLabel.count() > 0;
          if (labelExists) {
            await parentLabel.click();
          } else {
            await cb.click({ force: true });
          }
          checkboxClicked++;
          filledCount++;
          console.log(`Clicked checkbox ${i}`);
          await page.waitForTimeout(200);
        } catch (e) {
          console.log(`Could not click checkbox ${i}:`, e.message);
        }
      }
    }

    if (filledCount > 0) {
      results.formFilled = true;
    }

    console.log(`Filled ${filledCount} fields total`);

    // Look for Next button (multi-step form)
    const nextBtn = page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("next"), .next-btn, [data-action="next"]').first();
    const nextExists = await nextBtn.count() > 0;

    if (nextExists && await nextBtn.isVisible()) {
      console.log('Found Next button, clicking...');
      await nextBtn.click();
      await page.waitForTimeout(1500);

      // Fill step 2 fields if any
      const step2Inputs = await page.locator('input:visible').all();
      console.log(`Step 2 has ${step2Inputs.length} visible inputs`);

      for (const input of step2Inputs) {
        const type = await input.getAttribute('type');
        const name = await input.getAttribute('name') || '';
        const id = await input.getAttribute('id') || '';
        const placeholder = await input.getAttribute('placeholder') || '';

        if (type === 'text' || type === null) {
          if (name.toLowerCase().includes('name') || placeholder.toLowerCase().includes('name')) {
            await input.fill('Sarah Williams');
          } else if (name.toLowerCase().includes('address') || placeholder.toLowerCase().includes('address')) {
            await input.fill('321 Pine St, Naperville, IL');
          } else {
            await input.fill('Test value');
          }
        } else if (type === 'number') {
          await input.fill('500');
        } else if (type === 'email') {
          await input.fill('sarah@example.com');
        } else if (type === 'tel') {
          await input.fill('7735559876');
        }
      }

      // Look for another Next button
      const nextBtn2 = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
      if (await nextBtn2.count() > 0 && await nextBtn2.isVisible()) {
        console.log('Found second Next button, clicking...');
        await nextBtn2.click();
        await page.waitForTimeout(1500);
      }
    }

    // Take screenshot before finding generate button
    await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/debug_before_submit.png', fullPage: false });

    // Look for generate/submit button
    const generateBtn = page.locator(
      'button:has-text("Generate"), button:has-text("Calculate"), button:has-text("Analyze"), ' +
      'button:has-text("Get"), button:has-text("Submit"), button:has-text("Plan"), ' +
      'button:has-text("Create"), button:has-text("Start"), button[type="submit"], ' +
      '.generate-btn, .submit-btn, .cta-btn'
    ).first();

    const generateExists = await generateBtn.count() > 0;
    console.log('Generate/Submit button exists:', generateExists);

    if (generateExists) {
      const isVisible = await generateBtn.isVisible();
      const btnText = await generateBtn.textContent();
      console.log(`Button visible: ${isVisible}, text: "${btnText}"`);

      if (isVisible) {
        await generateBtn.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        await generateBtn.click();
        console.log('Clicked generate button');

        // Wait for response - up to 25 seconds
        console.log('Waiting for AI response...');

        // Check for loading state
        await page.waitForTimeout(2000);

        // Look for result or error
        const resultSelector = '[id*="result"], [class*="result"], [id*="output"], [class*="output"], [id*="plan"], [class*="plan"], [id*="report"], [class*="report"], [id*="response"], [class*="response"]';
        const errorSelector = '[id*="error"], [class*="error"], .alert-error, .error-message';

        // Wait up to 25 seconds for result
        let found = false;
        for (let i = 0; i < 25; i++) {
          await page.waitForTimeout(1000);

          const resultEl = await page.locator(resultSelector).first();
          const errorEl = await page.locator(errorSelector).first();

          const resultVisible = await resultEl.count() > 0 && await resultEl.isVisible();
          const errorVisible = await errorEl.count() > 0 && await errorEl.isVisible();

          if (resultVisible) {
            const resultText = await resultEl.textContent();
            console.log('Result found:', resultText.substring(0, 200));
            results.reportGenerated = true;
            found = true;
            break;
          }

          if (errorVisible) {
            const errorText = await errorEl.textContent();
            console.log('Error found:', errorText);
            results.errorShown = true;
            results.errorMessage = errorText.trim().substring(0, 500);
            found = true;
            break;
          }

          // Also check for any text that might indicate a result
          const pageContent = await page.content();
          if (pageContent.includes('your plan') || pageContent.includes('masonry plan') ||
              pageContent.includes('recommendation') || pageContent.includes('estimate') ||
              pageContent.includes('sq ft') || pageContent.includes('square feet')) {
            console.log('Result content detected in page');
            results.reportGenerated = true;
            found = true;
            break;
          }

          console.log(`Waiting... ${i+1}/25 seconds`);
        }

        if (!found) {
          console.log('No result or error found after 25 seconds');
          // Check final page state
          const finalContent = await page.content();
          if (finalContent.includes('error') || finalContent.includes('Error')) {
            results.errorShown = true;
            results.errorMessage = 'Error detected in page but element not found';
          }
        }
      }
    } else {
      console.log('No generate button found, checking all visible buttons...');
      const allBtns = await page.locator('button:visible').all();
      for (const btn of allBtns) {
        const text = await btn.textContent();
        console.log('Button:', text?.trim());
      }
    }

    // Take final screenshot
    await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/debug_final.png', fullPage: false });

    // Determine verdict
    if (results.reportGenerated) {
      results.verdict = 'PASS';
      results.notes = `Form filled successfully. Gemini API called: ${results.geminiCalled}. Report generated successfully.`;
    } else if (results.errorShown) {
      results.verdict = 'FAIL';
      results.notes = `Form filled but error occurred: ${results.errorMessage}`;
    } else if (results.formFilled) {
      results.verdict = 'FAIL';
      results.notes = 'Form filled and submitted but no report or error appeared within 25 seconds';
    } else {
      results.verdict = 'ERROR';
      results.notes = 'Could not find or fill the form';
    }

  } catch (err) {
    console.error('Test error:', err);
    results.verdict = 'ERROR';
    results.notes = `Test script error: ${err.message}`;
    results.errorMessage = err.message;
  } finally {
    if (browser) await browser.close();
  }

  console.log('\n=== FINAL RESULTS ===');
  console.log(JSON.stringify(results, null, 2));
})();
