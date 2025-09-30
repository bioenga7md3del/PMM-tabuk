import { getFiltered } from './data.js';
import { pad, notice, statusOf } from './utils.js';

export function initExport(){
  document.getElementById('btnExport')?.addEventListener('click', exportExcel);
}

async function ensureXLSX(){
  if(window.XLSX) return window.XLSX;
  await new Promise((res,rej)=>{ const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/xlsx@0.19.3/dist/xlsx.full.min.js'; s.onload=res; s.onerror=rej; document.head.appendChild(s); });
  return window.XLSX;
}

async function exportExcel(){
  try{
    const XLSX = await ensureXLSX();
    const rows = getFiltered().map(x=>({
      Control: x.control||'',
      Name: x.name||'',
      Brand: x.brand||'',
      Serial: x.serial||'',
      Site: x.site||'',
      Department: x.department||'',
      Location: x.location||'',
      Technician: x.tech||'',
      PM_Date: x.pm_date||'',
      Next_Date: x.next_date||'',
      Status: statusOf(x.pm_date,x.next_date)
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Assets');
    const d = new Date();
    const fname = `assets_export_${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}.xlsx`;
    XLSX.writeFile(wb, fname);
    notice('تم تصدير الملف ✅','ok');
  }catch(e){
    notice('فشل التصدير: '+(e.message||'XLSX error'),'error');
    console.error(e);
  }
}

