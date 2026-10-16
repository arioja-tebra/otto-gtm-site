(()=>{
 const $=id=>document.getElementById(id),form=$('note-form'),format=form.dataset.format;
 const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const s='The fictional client reports completing a planned evening walk on three days and describes feeling more able to pause before responding to work messages.';
 const o='During the fictional session, the client identifies one difficult work interaction and participates in a rehearsal of a response they would like to try.';
 const a='The example shows the client practicing a previously discussed skill. A real assessment would connect the observed response to the established treatment goals and document the clinician’s actual findings.';
 const p='In this fictional example, the client agrees to try the rehearsed response once and bring an observation to the next scheduled session. The clinician plans to review what happened.';
 function draft(){let fields='';for(const input of form.querySelectorAll('textarea'))fields+='<h2>'+esc(input.closest('label').childNodes[0].textContent)+'</h2><p>'+esc(input.value||'[Complete this section]').replace(/\n/g,'<br>')+'</p>';
 return '<article class="doc"><h1 class="document-title">'+format.toUpperCase()+' note draft</h1><p class="document-subtitle">Educational draft · Review required · '+new Date().toLocaleDateString('en-US')+'</p>'+fields+'<h2>Before using a clinical record</h2><p>Complete encounter details, required assessments and findings, clinician review, and signature through your approved workflow. This educational draft does not establish clinical completeness, medical necessity, or payer acceptance. Clinical review of this resource is pending.</p></article>';}
 $('note-blank').addEventListener('click',()=>OttoDocuments.download($('note-blank-document').content.firstElementChild,format+'-note-template'));
 $('note-demo').addEventListener('click',()=>{const data=format==='soap'?{s,o,a,p}:{d:s+' '+o,a,p};for(const [key,value]of Object.entries(data))form.elements[key].value=value;document.documentElement.dataset.demo='true';$('note-status').textContent='Fictional example filled. This is an educational excerpt, not a complete clinical note.';});
 form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('reset',()=>{delete document.documentElement.dataset.demo;$('note-status').textContent='Fields cleared.';});
 $('note-download').addEventListener('click',()=>OttoDocuments.download(draft(),format+'-note-draft'));
 $('note-print').addEventListener('click',()=>OttoDocuments.print(draft()));
})();
