// ═══════════════════════════════════════════════
// game.js — Game engine, rendering, tap handling
// ═══════════════════════════════════════════════
(function(){
  var SH=window.SH;
  var canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
  var scoreEl=document.getElementById('score'),splashEl=document.getElementById('splash');
  var activeFam=[],babyName='',W,H,dpr;

  function resize(){dpr=window.devicePixelRatio||1;W=window.innerWidth;H=window.innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0);}
  resize();window.addEventListener('resize',resize);

  var TARGET=5,bubbles=[],score=0,nextId=0,started=false,pops=[],floatingNames=[];
  var streak=0,lastPopTime=0,celebrations=[],stars=[],screenFlash=0;
  var MILESTONES=[5,10,15,25,50,75,100];
  var COMBO_WORDS=['','','Nice!','Awesome!','Amazing!','Super!','WOW!','Incredible!','UNSTOPPABLE!'];
  var MILESTONE_MESSAGES={5:'High five!',10:'Super star!',15:'Keep going!',25:'Champion!',50:'Wow, 50!',75:'Legendary!',100:'MASTER!'};

  function rng(a,b){return a+Math.random()*(b-a);}
  function isLightColor(hex){var r=parseInt(hex.substr(1,2),16),g=parseInt(hex.substr(3,2),16),b=parseInt(hex.substr(5,2),16);return(r*0.299+g*0.587+b*0.114)>160;}

  function spawn(){
    var r=rng(44,72),fam=activeFam[Math.floor(Math.random()*activeFam.length)];
    var edge=Math.floor(Math.random()*4),x,y;
    if(edge===0){x=rng(0,W);y=-r*2;}else if(edge===1){x=W+r*2;y=rng(0,H);}else if(edge===2){x=rng(0,W);y=H+r*2;}else{x=-r*2;y=rng(0,H);}
    var tx=W/2+rng(-W*0.2,W*0.2),ty=H/2+rng(-H*0.2,H*0.2),dx=tx-x,dy=ty-y,dist=Math.sqrt(dx*dx+dy*dy),speed=rng(45,90);
    bubbles.push({id:nextId++,x:x,y:y,vx:(dx/dist)*speed,vy:(dy/dist)*speed,r:r,fam:fam,popping:false,popProg:0,origR:r,wobbleAmp:rng(8,20),wobbleFreq:rng(1.5,3),wobblePhase:rng(0,Math.PI*2),age:0});
  }

  function addFloatingName(x,y,name){floatingNames.push({x:x,y:y,name:name,life:1,vy:-60});}
  function addRewardStars(x,y,count,color){for(var i=0;i<count;i++){var angle=rng(0,Math.PI*2),speed=rng(60,180);stars.push({x:x,y:y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-80,size:rng(8,18),rotation:rng(0,Math.PI*2),spin:rng(-5,5),life:1,color:color||'#FECA57'});}}
  function addCelebration(text,subtext){celebrations.push({text:text,subtext:subtext||'',life:1,scale:0});screenFlash=0.3;}
  function drawStar(ctx,cx,cy,r,rotation){ctx.save();ctx.translate(cx,cy);ctx.rotate(rotation);ctx.beginPath();for(var i=0;i<5;i++){var a=(i*4*Math.PI/5)-Math.PI/2;if(i===0)ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);else ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}ctx.closePath();ctx.fill();ctx.restore();}
  function hitTest(px,py){for(var i=bubbles.length-1;i>=0;i--){var b=bubbles[i];if(b.popping)continue;var dx=px-b.x,dy=py-b.y;if(Math.sqrt(dx*dx+dy*dy)<=b.r*1.1)return b;}return null;}

  function handleTap(e){
    e.preventDefault();SH.initAudio();
    var cx,cy;if(e.touches){cx=e.touches[0].clientX;cy=e.touches[0].clientY;}else{cx=e.clientX;cy=e.clientY;}
    if(!started){started=true;splashEl.style.opacity='0';}
    var b=hitTest(cx,cy);
    if(b){
      b.popping=true;b.popProg=0;score++;
      var now=Date.now();if(now-lastPopTime<1500)streak++;else streak=1;lastPopTime=now;
      SH.playPop(streak);

      var particleCount=Math.min(10+streak*2,25);
      for(var pi=0;pi<particleCount;pi++){var a=(Math.PI*2/particleCount)*pi+rng(-0.3,0.3),s=rng(80,220+streak*20);pops.push({x:b.x,y:b.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:rng(3,8+streak),life:1,color:b.fam.fill});}

      addFloatingName(b.x,b.y-b.r-10,b.fam.name);

      if(streak>=3){
        var word=COMBO_WORDS[Math.min(streak,COMBO_WORDS.length-1)];
        var comboText=babyName?(streak+'x '+word+' '+babyName+'!'):(streak+'x '+word);
        floatingNames.push({x:b.x,y:b.y+b.r+30,name:comboText,life:1.2,vy:-40,isCombo:true});
        addRewardStars(b.x,b.y,streak,b.fam.fill);
      }

      if(MILESTONES.indexOf(score)!==-1){
        var msg=MILESTONE_MESSAGES[score]||'Amazing!';
        var sub=score+' pops!';
        if(babyName)sub='Way to go '+babyName+'! '+sub;
        addCelebration(msg,sub);addRewardStars(W/2,H/2,20,'#FECA57');SH.playMilestone();
      }

      // Use per-member accent for TTS
      var memberAccent=b.fam.accent||'us';
      if(b.fam.sfx){SH.playSfx(b.fam.sfx);setTimeout(function(){SH.sayName(b.fam.name,b.fam.gender,memberAccent);},250);}
      else{SH.sayName(b.fam.name,b.fam.gender,memberAccent);}
    }
  }
  canvas.addEventListener('mousedown',handleTap);
  canvas.addEventListener('touchstart',handleTap,{passive:false});

  var bgTop=[232,248,245],bgBot=[253,235,208],last=0;

  function frame(ts){
    var dt=Math.min((ts-last)/1000,0.1);last=ts;
    var grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,'rgb('+bgTop+')');grad.addColorStop(1,'rgb('+bgBot+')');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);

    for(var i=0;i<bubbles.length;i++){var b=bubbles[i];b.age+=dt;if(b.popping){b.popProg+=dt/0.35;b.r=b.origR+b.popProg*40;}else{var w=Math.sin(b.age*b.wobbleFreq+b.wobblePhase)*b.wobbleAmp,px=-b.vy,py=b.vx,pl=Math.sqrt(px*px+py*py)||1;b.x+=b.vx*dt+(px/pl)*w*dt;b.y+=b.vy*dt+(py/pl)*w*dt;}}
    bubbles=bubbles.filter(function(b){if(b.popProg>=1)return false;if(!b.popping){var m=b.r*3;if(b.x<-m||b.x>W+m||b.y<-m||b.y>H+m)return false;}return true;});
    if(started){while(bubbles.length<TARGET)spawn();}else{while(bubbles.length<3)spawn();}

    for(var i=0;i<bubbles.length;i++){
      var b=bubbles[i],alpha=b.popping?Math.max(0,1-b.popProg):1;if(alpha<=0)continue;ctx.globalAlpha=alpha;
      ctx.beginPath();ctx.arc(b.x+2,b.y+3,b.r,0,Math.PI*2);ctx.fillStyle='rgba(0,0,0,0.06)';ctx.fill();
      ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fillStyle=b.fam.fill;ctx.fill();
      if(b.fam.img){ctx.save();ctx.beginPath();ctx.arc(b.x,b.y,b.r-2,0,Math.PI*2);ctx.clip();var sz=(b.r-2)*2;ctx.drawImage(b.fam.img,b.x-b.r+2,b.y-b.r+2,sz,sz);ctx.restore();ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.strokeStyle=b.fam.fill;ctx.lineWidth=4;ctx.stroke();
      }else if(b.fam.emoji){ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.strokeStyle='rgba(255,255,255,0.5)';ctx.lineWidth=2;ctx.stroke();var emojiSize=Math.round(b.origR*0.9);ctx.font=emojiSize+'px -apple-system, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(b.fam.emoji,b.x,b.y+2);
      }else{ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.strokeStyle='rgba(255,255,255,0.5)';ctx.lineWidth=2;ctx.stroke();}
      ctx.beginPath();ctx.arc(b.x-b.r*0.25,b.y-b.r*0.25,b.r*0.28,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fill();
      var fs=Math.max(12,Math.min(b.origR*0.36,18));ctx.font='600 '+fs+'px -apple-system, sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
      var nw=ctx.measureText(b.fam.name).width,px2=b.x-nw/2-6,py2=b.y+b.r+4,pw=nw+12,ph=fs+8,pr=ph/2;
      ctx.beginPath();ctx.moveTo(px2+pr,py2);ctx.lineTo(px2+pw-pr,py2);ctx.arc(px2+pw-pr,py2+pr,pr,-Math.PI/2,Math.PI/2);ctx.lineTo(px2+pr,py2+ph);ctx.arc(px2+pr,py2+pr,pr,Math.PI/2,-Math.PI/2);ctx.closePath();ctx.fillStyle=b.fam.fill;ctx.fill();
      ctx.fillStyle=isLightColor(b.fam.fill)?'#2C3E50':'#fff';ctx.fillText(b.fam.name,b.x,py2+4);ctx.globalAlpha=1;
    }

    for(var i=0;i<pops.length;i++){pops[i].x+=pops[i].vx*dt;pops[i].y+=pops[i].vy*dt;pops[i].vy+=300*dt;pops[i].life-=dt*2.5;}
    pops=pops.filter(function(p){return p.life>0;});
    for(var i=0;i<pops.length;i++){var p=pops[i];ctx.globalAlpha=Math.max(0,p.life);ctx.beginPath();ctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2);ctx.fillStyle=p.color;ctx.fill();}

    for(var i=0;i<stars.length;i++){var s=stars[i];s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=200*dt;s.rotation+=s.spin*dt;s.life-=dt*1.5;}
    stars=stars.filter(function(s){return s.life>0;});
    for(var i=0;i<stars.length;i++){var s=stars[i];ctx.globalAlpha=Math.max(0,s.life);ctx.fillStyle=s.color;drawStar(ctx,s.x,s.y,s.size*s.life,s.rotation);}

    for(var i=0;i<floatingNames.length;i++){floatingNames[i].y+=floatingNames[i].vy*dt;floatingNames[i].life-=dt*1.2;}
    floatingNames=floatingNames.filter(function(f){return f.life>0;});
    for(var i=0;i<floatingNames.length;i++){var f=floatingNames[i];ctx.globalAlpha=Math.max(0,f.life);if(f.isCombo){var cs=1+(1-f.life)*0.3;ctx.font='800 '+Math.round(22*cs)+'px -apple-system, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#FF6B6B';ctx.fillText(f.name,f.x+1,f.y+1);ctx.fillStyle='#FECA57';ctx.fillText(f.name,f.x,f.y);}else{ctx.font='600 28px -apple-system, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#2C3E50';ctx.fillText(f.name,f.x,f.y);}}

    for(var i=0;i<celebrations.length;i++){var c=celebrations[i];c.life-=dt*0.6;if(c.scale<1)c.scale=Math.min(1,c.scale+dt*5);}
    celebrations=celebrations.filter(function(c){return c.life>0;});
    for(var i=0;i<celebrations.length;i++){var c=celebrations[i],a2=c.life>0.3?1:c.life/0.3,scale=c.scale*(1+Math.sin(c.life*8)*0.05);ctx.globalAlpha=a2;ctx.save();ctx.translate(W/2,H/2-20);ctx.scale(scale,scale);ctx.font='800 52px -apple-system, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='rgba(0,0,0,0.15)';ctx.fillText(c.text,2,2);ctx.fillStyle='#FF6B6B';ctx.fillText(c.text,0,0);if(c.subtext){ctx.font='600 24px -apple-system, sans-serif';ctx.fillStyle='#2C3E50';ctx.fillText(c.subtext,0,44);}ctx.restore();}

    if(screenFlash>0){ctx.globalAlpha=screenFlash;ctx.fillStyle='#FECA57';ctx.fillRect(0,0,W,H);screenFlash-=dt*1.5;if(screenFlash<0)screenFlash=0;}
    if(streak>=2&&Date.now()-lastPopTime<1500){ctx.globalAlpha=0.9;ctx.font='700 18px -apple-system, sans-serif';ctx.textAlign='right';ctx.textBaseline='top';ctx.fillStyle='#FF6B6B';ctx.fillText(streak+'x streak',W-16,20);}

    ctx.globalAlpha=1;scoreEl.textContent='\u2B50 '+score;requestAnimationFrame(frame);
  }

  SH.launchGame=function(fam,accent,settings){
    activeFam=fam;
    babyName=(settings&&settings.babyName)||'';
    TARGET=(settings&&settings.bubbleCount)||5;
    var defaultMusic=(settings&&typeof settings.defaultMusic==='number')?settings.defaultMusic:3;
    scoreEl.className='';splashEl.className='';splashEl.style.opacity='1';
    document.getElementById('musicBtn').className='';
    resize();
    SH.playIntroJingle(function(){if(defaultMusic>0)window._setMusic(defaultMusic);});
    requestAnimationFrame(frame);
  };
})();
