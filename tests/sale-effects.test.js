import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createSaleEffects} from '../src/sale-effects.js';
function setup(){const scene=new T.Scene(),van=new T.Group(),material=new T.MeshStandardMaterial();scene.add(van);return {scene,van,effects:createSaleEffects(scene,van,()=>material)};}
test('brewing steam can restart and clear without accumulating effects',()=>{
 const {scene,effects}=setup();effects.brewing(true);assert.equal(scene.children.length,2);effects.tick(.2,1000);effects.brewing(true);assert.equal(scene.children.length,2);effects.brewing(false);assert.equal(scene.children.length,1);
});
test('coffee arcs to the receiving customer and is carried on departure',()=>{
 const {scene,effects}=setup();const g=new T.Group(),body=new T.Group();g.add(body);scene.add(g);g.position.set(3,.35,3);
 const customer={g,body,arms:[new T.Group(),new T.Group()],receiving:false,leaving:false};
 const origin=effects.serve(customer,'latte');assert.ok(Number.isFinite(origin.x));assert.equal(customer.receiving,true);assert.equal(customer.leaving,false);
 const drink=scene.children.find(o=>o!==g&&o!==scene.children[0]);const start=drink.position.clone();effects.tick(.45,450);assert.ok(drink.position.distanceTo(start)>.1);
 effects.tick(.6,1050);assert.equal(customer.receiving,false);assert.equal(customer.leaving,true);assert.equal(customer.hasCoffee,true);assert.equal(drink.parent,body);assert.equal(scene.children.length,2);
 effects.tick(1,2050);assert.equal(body.children.length,1);
});
test('a ready coffee waits on the counter until explicitly served',()=>{
 const {scene,effects}=setup();effects.ready('espresso');const prepared=scene.children[1];const start=prepared.position.clone();effects.tick(10,10000);
 assert.equal(scene.children.length,2);assert.equal(prepared.parent,scene);assert.ok(prepared.position.distanceTo(start)<.001);
 const g=new T.Group(),body=new T.Group();g.add(body);scene.add(g);const p={g,body,arms:[new T.Group(),new T.Group()]};effects.serve(p,'espresso');effects.tick(1,11000);assert.equal(prepared.parent,body);assert.equal(p.hasCoffee,true);
});
