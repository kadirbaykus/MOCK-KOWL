import './style.css';
import {caravanStages} from './caravan.js';
import {createPaymentEffects} from './payment-effects.js';
import {createWorld} from './world.js';
import {recipes,restore,canBrew,consume,sell,cost,upgrade,restock,MAX_LEVEL,brewSeconds,queueCapacity,arrivalSeconds} from './game.js';
const $=id=>document.getElementById(id);let state=restore(localStorage),tab='menu',queue=[],nextId=0,brew=null,arrival=0,lastActionSignature='';
$('ui').innerHTML=`<div class="top"><div class="brand"><span class="owl">🦉</span><div><b>KOWL</b><small>COFFEE & LITTLE JOYS</small></div></div><div class="wallet"><span>🪙</span><div><small>YOUR CASH</small><b id="money"></b></div><span class="pill" id="sold"></span></div></div><div class="left"><div class="panel"><div class="eyebrow">IT STARTS WITH A LITTLE DREAM</div><div class="goal" id="goal"></div><div class="track"><div class="fill" id="goalFill"></div></div><p id="goalHint"></p><p id="orderStatus" class="order-status" aria-label="Order and pickup status"></p><p class="hint">Drag to rotate the camera.<br>Pinch to zoom.</p></div><div class="camera"><button id="left" aria-label="Rotate camera left">↶</button><button id="right" aria-label="Rotate camera right">↷</button><button id="zoomIn" aria-label="Zoom in">＋</button><button id="zoomOut" aria-label="Zoom out">−</button></div></div><div class="bottom"><div class="bar"><div class="notice" id="notice" role="status" aria-live="polite">Welcome to KOWL! Customers order at the touchscreen, then collect at the caravan.</div><div class="save" id="save">● Autosave</div></div><section class="panel"><div class="tabs"><button data-tab="menu">☕ Menu</button><button data-tab="stock">📦 Supplies</button><button data-tab="upgrades">✨ Upgrades</button></div><div class="actions" id="actions"></div><small id="menuHint" class="menu-hint"></small><div class="footer"><div class="stock" id="stock"></div><button class="primary" id="serve">☕ Brew coffee</button></div><div class="progress"><div class="fill" id="brewFill"></div></div></section></div>`;
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
function render(){
 $('money').textContent=state.money.toLocaleString('en-US')+' ₺';$('sold').textContent=state.sold+' coffees';
 const target=state.sold<5?5:state.sold<20?20:50;
 $('goal').textContent=state.sold>=50?'The neighborhood coffee star!':'Sell your first '+target+' coffees';$('goalHint').textContent=state.sold>=50?'Discover new recipes and all the upgrades.':state.sold+' / '+target+' sold · Grow with every cup.';$('goalFill').style.width=Math.min(100,state.sold/target*100)+'%';
 document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
 const actionSignature=JSON.stringify(tab==='menu'?[tab,state.machine,state.van,state.staff,state.selected]:[tab,state.money,state.machine,state.van,state.staff]);
 if(actionSignature!==lastActionSignature){
 lastActionSignature=actionSignature;
 const actions=$('actions');const scrollLeft=actions.scrollLeft;actions.classList.toggle('recipe-list',tab==='menu');actions.replaceChildren();$('menuHint').hidden=tab!=='menu';$('menuHint').textContent=Object.values(recipes).filter(r=>r.level<=state.machine).length+' / '+Object.keys(recipes).length+' recipes unlocked · Swipe to explore →';
 function item(title,description,disabled,action,selected=false){const b=document.createElement('button');b.className='item'+(selected?' selected':'');b.innerHTML='<strong>'+title+'</strong><small>'+description+'</small>';b.disabled=disabled;b.onclick=action;actions.append(b);}
 if(tab==='menu')for(const [k,r] of Object.entries(recipes)){const locked=r.level>state.machine;item(r.icon+' '+r.name,locked?'Requires machine level '+r.level:(r.price+state.van*4)+' ₺ · '+brewSeconds(state,k).toFixed(1)+' sec<br>'+r.beans+(r.beans===1?' bean':' beans')+(r.milk?' · '+r.milk+' milk':''),locked,()=>{state.selected=k;save();render();},state.selected===k);}
 if(tab==='stock'){
  item('🫘 Coffee beans','10 portions · 40 ₺',state.money<40,()=>buy('beans'));
  item('🥛 Fresh milk','8 portions · 30 ₺',state.money<30,()=>buy('milk'));
  item('🚚 Local supplier','Your supplies are delivered instantly.',true,()=>{});
 }
 if(tab==='upgrades')for(const k of ['machine','van','staff']){
  const level=state[k],max=level>=MAX_LEVEL;
  const title=k==='machine'?'⚙️ Coffee machine':k==='van'?'🚐 Caravan':'🧑‍🍳 Barista';
  const nextRecipes=Object.values(recipes).filter(r=>r.level===level+1).map(r=>r.name).join(' & ');
  const desc=k==='machine'?'Faster brewing'+(nextRecipes?' · Unlock '+nextRecipes:''):k==='van'?'Next: '+caravanStages[level+1]?.name+' · '+(caravanStages[level+1]?.feature??'')+' · +4 ₺ per coffee':level===0?'Hire a barista to brew orders automatically':'Faster brewing with each barista level';
  item(title+' · Lv. '+level+'/'+MAX_LEVEL,max?'Max level reached':desc+'<br>'+cost(state,k).toLocaleString('en-US')+' ₺ → Lv. '+(level+1),max||state.money<cost(state,k),()=>{
   if(upgrade(state,k)){if(k==='van')world.upgrade(state.van,{animate:true});say(title+' reached level '+state[k]+'!');save();render();}
  });
 }
 actions.scrollLeft=scrollLeft;
 }
 const first=queue[0];$('stock').textContent='🫘 '+state.beans+' beans · 🥛 '+state.milk+' milk'+(first?' | Next: '+recipes[first.kind].name+' ('+queue.length+' in line)':' | Waiting for kiosk orders');
 $('serve').disabled=!!brew||!first||!canBrew(state,state.selected);
 $('serve').textContent=brew?(brew.ready?'☕ Ready · Waiting at pickup':'⏳ Brewing…'):!first?'Waiting for kiosk orders':state.selected!==first.kind?'Select '+recipes[first.kind].name+' first':'☕ Brew '+recipes[first.kind].name;
 // A recipe must match the customer's order; no stock is wasted on a mismatch.
 if(first&&state.selected!==first.kind)$('serve').disabled=true;
}
function buy(k){if(restock(state,k)){say('Supplies delivered. Coffee time!');save();render();}}
function startBrew(auto=false){const first=queue[0];if(brew||!first)return;const kind=auto?first.kind:state.selected;if(kind!==first.kind||!consume(state,kind))return;brew={kind,start:performance.now(),duration:brewSeconds(state,kind)*1000,ready:false};world.brewing(true);save();render();}
$('serve').onclick=()=>startBrew();document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;render();});
$('left').onclick=()=>world.rotate(-.3);$('right').onclick=()=>world.rotate(.3);$('zoomIn').onclick=()=>world.zoom(.88);$('zoomOut').onclick=()=>world.zoom(1.12);
$('world').addEventListener('customer-ordered',event=>{queue.push(event.detail);say(recipes[event.detail.kind].name+' ordered at the kiosk. Customer is heading to pickup.');render();});
addCustomer();addCustomer();
setInterval(()=>{
 if(document.hidden)return;
 const now=performance.now();
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
