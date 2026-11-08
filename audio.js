/* audio.js - WebAudio: soft piano score + cinematic / firework SFX. Nothing plays until the visitor taps. */
(function(){
'use strict';
var ctx=null,master,musicBus,sfxBus,rev,revSend,comp,analyser,noiseBuf;
var muted=false,musicOn=false,timer=null,nextT=0,step=0;
var listeners=[];
function emit(){listeners.forEach(function(f){try{f({muted:muted,music:musicOn,ready:!!ctx});}catch(e){}});}

function ensure(){
  if(ctx){ if(ctx.state==='suspended'&&ctx.resume)ctx.resume(); return true; }
  var AC=window.AudioContext||window.webkitAudioContext; if(!AC)return false;
  try{ctx=new AC();}catch(e){return false;}
  master=ctx.createGain();master.gain.value=muted?0:.9;
  comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.attack.value=.01;comp.release.value=.3;
  analyser=ctx.createAnalyser();analyser.fftSize=1024;
  master.connect(comp);comp.connect(analyser);analyser.connect(ctx.destination);
  musicBus=ctx.createGain();musicBus.gain.value=0;musicBus.connect(master);
  sfxBus=ctx.createGain();sfxBus.gain.value=.8;sfxBus.connect(master);
  /* reverb: generated impulse */
  var len=Math.floor(ctx.sampleRate*2.6),imp=ctx.createBuffer(2,len,ctx.sampleRate);
  for(var c=0;c<2;c++){var d=imp.getChannelData(c);for(var i=0;i<len;i++){d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.4);}}
  rev=ctx.createConvolver();rev.buffer=imp;revSend=ctx.createGain();revSend.gain.value=.34;revSend.connect(rev);rev.connect(master);
  noiseBuf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);var nd=noiseBuf.getChannelData(0);for(var j=0;j<nd.length;j++)nd[j]=Math.random()*2-1;
  return true;
}
function hz(m){return 440*Math.pow(2,(m-69)/12);}
var N={C2:36,D2:38,E2:40,F2:41,G2:43,A2:45,B2:47,C3:48,D3:50,E3:52,F3:53,G3:55,A3:57,B3:59,C4:60,D4:62,E4:64,F4:65,G4:67,A4:69,B4:71,C5:72,D5:74,E5:76,F5:77,G5:79,A5:81,C6:84};

