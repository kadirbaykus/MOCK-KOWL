import * as T from 'three';

export const kioskPosition=new T.Vector3(4.1,.35,3.85);
export const pickupPosition=new T.Vector3(-.6,.35,1.75);
const exitPosition=new T.Vector3(-12,.35,5.6);

export function createCustomerFlow(people,onOrdered=()=>{}){
 let orderSequence=0;
 function add(p,kind){p.kind=kind;p.stage='kioskQueue';p.orderTime=0;p.orderSequence=-1;p.waypoint=false;people.push(p);}
 function waiting(){return people.filter(p=>['toPickup','waiting','receiving'].includes(p.stage)).sort((a,b)=>a.orderSequence-b.orderSequence);}
 function canCollect(id){const list=waiting();const p=list[0];return !!p&&p.id===id&&p.stage==='waiting'&&!p.receiving&&p.g.position.distanceTo(pickupPosition)<.12;}
 function claim(id){if(!canCollect(id))return null;const p=people.find(p=>p.id===id);p.stage='receiving';p.receiving=true;return p;}
 function update(dt){
  const kioskQueue=people.filter(p=>p.stage==='kioskQueue'||p.stage==='ordering');
  const pickupQueue=waiting();
  for(const p of people){
   if(p.leaving)p.stage='leaving';
   let target;
   if(p.stage==='leaving')target=exitPosition;
   else if(p.stage==='receiving')target=p.g.position;
   else if(p.stage==='kioskQueue'||p.stage==='ordering'){
    const index=kioskQueue.indexOf(p);target=kioskPosition.clone().add(new T.Vector3(index*.73,0,index*.46));
   }else{
    const index=pickupQueue.indexOf(p);target=pickupPosition.clone().add(new T.Vector3(-index*.56,0,index*.7));
    if(!p.waypoint)target=new T.Vector3(2.15,.35,3.8);
   }
   const delta=target.clone().sub(p.g.position),distance=delta.length();p.moving=distance>.04;
   if(p.moving){p.g.position.addScaledVector(delta.normalize(),Math.min(dt*p.appearance.speed,distance));p.g.rotation.y=Math.atan2(delta.x,delta.z);}
   else{
    p.g.rotation.y=Math.PI;
    if(p.stage==='kioskQueue'&&kioskQueue[0]===p)p.stage='ordering';
    if(p.stage==='ordering'){
     p.orderTime+=dt;
     if(p.orderTime>=.9){p.stage='toPickup';p.orderSequence=orderSequence++;onOrdered({id:p.id,kind:p.kind});}
    }else if(p.stage==='toPickup'){
     if(!p.waypoint)p.waypoint=true;else p.stage='waiting';
    }
   }
  }
 }
 function snapshot(){return {kiosk:people.filter(p=>p.stage==='kioskQueue'||p.stage==='ordering').length,pickup:waiting().filter(p=>p.stage!=='receiving').length,ordering:people.some(p=>p.stage==='ordering')};}
 return {add,update,canCollect,claim,snapshot,activeCount:()=>people.filter(p=>p.stage!=='leaving').length};
}
