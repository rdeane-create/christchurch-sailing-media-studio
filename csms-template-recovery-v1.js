/**
 * Christchurch Sailing Media Studio
 * Production Template Recovery Module v1.0
 *
 * Merge-only recovery from Christchurch_Sailing_Media_Studio_PERMANENT_INSTALL_v1.
 * Restores:
 *   - WELCOME ABOARD — MASTER v1.0 🔒
 *   - COLLEGE ANNOUNCEMENT — MASTER v1.0 🔒
 * and preserves existing:
 *   - CHRISTCHURCH HERO CARD — MASTER v1.0
 *   - Christchurch Weekly Highlights
 *   - Christchurch Regatta Lineup
 *
 * This module does NOT modify the Apps Script bridge or Drive media restore path.
 */
(function () {
  'use strict';

  const MODULE_VERSION = '1.0.0';
  const TEMPLATE_KEY = 'christchurch_creative_templates_v1';
  const BACKUP_KEY = 'christchurch_template_recovery_pre_v1';
  const LEGACY_DB = 'ChristchurchMediaStudio';
  const LEGACY_STORE = 'media';

  const MASTER_TEMPLATES = [
    {
      id: 'christchurch_hero_card_template',
      name: 'CHRISTCHURCH HERO CARD — MASTER v1.0',
      category: 'hero',
      version: 1,
      builtin: true
    },
    {
      id: 'christchurch_welcome_aboard_template',
      name: 'WELCOME ABOARD — MASTER v1.0 🔒',
      category: 'hero',
      version: 1,
      builtin: true,
      locked: true,
      approved: true
    },
    {
      id: 'christchurch_college_announcement_template',
      name: 'COLLEGE ANNOUNCEMENT — MASTER v1.0 🔒',
      category: 'hero',
      version: 1,
      builtin: true,
      locked: true,
      approved: true
    },
    {
      id: 'christchurch_weekly_highlights_template',
      name: 'Christchurch Weekly Highlights',
      category: 'weekly',
      version: 1,
      builtin: true
    },
    {
      id: 'christchurch_regatta_lineup_template',
      name: 'Christchurch Regatta Lineup',
      category: 'lineup',
      version: 1,
      builtin: true
    }
  ];

  function safeParse(raw, fallback) {
    try {
      const value = JSON.parse(raw);
      return value == null ? fallback : value;
    } catch (_) {
      return fallback;
    }
  }

  function readTemplates() {
    const value = safeParse(localStorage.getItem(TEMPLATE_KEY) || '[]', []);
    return Array.isArray(value) ? value : [];
  }

  function writeTemplates(value) {
    localStorage.setItem(TEMPLATE_KEY, JSON.stringify(value));
  }

  function mergeTemplates() {
    const existing = readTemplates();

    if (!localStorage.getItem(BACKUP_KEY)) {
      localStorage.setItem(BACKUP_KEY, JSON.stringify({
        moduleVersion: MODULE_VERSION,
        savedAt: new Date().toISOString(),
        raw: localStorage.getItem(TEMPLATE_KEY)
      }));
    }

    const next = existing.slice();
    const added = [];
    const preserved = [];

    MASTER_TEMPLATES.forEach(master => {
      const found = next.find(item => item && item.id === master.id);
      if (found) {
        preserved.push(master.id);
        return;
      }
      next.push({
        ...master,
        createdAt: new Date().toISOString(),
        recoveredBy: 'CSMS Production Template Recovery Module v1.0'
      });
      added.push(master.id);
    });

    if (added.length) writeTemplates(next);

    return { added, preserved, total: next.length };
  }

  function openLegacyDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(LEGACY_DB);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('Could not open legacy Studio database.'));
    });
  }

  async function legacyGetAll() {
    if (typeof window.mediaGetAll === 'function') {
      try { return await window.mediaGetAll(); } catch (_) {}
    }
    try {
      const db = await openLegacyDb();
      if (!db.objectStoreNames.contains(LEGACY_STORE)) {
        db.close();
        return [];
      }
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(LEGACY_STORE, 'readonly');
        const req = tx.objectStore(LEGACY_STORE).getAll();
        req.onsuccess = () => {
          const rows = req.result || [];
          db.close();
          resolve(rows);
        };
        req.onerror = () => {
          db.close();
          reject(req.error);
        };
      });
    } catch (_) {
      return [];
    }
  }

  async function legacyPut(item) {
    if (typeof window.mediaPut === 'function') {
      try {
        await window.mediaPut(item);
        return true;
      } catch (_) {}
    }
    try {
      const db = await openLegacyDb();
      if (!db.objectStoreNames.contains(LEGACY_STORE)) {
        db.close();
        return false;
      }
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(LEGACY_STORE, 'readwrite');
        tx.objectStore(LEGACY_STORE).put(item);
        tx.oncomplete = () => {
          db.close();
          resolve(true);
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      });
    } catch (_) {
      return false;
    }
  }

  async function ensureLegacyWelcomeMaster() {
    const rows = await legacyGetAll();
    if (rows.some(item => item && item.id === 'template_welcome_v1')) return false;
    return legacyPut({
      id: 'template_welcome_v1',
      type: 'template',
      collection: 'hero',
      name: 'WELCOME ABOARD — MASTER v1.0 🔒',
      version: 1,
      base: 'template_hero_v1',
      locked: true,
      approved: true,
      created: new Date().toISOString()
    });
  }

  function normalizeAthleteRecord(item) {
    if (!item) return null;
    return {
      ...item,
      id: item.id || '',
      first: item.first || item.firstName || '',
      last: item.last || item.lastName || '',
      year: item.year || item.classYear || item.graduationYear || '',
      heroBlob: item.heroBlob || item.heroImage || null
    };
  }

  async function getUnifiedAthletesCompat() {
    if (typeof window.getUnifiedAthletes === 'function') {
      try {
        const rows = await window.getUnifiedAthletes();
        if (Array.isArray(rows)) return rows.map(normalizeAthleteRecord).filter(Boolean);
      } catch (_) {}
    }

    const rows = await legacyGetAll();
    return rows
      .filter(item => item && (
        item.type === 'athlete' ||
        item.recordType === 'athlete' ||
        ((item.first || item.last || item.firstName || item.lastName) && (item.heroBlob || item.heroImage))
      ))
      .map(normalizeAthleteRecord)
      .filter(Boolean);
  }

  function injectStyles() {
    if (document.getElementById('csms-template-recovery-style')) return;
    const style = document.createElement('style');
    style.id = 'csms-template-recovery-style';
    style.textContent = `
      #workspace-welcome.csmsRecoveredWorkspace,
      #workspace-college.csmsRecoveredWorkspace { display:none; }
      #workspace-welcome.csmsRecoveredWorkspace.active,
      #workspace-college.csmsRecoveredWorkspace.active { display:block; }
      .csmsRecoveredWorkspace .heroMasterShell {
        display:grid;grid-template-columns:minmax(300px,390px) minmax(0,1fr);gap:16px;align-items:start;
      }
      .csmsRecoveredWorkspace .panel {
        background:#fff;border:1px solid rgba(15,40,72,.12);border-radius:14px;padding:16px;
      }
      .csmsRecoveredWorkspace .control { margin:10px 0; }
      .csmsRecoveredWorkspace label { display:block;font-weight:700;margin-bottom:5px; }
      .csmsRecoveredWorkspace input,
      .csmsRecoveredWorkspace select {
        width:100%;box-sizing:border-box;padding:9px 10px;border:1px solid #cbd3dd;border-radius:8px;background:#fff;
      }
      .csmsRecoveredWorkspace .actions { display:flex;gap:8px;flex-wrap:wrap;margin-top:10px; }
      .csmsRecoveredWorkspace button,
      .csmsRecoveredTemplateRow button {
        cursor:pointer;border:0;border-radius:8px;padding:9px 12px;font-weight:800;
      }
      .csmsRecoveredWorkspace .primary { background:#f4511e;color:#fff; }
      .csmsRecoveredWorkspace .secondary,
      .csmsRecoveredTemplateRow .secondary { background:#e8edf3;color:#102d4c; }
      .csmsRecoveredWorkspace .notice,
      .csmsRecoveredWorkspace .status,
      .csmsRecoveredWorkspace .hint { margin:8px 0;color:#44566c;font-size:13px;line-height:1.4; }
      .csmsRecoveredWorkspace .previewWrap {
        background:#eef2f6;border-radius:12px;padding:10px;display:flex;justify-content:center;overflow:auto;
      }
      .csmsRecoveredWorkspace canvas {
        width:min(100%,540px);height:auto;box-shadow:0 8px 30px rgba(0,0,0,.15);background:#06142c;
      }
      .csmsRecoveredTemplateRow {
        display:grid;grid-template-columns:34px minmax(0,1fr) auto;gap:10px;align-items:center;
        border:1px solid rgba(15,40,72,.12);border-radius:10px;padding:10px;margin:8px 0;background:#fff;
      }
      .csmsRecoveredTemplateRow .csmsIcon { font-weight:900;font-size:22px; }
      @media (max-width:900px) {
        .csmsRecoveredWorkspace .heroMasterShell { grid-template-columns:1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  function workspaceMarkup() {
    return `
<div id="workspace-welcome" class="workspace csmsRecoveredWorkspace" data-csms-recovered="welcome">
  <div class="heroMasterShell">
    <section class="panel heroBuilderControls">
      <h2>Welcome Aboard — MASTER v1.0 🔒</h2>
      <div class="notice">Launch this template from the Template Library, choose any available saved Hero Card below, then save or export as an image or video. The Hero Card itself is never rebuilt or changed.</div>
      <div class="control"><label for="welcomeHeroSelect">Available Hero Cards</label><select id="welcomeHeroSelect"><option value="">Select an available Hero Card</option></select></div>
      <div class="control"><label for="welcomeProjectName">Project name</label><input id="welcomeProjectName" type="text" value="Welcome Aboard — Untitled"></div>
      <div class="actions"><button id="welcomeBackBtn" class="secondary" type="button">Back to Templates</button><button id="welcomePlayBtn" class="secondary" type="button">Play Drop</button></div>
      <button id="welcomeSaveBtn" class="secondary" type="button" style="width:100%;margin-top:10px">Save Welcome Aboard</button>
      <button id="welcomeExportBtn" class="primary" type="button" style="width:100%;margin-top:10px">Export PNG</button>
      <button id="welcomeExportVideoBtn" class="primary" type="button" style="width:100%;margin-top:10px">Export Video</button>
      <a id="welcomeDownloadFallback" class="primary" style="display:none;margin-top:10px;text-align:center;text-decoration:none;padding:9px 12px;border-radius:8px" download>Download PNG</a>
      <a id="welcomeVideoDownloadFallback" class="primary" style="display:none;margin-top:10px;text-align:center;text-decoration:none;padding:9px 12px;border-radius:8px" download>Download Video</a>
      <div id="welcomeStatus" class="status">Choose a saved Hero Card.</div>
    </section>
    <section class="panel heroBuilderPreview">
      <h2>Live Preview</h2>
      <div class="previewWrap heroPreviewWrap"><canvas id="welcomeCanvas" width="1080" height="1350"></canvas></div>
      <div class="hint">Hero Card master + locked WELCOME ABOARD overlay • 1080 × 1350 • 4:5</div>
    </section>
  </div>
</div>
<div id="workspace-college" class="workspace csmsRecoveredWorkspace" data-csms-recovered="college">
  <div class="heroMasterShell">
    <section class="panel heroBuilderControls">
      <h2>College Announcement — MASTER v1.0 🔒</h2>
      <div class="notice">Launch this template from the Template Library, choose any available saved Hero Card below, then save or export as an image or video. The Hero Card itself is never rebuilt or changed.</div>
      <div class="control"><label for="collegeHeroSelect">Available Hero Cards</label><select id="collegeHeroSelect"><option value="">Select an available Hero Card</option></select></div>
      <div class="control"><label for="collegeProjectName">Project name</label><input id="collegeProjectName" type="text" value="College Announcement — Untitled"></div>
      <div class="control"><label for="collegeSchoolName">Official college / university name</label><input id="collegeSchoolName" type="text" placeholder="e.g. Yale University"></div>
      <div class="control"><label for="collegeLogoUpload">Official school artwork</label><input id="collegeLogoUpload" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"></div>
      <div class="actions"><button id="collegeBackBtn" class="secondary" type="button">Back to Templates</button><button id="collegePlayBtn" class="secondary" type="button">Play Drop</button></div>
      <button id="collegeSaveBtn" class="secondary" type="button" style="width:100%;margin-top:10px">Save College Announcement</button>
      <button id="collegeExportBtn" class="primary" type="button" style="width:100%;margin-top:10px">Export PNG</button>
      <button id="collegeExportVideoBtn" class="primary" type="button" style="width:100%;margin-top:10px">Export Video</button>
      <a id="collegeDownloadFallback" class="primary" style="display:none;margin-top:10px;text-align:center;text-decoration:none;padding:9px 12px;border-radius:8px" download>Download PNG</a>
      <a id="collegeVideoDownloadFallback" class="primary" style="display:none;margin-top:10px;text-align:center;text-decoration:none;padding:9px 12px;border-radius:8px" download>Download Video</a>
      <div id="collegeStatus" class="status">Choose a saved Hero Card.</div>
    </section>
    <section class="panel heroBuilderPreview">
      <h2>Live Preview</h2>
      <div class="previewWrap heroPreviewWrap"><canvas id="collegeCanvas" width="1080" height="1350"></canvas></div>
      <div class="hint">Hero Card master + official school artwork stamp • 1080 × 1350 • 4:5</div>
    </section>
  </div>
</div>`;
  }

  function ensureWorkspaces() {
    if (document.getElementById('workspace-welcome') && document.getElementById('workspace-college')) return;
    const host =
      document.querySelector('main') ||
      document.querySelector('.appShell') ||
      document.querySelector('.workspace')?.parentElement ||
      document.body;

    const wrap = document.createElement('div');
    wrap.innerHTML = workspaceMarkup();
    while (wrap.firstElementChild) host.appendChild(wrap.firstElementChild);
  }

  function showWorkspace(name) {
    document.querySelectorAll('.workspace').forEach(workspace => {
      workspace.classList.toggle('active', workspace.id === `workspace-${name}`);
    });
    document.querySelectorAll('.workspaceTab').forEach(button => {
      button.classList.toggle('active', button.dataset.workspace === name);
    });

    if (name === 'welcome') {
      refreshWelcomeHeroChoices();
      drawWelcomeCard();
    } else if (name === 'college') {
      refreshCollegeHeroChoices();
      drawCollegeCard();
    } else if (typeof window.activateWorkspace === 'function') {
      try { window.activateWorkspace(name); } catch (_) {}
    }
  }

  function roundedRectPath(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  let welcomeHeroRecords = [];
  let welcomeHeroImage = null;
  let welcomeDropProgress = 1;
  let welcomeAnimationFrame = 0;

  function welcomeEls() {
    return {
      select: document.getElementById('welcomeHeroSelect'),
      project: document.getElementById('welcomeProjectName'),
      canvas: document.getElementById('welcomeCanvas'),
      status: document.getElementById('welcomeStatus'),
      fallback: document.getElementById('welcomeDownloadFallback'),
      videoFallback: document.getElementById('welcomeVideoDownloadFallback')
    };
  }

  async function refreshWelcomeHeroChoices(preferredId = '') {
    const e = welcomeEls();
    if (!e.select) return [];
    try {
      const records = await getUnifiedAthletesCompat();
      welcomeHeroRecords = records.filter(item => item && item.heroBlob);
      const previous = preferredId || e.select.value;
      e.select.innerHTML = '<option value="">Select an available Hero Card</option>';
      welcomeHeroRecords.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.id;
        opt.textContent = `${item.first || ''} ${item.last || ''} — Class of ${item.year || '—'}`.trim();
        e.select.appendChild(opt);
      });
      if (previous && welcomeHeroRecords.some(x => x.id === previous)) e.select.value = previous;
      if (!welcomeHeroRecords.length) e.status.textContent = 'No available Hero Cards found. Create and save a Hero Card first.';
      return welcomeHeroRecords;
    } catch (err) {
      e.status.textContent = `Could not load Hero Cards: ${err.message}`;
      return [];
    }
  }

  async function loadWelcomeHero(id) {
    const e = welcomeEls();
    const record = welcomeHeroRecords.find(item => item.id === id);
    if (!record || !record.heroBlob) {
      welcomeHeroImage = null;
      drawWelcomeCard();
      return;
    }
    const url = URL.createObjectURL(record.heroBlob);
    const img = new Image();
    img.onload = () => {
      welcomeHeroImage = img;
      welcomeDropProgress = 1;
      e.project.value = `Welcome Aboard — ${record.first || ''} ${record.last || ''}`.trim();
      drawWelcomeCard();
      e.status.textContent = `Using locked Hero Card: ${record.first || ''} ${record.last || ''}`.trim();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      e.status.textContent = 'Could not open the saved Hero Card.';
    };
    img.src = url;
  }

  function drawWelcomeOverlay(ctx, progress = 1) {
    const p = Math.max(0, Math.min(1, progress));
    const eased = 1 - Math.pow(1 - p, 3);
    const finalX = 585;
    const finalY = 1062;
    const startX = 1180;
    const startY = 1420;
    const x = startX + (finalX - startX) * eased;
    const y = startY + (finalY - startY) * eased;
    const angle = (-11 * Math.PI / 180) + ((1 - p) * 5 * Math.PI / 180);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    const w = 560, h = 230;

    ctx.save();
    ctx.translate(14, 18);
    roundedRectPath(ctx, 0, 0, w, h, 5);
    ctx.fillStyle = 'rgba(2,18,40,.86)';
    ctx.fill();
    ctx.restore();

    roundedRectPath(ctx, 0, 0, w, h, 5);
    ctx.fillStyle = '#f4511e';
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,248,236,.86)';
    ctx.stroke();

    ctx.save();
    ctx.translate(12, 12);
    roundedRectPath(ctx, 0, 0, w - 24, h - 24, 3);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255,248,236,.50)';
    ctx.stroke();
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff8ec';
    ctx.strokeStyle = 'rgba(6,26,49,.22)';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(2,18,40,.28)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 2;

    const family = '"Avenir Next Condensed","Helvetica Neue Condensed","Arial Narrow",Impact,sans-serif';
    ctx.font = `italic 900 72px ${family}`;
    ctx.strokeText('WELCOME', w / 2, 77);
    ctx.fillText('WELCOME', w / 2, 77);
    ctx.font = `italic 900 78px ${family}`;
    ctx.strokeText('ABOARD', w / 2, 155);
    ctx.fillText('ABOARD', w / 2, 155);

    ctx.restore();
  }

  function drawWelcomeCard() {
    const e = welcomeEls();
    if (!e.canvas) return;
    const ctx = e.canvas.getContext('2d');
    ctx.clearRect(0, 0, e.canvas.width, e.canvas.height);

    if (welcomeHeroImage) {
      const iw = welcomeHeroImage.naturalWidth || welcomeHeroImage.width || 1080;
      const ih = welcomeHeroImage.naturalHeight || welcomeHeroImage.height || 1350;
      const scale = Math.max(1080 / iw, 1350 / ih);
      const dw = iw * scale, dh = ih * scale;
      ctx.drawImage(welcomeHeroImage, (1080 - dw) / 2, (1350 - dh) / 2, dw, dh);
      drawWelcomeOverlay(ctx, welcomeDropProgress);
    } else {
      ctx.fillStyle = '#06142c';
      ctx.fillRect(0, 0, 1080, 1350);
      ctx.fillStyle = 'rgba(255,255,255,.86)';
      ctx.textAlign = 'center';
      ctx.font = '600 34px Arial,sans-serif';
      ctx.fillText('Select an available Hero Card', 540, 675);
    }
  }

  function playWelcomeDrop() {
    if (!welcomeHeroImage) return;
    cancelAnimationFrame(welcomeAnimationFrame);
    const duration = 720;
    const started = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - started) / duration);
      const settle = t < .84 ? (t / .84) : 1 + Math.sin((t - .84) / .16 * Math.PI) * .018;
      welcomeDropProgress = Math.min(1.018, settle);
      drawWelcomeCard();
      if (t < 1) welcomeAnimationFrame = requestAnimationFrame(frame);
      else {
        welcomeDropProgress = 1;
        drawWelcomeCard();
      }
    }
    welcomeAnimationFrame = requestAnimationFrame(frame);
  }

  async function saveCanvasToLegacy(collection, name, selected, canvas) {
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('Could not render PNG.')), 'image/png');
    });
    await legacyPut({
      id: `${collection}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      type: 'creative',
      collection,
      name,
      first: selected.first || '',
      last: selected.last || '',
      year: selected.year || '',
      heroSourceId: selected.id || '',
      blob,
      created: new Date().toISOString()
    });
    return blob;
  }

  function triggerBlobDownload(blob, filename, fallback) {
    const url = URL.createObjectURL(blob);
    fallback.href = url;
    fallback.download = filename;
    fallback.textContent = `Download ${filename}`;
    fallback.style.display = 'block';
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  async function exportCanvasVideo(canvas, drawFrame, filename) {
    if (!canvas.captureStream || typeof MediaRecorder === 'undefined') {
      throw new Error('Video export is not supported in this browser.');
    }
    const stream = canvas.captureStream(30);
    let mime = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mime)) mime = 'video/webm;codecs=vp8';
    if (!MediaRecorder.isTypeSupported(mime)) mime = 'video/webm';

    const chunks = [];
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6000000 });
    recorder.ondataavailable = ev => { if (ev.data && ev.data.size) chunks.push(ev.data); };
    const done = new Promise((resolve, reject) => {
      recorder.onstop = resolve;
      recorder.onerror = ev => reject(ev.error || new Error('Video recording failed.'));
    });

    recorder.start();
    const started = performance.now();
    const duration = 2200;
    function frame(now) {
      const elapsed = now - started;
      drawFrame(Math.min(1, elapsed / 900));
      if (elapsed < duration) requestAnimationFrame(frame);
      else {
        drawFrame(1);
        setTimeout(() => recorder.stop(), 120);
      }
    }
    requestAnimationFrame(frame);
    await done;
    return { blob: new Blob(chunks, { type: mime }), filename: `${filename}.webm` };
  }

  let collegeHeroRecords = [];
  let collegeHeroImage = null;
  let collegeLogoImage = null;
  let collegeLogoTrimmedCanvas = null;
  let collegeDropProgress = 1;
  let collegeAnimationFrame = 0;

  function collegeEls() {
    return {
      select: document.getElementById('collegeHeroSelect'),
      project: document.getElementById('collegeProjectName'),
      logo: document.getElementById('collegeLogoUpload'),
      canvas: document.getElementById('collegeCanvas'),
      status: document.getElementById('collegeStatus'),
      fallback: document.getElementById('collegeDownloadFallback'),
      videoFallback: document.getElementById('collegeVideoDownloadFallback')
    };
  }

  async function refreshCollegeHeroChoices(preferredId = '') {
    const e = collegeEls();
    if (!e.select) return [];
    try {
      const records = await getUnifiedAthletesCompat();
      collegeHeroRecords = records.filter(item => item && item.heroBlob);
      const previous = preferredId || e.select.value;
      e.select.innerHTML = '<option value="">Select an available Hero Card</option>';
      collegeHeroRecords.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.id;
        opt.textContent = `${item.first || ''} ${item.last || ''} — Class of ${item.year || '—'}`.trim();
        e.select.appendChild(opt);
      });
      if (previous && collegeHeroRecords.some(x => x.id === previous)) e.select.value = previous;
      if (!collegeHeroRecords.length) e.status.textContent = 'No available Hero Cards found. Create and save a Hero Card first.';
      return collegeHeroRecords;
    } catch (err) {
      e.status.textContent = `Could not load Hero Cards: ${err.message}`;
      return [];
    }
  }

  async function loadCollegeHero(id) {
    const e = collegeEls();
    const record = collegeHeroRecords.find(item => item.id === id);
    if (!record || !record.heroBlob) {
      collegeHeroImage = null;
      drawCollegeCard();
      return;
    }
    const url = URL.createObjectURL(record.heroBlob);
    const img = new Image();
    img.onload = () => {
      collegeHeroImage = img;
      collegeDropProgress = 1;
      e.project.value = `College Announcement — ${record.first || ''} ${record.last || ''}`.trim();
      drawCollegeCard();
      e.status.textContent = `Using locked Hero Card: ${record.first || ''} ${record.last || ''}`.trim();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      e.status.textContent = 'Could not open the saved Hero Card.';
    };
    img.src = url;
  }

  function trimCollegeArtwork(img) {
    const iw = img.naturalWidth || img.width || 1;
    const ih = img.naturalHeight || img.height || 1;
    const src = document.createElement('canvas');
    src.width = iw;
    src.height = ih;
    const sctx = src.getContext('2d', { willReadFrequently: true });
    sctx.drawImage(img, 0, 0, iw, ih);

    let data;
    try { data = sctx.getImageData(0, 0, iw, ih); }
    catch (_) { return src; }

    const px = data.data;
    const isBorder = (x, y) => {
      const i = (y * iw + x) * 4;
      const r = px[i], g = px[i + 1], b = px[i + 2], a = px[i + 3];
      if (a < 18) return true;
      return r > 246 && g > 246 && b > 246;
    };

    let left = 0, right = iw - 1, top = 0, bottom = ih - 1;
    const rowMostlyBorder = (y, l, r) => {
      let border = 0, total = Math.max(1, r - l + 1);
      for (let x = l; x <= r; x++) if (isBorder(x, y)) border++;
      return border / total > .985;
    };
    const colMostlyBorder = (x, t, b) => {
      let border = 0, total = Math.max(1, b - t + 1);
      for (let y = t; y <= b; y++) if (isBorder(x, y)) border++;
      return border / total > .985;
    };

    while (top < bottom && rowMostlyBorder(top, left, right)) top++;
    while (bottom > top && rowMostlyBorder(bottom, left, right)) bottom--;
    while (left < right && colMostlyBorder(left, top, bottom)) left++;
    while (right > left && colMostlyBorder(right, top, bottom)) right--;

    const pad = Math.max(0, Math.round(Math.min(iw, ih) * .004));
    left = Math.max(0, left - pad);
    top = Math.max(0, top - pad);
    right = Math.min(iw - 1, right + pad);
    bottom = Math.min(ih - 1, bottom + pad);

    const cw = Math.max(1, right - left + 1);
    const ch = Math.max(1, bottom - top + 1);
    const out = document.createElement('canvas');
    out.width = cw;
    out.height = ch;
    out.getContext('2d').drawImage(src, left, top, cw, ch, 0, 0, cw, ch);
    return out;
  }

  function loadCollegeLogo(file) {
    const e = collegeEls();
    if (!file) {
      collegeLogoImage = null;
      collegeLogoTrimmedCanvas = null;
      drawCollegeCard();
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      collegeLogoImage = img;
      collegeLogoTrimmedCanvas = trimCollegeArtwork(img);
      drawCollegeCard();
      e.status.textContent = 'Official school artwork loaded and edge-trimmed.';
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      e.status.textContent = 'Could not load that logo file.';
    };
    img.src = url;
  }

  function drawCollegeStamp(ctx, progress = 1) {
    if (!collegeLogoImage) return;

    const p = Math.max(0, Math.min(1, progress));
    const eased = 1 - Math.pow(1 - p, 3);
    const finalX = 540, finalY = 915;
    const startX = 540, startY = 150;
    const x = startX + (finalX - startX) * eased;
    const y = startY + (finalY - startY) * eased;

    const art = collegeLogoTrimmedCanvas || collegeLogoImage;
    const iw = art.width || art.naturalWidth || 1;
    const ih = art.height || art.naturalHeight || 1;
    const maxArtW = 1045;
    const maxArtH = 270;
    const scale = Math.min(maxArtW / iw, maxArtH / ih);
    const artW = iw * scale, artH = ih * scale;

    ctx.save();
    ctx.translate(x, y);

    const bgPadX = 14;
    const bgPadY = 10;
    const bgW = artW + bgPadX * 2;
    const bgH = artH + bgPadY * 2;

    ctx.save();
    ctx.shadowColor = 'rgba(2,18,40,.28)';
    ctx.shadowBlur = 9;
    ctx.shadowOffsetY = 4;
    roundedRectPath(ctx, -bgW / 2, -bgH / 2, bgW, bgH, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();

    ctx.drawImage(art, -artW / 2, -artH / 2, artW, artH);
    ctx.restore();
  }

  function drawCollegeCard() {
    const e = collegeEls();
    if (!e.canvas) return;
    const ctx = e.canvas.getContext('2d');
    ctx.clearRect(0, 0, e.canvas.width, e.canvas.height);

    if (collegeHeroImage) {
      const iw = collegeHeroImage.naturalWidth || collegeHeroImage.width || 1080;
      const ih = collegeHeroImage.naturalHeight || collegeHeroImage.height || 1350;
      const scale = Math.max(1080 / iw, 1350 / ih);
      const dw = iw * scale, dh = ih * scale;
      ctx.drawImage(collegeHeroImage, (1080 - dw) / 2, (1350 - dh) / 2, dw, dh);
      drawCollegeStamp(ctx, collegeDropProgress);
    } else {
      ctx.fillStyle = '#06142c';
      ctx.fillRect(0, 0, 1080, 1350);
      ctx.fillStyle = 'rgba(255,255,255,.86)';
      ctx.textAlign = 'center';
      ctx.font = '600 34px Arial,sans-serif';
      ctx.fillText('Select an available Hero Card', 540, 675);
    }
  }

  function playCollegeDrop() {
    if (!collegeHeroImage) return;
    cancelAnimationFrame(collegeAnimationFrame);
    const duration = 720, started = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - started) / duration);
      collegeDropProgress = t < .84 ? (t / .84) : 1 + Math.sin((t - .84) / .16 * Math.PI) * .018;
      drawCollegeCard();
      if (t < 1) collegeAnimationFrame = requestAnimationFrame(frame);
      else {
        collegeDropProgress = 1;
        drawCollegeCard();
      }
    }
    collegeAnimationFrame = requestAnimationFrame(frame);
  }

  function cleanFilename(value, fallback) {
    return (value || fallback).replace(/[^a-z0-9 _—-]+/gi, '').trim() || fallback;
  }

  async function saveWelcome() {
    const e = welcomeEls();
    if (!welcomeHeroImage) {
      e.status.textContent = 'Choose a saved Hero Card first.';
      return;
    }
    welcomeDropProgress = 1;
    drawWelcomeCard();
    try {
      const selected = welcomeHeroRecords.find(item => item.id === e.select.value) || {};
      const name = (e.project.value || 'Welcome Aboard').trim();
      await saveCanvasToLegacy('welcome', name, selected, e.canvas);

      const key = 'christchurch_welcome_aboard_saves_v1';
      const existing = safeParse(localStorage.getItem(key) || '[]', []);
      const rows = Array.isArray(existing) ? existing : [];
      rows.unshift({
        id: `welcome_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name,
        first: selected.first || '',
        last: selected.last || '',
        year: selected.year || '',
        heroSourceId: selected.id || '',
        created: new Date().toISOString()
      });
      localStorage.setItem(key, JSON.stringify(rows.slice(0, 100)));
      e.status.textContent = 'Welcome Aboard saved.';
    } catch (err) {
      e.status.textContent = `Save failed: ${err.message}`;
    }
  }

  function exportWelcomePng() {
    const e = welcomeEls();
    if (!welcomeHeroImage) {
      e.status.textContent = 'Choose a saved Hero Card first.';
      return;
    }
    welcomeDropProgress = 1;
    drawWelcomeCard();
    e.canvas.toBlob(blob => {
      if (!blob) {
        e.status.textContent = 'Could not create PNG.';
        return;
      }
      const project = cleanFilename(e.project.value, 'Welcome Aboard');
      triggerBlobDownload(blob, `${project}.png`, e.fallback);
      e.status.textContent = 'Welcome Aboard PNG prepared.';
    }, 'image/png');
  }

  async function exportWelcomeVideo() {
    const e = welcomeEls();
    if (!welcomeHeroImage) {
      e.status.textContent = 'Choose a saved Hero Card first.';
      return;
    }
    const project = cleanFilename(e.project.value, 'Welcome Aboard');
    const result = await exportCanvasVideo(e.canvas, p => {
      welcomeDropProgress = p;
      drawWelcomeCard();
    }, project);
    triggerBlobDownload(result.blob, result.filename, e.videoFallback);
    welcomeDropProgress = 1;
    drawWelcomeCard();
    e.status.textContent = 'Welcome Aboard video prepared.';
  }

  async function saveCollege() {
    const e = collegeEls();
    if (!collegeHeroImage) {
      e.status.textContent = 'Choose a saved Hero Card first.';
      return;
    }
    if (!collegeLogoImage) {
      e.status.textContent = 'Upload the official school artwork first.';
      return;
    }
    collegeDropProgress = 1;
    drawCollegeCard();
    try {
      const selected = collegeHeroRecords.find(item => item.id === e.select.value) || {};
      await saveCanvasToLegacy('college', e.project.value || 'College Announcement', selected, e.canvas);
      e.status.textContent = 'College Announcement saved.';
    } catch (err) {
      e.status.textContent = `Save failed: ${err.message}`;
    }
  }

  function exportCollegePng() {
    const e = collegeEls();
    if (!collegeHeroImage || !collegeLogoImage) {
      e.status.textContent = 'Choose a Hero Card and upload the official school artwork first.';
      return;
    }
    collegeDropProgress = 1;
    drawCollegeCard();
    e.canvas.toBlob(blob => {
      if (!blob) {
        e.status.textContent = 'Could not create PNG.';
        return;
      }
      const project = cleanFilename(e.project.value, 'College Announcement');
      triggerBlobDownload(blob, `${project}.png`, e.fallback);
      e.status.textContent = 'College Announcement PNG prepared.';
    }, 'image/png');
  }

  async function exportCollegeVideo() {
    const e = collegeEls();
    if (!collegeHeroImage || !collegeLogoImage) {
      e.status.textContent = 'Choose a Hero Card and upload the official school artwork first.';
      return;
    }
    const project = cleanFilename(e.project.value, 'College Announcement');
    const result = await exportCanvasVideo(e.canvas, p => {
      collegeDropProgress = p;
      drawCollegeCard();
    }, project);
    triggerBlobDownload(result.blob, result.filename, e.videoFallback);
    collegeDropProgress = 1;
    drawCollegeCard();
    e.status.textContent = 'College Announcement video prepared.';
  }

  function bindWorkspaceEvents() {
    document.getElementById('welcomeHeroSelect')?.addEventListener('change', e => loadWelcomeHero(e.target.value));
    document.getElementById('welcomeBackBtn')?.addEventListener('click', () => showWorkspace('templates'));
    document.getElementById('welcomePlayBtn')?.addEventListener('click', playWelcomeDrop);
    document.getElementById('welcomeSaveBtn')?.addEventListener('click', saveWelcome);
    document.getElementById('welcomeExportBtn')?.addEventListener('click', exportWelcomePng);
    document.getElementById('welcomeExportVideoBtn')?.addEventListener('click', () => {
      exportWelcomeVideo().catch(err => {
        welcomeEls().status.textContent = `Video export failed: ${err.message}`;
      });
    });

    document.getElementById('collegeHeroSelect')?.addEventListener('change', e => loadCollegeHero(e.target.value));
    document.getElementById('collegeLogoUpload')?.addEventListener('change', e => loadCollegeLogo(e.target.files?.[0]));
    document.getElementById('collegeBackBtn')?.addEventListener('click', () => showWorkspace('templates'));
    document.getElementById('collegePlayBtn')?.addEventListener('click', playCollegeDrop);
    document.getElementById('collegeSaveBtn')?.addEventListener('click', saveCollege);
    document.getElementById('collegeExportBtn')?.addEventListener('click', exportCollegePng);
    document.getElementById('collegeExportVideoBtn')?.addEventListener('click', () => {
      exportCollegeVideo().catch(err => {
        collegeEls().status.textContent = `Video export failed: ${err.message}`;
      });
    });
  }

  function templateRowExists(id) {
    const root = document.getElementById('templateLibraryList');
    if (!root) return false;
    return !!root.querySelector(`[data-csms-template-id="${id}"]`);
  }

  function nativeTemplateVisible(id, name) {
    const root = document.getElementById('templateLibraryList');
    if (!root) return false;
    const text = root.textContent || '';
    return text.includes(name) || text.includes(id);
  }

  function addRecoveredTemplateRow(master, targetWorkspace) {
    const list = document.getElementById('templateLibraryList');
    if (!list) return;
    if (templateRowExists(master.id) || nativeTemplateVisible(master.id, master.name)) return;

    const row = document.createElement('div');
    row.className = 'csmsRecoveredTemplateRow';
    row.dataset.csmsTemplateId = master.id;

    const icon = document.createElement('div');
    icon.className = 'csmsIcon';
    icon.textContent = 'T';

    const label = document.createElement('div');
    label.textContent = `${master.name} • ${master.category} • v${master.version}`;

    const open = document.createElement('button');
    open.className = 'secondary';
    open.type = 'button';
    open.textContent = 'Open';
    open.addEventListener('click', () => showWorkspace(targetWorkspace));

    row.append(icon, label, open);
    list.appendChild(row);
  }

  function ensureTemplateLibraryRows() {
    addRecoveredTemplateRow(MASTER_TEMPLATES[1], 'welcome');
    addRecoveredTemplateRow(MASTER_TEMPLATES[2], 'college');
  }

  function monitorTemplateLibrary() {
    const install = () => {
      const list = document.getElementById('templateLibraryList');
      if (!list) return false;
      ensureTemplateLibraryRows();

      const observer = new MutationObserver(() => {
        queueMicrotask(ensureTemplateLibraryRows);
      });
      observer.observe(list, { childList: true, subtree: false });
      return true;
    };

    if (install()) return;
    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      if (install() || tries > 120) clearInterval(timer);
    }, 250);
  }

  function diagnostic() {
    const templates = readTemplates();
    return {
      ok: true,
      moduleVersion: MODULE_VERSION,
      templateCount: templates.length,
      required: MASTER_TEMPLATES.map(master => ({
        id: master.id,
        name: master.name,
        present: templates.some(item => item && item.id === master.id)
      })),
      workspaces: {
        welcome: !!document.getElementById('workspace-welcome'),
        college: !!document.getElementById('workspace-college')
      },
      mediaBridgeUntouched: true
    };
  }

  async function init() {
    if (window.__CSMS_TEMPLATE_RECOVERY_V1_INITIALIZED__) return diagnostic();
    window.__CSMS_TEMPLATE_RECOVERY_V1_INITIALIZED__ = true;

    injectStyles();
    const merge = mergeTemplates();
    ensureWorkspaces();
    bindWorkspaceEvents();
    monitorTemplateLibrary();

    try { await ensureLegacyWelcomeMaster(); } catch (_) {}

    drawWelcomeCard();
    drawCollegeCard();

    console.info('[CSMS Template Recovery]', { moduleVersion: MODULE_VERSION, merge });
    return diagnostic();
  }

  window.CSMSTemplateRecovery = {
    version: MODULE_VERSION,
    init,
    diagnostic,
    mergeTemplates,
    openWelcome: () => showWorkspace('welcome'),
    openCollege: () => showWorkspace('college'),
    openTemplates: () => showWorkspace('templates'),
    refreshWelcomeHeroChoices,
    refreshCollegeHeroChoices
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init());
  } else {
    init();
  }
})();
