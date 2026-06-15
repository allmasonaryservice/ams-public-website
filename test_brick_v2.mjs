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
    const url = req.url();
    if (url.includes('generativelanguage.googleapis.com')) {
      console.log('[NET] Gemini direct request:', url.substring(0, 100));
      result.geminiCalled = true;
    }
    if (url.includes('/api/')) {
      console.log('[NET] API request:', url);
    }
  });

  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('generativelanguage.googleapis.com')) {
      result.geminiStatus = res.status();
      result.geminiCalled = true;
      console.log('[NET] Gemini response status:', res.status());
    }
    if (url.includes('/api/')) {
      const status = res.status();
      console.log('[NET] API response:', url, 'status:', status);
      if (status === 200 && !result.geminiCalled) {
        result.geminiCalled = true;
        result.geminiStatus = status;
      }
      try {
        const text = await res.text();
        if (text && text.length > 50) {
          console.log('[NET] API response body preview:', text.substring(0, 300));
        }
      } catch (e) {}
    }
  });

  console.log('Loading page...');
  await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  console.log('Page loaded');

  // Scroll to find the tool
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(500);

  // Step 1: Fill the damage count fields (visible on step 1)
  // bd-spalled, bd-cracked, bd-missing, bd-stained
  console.log('\n--- STEP 1: Fill damage fields ---');

  try { await page.fill('#bd-spalled', '15'); console.log('Filled bd-spalled: 15'); } catch(e) { console.log('bd-spalled error:', e.message); }
  try { await page.fill('#bd-cracked', '8'); console.log('Filled bd-cracked: 8'); } catch(e) { console.log('bd-cracked error:', e.message); }
  try { await page.fill('#bd-missing', '3'); console.log('Filled bd-missing: 3'); } catch(e) { console.log('bd-missing error:', e.message); }
  try { await page.fill('#bd-stained', '12'); console.log('Filled bd-stained: 12'); } catch(e) { console.log('bd-stained error:', e.message); }

  // Fill select fields
  try {
    const locOptions = await page.$$eval('#bd-location option', opts => opts.filter(o => o.value).map(o => o.value));
    console.log('bd-location options:', locOptions);
    if (locOptions.length > 0) {
      await page.selectOption('#bd-location', locOptions[0]);
      console.log('Selected bd-location:', locOptions[0]);
    }
  } catch(e) { console.log('bd-location error:', e.message); }

  try {
    const durOptions = await page.$$eval('#bd-duration option', opts => opts.filter(o => o.value).map(o => o.value));
    console.log('bd-duration options:', durOptions);
    if (durOptions.length > 0) {
      await page.selectOption('#bd-duration', durOptions[0]);
      console.log('Selected bd-duration:', durOptions[0]);
    }
  } catch(e) { console.log('bd-duration error:', e.message); }

  // Fill textarea notes
  try {
    await page.fill('#bd-notes', 'Multiple spalled bricks on south-facing wall near foundation. Some cracking visible in mortar joints. Water staining on lower courses suggests past moisture intrusion.');
    console.log('Filled bd-notes');
  } catch(e) { console.log('bd-notes error:', e.message); }

  // Look for checkboxes
  const checkboxLabels = await page.$$('label:has(input[type="checkbox"])');
  console.log(`Found ${checkboxLabels.length} checkbox labels`);
  const toClick = Math.min(4, checkboxLabels.length);
  for (let i = 0; i < toClick; i++) {
    try {
      await checkboxLabels[i].click();
      console.log(`Clicked checkbox label ${i}`);
      await page.waitForTimeout(200);
    } catch(e) { console.log(`Checkbox ${i} click error:`, e.message); }
  }

  await page.screenshot({ path: 'brick_v2_step1.png', fullPage: false });

  // Look for Next button
  let allButtonTexts = await page.$$eval('button', btns => btns.map(b => ({ text: b.textContent?.trim(), class: b.className, type: b.type })));
  console.log('Buttons on page:', JSON.stringify(allButtonTexts));

  // Click Next button for step 2
  const nextBtnStep1 = await page.$('button:has-text("Next"), button[id*="next" i], button[class*="next" i]');
  if (nextBtnStep1) {
    console.log('\n--- Clicking Next to step 2 ---');
    await nextBtnStep1.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'brick_v2_step2.png', fullPage: false });
  } else {
    console.log('No Next button found for step 1');
  }

  // Step 2: Fill contact info (previously hidden fields)
  console.log('\n--- STEP 2: Fill contact fields ---');
  try { await page.fill('#bd-name', 'Sarah Williams'); console.log('Filled bd-name'); } catch(e) { console.log('bd-name error:', e.message); }
  try { await page.fill('#bd-phone', '7735559876'); console.log('Filled bd-phone'); } catch(e) { console.log('bd-phone error:', e.message); }
  try { await page.fill('#bd-email', 'sarah@example.com'); console.log('Filled bd-email'); } catch(e) { console.log('bd-email error:', e.message); }
  try { await page.fill('#bd-address', '321 Pine St, Naperville, IL'); console.log('Filled bd-address'); } catch(e) { console.log('bd-address error:', e.message); }
  try { await page.fill('#bd-zip', '60540'); console.log('Filled bd-zip'); } catch(e) { console.log('bd-zip error:', e.message); }

  await page.screenshot({ path: 'brick_v2_step2_filled.png', fullPage: false });

  // Check for all buttons again
  allButtonTexts = await page.$$eval('button', btns => btns.map(b => ({ text: b.textContent?.trim(), visible: b.offsetParent !== null, type: b.type })));
  console.log('Buttons after step 2:', JSON.stringify(allButtonTexts));

  result.formFilled = true;

  // Find submit/generate button
  const submitSelectors = [
    'button[type="submit"]',
    'button:has-text("Get My")',
    'button:has-text("Generate")',
    'button:has-text("Analyze")',
    'button:has-text("Calculate")',
    'button:has-text("Count")',
    'button:has-text("Assess")',
    'button:has-text("Submit")',
    'button:has-text("Get Report")',
    'button:has-text("Get Estimate")',
    'button:has-text("Check")',
    'button:has-text("Send")',
    'button:has-text("Request")'
  ];

  let submitClicked = false;
  for (const sel of submitSelectors) {
    try {
      const btn = await page.$(sel);
      if (btn) {
        const visible = await btn.isVisible();
        if (visible) {
          const btnText = await btn.textContent();
          console.log(`\n--- Clicking submit: "${btnText}" (${sel}) ---`);
          await btn.click();
          submitClicked = true;
          break;
        }
      }
    } catch(e) {}
  }

  if (!submitClicked) {
    // Try any visible button
    const visibleBtns = await page.$$('button');
    for (const btn of visibleBtns) {
      try {
        const visible = await btn.isVisible();
        if (!visible) continue;
        const text = (await btn.textContent() || '').trim().toLowerCase();
        if (['back', 'previous', 'cancel', 'close'].includes(text)) continue;
        console.log(`\n--- Clicking fallback button: "${text}" ---`);
        await btn.click();
        submitClicked = true;
        break;
      } catch(e) {}
    }
  }

  if (!submitClicked) {
    result.notes = 'Could not find or click submit button';
    result.verdict = 'ERROR';
    console.log('ERROR: No submit button found');
    await page.screenshot({ path: 'brick_v2_error.png', fullPage: true });
  } else {
    // Wait up to 30 seconds for response
    console.log('\nWaiting for AI response (up to 30s)...');
    let elapsed = 0;
    let done = false;

    while (elapsed < 30000 && !done) {
      await page.waitForTimeout(1000);
      elapsed += 1000;
      process.stdout.write(`${elapsed/1000}s `);

      // Check for result elements
      const pageText = await page.evaluate(() => document.body.innerText);

      // Check for success indicators
      const hasReport = /estimate|assessment|recommendation|repair.*cost|damage.*report|brick.*count|spall|crack|missing.*brick/i.test(pageText);
      const hasAIContent = /based on your|our analysis|we recommend|repair plan|cost estimate|total.*brick|summary/i.test(pageText);

      // Check for error indicators
      const hasError = /error|failed|something went wrong|try again|api|network/i.test(pageText);

      // Check DOM for result/error containers
      const resultEl = await page.$('[id*="result"], [id*="report"], [id*="output"], [class*="result-"], [class*="report-"]');
      const errorEl = await page.$('[id*="error"], [class*="error"][class*="message"], .alert-error, [class*="error-msg"]');

      if (resultEl) {
        const txt = await resultEl.textContent();
        if (txt && txt.trim().length > 100) {
          console.log('\nResult element found:', txt.substring(0, 200));
          result.reportGenerated = true;
          done = true;
        }
      }

      if (errorEl) {
        const txt = await errorEl.textContent();
        if (txt && txt.trim().length > 5) {
          console.log('\nError element found:', txt.substring(0, 200));
          result.errorShown = true;
          result.errorMessage = txt.trim().substring(0, 300);
          done = true;
        }
      }

      if ((hasReport || hasAIContent) && !done) {
        console.log('\nSuccess content detected in page text');
        result.reportGenerated = true;
        done = true;
      }

      if (result.geminiCalled && elapsed > 5000 && !done) {
        console.log('\nGemini called, checking page...');
        if (hasError) {
          result.errorShown = true;
          result.errorMessage = 'Error detected on page';
          done = true;
        }
      }
    }

    console.log('\nWait complete');
    await page.screenshot({ path: 'brick_v2_final.png', fullPage: true });

    // Final page text analysis
    const finalText = await page.evaluate(() => document.body.innerText);
    console.log('\n=== FINAL PAGE TEXT (last 3000 chars) ===');
    console.log(finalText.slice(-3000));

    // Check for errors in final text
    if (!result.errorShown && /error|failed|something went wrong/i.test(finalText)) {
      const match = finalText.match(/(?:error|failed|something went wrong)[^\n]{0,200}/i);
      if (match) {
        result.errorShown = true;
        result.errorMessage = match[0].trim();
      }
    }

    // Set verdict
    if (result.reportGenerated && !result.errorShown) {
      result.verdict = 'PASS';
      result.notes = `Form submitted. Gemini called: ${result.geminiCalled} (status: ${result.geminiStatus}). Report generated.`;
    } else if (result.errorShown) {
      result.verdict = 'FAIL';
      result.notes = `Error shown: ${result.errorMessage}`;
    } else if (!result.reportGenerated && !result.geminiCalled) {
      result.verdict = 'FAIL';
      result.notes = 'Form submitted but no Gemini call detected and no report generated within 30s';
    } else {
      result.verdict = 'FAIL';
      result.notes = `Gemini called: ${result.geminiCalled}, Report: ${result.reportGenerated}, Error: ${result.errorShown}`;
    }
  }

} catch(err) {
  console.error('\nScript error:', err);
  result.verdict = 'ERROR';
  result.notes = `Script error: ${err.message}`;
} finally {
  if (browser) await browser.close();
}

console.log('\n=== RESULT ===');
console.log(JSON.stringify(result, null, 2));
