/* Christchurch Sailing parent newsletter. Isolated library extension with private browser media storage. */
(function () {
  'use strict';
  // Reuse approved brand artwork; absolute public URLs survive email copy/export.
  const BRAND_HEADER = 'https://rdeane-create.github.io/christchurch-sailing-media-studio/assets/HeroV3/hero-header-master.png';
  const SCHEDULE_PATH = 'assets/schedules/fall-2026-visa-schedule.png';
  const SCHEDULE_URL = 'https://rdeane-create.github.io/christchurch-sailing-media-studio/' + SCHEDULE_PATH;
  const KEY = 'csms_parent_newsletter_v1';
  const titles = ['On the Water', 'In the Classroom', 'Around Campus', 'Upcoming Events', 'Athlete Spotlight', 'Team/Program Updates', 'Photos/Media', 'Notes/Reminders'];
  const hints = ['Practice focus, regatta highlights, and lessons learned.', 'What sailors are learning and how it connects to sailing.', 'Campus life, school traditions, activities, and community highlights.', 'Date • Event • Location • What families need to do', 'Name, class year, and a moment worth celebrating.', 'Program news, volunteer opportunities, and team milestones.', 'A short caption and a link to this issue’s photos or video.', 'Keep this brief: deadlines, equipment, and travel reminders.'];
  const esc = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl = value => { try { const u = new URL(value); return u.protocol === 'https:' ? u.href : ''; } catch (_) { return ''; } };
  const fresh = () => ({title:'Parent & Family Newsletter', issue:'Issue 01', date:new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}), intro:'News from the water, the classroom, and our sailing community.', hero:'', heroAlt:'Christchurch Sailing', facebook:'https://www.facebook.com/profile.php?id=61568278366488', instagram:'https://www.instagram.com/christchurchsailing/', sections:titles.map(title=>({title,visible:true,body:'',image:'',alt:'',link:'',linkLabel:'Read more'}))});
  // Upgrade seven-section drafts by insertion, retaining customized headings and content.
  function upgradeDraft(draft) {
    if (draft && Array.isArray(draft.sections) && draft.sections.length === 7) {
      return {...draft, sections:[...draft.sections.slice(0,2), fresh().sections[2], ...draft.sections.slice(2)]};
    }
    return draft;
  }
  const mediaCache = new Map();
  let mediaRefs = {}, mediaLoading = true;
  function mediaDB() {
    return new Promise((resolve,reject)=>{
      const request=indexedDB.open('csms_parent_newsletter_media_v1',1);
      request.onupgradeneeded=()=>request.result.createObjectStore('files',{keyPath:'id'});
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);
    });
  }
  async function mediaStore(mode,action) {
    const db=await mediaDB();
    try {return await new Promise((resolve,reject)=>{
      const tx=db.transaction('files',mode);const req=action(tx.objectStore('files'));
      tx.oncomplete=()=>resolve(req.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
    });} finally {db.close();}
  }
  function readData(file) {return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(file);});}
  function draftData() {return {...state,mediaRefs};}
  async function hydrateMedia() {
    mediaLoading=true;
    try {for(const id of Object.values(mediaRefs)){if(!mediaCache.has(id)){const record=await mediaStore('readonly',store=>store.get(id));if(record)mediaCache.set(id,record);}}}
    finally {mediaLoading=false;}
  }
  function localMedia(slot) {return mediaCache.get(mediaRefs[slot]);}
  function mediaSlots() {return ['hero','hero-video',...state.sections.flatMap((s,i)=>s.visible?[`photo-${i}`,`video-${i}`]:[])];}
  function activeMedia() {return mediaSlots().map(slot=>({slot,file:localMedia(slot)})).filter(x=>x.file);}
  function assertMediaReady() {if(mediaLoading||mediaSlots().some(slot=>mediaRefs[slot]&&!localMedia(slot)))throw Error('Some uploaded files are still loading or missing. Restore a backup that includes media before exporting.');}
  let state = fresh(), loadWarning = '';
  try {
    const saved = upgradeDraft(JSON.parse(localStorage.getItem(KEY) || 'null'));
    if(saved?.mediaRefs && typeof saved.mediaRefs==='object' && !Array.isArray(saved.mediaRefs)) mediaRefs=Object.fromEntries(Object.entries(saved.mediaRefs).filter(([k,v])=>/^(hero|hero-video|(?:photo|video)-[0-7])$/.test(k)&&typeof v==='string'));
    if (saved && Array.isArray(saved.sections) && saved.sections.length === titles.length) {
      for (const k of Object.keys(state).filter(k=>k!=='sections')) if(typeof saved[k]==='string') state[k]=saved[k];
      if (!state.facebook.trim()) state.facebook = fresh().facebook;
      if (!state.instagram.trim()) state.instagram = fresh().instagram;
      state.sections=state.sections.map((s,i)=>Object.fromEntries(Object.entries(s).map(([k,v])=>[k,typeof saved.sections[i]?.[k]===typeof v?saved.sections[i][k]:v])));
    }
  } catch (_) { loadWarning='Saved draft could not be read. Download a draft backup before closing if browser storage is unavailable.'; }
  // Update only the original starter heading, preserving custom issue titles and content.
  if (state.title === 'The Seahorse Sailing Newsletter') state.title = fresh().title;
  const text = v => esc(v).replace(/\n/g,'<br>');
  function picture(url,alt) { return safeUrl(url) ? `<img src="${esc(safeUrl(url))}" alt="${esc(alt)}" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;margin:16px 0">` : ''; }
  function photo(slot,url,alt,mode) {
    const file=localMedia(slot);
    if(!file)return picture(url,alt);
    const src=mode==='email'?`cid:${file.id}@newsletter`:file.data;
    return `<img src="${esc(src)}" alt="${esc(alt||file.name)}" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;margin:16px 0">`;
  }
  function video(slot,mode) {
    const file=localMedia(slot);if(!file)return '';
    return mode==='preview'?`<video controls preload="metadata" style="display:block;width:100%;margin:16px 0" src="${esc(file.data)}"></video><p style="font:14px Arial,sans-serif">${esc(file.name)} — included as an attachment in the email download.</p>`:`<p style="font:14px/1.6 Arial,sans-serif">Video attachment: ${esc(file.name)}</p>`;
  }
  function emailBody(mode='preview') {
    const rows = state.sections.map((s,i)=>({s,i})).filter(({s})=>s.visible).map(({s,i})=>{
      const feature=i===4, reminder=i===7;
      const background=feature?'#07152f':reminder?'#f0f3f6':'#ffffff';
      const ink=feature?'#ffffff':'#07152f', bodyInk=feature?'#e2e8f0':'#354458';
      return `<tr><td style="padding:12px 24px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:${background};border-bottom:1px solid #dce2e8"><tr><td style="padding:24px;overflow-wrap:anywhere;word-break:break-word"><p style="margin:0 0 10px;font:700 11px/1.4 Arial,sans-serif;letter-spacing:2px;color:${feature?'#ffae7c':'#9c350c'}">${['ON THE WATER','BEYOND THE BOAT','LIFE AT CHRISTCHURCH','MARK YOUR CALENDAR','MEET A SEAHORSE','OUR SAILING COMMUNITY','THROUGH THE LENS','BEFORE YOU GO'][i]}</p><h2 style="margin:0 0 16px;font:700 25px/1.2 Arial,sans-serif;color:${ink}">${esc(s.title)}</h2><div style="font:16px/1.7 Arial,sans-serif;color:${bodyInk}">${text(s.body)}</div>${photo(`photo-${i}`,s.image,s.alt,mode)}${video(`video-${i}`,mode)}${safeUrl(s.link)?`<p style="margin:20px 0 0"><a href="${esc(safeUrl(s.link))}" style="display:inline-block;border-bottom:2px solid #ef4b13;padding:6px 0;color:${ink};font:700 14px/1.5 Arial,sans-serif;text-decoration:none">${esc(s.linkLabel||'Read more')} &rarr;</a></p>`:''}</td></tr></table></td></tr>`;
    }).join('');
    const social = ['facebook','instagram'].map(k=>safeUrl(state[k])?`<a href="${esc(safeUrl(state[k]))}" style="display:inline-block;border:1px solid #758399;padding:10px 16px;margin:4px;color:#ffffff;font:700 14px Arial,sans-serif;text-decoration:none">${k==='facebook'?'Facebook':'Instagram'} &rarr;</a>`:'').filter(Boolean).join(' ');
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#e9edf1"><tr><td align="center" style="padding:20px 0"><!--[if mso]><table role="presentation" width="640"><tr><td><![endif]--><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;background:#ffffff"><tr><td style="background:#e6e7e9"><img src="${BRAND_HEADER}" width="640" alt="CHRISTCHURCH SAILING — Christchurch School · Pursue Excellence" style="display:block;width:100%;max-width:640px;height:auto;border:0;color:#07152f;font:bold 22px Arial,sans-serif"></td></tr><tr><td style="padding:14px 28px;background:#07152f;border-bottom:3px solid #ef4b13;color:#ffffff;font:12px/1.5 Arial,sans-serif;letter-spacing:1px">${esc(state.issue)} &nbsp; / &nbsp; ${esc(state.date)}</td></tr><tr><td style="padding:32px 32px 20px;overflow-wrap:anywhere;word-break:break-word"><p style="margin:0 0 12px;color:#9c350c;font:700 11px/1.4 Arial,sans-serif;letter-spacing:2px">FROM THE CHRISTCHURCH WATERFRONT</p><h1 style="margin:0 0 16px;font:700 30px/1.2 Arial,sans-serif;color:#07152f">${esc(state.title)}</h1><p style="margin:0;font:17px/1.7 Arial,sans-serif;color:#435167">${text(state.intro)}</p>${photo('hero',state.hero,state.heroAlt,mode)}${video('hero-video',mode)}</td></tr>${rows}<tr><td style="height:28px;font-size:1px;line-height:28px">&nbsp;</td></tr><tr><td align="center" style="padding:32px 24px;background:#07152f;border-top:3px solid #ef4b13;color:#ffffff;font:14px/1.6 Arial,sans-serif"><p style="margin:0 0 8px;font:700 italic 20px Arial,sans-serif;letter-spacing:1px">CHRISTCHURCH <span style="color:#ffae7c">SAILING</span></p><p style="margin:0 0 20px;color:#cdd7e6">Pursue Excellence.<br>On the water. In the classroom. Together.</p>${social?`<p style="margin:0">${social}</p>`:''}<p style="margin:22px 0 0;color:#cdd7e6;font:12px/1.6 Arial,sans-serif">Christchurch School &nbsp; • &nbsp; For our sailors and families</p></td></tr></table><!--[if mso]></td></tr></table><![endif]--></td></tr></table>`;
  }
  function html(mode='preview') { return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(state.title)}</title></head><body style="margin:0;padding:0">${emailBody(mode)}</body></html>`; }
  function plain() { return `CHRISTCHURCH SAILING\n${state.title}\n${state.issue} • ${state.date}\n\n${state.intro}\n\n`+state.sections.filter(s=>s.visible).map(s=>`${s.title}\n${s.body}${safeUrl(s.link)?'\n'+s.linkLabel+': '+safeUrl(s.link):''}${safeUrl(s.image)?'\n'+s.alt+': '+safeUrl(s.image):''}`).join('\n\n')+'\n\nChristchurch Sailing\n'+['facebook','instagram'].filter(k=>safeUrl(state[k])).map(k=>k+': '+safeUrl(state[k])).join('\n'); }
  let panel, preview, status;
  function update() {
    preview.srcdoc=html().replaceAll(SCHEDULE_URL, esc(new URL(SCHEDULE_PATH, document.baseURI).href));
    try {localStorage.setItem(KEY,JSON.stringify(draftData())); status.textContent='Draft saved in this browser.'+(Object.keys(mediaRefs).length?' Uploaded files are saved separately in this browser; use Download email for sending.':'');} catch (_) {status.textContent='Browser storage unavailable. Download a draft backup to keep your edits.';}
    if(!safeUrl(state.facebook)||!safeUrl(state.instagram)) status.textContent+=' Add both social profile URLs to include the footer links.';
  }
  function download(data,type,name) {const a=document.createElement('a'),u=URL.createObjectURL(new Blob([data],{type}));a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),10000);}
  function field(host,obj,key,label,multiline=false,type='text',placeholder='') {
    const wrap=document.createElement('div');wrap.className='control';
    const l=document.createElement('label'),input=document.createElement(multiline?'textarea':'input');
    input.id='pn-'+key+'-'+host.querySelectorAll('input,textarea').length+'-'+(host.dataset.section||'main'); l.htmlFor=input.id;l.textContent=label;
    if(!multiline) input.type=type; else input.rows=4;
    input.value=obj[key]; input.placeholder=placeholder;
    input.addEventListener('input',()=>{obj[key]=input.value;input.setCustomValidity(type==='url'&&input.value&&!safeUrl(input.value)?'Use a full https:// URL.':'');update();});
    wrap.append(l,input);host.append(wrap);return input;
  }
  function uploadControls(host,slot,label,kind) {
    const wrap=document.createElement('div');wrap.className='control';
    const l=document.createElement('label'),input=document.createElement('input'),info=document.createElement('p'),remove=document.createElement('button');
    input.type='file';input.id='pn-upload-'+slot;input.accept=kind==='photo'?'image/jpeg,image/png,image/webp,image/gif':'video/*,.mp4,.mov,.m4v,.webm';l.htmlFor=input.id;l.textContent=label;
    info.className='hint';remove.type='button';remove.className='secondary tiny';remove.textContent='Remove uploaded '+kind;
    const refresh=()=>{info.textContent=localMedia(slot)?.name||(mediaRefs[slot]?'Saved file loading…':'No file selected');remove.hidden=!mediaRefs[slot];};
    remove.onclick=()=>{delete mediaRefs[slot];refresh();update();};
    input.onchange=async()=>{
      const file=input.files[0];if(!file)return;input.disabled=true;
      try {
        const extension=file.name.split('.').pop().toLowerCase();
        const videoTypes={mp4:'video/mp4',m4v:'video/mp4',mov:'video/quicktime',webm:'video/webm'};
        const mime=kind==='video'?(videoTypes[extension]||file.type):file.type;
        const allowed=kind==='photo'?['image/jpeg','image/png','image/webp','image/gif']:['video/mp4','video/webm','video/quicktime'];
        if(!allowed.includes(mime))throw Error(kind==='video'?'Choose MP4, MOV, M4V, or WebM. Other video formats need conversion to MP4.':'Choose a supported photo file.');
        if(file.size>100*1024*1024)throw Error('Choose a file under 100 MB.');
        const data=await readData(file.slice(0,file.size,mime));
        if(kind==='photo'){const im=new Image();im.src=data;await im.decode();}
        const record={id:'pn-'+crypto.randomUUID(),name:file.name,type:mime,size:file.size,data};
        await mediaStore('readwrite',store=>store.put(record));
        mediaCache.set(record.id,record);mediaRefs[slot]=record.id;refresh();update();
      } catch(error){status.textContent='Upload not added: '+error.message+' Your existing draft is unchanged.';}
      finally {input.disabled=false;input.value='';}
    };
    wrap.append(l,input,info,remove);host.append(wrap);refresh();
    hydrateMedia().then(refresh).catch(()=>{info.textContent='Saved file unavailable. Restore a backup with media.';});
  }
  function base64Text(value) {const bytes=new TextEncoder().encode(value);let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);return btoa(binary);}
  function folded(value) {return value.match(/.{1,76}/g)?.join('\r\n')||'';}
  function emailFile() {
    assertMediaReady();
    const boundary='pn-'+crypto.randomUUID(),related=boundary+'-related';
    const part=(type,data,extra='')=>`Content-Type: ${type}\r\nContent-Transfer-Encoding: base64\r\n${extra}\r\n${folded(data)}\r\n`;
    let out=`MIME-Version: 1.0\r\nX-Unsent: 1\r\nSubject: =?UTF-8?B?${base64Text(state.title)}?=\r\nContent-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n--${boundary}\r\nContent-Type: multipart/related; boundary="${related}"\r\n\r\n--${related}\r\n`+part('text/html; charset=UTF-8',base64Text(html('email')));
    for(const {file} of activeMedia().filter(x=>x.file.type.startsWith('image/')))out+=`--${related}\r\n`+part(file.type,file.data.split(',')[1],`Content-ID: <${file.id}@newsletter>\r\nContent-Disposition: inline\r\n`);
    out+=`--${related}--\r\n`;
    for(const {file} of activeMedia().filter(x=>x.file.type.startsWith('video/')))out+=`--${boundary}\r\n`+part(file.type,file.data.split(',')[1],`Content-Disposition: attachment; filename="${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}"\r\n`);
    return out+`--${boundary}--\r\n`;
  }
  async function backup() {
    try {await hydrateMedia();if(Object.values(mediaRefs).some(id=>!mediaCache.has(id)))throw Error('A saved file is missing.');download(JSON.stringify({...draftData(),mediaFiles:Object.values(mediaRefs).map(id=>mediaCache.get(id))}), 'application/json','christchurch-newsletter-draft.json');}
    catch(error){status.textContent='Backup could not include all files: '+error.message;}
  }
  function open() {
    if(panel){panel.hidden=false;panel.scrollIntoView({behavior:'smooth'});return;}
    panel=document.createElement('section');panel.id='parentNewsletterWorkspace';panel.className='panel';
    panel.innerHTML='<style>#parentNewsletterWorkspace .pn-grid{display:grid;grid-template-columns:minmax(260px,360px) minmax(0,1fr);gap:20px}#parentNewsletterWorkspace input:not([type=checkbox]),#parentNewsletterWorkspace textarea{width:100%}#parentNewsletterWorkspace input[type=url]{padding:12px;border:1px solid #ccd8e7;border-radius:12px;font:inherit;background:white;color:#10213c}#parentNewsletterWorkspace details{border:1px solid #d8e2ed;padding:12px;margin:12px 0;border-radius:10px}#parentNewsletterWorkspace summary{cursor:pointer;font-weight:700}#parentNewsletterWorkspace iframe{width:100%;height:1100px;border:1px solid #d8e2ed;background:#eef2f7}#parentNewsletterWorkspace .pn-actions{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}@media(max-width:850px){#parentNewsletterWorkspace .pn-grid{grid-template-columns:1fr}}</style><div style="background:#e6e7e9;border-radius:12px;overflow:hidden;margin-bottom:20px"><img src="' + BRAND_HEADER + '" alt="Christchurch Sailing" style="display:block;width:100%;max-width:640px;height:auto;margin:auto"></div><h2>Parent Email Newsletter</h2><p class="hint">Your approved Christchurch Sailing masthead is fixed. Edit the issue heading and each section below; uncheck Show to omit a section. Drafts stay in this browser. Upload photos and videos from your computer below. Uploaded photos take priority over image URLs. Download email embeds photos and attaches videos; open it in an email app that supports .eml drafts. Large videos may exceed your email provider’s attachment limit. Copy the formatted newsletter into your email composer, or download HTML for an email platform. Send yourself a test email to check formatting.</p><div class="pn-actions"></div><p role="status" aria-live="polite"></p><div class="pn-grid"><div class="pn-fields"></div><div><h3>Email preview</h3><iframe title="Parent newsletter email preview" sandbox=""></iframe></div></div>';
    (document.getElementById('templateLibraryList')?.parentElement||document.body).appendChild(panel);
    preview=panel.querySelector('iframe');status=panel.querySelector('[role=status]');const form=panel.querySelector('.pn-fields');
    [['title','Newsletter title'],['issue','Issue'],['date','Date'],['intro','Welcome / introduction'],['hero','Hero image URL'],['heroAlt','Hero image description'],['facebook','Facebook profile URL'],['instagram','Instagram profile URL']].forEach(([k,l])=>field(form,state,k,l,k==='intro',['hero','facebook','instagram'].includes(k)?'url':'text'));
    uploadControls(form,'hero','Upload hero photo','photo');
    uploadControls(form,'hero-video','Upload hero video','video');
    state.sections.forEach((s,i)=>{const d=document.createElement('details');d.dataset.section=i;const summary=document.createElement('summary');summary.textContent=titles[i];d.append(summary);const label=document.createElement('label'),c=document.createElement('input');c.type='checkbox';c.checked=s.visible;c.onchange=()=>{s.visible=c.checked;update();};label.append(c,document.createTextNode(' Show this section'));d.append(label);field(d,s,'title','Section heading');field(d,s,'body','Content',true,'text',hints[i]);const imageField=field(d,s,'image','Image URL',false,'url');const altField=field(d,s,'alt','Image description');const linkField=field(d,s,'link','Link URL',false,'url');const linkLabelField=field(d,s,'linkLabel','Link text');if(i===3){const add=document.createElement('button');add.type='button';add.className='secondary tiny';add.textContent='Add Fall 2026 schedule';add.onclick=()=>{delete mediaRefs['photo-3'];s.image=SCHEDULE_URL;s.alt='Christchurch Sailing — Fall 2026 regatta schedule. Open the full-size schedule for event details.';imageField.value=s.image;imageField.setCustomValidity('');altField.value=s.alt;if(!s.link.trim()){s.link=SCHEDULE_URL;s.linkLabel='Open full-size schedule';linkField.value=s.link;linkLabelField.value=s.linkLabel;linkField.setCustomValidity('');}s.visible=true;c.checked=true;update();};d.append(add);}uploadControls(d,`photo-${i}`,'Upload photo','photo');uploadControls(d,`video-${i}`,'Upload video','video');form.append(d);});
    const actions=panel.querySelector('.pn-actions');
    function button(label,fn){const b=document.createElement('button');b.type='button';b.className='secondary tiny';b.textContent=label;b.onclick=fn;actions.append(b);}
    button('Copy formatted email',async()=>{try{assertMediaReady();if(activeMedia().length){status.textContent='Use Download email to include uploaded photos and video attachments. Clipboard copy cannot reliably carry local files into email.';return;}await navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([emailBody()],{type:'text/html'}),'text/plain':new Blob([plain()],{type:'text/plain'})})]);status.textContent='Copied. Paste into your email composer with formatting.';}catch(_){status.textContent='Formatted clipboard unavailable. Download HTML, open it in a browser, select the newsletter and copy it into your email composer.';}});
    button('Download HTML',()=>{try{assertMediaReady();download(html(),'text/html','christchurch-parent-newsletter.html');if(activeMedia().length)status.textContent='HTML is a local preview. Use Download email to send embedded photos and video attachments.';}catch(error){status.textContent=error.message;}});
    button('Download email',()=>{try{download(emailFile(),'message/rfc822','christchurch-parent-newsletter.eml');status.textContent='Email draft downloaded with embedded photos and video attachments. Open in an email app that supports .eml drafts; large attachments may exceed sending limits.';}catch(error){status.textContent=error.message;}});
    button('Download plain text',()=>download(plain(),'text/plain','christchurch-parent-newsletter.txt'));
    button('Download draft backup',backup);
    button('Restore draft',()=>{const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.onchange=async()=>{try{const next=upgradeDraft(JSON.parse(await input.files[0].text()));const base=fresh();if(!next||!Array.isArray(next.sections)||next.sections.length!==titles.length||Object.keys(base).filter(k=>k!=='sections').some(k=>typeof next[k]!=='string')||next.sections.some(s=>!s||Object.entries(base.sections[0]).some(([k,v])=>typeof s[k]!==typeof v)))throw Error();const refs=next.mediaRefs||{};const files=next.mediaFiles||[];
        if(typeof refs!=='object'||Array.isArray(refs)||!Array.isArray(files))throw Error();
        for(const [slot,id] of Object.entries(refs)){if(!/^(hero|hero-video|(?:photo|video)-[0-7])$/.test(slot)||typeof id!=='string')throw Error();const file=files.find(f=>f.id===id)||mediaCache.get(id);if(!file||!/^data:(image\/(jpeg|png|webp|gif)|video\/(mp4|webm|quicktime));base64,[A-Za-z0-9+/=]+$/.test(file.data)||typeof file.name!=='string'||file.type!==file.data.slice(5,file.data.indexOf(';')))throw Error();}
        for(const file of files){if(Object.values(refs).includes(file.id)){await mediaStore('readwrite',store=>store.put(file));mediaCache.set(file.id,file);}}
        state=next;delete state.mediaRefs;delete state.mediaFiles;mediaRefs=refs;panel.remove();panel=null;open();}catch(_){status.textContent='Could not restore: choose a newsletter draft backup. Your current draft is unchanged.';}};input.click();});
    button('Close',()=>{panel.hidden=true;});
    hydrateMedia().then(()=>{if(panel)update();}).catch(()=>{status.textContent='Uploaded files could not be loaded. Your draft text is preserved.';});
    update();if(loadWarning){status.textContent=loadWarning;loadWarning='';}panel.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function register(){const list=document.getElementById('templateLibraryList');if(!list||document.getElementById('parentNewsletterCard'))return;const card=document.createElement('div');card.id='parentNewsletterCard';card.className='athleteItem';card.innerHTML='<div class="templateThumb" style="background:#07152f;border-top:5px solid #ff6f18;color:white;padding:8px;font:bold 11px Arial">SAILING<br><br>NEWS</div><div class="templateInfo"><div class="templateTitle">Parent Email Newsletter</div><div class="templateMeta">Editable sections • Email HTML • Browser draft</div></div><div class="templateActions"><button type="button" class="tiny primary">Open</button></div>';card.querySelector('button').onclick=open;list.prepend(card);}
  function init(){register();const list=document.getElementById('templateLibraryList');if(list)new MutationObserver(register).observe(list,{childList:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
