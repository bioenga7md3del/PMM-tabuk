import { auth, db } from './firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { $, notice } from './utils.js';

export let me=null, myRole='viewer', mySites=[], myDepts=[];
export const canWrite = ()=> (myRole==='admin' || myRole==='engineer' || myRole==='tech');
export const canManageUsers = ()=> myRole==='admin';
export const canTouchAsset = (x)=>{
  if(myRole==='admin') return true;
  if(myRole==='engineer'){
    return mySites.length===0 || mySites.includes(x.site||'');
  }
  if(myRole==='tech'){
    const okSite = (mySites.length===0) || mySites.includes(x.site||'');
    const okDept = (myDepts.length===0) || myDepts.includes(x.department||'');
    return okSite && okDept;
  }
  return false;
};

export function bindLogout(){ $('#btnLogout')?.addEventListener('click', async ()=>{ try{ await signOut(auth); location.href='login.html'; }catch{} }); }

export async function initRoles(){
  return new Promise(resolve=>{
    onAuthStateChanged(auth, async (u)=>{
      if(!u){ location.href='login.html'; return; }
      me = u;
      try{
        const us = await getDoc(doc(db,'users', u.uid));
        if(us.exists()){
          const ud = us.data();
          myRole  = ud.role || 'viewer';
          mySites = Array.isArray(ud.sites)? ud.sites : [];
          myDepts = Array.isArray(ud.departments)? ud.departments : [];
        }
      }catch{}
      if(myRole==='admin'){ $('#btnAdmin')?.classList.remove('hidden'); }
      if(!canWrite()){ $('#btnImport')?.classList.add('opacity-60'); $('#btnImport')?.classList.add('pointer-events-none'); }
      bindLogout();
      notice('تم تسجيل الدخول ✅','ok');
      resolve();
    });
  });
}

