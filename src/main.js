import './style.css';
import {createWorld} from './world.js';
import {recipes,restore,canBrew,consume,sell,cost,upgrade,restock} from './game.js';
const $=id=>document.getElementById(id);let state=restore(localStorage),tab='menu',queue=[],nextId=0,brew=null,arrival=0;
$('ui').innerHTML=`<div class="top"><div class="brand"><span class="owl">🦉</span><div><b>KOWL</b><small>COFFEE & LITTLE JOYS</small></div></div><div class="wallet"><span>🪙</span><div><small>YOUR CASH</small><b id="money"></b></div><span class="pill" id="sold"></span></div></div><div class="left"><div class="panel"><div class="eyebrow">IT STARTS WITH A LITTLE DREAM</div><div class="goal" id="goal"></div><div class="track"><div class="fill" id="goalFill"></div></div><p id="goalHint"></p><p class="hint">Drag to rotate the camera.<br>Pinch to zoom.</p></div><div class="camera"><button id="left" aria-label="Rotate camera left">↶</button><button id="right" aria-label="Rotate camera right">↷</button><button id="zoomIn" aria-label="Zoom in">＋</button><button id="zoomOut" aria-label="Zoom out">−</button></div></div><div class="bottom"><div class="bar"><div class="notice" id="notice" role="status" aria-live="polite">Welcome to KOWL! Your first customer wants an espresso.</div><div class="save" id="save">● Autosave</div></div><section class="panel"><div class="tabs"><button data-tab="menu">☕ Menu</button><button data-tab="stock">📦 Supplies</button><button data-tab="upgrades">✨ Upgrades</button></div><div class="actions" id="actions"></div><div class="footer"><div class="stock" id="stock"></div><button class="primary" id="serve">☕ Brew coffee</button></div><div class="progress"><div class="fill" id="brewFill"></div></div></section></div>`;
let world;
try{world=createWorld($('world'));}catch(e){const overlay=document.createElement('div');overlay.className='loading';overlay.innerHTML='<b>KOWL</b><p>Could not start the 3D scene.<br>Enable graphics acceleration in your browser settings and try again.</p>';document.body.append(overlay);throw e;}
world.upgrade(state.van);
function save(){try{localStorage.setItem('kowl-v2',JSON.stringify(state));}catch{$('save').textContent='Could not save';}}
function say(text){$('notice').textContent=text;}
function addCustomer(){if(queue.length>=4+state.van)return;const choices=Object.keys(recipes).filter(k=>recipes[k].level<=state.machine);const kind=nextId===0?'espresso':choices[Math.floor(Math.random()*choices.length)];queue.push({id:nextId,kind});world.person(nextId++);render();}
function render(){
 $('money').textContent=state.money.toLocaleString('en-US')+' ₺';$('sold').textContent=state.sold+' coffees';
 const target=state.sold<5?5:state.sold<20?20:50;
 $('goal').textContent=state.sold>=50?'The neighborhood coffee star!':'Sell your first '+target+' coffees';$('goalHint').textContent=state.sold>=50?'Discover new recipes and all the upgrades.':state.sold+' / '+target+' sold · Grow with every cup.';$('goalFill').style.width=Math.min(100,state.sold/target*100)+'%';
 document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
 const actions=$('actions');actions.replaceChildren();
 function item(title,description,disabled,action,selected=false){const b=document.createElement('button');b.className='item'+(selected?' selected':'');b.innerHTML='<strong>'+title+'</strong><small>'+description+'</small>';b.disabled=disabled;b.onclick=action;actions.append(b);}
 if(tab==='menu')for(const [k,r] of Object.entries(recipes)){const locked=r.level>state.machine;item(r.icon+' '+r.name,locked?'Requires machine level '+r.level:(r.price+state.van*4)+' ₺ · '+r.time+' sec<br>'+r.beans+(r.beans===1?' bean':' beans')+(r.milk?' · '+r.milk+' milk':''),locked,()=>{state.selected=k;save();render();},state.selected===k);}
 if(tab==='stock'){
  item('🫘 Coffee beans','10 portions · 40 ₺',state.money<40,()=>buy('beans'));
  item('🥛 Fresh milk','8 portions · 30 ₺',state.money<30,()=>buy('milk'));
  item('🚚 Local supplier','Your supplies are delivered instantly.',true,()=>{});
 }
 if(tab==='upgrades')for(const k of ['machine','van','staff']){const max=k==='staff'?state.staff:state[k]>=3;const title=k==='machine'?'⚙️ Coffee machine':k==='van'?'🚐 Caravan':'🧑‍🍳 Barista';const desc=k==='machine'?'New recipes and faster brewing':k==='van'?'+4 ₺ per coffee, more customers':'Automatically brews the next order';item(title,max?'Completed':desc+'<br>'+cost(state,k)+' ₺',max||state.money<cost(state,k),()=>{if(upgrade(state,k)){world.upgrade(state.van);say('Great! '+title+' upgraded.');save();render();}});}
 const first=queue[0];$('stock').textContent='🫘 '+state.beans+' beans · 🥛 '+state.milk+' milk'+(first?' | Next: '+recipes[first.kind].name+' ('+queue.length+' in line)':' | Waiting for customers');
 $('serve').disabled=!!brew||!first||!canBrew(state,state.selected);
 $('serve').textContent=brew?'⏳ Brewing…':!first?'Waiting for customers':state.selected!==first.kind?'Select '+recipes[first.kind].name+' first':'☕ Brew '+recipes[first.kind].name;
 // A recipe must match the customer's order; no stock is wasted on a mismatch.
 if(first&&state.selected!==first.kind)$('serve').disabled=true;
}
function buy(k){if(restock(state,k)){say('Supplies delivered. Coffee time!');save();render();}}
function startBrew(auto=false){const first=queue[0];if(brew||!first)return;const kind=auto?first.kind:state.selected;if(kind!==first.kind||!consume(state,kind))return;brew={kind,start:performance.now(),duration:Math.max(1.2,recipes[kind].time-state.machine*.4)*1000};save();render();}
$('serve').onclick=()=>startBrew();document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;render();});
$('left').onclick=()=>world.rotate(-.3);$('right').onclick=()=>world.rotate(.3);$('zoomIn').onclick=()=>world.zoom(.88);$('zoomOut').onclick=()=>world.zoom(1.12);
addCustomer();addCustomer();
setInterval(()=>{
 if(document.hidden)return;
 const now=performance.now();
 if(brew){const progress=Math.min(1,(now-brew.start)/brew.duration);$('brewFill').style.width=progress*100+'%';if(progress>=1){const income=sell(state,brew.kind);queue.shift();world.depart();brew=null;say('Enjoy your coffee! +'+income+' ₺ · '+state.sold+' coffees sold.');$('brewFill').style.width='0%';save();render();}}
 arrival+=.1;if(arrival>=Math.max(3,7-state.van)){arrival=0;addCustomer();}
 if(state.staff&&!brew&&queue.length)startBrew(true);
},100);
