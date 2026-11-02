import * as T from 'three';
import {reserveSeat,releaseSeat} from './seating.js';

export const kioskPosition=new T.Vector3(4.1,.35,3.85);
export const pickupPosition=new T.Vector3(-.6,.35,1.75);
const exitPosition=new T.Vector3(-12,.35,5.6);

export function createCustomerFlow(people,onOrdered=()=>{},{seats=[],random=Math.random}={}){
 let orderSequence=0;
 function add(p,kind){p.kind=kind;p.stage='kioskQueue';p.orderTime=0;p.orderSequence=-1;p.waypoint=false;people.push(p);}
 function waiting(){return people.filter(p=>['toPickup','waiting','receiving'].includes(p.stage)).sort((a,b)=>a.orderSequence-b.orderSequence);}
 function canCollect(id){const list=waiting();const p=list[0];return !!p&&p.id===id&&p.stage==='waiting'&&!p.receiving&&p.g.position.distanceTo(pickupPosition)<.12;}
 function claim(id){if(!canCollect(id))return null;const p=people.find(p=>p.id===id);p.stage='receiving';p.receiving=true;return p;}
 function update(dt){
  const kioskQueue=people.filter(p=>p.stage==='kioskQueue'||p.stage==='ordering');
  const pickupQueue=waiting();
  for(const p of people){
   if(p.leaving){releaseSeat(p);p.stage='leaving';}
   if(p.stage==='receiving'&&!p.receiving&&p.hasCoffee){
    p.seat=reserveSeat(seats,p);
    if(p.seat){p.stage='toSeat';p.seatWaypoint=false;p.visitDuration=18+random()*17;p.seatedTime=0;}
    else{p.stage='leaving';p.leaving=true;}
   }
   if(p.stage==='seated'){p.seatedTime+=dt;p.moving=false;p.g.rotation.y=p.seat.facing;if(p.seatedTime>=p.visitDuration){releaseSeat(p);p.stage='leaving';p.leaving=true;}else continue;}
   let target;
   if(p.stage==='leaving')target=p.exitWaypoint?exitPosition:new T.Vector3(p.g.position.x,.35,exitPosition.z);
   else if(p.stage==='receiving')target=p.g.position;
   else if(p.stage==='toSeat')target=p.seatWaypoint?p.seat.position:new T.Vector3(p.seat.position.x,.35,Math.max(2.8,p.seat.position.z+1));
   else if(p.stage==='kioskQueue'||p.stage==='ordering'){
    const index=kioskQueue.indexOf(p);target=kioskPosition.clone().add(new T.Vector3(index*.45,0,index*.22));
   }else{
    const index=pickupQueue.indexOf(p);target=pickupPosition.clone().add(new T.Vector3(-index*.56,0,index*.45));
    if(!p.waypoint)target=new T.Vector3(2.15,.35,3.8);
   }
   const delta=target.clone().sub(p.g.position),distance=delta.length();p.moving=distance>.04;
   if(p.moving){p.g.position.addScaledVector(delta.normalize(),Math.min(dt*p.appearance.speed,distance));p.g.rotation.y=Math.atan2(delta.x,delta.z);}
   else{
    p.g.rotation.y=Math.PI;
    if(p.stage==='leaving')p.exitWaypoint=true;
    if(p.stage==='kioskQueue'&&kioskQueue[0]===p)p.stage='ordering';
    if(p.stage==='ordering'){
     p.orderTime+=dt;
     if(p.orderTime>=.9){p.stage='toPickup';p.orderSequence=orderSequence++;onOrdered({id:p.id,kind:p.kind});}
    }else if(p.stage==='toSeat'){
     if(!p.seatWaypoint)p.seatWaypoint=true;else{p.stage='seated';p.moving=false;p.g.rotation.y=p.seat.facing;}
    }else if(p.stage==='toPickup'){
     if(!p.waypoint)p.waypoint=true;else p.stage='waiting';
    }
   }
  }
 }
 function snapshot(){return {kiosk:people.filter(p=>p.stage==='kioskQueue'||p.stage==='ordering').length,pickup:waiting().filter(p=>p.stage!=='receiving').length,ordering:people.some(p=>p.stage==='ordering'),seated:people.filter(p=>p.stage==='seated').length,seats:seats.length};}
 return {add,update,canCollect,claim,snapshot,activeCount:()=>people.filter(p=>['kioskQueue','ordering','toPickup','waiting','receiving'].includes(p.stage)).length};
}
