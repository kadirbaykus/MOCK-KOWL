export const uiMarkup=`
<header class="top">
 <div class="brand"><span class="owl">🦉</span><div><b>KOWL</b><small>COFFEE & LITTLE JOYS</small></div></div>
 <div class="clock" aria-label="Game clock"><small id="gameDay">DAY 1 · DAYTIME</small><strong id="gameClock">☀️ 06:00</strong><span>Day / night: 2 min each</span></div>
 <div class="wallet"><span>🪙</span><div><small>YOUR CASH</small><b id="money"></b></div><span class="pill" id="sold"></span></div>
</header>
<section class="live-hud" aria-label="Inventory and next order">
 <div class="inventory-counter"><span aria-hidden="true">🫘</span><div><small>Beans</small><strong id="hudBeans">0</strong></div></div>
 <div class="inventory-counter"><span aria-hidden="true">🥛</span><div><small>Milk</small><strong id="hudMilk">0</strong></div></div>
 <div class="next-order" role="status" aria-live="polite" aria-atomic="true"><small>Next order</small><strong id="hudOrder">Waiting for orders</strong><span id="hudOrderStatus">Customers order at the kiosk</span></div>
</section>
<aside class="left drawer" id="cafeDrawer" aria-label="Café controls">
 <section class="panel shop-panel">
  <div class="drawer-heading"><h2>☕ Your café</h2><button class="drawer-close" data-close="cafeDrawer" aria-label="Close café controls">×</button></div>
  <div class="tabs"><button data-tab="menu">☕ Menu</button><button data-tab="stock">📦 Supplies</button><button data-tab="upgrades">✨ Upgrades</button></div>
  <div class="actions" id="actions"></div><small id="menuHint" class="menu-hint"></small>
  <div class="footer"><div class="stock" id="stock"></div><button class="primary" id="serve">☕ Brew coffee</button></div>
  <div class="progress"><div class="fill" id="brewFill"></div></div>
  <p id="orderStatus" class="order-status" aria-label="Order and pickup status"></p>
  <details class="goals"><summary id="goal">Your next goal</summary><div class="track"><div class="fill" id="goalFill"></div></div><p id="goalHint"></p></details>
 </section>
 <div class="camera"><button id="left" aria-label="Rotate camera left">↶</button><button id="right" aria-label="Rotate camera right">↷</button><button id="zoomIn" aria-label="Zoom in">＋</button><button id="zoomOut" aria-label="Zoom out">−</button></div>
</aside>
<aside class="right drawer" id="businessDrawer" aria-label="Daily report and upgrades">
 <section class="panel daily-report"><div class="drawer-heading"><h2>📒 Daily report</h2><button class="drawer-close" data-close="businessDrawer" aria-label="Close business panel">×</button></div>
  <div class="report-day" id="reportDay">DAY 1</div>
  <dl><div><dt>Coffees sold</dt><dd id="dailySold">0</dd></div><div><dt>Revenue</dt><dd id="dailyRevenue">0 ₺</dd></div><div><dt>Ingredients used</dt><dd id="dailyIngredients">0 ₺</dd></div><div><dt>Upgrades</dt><dd id="dailyUpgrades">0 ₺</dd></div><div class="profit"><dt>Net profit</dt><dd id="dailyProfit">0 ₺</dd></div></dl>
  <small class="report-note">Profit = revenue − ingredients used − upgrades.<br>A new game day starts at 06:00.</small><small id="yesterday" class="report-note"></small>
 </section>
 <section class="panel upgrade-panel"><h2>✨ Upgrades</h2><div id="upgradeActions" class="upgrade-actions"></div></section>
 <div class="save" id="save">● Autosave</div>
</aside>
<div class="notice" id="notice" role="status" aria-live="polite">Welcome to KOWL! Customers order at the touchscreen, then collect at the caravan.</div>
<nav class="mobile-tools"><button id="openCafe" aria-label="Open café controls" aria-expanded="false" aria-controls="cafeDrawer">☕ Café</button><button id="openBusiness" aria-label="Open business panel" aria-expanded="false" aria-controls="businessDrawer">📒 Business</button></nav>`;

export function setupDrawers(){
 const cafe=document.getElementById('cafeDrawer'),business=document.getElementById('businessDrawer');
 function open(which){cafe.classList.toggle('open',which==='cafe');business.classList.toggle('open',which==='business');document.getElementById('openCafe').setAttribute('aria-expanded',String(which==='cafe'));document.getElementById('openBusiness').setAttribute('aria-expanded',String(which==='business'));}
 document.getElementById('openCafe').onclick=()=>open(cafe.classList.contains('open')?null:'cafe');
 document.getElementById('openBusiness').onclick=()=>open(business.classList.contains('open')?null:'business');
 document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>open(null));
 return {open};
}
