import {test,expect} from '@playwright/test';

test.describe('Responsive touch browser',()=>{
 test.use({hasTouch:true,isMobile:true,deviceScaleFactor:1});
 test('portrait, landscape, small iPhone and browser-height changes preserve usable controls',async({page})=>{
  test.setTimeout(120000);await page.setViewportSize({width:360,height:640});await page.goto('/');
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const sizes=[[360,640],[640,360],[390,844],[844,390],[320,568],[430,932],[932,430],[390,720]];
  for(const [width,height] of sizes){
   await page.setViewportSize({width,height});
   if(await page.getByRole('button',{name:'Close café controls',exact:true}).isVisible())await page.getByRole('button',{name:'Close café controls',exact:true}).click();
   if(await page.getByRole('button',{name:'Close business panel',exact:true}).isVisible())await page.getByRole('button',{name:'Close business panel',exact:true}).click();
   await expect(page.locator('#cafeDrawer')).toBeHidden();await expect(page.locator('#businessDrawer')).toBeHidden();
   const boxes=[];
   for(const selector of ['.brand','.clock','.wallet','#openCafe','#openBusiness']){
    const box=await page.locator(selector).boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.y).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width+1);expect(box.y+box.height).toBeLessThanOrEqual(height+1);boxes.push(box);
   }
   expect(boxes[0].x+boxes[0].width).toBeLessThanOrEqual(boxes[1].x+1);expect(boxes[1].x+boxes[1].width).toBeLessThanOrEqual(boxes[2].x+1);
   await expect.poll(()=>page.locator('canvas').evaluate(c=>({w:c.width,h:c.height}))).toEqual({w:width,h:height});
   await page.getByRole('button',{name:'Open café controls',exact:true}).click();await page.locator('#serve').scrollIntoViewIfNeeded();await expect(page.locator('#serve')).toBeInViewport();
   const target=await page.locator('#serve').boundingBox();expect(target.height).toBeGreaterThanOrEqual(44);expect(parseFloat(await page.locator('#serve').evaluate(e=>getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(14);
   await page.getByRole('button',{name:'Open business panel',exact:true}).click();await expect(page.locator('#cafeDrawer')).toBeHidden();await expect(page.locator('#dailyProfit')).toBeVisible();
   await page.getByRole('button',{name:/Coffee machine/}).scrollIntoViewIfNeeded();await expect(page.getByRole('button',{name:/Coffee machine/})).toBeInViewport();
   await page.getByRole('button',{name:'Open business panel',exact:true}).click();
   if(width===390&&height===844||width===844&&height===390)await page.screenshot({path:'test-results/kowl-'+width+'x'+height+'.png'});
  }
  expect(errors).toEqual([]);
 });
});
