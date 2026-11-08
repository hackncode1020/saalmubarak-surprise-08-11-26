/* app.js - flow, personalisation, countdown, letter, promises, gift */
(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s);};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
var state={name:'',stage:'intro',timers:[],cd:false,nyShown:false,letterOpen:false,giftOpen:false};
var NY_YEAR=2026;
var LETTER=[
  "My Love \u2764\uFE0F,",
  "Another year is beginning, and there is only one wish in my heart.",
  "I don't just want to celebrate this Nutan Varsh with you. I want to celebrate every Nutan Varsh of my life with you.",
  "I wish that for every year I live, I get to stand beside you, hold your hand, see your smile and welcome every new beginning with you.",
  "I don't know what the future holds, but I know one thing: I want you to be a part of every beautiful tomorrow.",
  "May we create countless memories, overcome every difficulty together, laugh together and keep choosing each other, year after year.",
  "You are not just a part of my life. You are one of the most beautiful reasons I love living it.",
  "Happy Nutan Varsh, My Love! \u2764\uFE0F"
];
var PROMISES=[
  "I want to celebrate every Nutan Varsh with you.",
  "I want to make beautiful memories with you.",
  "I want to see you smile every single day.",
  "I want to stand beside you through every chapter of life.",
  "I want us to grow together, year after year."
];
function later(fn,ms){var id=setTimeout(fn,ms);state.timers.push(id);return id;}
function clearTimers(){state.timers.forEach(clearTimeout);state.timers=[];}
function show(el){el.hidden=false;}
function hide(el){el.hidden=true;}

/* ---------- static art ---------- */
function buildArt(){
  $('#rosesL').innerHTML=Art.cluster(220,200,5);
  $('#rosesR').innerHTML=Art.cluster(220,200,9);
  $('#coupleSvg').innerHTML=Art.coupleScene();
  $('#clockWrap').innerHTML=Art.clockSVG();
  $('#seal').innerHTML=Art.sealSVG();
  $('#ghPath').innerHTML=Art.heart();
  $('#bouquet svg').innerHTML=Art.bouquet();
  var p=$('#paper');
  LETTER.forEach(function(t,i){var el=document.createElement('p');el.style.setProperty('--i',i);el.textContent=t;p.appendChild(el);});
  var ul=$('#promiseList');
  PROMISES.forEach(function(t){var li=document.createElement('li');li.textContent=t;ul.appendChild(li);});
  /* entrance animation on direct children (except those with their own choreography) */
  $$('.stage').forEach(function(st){
    if(st.id==='s-intro')return;
    var kids=$$('.inner > *',st).filter(function(k){return !k.matches('#envBlock,#paper,#loveCard,#promiseList,#promiseFinal,.nameshow,.fl,#giftTitle,.giftstage');});
    kids.forEach(function(k,i){k.classList.add('rise');k.style.setProperty('--d',(0.15+i*0.13)+'s');});
  });
}
function personalise(){
  var n=state.name;
  $$('.nm').forEach(function(el){el.textContent=n;});
  $('#letterFor').textContent='For '+n;
  $('#promiseFor').textContent='For '+n;
  $('#cardFor').textContent='For '+n;
}

/* ---------- navigation ---------- */
var enter={};
function go(id){
  var cur=$('.stage.on');
  if(cur&&cur.dataset.stage===id)return;
  clearTimers();FX.clearAll();FX.petals(0);FX.hearts(0);
  document.body.classList.remove('fx-front');FX.scene(false);
  state.cd=false;
  if(cur)cur.classList.remove('on');
  var to=$('#s-'+id);
  $('.scroll',to).scrollTop=0;
  to.classList.add('on');
  state.stage=id;
  if(enter[id])enter[id]();
}
function nav(btn,id,sfx){btn.addEventListener('click',function(){if(sfx)Sound[sfx]&&Sound[sfx]();go(id);});}

