/* Keep the original Drive channel in a first-party Studio window. Never relay credentials. */
(function(){
'use strict';
const params=new URLSearchParams(location.search),helper=params.get('driveRelay')==='1',embedded=window.parent!==window&&params.get('csos')==='1',origin=location.origin;
if(!helper&&!embedded)return;
const actions=new Set(['listSavedCards','getSavedCard','getMedia','listMedia','findMedia','uploadMedia']);
const pending=new Map();let api=null,peer=null,channel=helper?params.get('channel'):'',connected=false,opening=null,poll=null;
const validToken=value=>typeof value==='string'&&/^[a-f0-9-]{32,100}$/i.test(value);
const message=(target,type,payload={})=>target?.postMessage({source:'csms-drive-relay',type,channel,payload},origin);
function rejectPending(messageText){for(const entry of pending.values()){clearTimeout(entry.timeout);entry.reject(Error(messageText));}pending.clear();}
function state(text){const status=document.getElementById('studioDriveRelayStatus');if(status)status.textContent=text;}
if(helper){
 if(!window.opener||!validToken(channel))return;
 peer=window.opener;
 document.documentElement.classList.add('studio-drive-relay-helper');
 const style=document.createElement('style');style.textContent='.studio-drive-relay-helper body>:not(#studioDriveRelayPanel):not(script){display:none!important}#studioDriveRelayPanel{font:16px system-ui;background:#f5f7f5;color:#102b39;padding:28px;max-width:560px;margin:30px auto}#studioDriveRelayPanel button{padding:12px 18px;margin:12px 0}';document.head.append(style);
 const mount=()=>{const panel=document.createElement('section');panel.id='studioDriveRelayPanel';const heading=document.createElement('h1');heading.textContent='Sailing Portal · Card library';const status=document.createElement('p');status.id='studioDriveRelayStatus';status.textContent='Connecting your existing Google Drive library…';const help=document.createElement('p');help.textContent='Keep this window open while using Media Studio. Your lineup preview stays in Sailing Portal. Original photos and saved cards remain unchanged.';const button=document.createElement('button');button.type='button';button.textContent='Connect Google Drive';button.onclick=async()=>{button.disabled=true;try{if(!api)throw Error('Studio is starting. Try again in a moment.');await api.connect();await api.call('listSavedCards',{});state('Card library connected. Return to Sailing Portal and click Retry preview.');}catch(error){state(error.message||'Google Drive could not connect.');}finally{button.disabled=false;}};panel.append(heading,status,button,help);document.body.append(panel);};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
}
window.addEventListener('message',async event=>{
 const data=event.data;if(event.origin!==origin||event.source!==peer||data?.source!=='csms-drive-relay'||data.channel!==channel||!validToken(channel))return;
 if(helper){
  if(data.type==='connect'&&api){message(peer,'ready');return;}
  if(data.type!=='request'||!api)return;
  const {requestId,action,payload}=data.payload||{};
  if(typeof requestId!=='string'||!actions.has(action)||JSON.stringify(payload||{}).length>30000000){message(peer,'result',{requestId,error:'Unsupported Studio library request.'});return;}
  try{const result=await api.call(action,payload||{});state('Card library connected. Keep this window open and return to Sailing Portal.');message(peer,'result',{requestId,result});}catch(error){state(error.message||'Google Drive could not connect.');message(peer,'result',{requestId,error:error.message||'Google Drive could not connect.'});}
 }else{
  if(data.type==='ready'){connected=true;opening?.resolve();return;}
  if(data.type==='result'){const entry=pending.get(data.payload?.requestId);if(!entry)return;pending.delete(data.payload.requestId);clearTimeout(entry.timeout);data.payload.error?entry.reject(Error(data.payload.error)):entry.resolve(data.payload.result);}
 }
});
window.CSMSDriveRelay={
 embedded,
 attach(nativeApi){api=nativeApi;if(helper)message(peer,'ready');},
 async connect(){
  if(helper||!embedded)return;
  if(peer&&!peer.closed&&connected)return;
  if(opening)return opening.promise;
  if(peer&&!peer.closed)peer.close();channel=crypto.randomUUID();connected=false;
  const url=new URL(location.href);url.search='?driveRelay=1&channel='+encodeURIComponent(channel)+'&v=20261025-relay';url.hash='';
  peer=window.open(url.href,'csms-card-library-'+channel,'popup,width=640,height=440,resizable=yes,scrollbars=yes');
  if(!peer)throw Error('Allow the card-library window to open, then click Connect card library again.');
  let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});opening={promise,resolve,reject};
  const timeout=setTimeout(()=>{opening?.reject(Error('The card-library window did not connect. Reopen it and retry.'));},20000);
  if(poll)clearInterval(poll);poll=setInterval(()=>{if(!peer||peer.closed){connected=false;opening?.reject(Error('The card-library window was closed. Click Connect card library to reopen it.'));rejectPending('The card-library window was closed. Reconnect it and retry.');clearInterval(poll);poll=null;}else if(!connected)message(peer,'connect');},350);
  message(peer,'connect');
  try{await promise;}catch(error){if(poll)clearInterval(poll);poll=null;throw error;}finally{clearTimeout(timeout);opening=null;}
 },
 async ensure(){if(peer&&!peer.closed&&connected)return;if(opening)return opening.promise;throw Error('Connect card library below to load original athlete cards in Sailing Portal.');},
 async call(action,payload={}){
  if(!actions.has(action))throw Error('Unsupported Studio library request.');
  await this.ensure();const requestId=crypto.randomUUID();
  return new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{pending.delete(requestId);reject(Error('The card-library request timed out. Check the library window and retry.'));},35000);pending.set(requestId,{resolve,reject,timeout});message(peer,'request',{requestId,action,payload});});
 }
};
window.addEventListener('pagehide',()=>{rejectPending('Studio connection closed.');if(poll)clearInterval(poll);if(embedded&&peer&&!peer.closed)peer.close();});
})();
