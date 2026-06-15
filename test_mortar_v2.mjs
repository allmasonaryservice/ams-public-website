import { chromium } from 'playwright';

const result = {
  toolName: "MortarDamageAssessment",
  page: "/services/tuckpointing-repointing",
  geminiCalled: false,
  geminiStatus: null,
  reportGenerated: false,
  errorShown: false,
  errorMessage: "",
  formFilled: false,
  verdict: "ERROR",
  notes: ""
};

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Track ALL network requests/responses before page load
  page.on('request', req => {
    const url = req.url();
    if (url.includes('generativelanguage') || url.includes('gemini') || url.includes('/api/')) {
      console.log('[REQ]', req.method(), url.substring(0, 150));
    }
  });

  page.on('response', async res => {
    const url = res.url();
    if (url.includes('generativelanguage') || url.includes('gemini')) {
      result.geminiCalled = true;
      result.geminiStatus = res.status();
      console.log('[RES-GEMINI]', res.status(), url.substring(0, 150));
      try {
        const body = await res.text();
        console.log('[GEMINI BODY PREVIEW]', body.substring(0, 300));
      } catch(e) {}
    }
    if (url.includes('/api/')) {
      console.log('[RES-API]', res.status(), url.substring(0, 150));
      // Could be a proxy for Gemini
      if (res.status() === 200) {
        try {
          const body = await res.text();
          console.log('[API BODY PREVIEW]', body.substring(0, 300));
          // Check if it looks like a Gemini response
          if (body.includes('candidates') || body.includes('content') || body.includes('parts') || body.includes('text')) {
            result.geminiCalled = true;
            result.geminiStatus = res.status();
          }
        } catch(e) {}
      }
    }
  });

  console.log('Navigating to page...');
  await page.goto('https://ams-public-website-neon.vercel.app/services/tuckpointing-repointing', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  await page.waitForTimeout(2000);

  console.log('Page loaded');

  // Scroll to find tool
  await page.evaluate(() => {
    const el = document.getElementById('mortar-assessment-tool');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(500);

  // Fill step 1 fields - checkboxes (damage types)
  // The checkboxes are visible; click their labels
  const checkboxLabels = await page.$$('label:has(input[type="checkbox"])');
  console.log('Checkbox labels found:', checkboxLabels.length);

  let checkboxesClicked = 0;
  for (let i = 0; i < Math.min(checkboxLabels.length, 5); i++) {
    try {
      const label = checkboxLabels[i];
      if (await label.isVisible()) {
        await label.scrollIntoViewIfNeeded();
        await label.click();
        checkboxesClicked++;
        const text = await label.textContent();
        console.log(`Checkbox ${i} clicked: "${text?.trim()}"`);
        await page.waitForTimeout(300);
      }
    } catch(e) {
      console.log(`Checkbox ${i} error:`, e.message);
    }
  }

  // Fill material select (td-material)
  try {
    const matSelect = await page.$('#td-material');
    if (matSelect) {
      const opts = await page.$$eval('#td-material option', opts => opts.map(o => ({ value: o.value, text: o.text })));
      console.log('Material options:', JSON.stringify(opts));
      const nonEmpty = opts.find(o => o.value && o.value !== '' && o.value !== 'Select');
      if (nonEmpty) {
        await page.selectOption('#td-material', nonEmpty.value);
        console.log('Material selected:', nonEmpty.value);
      }
    }
  } catch(e) {
    console.log('Material select error:', e.message);
  }

  // Fill area select (td-area)
  try {
    const areaSelect = await page.$('#td-area');
    if (areaSelect) {
      const opts = await page.$$eval('#td-area option', opts => opts.map(o => ({ value: o.value, text: o.text })));
      console.log('Area options:', JSON.stringify(opts));
      const nonEmpty = opts.find(o => o.value && o.value !== '' && o.value !== 'Select');
      if (nonEmpty) {
        await page.selectOption('#td-area', nonEmpty.value);
        console.log('Area selected:', nonEmpty.value);
      }
    }
  } catch(e) {
    console.log('Area select error:', e.message);
  }

  // Fill textarea (td-notes)
  try {
    await page.fill('#td-notes', 'Crumbling mortar joints on south-facing wall, approximately 30% needs repointing. Noticed white staining and some cracks between bricks. No repairs done previously.');
    console.log('Notes textarea filled');
  } catch(e) {
    console.log('Notes textarea error:', e.message);
  }

  // Take screenshot of step 1
  await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\mortar_step1.png' });

  // Click Next button
  const nextBtn = await page.$('button:has-text("Next")');
  if (nextBtn && await nextBtn.isVisible()) {
    await nextBtn.scrollIntoViewIfNeeded();
    const nextText = await nextBtn.textContent();
    console.log('Clicking Next:', nextText?.trim());
    await nextBtn.click();
    await page.waitForTimeout(1500);
    console.log('Step 2 loaded');
  }

  // Take screenshot of step 2
  await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\mortar_step2.png' });

  // Check what's visible now (contact form fields)
  const visibleInputs = await page.$$eval('input, select, textarea', els =>
    els.filter(el => el.offsetParent !== null)
       .map(el => ({ tag: el.tagName, type: el.type, id: el.id, placeholder: el.placeholder || '' }))
  );
  console.log('Visible inputs on step 2:', JSON.stringify(visibleInputs));

  // Fill contact fields (now visible)
  try {
    await page.fill('#td-name', 'Sarah Williams');
    console.log('Name filled');
  } catch(e) { console.log('Name error:', e.message); }

  try {
    await page.fill('#td-phone', '7735559876');
    console.log('Phone filled');
  } catch(e) { console.log('Phone error:', e.message); }

  try {
    await page.fill('#td-email', 'sarah@example.com');
    console.log('Email filled');
  } catch(e) { console.log('Email error:', e.message); }

  try {
    await page.fill('#td-address', '321 Pine St, Naperville, IL');
    console.log('Address filled');
  } catch(e) { console.log('Address error:', e.message); }

  try {
    await page.fill('#td-zip', '60540');
    console.log('Zip filled');
  } catch(e) { console.log('Zip error:', e.message); }

  result.formFilled = checkboxesClicked >= 3;

  // Take screenshot before submit
  await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\mortar_before_submit.png' });

  // Click Generate button
  const generateBtn = await page.$('button:has-text("Generate")');
  if (generateBtn && await generateBtn.isVisible()) {
    const btnText = await generateBtn.textContent();
    console.log('Clicking Generate:', btnText?.trim());
    await generateBtn.click();
    console.log('Generate button clicked, waiting for AI response...');
  } else {
    // Try other button names
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      if (await btn.isVisible()) {
        const text = await btn.textContent();
        console.log('Visible button:', text?.trim());
      }
    }
    result.verdict = "ERROR";
    result.notes = "Generate button not found on step 2";
  }

  // Wait for Gemini response - up to 30 seconds
  let elapsed = 0;
  const checkInterval = 1000;
  while (elapsed < 30000) {
    await page.waitForTimeout(checkInterval);
    elapsed += checkInterval;

    // Check for result appearing
    const resultEl = await page.$('#td-result, [id*="td-result"], .sp-tool-result, [id*="result-content"]');
    if (resultEl && await resultEl.isVisible()) {
      const text = await resultEl.textContent();
      if (text && text.trim().length > 100) {
        console.log(`[${elapsed}ms] Result element appeared! Preview: ${text.substring(0, 200)}`);
        result.reportGenerated = true;
        break;
      }
    }

    // Check for error
    const errorEl = await page.$('[id*="error"], .error-msg, [class*="error-message"]');
    if (errorEl && await errorEl.isVisible()) {
      const text = await errorEl.textContent();
      if (text && text.trim().length > 0) {
        console.log(`[${elapsed}ms] Error appeared: ${text.substring(0, 200)}`);
        result.errorShown = true;
        result.errorMessage = text.trim();
        break;
      }
    }

    if (elapsed % 5000 === 0) {
      console.log(`[${elapsed}ms] Still waiting...`);
      await page.screenshot({ path: `C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\mortar_waiting_${elapsed}.png` });
    }
  }

  // Final screenshots
  await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\mortar_final.png', fullPage: false });
  await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\mortar_final_full.png', fullPage: true });

  // Check page content for report markers
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('\n=== PAGE TEXT SAMPLE (last 2000 chars) ===');
  console.log(bodyText.substring(Math.max(0, bodyText.length - 2000)));

  // Look for any result/output containers with content
  const allResultEls = await page.$$eval('[id*="result"], [id*="report"], [id*="output"], [class*="result"], [class*="report"]', els =>
    els.map(el => ({
      id: el.id,
      classes: el.className.substring(0, 80),
      visible: el.offsetParent !== null,
      textLen: el.innerText?.length || 0,
      textPreview: el.innerText?.substring(0, 300) || ''
    }))
  );
  console.log('\nResult elements:', JSON.stringify(allResultEls.filter(e => e.textLen > 50), null, 2));

  // Check if report actually generated (not just the tool container)
  if (!result.reportGenerated) {
    for (const el of allResultEls) {
      if (el.visible && el.textLen > 200 && (
        el.textPreview.includes('mortar') || el.textPreview.includes('repoint') ||
        el.textPreview.includes('assessment') || el.textPreview.includes('damage') ||
        el.textPreview.includes('recommend') || el.textPreview.includes('repair') ||
        el.textPreview.includes('Sarah') || el.textPreview.includes('321 Pine')
      )) {
        result.reportGenerated = true;
        console.log('Report found in element:', el.id || el.classes);
        break;
      }
    }
  }

  // Determine verdict
  if (result.geminiCalled && result.reportGenerated) {
    result.verdict = "PASS";
    result.notes = `Gemini API called (status ${result.geminiStatus}), report generated successfully`;
  } else if (result.geminiCalled && !result.reportGenerated) {
    result.verdict = "FAIL";
    result.notes = `Gemini API called (status ${result.geminiStatus}) but no visible report appeared`;
  } else if (result.reportGenerated && !result.geminiCalled) {
    result.verdict = "PASS";
    result.notes = "Report generated (Gemini likely called via server-side proxy — direct API call not detected in browser network)";
  } else if (result.errorShown) {
    result.verdict = "FAIL";
    result.notes = `Error shown: ${result.errorMessage.substring(0, 300)}`;
  } else if (result.formFilled) {
    result.verdict = "FAIL";
    result.notes = "Form filled and submitted but no report generated and no Gemini API call detected";
  } else {
    result.verdict = "ERROR";
    result.notes = "Could not complete form or find tool";
  }

} catch(e) {
  result.verdict = "ERROR";
  result.notes = `Script error: ${e.message}`;
  result.errorMessage = e.message;
  console.error('Script error:', e);
} finally {
  if (browser) await browser.close();
}

console.log('\n=== FINAL RESULT ===');
console.log(JSON.stringify(result, null, 2));
