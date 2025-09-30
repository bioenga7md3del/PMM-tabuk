import { getFiltered } from './data.js';
import { pad, statusOf } from './utils.js';

let ch1=null, ch2=null, ch3=null;

export function renderKPIAndCharts(){
  const filtered = getFiltered();
  // KPIs
  document.getElementById('k_total').textContent = filtered.length;
  const now = new Date();
  const ym = now.getFullYear()+'-'+pad(now.getMonth()+1);
  const thisMonth = filtered.filter(x=> (x.pm_date||'').startsWith(ym)).length;
  document.getElementById('k_thisMonth').textContent = thisMonth;
  const dueSoon = filtered.filter(x=> statusOf(x.pm_date,x.next_date)==='dueSoon').length;
  const overdue = filtered.filter(x=> statusOf(x.pm_date,x.next_date)==='overdue').length;
  document.getElementById('k_dueSoon').textContent = dueSoon;
  document.getElementById('k_overdue').textContent = overdue;

  // Chart 1
  const active = filtered.filter(x=> statusOf(x.pm_date,x.next_date)==='active').length;
  if(ch1) ch1.destroy();
  ch1 = new Chart(document.getElementById('chStatus'), {
    type:'doughnut',
    data:{ labels:['ساري','خلال 30 يوم','منتهي'], datasets:[{ data:[active, dueSoon, overdue] }] },
    options:{ responsive:true, maintainAspectRatio:true, cutout:'60%', plugins:{ legend:{ position:'bottom', labels:{ boxWidth:12 } } } }
  });

  // Chart 2: آخر 6 شهور
  const buckets = {};
  const ref = new Date(); ref.setDate(1); ref.setHours(0,0,0,0);
  for(let i=5;i>=0;i--){ const d=new Date(ref); d.setMonth(d.getMonth()-i); const k=d.getFullYear()+'-'+pad(d.getMonth()+1); buckets[k]=0; }
  filtered.forEach(x=>{ if(x.pm_date){ const ym=x.pm_date.slice(0,7); if(ym in buckets) buckets[ym]+=1; } });
  if(ch2) ch2.destroy();
  ch2 = new Chart(document.getElementById('chMonthly'), {
    type:'bar',
    data:{ labels:Object.keys(buckets), datasets:[{ label:'PMs', data:Object.values(buckets) }] },
    options:{ responsive:true, maintainAspectRatio:true, scales:{ y:{ beginAtZero:true, precision:0 } }, plugins:{ legend:{ display:false } } }
  });

  // Chart 3: المواقع × شهور السنة
  const monthLabels = ['ينا','فبر','مار','أبر','ماي','يون','يول','أغس','سبت','أكت','نوف','ديس'];
  const siteSet = new Map();
  filtered.forEach(x=>{
    const site = x.site || 'غير محدد';
    const pm = x.pm_date || '';
    if(pm.length<7) return;
    const m = parseInt(pm.slice(5,7),10);
    if(!siteSet.has(site)) siteSet.set(site, Array(12).fill(0));
    siteSet.get(site)[m-1] += 1;
  });
  const entries = Array.from(siteSet.entries()).sort((a,b)=> b[1].reduce((s,v)=>s+v,0)-a[1].reduce((s,v)=>s+v,0));
  const top = entries.slice(0,6);
  const rest = entries.slice(6);
  if(rest.length){
    const other = Array(12).fill(0);
    rest.forEach(([_,arr])=> arr.forEach((v,i)=> other[i]+=v ));
    top.push(['أخرى', other]);
  }
  const datasets = top.map(([site, arr])=> ({ label: site, data: arr, stack:'s1' }));
  if(ch3) ch3.destroy();
  ch3 = new Chart(document.getElementById('chSiteMonth'), {
    type:'bar',
    data:{ labels: monthLabels, datasets },
    options:{ responsive:true, maintainAspectRatio:true, scales:{ x:{ stacked:true }, y:{ stacked:true, beginAtZero:true, precision:0 } }, plugins:{ legend:{ position:'bottom', labels:{ boxWidth:12 } } } }
  });
}

