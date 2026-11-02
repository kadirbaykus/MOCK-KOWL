import * as T from 'three';

export const cafeTables=[{x:5,z:0},{x:7.8,z:1.8},{x:-6,z:2}];
export function createSeats(){return cafeTables.flatMap((table,index)=>[-1,1].map(side=>({id:index*2+(side===1?1:0),position:new T.Vector3(table.x+side*.95,.35,table.z),facing:side===-1?Math.PI/2:-Math.PI/2,takenBy:null})));}
export function reserveSeat(seats,customer){
 const free=seats.filter(s=>s.takenBy===null).sort((a,b)=>a.position.distanceTo(customer.g.position)-b.position.distanceTo(customer.g.position));
 const seat=free[0];if(!seat)return null;seat.takenBy=customer.id;return seat;
}
export function releaseSeat(customer){if(customer.seat?.takenBy===customer.id)customer.seat.takenBy=null;customer.seat=null;}
