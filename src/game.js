import {clockAt,newReport,validReport} from './day-cycle.js';
export const MAX_LEVEL = 10;
export const recipes = {
 espresso: {name:'Espresso',price:24,beans:1,milk:0,time:3,level:0,icon:'☕'},
 latte: {name:'Latte',price:38,beans:1,milk:1,time:4,level:1,icon:'🥛'},
 americano: {name:'Americano',price:32,beans:1,milk:0,time:3.5,level:1,icon:'☕'},
 mocha: {name:'Mocha',price:52,beans:2,milk:1,time:5,level:2,icon:'🍫'},
 cappuccino: {name:'Cappuccino',price:48,beans:1,milk:2,time:4.5,level:3,icon:'☁️'},
 flatWhite: {name:'Flat White',price:60,beans:2,milk:1,time:4.8,level:4,icon:'🥛'},
 cortado: {name:'Cortado',price:64,beans:2,milk:1,time:4.2,level:5,icon:'☕'},
 icedLatte: {name:'Iced Latte',price:76,beans:2,milk:2,time:5,level:6,icon:'🧊'},
 macchiato: {name:'Macchiato',price:80,beans:2,milk:1,time:4.6,level:7,icon:'☕'},
 coldBrew: {name:'Cold Brew',price:92,beans:3,milk:0,time:5.5,level:8,icon:'🧊'},
 cafeAuLait: {name:'Café au Lait',price:104,beans:2,milk:3,time:5.8,level:9,icon:'🥛'},
 kowlSignature: {name:'KOWL Signature',price:132,beans:3,milk:2,time:6.5,level:10,icon:'🦉'}
};
export const initial = () => ({money:120,beans:12,milk:6,sold:0,earned:0,machine:0,van:0,staff:0,selected:'espresso',clock:0,report:newReport(1),history:[]});
export function restore(storage) {
 try {
  const s=JSON.parse(storage.getItem('kowl-v2'));
  if(!s) return initial();
  // Migrate hired/not-hired baristas without resetting existing progress.
  if(typeof s.staff==='boolean')s.staff=s.staff?1:0;
  const valid=['money','beans','milk','sold','earned','machine','van','staff'].every(k=>Number.isSafeInteger(s[k])&&s[k]>=0);
  if(!valid||s.machine>MAX_LEVEL||s.van>MAX_LEVEL||s.staff>MAX_LEVEL||!recipes[s.selected]||recipes[s.selected].level>s.machine) return initial();
  const result=Object.fromEntries(['money','beans','milk','sold','earned','machine','van','staff','selected'].map(k=>[k,s[k]]));
  result.clock=Number.isFinite(s.clock)&&s.clock>=0&&s.clock<1e10?s.clock:0;
  result.report=validReport(s.report)&&s.report.day===clockAt(result.clock).day?s.report:newReport(clockAt(result.clock).day);
  result.history=Array.isArray(s.history)?s.history.filter(validReport).slice(-7):[];
  return result;
 } catch {return initial();}
}
export function canBrew(s,kind) {
 const r=recipes[kind];return !!r&&r.level<=s.machine&&s.beans>=r.beans&&s.milk>=r.milk;
}
export function consume(s,kind){if(!canBrew(s,kind))return false;const r=recipes[kind];s.beans-=r.beans;s.milk-=r.milk;return true;}
export function sell(s,kind){const income=recipes[kind].price+s.van*4;s.money+=income;s.earned+=income;s.sold++;s.report.sold++;s.report.revenue+=income*100;s.report.ingredients+=recipes[kind].beans*400+recipes[kind].milk*375;return income;}
export function cost(s,key){
 const base={machine:180,van:240,staff:420}[key];
 return base===undefined?Infinity:Math.ceil(base*1.45**s[key]/10)*10;
}
export function brewSeconds(s,kind){return Math.max(1.1,recipes[kind].time*(1-s.machine*.045)*(1-s.staff*.035));}
export function queueCapacity(s){return 4+Math.floor(s.van/2);}
export function arrivalSeconds(s){return Math.max(2,7-s.van*.45);}
export function upgrade(s,key){
 if(!['machine','van','staff'].includes(key)||s[key]>=MAX_LEVEL)return false;
 const c=cost(s,key);if(s.money<c)return false;s.money-=c;s.report.upgrades+=c*100;s[key]++;return true;
}
export function restock(s,key){const c=key==='beans'?40:key==='milk'?30:Infinity;if(s.money<c)return false;s.money-=c;s[key]+=key==='beans'?10:8;return true;}
