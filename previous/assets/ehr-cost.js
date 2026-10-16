/* Pure arithmetic is shared by browser controls and the unit checks. */
function calculateEhrCosts(practice,plan){
 const sessions=practice.providers*practice.weekly*practice.weeks/12;
 const transactions=sessions*practice.cardshare/100;
 const notes=plan.aiusers*practice.weekly*practice.weeks/12*practice.aishare/100;
 const lines=[['Subscription and seats',(plan.base+Math.max(0,practice.providers-1)*plan.seat)/plan.period],['AI subscriptions',plan.aiusers*plan.ai],['Other monthly add-ons',plan.addons],['AI usage overage',Math.max(0,notes-plan.includedai)*plan.overai],['Claims',Math.max(0,practice.claims-plan.includedclaims)*plan.claim],['Card percentage fees',transactions*practice.fee*plan.percent/100],['Card transaction fees',transactions*plan.transaction],['Annual fees, monthly equivalent',plan.annual/12]];
 const monthly=lines.reduce((sum,row)=>sum+row[1],0);
 return {lines,monthly,annual:monthly*12,firstYear:monthly*12+plan.setup,sessions,notes,setup:plan.setup};
}
if(typeof module!=='undefined')module.exports={calculateEhrCosts};
if(typeof document!=='undefined')(()=>{
 const form=document.getElementById('ehr-cost-form'),$=id=>document.getElementById(id),money=value=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value);
 const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let result=null;
 function read(){const raw=Object.fromEntries(new FormData(form)),practice={},plans={a:{},b:{}};for(const [key,value]of Object.entries(raw)){if(/^[ab]_/.test(key)){plans[key[0]][key.slice(2)]=key.endsWith('_name')?value:Number(value);}else practice[key]=Number(value);}return {practice,plans};}
 function render(){
  const data=read();let error='';
  if(!form.checkValidity())error='Check the numbers. Percentages must be between 0 and 100; clinicians and claims must be whole numbers.';
  else if(Object.values(data.plans).some(plan=>plan.aiusers>data.practice.providers))error='AI-enabled clinicians cannot exceed the number of clinicians in the practice.';
  $('ehr-error').textContent=error;$('ehr-results').hidden=!!error;result=null;if(error)return;
  result={...data,a:calculateEhrCosts(data.practice,data.plans.a),b:calculateEhrCosts(data.practice,data.plans.b)};
  $('ehr-totals').innerHTML=['a','b'].map(key=>'<div class="ehr-total"><span class="tag">'+esc(data.plans[key].name)+'</span><strong>'+money(result[key].monthly)+'</strong><span>monthly average</span><div class="line"><span>Recurring annual cost</span><b>'+money(result[key].annual)+'</b></div><div class="line"><span>First year, including setup</span><b>'+money(result[key].firstYear)+'</b></div></div>').join('');
  const delta=result.a.firstYear-result.b.firstYear;
  $('ehr-difference').textContent=Math.abs(delta)<0.005?'Both plans have the same estimated first-year cost.':data.plans.a.name+' is '+money(Math.abs(delta))+(delta>0?' higher':' lower')+' in the first year than '+data.plans.b.name+'. Compare the included features before deciding.';
  $('ehr-breakdown').querySelector('thead').innerHTML='<tr><th>Monthly average</th><th>'+esc(data.plans.a.name)+'</th><th>'+esc(data.plans.b.name)+'</th></tr>';
  $('ehr-breakdown').querySelector('tbody').innerHTML=result.a.lines.map((row,i)=>'<tr><th scope="row">'+row[0]+'</th><td>'+money(row[1])+'</td><td>'+money(result.b.lines[i][1])+'</td></tr>').join('');
 }
 function report(){render();if(!result){form.reportValidity();return null;}const assumptions=Object.entries(result.practice).map(([key,value])=>'<tr><th>'+esc(form.elements[key].closest('label').childNodes[0].textContent)+'</th><td>'+value+'</td></tr>').join('');
  const quotes=['a','b'].map(key=>'<h2>'+esc(result.plans[key].name)+' inputs</h2><table><tbody>'+Object.entries(result.plans[key]).filter(([name])=>name!=='name').map(([name,value])=>'<tr><th>'+esc(form.elements[key+'_'+name].closest('label').childNodes[0].textContent)+'</th><td>'+(name==='period'?(value===12?'Annual':'Monthly'):value)+'</td></tr>').join('')+'</tbody></table>').join('');
  return '<article class="doc"><h1 class="document-title">EHR cost comparison</h1><p class="document-subtitle">Planning estimate from entered assumptions · '+new Date().toLocaleDateString('en-US')+'</p><p>'+esc($('ehr-difference').textContent)+'</p><h2>Annual comparison</h2><table><thead><tr><th>Plan</th><th>Recurring annual</th><th>First year</th></tr></thead><tbody>'+['a','b'].map(key=>'<tr><th>'+esc(result.plans[key].name)+'</th><td>'+money(result[key].annual)+'</td><td>'+money(result[key].firstYear)+'</td></tr>').join('')+'</tbody></table><h2>Monthly breakdown</h2>'+$('ehr-breakdown').outerHTML+'<h2>Practice assumptions</h2><table><tbody>'+assumptions+'</tbody></table>'+quotes+'<h2>Scope</h2><p>Average sessions = clinicians × weekly sessions × working weeks ÷ 12. One card transaction per card-paid session. AI usage applies to enabled clinicians. First year adds setup to twelve months of recurring costs.</p><p>Inputs are user-supplied; initial and demo values are fictional examples. Confirm vendor quotes, included features, and billing units. Excludes taxes, discounts, refunds, chargebacks, financing, and staff time. No guarantee of vendor charges.</p></article>';
 }
 form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('input',render);form.addEventListener('change',render);
 $('ehr-demo').addEventListener('click',()=>{form.reset();document.documentElement.dataset.demo='true';render();});
 $('ehr-reset').addEventListener('click',()=>{form.reset();delete document.documentElement.dataset.demo;render();});
 $('ehr-download').addEventListener('click',()=>{const doc=report();if(doc)OttoDocuments.download(doc,'ehr-cost-comparison');});
 $('ehr-print').addEventListener('click',()=>{const doc=report();if(doc)OttoDocuments.print(doc);});render();
})();
