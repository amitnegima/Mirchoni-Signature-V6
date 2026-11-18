/* Installable PWA controls. Works without frameworks and stays optional. */
(() => {
 'use strict';
 const qs = (s,c=document)=>c.querySelector(s);
 const qsa = (s,c=document)=>[...c.querySelectorAll(s)];
 const standalone=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 const onIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1);
 const isSecure=window.isSecureContext && /https?:/.test(location.protocol);
 let deferred=null; let awaitingUpdate=false; let swRegistration=null;let activeInstallTrigger=null;
 // Light motion and compositing are adaptive rather than forcing a GPU layer for every element.
 const conn=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
 const lowPower=!!conn?.saveData||(navigator.deviceMemory&&navigator.deviceMemory<=4)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4);
 if(lowPower)document.documentElement.classList.add('lite-motion');
 const bar=document.createElement('div');bar.id='network-status';bar.className='network-status';bar.setAttribute('role','status');bar.hidden=navigator.onLine;
 bar.textContent='Offline mode · cached pages and saved photos available';document.body.append(bar);
 const checkNetwork=()=>{bar.hidden=navigator.onLine};window.addEventListener('online',checkNetwork);window.addEventListener('offline',checkNetwork);
 const markup=`<dialog class="pwa-dialog" id="pwa-dialog" aria-labelledby="pwa-dialog-title"><div class="pwa-dialog-content"><button type="button" id="pwa-dialog-close" class="pwa-dialog-close" aria-label="Close">×</button><span class="pwa-dialog-eyebrow">MIRCHONI · IN YOUR POCKET</span><div class="pwa-dialog-art" aria-hidden="true"><span>✳</span><strong>M</strong><small>THE HILLS AWAIT</small></div><h2 id="pwa-dialog-title">Make every visit <em>feel like an escape.</em></h2><p id="pwa-dialog-copy">Add Mirchoni to your home screen for quick access to cottages, resort details and your saved favourites.</p><div class="pwa-dialog-steps" id="pwa-dialog-steps"></div><button type="button" class="pwa-dialog-primary" id="pwa-dialog-primary">Got it</button><p class="pwa-dialog-foot">Basic pages work after the first online visit. Fresh prices, WhatsApp enquiries and uncached photos require internet.</p></div></dialog>`;
 document.body.insertAdjacentHTML('beforeend',markup);
 const dialog=qs('#pwa-dialog');const close=()=>dialog.open&&dialog.close();qs('#pwa-dialog-close').addEventListener('click',close);qs('#pwa-dialog-primary').addEventListener('click',close);dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
 function showHelp(){
  let steps;
  if(!isSecure)steps='<b>To enable installation:</b><span>Open this site after deploying it to Vercel (HTTPS), or use localhost for testing. A downloaded HTML file cannot register its service worker.</span>';
  else if(onIOS)steps='<b>Install on iPhone / iPad</b><span>1. Open this site in Safari.</span><span>2. Tap the Share icon in Safari.</span><span>3. Choose “Add to Home Screen” and tap Add.</span>';
  else steps='<b>Install on your device</b><span>1. Open the browser menu (⋮ or ⋯).</span><span>2. Choose “Install app” or “Add to Home screen” if available.</span><span>3. Confirm to add Mirchoni to your apps.</span>';
  qs('#pwa-dialog-steps').innerHTML=steps;
  if(!dialog.open)dialog.showModal();
 }
 function markInstalled(){document.documentElement.classList.add('pwa-installed');qsa('[data-install-app]').forEach(b=>{b.hidden=true})}
 async function onInstallClick(){
  if(standalone){markInstalled();return}
  if(deferred){
    const prompt=deferred;deferred=null;
    try{await prompt.prompt();const result=await prompt.userChoice;if(result.outcome==='accepted')markInstalled()}catch{showHelp()}
  }else showHelp();
 }
 function makeInstallButton(){
  const header=qs('.header-right')||qs('.site-header');
  const button=document.createElement('button');button.id='pwa-install-top';button.dataset.installApp='';button.className='pwa-install-top';button.type='button';button.setAttribute('aria-label','Install Mirchoni on your device');button.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v3h16v-3"/></svg><span>Get the app</span>';
  if(header){const hamburger=qs('.hamburger',header)||qs('.menu-toggle',header);header.insertBefore(button,hamburger||null)}else{button.classList.add('pwa-floating');document.body.append(button)}
  return button;
 }
 makeInstallButton();
 document.addEventListener('click',e=>{const b=e.target.closest('[data-install-app]');if(b){e.preventDefault();activeInstallTrigger=b;onInstallClick()}});
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferred=event;document.documentElement.classList.add('pwa-can-install')});
 window.addEventListener('appinstalled',()=>{deferred=null;markInstalled()});
 if(standalone)markInstalled();
 function showUpdate(){
  if(qs('#pwa-update'))return;
  const node=document.createElement('div');node.id='pwa-update';node.className='pwa-update';node.setAttribute('role','status');node.innerHTML='<span>A refreshed Mirchoni app is ready.</span><button type="button">Update now</button><button type="button" aria-label="Dismiss update" class="pwa-update-dismiss">×</button>';
  document.body.append(node);
  qs('.pwa-update-dismiss',node).addEventListener('click',()=>node.remove());
  qs('button',node).addEventListener('click',()=>{if(swRegistration?.waiting){awaitingUpdate=true;swRegistration.waiting.postMessage({type:'SKIP_WAITING'})}});
 }
 if('serviceWorker' in navigator && isSecure){
  window.addEventListener('load',()=>{
   navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(reg=>{
    swRegistration=reg;
    const track=w=>{if(!w)return;w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)showUpdate()})};
    if(reg.waiting&&navigator.serviceWorker.controller)showUpdate();
    reg.addEventListener('updatefound',()=>track(reg.installing));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)reg.update().catch(()=>{})});
   }).catch(()=>{});
  },{once:true});
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(awaitingUpdate){awaitingUpdate=false;location.reload()}});
 }
})();
