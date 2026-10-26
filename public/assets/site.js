const menu=document.querySelector('.menu-toggle');menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));document.querySelector('.navlinks').classList.toggle('open',open)});
const cards=[...document.querySelectorAll('[data-story]')];let category='All articles';const search=document.querySelector('#search');function filterStories(){let shown=0;for(const card of cards){const match=(category==='All articles'||card.dataset.category===category)&&card.textContent.toLowerCase().includes((search?.value||'').trim().toLowerCase());card.hidden=!match;if(match)shown++}const empty=document.querySelector('#empty');if(empty)empty.hidden=shown>0;const count=document.querySelector('#result-count');if(count)count.textContent=shown+' article'+(shown===1?'':'s')+' shown'}document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{category=b.textContent;document.querySelectorAll('.filter').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));filterStories()}));search?.addEventListener('input',filterStories);
const progress=document.querySelector('.reading-progress');if(progress){const update=()=>{const article=document.querySelector('.prose');const start=article.offsetTop;const distance=article.offsetHeight-innerHeight;const n=distance>0?Math.min(100,Math.max(0,(scrollY-start)/distance*100)):100;progress.style.width=n+'%'};addEventListener('scroll',update,{passive:true});update()}
document.querySelector('#copy-link')?.addEventListener('click',async()=>{const status=document.querySelector('#share-status');try{await navigator.clipboard.writeText(location.href);status.textContent='Link copied.'}catch{status.textContent='Copy this page’s URL from your address bar.'}});document.querySelector('#print-article')?.addEventListener('click',()=>print());

// Carry the source page and campaign tags into the signup, without browser storage.
document.querySelectorAll('a[href="/waitlist/"]').forEach(link=>{
 const query=new URLSearchParams(location.search), target=new URL('/waitlist/',location.origin);
 target.searchParams.set('from',location.pathname);
 ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(key=>{if(query.has(key))target.searchParams.set(key,query.get(key).slice(0,120));});
 link.href=target.pathname+target.search;
});

// Horizontally scrollable comparison tables remain reachable by keyboard.
document.querySelectorAll('.table-scroll').forEach(region=>{region.tabIndex=0;region.setAttribute('role','region');region.setAttribute('aria-label',region.querySelector('table')?.getAttribute('aria-label')||'Scrollable data table');});

// Share only the public article path; omit query parameters and fragments.
(() => {
  const share = document.querySelector('[data-article-share]');
  if (!share) return;
  const url = new URL(location.pathname, location.origin).href;
  const title = document.querySelector('h1')?.textContent.trim() || document.title;
  share.querySelector('[data-share-linkedin]').href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  share.querySelector('[data-share-facebook]').href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  share.querySelector('[data-share-email]').href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
  const button = share.querySelector('[data-share-copy]');
  const status = share.querySelector('[role=status]');
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(url);
      status.textContent = 'Link copied.';
    } catch {
      status.textContent = 'Copy the article link below.';
      const field = document.createElement('input');
      field.type = 'text';
      field.readOnly = true;
      field.value = url;
      field.setAttribute('aria-label', 'Article link');
      status.append(field);
      field.focus();
      field.select();
    }
  });
})();