/* ---------- 1 intro ---------- */
enter.intro=function(){
  resetLetter();resetGift();resetPromise();resetFinal();
  $('#s-name').classList.remove('revealing');
  $('#btnUnlock').disabled=false;
  FX.setRegion(.08,.4);
};
$('#btnEnter').addEventListener('click',function(){Sound.chime();go('name');});
$('#btnSound').addEventListener('click',function(){
  Sound.ensure();Sound.setMuted(false);Sound.playMusic();Sound.chime();
  $('#btnSound').innerHTML='<span class="note">\u266A</span> Piano is playing';
});

/* ---------- 2 name ---------- */
enter.name=function(){
  var inp=$('#nameInput');
  later(function(){try{inp.focus({preventScroll:true});}catch(e){}},1000);
};
$('#nameForm').addEventListener('submit',function(e){
  e.preventDefault();
  var v=$('#nameInput').value.replace(/\s+/g,' ').trim();
  var hint=$('#nameHint'),field=$('.field');
  if(!v){
    hint.textContent='Please tell me your name first \u2764\uFE0F';
    field.classList.remove('shake');void field.offsetWidth;field.classList.add('shake');
    $('#nameInput').focus();return;
  }
  hint.textContent='';
  $('#btnUnlock').disabled=true;
  $('#nameInput').blur();
  state.name=v;personalise();
  $('#bigName').textContent=v;
  $('#s-name').classList.add('revealing');
  $('.scroll',$('#s-name')).scrollTop=0;
  Sound.chime();
  FX.setRegion(.1,.5);
  var types=['peony','heart','ring','peony','willow','heart'],pals=['gold','rose','champ','pink','gold','gold'];
  types.forEach(function(t,i){later(function(){FX.launch({type:t,pal:pals[i],fast:true});},250+i*520);});
  later(function(){$('#nameSub').textContent='Your surprise is unlocked \u2764\uFE0F';Sound.sparkle();},1800);
  later(function(){go('count');},5200);
});

/* ---------- 3 countdown ---------- */
function pad(n){return (n<10?'0':'')+n;}
function targetMs(){return new Date(NY_YEAR,10,10,0,0,0,0).getTime();}
var last={d:'',h:'',m:'',s:''};
function setDigit(id,v){var el=$(id);if(last[id]!==v){el.textContent=v;last[id]=v;el.classList.remove('tick');void el.offsetWidth;el.classList.add('tick');}}
function celebrateNewYear(live){
  var st=$('#s-count');
  if(st.classList.contains('done'))return;
  st.classList.add('done');
  $('#cdNote').hidden=true;
  show($('#welcome'));
  $('#welcomeSub').textContent='Saal Mubarak, '+state.name+' \u2764\uFE0F';
  if(live)Sound.celebrate();
  FX.stopAuto();FX.setRegion(.08,.5);
  FX.grand();
  later(function(){FX.auto(1800);},13000);
}
function clockLoop(){
  if(!state.cd)return;
  var now=new Date(),ms=now.getMilliseconds(),s=now.getSeconds()+ms/1000,m=now.getMinutes()+s/60,h=(now.getHours()%12)+m/60;
  var sh=$('#sHand'),mh=$('#mHand'),hh=$('#hHand'),arc=$('#secArc');
  if(sh){sh.setAttribute('transform','rotate('+(s*6)+' 100 100)');mh.setAttribute('transform','rotate('+(m*6)+' 100 100)');hh.setAttribute('transform','rotate('+(h*30)+' 100 100)');arc.setAttribute('stroke-dashoffset',(552.9*(1-s/60)).toFixed(1));}
  var diff=targetMs()-Date.now();
  if(diff<=0){
    if(!state.nyShown){state.nyShown=true;celebrateNewYear(state.cdLive);}
  }else{
    var t=Math.floor(diff/1000),d=Math.floor(t/86400),hr=Math.floor(t%86400/3600),mi=Math.floor(t%3600/60),se=t%60;
    setDigit('#cdD',pad(d));setDigit('#cdH',pad(hr));setDigit('#cdM',pad(mi));setDigit('#cdS',pad(se));
    if(t<=10&&last.t!==t){last.t=t;Sound.tick();}
    state.cdLive=true;
  }
  requestAnimationFrame(clockLoop);
}
enter.count=function(){
  var st=$('#s-count');
  st.classList.remove('done');hide($('#welcome'));$('#cdNote').hidden=false;
  state.nyShown=false;state.cdLive=false;last={d:'',h:'',m:'',s:''};
  var tz='';try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'';}catch(e){}
  $('#cdNote').textContent='Counting down to 10 November '+NY_YEAR+', 00:00'+(tz?' ('+tz.replace(/_/g,' ')+')':'')+', in your own time zone';
  state.cd=true;
  FX.setRegion(.06,.3);
  if(targetMs()-Date.now()<=0){
    state.nyShown=true;celebrateNewYear(false);
  }else{
    FX.auto(4200,['peony','ring','willow']);
  }
  requestAnimationFrame(clockLoop);
};
nav($('#btnToFire'),'fire');

