import { chromium } from 'playwright';

const TARGET_URL = 'https://ams-public-website-neon.vercel.app/services/cmu-block-installation';

let geminiCalled = false;
let geminiStatus = null;
let reportGenerated = false;
let errorShown = false;
let errorMessage = '';
let formFilled = false;
const notes = [];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

// Monitor network requests for Gemini API calls
page.on('response', async (response) => {
  const url = response.url();
  if (url.includes('generativelanguage.googleapis.com')) {
    geminiCalled = true;
    geminiStatus = response.status();
    notes.push(`Gemini API called: ${url.substring(0, 80)}... status=${geminiStatus}`);
  }
});

try {
  console.log('Navigating to page...');
  await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Page loaded');

  // Scroll down to find the tool
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(1000);

  // Take a screenshot to see what's on the page
  await page.screenshot({ path: 'cmu_initial.png', fullPage: false });

  // Look for the form/tool - scroll down more
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'cmu_scrolled.png', fullPage: false });

  // Find all form elements on the page
  const formInfo = await page.evaluate(() => {
    const forms = document.querySelectorAll('form');
    const inputs = document.querySelectorAll('input, select, textarea');
    const buttons = document.querySelectorAll('button');

    return {
      formCount: forms.length,
      inputs: Array.from(inputs).map(el => ({
        tag: el.tagName,
        type: el.type || '',
        name: el.name || '',
        id: el.id || '',
        placeholder: el.placeholder || '',
        className: el.className?.substring(0, 50) || ''
      })),
      buttons: Array.from(buttons).map(b => ({
        text: b.textContent?.trim().substring(0, 50),
        id: b.id || '',
        type: b.type || ''
      }))
    };
  });

  console.log('Form info:', JSON.stringify(formInfo, null, 2));
  notes.push(`Found ${formInfo.formCount} forms, ${formInfo.inputs.length} inputs, ${formInfo.buttons.length} buttons`);

  // Scroll to find the tool section
  await page.evaluate(() => window.scrollTo(0, 3000));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'cmu_deep.png', fullPage: false });

  // Look for lead magnet tool section
  const toolSection = await page.evaluate(() => {
    // Look for sections with "calculate", "estimate", "tool", "form" etc.
    const allText = document.body.innerText;
    const hasCalculator = allText.toLowerCase().includes('calculat') || allText.toLowerCase().includes('estimat');

    // Find divs/sections with IDs or classes related to tools
    const toolDivs = Array.from(document.querySelectorAll('[id*="tool"], [id*="calc"], [id*="estimate"], [id*="lead"], [class*="tool"], [class*="calc"]'));

    return {
      hasCalculatorText: hasCalculator,
      toolDivs: toolDivs.map(d => ({ tag: d.tagName, id: d.id, class: d.className?.substring(0, 60) }))
    };
  });
  console.log('Tool section info:', JSON.stringify(toolSection, null, 2));

  // Get full page HTML structure to understand the form
  const pageStructure = await page.evaluate(() => {
    const sections = document.querySelectorAll('section, [data-section], [id]');
    return Array.from(sections).map(s => ({
      tag: s.tagName,
      id: s.id || '',
      class: s.className?.substring(0, 80) || ''
    })).filter(s => s.id || s.class);
  });
  console.log('Page sections:', JSON.stringify(pageStructure.slice(0, 30), null, 2));

  // Scroll to bottom to find all content
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'cmu_bottom.png', fullPage: false });

  // Get all interactive elements
  const allInteractive = await page.evaluate(() => {
    const elements = document.querySelectorAll('input, select, textarea, button, label');
    return Array.from(elements).map(el => ({
      tag: el.tagName,
      type: el.getAttribute('type') || '',
      id: el.id || '',
      name: el.getAttribute('name') || '',
      placeholder: el.getAttribute('placeholder') || '',
      text: el.textContent?.trim().substring(0, 60) || '',
      for: el.getAttribute('for') || '',
      className: el.className?.substring(0, 60) || ''
    }));
  });
  console.log('All interactive elements:', JSON.stringify(allInteractive, null, 2));

  // Try to find and interact with the multi-step form
  // First, look for name field
  const nameSelectors = [
    'input[name="name"]',
    'input[id*="name"]',
    'input[placeholder*="name" i]',
    'input[placeholder*="Name" i]'
  ];

  let nameField = null;
  for (const sel of nameSelectors) {
    const el = await page.$(sel);
    if (el) { nameField = el; notes.push(`Found name field: ${sel}`); break; }
  }

  if (nameField) {
    await nameField.fill('Sarah Williams');
    console.log('Filled name field');
    formFilled = true;
  } else {
    console.log('Name field not found initially, will try after step navigation');
  }

  // Try step 1 inputs - look for any visible inputs
  const step1 = await page.evaluate(() => {
    const visibleInputs = Array.from(document.querySelectorAll('input, select, textarea')).filter(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && el.type !== 'hidden';
    });
    return visibleInputs.map(el => ({
      tag: el.tagName,
      type: el.type || '',
      id: el.id || '',
      name: el.name || '',
      placeholder: el.placeholder || ''
    }));
  });
  console.log('Visible inputs step 1:', JSON.stringify(step1, null, 2));

  // Fill visible inputs
  for (const input of step1) {
    try {
      const sel = input.id ? `#${input.id}` : `input[name="${input.name}"]`;
      if (!sel || sel === '#' || sel === 'input[name=""]') continue;

      if (input.type === 'text' || input.type === 'email' || input.type === 'tel' || input.type === '') {
        const ph = (input.placeholder || '').toLowerCase();
        const nm = (input.name || '').toLowerCase();
        const id = (input.id || '').toLowerCase();

        let value = 'Sarah Williams';
        if (ph.includes('email') || nm.includes('email') || id.includes('email')) value = 'sarah@example.com';
        else if (ph.includes('phone') || nm.includes('phone') || id.includes('phone')) value = '7735559876';
        else if (ph.includes('address') || nm.includes('address') || id.includes('address')) value = '321 Pine St, Naperville, IL';
        else if (ph.includes('zip') || nm.includes('zip') || id.includes('zip')) value = '60540';
        else if (ph.includes('name') || nm.includes('name') || id.includes('name')) value = 'Sarah Williams';

        await page.fill(sel, value);
        console.log(`Filled ${sel} with "${value}"`);
        formFilled = true;
      } else if (input.tag === 'SELECT') {
        const options = await page.evaluate((s) => {
          const el = document.querySelector(s);
          if (!el) return [];
          return Array.from(el.options).map(o => ({ value: o.value, text: o.text }));
        }, sel);
        if (options.length > 1) {
          await page.selectOption(sel, options[1].value);
          console.log(`Selected option in ${sel}: ${options[1].text}`);
        }
      }
    } catch (e) {
      console.log(`Error filling ${input.id || input.name}: ${e.message}`);
    }
  }

  await page.screenshot({ path: 'cmu_filled_step1.png' });

  // Look for Next button
  const nextBtn = await page.$('button:has-text("Next"), button:has-text("Continue"), button[id*="next"]');
  if (nextBtn) {
    await nextBtn.click();
    console.log('Clicked Next button');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'cmu_step2.png' });
  }

  // Check for step 2 inputs
  const step2 = await page.evaluate(() => {
    const visibleInputs = Array.from(document.querySelectorAll('input, select, textarea')).filter(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && el.type !== 'hidden';
    });
    return visibleInputs.map(el => ({
      tag: el.tagName,
      type: el.type || '',
      id: el.id || '',
      name: el.name || '',
      placeholder: el.placeholder || ''
    }));
  });
  console.log('Visible inputs step 2:', JSON.stringify(step2, null, 2));

  // Fill step 2 inputs
  for (const input of step2) {
    try {
      const sel = input.id ? `#${input.id}` : `${input.tag.toLowerCase()}[name="${input.name}"]`;
      if (!sel || sel === '#' || sel.endsWith('[name=""]')) continue;

      if (input.type === 'number') {
        const nm = (input.name || '').toLowerCase();
        const id = (input.id || '').toLowerCase();
        let value = '500';
        if (nm.includes('height') || id.includes('height')) value = '10';
        else if (nm.includes('length') || id.includes('length')) value = '50';
        else if (nm.includes('width') || id.includes('width')) value = '20';
        else if (nm.includes('area') || id.includes('area')) value = '500';
        else if (nm.includes('thick') || id.includes('thick')) value = '8';
        await page.fill(sel, value);
        console.log(`Filled number ${sel} with "${value}"`);
        formFilled = true;
      } else if (input.type === 'text' || input.type === 'email' || input.type === 'tel' || input.type === '') {
        const ph = (input.placeholder || '').toLowerCase();
        const nm = (input.name || '').toLowerCase();
        const id = (input.id || '').toLowerCase();

        let value = 'Sarah Williams';
        if (ph.includes('email') || nm.includes('email') || id.includes('email')) value = 'sarah@example.com';
        else if (ph.includes('phone') || nm.includes('phone') || id.includes('phone')) value = '7735559876';
        else if (ph.includes('address') || nm.includes('address') || id.includes('address')) value = '321 Pine St, Naperville, IL';
        else if (ph.includes('zip') || nm.includes('zip') || id.includes('zip')) value = '60540';
        else if (ph.includes('name') || nm.includes('name') || id.includes('name')) value = 'Sarah Williams';

        await page.fill(sel, value);
        console.log(`Filled ${sel} with "${value}"`);
        formFilled = true;
      } else if (input.tag === 'SELECT') {
        const options = await page.evaluate((s) => {
          const el = document.querySelector(s);
          if (!el) return [];
          return Array.from(el.options).map(o => ({ value: o.value, text: o.text }));
        }, sel);
        if (options.length > 1) {
          await page.selectOption(sel, options[1].value);
          console.log(`Selected option in ${sel}: ${options[1].text}`);
        }
      }
    } catch (e) {
      console.log(`Error filling step2 ${input.id || input.name}: ${e.message}`);
    }
  }

  // Handle checkboxes - click labels
  const checkboxLabels = await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('label')).filter(label => {
      const input = label.querySelector('input[type="checkbox"]') ||
                    document.querySelector(`input[type="checkbox"][id="${label.getAttribute('for')}"]`);
      if (!input) return false;
      const rect = label.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    return labels.map(l => ({
      text: l.textContent?.trim().substring(0, 50),
      for: l.getAttribute('for') || '',
      id: l.id || ''
    })).slice(0, 5);
  });

  console.log('Checkbox labels found:', JSON.stringify(checkboxLabels, null, 2));

  let checkboxCount = 0;
  for (const label of checkboxLabels) {
    if (checkboxCount >= 4) break;
    try {
      if (label.for) {
        await page.click(`label[for="${label.for}"]`);
      } else if (label.id) {
        await page.click(`label#${label.id}`);
      } else {
        // Click by text
        await page.click(`label:has-text("${label.text}")`);
      }
      checkboxCount++;
      console.log(`Clicked checkbox label: ${label.text}`);
      formFilled = true;
    } catch (e) {
      console.log(`Error clicking checkbox label: ${e.message}`);
    }
  }

  // Click another Next if available
  const nextBtn2 = await page.$('button:has-text("Next"), button:has-text("Continue")');
  if (nextBtn2) {
    await nextBtn2.click();
    console.log('Clicked Next button step 2');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'cmu_step3.png' });
  }

  // Fill step 3 if any
  const step3 = await page.evaluate(() => {
    const visibleInputs = Array.from(document.querySelectorAll('input, select, textarea')).filter(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && el.type !== 'hidden';
    });
    return visibleInputs.map(el => ({
      tag: el.tagName,
      type: el.type || '',
      id: el.id || '',
      name: el.name || '',
      placeholder: el.placeholder || ''
    }));
  });
  console.log('Visible inputs step 3:', JSON.stringify(step3, null, 2));

  for (const input of step3) {
    try {
      const sel = input.id ? `#${input.id}` : `${input.tag.toLowerCase()}[name="${input.name}"]`;
      if (!sel || sel === '#' || sel.endsWith('[name=""]')) continue;

      if (input.type === 'number') {
        const nm = (input.name || '').toLowerCase();
        const id = (input.id || '').toLowerCase();
        let value = '500';
        if (nm.includes('height') || id.includes('height')) value = '10';
        else if (nm.includes('length') || id.includes('length')) value = '50';
        else if (nm.includes('area') || id.includes('area')) value = '500';
        await page.fill(sel, value);
        console.log(`Filled number ${sel} with "${value}"`);
        formFilled = true;
      } else if (input.type === 'text' || input.type === 'email' || input.type === 'tel' || input.type === '') {
        const ph = (input.placeholder || '').toLowerCase();
        const nm = (input.name || '').toLowerCase();
        const id = (input.id || '').toLowerCase();

        let value = 'Sarah Williams';
        if (ph.includes('email') || nm.includes('email') || id.includes('email')) value = 'sarah@example.com';
        else if (ph.includes('phone') || nm.includes('phone') || id.includes('phone')) value = '7735559876';
        else if (ph.includes('address') || nm.includes('address') || id.includes('address')) value = '321 Pine St, Naperville, IL';
        else if (ph.includes('zip') || nm.includes('zip') || id.includes('zip')) value = '60540';
        else if (ph.includes('name') || nm.includes('name') || id.includes('name')) value = 'Sarah Williams';

        await page.fill(sel, value);
        console.log(`Filled ${sel} with "${value}"`);
        formFilled = true;
      } else if (input.tag === 'SELECT') {
        const options = await page.evaluate((s) => {
          const el = document.querySelector(s);
          if (!el) return [];
          return Array.from(el.options).map(o => ({ value: o.value, text: o.text }));
        }, sel);
        if (options.length > 1) {
          await page.selectOption(sel, options[1].value);
          console.log(`Selected option in ${sel}: ${options[1].text}`);
        }
      }
    } catch (e) {
      console.log(`Error filling step3 input: ${e.message}`);
    }
  }

  await page.screenshot({ path: 'cmu_before_submit.png' });

  // Find and click the submit/generate button
  const submitSelectors = [
    'button:has-text("Generate")',
    'button:has-text("Calculate")',
    'button:has-text("Analyze")',
    'button:has-text("Get")',
    'button:has-text("Submit")',
    'button[type="submit"]',
    'button:has-text("Get My")',
    'button:has-text("Get Free")',
  ];

  let submitBtn = null;
  for (const sel of submitSelectors) {
    try {
      submitBtn = await page.$(sel);
      if (submitBtn) {
        const isVisible = await submitBtn.isVisible();
        if (isVisible) {
          notes.push(`Found submit button: ${sel}`);
          break;
        }
        submitBtn = null;
      }
    } catch (e) {}
  }

  if (submitBtn) {
    console.log('Clicking submit button...');
    await submitBtn.click();
    notes.push('Clicked generate/submit button');

    // Wait for Gemini API call and result
    console.log('Waiting for Gemini API response (up to 25 seconds)...');

    try {
      await Promise.race([
        page.waitForResponse(resp => resp.url().includes('generativelanguage.googleapis.com'), { timeout: 25000 }),
        page.waitForSelector('[id*="result"], [id*="report"], [class*="result"], [class*="report"]', { timeout: 25000 })
      ]);
    } catch (e) {
      console.log('Timeout waiting for response/result:', e.message);
    }

    await page.waitForTimeout(3000);
  } else {
    notes.push('No submit button found');
    console.log('No submit button found');
  }

  await page.screenshot({ path: 'cmu_after_submit.png', fullPage: true });

  // Check for results
  const resultCheck = await page.evaluate(() => {
    const resultEls = document.querySelectorAll('[id*="result"], [class*="result"], [id*="report"], [class*="report"], [id*="output"]');
    const errorEls = document.querySelectorAll('[id*="error"], [class*="error"]');

    const body = document.body.innerText;
    const hasResultContent = body.includes('sq ft') || body.includes('blocks') || body.includes('CMU') ||
                              body.includes('estimate') || body.includes('cost') || body.includes('$') ||
                              body.includes('recommendation') || body.includes('Analysis');

    return {
      resultElements: Array.from(resultEls).map(el => ({
        id: el.id,
        class: el.className?.substring(0, 60),
        text: el.textContent?.trim().substring(0, 100),
        visible: el.getBoundingClientRect().width > 0
      })),
      errorElements: Array.from(errorEls).map(el => ({
        id: el.id,
        text: el.textContent?.trim().substring(0, 100),
        visible: el.getBoundingClientRect().width > 0
      })).filter(e => e.visible && e.text),
      hasResultContent,
      pageText: body.substring(0, 500)
    };
  });

  console.log('Result check:', JSON.stringify(resultCheck, null, 2));

  if (resultCheck.resultElements.some(el => el.visible && el.text && el.text.length > 20)) {
    reportGenerated = true;
    notes.push('Result/report section found with content');
  }

  if (resultCheck.hasResultContent) {
    reportGenerated = true;
    notes.push('Page has result content (CMU/blocks/cost)');
  }

  if (resultCheck.errorElements.length > 0) {
    errorShown = true;
    errorMessage = resultCheck.errorElements[0].text || 'Error shown on page';
    notes.push(`Error shown: ${errorMessage}`);
  }

} catch (e) {
  console.error('Script error:', e);
  notes.push(`Script error: ${e.message}`);
} finally {
  await browser.close();
}

const result = {
  toolName: 'CMULoadCalculator',
  page: '/services/cmu-block-installation',
  geminiCalled,
  geminiStatus,
  reportGenerated,
  errorShown,
  errorMessage,
  formFilled,
  verdict: geminiCalled && reportGenerated ? 'PASS' : (errorShown ? 'FAIL' : 'ERROR'),
  notes: notes.join('; ')
};

console.log('\n=== FINAL RESULT ===');
console.log(JSON.stringify(result, null, 2));
