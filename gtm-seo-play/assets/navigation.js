// Native details keep every destination available without JavaScript.
(() => {
 const header=document.querySelector('.editorial-header');
 if(!header)return;
 const menus=[...header.querySelectorAll('.nav-mega')];
 const mobile=header.querySelector('.menu-toggle');
 const links=header.querySelector('.navlinks');
 const fit=()=>header.style.setProperty('--nav-available',Math.max(180,innerHeight-header.getBoundingClientRect().bottom-12)+'px');
 fit();
 addEventListener('resize',fit,{passive:true});
 const closeAll=()=>menus.forEach(item=>{item.open=false;});
 menus.forEach(item=>item.addEventListener('toggle',()=>{
  fit();
  if(item.open)menus.forEach(other=>{if(other!==item)other.open=false;});
 }));
 document.addEventListener('click',event=>{if(!header.contains(event.target)){closeAll();links.classList.remove('open');mobile.setAttribute('aria-expanded','false');}});
 header.addEventListener('keydown',event=>{
  if(event.key!=='Escape')return;
  const opened=menus.find(item=>item.open);
  if(opened){opened.open=false;opened.querySelector('summary').focus();}
  else if(mobile.getAttribute('aria-expanded')==='true'){links.classList.remove('open');mobile.setAttribute('aria-expanded','false');mobile.focus();}
 });
 header.addEventListener('focusout',event=>{if(event.relatedTarget&&!header.contains(event.relatedTarget))closeAll();});
 mobile.addEventListener('click',()=>{fit();if(mobile.getAttribute('aria-expanded')==='false')closeAll();});
})();
