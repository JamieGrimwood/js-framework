const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const minifyHtml = require('html-minifier').minify;
const { minify } = require("terser");
const JavaScriptObfuscator = require('javascript-obfuscator');

const pagesDir = path.join(__dirname, '../app/pages');
const publicDir = path.join(__dirname, '../app/public');
const outputPublic = path.join(__dirname, '../static')
const outputFilePath = path.join(__dirname, '../index.html');

const pages = [];

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

fs.readdir(outputPublic, async (err, files) => {
    files.forEach(file => {
        fse.remove(path.join(outputPublic, `/${file}`), function (err) {
            if (err) return console.log(err);
        });
    });
    fse.remove(outputFilePath, function (err) {
        if (err) return console.log(err);
    });
    await sleep(1000) // Allow files to delete
    console.log("Cleared static directory")
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
            content = Buffer.from(content, 'utf8').toString('base64');
            content = minifyHtml(content);
            pages.push({ path: `/${name}`, content });
        });

        const indexFile = fs.readFileSync(path.join(__dirname, '../src/index.js'), 'utf8');
        let output = `const pages = ${JSON.stringify(pages)};\n\n${indexFile}`;
        output = await minify(output);
        /*
        obfuscated = JavaScriptObfuscator.obfuscate(output.code,
            {
                compact: true,
                controlFlowFlattening: true,
                controlFlowFlatteningThreshold: 1,
                numbersToExpressions: true,
                simplify: true,
                stringArrayShuffle: true,
                splitStrings: true,
                stringArrayThreshold: 1
            }
        );
        output = obfuscated.getObfuscatedCode();
        */
        console.log(output)
        const html = `<body>
    <main></main>
    <script>
        ${output.code}
    </script>
</body>`
        fs.writeFileSync(outputFilePath, html, 'utf8');
        console.log(`Successfully compiled ${pages.length} pages`);

        fse.copy(publicDir, outputPublic, err => {
            if (err) return console.error(err)
            console.log('Coppied public files to static directory')
        })
    });
});