from pathlib import Path
import hashlib

path=Path('lineup-headshot.js')
text=path.read_text()
main_path=Path('athlete-main-headshot-approved-exact.js')
main_hash_before=hashlib.sha256(main_path.read_bytes()).hexdigest()

text=text.replace("const VERSION='20260814-lineup-headshot-v6-athlete-cutout';","const VERSION='20260814-lineup-headshot-v7-heic-support';")

marker="  let removeBgModulePromise=null;"
helper=r'''  let heicModulePromise=null;
  async function normalizeAthleteFile(file){
    const name=String(file&&file.name||'').toLowerCase();
    const type=String(file&&file.type||'').toLowerCase();
    const isHeic=name.endsWith('.heic')||name.endsWith('.heif')||type.includes('heic')||type.includes('heif');
    if(!isHeic)return file;
    setCutoutStatus('Decoding HEIC athlete photo…');
    if(!heicModulePromise){
      heicModulePromise=import('https://cdn.jsdelivr.net/npm/heic2any@0.0.4/+esm').then(mod=>mod.default||mod);
    }
    const heic2any=await heicModulePromise;
    let converted=await heic2any({blob:file,toType:'image/png',quality:1});
    if(Array.isArray(converted))converted=converted[0];
    const base=(file.name||'athlete').replace(/\.(heic|heif)$/i,'');
    return new File([converted],base+'.png',{type:'image/png',lastModified:file.lastModified||Date.now()});
  }
  async function loadAthleteFile(file,p){
    try{
      S.cutoutMask=null;
      setCutoutStatus('Loading athlete photo…');
      const normalized=await normalizeAthleteFile(file);
      S.athleteFile=normalized;
      const url=URL.createObjectURL(normalized);
      const im=new Image();
      im.onload=()=>{
        S.img=im;S.scale=1;S.x=S.y=0;sync(p);draw();URL.revokeObjectURL(url);
        setCutoutStatus(file===normalized?'Athlete loaded. Remove Background is ready.':'HEIC decoded. Athlete loaded. Remove Background is ready.');
      };
      im.onerror=()=>{URL.revokeObjectURL(url);S.img=null;setCutoutStatus('This athlete image could not be decoded. Try JPEG or PNG.');draw();};
      im.src=url;
    }catch(err){
      console.error('Athlete image decode failed',err);S.img=null;S.athleteFile=null;setCutoutStatus('This athlete image could not be decoded. Try JPEG or PNG.');draw();
    }
  }
'''
assert marker in text, 'HEIC helper insertion marker not found'
text=text.replace(marker,helper+marker,1)

old="q('lhUpload').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;S.athleteFile=f;S.cutoutMask=null;setCutoutStatus('Athlete loaded. Remove Background is ready.');const im=new Image();const url=URL.createObjectURL(f);im.onload=()=>{S.img=im;S.scale=1;S.x=S.y=0;sync(p);draw();URL.revokeObjectURL(url)};im.src=url};"
new="q('lhUpload').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;loadAthleteFile(f,p)};"
assert old in text, 'athlete upload handler marker not found'
text=text.replace(old,new,1)

text=text.replace('Uses the original athlete photo; background removal creates a mask only.','Uses the original athlete photo; HEIC is decoded for browser display and background removal creates a mask only.')

path.write_text(text)
main_hash_after=hashlib.sha256(main_path.read_bytes()).hexdigest()
assert main_hash_before==main_hash_after, 'LOCK VIOLATION: Athlete Main Headshot changed'
assert 'heic2any@0.0.4' in text and 'loadAthleteFile' in text and "v7-heic-support" in text
print('Installed Lineup Headshot HEIC support v7. Locked Main Headshot unchanged.')
