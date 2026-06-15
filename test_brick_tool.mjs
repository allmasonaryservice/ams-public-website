import { chromium } from 'playwright';

const TIMEOUT = 30000;

async function testBrickInstallationEstimator() {
  const result = {
    toolName: 'BrickInstallationEstimator',
    page: '/services/brick-installation',
    geminiCalled: false,
    geminiStatus: null,
    reportGenerated: false,
    errorShown: false,
    errorMessage: '',
    formFilled: false,
    verdict: 'ERROR',
    notes: ''
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Track network requests for Gemini API calls
  page.on('request', (request) => {
    if (request.url().includes('generativelanguage.googleapis.com')) {
      console.log('[NETWORK] Gemini API called:', request.url().substring(0, 100));
      result.geminiCalled = true;
    }
  });

  page.on('response', async (response) => {
    if (response.url().includes('generativelanguage.googleapis.com')) {
      result.geminiStatus = response.status();
      console.log('[NETWORK] Gemini API response status:', response.status());
    }
  });

  try {
    console.log('Loading page...');
    await page.goto('https://ams-public-website-neon.vercel.app/services/brick-installation', {
      waitUntil: 'networkidle',
      timeout: TIMEOUT
    });
    console.log('Page loaded.');

    // Scroll down to find the tool
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(1000);

    // Take a screenshot to see what's on the page
    await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\debug_brick_1.png', fullPage: false });
    console.log('Screenshot 1 saved.');

    // Look for the form / tool
    const allInputs = await page.$$('input, select, textarea');
    console.log(`Found ${allInputs.length} form fields on initial view.`);

    // Scroll to find the lead magnet tool
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(800);

    const formEl = await page.$('form');
    if (!formEl) {
      console.log('No <form> found, looking for tool container...');
    }

    // Find all visible inputs
    const inputs = await page.$$('input:visible, select:visible, textarea:visible');
    console.log(`Visible inputs: ${inputs.length}`);

    // Log all input names/ids/types/placeholders
    for (const inp of inputs) {
      const info = await inp.evaluate(el => ({
        tag: el.tagName,
        type: el.type,
        name: el.name,
        id: el.id,
        placeholder: el.placeholder,
        className: el.className.substring(0, 60)
      }));
      console.log('INPUT:', JSON.stringify(info));
    }

    // Look for step-based forms — find any "step" containers
    const stepContainers = await page.$$('[class*="step"], [id*="step"], [data-step]');
    console.log(`Step containers found: ${stepContainers.length}`);

    // Check for any section with the tool
    const toolSection = await page.$('[id*="estimator"], [id*="calculator"], [id*="tool"], [id*="magnet"], [class*="estimator"], [class*="calculator"]');
    if (toolSection) {
      const toolId = await toolSection.evaluate(el => el.id || el.className);
      console.log('Tool section found:', toolId);
      await toolSection.scrollIntoViewIfNeeded();
    }

    await page.screenshot({ path: 'C:\\Users\\Zilanee\\Desktop\\AMS_PUBLIC_WEBSITE\\debug_brick_2.png', fullPage: false });

    // Try to fill the form — start with name field
    const nameField = await page.$('input[name="name"], input[placeholder*="name" i], input[placeholder*="Name" i], input[id*="name"]');
    if (nameField) {
      await nameField.scrollIntoViewIfNeeded();
      await nameField.fill('Sarah Williams');
      console.log('Filled name field.');
    } else {
      console.log('Name field not found initially, will try after scrolling.');
    }

    // Get full page HTML structure to understand the tool
    const bodyText = await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) return form.innerHTML.substring(0, 5000);
      // Look for any section with inputs
      const sections = document.querySelectorAll('section, div[class*="tool"], div[class*="estimate"], div[class*="calc"]');
      for (const s of sections) {
        if (s.querySelectorAll('input, select').length > 2) {
          return s.innerHTML.substring(0, 5000);
        }
      }
      return document.body.innerHTML.substring(0, 3000);
    });
    console.log('Form/tool HTML preview:', bodyText.substring(0, 2000));

  } catch (err) {
    console.error('Error during initial load:', err.message);
    result.notes = 'Error during initial load: ' + err.message;
  }

  await browser.close();
  return result;
}

testBrickInstallationEstimator().then(r => {
  console.log('RESULT:', JSON.stringify(r, null, 2));
}).catch(err => {
  console.error('Fatal error:', err);
});
