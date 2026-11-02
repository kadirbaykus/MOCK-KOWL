import './style.css';
import {uiMarkup,setupDrawers} from './ui.js';
import {clockAt,advanceClock,dailyProfit,formatLira} from './day-cycle.js';
import {caravanStages} from './caravan.js';
import {createPaymentEffects} from './payment-effects.js';
import {createWorld} from './world.js';
import {recipes,restore,canBrew,consume,sell,cost,upgrade,restock,MAX_LEVEL,brewSeconds,queueCapacity,arrivalSeconds} from './game.js';
const $=id=>document.getElementById(id);let state=restore(localStorage),tab='menu',queue=[],nextId=0,brew=null,arrival=0,lastActionSignature='';
$('ui').innerHTML=uiMarkup;
const drawers=setupDrawers();
let lastUpgradeSignature='',previousTick=performance.now(),lastClockSave=0;
let world;
try{world=createWorld($('world'));}catch(e){const overlay=document.createElement('div');overlay.className='loading';overlay.innerHTML='<b>KOWL</b><p>Could not start the 3D scene.<br>Enable graphics acceleration in your browser settings and try again.</p>';document.body.append(overlay);throw e;}
world.upgrade(state.van);
const payments=createPaymentEffects(document.querySelector('.wallet'));
$('world').addEventListener('caravan-upgraded',event=>{
 const old=document.querySelector('.caravan-reveal');if(old)old.remove();
 const banner=document.createElement('div');banner.className='caravan-reveal';banner.setAttribute('role','status');
 const small=document.createElement('small');small.textContent='CARAVAN UPGRADED · LEVEL '+event.detail.level;
 const title=document.createElement('strong');title.textContent=event.detail.name;banner.append(small,title);document.body.append(banner);
 const reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
 const animation=banner.animate([{opacity:0,transform:'translate(-50%, -8px)'},{offset:.15,opacity:1,transform:'translate(-50%, 0)'},{offset:.8,opacity:1,transform:'translate(-50%, 0)'},{opacity:0,transform:'translate(-50%, -8px)'}],{duration:reduced?1500:2400});animation.onfinish=()=>banner.remove();animation.oncancel=()=>banner.remove();
});
function save(){try{localStorage.setItem('kowl-v2',JSON.stringify(state));}catch{$('save').textContent='Could not save';}}
function say(text){$('notice').textContent=text;}
function addCustomer(){if(world.customerCount()>=queueCapacity(state))return;const choices=Object.keys(recipes).filter(k=>recipes[k].level<=state.machine);const kind=nextId===0?'espresso':choices[Math.floor(Math.random()*choices.length)];world.person(nextId++,kind);render();}
 function item(parent,title,description,disabled,action,selected=false){const b=document.createElement('button');b.className='item'+(selected?' selected':'');b.innerHTML='<strong>'+title+'</strong><small>'+description+'</small>';b.disabled=disabled;b.onclick=action;parent.append(b);}
