import {readFileSync,writeFileSync,readdirSync,mkdirSync} from 'node:fs';
const files=readdirSync('dist/assets');
const js=readFileSync('dist/assets/'+files.find(f=>f.endsWith('.js')),'utf8');
const css=readFileSync('dist/assets/'+files.find(f=>f.endsWith('.css')),'utf8');
mkdirSync('export',{recursive:true});
writeFileSync('export/index.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>KOWL — Coffee Caravan</title><style>${css}</style></head><body><div id="world"></div><div id="ui"></div><script type="module">${js.replaceAll('</script','<\\/script')}</script></body></html>`);
console.log('export/index.html ready: all 3D code and styles in one file.');
