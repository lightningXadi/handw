#!/usr/bin/env node
// Run this whenever you add new letter images to the alaphabet/ folder:
//   node build_data.js

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const folder  = path.join(__dirname, 'alaphabet');
const outFile = path.join(__dirname, 'letters_data.js');

if (!fs.existsSync(folder)) {
  console.error('\n   alaphabet/ folder not found!'); process.exit(1);
}

// Full character to filename-prefix mapping
const CHAR_MAP = {
  'a':'a','b':'b','c':'c','d':'d','e':'e','f':'f','g':'g','h':'h','i':'i',
  'j':'j','k':'k','l':'l','m':'m','n':'n','o':'o','p':'p','q':'q','r':'r',
  's':'s','t':'t','u':'u','v':'v','w':'w','x':'x','y':'y','z':'z',
  'A':'upper_a','B':'upper_b','C':'upper_c','D':'upper_d','E':'upper_e',
  'F':'upper_f','G':'upper_g','H':'upper_h','I':'upper_i','J':'upper_j',
  'K':'upper_k','L':'upper_l','M':'upper_m','N':'upper_n','O':'upper_o',
  'P':'upper_p','Q':'upper_q','R':'upper_r','S':'upper_s','T':'upper_t',
  'U':'upper_u','V':'upper_v','W':'upper_w','X':'upper_x','Y':'upper_y',
  'Z':'upper_z',
  '0':'num_0','1':'num_1','2':'num_2','3':'num_3','4':'num_4',
  '5':'num_5','6':'num_6','7':'num_7','8':'num_8','9':'num_9',
  '(':'lparen',')':'rparen','[':'lbracket',']':'rbracket',
  '{':'lbrace','}':'rbrace',
  '.':'period',',':'comma','!':'exclaim','?':'question',
  ';':'semicolon',':':'colon',"'":'apostrophe','"':'quote',
  '@':'at','#':'hash','$':'dollar','%':'percent','^':'caret',
  '&':'amp','*':'star','-':'dash','_':'underscore','+':'plus',
  '=':'equals','/':'slash','<':'lt','>':'gt',' ':'space',
};

const PREFIX_TO_CHAR = Object.fromEntries(Object.entries(CHAR_MAP).map(([c,p])=>[p,c]));

const py = `
import os,json,base64,io,sys
try:
    from PIL import Image
except:
    os.system("pip install Pillow --break-system-packages -q")
    from PIL import Image

folder = r"""${folder.replace(/\\/g,'\\\\')}"""
files = sorted(os.listdir(folder))
result = {}
bad = []

for fname in files:
    base,ext = os.path.splitext(fname)
    if ext.lower() not in ('.jpg','.jpeg','.png','.webp'): continue
    parts = base.rsplit('_',1)
    if len(parts)!=2 or not parts[1].isdigit(): continue
    prefix = parts[0]
    try:
        img = Image.open(os.path.join(folder,fname)).convert('RGBA')
        pixels = list(img.getdata())
        new_p = [(255,255,255,0) if r>200 and g>200 and b>200 else (r,g,b,255) for r,g,b,a in pixels]
        img.putdata(new_p)
        buf = io.BytesIO()
        img.save(buf,format='PNG')
        b64 = base64.b64encode(buf.getvalue()).decode()
        w,h = img.size
        if prefix not in result: result[prefix]=[]
        result[prefix].append({'b64':b64,'w':w,'h':h})
    except Exception as e:
        bad.append(f'{fname}: {e}')

print(json.dumps({'result':result,'bad':bad}))
`;

console.log('\nScanning alaphabet/ folder...');

// === FIXED PART: Use temp file instead of python -c (Windows-safe) ===
const tempPy = path.join(__dirname, '__temp_build_alphabet.py');
fs.writeFileSync(tempPy, py);

let raw = '';
const pythonCommands = ['py', 'python3', 'python'];  // tries Windows launcher first
let success = false;

for (const cmd of pythonCommands) {
  try {
    raw = execSync(`"${cmd}" "${tempPy}"`, { maxBuffer: 100 * 1024 * 1024 }).toString();
    success = true;
    break;
  } catch (e) {}
}

if (fs.existsSync(tempPy)) fs.unlinkSync(tempPy);   // clean up temp file

if (!success) {
  console.error('\n❌ Python not found or not in PATH.');
  console.error('   → Install Python from https://www.python.org/downloads/');
  console.error('   → Make sure "Add python.exe to PATH" is checked.');
  process.exit(1);
}
// =====================================================================

const {result:prefixData, bad} = JSON.parse(raw.trim().split('\n').pop());

if (bad.length) { console.log('\nSkipped (corrupt):'); bad.forEach(b=>console.log(' ',b)); }

const charData = {};
for (const [prefix,variants] of Object.entries(prefixData)) {
  const ch = PREFIX_TO_CHAR[prefix];
  if (ch !== undefined) charData[ch] = variants;
}

fs.writeFileSync(outFile,
  `const LETTERS = ${JSON.stringify(charData)};\nconst CHAR_MAP = ${JSON.stringify(CHAR_MAP)};\n`
);

const size = fs.statSync(outFile).size;
const loaded = Object.keys(charData).sort();
const missing = Object.keys(CHAR_MAP).filter(c=>!charData[c]);

console.log(`\nDone! ${(size/1024).toFixed(1)} KB written`);
console.log(`\nLoaded (${loaded.length}): ${loaded.map(c=>c===' '?'[space]':c).join('  ')}`);
if (missing.length) {
  console.log(`\nMissing — add these to alaphabet/ to enable:`);
  missing.forEach(c => {
    const p = CHAR_MAP[c];
    console.log(`  "${c===' '?'space':c}" -> ${p}_1.jpg  ${p}_2.jpg  ${p}_3.jpg`);
  });
}
console.log('\nRefresh http://localhost:3000\n');