function piano(m,t,vel,dur,bus){
  var f=hz(m),out=ctx.createGain(),lp=ctx.createBiquadFilter();
  lp.type='lowpass';lp.frequency.value=Math.min(6500,900+f*5);lp.Q.value=.3;
  var tau=Math.max(.7,2.6-(m-36)*.03)*(dur||1);
  out.gain.setValueAtTime(0,t);out.gain.linearRampToValueAtTime(vel,t+.008);out.gain.exponentialRampToValueAtTime(vel*.35,t+.35);out.gain.exponentialRampToValueAtTime(.0004,t+tau*1.6);
  var parts=[[1,1,0],[2,.38,3],[3,.14,-4],[4,.07,5],[5,.03,0]];
  parts.forEach(function(p){
    var o=ctx.createOscillator(),pg=ctx.createGain();o.type='sine';o.frequency.value=f*p[0];o.detune.value=p[2];
    pg.gain.setValueAtTime(p[1],t);pg.gain.exponentialRampToValueAtTime(Math.max(.0005,p[1]*.08),t+tau/(p[0]*.7+.3));
    o.connect(pg);pg.connect(lp);o.start(t);o.stop(t+tau*1.7+.1);
  });
  /* hammer */
  var n=ctx.createBufferSource(),ng=ctx.createGain(),nf=ctx.createBiquadFilter();n.buffer=noiseBuf;nf.type='bandpass';nf.frequency.value=Math.min(5000,f*4);nf.Q.value=1.2;
  ng.gain.setValueAtTime(vel*.35,t);ng.gain.exponentialRampToValueAtTime(.0005,t+.05);n.connect(nf);nf.connect(ng);ng.connect(lp);n.start(t);n.stop(t+.08);
  lp.connect(out);out.connect(bus||musicBus);
  var s=ctx.createGain();s.gain.value=.6;out.connect(s);s.connect(revSend);
}
function pad(m,t,dur,vel){
  var o=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain(),lp=ctx.createBiquadFilter();
  o.type='triangle';o2.type='sine';o.frequency.value=hz(m);o2.frequency.value=hz(m)*1.002;lp.type='lowpass';lp.frequency.value=900;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vel,t+dur*.4);g.gain.linearRampToValueAtTime(0,t+dur*1.05);
  o.connect(lp);o2.connect(lp);lp.connect(g);g.connect(musicBus);var s=ctx.createGain();s.gain.value=.5;g.connect(s);s.connect(revSend);
  o.start(t);o2.start(t);o.stop(t+dur*1.1);o2.stop(t+dur*1.1);
}
/* 4 bars per phrase, 8 eighth-notes per bar, 62 bpm */
var EIGHTH=60/62/2;
var CH=[ /* bass, arpeggio notes */
  {b:N.C3,a:[N.G3,N.C4,N.E4,N.B3],pad:[N.E3,N.B3]},
  {b:N.A2,a:[N.E3,N.A3,N.C4,N.G3],pad:[N.C4,N.E4]},
  {b:N.F2,a:[N.C3,N.F3,N.A3,N.E3],pad:[N.A3,N.C4]},
  {b:N.G2,a:[N.D3,N.G3,N.B3,N.F3],pad:[N.B3,N.D4]}
];
var MEL=[
  [[0,N.E5,3],[3,N.D5,1],[4,N.C5,4]],
  [[0,N.C5,2],[2,N.E5,2],[4,N.A4,4]],
  [[0,N.A4,2],[2,N.C5,1],[3,N.D5,1],[4,N.E5,4]],
  [[0,N.D5,3],[3,N.B4,1],[4,N.G4,4]],
  [[0,N.G5,3],[3,N.E5,1],[4,N.D5,4]],
  [[0,N.E5,2],[2,N.C5,2],[4,N.C5,4]],
  [[0,N.F5,2],[2,N.E5,1],[3,N.D5,1],[4,N.C5,4]],
  [[0,N.B4,2],[2,N.D5,2],[4,N.G4,4]]
];
var ARP=[0,1,2,3,2,1,2,3];
function scheduleBar(bar,t0){
  var c=CH[bar%4],i;
  piano(c.b,t0,.34,1.6);
  pad(c.pad[0],t0,EIGHTH*8,.035);pad(c.pad[1],t0,EIGHTH*8,.03);
  for(i=0;i<8;i++){piano(c.a[ARP[i]],t0+i*EIGHTH,.13+(i%4===0?.03:0),.9);}
  var mel=MEL[bar%8];
  for(i=0;i<mel.length;i++){piano(mel[i][1],t0+mel[i][0]*EIGHTH+.01,.2,1.4);}
}
function pump(){
  if(!ctx||!musicOn)return;
  while(nextT<ctx.currentTime+1.2){scheduleBar(step,nextT);nextT+=EIGHTH*8;step++;}
}
function playMusic(){
  if(!ensure())return false;
  if(musicOn)return true;
  musicOn=true;nextT=ctx.currentTime+.15;
  musicBus.gain.cancelScheduledValues(ctx.currentTime);musicBus.gain.setValueAtTime(musicBus.gain.value,ctx.currentTime);musicBus.gain.linearRampToValueAtTime(.85,ctx.currentTime+1.8);
  pump();timer=setInterval(pump,250);emit();return true;
}
function pauseMusic(){
  if(!ctx||!musicOn)return;
  musicOn=false;clearInterval(timer);timer=null;
  musicBus.gain.cancelScheduledValues(ctx.currentTime);musicBus.gain.setValueAtTime(musicBus.gain.value,ctx.currentTime);musicBus.gain.linearRampToValueAtTime(0,ctx.currentTime+.6);
  emit();
}
function toggleMusic(){ if(musicOn)pauseMusic(); else playMusic(); }
function setMuted(m){
  muted=m;if(ctx){master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setTargetAtTime(m?0:.9,ctx.currentTime,.05);}emit();
}
function toggleMute(){ensure();setMuted(!muted);}

