import * as T from 'three';

export function createSaleEffects(scene, van, material) {
 const active=[];
 let steam=null;
 const reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
 function dispose(group){group.removeFromParent();const geometries=new Set();group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);});geometries.forEach(g=>g.dispose());}
 function part(group,geometry,color,x,y,z){const m=new T.Mesh(geometry,material(color));m.position.set(x,y,z);group.add(m);return m;}
 function cup(kind){
  const g=new T.Group();
  part(g,new T.CylinderGeometry(.15,.115,.34,16),'#fff5df',0,0,0);
  part(g,new T.CylinderGeometry(.154,.154,.1,16),'#2d987c',0,-.015,0);
  part(g,new T.CylinderGeometry(.17,.17,.045,16),'#6b4934',0,.18,0);
  part(g,new T.CylinderGeometry(.115,.115,.014,16),['icedLatte','coldBrew'].includes(kind)?'#a37750':'#462a1c',0,.207,0);
  if(['icedLatte','coldBrew'].includes(kind))part(g,new T.CylinderGeometry(.014,.014,.28,6),'#ed945f',.06,.31,0);
  else for(let i=0;i<3;i++){const puff=part(g,new T.SphereGeometry(.045,8,6),'#fff5df',(i-1)*.075,.3+i*.07,0);puff.scale.y=1.6;}
  return g;
 }
 function counter(){van.updateWorldMatrix(true,false);return van.localToWorld(new T.Vector3(.45,2.12,1.8));}
 function brewing(on){
  if(steam){dispose(steam);steam=null;}
  if(!on)return;
  steam=new T.Group();steam.position.copy(counter());scene.add(steam);
  for(let i=0;i<5;i++){const m=part(steam,new T.SphereGeometry(.055,8,6),'#fff8e7',0,.2,0);m.userData.phase=i/5;}
 }
 function serve(customer,kind){
  if(!customer)return counter();
  customer.receiving=true;
  const drink=cup(kind),start=counter();drink.position.copy(start);scene.add(drink);
  const duration=reduced?.15:.95;
  active.push({age:0,duration,drink,customer,start});
  return start;
 }
 function tick(dt,now){
  if(steam)steam.children.forEach((p,i)=>{const t=(now*.0007+p.userData.phase)%1;p.position.set(Math.sin(t*5+i)*.1,.15+t*.65,Math.cos(t*4+i)*.06);p.scale.setScalar((1-t)*.8+.2);});
  for(let i=active.length-1;i>=0;i--){const a=active[i];a.age+=dt;const t=Math.min(1,a.age/a.duration),ease=t*t*(3-2*t);a.customer.g.updateWorldMatrix(true,true);const end=a.customer.body.localToWorld(new T.Vector3(.31,.85,.24));
   a.drink.position.lerpVectors(a.start,end,ease);a.drink.position.y+=Math.sin(t*Math.PI)*(reduced?0:.85);a.drink.rotation.z=Math.sin(t*Math.PI)*-.18;
   a.customer.arms[1].rotation.x=-.8*Math.sin(t*Math.PI/2);
   if(t===1){a.drink.removeFromParent();a.customer.body.add(a.drink);a.drink.position.set(.31,.85,.24);a.drink.rotation.set(0,0,0);a.customer.hasCoffee=true;a.customer.receiving=false;a.customer.leaving=true;active.splice(i,1);}
  }
 }
 return {brewing,serve,tick};
}
