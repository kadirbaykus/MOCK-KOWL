import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {buildCaravan,disposeCaravan,createCaravanController,caravanStages} from '../src/caravan.js';
// Geometry tests need a canvas texture source, not a WebGL renderer.
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(){}})})};
const material=new T.MeshStandardMaterial();
test('all eleven caravan stages grow and expose valid service anchors',()=>{
 assert.equal(caravanStages.length,11);assert.equal(new Set(caravanStages.map(s=>s.name)).size,11);
 let previousWidth=0;
 for(let level=0;level<=10;level++){
  const model=buildCaravan(level,()=>material);const bounds=new T.Box3().setFromObject(model);const width=bounds.max.x-bounds.min.x;
  assert.ok(width>previousWidth,'stage '+level+' should grow in width');previousWidth=width;
  assert.equal(model.userData.level,level);assert.ok(model.userData.counterOffset.y>1.5);
  model.traverse(o=>{if(o.geometry)assert.ok([...o.geometry.attributes.position.array].every(Number.isFinite));});
  disposeCaravan(model);
 }
});
test('reveal completes, cleans up old models and does not replay for unchanged levels',()=>{
 const root=new T.Group(),events=[];const controller=createCaravanController(root,()=>material,{onReveal:(s,l)=>events.push(l)});
 controller.setLevel(0);const old=root.getObjectByName('caravan-level-0');let disposed=0;old.traverse(o=>o.geometry?.addEventListener('dispose',()=>disposed++));
 controller.setLevel(1,{animate:true});assert.equal(root.getObjectByName('caravan-level-1').visible,false);controller.tick(.3);assert.equal(old.parent,null);assert.ok(disposed>0);
 controller.tick(1);const model=root.getObjectByName('caravan-level-1');assert.equal(model.visible,true);assert.equal(model.scale.x,1);assert.equal(root.children.length,2);
 assert.equal(controller.setLevel(1,{animate:true}),false);assert.deepEqual(events,[1]);
});
test('rapid upgrades and reduced motion finish with only the latest model',()=>{
 const root=new T.Group(),controller=createCaravanController(root,()=>material);
 controller.setLevel(0);controller.setLevel(1,{animate:true});controller.tick(.1);controller.setLevel(2,{animate:true});controller.tick(2);
 assert.equal(root.children.length,2);assert.ok(root.getObjectByName('caravan-level-2'));assert.equal(root.userData.level,2);
 const reducedRoot=new T.Group(),reduced=createCaravanController(reducedRoot,()=>material,{reducedMotion:true});reduced.setLevel(0);reduced.setLevel(10,{animate:true});assert.equal(reducedRoot.children.length,2);assert.equal(reducedRoot.getObjectByName('caravan-level-10').scale.x,1);
});
