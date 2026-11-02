import {test} from 'node:test';import assert from 'node:assert/strict';import {cameraFov} from '../src/viewport.js';
test('portrait expands camera coverage while landscape keeps its normal perspective',()=>{
 assert.equal(cameraFov(1920,1080),38);assert.equal(cameraFov(844,390),38);assert.ok(cameraFov(360,640)>65);assert.ok(cameraFov(390,844)>75);assert.ok(cameraFov(320,900)<=90);
 for(const [w,h] of [[360,640],[390,844],[430,932],[640,360],[932,430],[768,1024],[1024,768]]){assert.ok(Number.isFinite(cameraFov(w,h)));assert.ok(cameraFov(w,h)>=38&&cameraFov(w,h)<=90);}
});
