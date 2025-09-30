import { $, calcNext, safeId, notice } from './utils.js';
import { db } from './firebase.js';
import { setDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getVisible, loadData } from './data.js';
import { canWrite } from './roles.js';
import { renderTable } from './table.js';
import { renderKPIAndCharts } from './charts.js';

export function initAddAsset(){
  document.getElementById('btnAddToggle')?.addEventListener('click', ()=>{
    if(!canWrite()) return;
    document.getElementById('addPanel').classList.toggle('hidden');
    // تعبئة قوائم الموقع/القسم عند الفتح
    const vis = getVisible();
    const sEl = document.getElementById('a_site');
    const dEl = document.getElementById('a_dept');
    const sSet=new Set(), dSet=new Set();
    vis.forEach(x=>{ if(x.site) sSet.add(x.site); if(x.department) dSet.add(x.department); });
    sEl.innerHTML='<option value="">اختر الموقع…</option>' + [...sSet].sort().map(v=>`<option>${v}</option>`).join('');
    dEl.innerHTML='<option value="">اختر القسم…</option>' + [...dSet].sort().map(v=>`<option>${v}</option>`).join('');
  });
  document.getElementById('btnCancelAdd')?.addEventListener('click', ()=>{
    document.getElementById('addPanel').classList.add('hidden');
  });

  // تحديث الأقسام حسب الموقع
  document.getElementById('a_site')?.addEventListener('change', ()=>{
    const vis = getVisible();
    const selSite = document.getElementById('a_site').value;
    const d=new Set();
    vis.forEach(x=>{ if((!selSite || x.site===selSite) && x.department) d.add(x.department); });
    const dEl = document.getElementById('a_dept');
    dEl.innerHTML='<option value="">اختر القسم…</option>' + [...d].sort().map(v=>`<option>${v}</option>`).join('');
  });

  document.getElementById('btnSaveAsset')?.addEventListener('click', save);
}

async function save(){
  if(!canWrite()){ notice('صلاحياتك لا تسمح بالإضافة','error'); return; }
  const x = {
    control: document.getElementById('a_control').value.trim(),
    name   : document.getElementById('a_name').value.trim(),
    brand  : document.getElementById('a_brand').value.trim(),
    serial : document.getElementById('a_serial').value.trim(),
    site   : document.getElementById('a_site').value.trim(),
    department: document.getElementById('a_dept').value.trim(),
    location: document.getElementById('a_loc').value.trim(),
    tech   : document.getElementById('a_tech').value.trim(),
    pm_date: document.getElementById('a_pm').value
  };
  if(!x.control || !x.pm_date){ notice('أدخل Control و PM Date','error'); return; }

  try{
    await setDoc(doc(db,'assets', safeId(x.control)), {
      ...x, next_date: calcNext(x.pm_date), updatedAt: serverTimestamp()
    }, { merge:true });
    notice('تم حفظ الجهاز ✅','ok');
    document.getElementById('addPanel').classList.add('hidden');
    ['a_control','a_name','a_brand','a_serial','a_loc','a_tech'].forEach(id=> document.getElementById(id).value='');
    document.getElementById('a_site').value=''; document.getElementById('a_dept').value=''; document.getElementById('a_pm').value='';
    await loadData();
    renderTable();
    renderKPIAndCharts();
  }catch(e){ notice('فشل الحفظ: '+e.message,'error'); }
}

