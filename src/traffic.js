import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

export const roadZ=7.9;
export function createTraffic(scene,material,{random=Math.random,minGap=25,maxGap=55}={}){
 let remaining=minGap+random()*(maxGap-minGap),vehicle=null,serial=0;
 function build(){
  const root=new T.Group(),color=['#e97857','#4c9ec8','#f3c353','#a6c9a1','#eee5cf'][Math.floor(random()*5)],type=Math.floor(random()*3);
  function part(geo,c,x,y,z){const m=new T.Mesh(geo,material(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;root.add(m);return m;}
  function box(w,h,d,c,x,y,z){return part(new RoundedBoxGeometry(w,h,d,2,.08),c,x,y,z);}
  const length=type===1?2.85:2.4;
  box(length,.55,1.05,color,0,.7,0);box(type===1?1.95:1.3,type===1?.95:.65,1,color,type===1?-.25:-.1,1.15,0);
  box(.06,.42,.83,'#9ed5df',type===1?.75:.56,1.24,0);
  for(const side of [-1,1]){box(type===1?1.55:1,.38,.035,'#87c4d6',-.15,1.25,side*.51);for(const x of [-.76,.76]){const wheel=part(new T.CylinderGeometry(.29,.29,.16,14),'#35423d',x,.4,side*.52);wheel.rotation.x=Math.PI/2;const hub=part(new T.CylinderGeometry(.13,.13,.17,12),'#e6ddc9',x,.4,side*.52);hub.rotation.x=Math.PI/2;}box(.05,.14,.17,'#fff1b1',length/2+.025,.78,side*.33);box(.05,.14,.17,'#d95645',-length/2-.025,.78,side*.33);}
  if(type===2)box(.9,.16,.7,'#b88b5d',-.12,1.61,0);
  const direction=random()<.5?1:-1;root.position.set(direction===1?-17:17,.2,roadZ+(direction===1?-.5:.5));root.rotation.y=direction===1?0:Math.PI;root.userData.kind=type;scene.add(root);
  return {root,direction,speed:3+random()*1.5};
 }
 function cleanup(){if(!vehicle)return;vehicle.root.removeFromParent();vehicle.root.traverse(o=>{if(o.geometry)o.geometry.dispose();});vehicle=null;remaining=minGap+random()*(maxGap-minGap);}
 function tick(dt){
  if(vehicle){vehicle.root.position.x+=vehicle.direction*vehicle.speed*dt;if(Math.abs(vehicle.root.position.x)>18)cleanup();}
  else{remaining-=dt;if(remaining<=0){vehicle=build();serial++;}}
 }
 return {tick,snapshot:()=>({active:!!vehicle,nextIn:remaining,spawned:serial,x:vehicle?.root.position.x})};
}
