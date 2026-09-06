/* Christchurch Sailing parent newsletter. Isolated library extension; no canvas/Drive mutations. */
(function () {
  'use strict';
  const KEY = 'csms_parent_newsletter_v1';
  const titles = ['On the Water', 'In the Classroom', 'Upcoming Events', 'Athlete Spotlight', 'Team/Program Updates', 'Photos/Media', 'Notes/Reminders'];
  const hints = ['Practice focus, regatta highlights, and lessons learned.', 'What sailors are learning and how it connects to sailing.', 'Date • Event • Location • What families need to do', 'Name, class year, and a moment worth celebrating.', 'Program news, volunteer opportunities, and team milestones.', 'A short caption and a link to this issue’s photos or video.', 'Keep this brief: deadlines, equipment, and travel reminders.'];
  const esc = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl = value => { try { const u = new URL(value); return u.protocol === 'https:' ? u.href : ''; } catch (_) { return ''; } };
  const fresh = () => ({title:'The Seahorse Sailing Newsletter', issue:'Issue 01', date:new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}), intro:'News from the water, the classroom, and our sailing community.', hero:'', heroAlt:'Christchurch Sailing', facebook:'', instagram:'https://www.instagram.com/christchurchsailing/', sections:titles.map(title=>({title,visible:true,body:'',image:'',alt:'',link:'',linkLabel:'Read more'}))});
  let state = fresh(), loadWarning = '';
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && Array.isArray(saved.sections) && saved.sections.length === titles.length) {
      for (const k of Object.keys(state).filter(k=>k!=='sections')) if(typeof saved[k]==='string') state[k]=saved[k];
      if (!state.instagram.trim()) state.instagram = fresh().instagram;
      state.sections=state.sections.map((s,i)=>Object.fromEntries(Object.entries(s).map(([k,v])=>[k,typeof saved.sections[i]?.[k]===typeof v?saved.sections[i][k]:v])));
    }
  } catch (_) { loadWarning='Saved draft could not be read. Download a draft backup before closing if browser storage is unavailable.'; }
  const text = v => esc(v).replace(/\n/g,'<br>');
  function picture(url,alt) { return safeUrl(url) ? `<img src="${esc(safeUrl(url))}" alt="${esc(alt)}" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;margin:16px 0">` : ''; }
  function emailBody() {
    const rows = state.sections.filter(s=>s.visible).map(s=>`<tr><td style="padding:24px 28px;border-bottom:1px solid #d8e2ed;overflow-wrap:anywhere"><h2 style="margin:0 0 12px;font:700 22px Arial,sans-serif;color:#07152f">${esc(s.title)}</h2><div style="font:16px/1.6 Arial,sans-serif;color:#10213c">${text(s.body)}</div>${picture(s.image,s.alt)}${safeUrl(s.link)?`<p><a href="${esc(safeUrl(s.link))}" style="color:#123f68;font:700 16px Arial,sans-serif">${esc(s.linkLabel||'Read more')}</a></p>`:''}</td></tr>`).join('');
    const social = ['facebook','instagram'].map(k=>safeUrl(state[k])?`<a href="${esc(safeUrl(state[k]))}" style="color:#ffffff;font:700 15px Arial,sans-serif;text-decoration:underline">${k==='facebook'?'Facebook':'Instagram'}</a>`:'').filter(Boolean).join(' &nbsp; | &nbsp; ');
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#eef2f7"><tr><td align="center" style="padding:16px 0"><!--[if mso]><table role="presentation" width="640"><tr><td><![endif]--><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;background:#ffffff"><tr><td style="background:#07152f;border-top:6px solid #ff6f18;padding:32px 28px;color:#ffffff"><p style="margin:0 0 22px;font:700 16px Arial,sans-serif;letter-spacing:2px;color:#ffb07d">CHRISTCHURCH SAILING</p><p style="margin:0 0 12px;font:14px Arial,sans-serif;color:#cdd7e6">${esc(state.issue)} &nbsp; • &nbsp; ${esc(state.date)}</p><h1 style="margin:0 0 16px;font:700 34px/1.15 Arial,sans-serif;overflow-wrap:anywhere">${esc(state.title)}</h1><p style="margin:0;font:16px/1.6 Arial,sans-serif">${text(state.intro)}</p>${picture(state.hero,state.heroAlt)}</td></tr>${rows}<tr><td style="padding:28px;background:#07152f;color:#ffffff;font:14px/1.6 Arial,sans-serif"><strong>CHRISTCHURCH SAILING</strong><br>For our sailors and families.${social?`<p style="margin:16px 0 0">${social}</p>`:''}</td></tr></table><!--[if mso]></td></tr></table><![endif]--></td></tr></table>`;
  }
  function html() { return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(state.title)}</title></head><body style="margin:0;padding:0">${emailBody()}</body></html>`; }
  function plain() { return `${state.title}\n${state.issue} • ${state.date}\n\n${state.intro}\n\n`+state.sections.filter(s=>s.visible).map(s=>`${s.title}\n${s.body}${safeUrl(s.link)?'\n'+s.linkLabel+': '+safeUrl(s.link):''}${safeUrl(s.image)?'\n'+s.alt+': '+safeUrl(s.image):''}`).join('\n\n')+'\n\nChristchurch Sailing\n'+['facebook','instagram'].filter(k=>safeUrl(state[k])).map(k=>k+': '+safeUrl(state[k])).join('\n'); }
  let panel, preview, status;
  function update() {
    preview.srcdoc=html();
    try {localStorage.setItem(KEY,JSON.stringify(state)); status.textContent='Draft saved in this browser.';} catch (_) {status.textContent='Browser storage unavailable. Download a draft backup to keep your edits.';}
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
    wrap.append(l,input);host.append(wrap);
  }
  function open() {
    if(panel){panel.hidden=false;panel.scrollIntoView({behavior:'smooth'});return;}
    panel=document.createElement('section');panel.id='parentNewsletterWorkspace';panel.className='panel';
    panel.innerHTML='<style>#parentNewsletterWorkspace .pn-grid{display:grid;grid-template-columns:minmax(260px,360px) minmax(0,1fr);gap:20px}#parentNewsletterWorkspace input:not([type=checkbox]),#parentNewsletterWorkspace textarea{width:100%}#parentNewsletterWorkspace input[type=url]{padding:12px;border:1px solid #ccd8e7;border-radius:12px;font:inherit;background:white;color:#10213c}#parentNewsletterWorkspace details{border:1px solid #d8e2ed;padding:12px;margin:12px 0;border-radius:10px}#parentNewsletterWorkspace summary{cursor:pointer;font-weight:700}#parentNewsletterWorkspace iframe{width:100%;height:850px;border:1px solid #d8e2ed;background:#eef2f7}#parentNewsletterWorkspace .pn-actions{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}@media(max-width:850px){#parentNewsletterWorkspace .pn-grid{grid-template-columns:1fr}}</style><h2>Parent Email Newsletter</h2><p class="hint">Edit each section and uncheck Show to omit it. Drafts stay in this browser. Use public HTTPS image URLs so recipients can see photos. Copy the formatted newsletter into your email composer, or download HTML for an email platform. Send yourself a test email to check formatting.</p><div class="pn-actions"></div><p role="status" aria-live="polite"></p><div class="pn-grid"><div class="pn-fields"></div><div><h3>Email preview</h3><iframe title="Parent newsletter email preview" sandbox=""></iframe></div></div>';
    (document.getElementById('templateLibraryList')?.parentElement||document.body).appendChild(panel);
    preview=panel.querySelector('iframe');status=panel.querySelector('[role=status]');const form=panel.querySelector('.pn-fields');
    [['title','Newsletter title'],['issue','Issue'],['date','Date'],['intro','Welcome / introduction'],['hero','Hero image URL'],['heroAlt','Hero image description'],['facebook','Facebook profile URL'],['instagram','Instagram profile URL']].forEach(([k,l])=>field(form,state,k,l,k==='intro',['hero','facebook','instagram'].includes(k)?'url':'text'));
    state.sections.forEach((s,i)=>{const d=document.createElement('details');d.dataset.section=i;const summary=document.createElement('summary');summary.textContent=titles[i];d.append(summary);const label=document.createElement('label'),c=document.createElement('input');c.type='checkbox';c.checked=s.visible;c.onchange=()=>{s.visible=c.checked;update();};label.append(c,document.createTextNode(' Show this section'));d.append(label);field(d,s,'title','Section heading');field(d,s,'body','Content',true,'text',hints[i]);field(d,s,'image','Image URL',false,'url');field(d,s,'alt','Image description');field(d,s,'link','Link URL',false,'url');field(d,s,'linkLabel','Link text');form.append(d);});
    const actions=panel.querySelector('.pn-actions');
    function button(label,fn){const b=document.createElement('button');b.type='button';b.className='secondary tiny';b.textContent=label;b.onclick=fn;actions.append(b);}
    button('Copy formatted email',async()=>{try{await navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([emailBody()],{type:'text/html'}),'text/plain':new Blob([plain()],{type:'text/plain'})})]);status.textContent='Copied. Paste into your email composer with formatting.';}catch(_){status.textContent='Formatted clipboard unavailable. Download HTML, open it in a browser, select the newsletter and copy it into your email composer.';}});
    button('Download HTML',()=>download(html(),'text/html','christchurch-parent-newsletter.html'));
    button('Download plain text',()=>download(plain(),'text/plain','christchurch-parent-newsletter.txt'));
    button('Download draft backup',()=>download(JSON.stringify(state,null,2),'application/json','christchurch-newsletter-draft.json'));
    button('Restore draft',()=>{const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.onchange=async()=>{try{const next=JSON.parse(await input.files[0].text());const base=fresh();if(!next||!Array.isArray(next.sections)||next.sections.length!==7||Object.keys(base).filter(k=>k!=='sections').some(k=>typeof next[k]!=='string')||next.sections.some(s=>!s||Object.entries(base.sections[0]).some(([k,v])=>typeof s[k]!==typeof v)))throw Error();state=next;panel.remove();panel=null;open();}catch(_){status.textContent='Could not restore: choose a newsletter draft backup. Your current draft is unchanged.';}};input.click();});
    button('Close',()=>{panel.hidden=true;});
    update();if(loadWarning){status.textContent=loadWarning;loadWarning='';}panel.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function register(){const list=document.getElementById('templateLibraryList');if(!list||document.getElementById('parentNewsletterCard'))return;const card=document.createElement('div');card.id='parentNewsletterCard';card.className='athleteItem';card.innerHTML='<div class="templateThumb" style="background:#07152f;border-top:5px solid #ff6f18;color:white;padding:8px;font:bold 11px Arial">SAILING<br><br>NEWS</div><div class="templateInfo"><div class="templateTitle">Parent Email Newsletter</div><div class="templateMeta">Editable sections • Email HTML • Browser draft</div></div><div class="templateActions"><button type="button" class="tiny primary">Open</button></div>';card.querySelector('button').onclick=open;list.prepend(card);}
  function init(){register();const list=document.getElementById('templateLibraryList');if(list)new MutationObserver(register).observe(list,{childList:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
