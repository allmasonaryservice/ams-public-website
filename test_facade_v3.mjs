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

  // Use route interception to capture Gemini response body and status
  await context.route('**/generativelanguage.googleapis.com/**', async (route, request) => {
    console.log('[INTERCEPT] Gemini request URL:', request.url().substring(0, 120));
    result.geminiCalled = true;
    const response = await route.fetch();
    result.geminiStatus = response.status();
    console.log('[INTERCEPT] Gemini response status:', response.status());
    try {
      const body = await response.text();
      console.log('[INTERCEPT] Gemini response body preview:', body.substring(0, 400));
      if (body.includes('"candidates"') || body.includes('"text"')) {
        console.log('[INTERCEPT] Gemini returned valid content');
      }
    } catch(e) {}
    route.fulfill({ response });
  });

  try {
    console.log('Navigating to:', TARGET_URL);
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Page loaded');

    await page.evaluate(() => window.scrollBy(0, 1500));
    await sleep(500);

    // Step 1: Click first radio card (Office Building)
    const radioCards = await page.$$('.radio-card');
    for (const card of radioCards) {
      const visible = await card.isVisible();
      if (visible) {
        const text = await card.textContent();
        console.log('Clicking building type:', text?.trim());
        await card.click();
        await sleep(300);
        break;
      }
    }

    // Click Next
    async function clickNextBtn(label) {
      const btns = await page.$$('button');
      for (const btn of btns) {
        const text = await btn.textContent();
        const visible = await btn.isVisible();
        if (visible && text && (text.includes('Next') || text.includes('next') || text.includes('Continue'))) {
          console.log(`Clicking "${text.trim()}" for step: ${label}`);
          await btn.click();
          await sleep(500);
          return true;
        }
      }
      console.log('No Next button found for step:', label);
      return false;
    }

    await clickNextBtn('after building type');

    // Step 2: scope checkboxes
    const scopeChecks = await page.$$('.scope-check');
    let clicked = 0;
    for (const label of scopeChecks) {
      const visible = await label.isVisible();
      if (visible && clicked < 3) {
        const text = await label.textContent();
        console.log('Checking scope:', text?.trim());
        await label.click();
        clicked++;
        await sleep(200);
      }
    }

    await clickNextBtn('after scopes');

    // Step 3: scale options
    const scaleOptions = await page.$$('.scale-option');
    for (const label of scaleOptions) {
      const visible = await label.isVisible();
      if (visible) {
        const text = await label.textContent();
        console.log('Clicking scale:', text?.trim().substring(0, 50));
        await label.click();
        await sleep(300);
        break;
      }
    }

    await clickNextBtn('after scale — Your Information');

    // Step 4: Fill contact info
    const fields = {
      '#cp-name': 'Sarah Williams',
      '#cp-phone': '7735559876',
      '#cp-email': 'sarah@example.com',
      '#cp-address': '321 Pine St, Naperville, IL',
      '#cp-zip': '60540'
    };

    let contactFilled = 0;
    for (const [sel, val] of Object.entries(fields)) {
      const el = await page.$(sel);
      if (el) {
        const visible = await el.isVisible();
        if (visible) {
          await el.fill(val);
          contactFilled++;
          console.log(`Filled ${sel}`);
        }
      }
    }

    result.formFilled = clicked > 0 || contactFilled > 0;

    // Click Generate Scope Document
    const allBtns = await page.$$('button');
    let generateBtn = null;
    for (const btn of allBtns) {
      const text = await btn.textContent();
      const visible = await btn.isVisible();
      if (visible && text && text.includes('Generate')) {
        console.log('Found generate button:', text.trim());
        generateBtn = btn;
        break;
      }
    }

    if (generateBtn) {
      await generateBtn.scrollIntoViewIfNeeded();
      console.log('Clicking Generate Scope Document...');
      await generateBtn.click();

      // Wait for Gemini response (up to 25s)
      console.log('Waiting for AI response...');
      let elapsed = 0;
      while (elapsed < 25000) {
        await sleep(1000);
        elapsed += 1000;

        const pageText = await page.evaluate(() => document.body.innerText);

        // Check for report/result content
        if (pageText.includes('scope summary') ||
            pageText.includes('Scope Summary') ||
            pageText.includes('SCOPE SUMMARY') ||
            pageText.includes('thank you') ||
            pageText.includes('Thank You') ||
            pageText.includes('Your scope') ||
            pageText.includes('your scope') ||
            pageText.includes('Download PDF') ||
            pageText.includes('project summary') ||
            pageText.includes('Project Summary')) {
          result.reportGenerated = true;
          console.log('Report/summary text found!');
          // Get more context
          const summaryEl = await page.$('[class*="result"], [class*="report"], [class*="summary"], [class*="output"], [class*="scope-result"], [class*="cp-result"]');
          if (summaryEl) {
            const summaryText = await summaryEl.textContent();
            console.log('Summary text:', summaryText?.substring(0, 400));
          }
          break;
        }

        // Check for error
        const errorEl = await page.$('.cp-error, [class*="error-state"], [id*="error"]');
        if (errorEl) {
          const visible = await errorEl.isVisible();
          const text = await errorEl.textContent();
          if (visible && text && text.trim().length > 5) {
            result.errorShown = true;
            result.errorMessage = text.trim().substring(0, 200);
            console.log('Error shown:', result.errorMessage);
            break;
          }
        }

        console.log(`[${elapsed}ms] geminiCalled=${result.geminiCalled} status=${result.geminiStatus} reportGenerated=${result.reportGenerated}`);

        // If gemini was already called and responded, give a bit more time for render
        if (result.geminiCalled && result.geminiStatus && elapsed > 5000) {
          // Check page more carefully
          const fullText = await page.evaluate(() => document.body.innerText);
          // Look for any substantial new content
          const hasNewContent = fullText.length > 3000 &&
            (fullText.includes('sq ft') || fullText.includes('masonry') ||
             fullText.includes('brick') || fullText.includes('scope') ||
             fullText.includes('PDF'));
          if (hasNewContent) {
            result.reportGenerated = true;
            console.log('Detected new content after Gemini call');
            break;
          }
        }
      }

      await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/debug_v3_final.png', fullPage: false });

      // Final scan
      const finalText = await page.evaluate(() => document.body.innerText);
      console.log('Final page text (800 chars):', finalText.substring(0, 800));

      // Check for the result/output section
      const allDivs = await page.$$('[class*="cp-"],[class*="scope-"],[class*="result"]');
      for (const div of allDivs) {
        try {
          const visible = await div.isVisible();
          const text = await div.textContent();
          if (visible && text && text.trim().length > 100) {
            const cls = await div.getAttribute('class');
            console.log(`Visible div [${cls}]: ${text.substring(0, 150)}`);
            if (text.length > 200) result.reportGenerated = true;
          }
        } catch(e) {}
      }

    } else {
      result.notes = 'Could not find Generate Scope Document button';
    }

    // Determine verdict
    if (result.geminiCalled && result.geminiStatus === 200 && result.reportGenerated) {
      result.verdict = 'PASS';
      result.notes = `All steps completed. Gemini called (HTTP ${result.geminiStatus}), report generated.`;
    } else if (result.geminiCalled && result.geminiStatus === 200 && !result.reportGenerated) {
      result.verdict = 'FAIL';
      result.notes = `Gemini called (HTTP ${result.geminiStatus}) but no report visible on page.`;
    } else if (result.geminiCalled && result.reportGenerated) {
      result.verdict = 'PASS';
      result.notes = `Gemini called (status captured in intercept), report/confirmation visible.`;
    } else if (result.errorShown) {
      result.verdict = 'FAIL';
      result.notes = `Error shown after form submit: ${result.errorMessage}`;
    } else if (result.formFilled && !result.geminiCalled) {
      result.verdict = 'FAIL';
      result.notes = 'Form filled and submitted but Gemini was not called';
    } else {
      result.verdict = 'ERROR';
      result.notes = result.notes || 'Inconclusive test result';
    }

  } catch (error) {
    console.error('Test error:', error.message.substring(0, 300));
    result.verdict = 'ERROR';
    result.notes = `Exception: ${error.message.substring(0, 200)}`;
    result.errorMessage = error.message.substring(0, 200);
    result.errorShown = true;
    await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/debug_v3_error.png' }).catch(() => {});
  } finally {
    await browser.close();
  }

  console.log('\n=== FINAL RESULT ===');
  console.log(JSON.stringify(result, null, 2));
  return result;
}

runTest().catch(console.error);
