(function(){
'use strict';
let tries=0;
const timer=setInterval(()=>{
  tries++;
  const hero=window.__CSMS_HERO_REBUILD__;
  if(hero&&typeof hero.render==='function'){
    window.drawHeroCard=hero.render;
    clearInterval(timer);
    console.info('[CSMS Hero compatibility] Studio Hero renderer redirected to rebuild.');
    return;
  }
  if(tries>100)clearInterval(timer);
},50);
})();
