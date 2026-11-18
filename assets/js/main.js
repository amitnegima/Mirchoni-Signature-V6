/* Mirchoni — dependency-free interactions. No analytics, trackers, or user data storage. */
(() => {
  'use strict';
  document.documentElement.classList.add('has-js');
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const phone = '919720081100';
  const reserveModal = $('#reserve-modal');
  const lightbox = $('#lightbox');
  const menu = $('#mobile-menu');
  const toggle = $('#menu-toggle');
  const header = $('.site-header');
  let lastFocus = null;

  const currentDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    return `${year}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };
  const changeDays = (value, days) => {
    const [y,m,d] = value.split('-').map(Number);
    const u = new Date(Date.UTC(y,m-1,d+days));
    return `${u.getUTCFullYear()}-${String(u.getUTCMonth()+1).padStart(2,'0')}-${String(u.getUTCDate()).padStart(2,'0')}`;
  };
  const prettyDate = v => {
    if(!v) return 'Not selected';
    const [y,m,d] = v.split('-').map(Number);
    return new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(y,m-1,d)));
  };
  const setLocked = () => document.body.classList.toggle('is-locked', Boolean($('.modal.open') || $('.lightbox.open') || (menu && menu.classList.contains('open'))));
  const activateModal = (element) => {
    lastFocus = document.activeElement;
    element.classList.add('open');
    element.setAttribute('aria-hidden','false');
    setLocked();
    requestAnimationFrame(() => {const focusable = $('input, select, button', element); if(focusable) focusable.focus();});
  };
  const deactivateModal = (element) => {
    if(!element) return;
    element.classList.remove('open');
    element.setAttribute('aria-hidden','true');
    setLocked();
    if(lastFocus?.focus) lastFocus.focus();
  };
  const closeMenu = () => {
    if(!menu) return;
    menu.classList.remove('open');
    toggle?.setAttribute('aria-expanded','false');
    setLocked();
  };
  toggle?.addEventListener('click',()=>{
    const open = !menu.classList.contains('open');
    menu.classList.toggle('open',open);
    toggle.setAttribute('aria-expanded',String(open));
    setLocked();
  });
  $$('.mobile-menu a').forEach(a=>a.addEventListener('click', closeMenu));
  const handleHeader = () => {
    if (!header?.classList.contains('inner-header')) header?.classList.toggle('opaque',window.scrollY>35);
  };
  handleHeader();
  window.addEventListener('scroll',handleHeader,{passive:true});

  // Every image has a local branded SVG fallback for offline viewing.
  $$('img[data-fallback]').forEach(img => img.addEventListener('error',() => {
    if(!img.classList.contains('image-fallback')) {
      img.classList.add('image-fallback');
      const source=img.currentSrc || img.src || '';
      const illustration=/bonfire/i.test(source)?'fallback-fire.svg':/cottage|heritage-family|\/3\.jpg/i.test(source)?'fallback-room.svg':/2023\/02/i.test(source)?'fallback-garden.svg':'fallback-hills.svg';
      img.src='assets/img/'+illustration;
    }
  },{once:true}));

  // Inquiry form: opens WhatsApp with a composed message; does not claim a reservation.
  const bookForm = $('#reserve-form');
  const barForm = $('#booking-bar');
  const bookingDateFields = $$('input[type=date]');
  bookingDateFields.forEach(input=>input.min=currentDate());
  const ensureDateOrder = (checkin, checkout) => {
    if(!checkin || !checkout) return;
    if(checkin.value) {
      checkout.min=changeDays(checkin.value,1);
      if(checkout.value && checkout.value<=checkin.value) checkout.value=changeDays(checkin.value,1);
    }
  };
  if(barForm){
    const arr = $('input[name="arrival"]',barForm);
    const dep = $('input[name="departure"]',barForm);
    arr?.addEventListener('change',()=>ensureDateOrder(arr,dep));
    barForm.addEventListener('submit',e=>{
      e.preventDefault();
      const dateIn=arr.value, dateOut=dep.value;
      if(dateIn && dateOut && dateOut<=dateIn){ dep.setCustomValidity('Departure must be after arrival');dep.reportValidity();dep.setCustomValidity('');return; }
      openReserve({arrival:dateIn,departure:dateOut,guests:$('select[name="guests"]',barForm)?.value});
    });
  }
  function openReserve(details={}) {
    if(!reserveModal) return;
    if(details.room) $('#reserve-room').value=details.room;
    if(details.arrival) $('#reserve-arrival').value=details.arrival;
    if(details.departure) $('#reserve-departure').value=details.departure;
    if(details.guests) $('#reserve-guests').value=details.guests;
    ensureDateOrder($('#reserve-arrival'),$('#reserve-departure'));
    activateModal(reserveModal);
  }
  $$('[data-book]').forEach(btn=>btn.addEventListener('click',e=>{
    e.preventDefault();
    openReserve({room:btn.dataset.book && btn.dataset.book!=='any' ? btn.dataset.book : undefined});
  }));
  $('#reserve-arrival')?.addEventListener('change',()=>ensureDateOrder($('#reserve-arrival'),$('#reserve-departure')));
  bookForm?.addEventListener('submit',e=>{
    e.preventDefault();
    if(!bookForm.reportValidity()) return;
    const data=new FormData(bookForm);
    const arrive=String(data.get('arrival')||''), depart=String(data.get('departure')||'');
    if(depart<=arrive){const input=$('#reserve-departure');input.setCustomValidity('Please choose a date after check-in');input.reportValidity();input.setCustomValidity('');return;}
    const message=[
      'Hello Mirchoni Resorts, I would like to enquire about a stay.',
      `Cottage: ${data.get('room')}`,
      `Check-in: ${prettyDate(arrive)}`,
      `Check-out: ${prettyDate(depart)}`,
      `Guests: ${data.get('guests')}`,
      `Name: ${String(data.get('guestName')).trim()}`,
      `Phone: ${String(data.get('phone')).trim()}`,
      `Message: ${String(data.get('message')||'Please confirm availability and final price.').trim()}`,
      'Please share availability, total price including taxes and booking terms. Thank you.'
    ].join('\n');
    const whatsapp=`https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    // A direct, user-initiated navigation avoids popup blockers.
    window.location.href=whatsapp;
  });
  $$('.modal-close,[data-close-modal]').forEach(btn=>btn.addEventListener('click',()=>deactivateModal(reserveModal)));
  $('.modal-backdrop',reserveModal||document)?.addEventListener('click',()=>deactivateModal(reserveModal));

  // Searchable gallery with accessible lightbox and keyboard controls.
  let activeImages=[],activeIndex=0;
  const lightboxImg=$('#lightbox-image');
  const renderLightbox=()=>{
    if(!lightbox || !activeImages.length) return;
    const target=activeImages[activeIndex];
    lightboxImg.src=target.dataset.full || $('img',target)?.src || '';
    lightboxImg.alt=$('img',target)?.alt||'Mirchoni Resorts photograph';
    $('#lightbox-counter').textContent=`${activeIndex+1} / ${activeImages.length} · ${target.dataset.caption || 'The Mirchoni Resorts'}`;
  };
  const galleryButtons=$$('[data-lightbox]');
  galleryButtons.forEach(btn=>btn.addEventListener('click',()=>{
    activeImages=galleryButtons.filter(el=>!el.hidden && !el.closest('[hidden]'));
    activeIndex=Math.max(0,activeImages.indexOf(btn));
    renderLightbox();activateModal(lightbox);
  }));
  function shiftImage(amount){if(!activeImages.length)return;activeIndex=(activeIndex+amount+activeImages.length)%activeImages.length;renderLightbox();}
  $('#lightbox-close')?.addEventListener('click',()=>deactivateModal(lightbox));
  $('#lightbox-backdrop')?.addEventListener('click',()=>deactivateModal(lightbox));
  $('#lightbox-prev')?.addEventListener('click',()=>shiftImage(-1));
  $('#lightbox-next')?.addEventListener('click',()=>shiftImage(1));
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){deactivateModal(lightbox);deactivateModal(reserveModal);closeMenu();}
    if(e.key==='Tab'){
      const active = lightbox?.classList.contains('open') ? lightbox : reserveModal?.classList.contains('open') ? reserveModal : null;
      if(active){
        const nodes=$$('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]',active)
          .filter(el=>el.getClientRects().length>0);
        if(nodes.length){
          const first=nodes[0],last=nodes[nodes.length-1];
          if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
          else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
        }
      }
    }
    if(lightbox?.classList.contains('open')){
      if(e.key==='ArrowRight')shiftImage(1);
      if(e.key==='ArrowLeft')shiftImage(-1);
    }
  });

  // Category filters: no page reload.
  $$('[data-filter-group]').forEach(group=>{
    const target=group.dataset.filterGroup;
    const items=$$(`[data-${target}]`);
    $$('button[data-filter]',group).forEach(btn=>btn.addEventListener('click',()=>{
      const selection=btn.dataset.filter;
      $$('button[data-filter]',group).forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
      items.forEach(item=>item.hidden=(selection!=='all' && item.dataset[target]!==selection));
      const count=$('[data-count]');if(count) count.textContent=`Showing ${items.filter(i=>!i.hidden).length} photographs`;
    }));
  });

  // Contact form is mailto-only: no backend, database or fake success confirmation.
  $('#contact-form')?.addEventListener('submit',e=>{
    e.preventDefault();
    const form=e.currentTarget;
    if(!form.reportValidity())return;
    const data=new FormData(form);
    const name=String(data.get('name')||'').trim(), reply=String(data.get('email')||'').trim();
    const subject=encodeURIComponent(`Mirchoni website enquiry from ${name}`);
    const body=encodeURIComponent(`Name: ${name}\nEmail: ${reply}\nPhone: ${data.get('phone')||'Not supplied'}\n\n${data.get('message')||''}`);
    window.location.href=`mailto:info@mirchoni.com?subject=${subject}&body=${body}`;
  });
  if('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}});},{threshold:.1,rootMargin:'0px 0px -10px 0px'});
    $$('.reveal').forEach(el=>observer.observe(el));
  }else{$$('.reveal').forEach(el=>el.classList.add('visible'));}
})();
