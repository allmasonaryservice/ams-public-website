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

  // Monitor network requests for Gemini API calls (direct or via API route)
  page.on('request', req => {
    const url = req.url();
    if (url.includes('generativelanguage.googleapis.com')) {
      console.log('[NETWORK] Direct Gemini request:', url.substring(0, 100));
      result.geminiCalled = true;
    }
    if (url.includes('/api/') && (
      url.includes('gemini') || url.includes('generate') ||
      url.includes('estimate') || url.includes('facade') ||
      url.includes('scope') || url.includes('commercial') ||
      url.includes('ai') || url.includes('chat')
    )) {
      console.log('[NETWORK] API route request:', url);
    }
  });

  page.on('response', async res => {
    const url = res.url();
    if (url.includes('generativelanguage.googleapis.com')) {
      console.log('[NETWORK] Gemini response status:', res.status());
      result.geminiStatus = res.status();
      result.geminiCalled = true;
    }
    // Catch server-side Gemini calls via API routes
    if (url.includes('/api/')) {
      const status = res.status();
      console.log('[NETWORK] API response:', url, status);
      // Try to read body to detect Gemini usage
      try {
        const body = await res.text();
        if (body.includes('gemini') || body.includes('generative') || body.includes('candidates') || body.includes('content')) {
          console.log('[NETWORK] API response contains Gemini-like content');
          result.geminiCalled = true;
          result.geminiStatus = status;
        }
        if (body.length > 100) {
          console.log('[NETWORK] API response body preview:', body.substring(0, 300));
        }
      } catch(e) {}
    }
  });

  try {
    console.log('Navigating to:', TARGET_URL);
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Page loaded');

    // Scroll down to find the tool/form area
    await page.evaluate(() => window.scrollBy(0, 2000));
    await sleep(800);

    // Find the commercial planner tool section
    const toolSection = await page.$('[class*="cp-"], [id*="commercial"], [class*="commercial-planner"], [class*="tool"]');
    console.log('Tool section found:', !!toolSection);

    // Get page structure around the form
    const formStructure = await page.evaluate(() => {
      // Find the tool container
      const containers = ['[class*="cp-tool"]', '[class*="tool-wrap"]', '[class*="commercial"]', 'section[class*="tool"]', '.tool-section'];
      for (const sel of containers) {
        const el = document.querySelector(sel);
        if (el) return { selector: sel, html: el.innerHTML.substring(0, 500), classes: el.className };
      }
      // Look for the form/wizard
      const form = document.querySelector('form') || document.querySelector('[class*="wizard"]') || document.querySelector('[class*="step"]');
      if (form) return { selector: 'form', html: form.innerHTML.substring(0, 500), classes: form.className };
      return null;
    });
    console.log('Form structure:', JSON.stringify(formStructure));

    // Get all visible elements in the tool area
    const toolElements = await page.evaluate(() => {
      // Look for labels with class "radio-card" and "scope-check"
      const radioCards = document.querySelectorAll('.radio-card');
      const scopeChecks = document.querySelectorAll('.scope-check');
      const scaleOptions = document.querySelectorAll('.scale-option');
      const nextBtns = document.querySelectorAll('[class*="next"], [class*="btn"]');

      return {
        radioCards: Array.from(radioCards).map(el => ({
          text: el.innerText.trim(),
          visible: el.offsetParent !== null,
          className: el.className
        })),
        scopeChecks: Array.from(scopeChecks).map(el => ({
          text: el.innerText.trim(),
          visible: el.offsetParent !== null
        })),
        scaleOptions: Array.from(scaleOptions).map(el => ({
          text: el.innerText.trim(),
          visible: el.offsetParent !== null
        })),
        buttons: Array.from(document.querySelectorAll('button')).map(b => ({
          text: b.innerText.trim(),
          visible: b.offsetParent !== null,
          className: b.className.substring(0, 60)
        }))
      };
    });
    console.log('Tool elements:', JSON.stringify(toolElements, null, 2));

    // Step 1: Click a radio card for building type (first visible one)
    const radioCardLabels = await page.$$('.radio-card');
    console.log('Radio card labels found:', radioCardLabels.length);

    let radioClicked = false;
    for (const label of radioCardLabels) {
      const isVisible = await label.isVisible();
      if (isVisible) {
        const text = await label.textContent();
        console.log('Clicking radio card:', text?.trim());
        await label.click();
        radioClicked = true;
        await sleep(500);
        break;
      }
    }

    // Look for Next button after clicking radio
    await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/debug_step1.png' });

    // Find and click Next button
    async function clickNext() {
      const btns = await page.$$('button');
      for (const btn of btns) {
        const text = await btn.textContent();
        const visible = await btn.isVisible();
        if (visible && text && (text.toLowerCase().includes('next') || text.toLowerCase().includes('continue'))) {
          console.log('Clicking Next:', text.trim());
          await btn.click();
          await sleep(600);
          return true;
        }
      }
      // Try clicking any visible button with arrow or forward indicator
      const allBtns = await page.$$('button:visible');
      for (const btn of allBtns) {
        const text = await btn.textContent();
        console.log('Visible btn:', text?.trim());
      }
      return false;
    }

    await clickNext();
    await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/debug_step2.png' });

    // Step 2: Scope checkboxes - click labels with class scope-check
    const scopeCheckLabels = await page.$$('.scope-check');
    console.log('Scope check labels:', scopeCheckLabels.length);
    let scopeClicked = 0;
    for (const label of scopeCheckLabels) {
      const isVisible = await label.isVisible();
      if (isVisible && scopeClicked < 3) {
        const text = await label.textContent();
        console.log('Clicking scope:', text?.trim());
        await label.click();
        scopeClicked++;
        await sleep(200);
      }
    }

    await clickNext();
    await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/debug_step3.png' });

    // Step 3: Scale/size radio options
    const scaleLabels = await page.$$('.scale-option');
    console.log('Scale option labels:', scaleLabels.length);
    for (const label of scaleLabels) {
      const isVisible = await label.isVisible();
      if (isVisible) {
        const text = await label.textContent();
        // Pick the mid-size option (2,000-5,000)
        if (text && text.includes('2,000')) {
          console.log('Clicking scale:', text?.trim().substring(0, 50));
          await label.click();
          await sleep(300);
          break;
        }
      }
    }

    // If no specific one, just click first visible scale
    let scaleClicked = false;
    for (const label of scaleLabels) {
      const isVisible = await label.isVisible();
      if (isVisible) {
        const text = await label.textContent();
        console.log('Scale label text:', text?.trim().substring(0, 50));
        if (!scaleClicked) {
          await label.click();
          scaleClicked = true;
          await sleep(300);
        }
      }
    }

    await clickNext();
    await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/debug_step4.png' });

    // Step 4: Notes textarea
    const notesTextarea = await page.$('#cp-notes, textarea[id*="notes"], textarea');
    if (notesTextarea) {
      const isVisible = await notesTextarea.isVisible();
      if (isVisible) {
        await notesTextarea.fill('Commercial office building renovation, 5-story facade in Naperville. Timeline: 6 months. Budget range: $200K-$350K.');
        console.log('Filled notes textarea');
      }
    }

    await clickNext();
    await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/debug_step5.png' });

    // Step 5: Contact information fields
    // Check what's visible now
    const visibleInputs = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input, textarea');
      return Array.from(inputs)
        .filter(el => el.offsetParent !== null)
        .map(el => ({ id: el.id, type: el.type, placeholder: el.placeholder, visible: true }));
    });
    console.log('Currently visible inputs:', JSON.stringify(visibleInputs));

    // Fill contact fields directly by ID
    const fieldMap = {
      '#cp-name': 'Sarah Williams',
      '#cp-phone': '7735559876',
      '#cp-email': 'sarah@example.com',
      '#cp-address': '321 Pine St, Naperville, IL',
      '#cp-zip': '60540'
    };

    let contactFilled = 0;
    for (const [selector, value] of Object.entries(fieldMap)) {
      const el = await page.$(selector);
      if (el) {
        const isVisible = await el.isVisible();
        console.log(`Field ${selector}: visible=${isVisible}`);
        if (isVisible) {
          await el.fill(value);
          contactFilled++;
          console.log(`Filled ${selector} with "${value}"`);
        } else {
          // Force fill using JavaScript
          await page.evaluate((sel, val) => {
            const el = document.querySelector(sel);
            if (el) {
              el.value = val;
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }, selector, value);
          contactFilled++;
          console.log(`Force-filled ${selector} with "${value}" via JS`);
        }
      }
    }

    await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/debug_contact.png' });

    result.formFilled = radioClicked || scopeClicked > 0 || contactFilled > 0;
    console.log(`Form filled: radio=${radioClicked}, scopes=${scopeClicked}, contacts=${contactFilled}`);

    // Now find and click the final submit/generate button
    await sleep(500);

    // Look for submit button
    let submitBtn = null;
    const allButtons = await page.$$('button');
    for (const btn of allButtons) {
      const text = await btn.textContent();
      const visible = await btn.isVisible();
      if (visible) {
        console.log('Visible button:', text?.trim());
        if (text && (
          text.toLowerCase().includes('generat') ||
          text.toLowerCase().includes('submit') ||
          text.toLowerCase().includes('send') ||
          text.toLowerCase().includes('get') ||
          text.toLowerCase().includes('request') ||
          text.toLowerCase().includes('scope') ||
          text.toLowerCase().includes('quote') ||
          text.toLowerCase().includes('calcul') ||
          text.toLowerCase().includes('analyz')
        )) {
          submitBtn = btn;
          console.log('Selected submit button:', text?.trim());
          break;
        }
      }
    }

    if (!submitBtn) {
      // Try the last visible button
      let lastVisible = null;
      for (const btn of allButtons) {
        const visible = await btn.isVisible();
        if (visible) lastVisible = btn;
      }
      if (lastVisible) {
        const text = await lastVisible.textContent();
        console.log('Using last visible button:', text?.trim());
        submitBtn = lastVisible;
      }
    }

    if (submitBtn) {
      await submitBtn.scrollIntoViewIfNeeded();
      console.log('Clicking submit button...');
      await submitBtn.click();

      console.log('Waiting up to 25 seconds for AI response...');
      let elapsed = 0;
      let done = false;

      while (elapsed < 25000 && !done) {
        await sleep(1000);
        elapsed += 1000;

        // Check for result/report
        const pageText = await page.evaluate(() => document.body.innerText);

        // Look for result indicators
        const resultEl = await page.$('[id*="result"],[id*="report"],[id*="output"],[class*="result"],[class*="report"],[class*="output"],[class*="success"]');
        if (resultEl) {
          const visible = await resultEl.isVisible();
          const text = await resultEl.textContent();
          if (visible && text && text.trim().length > 100) {
            result.reportGenerated = true;
            console.log('Report found! Length:', text.length);
            console.log('Preview:', text.substring(0, 300));
            done = true;
          }
        }

        // Check for error
        const errorEl = await page.$('[id*="error"],[class*="error-msg"],[class*="alert-danger"],[class*="error-text"]');
        if (errorEl) {
          const visible = await errorEl.isVisible();
          const text = await errorEl.textContent();
          if (visible && text && text.trim().length > 5) {
            result.errorShown = true;
            result.errorMessage = text.trim().substring(0, 200);
            console.log('Error found:', result.errorMessage);
            done = true;
          }
        }

        // Check if a "thank you" or confirmation message appeared
        const thankYou = pageText.toLowerCase();
        if (thankYou.includes('thank you') || thankYou.includes('we\'ll be in touch') ||
            thankYou.includes('received your') || thankYou.includes('scope summary') ||
            thankYou.includes('commercial plan') || thankYou.includes('your estimate')) {
          result.reportGenerated = true;
          console.log('Confirmation/report text found in page');
          done = true;
        }

        console.log(`[${elapsed}ms] geminiCalled=${result.geminiCalled}, reportGenerated=${result.reportGenerated}, errorShown=${result.errorShown}`);
      }
    } else {
      result.notes = 'Could not find submit button after filling form';
      console.log('No submit button found');
    }

    await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/debug_final.png', fullPage: false });

    // Final page analysis
    const finalText = await page.evaluate(() => document.body.innerText);
    console.log('Final page text (first 500):', finalText.substring(0, 500));

    // Check for any visible result containers
    const allResultEls = await page.$$('[class*="result"],[class*="report"],[class*="summary"],[class*="plan-"]');
    for (const el of allResultEls) {
      try {
        const visible = await el.isVisible();
        const text = await el.textContent();
        if (visible && text && text.trim().length > 50) {
          console.log('Result element found:', text.substring(0, 200));
          result.reportGenerated = true;
        }
      } catch(e) {}
    }

    // Determine verdict
    if (!result.formFilled && contactFilled === 0 && !radioClicked) {
      result.verdict = 'ERROR';
      result.notes = 'Could not interact with form elements';
    } else if (result.reportGenerated && !result.errorShown) {
      result.verdict = 'PASS';
      result.notes = `Form filled (steps completed), ${result.geminiCalled ? 'Gemini called' : 'server processed'}, report/confirmation generated`;
    } else if (result.errorShown) {
      result.verdict = 'FAIL';
      result.notes = `Error shown: ${result.errorMessage}`;
    } else if (result.geminiCalled && result.geminiStatus === 200) {
      result.verdict = 'PASS';
      result.notes = `Gemini called successfully (HTTP ${result.geminiStatus})`;
    } else if (!result.geminiCalled && !result.reportGenerated) {
      result.verdict = 'FAIL';
      result.notes = `Form partially filled but no AI response or report detected after 25s`;
    } else {
      result.verdict = 'ERROR';
      result.notes = `Inconclusive: geminiCalled=${result.geminiCalled}, reportGenerated=${result.reportGenerated}`;
    }

  } catch (error) {
    console.error('Test error:', error.message);
    result.verdict = 'ERROR';
    result.notes = `Test failed with error: ${error.message.substring(0, 200)}`;
    result.errorShown = true;
    result.errorMessage = error.message.substring(0, 200);
    await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/debug_error.png' }).catch(() => {});
  } finally {
    await browser.close();
  }

  console.log('\n=== FINAL RESULT ===');
  console.log(JSON.stringify(result, null, 2));
  return result;
}

runTest().catch(console.error);
