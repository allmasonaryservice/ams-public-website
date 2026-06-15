import { chromium } from 'playwright';

const URL = 'https://ams-public-website-neon.vercel.app/services/chimney-fireplace';

let geminiCalled = false;
let geminiStatus = null;
let reportGenerated = false;
let errorShown = false;
let errorMessage = '';
let formFilled = false;
let notes = '';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

// Monitor network requests for Gemini API calls
page.on('response', async (response) => {
  const url = response.url();
  if (url.includes('generativelanguage.googleapis.com')) {
    geminiCalled = true;
    geminiStatus = response.status();
    console.log(`[NETWORK] Gemini API called: ${url} -> status ${geminiStatus}`);
  }
});

try {
  console.log('Loading page...');
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Page loaded');

  // Scroll down to find the tool
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(1000);

  // Take a screenshot to see the initial state
  await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\chimney_initial.png', fullPage: false });

  // Look for the form/tool - scroll down to find it
  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.waitForTimeout(500);

  // Find all form elements on the page
  const formElements = await page.$$eval('form, [id*="tool"], [id*="form"], [class*="tool"], [class*="form"]', els =>
    els.map(el => ({ tag: el.tagName, id: el.id, className: el.className.toString().substring(0, 100) }))
  );
  console.log('Form elements found:', JSON.stringify(formElements, null, 2));

  // Find input fields
  const inputs = await page.$$eval('input, select, textarea', els =>
    els.map(el => ({
      tag: el.tagName,
      type: el.type || '',
      id: el.id,
      name: el.name,
      placeholder: el.placeholder || '',
      className: el.className.toString().substring(0, 80)
    }))
  );
  console.log('Input fields found:', JSON.stringify(inputs, null, 2));

  // Try to fill form fields
  // Name field
  const nameSelectors = ['input[name="name"]', 'input[id*="name"]', 'input[placeholder*="name" i]', 'input[placeholder*="Name" i]'];
  let nameFilled = false;
  for (const sel of nameSelectors) {
    try {
      const el = await page.$(sel);
      if (el) {
        await el.fill('Sarah Williams');
        console.log(`Filled name with selector: ${sel}`);
        nameFilled = true;
        break;
      }
    } catch (e) {}
  }

  // Phone field
  const phoneSelectors = ['input[name="phone"]', 'input[id*="phone"]', 'input[placeholder*="phone" i]', 'input[type="tel"]'];
  for (const sel of phoneSelectors) {
    try {
      const el = await page.$(sel);
      if (el) {
        await el.fill('7735559876');
        console.log(`Filled phone with selector: ${sel}`);
        break;
      }
    } catch (e) {}
  }

  // Email field
  const emailSelectors = ['input[name="email"]', 'input[id*="email"]', 'input[type="email"]', 'input[placeholder*="email" i]'];
  for (const sel of emailSelectors) {
    try {
      const el = await page.$(sel);
      if (el) {
        await el.fill('sarah@example.com');
        console.log(`Filled email with selector: ${sel}`);
        break;
      }
    } catch (e) {}
  }

  // Address field
  const addressSelectors = ['input[name="address"]', 'input[id*="address"]', 'input[placeholder*="address" i]', 'input[placeholder*="Address" i]'];
  for (const sel of addressSelectors) {
    try {
      const el = await page.$(sel);
      if (el) {
        await el.fill('321 Pine St, Naperville, IL');
        console.log(`Filled address with selector: ${sel}`);
        break;
      }
    } catch (e) {}
  }

  // Zip field
  const zipSelectors = ['input[name="zip"]', 'input[id*="zip"]', 'input[placeholder*="zip" i]', 'input[placeholder*="ZIP" i]'];
  for (const sel of zipSelectors) {
    try {
      const el = await page.$(sel);
      if (el) {
        await el.fill('60540');
        console.log(`Filled zip with selector: ${sel}`);
        break;
      }
    } catch (e) {}
  }

  // Handle select dropdowns - pick first non-placeholder option
  const selects = await page.$$('select');
  console.log(`Found ${selects.length} select elements`);
  for (const select of selects) {
    try {
      const options = await select.$$eval('option', opts =>
        opts.map(o => ({ value: o.value, text: o.textContent?.trim() }))
      );
      console.log('Select options:', JSON.stringify(options));
      // Find first non-empty, non-placeholder option
      const validOption = options.find(o => o.value && o.value !== '' && !o.text?.toLowerCase().includes('select'));
      if (validOption) {
        await select.selectOption(validOption.value);
        console.log(`Selected option: ${validOption.text}`);
      }
    } catch (e) {
      console.log('Error handling select:', e.message);
    }
  }

  // Handle checkboxes - click labels
  const labels = await page.$$('label');
  console.log(`Found ${labels.length} label elements`);
  let checkboxCount = 0;
  for (const label of labels) {
    if (checkboxCount >= 5) break;
    try {
      const forAttr = await label.getAttribute('for');
      const text = await label.textContent();
      // Find labels associated with checkboxes
      let isCheckboxLabel = false;
      if (forAttr) {
        const input = await page.$(`#${forAttr}`);
        if (input) {
          const type = await input.getAttribute('type');
          if (type === 'checkbox') isCheckboxLabel = true;
        }
      }
      // Also check for checkbox-like labels (custom styled)
      const hasCheckboxChild = await label.$('input[type="checkbox"]');
      if (hasCheckboxChild) isCheckboxLabel = true;

      if (isCheckboxLabel && text?.trim()) {
        await label.click();
        console.log(`Clicked checkbox label: ${text?.trim()?.substring(0, 50)}`);
        checkboxCount++;
        await page.waitForTimeout(200);
      }
    } catch (e) {
      console.log('Error clicking label:', e.message);
    }
  }

  await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\chimney_filled.png', fullPage: false });

  // Look for number inputs and fill them
  const numberInputs = await page.$$('input[type="number"]');
  console.log(`Found ${numberInputs.length} number inputs`);
  for (const input of numberInputs) {
    try {
      const id = await input.getAttribute('id');
      const name = await input.getAttribute('name');
      const placeholder = await input.getAttribute('placeholder');
      console.log(`Number input: id=${id}, name=${name}, placeholder=${placeholder}`);
      await input.fill('500');
    } catch (e) {}
  }

  // Look for textarea
  const textareas = await page.$$('textarea');
  for (const textarea of textareas) {
    try {
      await textarea.fill('Two-story brick chimney, about 20 years old. Last inspected 5 years ago.');
      console.log('Filled textarea');
    } catch (e) {}
  }

  // Check if this is a multi-step form - look for Next button
  const nextButton = await page.$('button:has-text("Next"), button:has-text("next"), [class*="next"]');
  if (nextButton) {
    console.log('Found Next button - this is multi-step form');
    await nextButton.click();
    await page.waitForTimeout(1500);

    // Fill step 2 fields
    const step2Inputs = await page.$$('input:visible, select:visible');
    console.log(`Step 2 inputs: ${step2Inputs.length}`);

    // Look for more Next buttons
    const nextButton2 = await page.$('button:has-text("Next"), button:has-text("next")');
    if (nextButton2) {
      await nextButton2.click();
      await page.waitForTimeout(1500);
    }
  }

  formFilled = nameFilled || checkboxCount > 0;

  await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\chimney_before_submit.png', fullPage: false });

  // Find and click the generate/submit button
  const submitSelectors = [
    'button[type="submit"]',
    'button:has-text("Generate")',
    'button:has-text("Analyze")',
    'button:has-text("Calculate")',
    'button:has-text("Get")',
    'button:has-text("Check")',
    'button:has-text("Inspect")',
    'button:has-text("Submit")',
    '[class*="submit"]',
    '[id*="submit"]',
    '[id*="generate"]',
  ];

  let submitClicked = false;
  for (const sel of submitSelectors) {
    try {
      const btn = await page.$(sel);
      if (btn) {
        const text = await btn.textContent();
        const isVisible = await btn.isVisible();
        console.log(`Found submit button: "${text?.trim()}" visible=${isVisible}`);
        if (isVisible) {
          await btn.click();
          console.log(`Clicked submit button: ${sel}`);
          submitClicked = true;
          break;
        }
      }
    } catch (e) {}
  }

  if (!submitClicked) {
    console.log('No submit button found, looking for all buttons...');
    const allButtons = await page.$$eval('button', btns =>
      btns.map(b => ({ text: b.textContent?.trim(), id: b.id, className: b.className.toString().substring(0, 80), visible: b.offsetParent !== null }))
    );
    console.log('All buttons:', JSON.stringify(allButtons, null, 2));
  }

  // Wait for Gemini response (up to 25 seconds)
  console.log('Waiting for Gemini response...');
  const startTime = Date.now();
  let resultFound = false;

  while (Date.now() - startTime < 25000) {
    await page.waitForTimeout(1000);

    // Check for result elements
    const resultEl = await page.$('[id*="result"], [class*="result"], [id*="output"], [class*="output"], [id*="report"], [class*="report"]');
    if (resultEl) {
      const text = await resultEl.textContent();
      if (text && text.trim().length > 100) {
        console.log('Result found! Length:', text.length);
        console.log('Result preview:', text.substring(0, 200));
        reportGenerated = true;
        resultFound = true;
        break;
      }
    }

    // Check for error elements
    const errorEl = await page.$('[id*="error"], [class*="error"]');
    if (errorEl) {
      const text = await errorEl.textContent();
      if (text && text.trim().length > 5) {
        const isVisible = await errorEl.isVisible();
        if (isVisible) {
          errorShown = true;
          errorMessage = text.trim().substring(0, 200);
          console.log('Error found:', errorMessage);
          break;
        }
      }
    }

    // Check if Gemini was called
    if (geminiCalled) {
      console.log(`Gemini was called with status ${geminiStatus}, waiting for result to render...`);
    }

    console.log(`Waiting... ${Math.round((Date.now() - startTime) / 1000)}s elapsed`);
  }

  await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\chimney_result.png', fullPage: true });

  // Final check for any visible content that looks like a report
  if (!reportGenerated) {
    const pageContent = await page.content();
    if (pageContent.includes('chimney') && (pageContent.includes('inspection') || pageContent.includes('recommend') || pageContent.includes('result'))) {
      // Look for dynamically added content
      const allText = await page.evaluate(() => document.body.innerText);
      if (allText.length > 2000) {
        console.log('Page has substantial content, checking for report...');
      }
    }

    // Check for result via text content
    const resultTexts = await page.$$eval('*', els =>
      els.filter(el => {
        const text = el.textContent || '';
        return text.length > 200 && (
          text.includes('chimney') || text.includes('inspection') || text.includes('recommend')
        ) && el.children.length < 5;
      }).slice(0, 3).map(el => ({
        tag: el.tagName,
        id: el.id,
        text: el.textContent?.substring(0, 300)
      }))
    );
    if (resultTexts.length > 0) {
      console.log('Potential result elements:', JSON.stringify(resultTexts, null, 2));
    }
  }

  // Generate notes
  if (geminiCalled && reportGenerated) {
    notes = `Form filled successfully. Gemini API called (HTTP ${geminiStatus}). Report/checklist generated and displayed.`;
  } else if (geminiCalled && !reportGenerated) {
    notes = `Gemini API called (HTTP ${geminiStatus}) but no report visible in DOM after 25s.`;
  } else if (errorShown) {
    notes = `Error shown: ${errorMessage}`;
  } else if (!submitClicked) {
    notes = 'Could not find or click the submit/generate button.';
  } else {
    notes = 'Form submitted but no Gemini API call detected and no result/error found within 25s.';
  }

} catch (err) {
  console.error('Script error:', err);
  notes = `Script error: ${err.message}`;
  errorShown = true;
  errorMessage = err.message;
} finally {
  await browser.close();
}

const result = {
  toolName: 'ChimneyInspectionChecklist',
  page: '/services/chimney-fireplace',
  geminiCalled,
  geminiStatus,
  reportGenerated,
  errorShown,
  errorMessage,
  formFilled,
  verdict: reportGenerated && geminiCalled && geminiStatus === 200 ? 'PASS' : (errorShown ? 'FAIL' : (geminiCalled ? 'FAIL' : 'ERROR')),
  notes
};

console.log('\n=== FINAL RESULT ===');
console.log(JSON.stringify(result, null, 2));