function render(){
 $('money').textContent=state.money.toLocaleString('en-US')+' ₺';$('sold').textContent=state.sold+' coffees';
 const target=state.sold<5?5:state.sold<20?20:50;
 $('goal').textContent=state.sold>=50?'The neighborhood coffee star!':'Sell your first '+target+' coffees';$('goalHint').textContent=state.sold>=50?'Discover new recipes and all the upgrades.':state.sold+' / '+target+' sold · Grow with every cup.';$('goalFill').style.width=Math.min(100,state.sold/target*100)+'%';
 document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
 const shopTab=tab==='upgrades'?'menu':tab;
 const actionSignature=JSON.stringify(shopTab==='menu'?[shopTab,state.machine,state.van,state.staff,state.selected]:[shopTab,state.money,state.machine,state.van,state.staff]);
 if(actionSignature!==lastActionSignature){
 lastActionSignature=actionSignature;
 const actions=$('actions');const scrollLeft=actions.scrollLeft;actions.classList.toggle('recipe-list',shopTab==='menu');actions.replaceChildren();$('menuHint').hidden=shopTab!=='menu';$('menuHint').textContent=Object.values(recipes).filter(r=>r.level<=state.machine).length+' / '+Object.keys(recipes).length+' recipes unlocked · Scroll to explore ↓';
 if(shopTab==='menu')for(const [k,r] of Object.entries(recipes)){const locked=r.level>state.machine;item(actions,r.icon+' '+r.name,locked?'Requires machine level '+r.level:(r.price+state.van*4)+' ₺ · '+brewSeconds(state,k).toFixed(1)+' sec<br>'+r.beans+(r.beans===1?' bean':' beans')+(r.milk?' · '+r.milk+' milk':''),locked,()=>{state.selected=k;save();render();},state.selected===k);}
 if(shopTab==='stock'){
  item(actions,'🫘 Coffee beans','10 portions · 40 ₺',state.money<40,()=>buy('beans'));
  item(actions,'🥛 Fresh milk','8 portions · 30 ₺',state.money<30,()=>buy('milk'));
  item(actions,'🚚 Local supplier','Your supplies are delivered instantly.',true,()=>{});
 }
 actions.scrollLeft=scrollLeft;
 }
 const upgradeSignature=JSON.stringify([state.money,state.machine,state.van,state.staff]);
 if(upgradeSignature!==lastUpgradeSignature){lastUpgradeSignature=upgradeSignature;$('upgradeActions').replaceChildren();
 for(const k of ['machine','van','staff']){
  const level=state[k],max=level>=MAX_LEVEL;
  const title=k==='machine'?'⚙️ Coffee machine':k==='van'?'🚐 Caravan':'🧑‍🍳 Barista';
  const nextRecipes=Object.values(recipes).filter(r=>r.level===level+1).map(r=>r.name).join(' & ');
  const desc=k==='machine'?'Faster brewing'+(nextRecipes?' · Unlock '+nextRecipes:''):k==='van'?'Next: '+caravanStages[level+1]?.name+' · '+(caravanStages[level+1]?.feature??'')+' · +4 ₺ per coffee':level===0?'Hire a barista to brew orders automatically':'Faster brewing with each barista level';
  item($('upgradeActions'),title+' · Lv. '+level+'/'+MAX_LEVEL,max?'Max level reached':desc+'<br>'+cost(state,k).toLocaleString('en-US')+' ₺ → Lv. '+(level+1),max||state.money<cost(state,k),()=>{
   if(upgrade(state,k)){if(k==='van')world.upgrade(state.van,{animate:true});say(title+' reached level '+state[k]+'!');save();render();}
  });
 }
 }
 renderReport();
 const first=queue[0];$('stock').textContent='🫘 '+state.beans+' beans · 🥛 '+state.milk+' milk'+(first?' | Next: '+recipes[first.kind].name+' ('+queue.length+' in line)':' | Waiting for kiosk orders');
 $('serve').disabled=!!brew||!first||!canBrew(state,state.selected);
 $('serve').textContent=brew?(brew.ready?'☕ Ready · Waiting at pickup':'⏳ Brewing…'):!first?'Waiting for kiosk orders':state.selected!==first.kind?'Select '+recipes[first.kind].name+' first':'☕ Brew '+recipes[first.kind].name;
 // A recipe must match the customer's order; no stock is wasted on a mismatch.
 if(first&&state.selected!==first.kind)$('serve').disabled=true;
}
function renderReport(){
 const time=clockAt(state.clock),report=state.report;
 $('gameDay').textContent='DAY '+time.day+' · '+(time.night?'NIGHT':'DAYTIME');$('gameClock').textContent=(time.night?'🌙 ':'☀️ ')+time.text;
 $('gameClock').dataset.time=time.text;document.body.dataset.period=time.night?'night':'day';world.setTime(time.hours);
 $('reportDay').textContent='DAY '+report.day;$('dailySold').textContent=report.sold;$('dailyRevenue').textContent=formatLira(report.revenue);$('dailyIngredients').textContent=formatLira(report.ingredients);$('dailyUpgrades').textContent=formatLira(report.upgrades);$('dailyProfit').textContent=formatLira(dailyProfit(report));
 const last=state.history.at(-1);$('yesterday').textContent=last?'Previous day: '+last.sold+' coffees · '+formatLira(dailyProfit(last))+' profit':'';
}
function buy(k){if(restock(state,k)){say('Supplies delivered. Coffee time!');save();render();}}
function startBrew(auto=false){const first=queue[0];if(brew||!first)return;const kind=auto?first.kind:state.selected;if(kind!==first.kind||!consume(state,kind))return;brew={kind,start:performance.now(),duration:brewSeconds(state,kind)*1000,ready:false};world.brewing(true);save();render();}
$('serve').onclick=()=>startBrew();document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;if(tab==='upgrades')drawers.open('business');render();});
$('left').onclick=()=>world.rotate(-.3);$('right').onclick=()=>world.rotate(.3);$('zoomIn').onclick=()=>world.zoom(.88);$('zoomOut').onclick=()=>world.zoom(1.12);
$('world').addEventListener('customer-ordered',event=>{queue.push(event.detail);say(recipes[event.detail.kind].name+' ordered at the kiosk. Customer is heading to pickup.');render();});
addCustomer();addCustomer();previousTick=performance.now();save();
document.addEventListener('visibilitychange',()=>{previousTick=performance.now();if(document.hidden)save();});
setInterval(()=>{
 const now=performance.now(),elapsed=(now-previousTick)/1000;previousTick=now;
 if(document.hidden)return;
 const newDay=advanceClock(state,elapsed);renderReport();if(newDay||now-lastClockSave>=5000){save();lastClockSave=now;}
 if(brew){
  const progress=Math.min(1,(now-brew.start)/brew.duration);$('brewFill').style.width=progress*100+'%';
  if(progress>=1&&!brew.ready){brew.ready=true;world.brewing(false);world.readyCoffee(brew.kind);say(recipes[brew.kind].name+' is ready at the caravan. Waiting for the customer.');render();}
  if(brew.ready&&world.canCollect(queue[0]?.id)){
   const origin=world.completeSale(queue[0].id,brew.kind);
   if(origin){const income=sell(state,brew.kind);queue.shift();payments.play(origin,income);brew=null;say('Enjoy your coffee! +'+income+' ₺ · '+state.sold+' coffees sold.');$('brewFill').style.width='0%';save();render();}
  }
 }
 const status=world.orderStatus();const orderStatus=$('orderStatus');orderStatus.dataset.kiosk=status.kiosk;orderStatus.dataset.pickup=status.pickup;orderStatus.dataset.ready=String(!!brew?.ready);orderStatus.dataset.seated=status.seated;
 const statusText='ORDER KIOSK: '+status.kiosk+' · PICKUP: '+status.pickup+' · SEATED: '+status.seated+'/'+status.seats+(brew?.ready?' · COFFEE READY':'');if(orderStatus.textContent!==statusText)orderStatus.textContent=statusText;
 arrival+=.1;if(arrival>=arrivalSeconds(state)){arrival=0;addCustomer();}
 if(state.staff&&!brew&&queue.length)startBrew(true);
},100);
