import { db } from './firebase.js';
import { collection, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { notice } from './utils.js';
import { myRole, mySites, myDepts } from './roles.js';

let all=[], visible=[], filtered=[], sites=[], depts=[];

export function getAll(){ return all; }
export function getVisible(){ return visible; }
export function getFiltered(){ return filtered; }
export function setFiltered(v){ filtered = v; }
export function getSites(){ return sites; }
export function getDepts(){ return depts; }

export async function loadData(){
  try{
    notice('جارِ تحميل البيانات…');
    const qs = await getDocs(query(collection(db,'assets'), orderBy('control')));
    all = qs.docs.map(d=> ({ id: d.id, ...d.data() }));

    visible = all.filter(x=>{
      if(myRole==='admin') return true;
      if(myRole==='engineer') return (mySites.length===0) || mySites.includes(x.site||'');
      if(myRole==='tech'){
        const okSite = (mySites.length===0) || mySites.includes(x.site||'');
        const okDept = (myDepts.length===0) || myDepts.includes(x.department||'');
        return okSite && okDept;
      }
      return true;
    });

    const s=new Set(), d=new Set();
    visible.forEach(x=>{ if(x.site) s.add(x.site); if(x.department) d.add(x.department); });
    sites = [...s].sort(); depts=[...d].sort();

    filtered = visible.slice();
    notice('تم التحميل ✅','ok');
  }catch(e){
    notice('فشل التحميل: '+e.message,'error');
  }
}

