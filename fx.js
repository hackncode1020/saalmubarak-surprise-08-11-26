/* fx.js - ambient sky (stars, gold dust, petals, hearts) + realistic canvas fireworks */
(function(){
'use strict';
var bg=document.getElementById('bg'), fx=document.getElementById('fx');
var bgx=bg.getContext('2d'), g=fx.getContext('2d');
var W=0,H=0,dpr=1,S=1,MOB=false,CAP=900;
var stars=[],dust=[],drift=[],parts=[],rockets=[],flashes=[],timers=[];
var sceneMode=false,wantPetals=0,wantHearts=0,reduce=false,fxIdle=true,running=true,last=0;
try{reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
var hooks={launch:null,boom:null,crackle:null};

var PAL={
  gold:[[44,100,58],[40,92,50],[48,100,66]],
  champ:[[40,78,70],[44,70,64],[36,82,60]],
  rose:[[352,58,62],[355,64,70],[348,50,56]],
  pink:[[336,92,60],[344,95,66],[328,80,52]],
  burg:[[342,88,38],[346,90,46],[350,80,54]],
  ivory:[[38,90,84],[42,70,78],[46,60,72]]
};
var MIX=['gold','champ','rose','pink','burg','gold','ivory'];

function size(){
  dpr=Math.min(window.devicePixelRatio||1,2);
  MOB=Math.min(window.innerWidth,window.innerHeight)<700;
  if(MOB) dpr=Math.min(dpr,1.75);
  W=window.innerWidth;H=window.innerHeight;
  [bg,fx].forEach(function(c){c.width=Math.round(W*dpr);c.height=Math.round(H*dpr);c.style.width=W+'px';c.style.height=H+'px';});
  S=Math.max(.8,Math.min(1.5,Math.min(W,H*.62)/400));
  CAP=MOB?750:1500;
  var ns=Math.round(Math.min(220,W*H/4200)*(reduce?.5:1));
  stars=[];for(var i=0;i<ns;i++)stars.push({x:Math.random()*W,y:Math.random()*H*.92,r:.3+Math.random()*1.1,p:Math.random()*6.28,sp:.6+Math.random()*2,gold:Math.random()<.5});
  var nd=reduce?18:(MOB?42:80);
  dust=[];for(i=0;i<nd;i++)dust.push(newDust(true));
}
function newDust(init){return {x:Math.random()*W,y:init?Math.random()*H:H+10,vx:(Math.random()-.5)*.12,vy:-.08-Math.random()*.25,r:.5+Math.random()*1.7,a:.15+Math.random()*.5,p:Math.random()*6.28};}
function newDrift(type,init){
  var pal=['#7a1230','#9a1f45','#B76E79','#c9566e','#4A1025','#e3a4ad'];
  return {t:type,x:Math.random()*W,y:init?Math.random()*H:-20,vx:(Math.random()-.5)*.5,vy:.5+Math.random()*.9,rot:Math.random()*6.28,vr:(Math.random()-.5)*.05,s:(type==='h'?5:6)+Math.random()*7,p:Math.random()*6.28,col:type==='h'?(Math.random()<.5?'#D4AF72':'#e8a0ab'):pal[(Math.random()*pal.length)|0],up:type==='h'};
}
/* ---------- fireworks ---------- */
function hsl(c,dl){return 'hsl('+c[0]+','+c[1]+'%,'+Math.min(98,c[2]+(dl||0))+'%)';}
function pick(palName){var p=PAL[palName]||PAL.gold;return p[(Math.random()*p.length)|0];}
function spawn(x,y,vx,vy,life,size,col,o){
  if(parts.length>CAP)return;
  o=o||{};
  parts.push({x:x,y:y,h:[x,y],tl:life>115?9:6,vx:vx,vy:vy,life:life,max:life,sz:size,col:col,drag:o.drag||.965,grav:o.grav==null?.045:o.grav,glit:!!o.glit,sec:o.sec||0,secCol:o.secCol});
}
function explode(x,y,type,palName){
  var N,i,a,sp,c,col;
  var pn=palName||MIX[(Math.random()*MIX.length)|0];
  var k=S*(MOB?.9:1.1);
  flashes.push({x:x,y:y,life:10,max:10,c:pick(pn),r:140*S});
  if(hooks.boom)hooks.boom(type==='heart'?1:(type==='willow'?1.2:.8+Math.random()*.5));
  if(type==='heart'){
    N=MOB?90:120;
    for(i=0;i<N;i++){
      a=i/N*6.2832;var hx=16*Math.pow(Math.sin(a),3),hy=-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a));
      c=pick(Math.random()<.6?'rose':pn);
      spawn(x,y,hx*.27*k,hy*.27*k-.2,95+Math.random()*25,1.9*S,c,{drag:.935,grav:.012,glit:Math.random()<.35});
    }
    N=MOB?20:34;
    for(i=0;i<N;i++){a=Math.random()*6.28;sp=Math.random()*2;spawn(x,y,Math.cos(a)*sp*k,Math.sin(a)*sp*k,70+Math.random()*30,1.2*S,PAL.gold[0],{drag:.94,grav:.02,glit:true});}
    return;
  }
  if(type==='ring'){
    N=MOB?56:80;var tilt=Math.random()*3.14,sq=.35+Math.random()*.6;
    for(i=0;i<N;i++){a=i/N*6.2832;c=pick(pn);var rx=Math.cos(a)*5.6*k,ry=Math.sin(a)*5.6*k*sq;spawn(x,y,rx*Math.cos(tilt)-ry*Math.sin(tilt),rx*Math.sin(tilt)+ry*Math.cos(tilt),70+Math.random()*20,1.8*S,c,{drag:.955});}
    return;
  }
  if(type==='willow'){
    N=MOB?60:90;
    for(i=0;i<N;i++){a=Math.random()*6.28;sp=1.5+Math.random()*4.6;spawn(x,y,Math.cos(a)*sp*k,Math.sin(a)*sp*k,130+Math.random()*60,1.5*S,pick('gold'),{drag:.972,grav:.05,glit:Math.random()<.4});}
    return;
  }
  /* peony / crossette-ish with glitter */
  N=MOB?110:150;
  for(i=0;i<N;i++){
    a=Math.random()*6.28;sp=Math.pow(Math.random(),.55)*6.4;col=pick(pn);
    spawn(x,y,Math.cos(a)*sp*k,Math.sin(a)*sp*k,75+Math.random()*40,(1.6+Math.random()*.9)*S,col,{drag:.962,glit:Math.random()<.3,sec:Math.random()<.12?1:0,secCol:pick('champ')});
  }
  if(hooks.crackle&&Math.random()<.6)hooks.crackle();
}
function launch(opts){
  opts=opts||{};
  var tx=opts.x!=null?opts.x:W*(.15+Math.random()*.7);
  var ty=opts.y!=null?opts.y:H*(region.t+Math.random()*(region.b-region.t));
  var sx=opts.sx!=null?opts.sx:W*.5+(tx-W*.5)*.35+(Math.random()-.5)*60;
  rockets.push({x:sx,y:H+8,sx:sx,sy:H+8,tx:tx,ty:ty,t:0,dur:(opts.fast?32:46)+Math.random()*16,type:opts.type||'peony',pal:opts.pal,wob:Math.random()*6});
  if(hooks.launch)hooks.launch();
}
var region={t:.1,b:.5};
function setRegion(t,b){region.t=t;region.b=b;}
function rand(a){return a[(Math.random()*a.length)|0];}
function later(fn,ms){var id=setTimeout(fn,ms);timers.push(id);return id;}
var autoId=null;
function auto(interval,types){
  stopAuto();
  if(reduce)interval*=2;
  function tick(){launch({type:rand(types||['peony','peony','ring','willow','heart']),pal:rand(MIX)});autoId=setTimeout(tick,interval*(.7+Math.random()*.7));}
  autoId=setTimeout(tick,300);
}
function stopAuto(){if(autoId){clearTimeout(autoId);autoId=null;}}
function clearAll(){stopAuto();timers.forEach(clearTimeout);timers=[];}
function grand(done){
  /* ~13s choreographed show */
  var seq=[
    [0,'peony','gold'],[500,'ring','champ'],[1000,'peony','rose'],[1500,'willow','gold'],[2200,'peony','pink'],[2500,'peony','champ'],
    [3300,'heart','pink'],[3700,'ring','gold'],[4200,'peony','burg'],[4500,'peony','rose'],[5200,'willow','gold'],[5600,'heart','rose'],
    [6400,'peony','gold'],[6600,'peony','champ'],[6800,'ring','pink'],[7600,'heart','gold'],[8000,'willow','champ'],[8600,'peony','rose'],[8800,'peony','burg']
  ];
  var i;
  for(i=0;i<seq.length;i++)(function(s){later(function(){launch({type:s[1],pal:s[2],fast:true});},s[0]);})(seq[i]);
  /* finale barrage */
  for(i=0;i<16;i++)(function(i){later(function(){launch({type:i%5===4?'heart':rand(['peony','willow','ring']),pal:rand(MIX),fast:true});},9800+i*130);})(i);
  later(function(){launch({type:'heart',pal:'pink',x:W*.5,y:H*.28});},11800);
  later(function(){if(done)done();},13500);
}
function burstAt(x,y,type,pal){launch({x:x,y:y,type:type||rand(['peony','ring','heart','willow']),pal:pal||rand(MIX),fast:true});}

/* ---------- loop ---------- */
function frame(ts){
  if(!running){return;}
  requestAnimationFrame(frame);
  var dt=Math.min(2.5,(ts-last)/16.667||1);last=ts;
  var t=ts/1000,i,s,p;
  /* ambient */
  bgx.setTransform(dpr,0,0,dpr,0,0);bgx.clearRect(0,0,W,H);
  for(i=0;!sceneMode&&i<stars.length;i++){s=stars[i];var a=.35+.65*Math.abs(Math.sin(t*s.sp+s.p));bgx.globalAlpha=a*.9;bgx.fillStyle=s.gold?'#F3DFB0':'#FFF5E8';bgx.beginPath();bgx.arc(s.x,s.y,s.r,0,6.2832);bgx.fill();
    if(s.r>1.05&&a>.8){bgx.globalAlpha=(a-.8)*1.2;bgx.fillRect(s.x-s.r*3,s.y-.3,s.r*6,.6);bgx.fillRect(s.x-.3,s.y-s.r*3,.6,s.r*6);}}
  for(i=0;!sceneMode&&i<dust.length;i++){p=dust[i];p.x+=(p.vx+Math.sin(t+p.p)*.08)*dt;p.y+=p.vy*dt;if(p.y<-10){dust[i]=newDust(false);continue;}
    bgx.globalAlpha=p.a*(.6+.4*Math.sin(t*2+p.p));bgx.fillStyle='#E8C888';bgx.beginPath();bgx.arc(p.x,p.y,p.r,0,6.2832);bgx.fill();}
  /* petals + hearts */
  var np=0,nh=0;for(i=0;i<drift.length;i++){if(drift[i].t==='h')nh++;else np++;}
  if(!reduce||true){
    if(np<wantPetals&&Math.random()<.12*dt)drift.push(newDrift('p',false));
    if(nh<wantHearts&&Math.random()<.08*dt){var hh=newDrift('h',false);hh.y=H+20;hh.vy=-(.5+Math.random()*.8);drift.push(hh);}
  }
  for(i=drift.length-1;i>=0;i--){p=drift[i];p.p+=.02*dt;p.x+=(p.vx+Math.sin(p.p)*.5)*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
    if(p.y>H+30||p.y<-40){drift.splice(i,1);continue;}
    bgx.save();bgx.translate(p.x,p.y);bgx.rotate(p.rot);bgx.globalAlpha=p.t==='h'?.85:.88;bgx.fillStyle=p.col;
    if(p.t==='h'){var q=p.s/50;bgx.scale(q*Math.cos(p.p*.7+1)*.4+q*.6,q);bgx.shadowColor=p.col;bgx.shadowBlur=10;bgx.beginPath();bgx.moveTo(0,10);bgx.bezierCurveTo(-22,-4,-12,-26,0,-12);bgx.bezierCurveTo(12,-26,22,-4,0,10);bgx.fill();}
    else{bgx.scale(1,.62+.38*Math.cos(p.p*1.3));bgx.beginPath();bgx.moveTo(0,-p.s);bgx.bezierCurveTo(p.s*.9,-p.s*.6,p.s*.8,p.s*.6,0,p.s);bgx.bezierCurveTo(-p.s*.8,p.s*.6,-p.s*.9,-p.s*.6,0,-p.s);bgx.fill();bgx.globalAlpha=.25;bgx.fillStyle='#fff';bgx.fillRect(-.5,-p.s*.7,1,p.s*1.2);}
    bgx.restore();
  }
  bgx.globalAlpha=1;
  /* fireworks */
  var active=parts.length||rockets.length||flashes.length;
  if(!active){ if(!fxIdle){g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,fx.width,fx.height);fxIdle=true;} return; }
  fxIdle=false;
  g.setTransform(dpr,0,0,dpr,0,0);
  g.clearRect(0,0,W,H);
  g.globalCompositeOperation='lighter';
  g.lineCap='round';
  for(i=flashes.length-1;i>=0;i--){var f=flashes[i];f.life-=dt;if(f.life<=0){flashes.splice(i,1);continue;}
    var fa=f.life/f.max*.32;var gr=g.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r);gr.addColorStop(0,'hsla('+f.c[0]+','+f.c[1]+'%,'+f.c[2]+'%,'+fa+')');gr.addColorStop(1,'hsla('+f.c[0]+','+f.c[1]+'%,'+f.c[2]+'%,0)');g.fillStyle=gr;g.fillRect(f.x-f.r,f.y-f.r,f.r*2,f.r*2);}
  for(i=rockets.length-1;i>=0;i--){var r=rockets[i];r.t+=dt;var u=Math.min(1,r.t/r.dur),e=1-Math.pow(1-u,2.2);
    r.px=r.x;r.py=r.y;r.x=r.sx+(r.tx-r.sx)*e+Math.sin(r.t*.3+r.wob)*1.2*(1-u);r.y=r.sy+(r.ty-r.sy)*e;
    g.globalAlpha=.9;g.strokeStyle='hsl(42,90%,82%)';g.lineWidth=2.2*S;g.beginPath();g.moveTo(r.px,r.py);g.lineTo(r.x,r.y);g.stroke();
    if(parts.length<CAP&&Math.random()<.9)spawn(r.x,r.y,(Math.random()-.5)*.6,.5+Math.random()*.8,14+Math.random()*10,1.1*S,PAL.gold[1],{drag:.95,grav:.02});
    if(u>=1){rockets.splice(i,1);explode(r.x,r.y,r.type,r.pal);}
  }
  for(i=parts.length-1;i>=0;i--){p=parts[i];p.life-=dt;if(p.life<=0){
      if(p.sec){for(var j=0;j<4;j++){var aa=Math.random()*6.28,ss=.6+Math.random()*1.4;spawn(p.x,p.y,Math.cos(aa)*ss,Math.sin(aa)*ss,24+Math.random()*16,1.1*S,p.secCol||PAL.champ[0],{drag:.93,grav:.03,glit:true});}}
      parts.splice(i,1);continue;}
    var dg=Math.pow(p.drag,dt);p.vx*=dg;p.vy=p.vy*dg+p.grav*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
    p.h.unshift(p.x,p.y);if(p.h.length>(p.tl+1)*2)p.h.length=(p.tl+1)*2;
    var al=p.life/p.max;al=al>.5?1:al*2;if(p.glit&&Math.random()<.4)al*=.3;
    g.strokeStyle=hsl(p.col, p.glit&&Math.random()<.3?14:0);
    var h=p.h,n=h.length/2-1,lw=Math.max(.7,p.sz*(.55+.45*al));
    for(var k=0;k<n;k++){g.globalAlpha=al*(1-k/(n+.6));g.lineWidth=lw*(1-k*.12);g.beginPath();g.moveTo(h[k*2],h[k*2+1]);g.lineTo(h[k*2+2],h[k*2+3]+.01);g.stroke();}
    g.globalAlpha=al*.9;g.fillStyle=g.strokeStyle;g.beginPath();g.arc(p.x,p.y,lw*.7,0,6.2832);g.fill();
  }
  g.globalAlpha=1;g.globalCompositeOperation='source-over';
}
function start(){running=true;last=performance.now();requestAnimationFrame(frame);}
document.addEventListener('visibilitychange',function(){if(document.hidden){running=false;}else if(!running){start();}});
var rz;window.addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(size,150);});
size();start();

window.FX={
  launch:launch,burstAt:burstAt,grand:grand,auto:auto,stopAuto:stopAuto,clearAll:clearAll,setRegion:setRegion,
  petals:function(n){wantPetals=reduce?Math.min(n,6):n;},
  hearts:function(n){wantHearts=reduce?Math.min(n,3):n;},
  scene:function(v){sceneMode=!!v;document.body.classList.toggle('scene-mode',!!v);},
  hooks:hooks,
  count:function(){return parts.length+rockets.length;},
  size:function(){return {W:W,H:H,dpr:dpr};}
};
})();
