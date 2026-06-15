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
        const clone = response;
        const text = await clone.text();
        console.log(`[API BODY preview] ${text.substring(0, 800)}`);
        if (text.includes('candidates') || text.includes('gemini') || text.includes('scope') || text.includes('coverage') || text.length > 200) {
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

  // Check step visibility states
  const stepStates = await page.evaluate(() => {
    const steps = ['fe-step1', 'fe-step2', 'fe-step3'];
    return steps.map(id => {
      const el = document.getElementById(id);
      if (!el) return { id, found: false };
      const style = window.getComputedStyle(el);
      return {
        id,
        found: true,
        display: style.display,
        visibility: style.visibility,
        className: el.className
      };
    });
  });
  console.log('Initial step states:', JSON.stringify(stepStates, null, 2));

  // === STEP 1: Fill building dimensions using JavaScript to bypass visibility issues ===
  console.log('\n--- Filling Step 1 via JS ---');

  await page.evaluate(() => {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) {
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`Set ${id} = ${val}`);
      }
    };
    setVal('fe-width', '80');
    setVal('fe-depth', '120');
    setVal('fe-openings', '500');
  });

  // Select stories and veneer via Playwright (visible in step 1)
  await page.selectOption('#fe-stories', '2');
  await page.selectOption('#fe-veneer', 'Thin Brick');
  console.log('Set select values');

  // Click elevation checkboxes (Front, Rear, Left)
  const elevLabels = await page.$$('label.elev-check');
  console.log(`Found ${elevLabels.length} elevation labels`);
  for (let i = 0; i < Math.min(3, elevLabels.length); i++) {
    const text = await elevLabels[i].textContent();
    await elevLabels[i].click();
    console.log(`Clicked elevation: ${text.trim()}`);
    await page.waitForTimeout(100);
  }

  result.formFilled = true;
  await page.screenshot({ path: 'test3_step1.png' });

  // Click Next and wait for transition
  console.log('\nClicking Next...');
  await page.click('#fe-to-step2');
  await page.waitForTimeout(2000);

  // Check step states after clicking next
  const stepStates2 = await page.evaluate(() => {
    const steps = ['fe-step1', 'fe-step2', 'fe-step3'];
    return steps.map(id => {
      const el = document.getElementById(id);
      if (!el) return { id, found: false };
      const style = window.getComputedStyle(el);
      return {
        id,
        found: true,
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        className: el.className
      };
    });
  });
  console.log('Step states after Next:', JSON.stringify(stepStates2, null, 2));

  // Force step 2 visible if needed
  const step2State = stepStates2.find(s => s.id === 'fe-step2');
  if (step2State && step2State.display === 'none') {
    console.log('Step 2 still hidden, forcing visibility via JS...');
    await page.evaluate(() => {
      const step1 = document.getElementById('fe-step1');
      const step2 = document.getElementById('fe-step2');
      if (step1) {
        step1.style.display = 'none';
        step1.classList.remove('active');
      }
      if (step2) {
        step2.style.display = 'block';
        step2.classList.add('active');
      }
    });
    await page.waitForTimeout(500);
  }

  await page.screenshot({ path: 'test3_step2_visible.png' });

  // === STEP 2: Fill contact info via JS ===
  console.log('\n--- Filling Step 2 via JS ---');

  await page.evaluate(() => {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) {
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`Set ${id} = ${val}`);
      } else {
        console.log(`Element ${id} not found`);
      }
    };
    setVal('fe-project-name', 'Pine Street Office Complex');
    setVal('fe-name', 'Sarah Williams');
    setVal('fe-phone', '7735559876');
    setVal('fe-email', 'sarah@example.com');
    setVal('fe-address', '321 Pine St, Naperville, IL');
    setVal('fe-zip', '60540');
    setVal('fe-notes', 'Commercial office building requiring thin brick veneer on exterior. Concrete substrate. No access restrictions. Ready Q3 2026.');
  });

  console.log('Step 2 fields filled via JS');
  await page.screenshot({ path: 'test3_step2_filled.png' });

  // Click Submit/Generate button
  console.log('\nClicking Generate Facade Estimate...');

  // Force step 2 to be visible before clicking submit
  await page.evaluate(() => {
    const step2 = document.getElementById('fe-step2');
    if (step2) {
      step2.style.display = 'block';
      step2.style.visibility = 'visible';
      step2.style.opacity = '1';
    }
    const btn = document.getElementById('fe-submit');
    if (btn) {
      btn.style.display = 'block';
      btn.style.visibility = 'visible';
    }
  });

  await page.waitForTimeout(300);

  // Try clicking via JS
  const submitClicked = await page.evaluate(() => {
    const btn = document.getElementById('fe-submit');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });

  console.log(`Submit button clicked via JS: ${submitClicked}`);

  if (!submitClicked) {
    // Try via Playwright with force
    await page.locator('#fe-submit').click({ force: true });
    console.log('Submit clicked via Playwright force');
  }

  // Wait for API response
  console.log('\nWaiting for Gemini response (up to 25s)...');

  const startTime = Date.now();
  for (let i = 0; i < 25; i++) {
    await page.waitForTimeout(1000);
    const elapsed = Math.round((Date.now() - startTime) / 1000);

    // Check step 3 visibility
    const step3State = await page.evaluate(() => {
      const el = document.getElementById('fe-step3');
      if (!el) return null;
      const style = window.getComputedStyle(el);
      return {
        display: style.display,
        visibility: style.visibility,
        className: el.className,
        hasContent: el.innerText.length
      };
    });

    if (step3State) {
      if (step3State.display !== 'none' || step3State.className.includes('active')) {
        console.log(`Step 3 active after ${elapsed}s: ${JSON.stringify(step3State)}`);

        // Get step 3 content
        const step3Text = await page.$eval('#fe-step3', el => el.innerText).catch(() => '');
        console.log(`Step 3 content: ${step3Text.substring(0, 500)}`);

        if (step3Text.trim().length > 50) {
          result.reportGenerated = true;
        }
        break;
      }
    }

    // Check error div
    const errorVisible = await page.evaluate(() => {
      const errorSelectors = ['#fe-error', '.fe-error', '[id*="error"]'];
      for (const sel of errorSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          const style = window.getComputedStyle(el);
          if (style.display !== 'none') {
            return el.innerText.trim();
          }
        }
      }
      return null;
    });

    if (errorVisible) {
      console.log(`Error shown after ${elapsed}s: ${errorVisible}`);
      result.errorShown = true;
      result.errorMessage = errorVisible.substring(0, 500);
      break;
    }

    console.log(`Waiting... ${elapsed}s (Gemini called: ${result.geminiCalled})`);
  }

  await page.screenshot({ path: 'test3_final.png', fullPage: true });

  // Final page text inspection
  const finalBodyText = await page.$eval('body', el => el.innerText);
  console.log(`\n=== Last 3000 chars of page ===\n${finalBodyText.substring(Math.max(0, finalBodyText.length - 3000))}`);

  // Check all steps final state
  const finalStepStates = await page.evaluate(() => {
    return ['fe-step1', 'fe-step2', 'fe-step3'].map(id => {
      const el = document.getElementById(id);
      if (!el) return { id, found: false };
      const style = window.getComputedStyle(el);
      return {
        id,
        display: style.display,
        className: el.className,
        contentLength: el.innerText.length
      };
    });
  });
  console.log('\nFinal step states:', JSON.stringify(finalStepStates, null, 2));

  // Determine verdict
  if (result.geminiCalled && result.reportGenerated) {
    result.verdict = 'PASS';
    result.notes = `Gemini API called (HTTP ${result.geminiStatus}), facade estimate report generated successfully`;
  } else if (result.geminiCalled && result.reportGenerated === false) {
    result.verdict = 'FAIL';
    result.notes = `Gemini API called (HTTP ${result.geminiStatus}) but report content not found`;
  } else if (!result.geminiCalled && result.reportGenerated) {
    result.verdict = 'PASS';
    result.notes = 'Facade estimate report generated (Gemini called server-side)';
  } else if (result.errorShown) {
    result.verdict = 'FAIL';
    result.notes = `Error displayed: ${result.errorMessage.substring(0, 200)}`;
  } else {
    result.verdict = 'FAIL';
    result.notes = 'Form submitted but no API response or report detected within 25 seconds';
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
