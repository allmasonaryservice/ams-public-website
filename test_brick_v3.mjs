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

  // Track Gemini calls via route interception (to capture status)
  await page.route('**/*', async (route) => {
    const req = route.request();
    const url = req.url();
    if (url.includes('generativelanguage.googleapis.com')) {
      console.log('[INTERCEPT] Gemini request detected');
      result.geminiCalled = true;
      const response = await route.fetch();
      result.geminiStatus = response.status();
      console.log('[INTERCEPT] Gemini response status:', response.status());
      await route.fulfill({ response });
    } else {
      await route.continue();
    }
  });

  // Also track any /api/ routes
  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('/api/') && !url.includes('_next')) {
      console.log('[NET] API response:', url, 'status:', res.status());
    }
  });

  console.log('Loading page...');
  await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  console.log('Page loaded');

  // Scroll to find tool
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(500);

  // STEP 1: Fill damage fields
  console.log('\n--- STEP 1: Filling damage fields ---');
  await page.fill('#bd-spalled', '15');
  await page.fill('#bd-cracked', '8');
  await page.fill('#bd-missing', '3');
  await page.fill('#bd-stained', '12');

  const locOptions = await page.$$eval('#bd-location option', opts => opts.filter(o => o.value).map(o => o.value));
  if (locOptions.length > 0) await page.selectOption('#bd-location', locOptions[0]);

  const durOptions = await page.$$eval('#bd-duration option', opts => opts.filter(o => o.value).map(o => o.value));
  if (durOptions.length > 0) await page.selectOption('#bd-duration', durOptions[0]);

  await page.fill('#bd-notes', 'Multiple spalled bricks on south-facing wall near foundation. Water staining on lower courses suggests past moisture intrusion. Some cracking in mortar joints.');

  await page.screenshot({ path: 'brick_v3_step1.png' });
  console.log('Step 1 fields filled');

  // Click Next
  await page.click('button:has-text("Next")');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'brick_v3_step2.png' });
  console.log('Clicked Next');

  // STEP 2: Fill contact fields
  console.log('\n--- STEP 2: Filling contact fields ---');
  await page.fill('#bd-name', 'Sarah Williams');
  await page.fill('#bd-phone', '7735559876');
  await page.fill('#bd-email', 'sarah@example.com');
  await page.fill('#bd-address', '321 Pine St, Naperville, IL');
  await page.fill('#bd-zip', '60540');

  result.formFilled = true;
  await page.screenshot({ path: 'brick_v3_step2_filled.png' });
  console.log('Step 2 fields filled');

  // Click Generate
  console.log('\n--- Clicking Generate Damage Report ---');
  await page.click('button:has-text("Generate Damage Report")');

  // Wait for AI response (up to 30s)
  console.log('Waiting for Gemini response...');
  let elapsed = 0;
  let done = false;

  while (elapsed < 30000 && !done) {
    await page.waitForTimeout(1000);
    elapsed += 1000;

    // Check for report ready message
    const pageText = await page.evaluate(() => document.body.innerText);

    // The success state shows "Your Report Is Ready"
    if (/your report is ready|report is ready/i.test(pageText)) {
      console.log('\nReport ready message detected!');
      result.reportGenerated = true;
      done = true;
      continue;
    }

    // Check for actual error (not the "Try Again" button)
    // Look for error elements that have actual error messages
    const errorEls = await page.$$('[class*="error"], [id*="error"]');
    for (const el of errorEls) {
      const txt = (await el.textContent() || '').trim();
      const isVisible = await el.isVisible();
      // Exclude "Try Again" button text and short/nav text
      if (isVisible && txt.length > 20 && !/try again|back|next|generate/i.test(txt) && !/services|chicago|masonry/i.test(txt)) {
        console.log('\nActual error element:', txt.substring(0, 200));
        result.errorShown = true;
        result.errorMessage = txt.substring(0, 300);
        done = true;
        break;
      }
    }

    if (elapsed % 5000 === 0) {
      process.stdout.write(`${elapsed/1000}s... `);
    }
  }

  console.log('\nWait complete');
  await page.screenshot({ path: 'brick_v3_final.png', fullPage: true });

  // Final page check
  const finalText = await page.evaluate(() => document.body.innerText);

  // Double-check report
  if (!result.reportGenerated && /your report is ready|personalized.*brick|damage assessment is ready/i.test(finalText)) {
    result.reportGenerated = true;
  }

  // Check for PDF download button (strong indicator of success)
  const pdfBtn = await page.$('button:has-text("Download PDF"), a:has-text("Download PDF")');
  if (pdfBtn) {
    const pdfVisible = await pdfBtn.isVisible();
    if (pdfVisible) {
      console.log('PDF Download button is visible — report definitely generated');
      result.reportGenerated = true;
    }
  }

  // Determine verdict
  if (result.geminiCalled && result.reportGenerated && !result.errorShown) {
    result.verdict = 'PASS';
    result.notes = `Gemini API called successfully (HTTP ${result.geminiStatus}). Report generated and PDF download available.`;
  } else if (result.reportGenerated && !result.errorShown) {
    result.verdict = 'PASS';
    result.notes = `Report generated. Gemini called: ${result.geminiCalled} (status: ${result.geminiStatus}).`;
  } else if (result.errorShown) {
    result.verdict = 'FAIL';
    result.notes = `Error shown: ${result.errorMessage}`;
  } else {
    result.verdict = 'FAIL';
    result.notes = `No report generated. Gemini called: ${result.geminiCalled}. Elapsed: ${elapsed}ms`;
  }

  console.log('\n=== KEY RESULT DATA ===');
  console.log('geminiCalled:', result.geminiCalled);
  console.log('geminiStatus:', result.geminiStatus);
  console.log('reportGenerated:', result.reportGenerated);
  console.log('errorShown:', result.errorShown);
  console.log('verdict:', result.verdict);

} catch(err) {
  console.error('\nScript error:', err.message);
  result.verdict = 'ERROR';
  result.notes = `Script error: ${err.message}`;
} finally {
  if (browser) await browser.close();
}

console.log('\n=== RESULT ===');
console.log(JSON.stringify(result, null, 2));
