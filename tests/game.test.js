import {test} from 'node:test';import assert from 'node:assert/strict';
import {initial,consume,sell,upgrade,restock,restore,recipes,MAX_LEVEL,brewSeconds,queueCapacity,arrivalSeconds} from '../src/game.js';
test('sale loop consumes stock and pays only after completion',()=>{const s=initial();assert.equal(consume(s,'latte'),false);assert.equal(consume(s,'espresso'),true);assert.equal(s.beans,11);assert.equal(s.money,120);assert.equal(sell(s,'espresso'),24);assert.equal(s.money,144);assert.equal(s.sold,1);});
test('all three upgrades reach level ten, charge funds, and stop at the cap',()=>{
 const s=initial();assert.equal(upgrade(s,'machine'),false);s.money=1000000;
 for(const key of ['machine','van','staff']){
  for(let i=0;i<MAX_LEVEL;i++){const money=s.money;assert.equal(upgrade(s,key),true);assert.equal(s[key],i+1);assert.ok(s.money<money);}
  const money=s.money;assert.equal(upgrade(s,key),false);assert.equal(s.money,money);
 }
 assert.equal(upgrade(s,'invalid'),false);
});
test('restocking and insufficient stock cannot yield negative resources',()=>{const s=initial();s.beans=0;assert.equal(consume(s,'espresso'),false);assert.equal(restock(s,'beans'),true);assert.equal(s.money,80);assert.equal(s.beans,10);s.money=0;assert.equal(restock(s,'milk'),false);});
test('invalid saves reset safely and valid saves restore',()=>{const storage=v=>({getItem:()=>v});assert.deepEqual(restore(storage('{bad')),initial());assert.deepEqual(restore(storage(JSON.stringify({...initial(),money:-1}))),initial());const s={...initial(),money:999};assert.deepEqual(restore(storage(JSON.stringify(s))),s);});

test('legacy boolean baristas migrate without losing progress',()=>{
 for(const hired of [false,true]){
  const old={...initial(),money:160,sold:88,machine:3,van:2,staff:hired,selected:'mocha'};
  assert.deepEqual(restore({getItem:()=>JSON.stringify(old)}),{...old,staff:hired?1:0});
 }
 const max={...initial(),machine:10,van:10,staff:10,selected:'kowlSignature'};
 assert.deepEqual(restore({getItem:()=>JSON.stringify(max)}),max);
 assert.deepEqual(restore({getItem:()=>JSON.stringify({...max,staff:11})}),initial());
});
test('all twelve recipes unlock at their level and require their full ingredients',()=>{
 assert.equal(Object.keys(recipes).length,12);
 for(const [key,r] of Object.entries(recipes)){
  const s={...initial(),machine:Math.max(0,r.level-1),beans:10,milk:10};
  if(r.level>0)assert.equal(consume(s,key),false);
  s.machine=r.level;assert.equal(consume(s,key),true);assert.equal(s.beans,10-r.beans);assert.equal(s.milk,10-r.milk);
  s.beans=0;assert.equal(consume(s,key),false);
 }
});
test('higher levels improve preparation, income and customer throughput',()=>{
 const base=initial(),max={...initial(),machine:10,van:10,staff:10};
 for(const key of Object.keys(recipes)){assert.ok(brewSeconds(max,key)<brewSeconds(base,key));assert.ok(brewSeconds(max,key)>=1.1);}
 assert.equal(sell(max,'espresso'),64);assert.equal(queueCapacity(max),9);assert.ok(arrivalSeconds(max)<arrivalSeconds(base));
 const upgraded={...base,staff:1};assert.ok(brewSeconds({...upgraded,staff:2},'latte')<brewSeconds(upgraded,'latte'));
});