/* ---------- 4 fireworks ---------- */
enter.fire=function(){
  FX.setRegion(.07,.5);FX.auto(2400);
  hide($('#btnToCouple'));
  later(function(){show($('#btnToCouple'));},9000);
};
$('#btnCelebrate').addEventListener('click',function(){
  FX.stopAuto();
  Sound.celebrate();
  FX.setRegion(.08,.55);
  FX.grand(function(){FX.auto(2400);});
  show($('#btnToCouple'));
});
nav($('#btnToCouple'),'couple');
['#s-fire','#s-final'].forEach(function(sel){
  $(sel).addEventListener('pointerdown',function(e){
    if(e.target.closest('button'))return;
    FX.burstAt(e.clientX,e.clientY);
  });
});

/* ---------- 5 couple ---------- */
enter.couple=function(){
  document.body.classList.add('fx-front');FX.scene(true);
  FX.setRegion(.05,.3);FX.auto(2300);FX.petals(9);
  Sound.sparkle();
};
nav($('#btnToLetter'),'letter');

/* ---------- 6 letter ---------- */
function resetLetter(){
  state.letterOpen=false;
  $('#envelope').classList.remove('open');
  $('#envBlock').classList.remove('gone');
  $('#paper').hidden=true;$('#paper').classList.remove('show');
  show($('#btnOpenLetter'));hide($('#btnToPromise'));
}
enter.letter=function(){resetLetter();FX.petals(8);FX.setRegion(.08,.3);};
$('#btnOpenLetter').addEventListener('click',function(){
  if(state.letterOpen)return;state.letterOpen=true;
  hide($('#btnOpenLetter'));
  Sound.seal();
  $('#envelope').classList.add('open');
  later(function(){
    $('#envBlock').classList.add('gone');
    var p=$('#paper');p.hidden=false;void p.offsetWidth;p.classList.add('show');
    Sound.whooshOpen();
    var sc=$('#letterScroll');
    $$('p',p).forEach(function(el,i){
      later(function(){
        var r=el.getBoundingClientRect();
        if(r.bottom>window.innerHeight-90)sc.scrollTo({top:sc.scrollTop+(r.bottom-window.innerHeight+130),behavior:'smooth'});
        if(i>0)Sound.tick&&0;
      },600+i*1050+500);
    });
    later(function(){show($('#btnToPromise'));sc.scrollTo({top:sc.scrollHeight,behavior:'smooth'});},600+LETTER.length*1050+900);
  },1250);
});
nav($('#btnToPromise'),'promise');

/* ---------- 7 promise ---------- */
function resetPromise(){
  $$('#promiseList li').forEach(function(li){li.classList.remove('in','old');});
  $('#promiseFinal').classList.remove('in');hide($('#btnToGift'));
}
enter.promise=function(){
  resetPromise();FX.hearts(6);FX.petals(4);
  var lis=$$('#promiseList li');
  lis.forEach(function(li,i){
    later(function(){
      if(i>0)lis[i-1].classList.add('old');
      li.classList.add('in');Sound.sparkle();
      var sc=$('.scroll',$('#s-promise'));var r=li.getBoundingClientRect();
      if(r.bottom>window.innerHeight-70)sc.scrollTo({top:sc.scrollTop+(r.bottom-window.innerHeight+110),behavior:'smooth'});
    },1500+i*2300);
  });
  var tEnd=1500+lis.length*2300+300;
  later(function(){
    lis[lis.length-1].classList.add('old');
    $('#promiseFinal').classList.add('in');Sound.chime();
    FX.setRegion(.05,.25);FX.launch({type:'heart',pal:'gold',fast:true});
    var sc=$('.scroll',$('#s-promise'));sc.scrollTo({top:sc.scrollHeight,behavior:'smooth'});
  },tEnd);
  later(function(){show($('#btnToGift'));var sc=$('.scroll',$('#s-promise'));sc.scrollTo({top:sc.scrollHeight,behavior:'smooth'});},tEnd+2600);
};
nav($('#btnToGift'),'gift');

