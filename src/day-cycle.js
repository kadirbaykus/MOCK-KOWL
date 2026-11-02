export const DAY_SECONDS=240;
export const newReport=day=>({day,sold:0,revenue:0,ingredients:0,upgrades:0});
export function clockAt(seconds){
 const day=Math.floor(seconds/DAY_SECONDS)+1,minutes=(360+Math.floor((seconds%DAY_SECONDS)*6))%1440;
 const hours=minutes/60,night=hours>=18||hours<6;
 return {day,hours,night,text:String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0')};
}
export function validReport(report){return !!report&&['day','sold','revenue','ingredients','upgrades'].every(k=>Number.isSafeInteger(report[k])&&report[k]>=0)&&report.day>=1;}
export function advanceClock(state,seconds){
 if(!Number.isFinite(seconds)||seconds<0)return false;
 state.clock+=seconds;const day=clockAt(state.clock).day;
 if(day===state.report.day)return false;
 state.history=[...state.history,state.report].slice(-7);state.report=newReport(day);return true;
}
export const dailyProfit=report=>report.revenue-report.ingredients-report.upgrades;
export const formatLira=cents=>(cents/100).toLocaleString('en-US',{maximumFractionDigits:2})+' ₺';
