import {test} from 'node:test';import assert from 'node:assert/strict';
import {clockAt,advanceClock,dailyProfit,newReport,formatLira} from '../src/day-cycle.js';
import {initial,restore,sell,consume,upgrade,restock} from '../src/game.js';
test('two-minute day and night alternate with a centered 24-hour clock',()=>{
 assert.equal(clockAt(0).text,'06:00');assert.equal(clockAt(119.9).night,false);assert.equal(clockAt(120).text,'18:00');assert.equal(clockAt(120).night,true);assert.equal(clockAt(239.9).night,true);assert.equal(clockAt(240).text,'06:00');assert.equal(clockAt(240).day,2);assert.equal(clockAt(240).night,false);
});
test('daily reports count delivered coffee, ingredient costs and upgrade expenses once',()=>{
 const s=initial();consume(s,'espresso');assert.equal(s.report.sold,0);sell(s,'espresso');assert.equal(s.report.sold,1);assert.equal(dailyProfit(s.report),2000);assert.equal(formatLira(dailyProfit(s.report)),'20 ₺');
 restock(s,'milk');assert.equal(dailyProfit(s.report),2000);s.money=1000;upgrade(s,'machine');assert.equal(s.report.upgrades,18000);assert.equal(dailyProfit(s.report),-16000);
 const latte=initial();latte.machine=1;sell(latte,'latte');assert.equal(latte.report.ingredients,775);assert.equal(formatLira(dailyProfit(latte.report)),'30.25 ₺');
});
test('dawn archives the old day and resets only its report, preserving progress',()=>{
 const s=initial();s.clock=239.9;sell(s,'espresso');const money=s.money;assert.equal(advanceClock(s,.2),true);assert.deepEqual(s.report,newReport(2));assert.equal(s.history[0].sold,1);assert.equal(s.money,money);assert.equal(s.sold,1);
 assert.equal(advanceClock(s,1),false);for(let i=0;i<10;i++)advanceClock(s,240);assert.equal(s.history.length,7);
});
test('legacy progress survives migration and daily reports persist',()=>{
 const old={money:160,beans:4,milk:8,sold:88,earned:5000,machine:3,van:2,staff:true,selected:'mocha'};
 const migrated=restore({getItem:()=>JSON.stringify(old)});assert.equal(migrated.money,160);assert.equal(migrated.sold,88);assert.equal(migrated.staff,1);assert.equal(migrated.clock,0);assert.deepEqual(migrated.report,newReport(1));
 sell(migrated,'mocha');advanceClock(migrated,130);assert.deepEqual(restore({getItem:()=>JSON.stringify(migrated)}),migrated);
 const malformed={...migrated,report:{day:1,sold:-1}};assert.deepEqual(restore({getItem:()=>JSON.stringify(malformed)}).report,newReport(1));
});
