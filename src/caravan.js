import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

export const caravanStages = [
 {name:'Starter Cart',feature:'A simple wooden coffee cart',color:'#ba8350'},
 {name:'Tiny Trailer',feature:'Your first enclosed trailer',color:'#6ea788'},
 {name:'Weekend Camper',feature:'A rounded camper and larger hatch',color:'#42a78e'},
 {name:'Street Café',feature:'A wider counter and striped awning',color:'#269b8d'},
 {name:'Neighborhood Favorite',feature:'A full canopy and menu display',color:'#269bab'},
 {name:'Coffee Truck',feature:'A driving cab and roadside signage',color:'#258fae'},
 {name:'Mobile Café',feature:'Twin espresso stations and tandem wheels',color:'#416fb0'},
 {name:'Roastery on Wheels',feature:'A second serving hatch and coffee roaster',color:'#6856a5'},
 {name:'Solar Café',feature:'Solar panels and a premium side bar',color:'#426c80'},
 {name:'Grand Coffee Lounge',feature:'Gold trim, expanded counters and roof display',color:'#365c72'},
 {name:'KOWL Flagship',feature:'A flagship coffee truck with a rooftop owl',color:'#215647'}
];
export function disposeCaravan(group){
 if(!group)return;group.removeFromParent();const geometries=new Set();
 group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.userData.ownsMaterial){o.material.map?.dispose();o.material.dispose();}});
 geometries.forEach(g=>g.dispose());
}
export function buildCaravan(level,material){
 const stage=caravanStages[level];if(!stage)throw new RangeError('Unknown caravan level');
 const root=new T.Group();root.name='caravan-level-'+level;root.userData.level=level;
 const width=2.7+level*.29,depth=1.6+level*.095,height=level===0?1.05:1.75+level*.065;
 const front=depth/2,top=.85+height,counterY=level===0?1.62:1.72;
 root.userData.counterOffset=new T.Vector3(.3,counterY+.28,front+.5);
 function mesh(geo,c,x,y,z,parent=root){const m=new T.Mesh(geo,material(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 const box=(w,h,d,c,x,y,z,p)=>mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(.09,w/5,h/5,d/5)),c,x,y,z,p);
 const ball=(r,c,x,y,z,p)=>mesh(new T.SphereGeometry(r,16,10),c,x,y,z,p);
 const cyl=(r,h,c,x,y,z,p)=>mesh(new T.CylinderGeometry(r,r,h,16),c,x,y,z,p);
 function sign(text,w,h,x,y,z,bg='#fff0ce',fg='#315e4c'){
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=192;const ctx=canvas.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,768,192);ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 85px sans-serif';ctx.fillText(text,384,102,730);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture}));m.userData.ownsMaterial=true;m.position.set(x,y,z);root.add(m);return m;
 }
 function owl(x,y,z,size=1){const g=new T.Group();root.add(g);g.position.set(x,y,z);g.scale.setScalar(size);ball(.29,'#9c6947',0,0,0,g);for(const side of [-1,1]){ball(.19,'#f3dfad',side*.13,.04,.2,g);ball(.075,'#284b3b',side*.13,.05,.35,g);ball(.025,'#fff8e5',side*.13-.015,.075,.41,g);mesh(new T.ConeGeometry(.12,.24,3),'#9c6947',side*.2,.28,0,g);}const b=mesh(new T.ConeGeometry(.065,.15,4),'#f1b745',0,-.1,.35,g);b.rotation.x=Math.PI/2;}
 // Small carts are open; later stages grow into enclosed trailers and driving trucks.
 box(width,.2,depth,'#865e41',0,.79,0);
 box(width,height,depth,level===0?stage.color:'#fff2da',0,.85+height/2,0);
 box(width+.04,level===0?.7:.8,depth+.04,stage.color,0,1.12,0);
 if(level>0){box(width+.13,.2,depth+.14,level>=9?'#e2b555':'#e2c087',0,top+.05,0);
  box(width-.65,.85,.08,'#294b42',-.08,2,front+.04);
 }else{for(const x of [-width/2+.1,width/2-.1])cyl(.04,1,'#886246',x,2.07,0);}
 box(width-.15,.14,.62,level>=9?'#e5bb64':'#b97c48',0,counterY,front+.23);
 const machines=level>=6?2:1;
 for(let i=0;i<machines;i++){const x=-width*.23+i*.95;box(.58,.43,.4,level>=6?'#b4cbd0':'#c4c7b8',x,counterY+.28,front+.03);box(.63,.075,.43,'#344c43',x,counterY+.52,front+.03);cyl(.05,.16,'#e4b85c',x,counterY+.22,front+.28);}
 for(let i=0;i<Math.min(5,2+Math.floor(level/2));i++)cyl(.075,.14,'#fff8df',.25+i*.24,counterY+.15,front+.31);
 const wheelXs=level>=6?[-width*.34,-width*.06,width*.34]:[-width*.33,width*.33];
 for(const x of wheelXs)for(const side of [-1,1]){const w=cyl(.37,.2,'#344442',x,.42,side*(depth/2-.05));w.rotation.x=Math.PI/2;const hub=cyl(.18,.22,level>=9?'#dab357':'#e9d9bd',x,.42,side*(depth/2-.05));hub.rotation.x=Math.PI/2;}
 if(level>=2){const stripes=level>=4?12:8,awningWidth=width+.15,awningY=top-.12;
  for(let i=0;i<stripes;i++){const x=-awningWidth/2+(i+.5)*awningWidth/stripes,c=i%2?'#fff0d1':level>=8?'#d6a34a':'#ee8057';const a=box(awningWidth/stripes,.09,level>=4?1.4:.9,c,x,awningY,front+.48);a.rotation.x=.12;box(awningWidth/stripes,.2,.08,c,x,awningY-.16,front+(level>=4?1.15:.9));}
 }
 if(level===1){const roof=mesh(new T.CylinderGeometry(depth*.52,depth*.52,width,18,1,false,0,Math.PI),'#70b59c',0,top,0);roof.rotation.z=Math.PI/2;}
 const signY=level===0?2.55:top+.47;
 box(width*.8,.6,.12,level>=9?'#e0b351':'#f6e5bf',0,signY,front-.04);
 sign('KOWL',width*.5,.45,.18,signY,front+.03);owl(-width*.29,signY,front+.14,level===0?.65:.85);
 if(level===0)sign('FRESH COFFEE',1.65,.32,0,1.13,front+.04);
 if(level>=3){box(.55,.75,.06,'#c18b51',width/2-.33,1.25,front+.08);sign('MENU',.48,.21,width/2-.33,1.4,front+.12,'#315344','#fff0c9');}
 if(level>=4){for(const side of [-1,1]){cyl(.035,top-.5,'#d6b56d',side*(width/2+.03),(top-.5)/2+.65,front+1.05);}for(let i=0;i<7;i++)ball(.055,'#ffe190',-width*.4+i*width*.13,top-.42,front+1.14);}
 if(level>=5){const cabX=width/2+.46;box(.98,1.65,depth*.88,stage.color,cabX,1.55,0);box(.8,.65,.055,'#76c4d2',cabX,1.95,depth*.445);box(.15,.18,.1,'#ffe8a1',cabX+.25,.98,depth*.46);box(.12,.12,.15,'#344442',cabX+.4,1.45,depth*.5);}
 if(level>=7){box(.08,.85,1,'#31564d',-width/2-.05,2,0);box(.45,.1,1.15,'#c38e51',-width/2-.2,1.58,0);const drum=cyl(.31,.65,'#bc7842',width*.2,top+.4,-.22);drum.rotation.z=Math.PI/2;cyl(.07,.6,'#5f6e68',width*.2,top+.76,-.22);}
 if(level>=8)for(let i=0;i<3;i++){box(.74,.08,.72,'#284e79',-width*.3+i*.85,top+.2,-depth*.12);for(let j=0;j<3;j++)box(.012,.012,.65,'#91c3dd',-width*.3+i*.85-.22+j*.22,top+.248,-depth*.12);}
 if(level>=9){box(width*.92,.07,.06,'#e8ba57',0,1.5,front+.08);sign(level===10?'KOWL FLAGSHIP':'SPECIALTY COFFEE',width*.7,.26,0,1.18,front+.04,'#215647','#ffe2a0');}
 if(level===10){const badge=box(1.25,.16,.7,'#e4b956',0,top+.35,-.25);owl(0,top+.95,-.18,1.35);for(const side of [-1,1])cyl(.045,.85,'#e4b956',side*.55,top+.77,-.23);}
 root.userData.stageName=stage.name;
 return root;
}

