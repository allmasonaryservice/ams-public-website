import { chromium } from 'playwright';

const TIMEOUT = 30000;

async function testBrickInstallationEstimator() {
  const result = {
    toolName: 'BrickInstallationEstimator',
    page: '/services/brick-installation',
    geminiCalled: false,
    geminiStatus: null,
    reportGenerated: false,
    errorShown: false,
    errorMessage: '',
    formFilled: false,
    verdict: 'ERROR',
    notes: ''
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Track network requests for Gemini API calls
  page.on('request', (request) => {
    if (request.url().includes('generativelanguage.googleapis.com')) {
      console.log('[NETWORK] Gemini API called:', request.url().substring(0, 120));
      result.geminiCalled = true;
    }
  });

  page.on('response', async (response) => {
    if (response.url().includes('generativelanguage.googleapis.com')) {
      result.geminiStatus = response.status();
      console.log('[NETWORK] Gemini API response status:', response.status());
    }
  });

  try {
    console.log('Loading page...');
    await page.goto('https://ams-public-website-neon.vercel.app/services/brick-installation', {
      waitUntil: 'networkidle',
      timeout: TIMEOUT
    });
    console.log('Page loaded.');

    // Scroll to the brick estimator section
    await page.evaluate(() => {
      const el = document.getElementById('brick-estimator');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\debug_brick_step1.png', fullPage: false });
    console.log('Screenshot after scroll to section.');

    // Get the full structure of the brick-estimator section
    const sectionHTML = await page.evaluate(() => {
      const el = document.getElementById('brick-estimator');
      return el ? el.innerHTML.substring(0, 8000) : 'NOT FOUND';
    });
    console.log('Brick estimator section HTML (first 3000 chars):', sectionHTML.substring(0, 3000));

    // Step 1: Fill project details fields
    // Fill length/area field
    const lengthField = page.locator('#br-length');
    if (await lengthField.count() > 0) {
      await lengthField.fill('500');
      console.log('Filled br-length with 500');
    }

    // Fill height field
    const heightField = page.locator('#br-height');
    if (await heightField.count() > 0) {
      await heightField.fill('10');
      console.log('Filled br-height with 10');
    }

    // Fill type select
    const typeSelect = page.locator('#br-type');
    if (await typeSelect.count() > 0) {
      const options = await typeSelect.evaluate(el => {
        return Array.from(el.options).map(o => ({ value: o.value, text: o.text }));
      });
      console.log('br-type options:', JSON.stringify(options));
      // Pick first non-empty option
      const firstOption = options.find(o => o.value && o.value !== '');
      if (firstOption) {
        await typeSelect.selectOption(firstOption.value);
        console.log('Selected br-type:', firstOption.value);
      }
    }

    // Fill location select
    const locationSelect = page.locator('#br-location');
    if (await locationSelect.count() > 0) {
      const options = await locationSelect.evaluate(el => {
        return Array.from(el.options).map(o => ({ value: o.value, text: o.text }));
      });
      console.log('br-location options:', JSON.stringify(options));
      const firstOption = options.find(o => o.value && o.value !== '');
      if (firstOption) {
        await locationSelect.selectOption(firstOption.value);
        console.log('Selected br-location:', firstOption.value);
      }
    }

    // Fill openings field
    const openingsField = page.locator('#br-openings');
    if (await openingsField.count() > 0) {
      await openingsField.fill('3');
      console.log('Filled br-openings with 3');
    }

    // Fill notes
    const notesField = page.locator('#br-notes');
    if (await notesField.count() > 0) {
      await notesField.fill('New brick installation for residential property. Prefer classic red brick style.');
      console.log('Filled br-notes');
    }

    // Check for checkboxes in the section
    const checkboxLabels = await page.$$('#brick-estimator label');
    console.log(`Found ${checkboxLabels.length} labels in section`);

    // Find checkbox-associated labels
    const checkboxInputs = await page.$$('#brick-estimator input[type="checkbox"]');
    console.log(`Found ${checkboxInputs.length} checkboxes in section`);

    // Click labels for checkboxes (custom styled)
    let checkboxesClicked = 0;
    for (const cb of checkboxInputs) {
      if (checkboxesClicked >= 4) break;
      try {
        const cbId = await cb.evaluate(el => el.id);
        const cbLabel = cbId ? page.locator(`label[for="${cbId}"]`) : null;
        if (cbLabel && await cbLabel.count() > 0) {
          await cbLabel.click();
          console.log(`Clicked label for checkbox: ${cbId}`);
        } else {
          // Try clicking the parent label
          const parentLabel = await cb.evaluateHandle(el => el.closest('label'));
          if (parentLabel) {
            await page.evaluate(el => el.click(), parentLabel);
            console.log('Clicked parent label for checkbox');
          }
        }
        checkboxesClicked++;
      } catch (e) {
        console.log('Error clicking checkbox:', e.message);
      }
    }

    await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\debug_brick_step2.png', fullPage: false });
    console.log('Screenshot after filling project fields.');

    // Look for "Next" button or step navigation
    const nextButtons = await page.$$('button:has-text("Next"), button:has-text("Continue"), button:has-text("next"), a:has-text("Next")');
    console.log(`Found ${nextButtons.length} "Next" buttons`);

    // Check what buttons exist in the estimator
    const allButtons = await page.$$('#brick-estimator button');
    console.log(`Found ${allButtons.length} buttons in estimator section`);
    for (const btn of allButtons) {
      const btnText = await btn.evaluate(el => ({
        text: el.textContent.trim().substring(0, 60),
        id: el.id,
        type: el.type,
        disabled: el.disabled
      }));
      console.log('BUTTON:', JSON.stringify(btnText));
    }

    // Find and click the "Next" button to proceed to step 2 (contact info)
    const nextBtn = page.locator('#brick-estimator button').filter({ hasText: /next|continue/i });
    if (await nextBtn.count() > 0) {
      await nextBtn.first().click();
      console.log('Clicked Next button.');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\debug_brick_step3.png', fullPage: false });
      console.log('Screenshot after clicking Next.');
    } else {
      console.log('No Next button found — checking for single-step form or different navigation.');
    }

    // Step 2: Fill contact information
    // Check for contact fields
    const contactInputs = await page.$$('#brick-estimator input:visible, #brick-estimator select:visible, #brick-estimator textarea:visible');
    console.log(`Visible inputs after possible step change: ${contactInputs.length}`);
    for (const inp of contactInputs) {
      const info = await inp.evaluate(el => ({
        tag: el.tagName, type: el.type, id: el.id, name: el.name, placeholder: el.placeholder
      }));
      console.log('CURRENT INPUT:', JSON.stringify(info));
    }

    // Fill contact fields by common patterns
    const fieldMappings = [
      { selectors: ['#br-name', 'input[id*="name"]', 'input[placeholder*="name" i]'], value: 'Sarah Williams' },
      { selectors: ['#br-phone', 'input[id*="phone"]', 'input[placeholder*="phone" i]', 'input[type="tel"]'], value: '7735559876' },
      { selectors: ['#br-email', 'input[id*="email"]', 'input[type="email"]', 'input[placeholder*="email" i]'], value: 'sarah@example.com' },
      { selectors: ['#br-address', 'input[id*="address"]', 'input[placeholder*="address" i]'], value: '321 Pine St, Naperville, IL' },
      { selectors: ['#br-zip', 'input[id*="zip"]', 'input[placeholder*="zip" i]'], value: '60540' },
    ];

    for (const mapping of fieldMappings) {
      let filled = false;
      for (const sel of mapping.selectors) {
        try {
          const el = page.locator(sel).first();
          if (await el.count() > 0 && await el.isVisible()) {
            await el.fill(mapping.value);
            console.log(`Filled ${sel} with "${mapping.value}"`);
            filled = true;
            break;
          }
        } catch (e) {
          // continue
        }
      }
      if (!filled) {
        console.log(`Could not fill field for value: ${mapping.value}`);
      }
    }

    await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\debug_brick_step4.png', fullPage: false });

    // Check if there are more Next buttons or a submit/generate button
    const allButtonsNow = await page.$$('#brick-estimator button');
    console.log(`Buttons now: ${allButtonsNow.length}`);
    for (const btn of allButtonsNow) {
      const btnInfo = await btn.evaluate(el => ({
        text: el.textContent.trim().substring(0, 80),
        id: el.id,
        type: el.type,
        disabled: el.disabled,
        visible: el.offsetParent !== null
      }));
      console.log('BUTTON NOW:', JSON.stringify(btnInfo));
    }

    // Look for generate/calculate/submit button
    const generateBtn = page.locator('#brick-estimator button').filter({
      hasText: /generate|calculate|get estimate|estimate|submit|analyze|create/i
    });
    const nextBtn2 = page.locator('#brick-estimator button').filter({ hasText: /next|continue/i });

    if (await nextBtn2.count() > 0) {
      const nextVisible = await nextBtn2.first().isVisible();
      if (nextVisible) {
        await nextBtn2.first().click();
        console.log('Clicked Next button (step 2 -> 3).');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\debug_brick_step5.png', fullPage: false });
      }
    }

    // Fill contact info in step 3 if needed
    const step3Inputs = await page.$$('#brick-estimator input:visible');
    console.log(`Visible inputs in step 3: ${step3Inputs.length}`);
    for (const inp of step3Inputs) {
      const info = await inp.evaluate(el => ({
        id: el.id, name: el.name, placeholder: el.placeholder, type: el.type
      }));
      console.log('STEP3 INPUT:', JSON.stringify(info));
    }

    // Fill again if needed
    for (const mapping of fieldMappings) {
      for (const sel of mapping.selectors) {
        try {
          const el = page.locator(sel).first();
          if (await el.count() > 0 && await el.isVisible()) {
            const currentVal = await el.inputValue();
            if (!currentVal) {
              await el.fill(mapping.value);
              console.log(`Re-filled ${sel} with "${mapping.value}"`);
            }
            break;
          }
        } catch (e) {
          // continue
        }
      }
    }

    await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\debug_brick_step6.png', fullPage: false });

    // Now find and click the generate/submit button
    const allBtns = await page.$$('#brick-estimator button:visible');
    console.log(`Visible buttons: ${allBtns.length}`);
    for (const btn of allBtns) {
      const btnInfo = await btn.evaluate(el => el.textContent.trim().substring(0, 80));
      console.log('VISIBLE BUTTON:', btnInfo);
    }

    // Try clicking the generate/calculate button
    const finalBtn = page.locator('#brick-estimator button').filter({
      hasText: /generate|calculate|get|estimate|submit|analyze|create|get my/i
    });

    if (await finalBtn.count() > 0) {
      const isFinalVisible = await finalBtn.first().isVisible();
      if (isFinalVisible) {
        console.log('Clicking generate/submit button...');
        result.formFilled = true;
        await finalBtn.first().click();
        console.log('Clicked generate button.');

        // Wait up to 25 seconds for response
        console.log('Waiting for Gemini response (up to 25 seconds)...');
        await page.waitForTimeout(25000);

        await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\debug_brick_result.png', fullPage: false });
        console.log('Screenshot after waiting for result.');

        // Check for result
        const resultEl = await page.$('[id*="result"], [id*="report"], [class*="result"], [class*="report"], [id*="output"]');
        if (resultEl) {
          const resultVisible = await resultEl.isVisible();
          const resultText = await resultEl.evaluate(el => el.textContent.trim().substring(0, 200));
          console.log('Result element visible:', resultVisible);
          console.log('Result text:', resultText);
          if (resultVisible && resultText.length > 20) {
            result.reportGenerated = true;
          }
        }

        // Check for error elements
        const errorEl = await page.$('[id*="error"], [class*="error"], .notification.is-danger, .alert-danger');
        if (errorEl) {
          const errorVisible = await errorEl.isVisible();
          const errorText = await errorEl.evaluate(el => el.textContent.trim().substring(0, 200));
          if (errorVisible && errorText.length > 0) {
            result.errorShown = true;
            result.errorMessage = errorText;
            console.log('Error shown:', errorText);
          }
        }

        // Check the full page text for result indicators
        const pageText = await page.evaluate(() => {
          const estimator = document.getElementById('brick-estimator');
          return estimator ? estimator.textContent.trim().substring(0, 3000) : '';
        });
        console.log('Estimator text after submit (first 1500 chars):', pageText.substring(0, 1500));

        // Look for result indicators in page text
        if (pageText.includes('estimate') || pageText.includes('cost') || pageText.includes('$') ||
            pageText.includes('project') || pageText.includes('recommendation')) {
          const lowerText = pageText.toLowerCase();
          if (lowerText.includes('your estimate') || lowerText.includes('total cost') ||
              lowerText.includes('estimated') || lowerText.includes('report') ||
              lowerText.includes('analysis') || lowerText.includes('brick')) {
            // check if this is a result vs the form
            const hasResult = await page.$('[class*="result"]:visible, [id*="result"]:visible, [class*="report"]:visible');
            if (hasResult) {
              result.reportGenerated = true;
              console.log('Report/result found in page!');
            }
          }
        }

      } else {
        console.log('Generate button exists but is not visible');
      }
    } else {
      console.log('No generate/calculate button found with expected text');

      // Try to find any submit-type buttons
      const submitBtns = await page.$$('button[type="submit"]:visible');
      console.log(`Submit buttons: ${submitBtns.length}`);
    }

    // Final page state check
    const finalHTML = await page.evaluate(() => {
      const el = document.getElementById('brick-estimator');
      return el ? el.innerHTML.substring(0, 5000) : 'NOT FOUND';
    });
    console.log('Final estimator HTML:', finalHTML.substring(0, 2000));

    // Determine verdict
    if (result.geminiCalled && result.reportGenerated && !result.errorShown) {
      result.verdict = 'PASS';
      result.notes = 'Gemini API called successfully, report generated without errors.';
    } else if (result.geminiCalled && result.geminiStatus === 200 && !result.reportGenerated) {
      result.verdict = 'FAIL';
      result.notes = 'Gemini API called but report was not displayed on page.';
    } else if (result.errorShown) {
      result.verdict = 'FAIL';
      result.notes = 'Error shown after form submission: ' + result.errorMessage.substring(0, 100);
    } else if (!result.formFilled) {
      result.verdict = 'ERROR';
      result.notes = 'Could not fill and submit the form.';
    } else {
      result.verdict = 'FAIL';
      result.notes = 'Form submitted but Gemini was not called or no result generated.';
    }

  } catch (err) {
    console.error('Fatal error:', err.message);
    result.notes = 'Fatal error: ' + err.message.substring(0, 200);
    result.verdict = 'ERROR';
  }

  await browser.close();
  return result;
}

testBrickInstallationEstimator().then(r => {
  console.log('\n=== FINAL RESULT ===');
  console.log(JSON.stringify(r, null, 2));
}).catch(err => {
  console.error('Fatal error:', err);
});
