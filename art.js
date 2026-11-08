/* art.js - inline SVG illustrations (no external images) */
(function(){
'use strict';
var NS='http://www.w3.org/2000/svg';
function rng(seed){var s=seed>>>0;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296;};}

/* one stylised rose seen from above: layered petals + inner spiral */
function rose(r, o){
  o=o||{};
  var g='<g>';
  function ring(R,n,off,fill,op){
    var out='';
    for(var i=0;i<n;i++){
      var a=off+i*(360/n);
      out+='<path transform="rotate('+a+')" d="M0 0 C'+(-R*.98)+' '+(-R*.08)+' '+(-R*1.08)+' '+(-R*.98)+' 0 '+(-R)+' C'+(R*1.08)+' '+(-R*.98)+' '+(R*.98)+' '+(-R*.08)+' 0 0Z" fill="'+fill+'" stroke="rgba(30,0,12,.45)" stroke-width=".7" opacity="'+op+'"/>';
    }
    return out;
  }
  g+='<circle r="'+(r*1.04)+'" fill="rgba(0,0,0,.35)"/>';
  g+=ring(r,6,(o.rot||0),'url(#rgA)',1);
  g+=ring(r*.74,5,(o.rot||0)+18,'url(#rgB)',1);
  g+=ring(r*.5,4,(o.rot||0)+40,'url(#rgC)',1);
  g+='<path d="M0 '+(-r*.03)+' m'+(-r*.2)+' 0 a'+(r*.2)+' '+(r*.2)+' 0 1 1 '+(r*.34)+' '+(r*.16)+' a'+(r*.12)+' '+(r*.12)+' 0 1 1 '+(-r*.14)+' '+(-r*.2)+'" fill="none" stroke="rgba(255,170,190,.35)" stroke-width="'+Math.max(.8,r*.05)+'" stroke-linecap="round"/>';
  g+='<ellipse cx="'+(-r*.28)+'" cy="'+(-r*.42)+'" rx="'+(r*.2)+'" ry="'+(r*.09)+'" fill="rgba(255,255,255,.14)" transform="rotate(-30 '+(-r*.28)+' '+(-r*.42)+')"/>';
  return g+'</g>';
}
function leaf(len,ang){
  return '<g transform="rotate('+ang+')"><path d="M0 0 C'+(len*.35)+' '+(-len*.28)+' '+(len*.85)+' '+(-len*.2)+' '+len+' 0 C'+(len*.85)+' '+(len*.2)+' '+(len*.35)+' '+(len*.28)+' 0 0Z" fill="url(#leafG)" stroke="rgba(0,20,8,.5)" stroke-width=".6"/><path d="M2 0 L'+(len*.9)+' 0" stroke="rgba(160,220,170,.25)" stroke-width=".7"/></g>';
}
function cluster(w,h,seed){
  var R=rng(seed||7), out='';
  var items=[[.5,.62,.2],[.28,.74,.15],[.74,.72,.16],[.12,.9,.11],[.9,.88,.12],[.45,.92,.13],[.62,.5,.11]];
  var i;
  for(i=0;i<9;i++){out+='<g transform="translate('+(w*(.1+R()*.8))+' '+(h*(.75+R()*.2))+')">'+leaf(w*(.12+R()*.1),-150+R()*120)+'</g>';}
  for(i=0;i<items.length;i++){var it=items[i];out+='<g transform="translate('+(w*it[0])+' '+(h*it[1])+')">'+rose(w*it[2],{rot:R()*70})+'</g>';}
  return out;
}
function bouquet(){
  /* viewBox 0 0 240 300 */
  var o='';
  o+='<path d="M62 150 L178 150 L132 292 Q120 300 108 292Z" fill="url(#paperG)" stroke="rgba(212,175,114,.6)" stroke-width="1"/>';
  o+='<path d="M62 150 L120 292 L108 292 Q96 288 92 270Z" fill="rgba(0,0,0,.18)"/>';
  [[40,120,-70],[70,92,-30],[120,84,0],[170,92,28],[200,122,68]].forEach(function(l){o+='<g transform="translate('+(l[0]>120?l[0]-12:l[0]+12)+' '+(l[1]+50)+')">'+leaf(54,l[2]-(l[0]>120?0:0)+(l[0]>120?180:0)*0)+'</g>';});
  var pos=[[120,70,36],[78,100,32],[162,100,32],[48,134,27],[192,134,27],[120,122,32],[88,146,24],[154,146,24]];
  pos.forEach(function(p,i){o+='<g transform="translate('+p[0]+' '+p[1]+')">'+rose(p[2],{rot:i*29})+'</g>';});
  o+='<path d="M62 150 Q120 176 178 150" fill="none" stroke="url(#goldG)" stroke-width="7" stroke-linecap="round"/>';
  o+='<path d="M120 164 C100 178 88 190 80 200 M120 164 C140 178 152 190 160 200" fill="none" stroke="url(#goldG)" stroke-width="4" stroke-linecap="round"/>';
  return o;
}
function heart(w){
  return '<path d="M50 88 C14 60 4 38 6 24 C8 8 24 2 36 8 C42 11 47 16 50 22 C53 16 58 11 64 8 C76 2 92 8 94 24 C96 38 86 60 50 88Z" />';
}

/* clock face */
function clockSVG(){
  var s='<svg viewBox="0 0 200 200" class="clock" aria-hidden="true"><defs><filter id="clkGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
  s+='<circle cx="100" cy="100" r="94" fill="rgba(255,245,232,.04)" stroke="url(#goldG)" stroke-width="1.5"/>';
  s+='<circle cx="100" cy="100" r="88" fill="none" stroke="rgba(212,175,114,.18)" stroke-width="5"/>';
  s+='<circle id="secArc" cx="100" cy="100" r="88" fill="none" stroke="url(#goldG)" stroke-width="3" stroke-linecap="round" stroke-dasharray="552.9" stroke-dashoffset="552.9" transform="rotate(-90 100 100)" filter="url(#clkGlow)"/>';
  for(var i=0;i<60;i++){var big=i%5===0,a=i*6;s+='<line x1="100" y1="'+(big?14:17)+'" x2="100" y2="'+(big?24:21)+'" stroke="'+(big?'#D4AF72':'rgba(212,175,114,.45)')+'" stroke-width="'+(big?2.2:1)+'" transform="rotate('+a+' 100 100)"/>';}
  var nums=[12,3,6,9];
  nums.forEach(function(n,k){var a=k*90*Math.PI/180;s+='<text x="'+(100+Math.sin(a)*64)+'" y="'+(100-Math.cos(a)*64+6)+'" text-anchor="middle" font-family="Cormorant Garamond,Georgia,serif" font-size="19" fill="#F3DFB0">'+n+'</text>';});
  s+='<g filter="url(#clkGlow)"><line id="hHand" x1="100" y1="100" x2="100" y2="58" stroke="#F3DFB0" stroke-width="4" stroke-linecap="round"/><line id="mHand" x1="100" y1="100" x2="100" y2="40" stroke="#D4AF72" stroke-width="2.8" stroke-linecap="round"/><line id="sHand" x1="100" y1="112" x2="100" y2="32" stroke="#B76E79" stroke-width="1.4" stroke-linecap="round"/></g>';
  s+='<circle cx="100" cy="100" r="5" fill="#D4AF72"/><circle cx="100" cy="100" r="2" fill="#080808"/></svg>';
  return s;
}

/* envelope seal */
function sealSVG(){
  return '<svg viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="sealG" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#FFF1CF"/><stop offset=".35" stop-color="#E5C58A"/><stop offset=".75" stop-color="#B58A4A"/><stop offset="1" stop-color="#8A6430"/></radialGradient></defs>'+
  '<path d="M50 4 C58 2 64 8 72 8 C82 8 90 16 90 26 C94 34 98 40 94 50 C98 60 92 68 88 74 C86 84 78 92 68 92 C60 98 52 96 50 96 C46 98 38 98 32 92 C22 92 14 84 12 74 C6 66 2 58 6 50 C2 40 8 32 10 26 C10 16 18 8 28 8 C36 8 42 2 50 4Z" fill="url(#sealG)" stroke="#8A6430" stroke-width="1.2"/>'+
  '<circle cx="50" cy="50" r="33" fill="none" stroke="rgba(90,56,10,.55)" stroke-width="1.4"/><circle cx="50" cy="50" r="29" fill="none" stroke="rgba(255,240,200,.5)" stroke-width=".8"/>'+
  '<g transform="translate(25 27) scale(.5)" fill="#7a5420" opacity=".95">'+heart()+'</g><g transform="translate(25.8 26.2) scale(.5)" fill="rgba(255,235,190,.5)" opacity=".5">'+heart()+'</g></svg>';
}

/* the couple on the terrace */
function coupleScene(){
  var R=rng(2027), s='';
  s+='<defs>'+
   '<linearGradient id="csSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05030a"/><stop offset=".45" stop-color="#1a0a18"/><stop offset=".78" stop-color="#4A1025"/><stop offset="1" stop-color="#9a4a50"/></linearGradient>'+
   '<radialGradient id="csMoon" cx="38%" cy="34%" r="75%"><stop offset="0" stop-color="#FFFBF0"/><stop offset=".6" stop-color="#F3E3C3"/><stop offset="1" stop-color="#C9B286"/></radialGradient>'+
   '<radialGradient id="csHalo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="rgba(255,238,200,.55)"/><stop offset=".4" stop-color="rgba(255,225,170,.16)"/><stop offset="1" stop-color="rgba(255,225,170,0)"/></radialGradient>'+
   '<radialGradient id="csHorizon" cx="50%" cy="100%" r="80%"><stop offset="0" stop-color="rgba(255,170,130,.55)"/><stop offset=".55" stop-color="rgba(183,110,121,.18)"/><stop offset="1" stop-color="rgba(183,110,121,0)"/></radialGradient>'+
   '<linearGradient id="csFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1420"/><stop offset=".3" stop-color="#150a12"/><stop offset="1" stop-color="#07040a"/></linearGradient>'+
   '<radialGradient id="csBulb" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFF6D8"/><stop offset=".25" stop-color="rgba(255,226,150,.9)"/><stop offset="1" stop-color="rgba(255,200,100,0)"/></radialGradient>'+
   '<linearGradient id="csBody" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#05030a"/><stop offset=".72" stop-color="#0b0610"/><stop offset="1" stop-color="#1c0e1a"/></linearGradient>'+
   '<filter id="csBlur"><feGaussianBlur stdDeviation="1.6"/></filter><filter id="csSoft"><feGaussianBlur stdDeviation="6"/></filter>'+
  '</defs>';
  s+='<rect width="390" height="620" fill="url(#csSky)"/>';
  for(var i=0;i<70;i++){s+='<circle cx="'+(R()*390).toFixed(1)+'" cy="'+(R()*300).toFixed(1)+'" r="'+(.4+R()*.9).toFixed(2)+'" fill="#FFF1CF" class="tw" style="animation-delay:'+(R()*4).toFixed(2)+'s" opacity="'+(.3+R()*.6).toFixed(2)+'"/>';}
  s+='<circle cx="300" cy="196" r="120" fill="url(#csHalo)"/>';
  s+='<circle cx="300" cy="196" r="30" fill="url(#csMoon)"/>';
  s+='<g opacity=".16" fill="#8d7a52"><circle cx="290" cy="187" r="5"/><circle cx="310" cy="205" r="7"/><circle cx="294" cy="209" r="3.5"/><circle cx="312" cy="184" r="3"/></g>';
  s+='<rect y="250" width="390" height="190" fill="url(#csHorizon)"/>';
  function layer(base,minH,maxH,col,wmin,wmax,lit,seed){
    var Rr=rng(seed),x=-10,o='';
    while(x<400){
      var w=wmin+Rr()*(wmax-wmin),h=minH+Rr()*(maxH-minH);
      o+='<rect x="'+x.toFixed(1)+'" y="'+(base-h).toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" fill="'+col+'"/>';
      if(Rr()<.18){o+='<rect x="'+(x+w*.45).toFixed(1)+'" y="'+(base-h-18).toFixed(1)+'" width="1.6" height="18" fill="'+col+'"/><circle cx="'+(x+w*.45+.8).toFixed(1)+'" cy="'+(base-h-18).toFixed(1)+'" r="1.4" fill="#ff5d6e" class="tw"/>';}
      if(lit){
        for(var wy=base-h+6;wy<base-4;wy+=7){for(var wx=x+3;wx<x+w-4;wx+=6){if(Rr()<lit){o+='<rect x="'+wx.toFixed(1)+'" y="'+wy.toFixed(1)+'" width="2.6" height="3.2" fill="'+(Rr()<.7?'#FFD98A':'#FFE9C4')+'" opacity="'+(.35+Rr()*.55).toFixed(2)+'"/>';}}}
      }
      x+=w+Rr()*3;
    }
    return o;
  }
  s+=layer(420,60,150,'#221018',24,44,.07,11);
  s+=layer(430,50,120,'#160a12',20,38,.16,23);
  s+=layer(440,30,90,'#0c050b',22,40,.24,37);
  /* city glow bokeh */
  for(i=0;i<22;i++){s+='<circle cx="'+(R()*390).toFixed(0)+'" cy="'+(380+R()*50).toFixed(0)+'" r="'+(2+R()*5).toFixed(1)+'" fill="rgba(255,200,120,'+(.08+R()*.14).toFixed(2)+')" filter="url(#csBlur)"/>';}
  /* terrace: wall + floor */
  s+='<rect x="0" y="440" width="390" height="180" fill="url(#csFloor)"/>';
  s+='<rect x="0" y="436" width="390" height="8" fill="#2c1622"/><rect x="0" y="436" width="390" height="1.4" fill="rgba(255,225,170,.55)"/>';
  for(i=0;i<=26;i++){var bx=i*15.4+4;s+='<path d="M'+bx+' 436 l0 -34 q0 -4 2.5 -4 l0 0 q2.5 0 2.5 4 l0 34Z" fill="#150a12"/><path d="M'+(bx+.4)+' 436 l0 -34" stroke="rgba(255,225,170,.18)" stroke-width=".6"/>';}
  s+='<rect x="0" y="396" width="390" height="5" rx="2" fill="#2a1420"/><rect x="0" y="396" width="390" height="1.2" fill="rgba(255,225,170,.7)"/>';
  /* floor perspective lines */
  for(i=-8;i<=8;i++){s+='<line x1="'+(195+i*14)+'" y1="446" x2="'+(195+i*70)+'" y2="620" stroke="rgba(212,175,114,.07)" stroke-width="1"/>';}
  [466,490,520,556,600].forEach(function(y){s+='<line x1="0" y1="'+y+'" x2="390" y2="'+y+'" stroke="rgba(212,175,114,.06)" stroke-width="1"/>';});
  s+='<ellipse cx="195" cy="528" rx="130" ry="14" fill="rgba(255,190,120,.10)" filter="url(#csSoft)"/>';
  /* fairy lights: two catenary strings */
  function string(y0,sag,n,off){
    var d='M-10 '+y0+' Q 97 '+(y0+sag*1.6)+' 195 '+(y0+sag*.15)+' T 400 '+(y0-4), o='<path d="'+d+'" fill="none" stroke="rgba(212,175,114,.5)" stroke-width=".9"/>';
    return o;
  }
  var strands=[[30,34],[8,26]];
  strands.forEach(function(st,si){
    var y0=st[0]+14,sag=st[1],d='M-10 '+y0+' Q 100 '+(y0+sag*2)+' 195 '+(y0+sag*.9)+' T 400 '+(y0+4);
    s+='<path d="'+d+'" fill="none" stroke="rgba(212,175,114,.55)" stroke-width=".9"/>';
    for(var k=0;k<=15;k++){
      var t=k/15,x=-10+t*410;
      /* approximate y on the curve by sampling the quadratic pieces */
      var y;
      if(x<195){var u=(x+10)/205;y=(1-u)*(1-u)*y0+2*(1-u)*u*(y0+sag*2)+u*u*(y0+sag*.9);}
      else{var u2=(x-195)/205;var c2y=2*(y0+sag*.9)-(y0+sag*2);y=(1-u2)*(1-u2)*(y0+sag*.9)+2*(1-u2)*u2*c2y+u2*u2*(y0+4);}
      s+='<circle cx="'+x.toFixed(1)+'" cy="'+(y+4).toFixed(1)+'" r="9" fill="url(#csBulb)" class="bulb" style="animation-delay:'+((k*.37+si*.9)%3).toFixed(2)+'s"/><circle cx="'+x.toFixed(1)+'" cy="'+(y+4).toFixed(1)+'" r="1.9" fill="#FFF6D8"/>';
    }
  });
  /* the couple, from behind, close together */
  var fill='#09050c';
  function figure(extra){
    var o='';
    /* woman: gown */
    o+='<g class="dress"><path d="M199 362 C192 365 190 374 191 388 C192 402 194 414 192 424 C186 452 176 500 164 534 C188 548 238 548 262 534 C248 500 238 452 232 424 C230 414 232 402 233 388 C234 374 231 365 224 362 Z" fill="'+fill+'"'+extra+'/></g>';
    o+='<path d="M208 356 L218 356 L218 366 C214 369 211 369 208 366Z" fill="'+fill+'"'+extra+'/>';
    o+='<ellipse cx="211" cy="343" rx="11" ry="13.2" fill="'+fill+'" transform="rotate(-9 211 343)"'+extra+'/>';
    o+='<path class="hair" d="M199 340 C198 322 212 316 223 323 C231 329 230 346 227 362 C232 380 227 400 218 414 C216 398 214 384 208 372 C203 362 199 352 199 340Z" fill="#06030a"'+extra+'/>';
    /* man */
    o+='<path d="M143 376 C142 362 148 354 160 352 L184 352 C196 354 202 362 201 376 C203 396 203 418 200 441 C184 448 160 448 144 441 C141 418 141 396 143 376Z" fill="'+fill+'"'+extra+'/>';
    o+='<path d="M151 440 L148 538 L168 538 L174 442Z M171 442 L177 538 L196 538 L196 440Z" fill="'+fill+'"'+extra+'/>';
    o+='<path d="M144 366 C137 388 136 412 139 434 C141 440 150 440 151 433 C150 414 151 392 153 372Z" fill="'+fill+'"'+extra+'/>';
    o+='<path d="M166 345 L178 345 L178 354 L172 358 L166 354Z" fill="'+fill+'"'+extra+'/>';
    o+='<ellipse cx="172" cy="331" rx="12" ry="14.5" fill="'+fill+'"'+extra+'/>';
    o+='<ellipse cx="148" cy="540" rx="11" ry="3.5" fill="#030106"/><ellipse cx="190" cy="540" rx="11" ry="3.5" fill="#030106"/>';
    /* his arm around her waist, her hand on his chest */
    o+='<path d="M200 372 C214 390 214 410 202 424 C210 432 224 428 230 422" fill="none" stroke="'+fill+'" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"'+(extra?'':'')+'/>';
    return o;
  }
  s+='<g id="couple" transform="translate(196 538) scale(1.1) translate(-196 -538)">';
  s+='<ellipse cx="196" cy="540" rx="70" ry="7" fill="rgba(0,0,0,.6)" filter="url(#csBlur)"/>';
  s+='<g stroke="rgba(255,226,170,.5)" stroke-width="2.2" stroke-linejoin="round" opacity=".55">'+figure(' stroke="rgba(255,226,170,.55)" stroke-width="2"')+'</g>';
  s+=figure('');
  s+='<path d="M171 352 L178 372 L185 352" fill="none" stroke="rgba(255,226,170,.16)" stroke-width=".8"/>';
  s+='<path d="M176 536 C196 542 236 542 258 534" fill="none" stroke="rgba(183,110,121,.4)" stroke-width="1.2"/>';
  s+='</g>';
  /* foreground roses on the wall */
  s+='<g transform="translate(46 410)"><g transform="rotate(-8)">'+leaf(30,-170)+leaf(34,-20)+leaf(28,-100)+'</g><g transform="translate(-6 -12)">'+rose(18,{rot:10})+'</g><g transform="translate(18 -20)">'+rose(14,{rot:40})+'</g><g transform="translate(6 4)">'+rose(13,{rot:80})+'</g></g>';
  s+='<g transform="translate(346 414)"><g>'+leaf(30,-20)+leaf(32,-160)+leaf(26,-90)+'</g><g transform="translate(6 -14)">'+rose(17,{rot:30})+'</g><g transform="translate(-14 -22)">'+rose(13,{rot:70})+'</g><g transform="translate(-4 4)">'+rose(12,{rot:0})+'</g></g>';
  return s;
}

window.Art={rose:rose,leaf:leaf,cluster:cluster,bouquet:bouquet,clockSVG:clockSVG,sealSVG:sealSVG,coupleScene:coupleScene,heart:heart,rng:rng};
})();
