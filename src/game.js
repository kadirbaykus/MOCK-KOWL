export const recipes = {
 espresso: {name:'Espresso',price:24,beans:1,milk:0,time:3,level:0,icon:'☕'},
 latte: {name:'Latte',price:38,beans:1,milk:1,time:4,level:1,icon:'🥛'},
 mocha: {name:'Mocha',price:52,beans:2,milk:1,time:5,level:2,icon:'🍫'}
};
export const initial = () => ({money:120,beans:12,milk:6,sold:0,earned:0,machine:0,van:0,staff:false,selected:'espresso'});
export function restore(storage) {
 try {
  const s=JSON.parse(storage.getItem('kowl-v2'));
  if(!s) return initial();
  const valid=['money','beans','milk','sold','earned','machine','van'].every(k=>Number.isSafeInteger(s[k])&&s[k]>=0);
  if(!valid||s.machine>3||s.van>3||typeof s.staff!=='boolean'||!recipes[s.selected]||recipes[s.selected].level>s.machine) return initial();
  return Object.fromEntries(Object.keys(initial()).map(k=>[k,s[k]]));
 } catch {return initial();}
}
export function canBrew(s,kind) {
 const r=recipes[kind];return !!r&&r.level<=s.machine&&s.beans>=r.beans&&s.milk>=r.milk;
}
export function consume(s,kind){if(!canBrew(s,kind))return false;const r=recipes[kind];s.beans-=r.beans;s.milk-=r.milk;return true;}
export function sell(s,kind){const income=recipes[kind].price+s.van*4;s.money+=income;s.earned+=income;s.sold++;return income;}
export function cost(s,key){return key==='machine'?180*2**s.machine:key==='van'?240*2**s.van:420;}
export function upgrade(s,key){
 if(!['machine','van','staff'].includes(key))return false;
 if(key==='staff'?s.staff:s[key]>=3)return false;
 const c=cost(s,key);if(s.money<c)return false;s.money-=c;if(key==='staff')s.staff=true;else s[key]++;return true;
}
export function restock(s,key){const c=key==='beans'?40:key==='milk'?30:Infinity;if(s.money<c)return false;s.money-=c;s[key]+=key==='beans'?10:8;return true;}
