export const $ = s => document.querySelector(s);
export const pad = n => n<10 ? ('0'+n) : ''+n;
export const toISO = d => new Date(d).toISOString().slice(0,10);
export const addMonths = (dateObj, n)=>{ const d=new Date(dateObj); d.setMonth(d.getMonth()+n); return d; };
export const calcNext = pm => pm ? toISO(addMonths(new Date(pm),6)) : '';
export const safeId = s => (s||'').trim().replace(/[\/#?\s]/g,'-');
export const notice=(m,t='info')=>{ const n=$('#notice'); if(!n) return; n.textContent=m; n.className='notice '+(t==='ok'?'n-ok':t==='error'?'n-err':'n-info'); };
export function statusOf(pm_date, next_date){
  if(!next_date) return 'active';
  const t = new Date(); t.setHours(0,0,0,0);
  const next = new Date(next_date); next.setHours(0,0,0,0);
  const grace = new Date(next); grace.setDate(grace.getDate()+30);
  if(t > grace) return 'overdue';
  const diffDays = Math.ceil((next - t)/86400000);
  if(diffDays <= 30 && diffDays >= 0) return 'dueSoon';
  return 'active';
}
export function badgeFor(st){
  if(st==='overdue') return '<span class="px-2 py-1 rounded-full text-xs font-bold bg-red-200 text-red-900">منتهي</span>';
  if(st==='dueSoon') return '<span class="px-2 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-900">خلال 30 يوم</span>';
  return '<span class="px-2 py-1 rounded-full text-xs font-bold bg-emerald-200 text-emerald-900">ساري</span>';
}

