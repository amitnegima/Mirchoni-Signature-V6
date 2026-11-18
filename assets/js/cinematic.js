/* Mirchoni cinematic experience — vanilla JavaScript only. No booking backend or payment capture. */
(() => {
'use strict';
const $ = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => [...ctx.querySelectorAll(s)];
const currency = n => '₹' + Number(n).toLocaleString('en-IN');
/* Local photographic library. No external image server is required. */
const VIS={
 garden:'assets/img/ai/sunset-gardens.webp', reception:'assets/img/ai/golden-reception.webp', facade:'assets/img/ai/heritage-facade.webp',
 night:'assets/img/ai/moonlit-cottages.webp', lanterns:'assets/img/ai/moonlit-reception.webp', pathway:'assets/img/ai/rain-lit-path.webp', suite:'assets/img/ai/premium-suite.webp',
 realGarden:'assets/img/real/garden-day.webp',realBedroom:'assets/img/real/premium-room.webp',realFacade:'assets/img/real/exterior-day.webp',realHill:'assets/img/real/estate-hills.webp',realNight:'assets/img/real/night-walkway.webp',realReception:'assets/img/real/reception-night.webp',realCottages:'assets/img/real/night-cottages.webp'
};
function photo(path){
 const p=decodeURIComponent(path).toLowerCase();
 if(p.includes('premium-cottage-2'))return VIS.realBedroom;
 if(p.includes('premium-cottage'))return VIS.suite;
 if(p.includes('superior-cottage'))return VIS.facade;
 if(p.includes('heritage-family-cottage'))return VIS.garden;
 if(p.includes('outside-8'))return VIS.realNight;
 if(p.includes('outside-1'))return VIS.realFacade;
 if(p.includes('outside-5'))return VIS.realHill;
 if(p.includes('outside-6')||p.endsWith('/1.png'))return VIS.realGarden;
 if(p.endsWith('/3.png'))return VIS.lanterns;
 if(p.endsWith('/3.jpg'))return VIS.facade;
 if(p.endsWith('/4-2.jpg'))return VIS.reception;
 if(p.endsWith('/5-1.jpg'))return VIS.night;
 return VIS.garden;
}

const rooms=[
 {id:'superior',name:'Superior Cottage',area:'Garden & hill view',capacity:2,price:[12000,13500,15000],type:'couples',feature:'King-size bed',summary:'A charming, spacious heritage cottage for two, with an attached bathroom and views of the gardens and hills.',imgs:[photo('2021/09/Superior-Cottage-4-min.jpg'),photo('2021/09/Superior-Cottage-2-min.jpg'),photo('2021/09/Superior-Cottage-1-min.jpg'),photo('2021/09/Superior-Cottage-5-min.jpg')],official:'https://mirchoni.com/superior-cottage/'},
 {id:'premium',name:'Premium Cottage',area:'Garden & hill view',capacity:2,price:[16000,17500,19000],type:'couples',feature:'King-size bed',summary:'A generous cottage with a comfortable king-size bed, an attached bathroom and tranquil garden and hillside views.',imgs:[photo('2021/09/Premium-Cottage-2.jpg'),photo('2021/09/Premium-Cottage-3.jpg'),photo('2021/09/Premium-Cottage-4.jpg')],official:'https://mirchoni.com/premiumcottage/'},
 {id:'premium-heritage',name:'Premium Heritage Cottage',area:'Garden & hill view',capacity:2,price:[15000,16500,18000],type:'couples',feature:'Fireplace · King-size bed',summary:'A heritage-style cottage with a spacious room, king-size bed, wardrobe and fireplace — for a stay with old-world character.',imgs:[photo('2021/09/3.jpg'),photo('2021/09/4-2.jpg'),photo('2021/09/5-1.jpg')],official:'https://mirchoni.com/premium-heritage-cottage/'},
 {id:'heritage-family',name:'Heritage Family Cottage',area:'Garden, hill & selected lake views',capacity:4,price:[17000,20000,23000],type:'family',feature:'Up to 4 guests · Fireplace',summary:'A spacious family heritage cottage accommodating up to four guests, with a fireplace. Published rates vary by view and meal plan.',imgs:[photo('2021/09/Heritage-Family-Cottage%E2%80%8B-8.jpg'),photo('2021/09/Heritage-Family-Cottage%E2%80%8B-4.jpg'),photo('2021/09/Heritage-Family-Cottage%E2%80%8B-7.jpg'),photo('2021/09/Heritage-Family-Cottage%E2%80%8B-6.jpg')],official:'https://mirchoni.com/heritage-family-cottage/'}
];
const experiences=[
 {k:'01',title:'Garden mornings',text:'The luxury of waking up slowly among birdsong and trees.',img:photo('2023/02/1.png')},
 {k:'02',title:'Nature & discovery',text:'Birdwatching, hiking and guided nature walks on request; charges may apply.',img:photo('2021/09/Outside-1-min.jpg')},
 {k:'03',title:'Fireside evenings',text:'Share warm conversations around a bonfire. The published price is ₹1,000.',img:photo('2023/02/3.png')}
];
const gallery=[VIS.realGarden,VIS.realFacade,VIS.realHill,VIS.realReception,VIS.realNight,VIS.realBedroom,VIS.realCottages,VIS.garden,VIS.reception,VIS.facade,VIS.night,VIS.lanterns,VIS.pathway,VIS.suite];
const state={start:null,end:null,month:new Date(new Date().getFullYear(),new Date().getMonth(),1),adults:2,children:0,stage:'start',current:0,transitioning:false,lastCard:null,detailRoom:null,photoIndex:0};
const dateStr=d=>d?`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`:'';
const parseDate=s=>{if(!s)return null;const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const shortDate=d=>d?d.toLocaleDateString('en-IN',{day:'numeric',month:'short'}):'Choose date';
const dayAfter=(d,n=1)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);
const today=()=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate())};
let toastTimer;
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3600)}
function imgFallback(el,kind='room'){window.MirchoniImages?.enhance(el)}
$$('.slide-photo').forEach(i=>imgFallback(i,'hills'));
$$('.rail-thumb img').forEach(i=>imgFallback(i,'hills'));
/* Reusable collection cards with real room inventory categories; no fabricated ratings. */
const grid=$('#stays-grid');
function favoriteIds(){try{return JSON.parse(localStorage.getItem('mirchoni-favorites')||'[]')}catch{return []}}
function setFavorite(id){const fav=new Set(favoriteIds());fav.has(id)?fav.delete(id):fav.add(id);try{localStorage.setItem('mirchoni-favorites',JSON.stringify([...fav]))}catch{};renderFavorites()}
function renderFavorites(){const fav=new Set(favoriteIds());$$('[data-heart]').forEach(b=>{const active=fav.has(b.dataset.heart);b.classList.toggle('is-favorite',active);b.classList.toggle('fav',active);b.textContent=active?'♥':'♡';b.setAttribute('aria-label',`${active?'Remove':'Save'} ${rooms.find(r=>r.id===b.dataset.heart)?.name||'cottage'} ${active?'from':'to'} favorites`);b.setAttribute('aria-pressed',String(active))})}
rooms.forEach((r,index)=>{
 const a=document.createElement('article');a.className='stay-card';a.dataset.type=r.type;a.dataset.room=r.id;a.tabIndex=0;a.setAttribute('role','button');a.setAttribute('aria-label',`View details for ${r.name}`);
 a.innerHTML=`<div class="card-fallback"></div><img src="${r.imgs[0]}" loading="lazy" decoding="async" alt="${r.name} at Mirchoni Resorts"/><span class="stay-price">From ${currency(r.price[0])} <small>/ published CP</small></span><button type="button" class="stay-heart" data-heart="${r.id}" aria-label="Save ${r.name}" aria-pressed="false">♡</button><span class="stay-description"><strong>${r.name}</strong><small>⌖ &nbsp; ${r.area}</small><span class="stay-tags"><i>Up to ${r.capacity} guests</i><i>${r.feature}</i></span></span>`;
 a.addEventListener('click',e=>{if(e.target.closest('[data-heart]'))return;openDetail(r,a)});
 a.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('button')){e.preventDefault();openDetail(r,a)}});
 $('button[data-heart]',a).addEventListener('click',e=>{e.stopPropagation();setFavorite(r.id)});
 imgFallback($('img',a),'room');grid.append(a)
});
renderFavorites();
$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{$$('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});$$('.stay-card').forEach(x=>x.hidden=b.dataset.filter!=='all'&&x.dataset.type!==b.dataset.filter)}));
/* Authentic property facilities / experiences. */
const experienceGrid=$('#experience-grid');
experiences.forEach(e=>{const el=document.createElement('article');el.className='experience-card';el.innerHTML=`<img loading="lazy" decoding="async" src="${e.img}" alt="Mirchoni Resorts experience: ${e.title}"><div class="experience-text"><small>${e.k} / THE MIRCHONI EXPERIENCE</small><h3>${e.title}</h3><p>${e.text}</p></div>`;imgFallback($('img',el),e.k==='03'?'fire':'garden');experienceGrid.append(el)});
const galleryGrid=$('#gallery-grid');gallery.forEach((u,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',`Open resort gallery photo ${i+1}`);b.innerHTML=`<img src="${u}" alt="${u.includes("/real/")?"Original property photo":"AI-enhanced editorial visual"} ${i+1}" loading="lazy" decoding="async"><span class="v6-image-chip">${u.includes("/real/")?"Original photo":"AI-enhanced"}</span>`;imgFallback($('img',b),'garden');b.addEventListener('click',()=>openLightbox(i));galleryGrid.append(b)});
const dialog=document.createElement('div');dialog.className='gallery-lightbox';dialog.innerHTML='<button class="lightbox-exit" aria-label="Close image viewer">×</button><button class="lightbox-arrow prev" aria-label="Previous image">‹</button><img alt="Mirchoni Resorts gallery image"><button class="lightbox-arrow next" aria-label="Next image">›</button><span class="lightbox-count"></span>';document.body.append(dialog);
const lightboxStyles=document.createElement('style');lightboxStyles.textContent='.gallery-lightbox{position:fixed;inset:0;background:#151112f1;z-index:300;display:none;align-items:center;justify-content:center}.gallery-lightbox.open{display:flex}.gallery-lightbox>img{max-width:min(88vw,1220px);max-height:85vh;object-fit:contain;border-radius:8px}.gallery-lightbox button{position:absolute;background:#ffffff26;border:1px solid #ffffff44;color:white;border-radius:50%;width:47px;height:47px;font-size:31px;line-height:1}.lightbox-exit{top:20px;right:30px}.gallery-lightbox .prev{left:2%;top:50%}.gallery-lightbox .next{right:2%;top:50%}.lightbox-count{position:absolute;bottom:18px;color:#fff;font-size:13px;letter-spacing:.2em}';document.head.append(lightboxStyles);
let lightboxIndex=0;
function openLightbox(n){lightboxIndex=(n+gallery.length)%gallery.length;const img=$('img',dialog);window.MirchoniImages?.show(img,gallery[lightboxIndex]);img.onerror=null;$('.lightbox-count',dialog).textContent=`${lightboxIndex+1} / ${gallery.length} · ${gallery[lightboxIndex].includes('/real/')?'Original photo':'AI-enhanced visual'}`;dialog.classList.add('open');$('.lightbox-exit',dialog).focus()}
function closeLightbox(){dialog.classList.remove('open')}
$('.lightbox-exit',dialog).addEventListener('click',closeLightbox);$('.prev',dialog).addEventListener('click',()=>openLightbox(lightboxIndex-1));$('.next',dialog).addEventListener('click',()=>openLightbox(lightboxIndex+1));dialog.addEventListener('click',e=>{if(e.target===dialog)closeLightbox()});
/* Cinematic scene carousel with a soft-edged right-to-left mask wipe, never crossfade. */
const slides=$$('.slide'),thumbs=$$('.rail-thumb');const rail=$('#slide-rail');const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const captions=[['Discover Mirchoni','A 19th-century heritage hideaway nestled into Nainital’s green hills.'],['Places to stay','Four charming cottage collections, garden views and quiet mornings.'],['Explore the hills','Unhurried nature walks, birdwatching and beautiful Nainital days.']];
function layoutRail(){const el=thumbs[state.current];if(!el)return;const y=el.offsetTop+el.offsetHeight/2;$('.rail-rings',rail).style.top=y+'px';$('.rail-line',rail).style.top=y+'px';$('.rail-caption',rail).style.top=y+'px'}
function setSlideMetadata(i){state.current=i;thumbs.forEach((b,n)=>b.setAttribute('aria-current',String(i===n)));$('#rail-number').textContent=`0${i+1} / 03`;$('#rail-title').textContent=captions[i][0];$('#rail-desc').textContent=captions[i][1];$('#hero-index').textContent=`0${i+1}`;layoutRail()}
function changeSlide(index){if(state.transitioning||index===state.current)return;const previous=slides[state.current],incoming=slides[index];state.transitioning=true;incoming.classList.add('is-incoming');incoming.setAttribute('aria-hidden','false');const visual=$('.slide-visual',incoming);visual.style.transform='scale(1.12) translateX(2%)';const mist=$('#mist-wipe');window.MirchoniImages?.activate(incoming);setSlideMetadata(index);const mobileLite=document.documentElement.classList.contains('lite-motion')||matchMedia('(max-width: 640px)').matches;const duration=prefersReduced.matches?10:(mobileLite?700:1250);let start=null;
 function frame(t){if(start===null)start=t;const x=Math.min(1,(t-start)/duration),p=x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;const reveal=p*145;incoming.style.webkitMaskImage=`linear-gradient(to left,#000 ${reveal-35}%,rgba(0,0,0,.62) ${reveal-17}%,transparent ${reveal}%)`;incoming.style.maskImage=incoming.style.webkitMaskImage;visual.style.transform=`scale(${1.12-p*.08}) translateX(${2-p*2}%)`;mist.style.opacity=String(Math.sin(Math.PI*x)*.85);mist.style.transform=`translateX(${(1-p)*280-80}vw)`;if(x<1)requestAnimationFrame(frame);else{previous.classList.remove('is-current');previous.setAttribute('aria-hidden','true');incoming.classList.remove('is-incoming');incoming.classList.add('is-current');incoming.style.webkitMaskImage='';incoming.style.maskImage='';incoming.style.transform='';visual.style.transform='';mist.style.opacity='0';state.transitioning=false;}}requestAnimationFrame(frame)
}
thumbs.forEach(b=>b.addEventListener('click',()=>{changeSlide(Number(b.dataset.goto));restartAuto()}));
let intervalId;function restartAuto(){clearInterval(intervalId);if(!prefersReduced.matches&&!document.hidden)intervalId=setInterval(()=>{if(window.scrollY<window.innerHeight*1.2&&!document.hidden&&!$('#detail').classList.contains('open'))changeSlide((state.current+1)%slides.length)},7500)};
const hero=$('.hero');hero.addEventListener('mouseenter',()=>clearInterval(intervalId));hero.addEventListener('mouseleave',restartAuto);hero.addEventListener('focusin',()=>clearInterval(intervalId));hero.addEventListener('focusout',()=>setTimeout(()=>{if(!hero.contains(document.activeElement))restartAuto()},0));document.addEventListener('visibilitychange',()=>{if(document.hidden)clearInterval(intervalId);else restartAuto()});prefersReduced.addEventListener?.('change',restartAuto);
window.addEventListener('resize',layoutRail);setSlideMetadata(0);restartAuto();if('IntersectionObserver' in window){new IntersectionObserver(entries=>{if(entries[0].isIntersecting)restartAuto();else clearInterval(intervalId)},{threshold:0}).observe(hero)}
/* Scroll effects remain transform-based and are disabled for reduced-motion users. */
let scrollTick=false;function onScroll(){if(scrollTick)return;scrollTick=true;requestAnimationFrame(()=>{const sy=window.scrollY,h=window.innerHeight;$('#header').classList.toggle('solid',sy>h*.28||$('#detail').classList.contains('open'));if(!prefersReduced.matches&&!document.documentElement.classList.contains('lite-motion')&&sy<h*1.3){const v=Math.max(0,sy);$('.clouds-front').style.transform=`translate3d(0,${-v*.35}px,0) scale(${1+v/h*.25})`;$('.clouds-back').style.transform=`translate3d(0,${-v*.23}px,0)`;$('.clouds-top').style.opacity=String(Math.min(1,sy/(h*.45)));$('.slide-rail').style.transform=`translate3d(0,${v*.14}px,0)`}scrollTick=false})};window.addEventListener('scroll',onScroll,{passive:true});onScroll();
/* Keep the native pointer visible; a subtle non-interactive halo follows it on desktops only. */
if(window.matchMedia('(pointer:fine)').matches&&!prefersReduced.matches){
 const halo=$('#pointer');let raf=0,x=-80,y=-80;
 document.addEventListener('pointermove',event=>{
  if(event.pointerType!=='mouse'&&event.pointerType!=='pen')return;
  x=event.clientX;y=event.clientY;
  halo.classList.toggle('hover',Boolean(event.target.closest('a,button,[role=button],input')));
  if(!raf)raf=requestAnimationFrame(()=>{halo.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;halo.classList.add('active');raf=0})
 },{passive:true});
 document.addEventListener('pointerleave',()=>halo.classList.remove('active'));
}
/* Functional date-range picker, Monday-first and guest counters. */
const calendar=$('#calendar-popover'),guestsPopover=$('#guests-popover');
function fitBookingPopover(panel){
  // Keep the entire popover below the mobile header, even on short screens.
  // The available vertical space depends on the hero/search layout and scroll.
  const searchTop=$('#search-wrap').getBoundingClientRect().top;
  const safeTop=window.innerWidth<=640?104:92;
  const available=Math.max(210,Math.floor(searchTop-safeTop-14));
  panel.style.maxHeight=Math.min(470,available)+'px';
}
window.addEventListener('resize',()=>{
  if(!calendar.hidden)fitBookingPopover(calendar);
  if(!guestsPopover.hidden)fitBookingPopover(guestsPopover);
},{passive:true});
function closePopovers(){calendar.hidden=true;guestsPopover.hidden=true;$('#checkin-trigger').setAttribute('aria-expanded','false');$('#checkout-trigger').setAttribute('aria-expanded','false');$('#guests-trigger').setAttribute('aria-expanded','false')}
function openCalendar(stage){
  closePopovers();
  state.stage=(stage==='end'&&state.start)?'end':'start';
  // Never reopen on a month with no valid dates for the requested stage.
  const earliest=state.stage==='end' ? dayAfter(state.start) : today();
  const monthFloor=new Date(earliest.getFullYear(),earliest.getMonth(),1);
  if(state.month<monthFloor)state.month=monthFloor;
  calendar.hidden=false;
  fitBookingPopover(calendar);
  $('#checkin-trigger').setAttribute('aria-expanded',String(state.stage==='start'));
  $('#checkout-trigger').setAttribute('aria-expanded',String(state.stage==='end'));
  renderCalendar();
}
function openGuests(){closePopovers();guestsPopover.hidden=false;fitBookingPopover(guestsPopover);$('#guests-trigger').setAttribute('aria-expanded','true')}
$('#checkin-trigger').addEventListener('click',()=>{if(!calendar.hidden&&state.stage==='start')closePopovers();else openCalendar('start')});
$('#checkout-trigger').addEventListener('click',()=>{const next=state.start?'end':'start';if(!calendar.hidden&&state.stage===next)closePopovers();else openCalendar(next)});
$('#guests-trigger').addEventListener('click',()=>guestsPopover.hidden?openGuests():closePopovers());
function updateDateLabels(){$('#checkin-label').textContent=shortDate(state.start);$('#checkout-label').textContent=shortDate(state.end)}
function renderCalendar(){
 const y=state.month.getFullYear(),m=state.month.getMonth();
 const firstValid=state.stage==='end'&&state.start?dayAfter(state.start):today();
 $('#cal-month').textContent=state.month.toLocaleDateString('en-IN',{month:'long',year:'numeric'});
 $('#cal-prev').disabled=new Date(y,m,1)<=new Date(firstValid.getFullYear(),firstValid.getMonth(),1);
 const grid=$('#cal-grid');grid.textContent='';
 const startOffset=(new Date(y,m,1).getDay()+6)%7;
 for(let i=0;i<startOffset;i++)grid.append(document.createElement('span'));
 const n=new Date(y,m+1,0).getDate();
 for(let d=1;d<=n;d++){
  const dt=new Date(y,m,d),btn=document.createElement('button');btn.type='button';btn.textContent=String(d);
  btn.disabled=dt<firstValid;
  const selected=Boolean((state.start&&dateStr(state.start)===dateStr(dt))||(state.end&&dateStr(state.end)===dateStr(dt)));
  const inRange=state.start&&state.end&&dt>state.start&&dt<state.end;
  btn.classList.toggle('selected',selected);btn.classList.toggle('in-range',Boolean(inRange));
  btn.classList.toggle('is-today',dateStr(dt)===dateStr(today()));
  btn.setAttribute('aria-label',`${dt.toDateString()}${btn.disabled?' — unavailable':''}`);
  btn.setAttribute('aria-pressed',String(selected));
  if(!btn.disabled)btn.addEventListener('click',()=>selectDate(dt));
  grid.append(btn)
 }
 $('#cal-hint').textContent=state.stage==='start'
 ?`Choose check-in. Dates before ${shortDate(today())} are unavailable.`
 :`Check-in: ${shortDate(state.start)}. Choose check-out from ${shortDate(firstValid)} onward.`;
}
function selectDate(dt){
 const earliest=state.stage==='end'&&state.start?dayAfter(state.start):today();
 if(dt<earliest)return;
 if(state.stage==='start'||!state.start){
  state.start=dt;state.end=null;state.stage='end';
 }else{
  state.end=dt;state.stage='start';closePopovers();setTimeout(openGuests,180);
 }
 updateDateLabels();renderCalendar();
}
$('#cal-prev').addEventListener('click',()=>{state.month=new Date(state.month.getFullYear(),state.month.getMonth()-1,1);renderCalendar()});$('#cal-next').addEventListener('click',()=>{state.month=new Date(state.month.getFullYear(),state.month.getMonth()+1,1);renderCalendar()});
function updateGuests(){$('#adults-count').textContent=state.adults;$('#children-count').textContent=state.children;$('#guests-label').textContent=state.children?`${state.adults+state.children} guests`:`${state.adults} adult${state.adults===1?'':'s'}`}
$$('[data-step]').forEach(b=>b.addEventListener('click',()=>{const [k,delta]=b.dataset.step.split(':');const target=state[k]+Number(delta);state[k]=Math.max(k==='adults'?1:0,Math.min(12,target));updateGuests()}));$('#guests-done').addEventListener('click',closePopovers);
document.addEventListener('pointerdown',e=>{if(!$('#search-wrap').contains(e.target))closePopovers()});
$('#search-form').addEventListener('submit',e=>{e.preventDefault();closePopovers();$$('[data-filter]').forEach(b=>b.click&&b.dataset.filter==='all'&&b.click());$('#stays').scrollIntoView({behavior:prefersReduced.matches?'auto':'smooth',block:'start'});toast('Explore our 4 cottage categories. Dates and availability will be confirmed by Mirchoni.')});
/* Card → detail view: animate a real photo copy from clicked card into detail rectangle. */
const detail=$('#detail');let scrollRestore=0;let restoreFocus=null;
function detailTemplate(r){let familyNote=r.id==='heritage-family'?`<div class="family-rates"><strong>Published Family Cottage options</strong><table><thead><tr><th>View</th><th>CP</th><th>MAP</th><th>AP</th></tr></thead><tbody><tr><td>Garden view · option A</td><td>₹17,000</td><td>₹20,000</td><td>₹23,000</td></tr><tr><td>Garden view · option B</td><td>₹19,000</td><td>₹22,000</td><td>₹25,000</td></tr><tr><td>Garden + hill + lake</td><td>₹22,000</td><td>₹25,000</td><td>₹28,000</td></tr></tbody></table><p class="detail-disclaimer">The original site lists two garden-view rate options without distinguishing them. Please confirm the view and applicable plan directly.</p></div>`:'';
 const inDate=state.start||dayAfter(today()),outDate=state.end||dayAfter(inDate,2);
 const planPrices=['Continental Plan (CP)','Modified American Plan (MAP)','American Plan (AP)'];
 return `<div class="detail-inner"><div class="detail-breadcrumb"><a href="#stays" class="detail-breadcrumb-back">Home</a> › Our Cottages › ${r.name}</div><div class="detail-layout"><div class="detail-left"><div class="detail-image-main"><img id="detail-main-photo" src="${r.imgs[0]}" alt="${r.name} at Mirchoni Resorts"><button type="button" class="detail-heart" data-heart="${r.id}" aria-label="Save ${r.name}">♡</button></div><div class="detail-thumbs">${r.imgs.slice(0,3).map((u,i)=>`<button type="button" class="detail-photo-thumb" data-photo="${i}" aria-label="View cottage image ${i+1}"><img src="${u}" alt="${r.name}, view ${i+1}" loading="lazy" decoding="async"></button>`).join('')}</div><p style="color:#887a77;font-size:11px">Original property images and AI-enhanced editorial visuals are included. This image may not represent your exact room; confirm with the resort.</p></div><div class="detail-right"><div class="detail-chip">MIRCHONI / THE COTTAGE COLLECTION</div><h2>${r.name}</h2><p class="detail-meta">⌖ ${r.area} &nbsp;·&nbsp; Up to ${r.capacity} guests &nbsp;·&nbsp; ${r.feature}</p><div class="detail-about"><h3>About this cottage</h3><p>${r.summary}</p></div><div class="detail-booking"><div class="detail-booking-price" id="detail-price">${currency(r.price[0])} <span>/ published CP rate</span><small>Taxes extra. Prices and availability subject to resort confirmation.</small></div><div class="rate-options">${r.price.map((p,i)=>`<label><input type="radio" name="detail-plan" value="${i}" ${i===0?'checked':''}> ${['CP','MAP','AP'][i]} <span>From ${currency(p)}</span></label>`).join('')}</div><div class="detail-date-line"><div><label for="detail-in"><strong>CHECK-IN</strong></label><input type="date" id="detail-in" required value="${dateStr(inDate)}" min="${dateStr(today())}"></div><div><label for="detail-out"><strong>CHECK-OUT</strong></label><input type="date" id="detail-out" required value="${dateStr(outDate)}" min="${dateStr(dayAfter(inDate))}"></div></div><div class="detail-guests">${state.adults} adult${state.adults!==1?'s':''}${state.children?`, ${state.children} child${state.children!==1?'ren':''}`:''} · ${r.capacity} guest maximum for this cottage</div><button class="book-button" id="detail-enquire" type="button">Enquire to book on WhatsApp &nbsp; ↗</button><p class="detail-disclaimer">This sends an enquiry, not a confirmed booking. No payment is collected here.</p>${familyNote}</div><div class="detail-amenities"><h3>Amenities & conveniences</h3><div class="amenities-grid"><span><i>⌁</i> Complimentary Wi-Fi</span><span><i>☕</i> Tea & coffee maker</span><span><i>✳</i> Garden access</span><span><i>☼</i> Welcome drinks</span><span><i>⌂</i> Free parking</span><span><i>♧</i> Room service</span><span><i>♨</i> Hot / cold water</span><span><i>✦</i> Breakfast advertised</span></div><p class="detail-disclaimer">Optional paid services include bonfire, guided nature walks and laundry. Pickup is advertised 8–9 PM from a designated point.</p><p class="detail-disclaimer"><a href="${r.official}" target="_blank" rel="noopener noreferrer" style="text-decoration:underline">View original cottage details ↗</a></p></div></div></div><div class="detail-other"><h3>Discover another cottage</h3><div class="detail-other-grid">${rooms.filter(x=>x.id!==r.id).map(x=>`<button type="button" data-other="${x.id}"><img src="${x.imgs[0]}" alt=""><span>${x.name}<br><small>From ${currency(x.price[0])}</small></span></button>`).join('')}</div></div></div>`
}
function openDetail(r,card){restoreFocus=document.activeElement;scrollRestore=window.scrollY;state.detailRoom=r;$('#detail-content').innerHTML=detailTemplate(r);detail.classList.add('open');detail.setAttribute('aria-hidden','false');document.body.classList.add('detail-open');clearInterval(intervalId);$('#header').classList.add('solid');detail.scrollTop=0;const detailPhoto=$('#detail-main-photo');imgFallback(detailPhoto,'room');$$('.detail-thumbs img').forEach(i=>imgFallback(i,'room'));$$('.detail-other-grid img').forEach(i=>imgFallback(i,'room'));renderFavorites();
 const heart=$('.detail-heart',detail);heart.addEventListener('click',()=>setFavorite(r.id));$$('.detail-photo-thumb',detail).forEach(b=>b.addEventListener('click',()=>{const src=r.imgs[Number(b.dataset.photo)];window.MirchoniImages?.show(detailPhoto,src)}));
 $$('input[name="detail-plan"]',detail).forEach(b=>b.addEventListener('change',()=>{const i=Number($('input[name="detail-plan"]:checked').value);$('#detail-price').innerHTML=`${currency(r.price[i])} <span>/ published ${['CP','MAP','AP'][i]} rate</span><small>Taxes extra. Prices and availability subject to resort confirmation.</small>`}));
 $('#detail-in').addEventListener('change',()=>{const d=parseDate($('#detail-in').value);if(d){$('#detail-out').min=dateStr(dayAfter(d));if(parseDate($('#detail-out').value)<=d)$('#detail-out').value=dateStr(dayAfter(d))}});
 $('#detail-enquire').addEventListener('click',()=>{const start=parseDate($('#detail-in').value),end=parseDate($('#detail-out').value);if(!start||!end||start<today()||end<=start){toast('Please choose valid check-in and check-out dates.');return}if(state.adults+state.children>r.capacity){toast(`The ${r.name} accommodates up to ${r.capacity} guests. Please adjust your group or ask the resort.`);return}const i=Number($('input[name="detail-plan"]:checked').value);const msg=`Hello Mirchoni Resorts, I would like to enquire about ${r.name}.\nCheck-in: ${dateStr(start)}\nCheck-out: ${dateStr(end)}\nGuests: ${state.adults} adult(s), ${state.children} child(ren)\nMeal plan: ${['CP','MAP','AP'][i]}\nPublished starting rate: ${currency(r.price[i])} (not a quote)\nPlease confirm availability, room/view category, final price including taxes, meal inclusions, and booking terms.`;window.open('https://wa.me/919720081100?text='+encodeURIComponent(msg),'_blank','noopener,noreferrer');toast('Your WhatsApp enquiry is ready. Please send it to the resort to request availability.')});
 $$('.detail-other-grid [data-other]',detail).forEach(b=>b.addEventListener('click',()=>{const next=rooms.find(x=>x.id===b.dataset.other);closeDetail(false);setTimeout(()=>openDetail(next,null),60)}));$('.detail-breadcrumb-back').addEventListener('click',e=>{e.preventDefault();closeDetail()});
 detailPhoto.classList.add('hide-photo');const fromImg=card&&$('img',card),from=fromImg?.getBoundingClientRect(),to=detailPhoto.getBoundingClientRect();if(from&&to&&from.width&&to.width&&!prefersReduced.matches){const flight=$('#photo-flight');flight.innerHTML=`<img src="${fromImg?.currentSrc||fromImg?.src||window.MirchoniImages?.localFor(r.imgs[0])}" alt="">`;flight.style.cssText=`left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;opacity:1;`;const x=to.left-from.left,y=to.top-from.top;const anim=flight.animate([{transform:'translate(0,0) scale(1,1)',borderRadius:'13px'},{transform:`translate(${x}px,${y}px) scale(${to.width/from.width},${to.height/from.height})`,borderRadius:'10px'}],{duration:880,easing:'cubic-bezier(.65,0,.35,1)',fill:'forwards'});anim.finished.catch(()=>{}).then(()=>{flight.style.opacity=0;flight.innerHTML='';detailPhoto.classList.remove('hide-photo');anim.cancel()})}else{detailPhoto.classList.remove('hide-photo')}
 $('#detail-close').focus();
}
function closeDetail(refocus=true){detail.classList.remove('open');detail.setAttribute('aria-hidden','true');document.body.classList.remove('detail-open');state.detailRoom=null;$('#header').classList.toggle('solid',window.scrollY>window.innerHeight*.28);restartAuto();if(refocus&&restoreFocus&&restoreFocus.isConnected)restoreFocus.focus({preventScroll:true})}
$('#detail-close').addEventListener('click',()=>closeDetail());$('#detail-home').addEventListener('click',()=>closeDetail());
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(dialog.classList.contains('open'))closeLightbox();else if(detail.classList.contains('open'))closeDetail();else closePopovers()}if(dialog.classList.contains('open')&&e.key==='ArrowRight')openLightbox(lightboxIndex+1);if(dialog.classList.contains('open')&&e.key==='ArrowLeft')openLightbox(lightboxIndex-1)});
/* Navigation works on mobile, closes on selection. */
$('#mobile-menu-btn').addEventListener('click',()=>{const nav=$('#mobile-nav');nav.hidden=!nav.hidden;$('#mobile-menu-btn').setAttribute('aria-expanded',String(!nav.hidden))});$$('#mobile-nav a').forEach(a=>a.addEventListener('click',()=>{$('#mobile-nav').hidden=true;$('#mobile-menu-btn').setAttribute('aria-expanded','false')}));
/* Keep focus inside open detail view; keyboard-friendly and accessible. */
detail.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const nodes=$$('a,button,input,[tabindex]:not([tabindex="-1"])',detail).filter(x=>!x.disabled&&x.getClientRects().length>0);if(!nodes.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});
})();
