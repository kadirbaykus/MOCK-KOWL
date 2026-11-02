// Keep the café in view when a device rotates instead of cropping it in portrait.
export function cameraFov(width,height,base=38){
 const aspect=Math.max(.1,width/Math.max(1,height));
 return Math.min(90,2*Math.atan(Math.tan(base*Math.PI/360)*Math.max(1,1.15/aspect))*180/Math.PI);
}
