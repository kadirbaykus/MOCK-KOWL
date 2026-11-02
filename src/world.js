import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {buildCustomer} from './customers.js';
import {createSaleEffects} from './sale-effects.js';
import {createCaravanController} from './caravan.js';
import {createCustomerFlow} from './customer-flow.js';
import {createSeats,cafeTables} from './seating.js';
import {createTraffic,roadZ} from './traffic.js';
import {createDayLight} from './day-light.js';
import {cameraFov} from './viewport.js';
export function createWorld(host){
 const scene=new T.Scene();scene.background=new T.Color('#a7d9f0');scene.fog=new T.Fog('#a7d9f0',40,90);
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.NeutralToneMapping;renderer.toneMappingExposure=1.05;host.append(renderer.domElement);
 const camera=new T.PerspectiveCamera(38,1,.1,100);camera.position.set(13,14,18);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.6,1.8);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=13;controls.maxDistance=30;controls.minPolarAngle=.35;controls.maxPolarAngle=1.25;
 const ambient=new T.HemisphereLight('#eaf6ff','#7b9251',1.8);scene.add(ambient);const sun=new T.DirectionalLight('#fff1d4',2.4);sun.position.set(-8,18,7);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-18;sun.shadow.camera.right=18;sun.shadow.camera.top=18;sun.shadow.camera.bottom=-18;sun.shadow.normalBias=.04;scene.add(sun);
 const mats={};const mat=c=>mats[c]??=(new T.MeshStandardMaterial({color:c,roughness:.85}));
 function mesh(geo,color,x,y,z,parent=scene){const m=new T.Mesh(geo,mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 const box=(w,h,d,c,x,y,z,p)=>mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(.07,w/5,h/5,d/5)),c,x,y,z,p);
 const sphere=(r,c,x,y,z,p)=>mesh(new T.SphereGeometry(r,18,12),c,x,y,z,p);
 const cyl=(r,h,c,x,y,z,p)=>mesh(new T.CylinderGeometry(r,r,h,16),c,x,y,z,p);
 function label(text,w,h,bg,fg,x,y,z,parent=scene){
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,768,256);ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 105px sans-serif';ctx.fillText(text,384,138);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture}));m.position.set(x,y,z);parent.add(m);return m;
 }
 box(80,.3,80,'#65ad35',0,-.3,0);box(21,.38,17,'#86c84a',0,0,0);box(21,.1,3.1,'#d8a66b',0,.25,5.5);box(7,.12,7,'#eac48d',0,.28,.5);
 // Paving stones, flower beds and park boundary.
 for(let i=0;i<16;i++){const x=-9+i*1.25;box(.9,.08,.6,'#f9dfa4',x,.35,4.4+(i%2)*.12);}
 function tree(x,z,size=1){const g=new T.Group();g.position.set(x,.2,z);g.scale.setScalar(size);scene.add(g);cyl(.17,1.9,'#916b46',0,.95,0,g);sphere(1.05,'#358a35',0,2.4,0,g);sphere(.75,'#57aa36',-.55,2.05,.25,g);sphere(.8,'#80c53d',.45,2.55,.1,g);}
 [[-8,-5,1.4],[-5,-7,1.2],[0,-7,1.4],[5,-6,1.3],[9,-3,1.3],[-9,1,1], [9,6,1.1]].forEach(v=>tree(...v));
 for(let i=0;i<16;i++){let x=-10+i*1.3;box(.12,1,.14,'#f7edd5',x,.75,-7.5);if(i<15)box(1.3,.12,.12,'#eee0c3',x+.65,1,-7.5);}
 function flower(x,z,c){cyl(.025,.35,'#71834f',x,.45,z);for(let j=0;j<5;j++){const a=j/5*Math.PI*2;sphere(.085,c,x+Math.cos(a)*.1,.65,z+Math.sin(a)*.1);}sphere(.065,'#ffdd48',x,.69,z);}
 for(let i=0;i<45;i++){const x=Math.sin(i*5.7)*9,z=Math.cos(i*3.3)*7;if(Math.abs(x)>5||z<-4)flower(x,z,['#ffcf32','#f55c83','#a277ef'][i%3]);}
 // A stable root keeps sale effects aligned while caravan models are replaced.
 const van=new T.Group();scene.add(van);van.position.set(-.9,.4,-1.4);
 const caravan=createCaravanController(van,mat,{
  reducedMotion:globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false,
  onReveal:(stage,level)=>host.dispatchEvent(new CustomEvent('caravan-upgraded',{detail:{name:stage.name,level}}))
 });
 caravan.setLevel(0);
 // Chalk menu and outdoor seating.
 const menu=box(.9,1.35,.1,'#a87951',-4,.95,1.2);menu.rotation.z=-.1;label('COFFEE',.75,.3,'#354d41','#ffefc7',-4,1.25,1.26);label('24 ₺',.7,.3,'#354d41','#ffefc7',-4,.85,1.26);
 function table(x,z){cyl(.63,.12,'#d2a76a',x,1.15,z);cyl(.08,1,'#71634b',x,.6,z);for(const dx of [-.95,.95]){cyl(.33,.13,'#35a89c',x+dx,.65,z);for(const dz of [-.16,.16])cyl(.045,.6,'#7c7057',x+dx,.3,z+dz);}}
 cafeTables.forEach(t=>table(t.x,t.z));
 const lights=[];for(let i=0;i<9;i++){const x=-4+i*1.1,y=4.9-Math.sin(i/8*Math.PI)*.65;sphere(.1,i%2?'#fff0a6':'#e9bc70',x,y,1.5);lights.push(new T.Vector3(x,y+.12,1.5));}scene.add(new T.Line(new T.BufferGeometry().setFromPoints(lights),new T.LineBasicMaterial({color:'#5b654e'})));
 for(const x of [-4,4.8])cyl(.045,4.8,'#967550',x,2.6,1.5);
 // Colorful garden beds, hedges, café umbrellas and a small park pond.
 function hedge(x,z,length){for(let i=0;i<length;i++){sphere(.42,'#32863b',x+i*.55,.62,z);sphere(.3,'#63b53a',x+i*.55,.85,z);}}
 hedge(-8,-3,6);hedge(4,-4,7);
 function planter(x,z){box(1.25,.32,.65,'#c87b45',x,.48,z);box(1.1,.06,.5,'#785139',x,.67,z);for(let i=0;i<5;i++)flower(x-.45+i*.22,z,['#ff5b78','#ffcb32','#a65bdb'][i%3]);}
 planter(-3.5,-3.8);planter(2,-3.8);planter(-7,3.2);
 function umbrella(x,z,color){cyl(.045,2.8,'#e1c38d',x,1.65,z);const canopy=mesh(new T.ConeGeometry(1.13,.5,12,1,true),color,x,3.1,z);canopy.material.side=T.DoubleSide;cyl(.07,.18,'#fff1c8',x,3.42,z);}
 umbrella(5,0,'#f5b933');umbrella(-6,2,'#ed7850');
 const pond=cyl(1.5,.08,'#f0c983',6,.28,-4);pond.scale.z=.7;const water=cyl(1.3,.1,'#36b4d0',6,.33,-4);water.scale.z=.7;
 for(let i=0;i<10;i++){const a=i/10*Math.PI*2;const rock=sphere(.23,'#c2bca0',6+Math.cos(a)*1.48,.38,-4+Math.sin(a)*1.02);rock.scale.y=.65;}
 const duck=sphere(.12,'#fff3b6',6.3,.49,-4);sphere(.08,'#fff3b6',6.3,.6,-3.91);const bill=box(.07,.04,.09,'#ed9b28',6.3,.6,-3.82);
 for(const [x,z] of [[-8,0],[7,1]]){box(1.5,.12,.45,'#d78b4a',x,.8,z);for(const dx of [-.55,.55]){box(.09,.6,.35,'#496b49',x+dx,.47,z);box(.08,.65,.1,'#496b49',x+dx,1,z-.2);}box(1.5,.35,.1,'#e5a458',x,1.1,z-.2);}
 // Batched grass tufts add texture without hundreds of extra draw calls.
 const grass=new T.InstancedMesh(new T.ConeGeometry(.075,.28,3),mat('#4a9c31'),180);const dummy=new T.Object3D();let n=0;
 for(let i=0;i<300&&n<180;i++){const x=Math.sin(i*137.5)*10,z=Math.cos(i*91.7)*7;if((Math.abs(x)>4&&z<3)||z<-5){dummy.position.set(x,.39,z);dummy.rotation.y=i;dummy.updateMatrix();grass.setMatrixAt(n++,dummy.matrix);}}grass.count=n;scene.add(grass);
 box(.12,1.8,.12,'#ba7844',-3.1,1.3,3.5);label('PICKUP',1.3,.35,'#f4c04f','#3d643d',-3.1,2.12,3.6);
 // A separate touchscreen kiosk stands diagonally in front of the caravan.
 box(2.3,.1,2.05,'#eddbb8',4.1,.3,3.3);box(.85,.18,.7,'#315e4c',4.1,.47,3.1);box(.3,1.2,.27,'#f0e5cd',4.1,1.1,3.1);
 box(1.12,1.15,.23,'#244d46',4.1,2.03,3.1);box(.96,.9,.04,'#93ddc6',4.1,2.08,3.24);
 label('ORDER HERE',1.02,.28,'#244d46','#fff5cd',4.1,2.76,3.25);
 const kioskScreen=label('TAP TO ORDER',.9,.3,'#93ddc6','#244d46',4.1,2.12,3.28);label('KOWL',.72,.22,'#244d46','#fff5cd',4.1,1.65,3.24);
 for(const x of [3.86,4.1,4.34])sphere(.035,'#fff6cc',x,1.9,3.29);
 for(let i=0;i<4;i++){const marker=mesh(new T.ConeGeometry(.13,.04,3),'#fff0b9',2.9-i*.7,.39,3.5-i*.42);marker.rotation.y=-.8;}
 // Customers walk in, queue, and leave after a sale.
 const daylight=createDayLight(scene,sun,ambient,mat);
 const effects=createSaleEffects(scene,van,mat);
 // The car lane is outside the café's pedestrian approach and pickup queues.
 box(35,.12,2.6,'#7c8983',0,.25,roadZ);box(35,.12,.18,'#efe1bd',0,.3,roadZ-1.4);
 for(let i=-8;i<=8;i++)box(.85,.015,.07,'#f6e7b6',i*2,.32,roadZ);
 const traffic=createTraffic(scene,mat),seats=createSeats();
 const people=[];
 const flow=createCustomerFlow(people,order=>host.dispatchEvent(new CustomEvent('customer-ordered',{detail:order})),{seats});
 function person(id,kind){const p=buildCustomer(id,mat);scene.add(p.g);p.g.position.set(7.8,.35,4.4);flow.add(p,kind);return p;}
 function completeSale(id,kind){const p=flow.claim(id);if(!p)return null;const origin=effects.serve(p,kind);const projected=origin.clone().project(camera);const bounds=renderer.domElement.getBoundingClientRect();return {x:bounds.left+(projected.x+1)*bounds.width/2,y:bounds.top+(1-projected.y)*bounds.height/2};}
 let last=performance.now();function tick(now){const dt=Math.min((now-last)/1000,.25);last=now;if(document.hidden)return;
 flow.update(dt);
 for(let i=0;i<people.length;i++){
  const p=people[i];
  p.knees.forEach(knee=>knee.rotation.x=0);
  if(p.stage==='seated'){
   p.body.position.y=.5-.76*p.appearance.height;p.legs.forEach(leg=>leg.rotation.x=-Math.PI/2);p.knees.forEach(knee=>knee.rotation.x=Math.PI/2);
   const sip=Math.max(0,Math.sin(p.seatedTime*1.3))**8;p.arms[1].rotation.x=-1-sip*.45;
   if(p.drink){p.drink.position.set(.3-sip*.11,.85+sip*.42,.24+sip*.06);p.drink.rotation.z=-sip*.15;}
  }else if(p.moving){p.legs.forEach((leg,j)=>leg.rotation.x=Math.sin(now*.009+p.appearance.phase+j*Math.PI)*.4);p.arms.forEach((arm,j)=>arm.rotation.x=-Math.sin(now*.009+p.appearance.phase+j*Math.PI)*.3);p.body.position.y=-.2*p.appearance.height+Math.abs(Math.sin(now*.009+p.appearance.phase))*.025;}
  else{p.body.position.y=-.2*p.appearance.height;p.legs.forEach(leg=>leg.rotation.x=0);p.arms.forEach(arm=>arm.rotation.x=0);if(p.stage==='ordering')p.arms[1].rotation.x=-.9+Math.sin(now*.008)*.1;}
  if(p.leaving&&p.g.position.x<-11){scene.remove(p.g);people.splice(i--,1);p.g.traverse(o=>{if(o.isMesh)o.geometry.dispose();});}
 }
 const status=flow.snapshot();kioskScreen.scale.setScalar(status.ordering?1+Math.sin(now*.006)*.03:1);
 caravan.tick(dt);effects.tick(dt,now);traffic.tick(dt);for(const p of people)if(p.hasCoffee&&p.stage!=='seated'){p.arms[1].rotation.x=-1;if(p.drink){p.drink.position.set(.31,.85,.24);p.drink.rotation.z=0;}}
 controls.update();renderer.render(scene,camera);}
 renderer.setAnimationLoop(tick);
 let previousWidth=0,previousHeight=0;
 function resize(){const width=Math.max(1,host.clientWidth),height=Math.max(1,host.clientHeight);if(width===previousWidth&&height===previousHeight)return;previousWidth=width;previousHeight=height;renderer.setSize(width,height,false);camera.aspect=width/height;camera.fov=cameraFov(width,height);camera.updateProjectionMatrix();}
 window.addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);const viewportObserver=new ResizeObserver(resize);viewportObserver.observe(host);resize();
 return {setTime:daylight.setTime,person,completeSale,canCollect:flow.canCollect,customerCount:flow.activeCount,orderStatus:flow.snapshot,readyCoffee:effects.ready,brewing:effects.brewing,rotate:(v)=>{const offset=camera.position.clone().sub(controls.target);offset.applyAxisAngle(new T.Vector3(0,1,0),v);camera.position.copy(controls.target).add(offset);},zoom:(v)=>{const offset=camera.position.clone().sub(controls.target);offset.multiplyScalar(v);const len=T.MathUtils.clamp(offset.length(),13,30);offset.setLength(len);camera.position.copy(controls.target).add(offset);},upgrade:(level,options)=>caravan.setLevel(level,options),renderer};
}
