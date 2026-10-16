(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const emailForm=$('waitlist-email-form'), practiceForm=$('waitlist-practice-form');
  let demo=true;
  let token='', requestId=crypto.randomUUID(), started=Date.now();
  const params=new URLSearchParams(location.search);
  const source={page:params.get('from')||'/otto-previews/gtm-seo-play/waitlist/'};
  for (const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term']) {
    if(params.has(key)) source[key]=params.get(key).slice(0,120);
  }
  async function send() { return {ok:true,token:'preview-only'}; }
  emailForm.addEventListener('submit',async event=>{
    event.preventDefault(); if(!emailForm.reportValidity())return;
    const result=await send('/otto-previews/gtm-seo-play/api/waitlist',{email:$('waitlist-email').value.trim(),requestId,source,website:$('waitlist-website').value,elapsed:Date.now()-started},emailForm);
    if(!result)return;
    token=result.token;
    if(!demo)document.querySelector('.waitlist-demo').hidden=true;
    $('email-step').hidden=true;$('practice-step').hidden=false;
    document.querySelector('.waitlist-page').dataset.step='practice';
    $('progress-email').className='done';$('progress-practice').className='current';
    $('practice-heading').focus();
  });
  function updateConditional() {
    const switching=practiceForm.elements.ehr.value==='Switching';
    $('system-field').hidden=!switching;
    practiceForm.elements.system.disabled=!switching;
    practiceForm.elements.system.required=switching;
    const other=switching&&practiceForm.elements.system.value==='Other';
    $('other-system-field').hidden=!other;practiceForm.elements.otherSystem.disabled=!other;practiceForm.elements.otherSystem.required=other;
  }
  practiceForm.addEventListener('change',updateConditional);
  function finish(skipped) {
    $('practice-step').hidden=true;$('complete-step').hidden=false;
    document.querySelector('.waitlist-page').dataset.step='complete';
    $('waitlist-error').textContent='';$('progress-practice').className=skipped?'':'done';
    if(demo)$('complete-copy').textContent='Preview complete. Nothing was submitted or saved.';
    else if(skipped)$('complete-copy').textContent='Your email is saved. We’ll be in touch about availability and next steps.';
    $('complete-heading').focus();
  }
  practiceForm.addEventListener('submit',async event=>{
    event.preventDefault();if(!practiceForm.reportValidity())return;
    const data=Object.fromEntries(new FormData(practiceForm));
    const result=await send('/otto-previews/gtm-seo-play/api/waitlist/details',{...data,token},practiceForm);
    if(result)finish(false);
  });
  $('waitlist-demo-fill').addEventListener('click',()=>{
    demo=true;
    $('waitlist-email').value='jordan@example.com';
    practiceForm.elements.size.value='Solo';
    practiceForm.elements.specialty.value='Therapy / counseling';
    practiceForm.elements.payment.value='Both';
    practiceForm.elements.ehr.value='Switching';
    practiceForm.elements.system.value='SimplePractice';
    updateConditional();
    $('waitlist-demo-status').textContent='Demo mode. Fictional details are filled in. Nothing will be sent to the sheet.';
    $('waitlist-demo-fill').hidden=true;
    $('waitlist-demo-reset').hidden=false;
    document.querySelector('.saved-note').textContent='✓ Demo email step complete.';
    $('waitlist-email').focus();
  });
  $('waitlist-email').value='jordan@example.com';
  $('waitlist-email').readOnly=true;
  $('skip-practice').addEventListener('click',()=>finish(true));
})();
