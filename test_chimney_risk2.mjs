import { chromium } from 'playwright';

const PAGE_URL = 'https://ams-public-website-neon.vercel.app/services/chimney-repair-rebuilding';

let geminiCalled = false;
let geminiStatus = null;
let reportGenerated = false;
let errorShown = false;
let errorMessage = '';
let formFilled = false;
let notes = '';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext();
  const page = await context.newPage();

  const apiCalls = [];

  page.on('request', req => {
    const url = req.url();
    if (url.includes('generativelanguage.googleapis.com')) {
      geminiCalled = true;
      apiCalls.push({type:'gemini-req', url: url.substring(0,150)});
      console.log('[NET] Gemini request:', url.substring(0, 120));
    }
    if (url.includes('/api/')) {
      apiCalls.push({type:'api-req', url});
      console.log('[NET] API req:', url);
    }
  });

  page.on('response', async res => {
    const url = res.url();
    if (url.includes('generativelanguage.googleapis.com')) {
      geminiStatus = res.status();
      console.log('[NET] Gemini resp status:', geminiStatus);
      try {
        const body = await res.text();
        console.log('[NET] Gemini resp body (first 200):', body.substring(0,200));
      } catch(e) {}
    }
    if (url.includes('/api/') && res.status() !== 404) {
      const st = res.status();
      console.log('[NET] API resp:', url, 'status:', st);
      if (st === 200) {
        geminiStatus = geminiStatus || st;
        geminiCalled = true;
        try {
          const body = await res.text();
          console.log('[NET] API body (first 300):', body.substring(0,300));
        } catch(e) {}
      }
    }
  });

  try {
    console.log('[INFO] Loading page...');
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(3000);
    console.log('[INFO] Title:', await page.title());

    // Take initial screenshot to see the page state
    await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/chimney_step0.png', fullPage: false });

    // Scroll to find the form
    for (let i = 1; i <= 20; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), i * 400);
      await sleep(100);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(500);

    // Capture initial body text before filling
    const initialBodyText = await page.evaluate(() => document.body.innerText);
    console.log('[INFO] Initial body text length:', initialBodyText.length);

    // Look for the tool section
    const toolEl = await page.locator('[id*="tool"], [id*="lead"], [id*="magnet"], [id*="score"], [id*="risk"], [id*="chimney-risk"], [data-tool], section[class*="tool"]').first();
    console.log('[INFO] Tool element found:', await toolEl.count() > 0);

    // Find all selects and their options
    const selects = await page.locator('select').all();
    console.log('[INFO] Total selects:', selects.length);
    for (const s of selects) {
      const nm = await s.getAttribute('name') || await s.getAttribute('id') || '?';
      const opts = await s.locator('option').allTextContents();
      const vis = await s.isVisible().catch(() => false);
      console.log('  Select[' + nm + '] visible=' + vis + ' opts:', opts.join(' | '));
    }

    // Find all checkboxes and labels
    const checkboxes = await page.locator('input[type="checkbox"]').all();
    console.log('[INFO] Total checkboxes:', checkboxes.length);

    const cbLabels = await page.locator('label').all();
    console.log('[INFO] Total labels:', cbLabels.length);

    // Find text inputs specifically
    const textInputs = await page.locator('input[type="text"], input[type="email"], input[type="tel"], input:not([type])').all();
    console.log('[INFO] Text-type inputs:', textInputs.length);
    for (const inp of textInputs) {
      const t = await inp.getAttribute('type');
      const n = await inp.getAttribute('name');
      const id = await inp.getAttribute('id');
      const ph = await inp.getAttribute('placeholder');
      const vis = await inp.isVisible().catch(() => false);
      console.log('  input type=' + t + ' name=' + n + ' id=' + id + ' ph=' + ph + ' vis=' + vis);
    }

    // Fill visible selects
    const visSelects = await page.locator('select:visible').all();
    console.log('[INFO] Visible selects:', visSelects.length);
    for (let i = 0; i < visSelects.length; i++) {
      try {
        const opts = await visSelects[i].locator('option').all();
        const nm = await visSelects[i].getAttribute('name') || await visSelects[i].getAttribute('id') || String(i);
        if (opts.length > 1) {
          await visSelects[i].selectOption({ index: 1 });
          console.log('[FILL] Select[' + nm + '] => opt 1');
        }
      } catch(e) { console.log('[ERR] select', e.message); }
    }

    // Click checkbox labels
    const visLabels = await page.locator('label:visible').all();
    let cbClicked = 0;
    for (const lbl of visLabels) {
      if (cbClicked >= 4) break;
      try {
        const forAttr = await lbl.getAttribute('for');
        let isCB = false;
        if (forAttr) {
          const assoc = page.locator('#' + CSS.escape(forAttr));
          if (await assoc.count() > 0 && await assoc.getAttribute('type') === 'checkbox') isCB = true;
        }
        if (!isCB) {
          const inner = lbl.locator('input[type="checkbox"]');
          if (await inner.count() > 0) isCB = true;
        }
        if (isCB && await lbl.isVisible()) {
          await lbl.scrollIntoViewIfNeeded();
          await lbl.click();
          cbClicked++;
          const lblTxt = await lbl.textContent();
          console.log('[FILL] CB label ' + cbClicked + ': ' + lblTxt.trim().substring(0,50));
          await sleep(150);
        }
      } catch(e) {}
    }

    formFilled = (visSelects.length > 0 || cbClicked > 0);
    console.log('[INFO] Form filled:', formFilled, '| CB clicked:', cbClicked);

    await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/chimney_step1_filled.png', fullPage: false });

    // Look for Next button
    const nextBtn = page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("next")').first();
    if (await nextBtn.count() > 0 && await nextBtn.isVisible().catch(() => false)) {
      const nTxt = await nextBtn.textContent();
      console.log('[ACTION] Clicking Next: "' + nTxt.trim() + '"');
      await nextBtn.click();
      await sleep(2000);
      await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/chimney_step2.png', fullPage: false });

      // Step 2 - fill any new inputs
      const s2inputs = await page.locator('input:visible').all();
      console.log('[INFO] Step 2 inputs:', s2inputs.length);
      for (const inp of s2inputs) {
        const t = await inp.getAttribute('type');
        const n = await inp.getAttribute('name');
        const id = await inp.getAttribute('id');
        const ph = await inp.getAttribute('placeholder');
        console.log('  s2 input type=' + t + ' name=' + n + ' id=' + id + ' ph=' + ph);
      }

      // Fill name/email/phone/address/zip in step 2
      async function tryFill(sels, val, lbl) {
        for (const sel of sels) {
          try {
            const el = page.locator(sel).first();
            if (await el.count() > 0 && await el.isVisible()) {
              await el.scrollIntoViewIfNeeded();
              await el.fill(val);
              console.log('[FILL] ' + lbl + ' => ' + val);
              return true;
            }
          } catch(e) {}
        }
        return false;
      }

      await tryFill(['input[name*="name" i]','input[id*="name" i]','input[placeholder*="name" i]'], 'Sarah Williams', 'Name');
      await tryFill(['input[type="tel"]','input[name*="phone" i]','input[id*="phone" i]','input[placeholder*="phone" i]'], '7735559876', 'Phone');
      await tryFill(['input[type="email"]','input[name*="email" i]','input[id*="email" i]'], 'sarah@example.com', 'Email');
      await tryFill(['input[name*="address" i]','input[id*="address" i]','input[placeholder*="address" i]'], '321 Pine St, Naperville, IL', 'Address');
      await tryFill(['input[name*="zip" i]','input[id*="zip" i]','input[placeholder*="zip" i]','input[name*="postal" i]'], '60540', 'Zip');

      // Number fields
      const s2nums = await page.locator('input[type="number"]:visible').all();
      const numVals = ['500','10','20','15','8'];
      for (let i = 0; i < Math.min(s2nums.length, numVals.length); i++) {
        try {
          await s2nums[i].fill(numVals[i]);
          const nm = await s2nums[i].getAttribute('name') || String(i);
          console.log('[FILL] s2 num[' + nm + '] => ' + numVals[i]);
        } catch(e) {}
      }

      // More selects in step 2
      const s2sels = await page.locator('select:visible').all();
      for (let i = 0; i < s2sels.length; i++) {
        try {
          const opts = await s2sels[i].locator('option').all();
          if (opts.length > 1) {
            await s2sels[i].selectOption({ index: 1 });
            const nm = await s2sels[i].getAttribute('name') || String(i);
            console.log('[FILL] s2 sel[' + nm + '] => opt1');
          }
        } catch(e) {}
      }

      await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/chimney_step2_filled.png', fullPage: false });
    }

    // Find generate button
    const genSelsList = [
      'button:has-text("Generate")', 'button:has-text("Analyze")',
      'button:has-text("Calculate")', 'button:has-text("Get My Score")',
      'button:has-text("Get Score")', 'button:has-text("Get Report")',
      'button:has-text("Submit")', 'button:has-text("Check")',
      'button:has-text("Score")', 'button[type="submit"]'
    ];

    let btnFound = false;
    for (const sel of genSelsList) {
      const btn = page.locator(sel).first();
      if (await btn.count() > 0) {
        const vis = await btn.isVisible().catch(() => false);
        if (vis) {
          const txt = await btn.textContent();
          console.log('[ACTION] Clicking gen btn: "' + txt.trim() + '"');
          await btn.scrollIntoViewIfNeeded();
          await btn.click();
          btnFound = true;
          break;
        }
      }
    }

    if (!btnFound) {
      const allBtns = await page.locator('button:visible').all();
      console.log('[INFO] All visible buttons:');
      for (const b of allBtns) { console.log('  - ' + (await b.textContent()).trim()); }
      notes = 'No generate button found';
    } else {
      console.log('[INFO] Waiting 30s for AI response...');
      await sleep(30000);

      await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/chimney_result.png', fullPage: false });
      await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/chimney_result_full.png', fullPage: true });

      const finalBodyText = await page.evaluate(() => document.body.innerText);
      console.log('[INFO] Final body text length:', finalBodyText.length);

      // Check if new content appeared after submission (compare with initial)
      const newContent = finalBodyText.length > initialBodyText.length + 200;
      console.log('[INFO] New content appeared:', newContent, '(delta:', finalBodyText.length - initialBodyText.length, ')');

      // Check specific result patterns that would only appear AFTER AI runs
      const aiResultPats = [
        /chimney\s*risk\s*score[:\s]+\d+/i,
        /overall\s*risk[:\s]+(low|medium|high|critical)/i,
        /your\s+chimney\s+(has|is|shows|needs)/i,
        /based\s+on\s+your\s+(assessment|inputs|information)/i,
        /\d+\s*\/\s*10\s*(risk|score)/i,
        /estimated\s+(repair|cost)/i,
        /priority\s*(level|rating)[:\s]+(low|medium|high|urgent|critical)/i,
        /immediate\s+attention/i,
        /next\s+steps[:\s]/i,
        /our\s+recommendation[s]?[:\s]/i,
      ];

      for (const pat of aiResultPats) {
        if (pat.test(finalBodyText)) {
          console.log('[SUCCESS] AI result pattern: ' + pat.toString());
          reportGenerated = true;
          break;
        }
      }

      // Check error patterns
      const errPats = [
        /api\s*error/i, /something\s*went\s*wrong/i,
        /failed\s*to\s*(generate|analyze)/i, /error\s*(generating|analyzing)/i,
        /please\s*try\s*again/i, /service\s*unavailable/i,
        /could\s*not\s*(generate|process)/i
      ];
      for (const pat of errPats) {
        if (pat.test(finalBodyText)) {
          errorShown = true;
          const m = finalBodyText.match(pat);
          if (m) {
            const idx = finalBodyText.indexOf(m[0]);
            errorMessage = finalBodyText.substring(Math.max(0,idx-30), idx+150).trim();
          }
          console.log('[ERROR PAT] ' + pat.toString() + ' => ' + errorMessage);
          break;
        }
      }

      // Log visible result/output elements
      const resultEls = await page.locator('[id*="result"], [id*="report"], [id*="output"], .result, .report, .ai-output, .risk-score-result').all();
      for (const el of resultEls) {
        try {
          const vis = await el.isVisible();
          const txt = await el.textContent();
          if (vis && txt && txt.trim().length > 10) {
            console.log('[RESULT EL] vis=' + vis + ' text=', txt.substring(0,200));
            reportGenerated = true;
          }
        } catch(e) {}
      }

      // Print relevant new content
      if (finalBodyText.length > initialBodyText.length) {
        console.log('[INFO] End of page text (last 500 chars):', finalBodyText.substring(finalBodyText.length - 500));
      }

      notes = 'Button clicked. 30s wait. API calls:' + JSON.stringify(apiCalls) + ' Gemini:' + geminiCalled + ' Report:' + reportGenerated + ' Error:' + errorShown;
    }

  } catch(e) {
    console.error('[FATAL]', e.message);
    notes = 'Fatal: ' + e.message.substring(0, 300);
    errorShown = true;
    errorMessage = e.message.substring(0, 200);
  } finally {
    await browser.close();
  }

  let verdict = 'ERROR';
  if (reportGenerated) verdict = 'PASS';
  else if (errorShown && errorMessage) verdict = 'FAIL';
  else if (formFilled) verdict = 'FAIL';

  const result = {
    toolName: 'ChimneyRiskScore',
    page: '/services/chimney-repair-rebuilding',
    geminiCalled, geminiStatus, reportGenerated, errorShown, errorMessage, formFilled, verdict, notes
  };
  console.log('\n=== RESULT JSON ===');
  console.log(JSON.stringify(result, null, 2));
})();
