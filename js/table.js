import { $, badgeFor, statusOf } from './utils.js';
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


// حافظنا على اختيار الكل + تحديث زر الحذف الجماعي
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
const btn = document.getElementById('btnBulkDelete');
const checked = Array.from(document.querySelectorAll('input[type="checkbox"][data-chk]:checked')).length;
if(checked>0 && canWrite()){ btn.classList.remove('opacity-60'); btn.disabled=false; }
else { btn.classList.add('opacity-60'); btn.disabled=true; }
}
});
