const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function generateIcons() {
    // Create icons directory if it doesn't exist
    const iconsDir = path.join(__dirname, 'icons');
    try {
        await fs.mkdir(iconsDir);
    } catch (error) {
        if (error.code !== 'EEXIST') throw error;
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Load the HTML template
    await page.setContent(await fs.readFile('icon_template.html', 'utf8'));
    
    // Generate icons in different sizes
    const sizes = [16, 32, 48, 128];
    
    for (const size of sizes) {
        await page.setViewport({ width: size, height: size });
        const iconPath = path.join(iconsDir, `icon${size}.png`);
        await page.screenshot({
            path: iconPath,
            omitBackground: true
        });
        console.log(`Generated ${size}x${size} icon`);
    }

    await browser.close();
    console.log('All icons generated successfully!');
}

generateIcons().catch(console.error); 