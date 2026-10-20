(() => {
 const button=document.getElementById('fill-demo');if(!button)return;
 const date=(offset=0)=>{const d=new Date();d.setDate(d.getDate()+offset);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
 const common={npi:'0000000000',tin:'00-0000000',phone:'(512) 555-0142',email:'hello@example.com',address:'123 Example Lane',dob:'1990-03-14'};
 const examples={
  'session-rate-calculator':{income:75000,expenses:20000,tax:25,collection:90,sessions:20,off:4,filled:80,minutes:50},
  'superbill':{...common,practice:'Willow Counseling (demo practice)',clinician:'Jordan Ellis, LCSW (fictional)',license:'DEMO-LICENSE',client:'Alex Morgan (fictional client)',clientaddress:'456 Sample Street, Example City, TX 00000',date:date(),dx:'F41.1 — fictional example',pos:'11 — Office',paid:320,paiddate:date(),notes:'DEMO DOCUMENT. All names, identifiers, and services are fictional. Not for claims or reimbursement.'},
  'good-faith-estimate':{...common,patient:'Alex Morgan (fictional patient)',issued:date(),contact:'alex@example.com',preference:'Email',primary:'Individual psychotherapy',diagnosis:'Not yet determined',dx:'',start:date(7),valid:date(77),provider:'Willow Counseling (demo practice)',type:'Mental health counseling',city:'Example City, TX 00000',person:'Jordan Ellis (fictional)',location:'123 Example Lane, Example City, TX 00000',separate:'No separately scheduled services are included in this example.',notes:'DEMO DOCUMENT. All names and identifiers are fictional. Review the expected services and dates before creating an estimate for care.'},
  'therapy-cost-estimator':{fee:180,allowed:120,deductible:300,coinsurance:40,visits:12,covered:'yes'}
 };
 button.addEventListener('click',()=>{
  const kind=button.dataset.tool;
  document.documentElement.dataset.demo='true';
  for(const [id,value] of Object.entries(examples[kind]||{})){const input=document.getElementById(id);if(input)input.value=value;}
  const items=document.getElementById('items');
  if(items){items.innerHTML='';const count=kind==='superbill'?2:1;for(let i=0;i<count;i++)document.getElementById('addItem').click();
   items.querySelectorAll('.item').forEach((item,index)=>{
    const values=kind==='superbill'?{date:date(index?-7:-14),code:'90834',desc:'Psychotherapy, 45 minutes (demo)',price:160}:{name:'Individual psychotherapy (demo)',code:'CPT 90834',dx:'Not yet determined',price:160,units:11};
    for(const [key,value] of Object.entries(values)){const input=item.querySelector('.item-'+key);if(input)input.value=value;}
   });
  }
  (document.getElementById('form')||document.getElementById('cost-form')).dispatchEvent(new Event('input',{bubbles:true}));
  document.getElementById('demo-status').textContent='Example filled. Names and details are fictional; review before sharing.';
 });
})();
