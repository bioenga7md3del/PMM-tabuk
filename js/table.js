import { $, badgeFor, statusOf } from './utils.js';
import { getFiltered } from './data.js';
import { canWrite, canTouchAsset } from './roles.js';

// ===== Pagination State =====
let currentPage = 1;
let pageSize = 50; // الافتراضي 50، ويمكن يكون "all"

export function setPage(n){
  currentPage = Math.max(1, parseInt(n||1,10));
  renderTable();
}
export function setPageSize(n){
  if(n === 'all'){ pageSize = 'all'; }
  else{
    const v = parseInt(n||50,10);
    pageSize = (isNaN(v) || v<=0) ? 50 : v;
  }
  currentPage = 1;
  renderTable();
}

export function renderTable(){
  const tb = document.getElementById('tbody'); tb.innerHTML='';
  const list = getFiltered();

  // ===== Compute & update pager UI =====
  const total = list.length;
  const pages = (pageSize === 'all') ? 1 : Math.max(1, Math.ceil(total / pageSize));
  if(currentPage > pages) currentPage = pages;
  const start = (pageSize === 'all') ? 0 : (currentPage - 1) * pageSize;
  const rows  = (pageSize === 'all') ? list : list.slice(start, start + pageSize);

  const pageStats = document.getElementById('pageStats');
  const pageInfo  = document.getElementById('pageInfo');
  const prevBtn   = document.getElementById('prevPage');
  const nextBtn   = document.getElementById('nextPage');
  const sizeSel   = document.getElementById('pageSize');

  if(pageStats) pageStats.textContent = total ? `عرض ${start+1}–${Math.min(start+rows.length,total)} من ${total}` : 'لا توجد نتائج';
  if(pageInfo)  pageInfo.textContent  = `${currentPage}/${pages}`;
  if(sizeSel && String(sizeSel.value)!==String(pageSize)){ sizeSel.value = String(pageSize); }
  if(prevBtn){ prevBtn.disabled = currentPage<=1 || pageSize==='all'; prevBtn.classList.toggle('opacity-50', prevBtn.disabled); }
  if(nextBtn){ nextBtn.disabled = currentPage>=pages || pageSize==='all'; nextBtn.classList.toggle('opacity-50', nextBtn.disabled); }

  // Bind once
  if(!window.__pagerBound){
    window.__pagerBound = true;
    prevBtn?.addEventListener('click', ()=>{ if(currentPage>1){ currentPage--; renderTable(); } });
    nextBtn?.addEventListener('click', ()=>{ const p=(pageSize==='all')?1:Math.max(1, Math.ceil(getFiltered().length / pageSize)); if(currentPage<p){ currentPage++; renderTable(); } });
    sizeSel?.addEventListener('change', (e)=>{ const v=e.target.value; setPageSize(v); });
  }

  // ===== Render visible rows =====
  rows.forEach(x=>{
    const st = statusOf(x.pm_date, x.next_date);
    const editable = canTouchAsset(x) && canWrite();
    const tr = document.createElement('tr');
    tr.className='border-b border-slate-800';
    tr.innerHTML = `
      <td class="p-2"><input type="checkbox" data-chk="${x.id}" ${editable?'':'disabled'}/></td>
      <td class="p-2 font-bold">${x.control||'—'}</td>
      <td class="p-2">${x.name||'—'}</td>
      <td class="p-2">${x.brand||'—'}</td>
      <td class="p-2">${x.serial||'—'}</td>
      <td class="p-2">${x.site||'—'}</td>
      <td class="p-2">${x.department||'—'}</td>
      <td class="p-2">${x.pm_date||'—'}</td>
      <td class="p-2">${x.next_date||'—'}</td>
      <td class="p-2">${x.tech||'—'}</td>
      <td class="p-2">${badgeFor(st)}</td>
      <td class="p-2">
        <div class="flex flex-wrap gap-1">
          <a class="px-2 py-1 rounded bg-slate-600 text-slate-100" href="sticker.html#view/${encodeURIComponent(x.control)}" target="_blank" title="Sticker">Sticker</a>
          <a class="px-2 py-1 rounded bg-sky-500 text-slate-900" href="qr.html?control=${encodeURIComponent(x.control)}" target="_blank" title="QR">QR</a>
          <button class="px-2 py-1 rounded bg-emerald-500 text-slate-900 ${editable?'':'opacity-60 pointer-events-none'}" data-pm="${x.id}" data-ctrl="${x.control||''}">تم عمل الصيانة</button>
          <button class="px-2 py-1 rounded bg-red-500 text-white ${editable?'':'opacity-60 pointer-events-none'}" data-del="${x.id}">حذف</button>
        </div>
      </td>`;
    tb.appendChild(tr);
  });

  refreshBulkButton();
}

function refreshBulkButton(){
  const checked = Array.from(document.querySelectorAll('input[type="checkbox"][data-chk]:checked')).length;
  const btn = document.getElementById('btnBulkDelete');
  if(checked>0 && canWrite()){ btn.classList.remove('opacity-60'); btn.disabled=false; }
  else { btn.classList.add('opacity-60'); btn.disabled=true; }
}

// تحديث زر الحذف الجماعي
document.addEventListener('change', (e)=>{
  if(e.target && e.target.matches('input[type="checkbox"][data-chk], #chkAll')){
    if(e.target.id==='chkAll'){
      const state = e.target.checked;
      document.querySelectorAll('input[type="checkbox"][data-chk]').forEach(c=>{
        const id = c.getAttribute('data-chk');
        const row = getFiltered().find(r=> r.id===id);
        if(canTouchAsset(row) && canWrite()) c.checked=state;
      });
    }
    refreshBulkButton();
  }
});
