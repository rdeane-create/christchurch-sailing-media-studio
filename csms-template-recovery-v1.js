(function(){
'use strict';
// Legacy template recovery and Hero override loaders are intentionally disabled.
// The production Studio now uses the native Hero implementation in index.html as
// the single source of truth for Hero rendering, editing, save/reopen, and export.
const VERSION='20260812-native-hero-authoritative-v1';
window.__CSMS_NATIVE_HERO_AUTHORITATIVE__={version:VERSION,active:true};
console.info('[CSMS] Native Studio Hero is authoritative; legacy/rebuild Hero overrides are disabled.',VERSION);
})();
