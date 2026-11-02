import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createCustomerFlow} from '../src/customer-flow.js';
import {createSeats,reserveSeat} from '../src/seating.js';
import {createTraffic} from '../src/traffic.js';
const person=id=>({id,g:new T.Group(),appearance:{speed:3},receiving:false,hasCoffee:true,leaving:false});
function advance(flow,seconds){for(let t=0;t<seconds;t+=.05)flow.update(.05);}
test('served guests reserve different chairs, sit, leave and free chairs for new guests',()=>{
 const people=[],seats=createSeats(),flow=createCustomerFlow(people,()=>{},{seats,random:()=>0});
 const a=person(1),b=person(2);for(const p of [a,b]){flow.add(p,'espresso');p.stage='receiving';}
 flow.update(.05);assert.notEqual(a.seat.id,b.seat.id);assert.equal(flow.activeCount(),0);
 advance(flow,10);assert.equal(a.stage,'seated');assert.equal(b.stage,'seated');assert.equal(flow.snapshot().seated,2);
 const chair=a.seat;assert.equal(chair.takenBy,1);advance(flow,25);assert.equal(a.stage,'leaving');assert.equal(b.stage,'leaving');assert.equal(chair.takenBy,null);
 const c=person(3);c.g.position.copy(chair.position);assert.equal(reserveSeat(seats,c).id,chair.id);
});
test('full seating area does not block pickup or leak reservations',()=>{
 const seats=createSeats();for(let i=0;i<seats.length;i++)seats[i].takenBy=100+i;
 const people=[],flow=createCustomerFlow(people,()=>{},{seats});const p=person(4);flow.add(p,'latte');p.stage='receiving';flow.update(.1);
 assert.equal(p.stage,'leaving');assert.equal(p.leaving,true);assert.equal(flow.activeCount(),0);assert.equal(seats.filter(s=>s.takenBy!==null).length,6);
});
test('traffic waits a sparse randomized interval, crosses once and disposes the vehicle',()=>{
 const scene=new T.Scene(),mat=new T.MeshStandardMaterial(),traffic=createTraffic(scene,()=>mat,{random:()=>.5});
 assert.equal(traffic.snapshot().nextIn,40);traffic.tick(39);assert.equal(scene.children.length,0);traffic.tick(1);assert.equal(scene.children.length,1);
 const car=scene.children[0],before=car.position.x;const bounds=new T.Box3().setFromObject(car);assert.ok(bounds.min.y>.3&&bounds.min.y<.32);let disposed=0;car.traverse(o=>o.geometry?.addEventListener('dispose',()=>disposed++));traffic.tick(1);assert.notEqual(car.position.x,before);
 traffic.tick(15);assert.equal(scene.children.length,0);assert.ok(disposed>0);assert.equal(traffic.snapshot().spawned,1);assert.equal(traffic.snapshot().nextIn,40);traffic.tick(39);assert.equal(scene.children.length,0);
});
test('traffic intervals vary inside the 25–55 second range',()=>{
 const material=new T.MeshStandardMaterial();const low=createTraffic(new T.Scene(),()=>material,{random:()=>0});const high=createTraffic(new T.Scene(),()=>material,{random:()=>.999});
 assert.equal(low.snapshot().nextIn,25);assert.ok(high.snapshot().nextIn>54&&high.snapshot().nextIn<=55);
});
test('guests first clear the tables toward the sidewalk when leaving',()=>{
 const seats=createSeats(),people=[],flow=createCustomerFlow(people,()=>{},{seats});const p=person(9);p.g.position.set(-5.05,.35,2);flow.add(p,'espresso');p.stage='leaving';p.leaving=true;
 const startX=p.g.position.x;advance(flow,.5);assert.equal(p.g.position.x,startX);assert.ok(p.g.position.z>2);advance(flow,2);assert.ok(p.g.position.x<startX);
});
