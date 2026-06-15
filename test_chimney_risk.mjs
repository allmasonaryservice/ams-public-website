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
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('request', req => {
    const url = req.url();
    if (url.includes('generativelanguage.googleapis.com')) {
      geminiCalled = true;
      console.log('[NET] Gemini request:', url.substring(0, 100));
    }
    if (url.includes('/api/')) console.log('[NET] API req:', url);
  });

  page.on('response', async res => {
    const url = res.url();
    if (url.includes('generativelanguage.googleapis.com')) {
      geminiStatus = res.status();
      console.log('[NET] Gemini resp:', geminiStatus);
    }
    if (url.includes('/api/') && res.status() !== 404) {
      const st = res.status();
      console.log('[NET] API resp:', url, st);
      if (st === 200 && !geminiStatus) { geminiStatus = st; geminiCalled = true; }
    }
  });

  try {
    console.log('[INFO] Loading page...');
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(2000);
    console.log('[INFO] Title:', await page.title());

    for (let i = 1; i <= 15; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), i * 500);
      await sleep(150);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(500);

    const allInputs = await page.locator('input:visible').all();
    console.log('[INFO] Visible inputs:', allInputs.length);
    for (const inp of allInputs) {
      const t = await inp.getAttribute('type');
      const n = await inp.getAttribute('name');
      const id = await inp.getAttribute('id');
      const ph = await inp.getAttribute('placeholder');
      console.log('  input type=' + t + ' name=' + n + ' id=' + id + ' ph=' + ph);
    }

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
      console.log('[MISS] ' + lbl);
      return false;
    }

    const r1 = await tryFill(['input[name*="name" i]','input[id*="name" i]','input[placeholder*="name" i]'], 'Sarah Williams', 'Name');
    const r2 = await tryFill(['input[type="tel"]','input[name*="phone" i]','input[id*="phone" i]','input[placeholder*="phone" i]'], '7735559876', 'Phone');
    const r3 = await tryFill(['input[type="email"]','input[name*="email" i]','input[id*="email" i]'], 'sarah@example.com', 'Email');
    const r4 = await tryFill(['input[name*="address" i]','input[id*="address" i]','input[placeholder*="address" i]'], '321 Pine St, Naperville, IL', 'Address');
    const r5 = await tryFill(['input[name*="zip" i]','input[id*="zip" i]','input[placeholder*="zip" i]','input[name*="postal" i]'], '60540', 'Zip');

    const numInputs = await page.locator('input[type="number"]:visible').all();
    console.log('[INFO] Number inputs:', numInputs.length);
    const numVals = ['500','10','20','15','8','2','12'];
    for (let i = 0; i < Math.min(numInputs.length, numVals.length); i++) {
      try {
        await numInputs[i].scrollIntoViewIfNeeded();
        await numInputs[i].fill(numVals[i]);
        const nm = await numInputs[i].getAttribute('name') || await numInputs[i].getAttribute('id') || String(i);
        console.log('[FILL] Number[' + nm + '] => ' + numVals[i]);
      } catch(e) {}
    }

    const selects = await page.locator('select:visible').all();
    for (let i = 0; i < selects.length; i++) {
      try {
        const opts = await selects[i].locator('option').all();
        if (opts.length > 1) {
          await selects[i].selectOption({ index: 1 });
          const nm = await selects[i].getAttribute('name') || String(i);
          console.log('[FILL] Select[' + nm + '] => opt 1');
        }
      } catch(e) {}
    }

    const labels = await page.locator('label:visible').all();
    let cbClicked = 0;
    for (const lbl of labels) {
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
          console.log('[FILL] Checkbox label ' + cbClicked + ' clicked');
          await sleep(100);
        }
      } catch(e) {}
    }

    formFilled = (r1 || r2 || r3 || r4 || r5 || cbClicked > 0);

    async function clickIfExists(sel, lbl) {
      const btn = page.locator(sel).first();
      if (await btn.count() > 0) {
        const vis = await btn.isVisible().catch(() => false);
        if (vis) {
          console.log('[ACTION] Clicking ' + lbl);
          await btn.click();
          await sleep(1500);
          return true;
        }
      }
      return false;
    }

    const hasNext = await clickIfExists('button:has-text("Next"), button:has-text("Continue")', 'Next');
    if (hasNext) {
      const s2n = await page.locator('input[type="number"]:visible').all();
      for (let i = 0; i < Math.min(s2n.length, 3); i++) {
        try { await s2n[i].fill(['500','10','2'][i]); } catch(e) {}
      }
      const s2s = await page.locator('select:visible').all();
      for (const s of s2s) {
        try { await s.selectOption({ index: 1 }); } catch(e) {}
      }
      await clickIfExists('button:has-text("Next"), button:has-text("Continue")', 'Next step2');
    }

    const genSels = [
      'button:has-text("Generate")', 'button:has-text("Analyze")',
      'button:has-text("Calculate")', 'button:has-text("Get My Score")',
      'button:has-text("Get Score")', 'button:has-text("Get Report")',
      'button:has-text("Submit")', 'button:has-text("Check")',
      'button:has-text("Score")', 'button[type="submit"]'
    ];

    let btnFound = false;
    for (const sel of genSels) {
      const btn = page.locator(sel).first();
      if (await btn.count() > 0) {
        const vis = await btn.isVisible().catch(() => false);
        if (vis) {
          const txt = await btn.textContent();
          console.log('[ACTION] Clicking "' + txt.trim() + '"');
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
      for (const b of allBtns) {
        const txt = await b.textContent();
        console.log('  - ' + txt.trim());
      }
      notes = 'No generate button found';
    } else {
      console.log('[INFO] Waiting 28s for AI response...');
      await Promise.race([
        page.waitForSelector([
          '[id*="result"]:not([style*="display: none"])',
          '[id*="report"]:not([style*="display: none"])',
          '[id*="output"]', '.ai-result', '.report-output'
        ].join(', '), { timeout: 28000 }).catch(() => {}),
        sleep(28000)
      ]);
      await sleep(2000);

      await page.screenshot({ path: 'C:/Users/Zilanee/Desktop/AMS_PUBLIC_WEBSITE/chimney_risk_result.png', fullPage: false });

      const bodyText = await page.evaluate(() => document.body.innerText);
      const successPats = [
        /risk\s*score/i, /chimney\s*condition/i, /your\s*assessment/i,
        /recommendation/i, /repair\s*urgency/i, /structural\s*integrity/i,
        /safety\s*rating/i, /\d+\s*\/\s*10/, /score\s*:\s*\d+/i,
        /inspection\s*priority/i, /ai\s*(analysis|assessment|report)/i
      ];
      for (const pat of successPats) {
        if (pat.test(bodyText)) {
          console.log('[SUCCESS] Pattern: ' + pat.toString());
          reportGenerated = true;
          break;
        }
      }

      const errPats = [
        /api\s*error/i, /something\s*went\s*wrong/i,
        /failed\s*to\s*(generate|analyze)/i, /error\s*(generating|analyzing)/i,
        /please\s*try\s*again/i, /service\s*unavailable/i
      ];
      for (const pat of errPats) {
        if (pat.test(bodyText)) {
          errorShown = true;
          const m = bodyText.match(pat);
          if (m) {
            const idx = bodyText.indexOf(m[0]);
            errorMessage = bodyText.substring(Math.max(0, idx - 20), idx + 100).trim();
          }
          console.log('[ERROR PAT] ' + pat.toString());
          break;
        }
      }

      const errEls = await page.locator('[id*="error"]:visible, .error:visible').all();
      for (const el of errEls) {
        try {
          const txt = await el.textContent();
          if (txt && txt.trim().length > 3) {
            errorShown = true;
            errorMessage = txt.trim().substring(0, 200);
            console.log('[ERROR EL] ' + errorMessage);
          }
        } catch(e) {}
      }

      notes = 'Button clicked. Waited 28s. Gemini:' + geminiCalled + ' Report:' + reportGenerated + ' Error:' + errorShown;
    }

  } catch(e) {
    console.error('[FATAL]', e.message);
    notes = 'Fatal: ' + e.message.substring(0, 200);
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
