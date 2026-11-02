import {test,expect} from '@playwright/test';

test('stock and next-order readout work with mobile drawers closed and update on brewing/restock',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(page.locator('#cafeDrawer')).toBeHidden();await expect(page.locator('#hudBeans')).toHaveText('12');await expect(page.locator('#hudMilk')).toHaveText('6');
 await expect(page.locator('#hudOrder')).toContainText('Espresso',{timeout:15000});
 await page.getByRole('button',{name:'Open café controls',exact:true}).click();await page.locator('#serve').click();
 await expect(page.locator('#hudBeans')).toHaveText('11');await expect(page.locator('#hudMilk')).toHaveText('6');
 await page.getByRole('button',{name:'Open café controls',exact:true}).click();await expect(page.locator('#hudOrderStatus')).toContainText('Brewing');
 await expect(page.locator('#money')).toHaveText('144 ₺',{timeout:15000});
 await page.getByRole('button',{name:'Open café controls',exact:true}).click();await page.getByRole('button',{name:'📦 Supplies',exact:true}).click();await page.getByRole('button',{name:/Coffee beans/}).click();await page.getByRole('button',{name:/Fresh milk/}).click();
 await page.getByRole('button',{name:'Open café controls',exact:true}).click();await expect(page.locator('#hudBeans')).toHaveText('21');await expect(page.locator('#hudMilk')).toHaveText('14');await expect(page.locator('#hudOrder')).toContainText('Espresso');
});

test('empty inventory visibly warns which action is needed for the current order',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('kowl-v2',JSON.stringify({money:120,beans:0,milk:0,sold:0,earned:0,machine:0,van:0,staff:0,selected:'espresso'})));
 await page.goto('/');await expect(page.locator('#hudBeans')).toHaveText('0');await expect(page.locator('#hudMilk')).toHaveText('0');await expect(page.locator('#hudOrderStatus')).toHaveText('Low stock · Open Supplies',{timeout:15000});await expect(page.locator('#serve')).toBeDisabled();
});
