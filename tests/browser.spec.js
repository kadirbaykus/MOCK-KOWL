import {test,expect} from '@playwright/test';
async function openCafe(page){if(await page.locator('#serve').isHidden())await page.getByRole('button',{name:'Open café controls',exact:true}).click();}
async function seedOnReload(page,patch){
 await page.evaluate(p=>sessionStorage.setItem('kowl-test-seed',JSON.stringify(p)),patch);
 await page.addInitScript(()=>{const raw=sessionStorage.getItem('kowl-test-seed');if(raw){const current=JSON.parse(localStorage.getItem('kowl-v2')||'{}');localStorage.setItem('kowl-v2',JSON.stringify({...current,...JSON.parse(raw)}));sessionStorage.removeItem('kowl-test-seed');}});
 await page.reload();
}
test('3D scene, sales, persistence, restock and recipe unlock on tablet',async({page})=>{
 await page.setViewportSize({width:1024,height:768});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page.locator('canvas')).toBeVisible();await expect(page.locator('html')).toHaveAttribute('lang','en');await expect(page.getByRole('button',{name:'Rotate camera left'})).toBeVisible();await expect(page.locator('#goal')).toHaveText('Sell your first 5 coffees');await page.screenshot({path:'test-results/kowl-tablet.png'});
 await expect(page.locator('#money')).toHaveText('120 ₺');await page.locator('#serve').click();await expect(page.locator('#money')).toHaveText('144 ₺',{timeout:15000});await expect(page.locator('.payment-coin')).toHaveCount(6);await expect(page.locator('.sale-income')).toHaveText('+24 ₺');await expect(page.locator('.payment-effects span')).toHaveCount(0,{timeout:6000});await page.reload();await expect(page.locator('#money')).toHaveText('144 ₺');
 await page.getByRole('button',{name:'📦 Supplies'}).click();await page.getByRole('button',{name:/Coffee beans/}).click();await expect(page.locator('#money')).toHaveText('104 ₺');
 await seedOnReload(page,{money:1000});await openCafe(page);await page.getByRole('button',{name:'✨ Upgrades',exact:true}).click();await page.getByRole('button',{name:/Coffee machine/}).click();await expect(page.locator('#money')).toHaveText('820 ₺');await openCafe(page);await page.getByRole('button',{name:'☕ Menu',exact:true}).click();await expect(page.getByRole('button',{name:/🥛 Latte/})).toBeEnabled();await page.locator('#right').click();expect(errors).toEqual([]);
});
test('phone controls stay within the viewport',async({page})=>{await page.setViewportSize({width:390,height:844});await page.goto('/');await openCafe(page);for(const id of ['serve','money','actions']){const r=await page.locator('#'+id).boundingBox();expect(r.x).toBeGreaterThanOrEqual(0);expect(r.x+r.width).toBeLessThanOrEqual(390);expect(r.y+r.height).toBeLessThanOrEqual(844);}await page.screenshot({path:'test-results/kowl-phone.png'});});

test('legacy barista save upgrades to level ten and the expanded menu scrolls',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await seedOnReload(page,{money:1000000,beans:100,milk:100,sold:88,earned:2000,machine:9,van:9,staff:true,selected:'espresso'});await openCafe(page);await page.getByRole('button',{name:'✨ Upgrades',exact:true}).click();
 await expect(page.getByRole('button',{name:/Barista · Lv. 1\/10/})).toBeEnabled();
 await page.getByRole('button',{name:/Coffee machine · Lv. 9\/10/}).click();
 await expect(page.getByRole('button',{name:/Coffee machine · Lv. 10\/10/})).toBeDisabled();
 await page.getByRole('button',{name:/Caravan · Lv. 9\/10/}).click();await expect(page.locator('.caravan-reveal')).toContainText('KOWL Flagship');
 for(let i=1;i<10;i++)await page.getByRole('button',{name:new RegExp('Barista · Lv. '+i+'/10')}).click();
 await expect(page.getByRole('button',{name:/Barista · Lv. 10\/10/})).toBeDisabled();
 await openCafe(page);await page.getByRole('button',{name:'☕ Menu',exact:true}).click();
 await expect(page.locator('#actions button')).toHaveCount(12);
 const signature=page.getByRole('button',{name:/KOWL Signature/});await signature.scrollIntoViewIfNeeded();await expect(signature).toBeInViewport();await signature.click();
 await expect(page.locator('#menuHint')).toContainText('12 / 12');
 await page.reload();
 const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('kowl-v2')));expect(s.machine).toBe(10);expect(s.van).toBe(10);expect(s.staff).toBe(10);expect(s.sold).toBeGreaterThanOrEqual(88);
});

