import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {customerAppearance,buildCustomer} from '../src/customers.js';
test('roster includes distinct builds, heights, hair, skin, outfits and presentations',()=>{
 const roster=Array.from({length:40},(_,i)=>customerAppearance(i));
 for(const key of ['height','build','skin','hair','shirt','hairstyle','presentation'])assert.ok(new Set(roster.map(p=>p[key])).size>1,key);
 assert.deepEqual(customerAppearance(8),customerAppearance(8));
 assert.equal(new Set(roster.map(p=>JSON.stringify(p))).size,40);
});
test('varied characters have animation pivots and finite geometry',()=>{
 const mat=new T.MeshStandardMaterial();
 for(let id=0;id<12;id++){
  const p=buildCustomer(id,()=>mat);assert.equal(p.legs.length,2);assert.equal(p.arms.length,2);
  const bounds=new T.Box3().setFromObject(p.g);assert.ok(bounds.max.y>1.2&&bounds.max.y<2.6);
  p.g.traverse(o=>{if(o.isMesh){assert.ok([...o.geometry.attributes.position.array].every(Number.isFinite));o.geometry.dispose();}});
 }
 mat.dispose();
});
