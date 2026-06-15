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

  // Track network requests for Gemini API calls
  const geminiRequests = [];
  page.on('request', req => {
    if (req.url().includes('generativelanguage.googleapis.com')) {
      geminiRequests.push({ url: req.url(), method: req.method() });
      console.log('Gemini request detected:', req.url());
    }
  });
  page.on('response', async res => {
    if (res.url().includes('generativelanguage.googleapis.com')) {
      result.geminiCalled = true;
      result.geminiStatus = res.status();
      console.log('Gemini response status:', res.status());
    }
  });

  // Also intercept fetch/XHR to catch proxied calls
  page.on('request', req => {
    const url = req.url();
    if (url.includes('/api/') && (url.includes('gemini') || url.includes('generate') || url.includes('ai') || url.includes('assess'))) {
      console.log('API request:', url);
    }
  });
  page.on('response', async res => {
    const url = res.url();
    if (url.includes('/api/') && (url.includes('gemini') || url.includes('generate') || url.includes('ai') || url.includes('assess') || url.includes('mortar') || url.includes('tuck'))) {
      console.log('API response:', url, 'status:', res.status());
      result.geminiCalled = true;
      result.geminiStatus = res.status();
    }
  });

  console.log('Navigating to page...');
  await page.goto('https://ams-public-website-neon.vercel.app/services/tuckpointing-repointing', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  console.log('Page loaded, title:', await page.title());

  // Scroll down to find the tool
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(1000);

  // Look for the lead magnet tool / form
  // First, let's see what forms exist on the page
  const forms = await page.$$eval('form', forms => forms.map(f => ({
    id: f.id,
    classes: f.className,
    inputCount: f.querySelectorAll('input, select, textarea').length
  })));
  console.log('Forms found:', JSON.stringify(forms));

  // Look for tool/widget containers
  const toolContainers = await page.$$eval('[id*="tool"], [id*="form"], [id*="magnet"], [id*="assess"], [id*="mortar"], [class*="tool"], [class*="lead"], [class*="magnet"]', els =>
    els.map(el => ({ tag: el.tagName, id: el.id, classes: el.className.substring(0, 100) }))
  );
  console.log('Tool containers:', JSON.stringify(toolContainers.slice(0, 10)));

  // Scroll through the page to find the form
  for (let scrollY = 0; scrollY <= 5000; scrollY += 500) {
    await page.evaluate(y => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(200);
  }

  // Check all input fields on the page
  const inputs = await page.$$eval('input, select, textarea', els =>
    els.map(el => ({
      tag: el.tagName,
      type: el.type || '',
      id: el.id,
      name: el.name,
      placeholder: el.placeholder || '',
      visible: el.offsetParent !== null
    }))
  );
  console.log('All inputs:', JSON.stringify(inputs));

  // Scroll back to top and start filling form
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  // Try to find specific fields by common patterns
  // Name field
  const nameSelectors = ['input[id*="name" i]', 'input[name*="name" i]', 'input[placeholder*="name" i]', 'input[type="text"]:first-of-type'];
  let nameFilled = false;
  for (const sel of nameSelectors) {
    try {
      const el = await page.$(sel);
      if (el && await el.isVisible()) {
        await el.scrollIntoViewIfNeeded();
        await el.fill('Sarah Williams');
        console.log('Name filled with selector:', sel);
        nameFilled = true;
        break;
      }
    } catch(e) {}
  }

  // Phone field
  const phoneSelectors = ['input[id*="phone" i]', 'input[name*="phone" i]', 'input[placeholder*="phone" i]', 'input[type="tel"]'];
  for (const sel of phoneSelectors) {
    try {
      const el = await page.$(sel);
      if (el && await el.isVisible()) {
        await el.scrollIntoViewIfNeeded();
        await el.fill('7735559876');
        console.log('Phone filled with selector:', sel);
        break;
      }
    } catch(e) {}
  }

  // Email field
  const emailSelectors = ['input[id*="email" i]', 'input[name*="email" i]', 'input[type="email"]', 'input[placeholder*="email" i]'];
  for (const sel of emailSelectors) {
    try {
      const el = await page.$(sel);
      if (el && await el.isVisible()) {
        await el.scrollIntoViewIfNeeded();
        await el.fill('sarah@example.com');
        console.log('Email filled with selector:', sel);
        break;
      }
    } catch(e) {}
  }

  // Address field
  const addressSelectors = ['input[id*="address" i]', 'input[name*="address" i]', 'input[placeholder*="address" i]', 'input[placeholder*="street" i]'];
  for (const sel of addressSelectors) {
    try {
      const el = await page.$(sel);
      if (el && await el.isVisible()) {
        await el.scrollIntoViewIfNeeded();
        await el.fill('321 Pine St, Naperville, IL');
        console.log('Address filled with selector:', sel);
        break;
      }
    } catch(e) {}
  }

  // Zip field
  const zipSelectors = ['input[id*="zip" i]', 'input[name*="zip" i]', 'input[placeholder*="zip" i]', 'input[placeholder*="postal" i]'];
  for (const sel of zipSelectors) {
    try {
      const el = await page.$(sel);
      if (el && await el.isVisible()) {
        await el.scrollIntoViewIfNeeded();
        await el.fill('60540');
        console.log('Zip filled with selector:', sel);
        break;
      }
    } catch(e) {}
  }

  // Number fields - wall area, height, etc.
  const numberFields = await page.$$('input[type="number"]');
  console.log('Number fields found:', numberFields.length);
  const numberValues = [500, 10, 20, 5, 100];
  for (let i = 0; i < Math.min(numberFields.length, numberValues.length); i++) {
    try {
      const el = numberFields[i];
      if (await el.isVisible()) {
        await el.scrollIntoViewIfNeeded();
        await el.fill(String(numberValues[i]));
        console.log(`Number field ${i} filled with ${numberValues[i]}`);
      }
    } catch(e) {
      console.log(`Error filling number field ${i}:`, e.message);
    }
  }

  // Select/dropdown fields - pick first non-placeholder option
  const selects = await page.$$('select');
  console.log('Select fields found:', selects.length);
  for (const sel of selects) {
    try {
      if (await sel.isVisible()) {
        await sel.scrollIntoViewIfNeeded();
        const options = await sel.$$('option');
        if (options.length > 1) {
          const firstOption = await options[1].getAttribute('value');
          if (firstOption) {
            await sel.selectOption(firstOption);
            console.log('Select filled with option:', firstOption);
          }
        }
      }
    } catch(e) {
      console.log('Error with select:', e.message);
    }
  }

  // Textarea fields
  const textareas = await page.$$('textarea');
  console.log('Textarea fields found:', textareas.length);
  for (const ta of textareas) {
    try {
      if (await ta.isVisible()) {
        await ta.scrollIntoViewIfNeeded();
        await ta.fill('Mortar joints showing cracks and deterioration, approximately 50% of south-facing wall needs repointing. Some joints crumbling and missing sections noticed.');
        console.log('Textarea filled');
      }
    } catch(e) {}
  }

  // Custom checkboxes - click labels
  const checkboxLabels = await page.$$('label:has(input[type="checkbox"])');
  console.log('Checkbox labels found:', checkboxLabels.length);
  let checkboxesClicked = 0;
  for (let i = 0; i < Math.min(checkboxLabels.length, 5); i++) {
    try {
      if (await checkboxLabels[i].isVisible()) {
        await checkboxLabels[i].scrollIntoViewIfNeeded();
        await checkboxLabels[i].click();
        checkboxesClicked++;
        console.log(`Checkbox ${i} clicked`);
        await page.waitForTimeout(200);
      }
    } catch(e) {
      console.log(`Error clicking checkbox ${i}:`, e.message);
    }
  }

  // Also try standalone labels that might be for hidden checkboxes
  if (checkboxesClicked === 0) {
    const allLabels = await page.$$('label');
    console.log('All labels found:', allLabels.length);
    let labelCount = 0;
    for (const label of allLabels) {
      if (labelCount >= 5) break;
      try {
        const forAttr = await label.getAttribute('for');
        if (forAttr) {
          const input = await page.$(`#${forAttr}`);
          if (input) {
            const inputType = await input.getAttribute('type');
            if (inputType === 'checkbox' && await label.isVisible()) {
              await label.scrollIntoViewIfNeeded();
              await label.click();
              labelCount++;
              checkboxesClicked++;
              console.log(`Label for checkbox "${forAttr}" clicked`);
              await page.waitForTimeout(200);
            }
          }
        }
      } catch(e) {}
    }
  }

  result.formFilled = nameFilled || checkboxesClicked > 0;

  // Look for "Next" buttons (multi-step form)
  const nextButtons = await page.$$('button:has-text("Next"), button:has-text("next"), button:has-text("Continue"), a:has-text("Next")');
  console.log('Next buttons found:', nextButtons.length);

  if (nextButtons.length > 0) {
    console.log('Multi-step form detected, clicking Next...');
    for (const btn of nextButtons) {
      if (await btn.isVisible()) {
        await btn.scrollIntoViewIfNeeded();
        await btn.click();
        await page.waitForTimeout(1500);
        console.log('Clicked Next button');

        // Fill any new fields that appear
        const newInputs = await page.$$('input[type="number"]:visible');
        for (let i = 0; i < Math.min(newInputs.length, 3); i++) {
          try {
            await newInputs[i].fill(String([500, 10, 20][i]));
          } catch(e) {}
        }

        const newSelects = await page.$$('select:visible');
        for (const sel of newSelects) {
          try {
            const options = await sel.$$('option');
            if (options.length > 1) {
              const firstOpt = await options[1].getAttribute('value');
              if (firstOpt) await sel.selectOption(firstOpt);
            }
          } catch(e) {}
        }
      }
    }
  }

  // Take a screenshot before clicking generate
  await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\test_before_submit.png', fullPage: false });

  // Look for generate/calculate/analyze/submit button
  const generateButtonSelectors = [
    'button:has-text("Generate")',
    'button:has-text("Analyze")',
    'button:has-text("Calculate")',
    'button:has-text("Assess")',
    'button:has-text("Get")',
    'button:has-text("Submit")',
    'button:has-text("Check")',
    'button[type="submit"]',
    'input[type="submit"]'
  ];

  let buttonClicked = false;
  for (const sel of generateButtonSelectors) {
    try {
      const btn = await page.$(sel);
      if (btn && await btn.isVisible()) {
        const btnText = await btn.textContent();
        console.log('Found button:', btnText?.trim(), 'with selector:', sel);
        await btn.scrollIntoViewIfNeeded();
        await btn.click();
        console.log('Clicked generate button:', btnText?.trim());
        buttonClicked = true;
        break;
      }
    } catch(e) {}
  }

  if (!buttonClicked) {
    console.log('No generate button found, trying any visible button...');
    const allButtons = await page.$$('button');
    for (const btn of allButtons) {
      try {
        if (await btn.isVisible()) {
          const text = await btn.textContent();
          console.log('Button found:', text?.trim());
        }
      } catch(e) {}
    }
  }

  // Wait for Gemini response (up to 25 seconds)
  console.log('Waiting for AI response...');
  await page.waitForTimeout(25000);

  // Take screenshot after waiting
  await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\test_after_submit.png', fullPage: false });

  // Check for result elements
  const resultSelectors = [
    '[id*="result"]', '[id*="report"]', '[id*="output"]', '[id*="assessment"]',
    '[class*="result"]', '[class*="report"]', '[class*="output"]', '[class*="assessment"]',
    '[id*="success"]', '[class*="success"]'
  ];

  for (const sel of resultSelectors) {
    try {
      const el = await page.$(sel);
      if (el && await el.isVisible()) {
        const text = await el.textContent();
        if (text && text.trim().length > 50) {
          result.reportGenerated = true;
          console.log('Result element found:', sel, 'Text preview:', text.substring(0, 200));
          break;
        }
      }
    } catch(e) {}
  }

  // Check for error elements
  const errorSelectors = [
    '[id*="error"]', '[class*="error"]', '[class*="alert-danger"]', '[class*="alert-error"]',
    '.error', '.error-message', '[role="alert"]'
  ];

  for (const sel of errorSelectors) {
    try {
      const el = await page.$(sel);
      if (el && await el.isVisible()) {
        const text = await el.textContent();
        if (text && text.trim().length > 0) {
          result.errorShown = true;
          result.errorMessage = text.trim().substring(0, 500);
          console.log('Error element found:', sel, 'Text:', text.substring(0, 200));
          break;
        }
      }
    } catch(e) {}
  }

  // Also look for any text that indicates success or error
  const pageContent = await page.content();
  if (pageContent.includes('error') || pageContent.includes('Error')) {
    // More specific check
    const errorTexts = await page.$$eval('[class*="error"], [id*="error"]', els =>
      els.filter(el => el.offsetParent !== null && el.textContent.trim().length > 0)
         .map(el => el.textContent.trim().substring(0, 200))
    );
    if (errorTexts.length > 0) {
      result.errorShown = true;
      result.errorMessage = errorTexts[0];
      console.log('Error texts found:', errorTexts);
    }
  }

  // Check if Gemini was called via proxy API routes
  page.on('response', async res => {
    const url = res.url();
    if (url.includes('/api/')) {
      console.log('Late API response:', url, res.status());
    }
  });

  // Final screenshot
  await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\test_final.png', fullPage: true });

  // Determine verdict
  if (result.geminiCalled && result.reportGenerated) {
    result.verdict = "PASS";
    result.notes = `Gemini API called (status ${result.geminiStatus}), report generated successfully`;
  } else if (result.geminiCalled && !result.reportGenerated) {
    result.verdict = "FAIL";
    result.notes = `Gemini API called (status ${result.geminiStatus}) but no report appeared`;
  } else if (result.errorShown) {
    result.verdict = "FAIL";
    result.notes = `Error shown: ${result.errorMessage.substring(0, 200)}`;
  } else if (!buttonClicked) {
    result.verdict = "ERROR";
    result.notes = "Could not find or click generate/submit button";
  } else {
    result.verdict = "FAIL";
    result.notes = "Button clicked but Gemini API was not called and no report generated";
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
