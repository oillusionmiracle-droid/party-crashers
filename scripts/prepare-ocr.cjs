const fs=require('node:fs'),path=require('node:path');
const root=path.join(process.cwd(),'public/ocr');fs.mkdirSync(path.join(root,'core'),{recursive:true});
fs.copyFileSync(require.resolve('tesseract.js/dist/worker.min.js'),path.join(root,'worker.min.js'));
const core=path.dirname(require.resolve('tesseract.js-core/package.json'));
for(const name of ['tesseract-core.wasm.js','tesseract-core-simd.wasm.js','tesseract-core-lstm.wasm.js','tesseract-core-simd-lstm.wasm.js'])fs.copyFileSync(path.join(core,name),path.join(root,'core',name));
fs.copyFileSync(path.join(path.dirname(require.resolve('tesseract.js/package.json')),'LICENSE.md'),path.join(root,'TESSERACT-LICENSE'));
fs.copyFileSync(path.join(core,'LICENSE'),path.join(root,'CORE-LICENSE'));
console.log('Prepared pinned OCR worker and WebAssembly loaders.');
