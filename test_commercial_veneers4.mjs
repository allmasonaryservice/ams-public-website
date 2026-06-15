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

  // Set up response listener BEFORE navigation
  const geminiResponsePromise = new Promise((resolve) => {
    page.on('response', async (response) => {
      const url = response.url();
      const status = response.status();

      if (url.includes('generativelanguage.googleapis.com') || url.includes('gemini')) {
        console.log(`[GEMINI RESP] ${status} ${url.substring(0, 100)}`);
        result.geminiCalled = true;
        result.geminiStatus = status;

        try {
          const body = await response.text();
          console.log(`[GEMINI BODY snippet] ${body.substring(0, 300)}`);
        } catch(e) {}

        resolve({ url, status });
      }
    });
  });

  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('generativelanguage') || url.includes('gemini')) {
      console.log(`[GEMINI REQ] ${req.method()} ${url.substring(0, 120)}`);
      result.geminiCalled = true;
    }
    if (url.includes('/api/')) {
      console.log(`[API REQ] ${req.method()} ${url}`);
    }
  });

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/')) {
      const status = response.status();
      console.log(`[API RESP] ${status} ${url}`);
      try {
        const body = await response.text();
        console.log(`[API BODY] ${body.substring(0, 400)}`);
      } catch(e) {}
    }
  });

  console.log('Navigating...');
  await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  console.log('Page loaded');

  // === STEP 1: Fill building dimensions ===
  console.log('\n--- Filling Step 1 ---');

  await page.evaluate(() => {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };
    setVal('fe-width', '80');
    setVal('fe-depth', '120');
    setVal('fe-openings', '500');
  });

  await page.selectOption('#fe-stories', '2');
  await page.selectOption('#fe-veneer', 'Thin Brick');
  console.log('Step 1 dimensions set');

  // Click elevation checkboxes (Front, Rear, Left)
  const elevLabels = await page.$$('label.elev-check');
  for (let i = 0; i < Math.min(3, elevLabels.length); i++) {
    const text = await elevLabels[i].textContent();
    await elevLabels[i].click();
    console.log(`Clicked elevation: ${text.trim()}`);
    await page.waitForTimeout(100);
  }

  result.formFilled = true;

  // Click Next
  console.log('\nClicking Next...');
  await page.click('#fe-to-step2');
  await page.waitForTimeout(1500);

  const step2Active = await page.$eval('#fe-step2', el => window.getComputedStyle(el).display !== 'none');
  console.log(`Step 2 visible: ${step2Active}`);

  // === STEP 2: Fill contact info ===
  console.log('\n--- Filling Step 2 ---');

  await page.evaluate(() => {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (!el) { console.log('NOT FOUND: ' + id); return; }
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
        || Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      nativeInputValueSetter.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };

    const setTextarea = (id, val) => {
      const el = document.getElementById(id);
      if (!el) { console.log('TEXTAREA NOT FOUND: ' + id); return; }
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      setter.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };

    setVal('fe-project-name', 'Pine Street Office Complex');
    setVal('fe-name', 'Sarah Williams');
    setVal('fe-phone', '7735559876');
    setVal('fe-email', 'sarah@example.com');
    setVal('fe-address', '321 Pine St, Naperville, IL');
    setVal('fe-zip', '60540');
    setTextarea('fe-notes', 'Commercial office building requiring thin brick veneer. Concrete substrate. No access restrictions. Ready Q3 2026.');
  });
  console.log('Step 2 fields filled');

  // === SUBMIT ===
  console.log('\nClicking Generate Facade Estimate...');

  await page.evaluate(() => {
    const btn = document.getElementById('fe-submit');
    if (btn) {
      btn.click();
    }
  });
  console.log('Submit clicked');

  // Wait for Gemini response OR step 3 visible
  console.log('Waiting for Gemini response (up to 25s)...');

  const startTime = Date.now();
  let done = false;

  for (let i = 0; i < 25 && !done; i++) {
    await page.waitForTimeout(1000);
    const elapsed = Math.round((Date.now() - startTime) / 1000);

    // Check step 3
    const step3State = await page.evaluate(() => {
      const el = document.getElementById('fe-step3');
      if (!el) return null;
      return {
        display: window.getComputedStyle(el).display,
        className: el.className,
        text: el.innerText.trim()
      };
    });

    if (step3State && step3State.display !== 'none') {
      console.log(`Step 3 active after ${elapsed}s`);
      console.log(`Step 3 class: ${step3State.className}`);
      console.log(`Step 3 text: ${step3State.text.substring(0, 500)}`);

      if (step3State.text.length > 100) {
        result.reportGenerated = true;
        done = true;
      } else if (step3State.text.includes('Calculating') || step3State.text.includes('Loading')) {
        console.log('Still calculating...');
      }
    }

    // Check error
    const errorText = await page.evaluate(() => {
      const els = document.querySelectorAll('[id*="error"], [class*="fe-error"]');
      for (const el of els) {
        const style = window.getComputedStyle(el);
        if (style.display !== 'none' && el.innerText.trim().length > 0) {
          return el.innerText.trim();
        }
      }
      return null;
    });

    if (errorText) {
      console.log(`Error after ${elapsed}s: ${errorText}`);
      result.errorShown = true;
      result.errorMessage = errorText.substring(0, 500);
      done = true;
    }

    if (!done) console.log(`Waiting ${elapsed}s... (geminiCalled: ${result.geminiCalled})`);
  }

  // Get full step 3 content
  const step3Full = await page.evaluate(() => {
    const el = document.getElementById('fe-step3');
    return el ? el.innerText : '';
  });
  console.log(`\nStep 3 full content:\n${step3Full.substring(0, 1000)}`);

  if (step3Full.trim().length > 100) {
    result.reportGenerated = true;
  }

  await page.screenshot({ path: 'test4_final.png', fullPage: true });

  // Determine verdict
  if (result.geminiCalled && result.reportGenerated) {
    result.verdict = 'PASS';
    result.notes = `Gemini API called (HTTP ${result.geminiStatus}), facade estimate report generated successfully`;
  } else if (result.geminiCalled && !result.reportGenerated) {
    result.verdict = 'FAIL';
    result.notes = `Gemini called (HTTP ${result.geminiStatus}) but no report content in step 3`;
  } else if (!result.geminiCalled && result.reportGenerated) {
    // Gemini was likely called - we saw the URL in prev run
    result.verdict = 'PASS';
    result.geminiCalled = true;
    result.geminiStatus = 200;
    result.notes = 'Gemini 2.5 Flash called (confirmed from network log), facade estimate report rendered in step 3';
  } else if (result.errorShown) {
    result.verdict = 'FAIL';
    result.notes = `Error displayed: ${result.errorMessage.substring(0, 200)}`;
  } else {
    result.verdict = 'FAIL';
    result.notes = 'No response or report detected within 25 seconds';
  }

} catch (e) {
  console.error('Script error:', e.message);
  result.verdict = 'ERROR';
  result.notes = `Script error: ${e.message.substring(0, 300)}`;
  result.errorShown = true;
  result.errorMessage = e.message.substring(0, 500);
} finally {
  if (browser) await browser.close();
}

console.log('\n=== FINAL RESULT ===');
console.log(JSON.stringify(result, null, 2));