/* ---------- 8 gift ---------- */
function resetGift(){
  state.giftOpen=false;
  var g=$('#gift3d');g.classList.remove('opened');
  $('#burst').classList.remove('on');
  $('#bouquet').classList.remove('show','float');
  $('#giftStage').classList.remove('after');
  hide($('#loveCard'));$('#loveCard').classList.remove('show');
  show($('#btnOpenGift'));hide($('#btnToFinal'));
}
enter.gift=function(){resetGift();FX.petals(5);};
$('#btnOpenGift').addEventListener('click',function(){
  if(state.giftOpen)return;state.giftOpen=true;
  hide($('#btnOpenGift'));
  Sound.whooshOpen();
  $('#gift3d').classList.add('opened');
  $('#burst').classList.add('on');
  FX.petals(26);FX.hearts(12);
  later(function(){$('#giftStage').classList.add('after');$('#bouquet').classList.add('show');Sound.chime();},1400);
  later(function(){$('#bouquet').classList.remove('show');$('#bouquet').classList.add('float');},3700);
  later(function(){
    var c=$('#loveCard');show(c);void c.offsetWidth;c.classList.add('show');Sound.sparkle();
    var sc=$('.scroll',$('#s-gift'));sc.scrollTo({top:sc.scrollHeight,behavior:'smooth'});
  },4000);
  later(function(){show($('#btnToFinal'));var sc=$('.scroll',$('#s-gift'));sc.scrollTo({top:sc.scrollHeight,behavior:'smooth'});},6000);
});
nav($('#btnToFinal'),'final');

/* ---------- 9 final ---------- */
function resetFinal(){
  $$('.fl',$('#s-final')).forEach(function(el){el.classList.remove('in');});
}
enter.final=function(){
  resetFinal();
  FX.setRegion(.06,.55);FX.petals(14);FX.hearts(9);
  Sound.celebrate();
  FX.grand(function(){FX.auto(1500);});
  var ids=['#f1','#f2','#f3','#f4','#f5','#f6','#btnReplay'],at=[900,3300,5700,8600,11400,14000,16500];
  var sc=$('.scroll',$('#s-final'));
  ids.forEach(function(id,i){later(function(){
    var el=$(id);el.classList.add('in');
    var r=el.getBoundingClientRect();
    if(r.bottom>window.innerHeight-40)sc.scrollTo({top:sc.scrollTop+(r.bottom-window.innerHeight+90),behavior:'smooth'});
  },at[i]);});
};
$('#btnReplay').addEventListener('click',function(){go('intro');});

/* ---------- sound controls ---------- */
FX.hooks.launch=function(){Sound.launch();};
FX.hooks.boom=function(s){Sound.boom(s);};
FX.hooks.crackle=function(){Sound.crackle(.6);};
var bm=$('#btnMusic'),bmu=$('#btnMute');
function syncAudio(){
  var s=Sound.state();
  $('#icPlay').style.display=s.music?'none':'';$('#icPause').style.display=s.music?'':'none';
  bm.setAttribute('aria-label',s.music?'Pause music':'Play music');bm.classList.toggle('active',s.music);
  $('#icOn').style.display=s.muted?'none':'';$('#icOff').style.display=s.muted?'':'none';
  bmu.setAttribute('aria-label',s.muted?'Unmute sound':'Mute sound');
}
Sound.onChange(syncAudio);
bm.addEventListener('click',function(){Sound.ensure();if(Sound.state().muted)Sound.setMuted(false);Sound.toggleMusic();});
bmu.addEventListener('click',function(){Sound.toggleMute();});
syncAudio();

buildArt();
})();