test('reduced motion keeps sale feedback without flying coins',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.locator('#serve').click();
 await expect(page.locator('#money')).toHaveText('144 ₺',{timeout:15000});await expect(page.locator('.payment-coin')).toHaveCount(0);
 await expect(page.locator('.payment-effects span')).toHaveCount(0,{timeout:3000});
});

test('ready coffee waits for the kiosk customer to reach the caravan',async({page})=>{
 await page.goto('/');await seedOnReload(page,{money:120,beans:12,milk:6,sold:0,earned:0,machine:10,van:0,staff:0,selected:'espresso'});
 await expect(page.locator('#serve')).toBeDisabled();await expect(page.locator('#orderStatus')).toContainText('ORDER KIOSK');
 await expect(page.locator('#serve')).toBeEnabled({timeout:15000});await page.locator('#serve').click();
 await expect(page.locator('#orderStatus')).toHaveAttribute('data-ready','true',{timeout:6000});await expect(page.locator('#money')).toHaveText('120 ₺');
 await expect(page.locator('#money')).toHaveText('144 ₺',{timeout:15000});await expect(page.locator('#orderStatus')).toHaveAttribute('data-ready','false');
});

test('a customer takes their coffee to a table without blocking the next order',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');await openCafe(page);await page.locator('#serve').click();await expect(page.locator('#money')).toHaveText('144 ₺',{timeout:15000});
 await expect.poll(async()=>Number(await page.locator('#orderStatus').getAttribute('data-seated')),{timeout:30000}).toBeGreaterThan(0);
 await expect(page.locator('#orderStatus')).toContainText('SEATED: 1/6');await expect(page.locator('#serve')).toBeEnabled({timeout:15000});
});

test('side panels leave the scene center clear and the daily report tracks profit',async({page})=>{
 await page.setViewportSize({width:1280,height:800});await page.goto('/');
 const clear=await page.evaluate(()=>document.elementFromPoint(innerWidth/2,innerHeight/2)?.tagName==='CANVAS');expect(clear).toBe(true);
 await expect(page.locator('#dailySold')).toHaveText('0');await expect(page.locator('#dailyProfit')).toHaveText('0 ₺');
 await page.locator('#serve').click();await expect(page.locator('#dailySold')).toHaveText('1',{timeout:15000});await expect(page.locator('#dailyProfit')).toHaveText('20 ₺');await expect(page.locator('#dailyIngredients')).toHaveText('4 ₺');
});
test('night lighting and daily rollover retain the previous report',async({page})=>{
 await page.goto('/');await seedOnReload(page,{clock:130,report:{day:1,sold:4,revenue:9600,ingredients:1600,upgrades:0}});
 await expect(page.locator('body')).toHaveAttribute('data-period','night');await expect(page.locator('#gameDay')).toContainText('NIGHT');await expect(page.locator('#dailyProfit')).toHaveText('80 ₺');await page.screenshot({path:'test-results/kowl-night.png'});
 await seedOnReload(page,{clock:239.8});
 await expect(page.locator('#gameDay')).toContainText('DAY 2',{timeout:6000});await expect(page.locator('body')).toHaveAttribute('data-period','day');await expect(page.locator('#dailySold')).toHaveText('0');await expect(page.locator('#yesterday')).toContainText('4 coffees · 80 ₺ profit');
});
