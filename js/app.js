import { initRoles } from './roles.js';
import { loadData } from './data.js';
import { bindFilters, applyFilters } from './filters.js';
import { renderKPIAndCharts } from './charts.js';
import { renderTable } from './table.js';
import { initAddAsset } from './addAsset.js';
import { initEditModal } from './editModal.js';
import { initExport } from './exportExcel.js';

async function loadPartials(){
  const holders = document.querySelectorAll('[data-partial]');
  for(const el of holders){
    const url = el.getAttribute('data-partial');
    const txt = await fetch(url, { cache:'no-store' }).then(r=>r.text());
    el.innerHTML = txt;
  }
}

async function boot(){
  await loadPartials();
  await initRoles();
  await loadData();
  bindFilters();
  renderKPIAndCharts();
  renderTable();
  initAddAsset();
  initEditModal();
  initExport();
}
boot();

