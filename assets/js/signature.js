/* Editorial experience tabs — no dependencies, no trackers */
(() => {
  'use strict';
  const image = document.querySelector('#s-experience-image');
  const tag = document.querySelector('#s-experience-tag');
  const tabs = Array.from(document.querySelectorAll('[data-experience]'));
  if (!image || !tabs.length) return;
  const experiences = {
    morning: {src:'https://mirchoni.com/wp-content/uploads/2023/02/1.png',alt:'Garden and greenery at Mirchoni Resorts',label:'01 / GARDEN MORNINGS'},
    nature: {src:'https://mirchoni.com/wp-content/uploads/2021/09/Outside-5-min.jpg',alt:'Trees surrounding the Nainital heritage retreat',label:'02 / NATURE & STILLNESS'},
    fire: {src:'https://mirchoni.com/wp-content/uploads/2021/09/Bonfire.jpg',alt:'Warm bonfire at the retreat',label:'03 / EVENINGS BY THE FIRE'}
  };
  image.addEventListener('error', () => {
    const current=image.getAttribute('src') || '';
    if (!current.includes('fallback-')) {
      const chosen=tabs.find(t=>t.classList.contains('is-active'))?.dataset.experience;
      const fallback=chosen==='fire'?'fallback-fire.svg':chosen==='nature'?'fallback-hills.svg':'fallback-garden.svg';
      image.src='assets/img/'+fallback;
    }
    image.classList.remove('is-changing');
  });
  tabs.forEach(btn=>btn.addEventListener('click', () => {
    const next = experiences[btn.dataset.experience];
    if (!next) return;
    tabs.forEach(t=>{
      const selected=t===btn;
      t.classList.toggle('is-active',selected);
      t.setAttribute('aria-expanded',String(selected));
    });
    image.classList.add('is-changing');
    image.src=next.src;
    image.alt=next.alt;
    tag.textContent=next.label;
    image.addEventListener('load',()=>image.classList.remove('is-changing'),{once:true});
    image.addEventListener('error',()=>image.classList.remove('is-changing'),{once:true});
  }));
})();
