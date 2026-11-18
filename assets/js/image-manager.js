/* Mirchoni V6: offline-first photography; no third-party hotlinks. */
(()=>{'use strict';
const fallback='assets/img/fallback.svg';
function protect(img){
 if(!img||img.dataset.localGuard==='1')return;
 img.dataset.localGuard='1';
 img.addEventListener('error',()=>{
  if(img.dataset.fallbackApplied==='1')return;
  img.dataset.fallbackApplied='1';img.removeAttribute('srcset');img.src=fallback;
 });
}
function enhance(img){protect(img);return img}
function activate(root=document){root.querySelectorAll('img').forEach(protect)}
function show(img,url){
 if(!img||!url)return;
 protect(img);
 const preload=new Image();preload.decoding='async';
 preload.onload=async()=>{
  try{await preload.decode?.()}catch{}
  if(!img.isConnected)return;
  img.dataset.fallbackApplied='0';img.removeAttribute('srcset');img.src=url;
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
   img.animate([{opacity:.55,transform:'scale(1.014)'},{opacity:1,transform:'scale(1)'}],{duration:380,easing:'ease-out'});
  }
 };
 preload.onerror=()=>{if(!img.getAttribute('src'))img.src=fallback};
 preload.src=url;
}
const obs=new MutationObserver(list=>{list.forEach(record=>record.addedNodes.forEach(node=>{
 if(node.nodeType!==1)return;
 if(node.matches?.('img'))protect(node);
 node.querySelectorAll?.('img').forEach(protect);
}))});
obs.observe(document.documentElement,{subtree:true,childList:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>activate(),{once:true});else activate();
window.MirchoniImages={enhance,activate,show,localFor:(u)=>u};
})();
