const fs = require('fs');
const path = require('path');
const minifyHtml = require('html-minifier').minify;
const { minify } = require("terser");
const JavaScriptObfuscator = require('javascript-obfuscator');

const pagesDir = path.join(__dirname, '../pages');

const pages = [];

fs.readdir(pagesDir, async (err, files) => {
    if (err) {
        console.error(`Error reading pages directory: ${err}`);
        return;
    }

    files.forEach(file => {
        const filePath = path.join(pagesDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let name = file.slice(0, file.lastIndexOf('.'));
        if (name === 'index') {
            name = '';
        }
        content = minifyHtml(content);
        pages.push({ path: `/${name}`, content });
    });

    const outputFilePath = path.join(__dirname, '../static/build.js');
    const indexFile = fs.readFileSync(path.join(__dirname, '../src/index.js'), 'utf8');
    let output = `const pages = ${JSON.stringify(pages)};\n\n${indexFile}`;
    output = JavaScriptObfuscator.obfuscate(output).getObfuscatedCode();
    // We obfuscate the code so that the user can't just do router.navigate and access any page they wish.
    output = await minify(output);
    fs.writeFileSync(outputFilePath, output.code, 'utf8');

    console.log(`Successfully compiled ${pages.length} pages.`);
});