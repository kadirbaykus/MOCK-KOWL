import * as T from 'three';
export function createDayLight(scene,sun,ambient,material){
 const nightSky=new T.Color('#10223e'),daySky=new T.Color('#a7d9f0');
 const lamps=[[-2,3,1.5],[4.1,2.6,3.1]].map(([x,y,z])=>{const lamp=new T.PointLight('#ffcc77',0,8,2);lamp.position.set(x,y,z);scene.add(lamp);return lamp;});
 const points=[];for(let i=0;i<100;i++)points.push(Math.sin(i*91.7)*32,17+Math.abs(Math.cos(i*5.1))*15,Math.cos(i*21.2)*32);
 const stars=new T.Points(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(points,3)),new T.PointsMaterial({color:'#fff2cf',size:.11,transparent:true,opacity:0,fog:false,depthWrite:false}));scene.add(stars);
 let previous=-1;
 function setTime(hours){
  if(Math.abs(hours-previous)<.015)return;previous=hours;
  const altitude=Math.sin((hours-6)/24*Math.PI*2),daylight=T.MathUtils.smoothstep(altitude,-.12,.3),glow=1-daylight;
  scene.background.copy(nightSky).lerp(daySky,daylight);scene.fog.color.copy(scene.background);
  ambient.intensity=.55+daylight*1.25;sun.intensity=.18+daylight*2.22;sun.color.set(daylight>.5?'#fff1d4':'#8aa6e3');
  lamps.forEach(lamp=>lamp.intensity=glow*7);stars.material.opacity=glow*.9;
  for(const color of ['#ffe190','#fff0a6','#e9bc70']){const m=material(color);m.emissive.set('#ffba55');m.emissiveIntensity=glow*1.5;}
 }
 return {setTime};
}
