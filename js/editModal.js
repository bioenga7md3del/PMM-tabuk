import { $, calcNext, notice } from './utils.js';
import { db } from './firebase.js';
import { updateDoc, doc, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getFiltered, loadData } from './data.js';
import { canWrite, canTouchAsset } from './roles.js';
import { renderTable } from './table.js';
import { renderKPIAndCharts } from './charts.js';

export function initEditModal(){
  document.getElementById('btnEditClose')?.addEventListener('click', closeEdit);

  // فتح مودال "تم عمل الصيانة"
  document.addEventListener('click', async (e)=>{
    const bPM = e.target.closest('button[data-pm]');
    const bDel= e.target.closest('button[data-del]');
    if(bPM){
      const id = bPM.getAttribute('data-pm');
      const ctrl = bPM.getAttribute('data-ctrl')||'';
      const row = getFiltered().find(r=> r.id===id);
      if(!canTouchAsset(row) || !canWrite()){ notice('صلاحياتك لا تسمح بالتعديل','error'); return; }
      $('#e_id').value = id;
      $('#e_control').textContent = ctrl;
      $('#e_pm').value = new Date().toISOString().slice(0,10);
      openEdit();
    }
    if(bDel){
      const id = bDel.getAttribute('data-del');
      const row = getFiltered().find(r=> r.id===id);
      if(!canTouchAsset(row) || !canWrite()){ notice('صلاحياتك لا تسمح بالحذف','error'); return; }
      if(confirm('تأكيد حذف هذا الجهاز؟')){
        try{
          await deleteDoc(doc(db,'assets', id));
          notice('تم الحذف ✅','ok');
          await loadData(); renderTable(); renderKPIAndCharts();
        }catch(err){ notice('فشل الحذف: '+err.message,'error'); }
      }
    }
  });

  document.getElementById('btnEditSave')?.addEventListener('click', saveEdit);

  // حذف جماعي
  document.getElementById('btnBulkDelete')?.addEventListener('click', async ()=>{
    const ids = Array.from(document.querySelectorAll('input[type="checkbox"][data-chk]:checked')).map(c=> c.getAttribute('data-chk'));
    if(ids.length===0) return;
    if(!confirm(`تأكيد حذف ${ids.length} جهاز؟`)) return;
    try{
      for(const id of ids){ await deleteDoc(doc(db,'assets', id)); }
      notice('تم الحذف الجماعي ✅','ok');
      await loadData(); renderTable(); renderKPIAndCharts();
    }catch(e){ notice('فشل الحذف الجماعي: '+e.message,'error'); }
  });
}

function openEdit(){ const m=$('#editModal'); m.classList.remove('hidden'); m.classList.add('flex'); }
function closeEdit(){ const m=$('#editModal'); m.classList.add('hidden'); m.classList.remove('flex'); }

async function saveEdit(){
  const id = document.getElementById('e_id').value;
  const pm = document.getElementById('e_pm').value;
  if(!pm){ notice('اختر تاريخ الصيانة','error'); return; }
  const row = getFiltered().find(r=> r.id===id);
  if(!canTouchAsset(row) || !canWrite()){ notice('صلاحياتك لا تسمح','error'); return; }
  try{
    await updateDoc(doc(db,'assets', id), { pm_date: pm, next_date: calcNext(pm), updatedAt: serverTimestamp() });
    notice('تم التحديث ✅','ok'); closeEdit();
    await loadData(); renderTable(); renderKPIAndCharts();
  }catch(e){ notice('فشل التحديث: '+e.message,'error'); }
}

