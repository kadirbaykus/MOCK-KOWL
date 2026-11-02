export function createPaymentEffects(wallet) {
 const layer=document.createElement('div');layer.className='payment-effects';layer.setAttribute('aria-hidden','true');document.body.append(layer);
 const reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
 function animate(node,frames,options){layer.append(node);const animation=node.animate(frames,{fill:'forwards',...options});animation.onfinish=()=>node.remove();animation.oncancel=()=>node.remove();return animation;}
 return {
  play(origin,income){
   const bounds=wallet.getBoundingClientRect(),end={x:bounds.left+bounds.width*.35,y:bounds.top+bounds.height*.5};
   const source={x:Math.max(24,Math.min(innerWidth-24,origin.x)),y:Math.max(100,Math.min(innerHeight*.62,origin.y))};
   const amount=document.createElement('span');amount.className='sale-income';amount.textContent='+'+income+' ₺';
   animate(amount,[{transform:`translate(${source.x-28}px,${source.y-30}px) scale(.7)`,opacity:0},{offset:.2,transform:`translate(${source.x-28}px,${source.y-50}px) scale(1.08)`,opacity:1},{transform:`translate(${source.x-28}px,${source.y-85}px) scale(1)`,opacity:0}],{duration:reduced?250:1400});
   if(!reduced)for(let i=0;i<6;i++){
    const coin=document.createElement('span');coin.className='payment-coin';coin.textContent='₺';
    animate(coin,[{transform:`translate(${source.x}px,${source.y}px) rotateY(0deg) scale(.6)`,opacity:0},{offset:.16,transform:`translate(${source.x+(i-2.5)*13}px,${source.y-35}px) rotateY(180deg) scale(1)`,opacity:1},{offset:.6,transform:`translate(${(source.x+end.x)/2+(i-2.5)*10}px,${Math.min(source.y,end.y)-70}px) rotateY(540deg) scale(.9)`,opacity:1},{transform:`translate(${end.x}px,${end.y}px) rotateY(900deg) scale(.4)`,opacity:0}],{duration:1050,delay:250+i*65});
   }
   wallet.animate([{transform:'scale(1)'},{transform:'scale(1.07)'},{transform:'scale(1)'}],{duration:reduced?150:400,delay:reduced?0:1000});
  }
 };
}