export function createCaravanController(root,material,{onReveal=()=>{},reducedMotion=false}={}){
 let current=null,outgoing=null,transition=null,level=-1;
 const ringMaterial=new T.MeshBasicMaterial({color:'#ffe9a0',transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide});
 const ring=new T.Mesh(new T.RingGeometry(1.8,1.98,48),ringMaterial);ring.rotation.x=-Math.PI/2;ring.position.y=.03;ring.visible=false;root.add(ring);
 function setLevel(next,{animate=false}={}){
  if(next===level)return false;
  const model=buildCaravan(next,material);
  disposeCaravan(outgoing);outgoing=null;transition=null;
  if(animate&&!reducedMotion&&current){outgoing=current;}else disposeCaravan(current);
  current=model;root.add(current);root.userData.counterOffset=model.userData.counterOffset;root.userData.level=next;level=next;
  if(outgoing){current.visible=false;transition={age:0};ring.visible=true;ringMaterial.opacity=.8;}
  else {ring.visible=false;ringMaterial.opacity=0;}
  if(animate)onReveal(caravanStages[next],next);
  return true;
 }
 function tick(dt){if(!transition)return;transition.age+=dt;const t=transition.age;
  if(t<.28){const scale=Math.max(.01,1-t/.28);outgoing.scale.setScalar(scale);outgoing.rotation.y=t*.8;}
  else {disposeCaravan(outgoing);outgoing=null;current.visible=true;const p=Math.min(1,(t-.28)/.9);const spring=1+2.2*(p-1)**3+1.2*(p-1)**2;current.scale.setScalar(Math.max(.01,spring));current.position.y=Math.sin(p*Math.PI)*.28;current.rotation.y=(1-p)*-.16;
   if(p===1){current.scale.setScalar(1);current.position.y=0;current.rotation.y=0;transition=null;ring.visible=false;}
  }
  ring.scale.setScalar(1+t*1.6);ringMaterial.opacity=Math.max(0,.8-t*.65);
 }
 return {setLevel,tick};
}