/* ---------- SFX (silent unless the visitor has switched audio on) ---------- */
function on(){return ctx&&!muted&&ctx.state==='running';}
function noise(t,dur,type,f0,f1,vel,q){
  var n=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();n.buffer=noiseBuf;n.loop=true;
  f.type=type;f.Q.value=q||1;f.frequency.setValueAtTime(f0,t);if(f1)f.frequency.exponentialRampToValueAtTime(f1,t+dur);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vel,t+Math.min(.05,dur*.2));g.gain.exponentialRampToValueAtTime(.0005,t+dur);
  n.connect(f);f.connect(g);g.connect(sfxBus);n.start(t);n.stop(t+dur+.05);return g;
}
var lastBoom=0;
function launch(){ if(!on())return; var t=ctx.currentTime; noise(t,.7,'bandpass',350,2600,.12,2); }
function boom(size){
  if(!on())return; var now=ctx.currentTime; if(now-lastBoom<.05)return; lastBoom=now; size=size||1;
  var o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(110,now);o.frequency.exponentialRampToValueAtTime(34,now+.5);
  g.gain.setValueAtTime(.0001,now);g.gain.linearRampToValueAtTime(.42*Math.min(1.2,size),now+.012);g.gain.exponentialRampToValueAtTime(.0005,now+.9);o.connect(g);g.connect(sfxBus);o.start(now);o.stop(now+1);
  noise(now,.5,'lowpass',2200,180,.4*size,.7);
  var s=ctx.createGain();s.gain.value=.5;g.connect(s);s.connect(revSend);
  crackle(.3);
}
function crackle(amt){
  if(!on())return; var now=ctx.currentTime,n=8+((Math.random()*14)|0);
  for(var i=0;i<n;i++){var t=now+.15+Math.random()*1.3;noise(t,.012+Math.random()*.02,'highpass',3500+Math.random()*3000,0,(amt||.5)*(.06+Math.random()*.1),.7);}
}
function bell(f,t,vel,len){
  var o=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o2.type='sine';o.frequency.value=f;o2.frequency.value=f*2.76;
  var g2=ctx.createGain();g2.gain.value=.25;o2.connect(g2);g2.connect(g);o.connect(g);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vel,t+.006);g.gain.exponentialRampToValueAtTime(.0004,t+(len||1.6));g.connect(sfxBus);var s=ctx.createGain();s.gain.value=.7;g.connect(s);s.connect(revSend);
  o.start(t);o2.start(t);o.stop(t+(len||1.6)+.1);o2.stop(t+(len||1.6)+.1);
}
function chime(){ if(!on())return; var t=ctx.currentTime;[N.E5,N.G5,N.C6].forEach(function(m,i){bell(hz(m),t+i*.11,.16,1.8);}); }
function sparkle(){ if(!on())return; var t=ctx.currentTime;for(var i=0;i<9;i++){bell(1500+Math.random()*3200,t+i*.07+Math.random()*.05,.05+Math.random()*.05,.9);} }
function seal(){ if(!on())return; var t=ctx.currentTime;noise(t,.06,'bandpass',900,300,.3,1.5);var o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(160,t);o.frequency.exponentialRampToValueAtTime(60,t+.2);g.gain.setValueAtTime(.3,t);g.gain.exponentialRampToValueAtTime(.001,t+.25);o.connect(g);g.connect(sfxBus);o.start(t);o.stop(t+.3);sparkle(); }
function whooshOpen(){ if(!on())return; var t=ctx.currentTime;noise(t,1.2,'bandpass',200,3000,.2,1.4);bell(hz(N.C5),t+.5,.1,2);bell(hz(N.G5),t+.65,.1,2);bell(hz(N.E5)*2,t+.8,.1,2.4); sparkle(); }
function celebrate(){ /* cinematic: riser, big boom, shimmer, soft cheer-wash */
  if(!on())return; var t=ctx.currentTime;
  noise(t,2.2,'bandpass',200,5000,.22,1.2);
  var o=ctx.createOscillator(),g=ctx.createGain(),lp=ctx.createBiquadFilter();o.type='sawtooth';lp.type='lowpass';lp.frequency.setValueAtTime(300,t);lp.frequency.exponentialRampToValueAtTime(5000,t+2.2);
  o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(440,t+2.2);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.1,t+2.1);g.gain.exponentialRampToValueAtTime(.001,t+2.4);o.connect(lp);lp.connect(g);g.connect(sfxBus);o.start(t);o.stop(t+2.5);
  setTimeout(function(){boom(1.4);sparkle();noise(ctx.currentTime,2.5,'bandpass',1800,900,.07,.6);},2200);
}
function tick(){ if(!on())return; var t=ctx.currentTime;bell(2200,t,.03,.12); }
function level(){ if(!analyser)return 0; var a=new Uint8Array(analyser.fftSize);analyser.getByteTimeDomainData(a);var m=0;for(var i=0;i<a.length;i++){var v=Math.abs(a[i]-128);if(v>m)m=v;}return m/128; }

window.Sound={ensure:ensure,playMusic:playMusic,pauseMusic:pauseMusic,toggleMusic:toggleMusic,toggleMute:toggleMute,setMuted:setMuted,
  launch:launch,boom:boom,crackle:crackle,chime:chime,sparkle:sparkle,seal:seal,whooshOpen:whooshOpen,celebrate:celebrate,tick:tick,level:level,
  onChange:function(f){listeners.push(f);},state:function(){return {muted:muted,music:musicOn,ready:!!ctx,running:ctx?ctx.state:'none'};}};
})();
