import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
export function createWorld(host){
 const scene=new T.Scene();scene.background=new T.Color('#c5dab4');scene.fog=new T.Fog('#c5dab4',32,70);
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;host.append(renderer.domElement);
 const camera=new T.PerspectiveCamera(38,1,.1,100);camera.position.set(13,14,18);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1,1);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=13;controls.maxDistance=30;controls.minPolarAngle=.35;controls.maxPolarAngle=1.25;
 scene.add(new T.HemisphereLight('#fff8df','#7a9470',3));const sun=new T.DirectionalLight('#fff1d4',4);sun.position.set(-8,18,7);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-18;sun.shadow.camera.right=18;sun.shadow.camera.top=18;sun.shadow.camera.bottom=-18;sun.shadow.normalBias=.04;scene.add(sun);
 const mats={};const mat=c=>mats[c]??=(new T.MeshStandardMaterial({color:c,roughness:.85}));
 function mesh(geo,color,x,y,z,parent=scene){const m=new T.Mesh(geo,mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 const box=(w,h,d,c,x,y,z,p)=>mesh(new T.BoxGeometry(w,h,d),c,x,y,z,p);
 const sphere=(r,c,x,y,z,p)=>mesh(new T.SphereGeometry(r,12,8),c,x,y,z,p);
 const cyl=(r,h,c,x,y,z,p)=>mesh(new T.CylinderGeometry(r,r,h,16),c,x,y,z,p);
 function label(text,w,h,bg,fg,x,y,z,parent=scene){
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,768,256);ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 105px sans-serif';ctx.fillText(text,384,138);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture}));m.position.set(x,y,z);parent.add(m);return m;
 }
 box(80,.3,80,'#afc68d',0,-.3,0);box(21,.38,17,'#c5d69d',0,0,0);box(21,.1,3.1,'#d9c8a5',0,.25,5.5);box(7,.12,7,'#d7c4a1',0,.28,.5);
 // Paving stones, flower beds and park boundary.
 for(let i=0;i<16;i++){const x=-9+i*1.25;box(.9,.08,.6,'#e8dbc2',x,.35,4.4+(i%2)*.12);}
 function tree(x,z,size=1){const g=new T.Group();g.position.set(x,.2,z);g.scale.setScalar(size);scene.add(g);cyl(.17,1.9,'#916b46',0,.95,0,g);sphere(1.05,'#6c9c64',0,2.4,0,g);sphere(.75,'#85ad6c',-.55,2.05,.25,g);sphere(.8,'#a1ba76',.45,2.55,.1,g);}
 [[-8,-5,1.4],[-5,-7,1.2],[0,-7,1.4],[5,-6,1.3],[9,-3,1.3],[-9,1,1], [9,6,1.1]].forEach(v=>tree(...v));
 for(let i=0;i<16;i++){let x=-10+i*1.3;box(.12,1,.14,'#f7edd5',x,.75,-7.5);if(i<15)box(1.3,.12,.12,'#eee0c3',x+.65,1,-7.5);}
 function flower(x,z,c){cyl(.025,.35,'#71834f',x,.45,z);sphere(.13,c,x,.65,z);sphere(.05,'#eed77c',x,.75,z);}
 for(let i=0;i<45;i++){const x=Math.sin(i*5.7)*9,z=Math.cos(i*3.3)*7;if(Math.abs(x)>5||z<-4)flower(x,z,['#f5d286','#eaa3a2','#ece6c6'][i%3]);}
 // Coffee trailer with striped awning, hatch, espresso machine and owl emblem.
 const van=new T.Group();scene.add(van);van.position.set(-.9,.4,-1.4);
 box(4.8,2.55,2.65,'#faf0d9',0,2,0,van);box(4.9,.95,2.72,'#678b77',0,1.25,0,van);box(4.9,.25,2.8,'#e0be88',0,3.34,0,van);
 box(3.55,1.25,.08,'#3e5347',-.2,2.25,1.36,van);box(3.7,.15,.65,'#ae7950',-.2,1.6,1.55,van);
 box(.65,.5,.45,'#c5c9bd',-.9,1.93,1.25,van);box(.7,.08,.49,'#3c4b40',-.9,2.2,1.25,van);cyl(.06,.2,'#d9b879',-.9,1.93,1.55,van);
 for(let i=0;i<3;i++)cyl(.09,.17,'#fff6de',.2+i*.32,1.76,1.5,van);
 for(let i=0;i<10;i++){const roof=box(.45,.12,1.55,i%2?'#f5e5c4':'#bf7854',-2.025+i*.45,3.1,1.9,van);roof.rotation.x=.15;box(.45,.3,.09,i%2?'#f5e5c4':'#bf7854',-2.025+i*.45,2.85,2.66,van);}
 for(const x of [-1.6,1.6]){const wheel=cyl(.49,.26,'#3c4541',x,.55,.96,van);wheel.rotation.x=Math.PI/2;const hub=cyl(.24,.28,'#e7d8bc',x,.55,.96,van);hub.rotation.x=Math.PI/2;}
 box(.55,.17,.7,'#79786b',2.65,.65,0,van);cyl(.07,.65,'#79786b',2.9,.4,0,van);
 label('KOWL',2.35,.72,'#f9eed6','#3c6450',.25,3.9,1.39,van);box(3.6,1,.13,'#f9eed6',-.15,3.9,1.25,van);
 const owl=new T.Group();van.add(owl);owl.position.set(-1.5,3.9,1.42);sphere(.34,'#9c6947',0,0,0,owl);sphere(.22,'#e8d5a7',-.15,.05,.2,owl);sphere(.22,'#e8d5a7',.15,.05,.2,owl);sphere(.09,'#354c3d',-.15,.07,.38,owl);sphere(.09,'#354c3d',.15,.07,.38,owl);sphere(.035,'#fff8e5',-.17,.1,.45,owl);sphere(.035,'#fff8e5',.13,.1,.45,owl);const beak=mesh(new T.ConeGeometry(.09,.19,4),'#d5a451',0,-.1,.4,owl);beak.rotation.x=Math.PI/2;
 for(const x of [-.23,.23])mesh(new T.ConeGeometry(.15,.28,3),'#9c6947',x,.32,0,owl);
 // Chalk menu and outdoor seating.
 const menu=box(.9,1.35,.1,'#a87951',-4,.95,1.2);menu.rotation.z=-.1;label('COFFEE',.75,.3,'#354d41','#ffefc7',-4,1.25,1.26);label('24 ₺',.7,.3,'#354d41','#ffefc7',-4,.85,1.26);
 function table(x,z){cyl(.63,.12,'#d2a76a',x,1.15,z);cyl(.08,1,'#71634b',x,.6,z);for(const dx of [-.95,.95]){cyl(.33,.13,'#729b80',x+dx,.65,z);for(const dz of [-.16,.16])cyl(.045,.6,'#7c7057',x+dx,.3,z+dz);}}
 table(5,0);table(6,3);table(-6,2);
 const lights=[];for(let i=0;i<9;i++){const x=-4+i*1.1,y=4.9-Math.sin(i/8*Math.PI)*.65;sphere(.1,i%2?'#fff0a6':'#e9bc70',x,y,1.5);lights.push(new T.Vector3(x,y+.12,1.5));}scene.add(new T.Line(new T.BufferGeometry().setFromPoints(lights),new T.LineBasicMaterial({color:'#5b654e'})));
 for(const x of [-4,4.8])cyl(.045,4.8,'#967550',x,2.6,1.5);
 // Customers walk in, queue, and leave after a sale.
 const people=[];const shirts=['#ddaa72','#7b9ca2','#b98076','#969cbe','#d3bb79','#678b77'];
 function person(id){const g=new T.Group();scene.add(g);const shirt=shirts[id%shirts.length];sphere(.24,'#edc39b',0,1.4,0,g);sphere(.25,'#6e5040',0,1.51,-.05,g);box(.42,.52,.3,shirt,0,.96,0,g);const legs=[];for(const x of [-.12,.12]){const leg=box(.14,.5,.16,'#4a5d61',x,.47,0,g);legs.push(leg);box(.18,.1,.28,'#795d47',x,.2,.04,g);box(.13,.48,.14,shirt,x*2.5,1,0,g);}g.position.set(10,.2,5.6);const p={g,legs,id,leaving:false};people.push(p);return p;}
 function depart(){const p=people.find(p=>!p.leaving);if(p)p.leaving=true;}
 let last=performance.now();function tick(now){const dt=Math.min((now-last)/1000,.05);last=now;let index=0;for(let i=people.length-1;i>=0;i--){const p=people[i];const target=p.leaving?new T.Vector3(-12,.2,5.6):new T.Vector3(.1,.2,2.9+(index++)*.83);const delta=target.clone().sub(p.g.position);if(delta.length()>.04){p.g.position.addScaledVector(delta.normalize(),Math.min(dt*2.3,p.g.position.distanceTo(target)));p.g.rotation.y=Math.atan2(delta.x,delta.z);p.legs.forEach((leg,j)=>leg.rotation.x=Math.sin(now*.009+j*Math.PI)*.45);}else{p.legs.forEach(leg=>leg.rotation.x=0);p.g.rotation.y=Math.PI;}if(p.leaving&&p.g.position.x<-11){scene.remove(p.g);people.splice(i,1);}}
 controls.update();renderer.render(scene,camera);}
 renderer.setAnimationLoop(tick);
 function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}window.addEventListener('resize',resize);resize();
 return {person,depart,rotate:(v)=>{const offset=camera.position.clone().sub(controls.target);offset.applyAxisAngle(new T.Vector3(0,1,0),v);camera.position.copy(controls.target).add(offset);},zoom:(v)=>{const offset=camera.position.clone().sub(controls.target);offset.multiplyScalar(v);const len=T.MathUtils.clamp(offset.length(),13,30);offset.setLength(len);camera.position.copy(controls.target).add(offset);},upgrade:(level)=>{van.scale.setScalar(1+level*.04);},renderer};
}
