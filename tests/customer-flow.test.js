import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createCustomerFlow,kioskPosition,pickupPosition} from '../src/customer-flow.js';
function person(id,x=7.8,z=4.4){const g=new T.Group();g.position.set(x,.35,z);return {id,g,appearance:{speed:2.2},receiving:false,leaving:false};}
function advance(flow,seconds){for(let t=0;t<seconds;t+=.05)flow.update(.05);}
test('customer orders at the kiosk before walking to pickup',()=>{
 const people=[],orders=[],flow=createCustomerFlow(people,o=>orders.push(o));const p=person(0);flow.add(p,'espresso');
 assert.equal(flow.canCollect(0),false);advance(flow,.5);assert.equal(orders.length,0);
 while(p.stage!=='ordering')flow.update(.05);
 assert.ok(p.g.position.distanceTo(kioskPosition)<.05);assert.equal(orders.length,0);advance(flow,1);
 assert.deepEqual(orders,[{id:0,kind:'espresso'}]);assert.equal(p.stage,'toPickup');assert.equal(flow.canCollect(0),false);assert.equal(flow.claim(0),null);
 advance(flow,5);assert.ok(p.g.position.distanceTo(pickupPosition)<.05);assert.equal(flow.canCollect(0),true);assert.equal(flow.claim(0),p);assert.equal(flow.claim(0),null);
});
test('only one kiosk order at a time and pickup is FIFO by customer identity',()=>{
 const people=[],orders=[],flow=createCustomerFlow(people,o=>orders.push(o));flow.add(person(10,4.1,3.85),'latte');flow.add(person(20,4.83,4.31),'mocha');
 advance(flow,.6);assert.equal(orders.length,0);advance(flow,.6);assert.equal(orders.length,1);advance(flow,6);
 assert.deepEqual(orders.map(o=>o.id),[10,20]);assert.equal(flow.claim(20),null);const first=flow.claim(10);assert.ok(first);assert.equal(flow.claim(20),null);
 first.receiving=false;first.leaving=true;advance(flow,2);assert.ok(flow.claim(20));
});
