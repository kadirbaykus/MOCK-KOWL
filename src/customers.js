import * as T from 'three';

const skin = ['#f4cda6', '#dcab7f', '#bd835c', '#87563d', '#614235'];
const hair = ['#30241e', '#67422d', '#ab6838', '#e3bd63', '#aa432e', '#d4d1c7'];
const clothes = ['#eb635a', '#3e9bcc', '#8a68c8', '#f0b62d', '#32a581', '#e780b5', '#e48835', '#526bb5'];

// A stable varied roster: reproducible across reloads, with no runtime asset downloads.
export function customerAppearance(id) {
 let seed = (id + 1) * 2654435761 >>> 0;
 const random = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) / 4294967296; };
 const pick = values => values[Math.floor(random() * values.length)];
 return {
  presentation: id % 2 ? 'feminine' : 'masculine',
  height: .88 + random() * .33,
  build: .8 + random() * .6,
  skin: pick(skin), hair: pick(hair), shirt: pick(clothes),
  trousers: pick(['#354e74', '#526340', '#745264', '#b68c62']),
  hairstyle: id % 5,
  glasses: id % 6 === 2,
  hat: id % 7 === 4,
  skirt: id % 4 === 1,
  bag: id % 3 === 1,
  speed: 1.9 + random() * .6,
  phase: random() * Math.PI * 2
 };
}

export function buildCustomer(id, material) {
 const a = customerAppearance(id), group = new T.Group(), body = new T.Group();
 group.add(body);group.userData.appearance = a;body.scale.set(a.build, a.height, a.build);
 function part(geometry, color, x, y, z, parent = body) {
  const m = new T.Mesh(geometry, material(color));m.position.set(x, y, z);m.castShadow = true;parent.add(m);return m;
 }
 const ball = (r,c,x,y,z,p) => part(new T.SphereGeometry(r,12,10),c,x,y,z,p);
 const capsule = (r,len,c,x,y,z,p) => part(new T.CapsuleGeometry(r,len,4,8),c,x,y,z,p);
 const torso = ball(.31,a.shirt,0,.99,0);torso.scale.set(1,.98,.7);
 capsule(.17,.19,a.skin,0,1.43,0);
 ball(.25,a.hair,0,1.54,-.075).scale.set(1,1,.8);
 // Eyes, nose, ears and a tiny smile face forward along +Z.
 for (const x of [-.075,.075]) {
  ball(.047,'#fff9e9',x,1.46,.155);
  ball(.022,'#34302a',x,1.46,.196);
  ball(.008,'#ffffff',x-.005,1.467,.214);
 }
 ball(.04,a.skin,0,1.40,.2);
 const smile = part(new T.TorusGeometry(.047,.009,4,10,Math.PI),'#8b4b41',0,1.35,.176);smile.rotation.z=Math.PI;
 for(const x of [-.18,.18])ball(.055,a.skin,x,1.43,0);
 const fringe=ball(.18,a.hair,-.05,1.62,.06);fringe.scale.set(1.2,.5,.8);
 if(a.hairstyle===1||a.hairstyle===3) {
  for(const x of [-.18,.18])capsule(.09,.25,a.hair,x,1.35,-.06);
 }
 if(a.hairstyle===2) {
  for(let i=0;i<7;i++){const t=i/7*Math.PI*2;ball(.11,a.hair,Math.cos(t)*.16,1.62+Math.sin(t)*.07,Math.sin(t)*.1);}
 }
 if(a.hairstyle===3)ball(.13,a.hair,0,1.78,-.08);
 if(a.hairstyle===4) capsule(.085,.25,a.hair,0,1.36,-.24);
 if(a.hat){part(new T.CylinderGeometry(.23,.25,.1,16),'#f3cb6c',0,1.72,0);part(new T.CylinderGeometry(.32,.32,.035,16),'#dca54b',0,1.67,0);}
 if(a.glasses){for(const x of [-.075,.075])part(new T.TorusGeometry(.057,.012,5,12),'#493b43',x,1.46,.208);capsule(.01,.04,'#493b43',0,1.46,.21).rotation.z=Math.PI/2;}
 if(a.presentation==='feminine')for(const x of [-.2,.2])ball(.025,'#efbb46',x,1.37,.04);
 if(a.skirt)part(new T.CylinderGeometry(.23,.35,.37,14),a.shirt,0,.69,0);
 const legs=[],knees=[],arms=[];
 for(const side of [-1,1]) {
  const pivot=new T.Group();pivot.position.set(side*.13,.76,0);body.add(pivot);legs.push(pivot);
  capsule(.085,.12,a.skirt?a.skin:a.trousers,0,-.12,0,pivot);
  const knee=new T.Group();knee.position.y=-.25;pivot.add(knee);knees.push(knee);
  capsule(.075,.1,a.skirt?a.skin:a.trousers,0,-.1,0,knee);
  capsule(.09,.09,'#faf2dc',0,-.23,.06,knee).rotation.x=Math.PI/2;
  const arm=new T.Group();arm.position.set(side*.27,1.13,0);body.add(arm);arms.push(arm);
  capsule(.085,.12,a.shirt,0,-.08,0,arm);capsule(.06,.16,a.skin,0,-.26,0,arm);ball(.065,a.skin,0,-.38,.015,arm);
 }
 if(a.bag){capsule(.025,.53,'#8d6243',.3,1.02,.12).rotation.z=-.22;ball(.15,'#c99354',.35,.72,.05).scale.set(.65,1,1);}
 // Keep feet on the paving while retaining independent body proportions.
 body.position.y=-.2*a.height;
 return {g:group,body,legs,knees,arms,id,appearance:a,leaving:false};
}
