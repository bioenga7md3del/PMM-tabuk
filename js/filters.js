import { $, } from './utils.js';
import { getVisible, setFiltered } from './data.js';
import { statusOf } from './utils.js';
import { renderTable } from './table.js';
import { renderKPIAndCharts } from './charts.js';
import { getSites, getDepts } from './data.js';

function fillOptions(sel, arr, first='—'){
  const el = $(sel); el.innerHTML='';
  if(first!==null){ const opt=document.createElement('option'); opt.value=''; opt.textContent=first; el.appendChild(opt); }
  arr.forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; el.appendChild(o); });
}

export function bindFilters(){
  fillOptions('#f_site', getSites(), 'كل المواقع');
  fillDeptFilterForSite('');

  document.getElementById('f_site').addEventListener('change', ()=>{
    fillDeptFilterForSite(document.getElementById('f_site').value);
  });

  document.getElementById('btnApply').addEventListener('click', applyFilters);
  document.getElementById('btnClear').addEventListener('click', ()=>{
    document.getElementById('search').value='';
    document.getElementById('f_site').value='';
    fillDeptFilterForSite('');
    document.getElementById('f_dept').value='';
    document.getElementById('f_state').value='';
    applyFilters();
  });
}

export function fillDeptFilterForSite(siteValue){
  const vis = getVisible();
  let list;
  if(!siteValue){
    const d=new Set(); vis.forEach(x=> x.department && d.add(x.department));
    list=[...d].sort();
  }else{
    const d=new Set(); vis.forEach(x=>{ if(x.site===siteValue && x.department) d.add(x.department); });
    list=[...d].sort();
  }
  fillOptions('#f_dept', list, 'كل الأقسام');
}

export function applyFilters(){
  const vis = getVisible();
  const q = (document.getElementById('search').value||'').toLowerCase().trim();
  const fs = document.getElementById('f_site').value;
  const fd = document.getElementById('f_dept').value;
  const st = document.getElementById('f_state').value;

  const filtered = vis.filter(x=>{
    if(fs && x.site!==fs) return false;
    if(fd && x.department!==fd) return false;
    if(q){
      const blob = [x.control,x.name,x.tech,x.location,x.brand,x.serial].map(v=>String(v||'').toLowerCase()).join('|');
      if(!blob.includes(q)) return false;
    }
    if(st && statusOf(x.pm_date,x.next_date)!==st) return false;
    return true;
  });
  setFiltered(filtered);
  renderTable();
  renderKPIAndCharts();
}

