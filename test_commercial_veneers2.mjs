import { chromium } from 'playwright';

const PAGE_URL = 'https://ams-public-website-neon.vercel.app/services/commercial-masonry-veneers';

const result = {
  toolName: 'CommercialProjectScopeBuilder',
  page: '/services/commercial-masonry-veneers',
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

  // Track ALL network requests
  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('generativelanguage') || url.includes('gemini') || url.includes('/api/')) {
      console.log(`[REQ] ${req.method()} ${url}`);
    }
  });

  page.on('response', async (response) => {
    const url = response.url();
    const status = response.status();
    if (url.includes('generativelanguage') || url.includes('gemini')) {
      console.log(`[GEMINI RESP] ${url} => ${status}`);
      result.geminiCalled = true;
      result.geminiStatus = status;
    }
    if (url.includes('/api/')) {
      console.log(`[API RESP] ${url} => ${status}`);
      try {
        const text = await response.text();
        console.log(`[API BODY] ${text.substring(0, 500)}`);
        if (text.includes('candidates') || text.includes('gemini') || text.includes('content') || text.includes('scope') || text.includes('estimate')) {
          result.geminiCalled = true;
          if (!result.geminiStatus) result.geminiStatus = status;
        }
      } catch(e) {}
    }
  });

  console.log('Navigating...');
  await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  console.log('Page loaded');

  // === STEP 1: Fill building dimensions ===
  console.log('\n--- Filling Step 1 ---');

  // Building width
  await page.fill('#fe-width', '80');
  console.log('Filled width: 80');

  // Building depth
  await page.fill('#fe-depth', '120');
  console.log('Filled depth: 120');

  // Number of stories (select)
  await page.selectOption('#fe-stories', '2');
  console.log('Selected stories: 2');

  // Veneer system (select)
  await page.selectOption('#fe-veneer', 'Thin Brick');
  console.log('Selected veneer: Thin Brick');

  // Openings deductions
  await page.fill('#fe-openings', '500');
  console.log('Filled openings: 500');

  // Click checkboxes for elevations (Front, Rear, Left) - using label.elev-check
  // The checkboxes have class "fe-elev" and their labels have class "elev-check"
  const elevLabels = await page.$$('label.elev-check');
  console.log(`Found ${elevLabels.length} elevation labels`);

  // Click Front, Rear, Left (first 3)
  for (let i = 0; i < Math.min(3, elevLabels.length); i++) {
    const labelText = await elevLabels[i].textContent();
    await elevLabels[i].click();
    console.log(`Clicked elevation: ${labelText.trim()}`);
    await page.waitForTimeout(200);
  }

  result.formFilled = true;

  await page.screenshot({ path: 'test_step1_filled.png' });

  // Click Next button (Step 1 -> Step 2)
  console.log('\nClicking Next button...');
  await page.click('#fe-to-step2');
  await page.waitForTimeout(1500);
  console.log('Moved to step 2');

  await page.screenshot({ path: 'test_step2.png' });

  // === STEP 2: Fill contact info ===
  console.log('\n--- Filling Step 2 ---');

  // Project name
  await page.fill('#fe-project-name', 'Pine Street Office Complex');
  console.log('Filled project name');

  // Full name
  await page.fill('#fe-name', 'Sarah Williams');
  console.log('Filled name');

  // Phone
  await page.fill('#fe-phone', '7735559876');
  console.log('Filled phone');

  // Email
  await page.fill('#fe-email', 'sarah@example.com');
  console.log('Filled email');

  // Address
  await page.fill('#fe-address', '321 Pine St, Naperville, IL');
  console.log('Filled address');

  // Zip
  await page.fill('#fe-zip', '60540');
  console.log('Filled zip');

  // Notes textarea
  await page.fill('#fe-notes', 'Commercial office building requiring thin brick veneer on exterior. Existing concrete substrate. No access restrictions. Project ready to proceed in Q3 2026.');
  console.log('Filled notes');

  await page.screenshot({ path: 'test_step2_filled.png' });

  // Click Generate button
  console.log('\nClicking Generate Facade Estimate button...');

  // Scroll the submit button into view first
  await page.evaluate(() => {
    const btn = document.getElementById('fe-submit');
    if (btn) btn.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(500);

  await page.click('#fe-submit');
  console.log('Clicked submit button');

  // Wait for API response (up to 25 seconds)
  console.log('Waiting for response (up to 25s)...');

  const startTime = Date.now();
  let responded = false;

  // Poll for result or error
  for (let i = 0; i < 25; i++) {
    await page.waitForTimeout(1000);
    const elapsed = Math.round((Date.now() - startTime) / 1000);

    // Check step 3 (result step) visibility
    const step3Visible = await page.$eval('#fe-step3', el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && el.offsetParent !== null;
    }).catch(() => false);

    if (step3Visible) {
      console.log(`Step 3 (results) visible after ${elapsed}s`);
      responded = true;
      break;
    }

    // Check for error visibility
    const errorEl = await page.$('[id*="error"]:not([id*="retry"])');
    if (errorEl) {
      const visible = await errorEl.isVisible().catch(() => false);
      if (visible) {
        const text = await errorEl.textContent();
        console.log(`Error element visible after ${elapsed}s: ${text}`);
        result.errorShown = true;
        result.errorMessage = text.trim().substring(0, 500);
        responded = true;
        break;
      }
    }

    console.log(`Waiting... ${elapsed}s elapsed`);
  }

  await page.screenshot({ path: 'test_after_submit.png', fullPage: true });

  // Check step 3 content
  try {
    const step3Content = await page.$eval('#fe-step3', el => el.innerText);
    console.log(`\nStep 3 content (first 1000 chars):\n${step3Content.substring(0, 1000)}`);

    if (step3Content && step3Content.trim().length > 100) {
      result.reportGenerated = true;
    }
  } catch (e) {
    console.log('Could not read step 3 content:', e.message);
  }

  // Check for any result-related elements
  const resultSelectors = [
    '#fe-result', '.fe-result', '[id*="result"]', '[class*="result"]',
    '#fe-output', '.fe-output', '[id*="report"]', '[class*="report"]',
    '.fe-scope', '#fe-scope'
  ];

  for (const sel of resultSelectors) {
    try {
      const el = await page.$(sel);
      if (el) {
        const visible = await el.isVisible();
        if (visible) {
          const text = await el.textContent();
          if (text && text.trim().length > 50) {
            console.log(`Result in ${sel}: ${text.substring(0, 300)}`);
            result.reportGenerated = true;
          }
        }
      }
    } catch (e) {}
  }

  // Check full page body for AI content
  const bodyText = await page.$eval('body', el => el.innerText);

  // Check for signs of AI-generated content
  const aiPatterns = ['sq ft', 'square feet', 'estimate', 'scope', 'facade', 'coverage', 'veneer', 'thin brick', '$', 'range'];
  const foundInResults = aiPatterns.filter(p => bodyText.toLowerCase().includes(p.toLowerCase()));
  console.log(`\nAI content patterns found: ${foundInResults.join(', ')}`);

  // Log final body section (last 2000 chars which would be where results appear)
  console.log(`\nLast 2000 chars of page body:\n${bodyText.substring(Math.max(0, bodyText.length - 2000))}`);

  // Check all error elements
  const allErrors = await page.$$eval('[id*="error"], [class*="error-msg"], [class*="error-text"], .fe-error', els =>
    els.filter(el => el.offsetParent !== null || window.getComputedStyle(el).display !== 'none')
       .map(el => ({ id: el.id, class: el.className, text: el.innerText.trim().substring(0, 200) }))
  ).catch(() => []);

  if (allErrors.length > 0) {
    console.log('Error elements:', JSON.stringify(allErrors));
    const visibleErrors = allErrors.filter(e => e.text.length > 0);
    if (visibleErrors.length > 0) {
      result.errorShown = true;
      result.errorMessage = visibleErrors[0].text;
    }
  }

  // Determine verdict
  if (result.geminiCalled && result.reportGenerated) {
    result.verdict = 'PASS';
    result.notes = `Gemini API called (HTTP ${result.geminiStatus}), facade estimate report generated successfully`;
  } else if (result.geminiCalled && !result.reportGenerated) {
    result.verdict = 'FAIL';
    result.notes = `Gemini API called (HTTP ${result.geminiStatus}) but no report content found in step 3`;
  } else if (!result.geminiCalled && result.reportGenerated) {
    result.verdict = 'PASS';
    result.notes = 'Report generated - Gemini called server-side (not directly visible in browser network)';
  } else if (result.errorShown) {
    result.verdict = 'FAIL';
    result.notes = `Error displayed: ${result.errorMessage.substring(0, 200)}`;
  } else if (!responded) {
    result.verdict = 'FAIL';
    result.notes = 'No response received within 25 seconds - API may be timing out';
  } else {
    result.verdict = 'FAIL';
    result.notes = 'Form submitted but neither Gemini call detected nor report generated';
  }

} catch (e) {
  console.error('Script error:', e.message);
  console.error(e.stack);
  result.verdict = 'ERROR';
  result.notes = `Script error: ${e.message.substring(0, 300)}`;
  result.errorShown = true;
  result.errorMessage = e.message.substring(0, 500);
} finally {
  if (browser) await browser.close();
}

console.log('\n=== FINAL RESULT ===');
console.log(JSON.stringify(result, null, 2));
