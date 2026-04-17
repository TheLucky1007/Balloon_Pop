// ═══════════════════════════════════════════════
// ad.js — Cornhole 2: Cornhole in Space ad screen
// with family/theme bubbles spiraling into black hole
// ═══════════════════════════════════════════════
(function(){
  var SH=window.SH,adScreen=document.getElementById('adScreen'),adSkipBtn=document.getElementById('adSkip'),adTimerSpan=document.getElementById('adTimer'),adShown=false,adAnimFrame=null;

  // activeFam gets set when startGame is called
  var adFam=[];

  function generateAdScene(){
    var c=document.getElementById('adCanvas');if(!c)return;
    var dpr=window.devicePixelRatio||1,w=window.innerWidth,h=window.innerHeight;
    c.width=w*dpr;c.height=h*dpr;c.style.width=w+'px';c.style.height=h+'px';
    var ctx=c.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);

    // Stars
    var starList=[];
    for(var i=0;i<200;i++) starList.push({x:Math.random()*w,y:Math.random()*h,size:0.5+Math.random()*2,bright:0.3+Math.random()*0.7,twinkleSpeed:1+Math.random()*3});

    // Galaxies
    var galaxies=[];
    for(var g=0;g<4;g++) galaxies.push({x:w*0.15+Math.random()*w*0.7,y:h*0.1+Math.random()*h*0.4,size:15+Math.random()*30,angle:Math.random()*Math.PI,hue:Math.floor(Math.random()*60)+200});

    // Black hole — smaller event horizon, bigger accretion disk
    var bhX=w*0.3,bhY=h*0.35;
    var bhR=Math.min(w,h)*0.045; // smaller black hole
    var diskR=Math.min(w,h)*0.22; // bigger accretion disk

    // Cornhole board
    var boardX=w*0.55,boardY=h*0.45,boardW=60,boardH=110;

    // Bean bags
    var bags=[
      {x:w*0.2,y:h*0.3,color:'#e74c3c',angle:0,speed:0.8,bobAmp:15},
      {x:w*0.75,y:h*0.25,color:'#3498db',angle:1.2,speed:1.1,bobAmp:12},
      {x:w*0.35,y:h*0.55,color:'#f1c40f',angle:2.4,speed:0.6,bobAmp:18},
    ];

    // ── Floating family/theme items that get sucked in ──
    var floaters=[];
    var spawnTimer=0;
    var maxFloaters=12;

    function spawnFloater(){
      if(adFam.length===0) return;
      var fam=adFam[Math.floor(Math.random()*adFam.length)];
      // Spawn from random edge
      var edge=Math.floor(Math.random()*4),x,y;
      if(edge===0){x=Math.random()*w;y=-40;}
      else if(edge===1){x=w+40;y=Math.random()*h;}
      else if(edge===2){x=Math.random()*w;y=h+40;}
      else{x=-40;y=Math.random()*h;}

      var r=20+Math.random()*18;
      // Initial angle relative to black hole for orbital motion
      var dx=x-bhX,dy=y-bhY;
      var dist=Math.sqrt(dx*dx+dy*dy);
      var baseAngle=Math.atan2(dy,dx);

      floaters.push({
        x:x, y:y, r:r, fam:fam,
        // Orbital properties
        orbitAngle:baseAngle,
        orbitDist:dist,
        orbitSpeed:0.15+Math.random()*0.2, // radians/sec — gentle spiral
        pullSpeed:18+Math.random()*12, // how fast it moves inward per second
        rotation:Math.random()*Math.PI*2,
        spin:1+Math.random()*3,
        alpha:1,
        dead:false
      });
    }

    var startTime=Date.now();
    var lastT=0;

    function drawFrame(){
      var t=(Date.now()-startTime)/1000;
      var dt=Math.min(t-lastT,0.1);
      lastT=t;

      // ── Background ──
      var bg=ctx.createRadialGradient(w*0.3,h*0.35,0,w*0.5,h*0.5,w*0.8);
      bg.addColorStop(0,'#0a0512');bg.addColorStop(0.4,'#080a1a');bg.addColorStop(1,'#020208');
      ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);

      // Nebulae
      ctx.globalAlpha=0.06;
      var neb=ctx.createRadialGradient(w*0.7,h*0.2,0,w*0.7,h*0.2,w*0.4);
      neb.addColorStop(0,'#4a2080');neb.addColorStop(0.5,'#1a0840');neb.addColorStop(1,'transparent');
      ctx.fillStyle=neb;ctx.fillRect(0,0,w,h);
      var neb2=ctx.createRadialGradient(w*0.2,h*0.7,0,w*0.2,h*0.7,w*0.3);
      neb2.addColorStop(0,'#203060');neb2.addColorStop(1,'transparent');
      ctx.fillStyle=neb2;ctx.fillRect(0,0,w,h);
      ctx.globalAlpha=1;

      // Stars
      for(var i=0;i<starList.length;i++){
        var s=starList[i],bright=s.bright*(0.6+0.4*Math.sin(t*s.twinkleSpeed+i));
        ctx.globalAlpha=bright;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x,s.y,s.size,0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha=1;

      // Galaxies
      for(var g=0;g<galaxies.length;g++){
        var gal=galaxies[g];ctx.save();ctx.translate(gal.x,gal.y);ctx.rotate(gal.angle+t*0.02);
        var gg=ctx.createRadialGradient(0,0,0,0,0,gal.size);
        gg.addColorStop(0,'hsla('+gal.hue+',60%,70%,0.15)');gg.addColorStop(0.5,'hsla('+gal.hue+',50%,50%,0.06)');gg.addColorStop(1,'transparent');
        ctx.fillStyle=gg;ctx.scale(1,0.5);ctx.beginPath();ctx.arc(0,0,gal.size,0,Math.PI*2);ctx.fill();ctx.restore();
      }

      // ── Black hole + accretion disk ──
      ctx.save();ctx.translate(bhX,bhY);

      // Back accretion disk (bigger, more rings)
      for(var ring=8;ring>=0;ring--){
        var rr=bhR*2+ring*(diskR-bhR*2)/8;
        ctx.save();ctx.rotate(t*0.3+ring*0.15);ctx.scale(1,0.35);
        ctx.globalAlpha=0.12-ring*0.012;
        var dg=ctx.createRadialGradient(0,0,rr*0.4,0,0,rr);
        var hue=20+ring*12;
        dg.addColorStop(0,'hsla('+hue+',100%,70%,0.8)');
        dg.addColorStop(0.5,'hsla('+(hue-10)+',90%,50%,0.5)');
        dg.addColorStop(1,'transparent');
        ctx.fillStyle=dg;ctx.beginPath();ctx.arc(0,0,rr,0,Math.PI*2);ctx.fill();
        ctx.restore();
      }

      // Event horizon (small)
      ctx.globalAlpha=1;ctx.beginPath();ctx.arc(0,0,bhR,0,Math.PI*2);ctx.fillStyle='#000';ctx.fill();

      // Glow ring
      ctx.globalAlpha=0.5;ctx.beginPath();ctx.arc(0,0,bhR*1.08,0,Math.PI*2);ctx.strokeStyle='#ff8040';ctx.lineWidth=2.5;ctx.stroke();
      ctx.globalAlpha=0.25;ctx.beginPath();ctx.arc(0,0,bhR*1.2,0,Math.PI*2);ctx.strokeStyle='#ffc060';ctx.lineWidth=1.5;ctx.stroke();

      // Front accretion disk
      for(var ring=3;ring>=0;ring--){
        var rr=bhR*2+ring*(diskR*0.6-bhR*2)/3;
        ctx.save();ctx.rotate(t*0.3+ring*0.15);ctx.scale(1,0.35);ctx.globalAlpha=0.08;
        var dg2=ctx.createRadialGradient(0,0,rr*0.5,0,0,rr);
        dg2.addColorStop(0,'hsla(40,100%,65%,0.6)');dg2.addColorStop(1,'transparent');
        ctx.fillStyle=dg2;ctx.beginPath();ctx.arc(0,0,rr,Math.PI,Math.PI*2);ctx.fill();
        ctx.restore();
      }
      ctx.restore();ctx.globalAlpha=1;

      // ── Floating family/theme items ──
      // Spawn new ones
      spawnTimer+=dt;
      if(spawnTimer>0.8 && floaters.length<maxFloaters){
        spawnFloater();
        spawnTimer=0;
      }

      // Update & draw floaters
      for(var i=0;i<floaters.length;i++){
        var fl=floaters[i];
        if(fl.dead) continue;

        // Spiral inward: decrease orbit distance, rotate around black hole
        // Acceleration: pull faster as it gets closer
        var closeness=Math.max(0,1-fl.orbitDist/(Math.max(w,h)*0.7));
        var accel=1+closeness*closeness*4; // quadratic acceleration near hole
        fl.orbitDist-=fl.pullSpeed*accel*dt;
        fl.orbitSpeed+=closeness*0.3*dt; // spin faster as closer
        fl.orbitAngle+=fl.orbitSpeed*dt;
        fl.rotation+=fl.spin*dt;

        // Position from orbit
        fl.x=bhX+Math.cos(fl.orbitAngle)*fl.orbitDist;
        fl.y=bhY+Math.sin(fl.orbitAngle)*fl.orbitDist*0.6; // flatten orbit slightly

        // Shrink as approaching event horizon
        var shrinkStart=bhR*5;
        if(fl.orbitDist<shrinkStart){
          var shrinkFactor=Math.max(0,fl.orbitDist/shrinkStart);
          fl.r=fl.r*0.98; // gradually shrink
          fl.alpha=shrinkFactor;
        }

        // Dead when inside black hole
        if(fl.orbitDist<bhR*0.8){
          fl.dead=true;
          continue;
        }

        // Draw the floater
        ctx.globalAlpha=fl.alpha*0.85;
        ctx.save();
        ctx.translate(fl.x,fl.y);
        ctx.rotate(fl.rotation);

        if(fl.fam.img){
          // Photo bubble
          ctx.beginPath();ctx.arc(0,0,fl.r,0,Math.PI*2);ctx.fillStyle=fl.fam.fill;ctx.fill();
          ctx.save();ctx.beginPath();ctx.arc(0,0,fl.r-1,0,Math.PI*2);ctx.clip();
          ctx.drawImage(fl.fam.img,-fl.r+1,-fl.r+1,(fl.r-1)*2,(fl.r-1)*2);
          ctx.restore();
          ctx.beginPath();ctx.arc(0,0,fl.r,0,Math.PI*2);ctx.strokeStyle=fl.fam.fill;ctx.lineWidth=2;ctx.stroke();
        } else if(fl.fam.emoji){
          // Emoji bubble
          ctx.beginPath();ctx.arc(0,0,fl.r,0,Math.PI*2);ctx.fillStyle=fl.fam.fill;ctx.fill();
          ctx.beginPath();ctx.arc(0,0,fl.r,0,Math.PI*2);ctx.strokeStyle='rgba(255,255,255,0.4)';ctx.lineWidth=1.5;ctx.stroke();
          var eSize=Math.round(fl.r*1.1);
          ctx.font=eSize+'px -apple-system, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
          ctx.fillText(fl.fam.emoji,0,2);
        } else {
          // Color bubble with name
          ctx.beginPath();ctx.arc(0,0,fl.r,0,Math.PI*2);ctx.fillStyle=fl.fam.fill;ctx.fill();
          ctx.beginPath();ctx.arc(0,0,fl.r,0,Math.PI*2);ctx.strokeStyle='rgba(255,255,255,0.4)';ctx.lineWidth=1.5;ctx.stroke();
          // Highlight
          ctx.beginPath();ctx.arc(-fl.r*0.2,-fl.r*0.2,fl.r*0.25,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fill();
          // Name
          var fs2=Math.max(8,Math.min(fl.r*0.5,14));
          ctx.font='600 '+fs2+'px -apple-system, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
          ctx.fillStyle='#fff';ctx.fillText(fl.fam.name,0,0);
        }

        ctx.restore();
        ctx.globalAlpha=1;
      }

      // Remove dead floaters
      floaters=floaters.filter(function(fl){return !fl.dead;});

      // ── Cornhole board ──
      ctx.save();ctx.translate(boardX,boardY);ctx.rotate(Math.sin(t*0.4)*0.08);
      var bobY2=Math.sin(t*0.7)*8;ctx.translate(0,bobY2);
      ctx.globalAlpha=0.15;ctx.fillStyle='#ff9040';ctx.beginPath();ctx.ellipse(0,boardH*0.55,boardW*0.7,12,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
      ctx.save();ctx.transform(1,0,-0.15,1,0,0);
      var bGrad=ctx.createLinearGradient(-boardW/2,-boardH/2,-boardW/2,boardH/2);
      bGrad.addColorStop(0,'#c4873b');bGrad.addColorStop(0.5,'#a06c2e');bGrad.addColorStop(1,'#8b5e28');
      ctx.fillStyle=bGrad;ctx.beginPath();ctx.roundRect(-boardW/2,-boardH/2,boardW,boardH,4);ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,0.08)';ctx.lineWidth=1;
      for(var l=0;l<6;l++){var lx=-boardW/2+8+l*9;ctx.beginPath();ctx.moveTo(lx,-boardH/2);ctx.lineTo(lx,boardH/2);ctx.stroke();}
      ctx.beginPath();ctx.arc(0,-boardH*0.2,14,0,Math.PI*2);ctx.fillStyle='#0a0a1a';ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,0.4)';ctx.lineWidth=2;ctx.stroke();
      ctx.globalAlpha=0.3;var hGlow=ctx.createRadialGradient(0,-boardH*0.2,4,0,-boardH*0.2,18);
      hGlow.addColorStop(0,'#4060ff');hGlow.addColorStop(1,'transparent');ctx.fillStyle=hGlow;
      ctx.beginPath();ctx.arc(0,-boardH*0.2,18,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
      ctx.restore();ctx.restore();

      // ── Bean bags ──
      for(var b=0;b<bags.length;b++){
        var bag=bags[b],bx=bag.x+Math.sin(t*bag.speed+bag.angle)*20,by=bag.y+Math.sin(t*bag.speed*0.7+bag.angle+1)*bag.bobAmp,bRot=t*0.5+bag.angle;
        ctx.save();ctx.translate(bx,by);ctx.rotate(bRot);ctx.fillStyle=bag.color;
        ctx.beginPath();ctx.roundRect(-10,-10,20,20,3);ctx.fill();
        ctx.strokeStyle='rgba(0,0,0,0.2)';ctx.lineWidth=1.5;ctx.stroke();
        ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=0.8;
        ctx.beginPath();ctx.moveTo(-6,0);ctx.lineTo(6,0);ctx.stroke();
        ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(0,6);ctx.stroke();
        ctx.restore();
      }

      adAnimFrame=requestAnimationFrame(drawFrame);
    }
    drawFrame();
  }

  function stopAdAnim(){if(adAnimFrame){cancelAnimationFrame(adAnimFrame);adAnimFrame=null;}}

  function showAd(onComplete){
    // Start space music for the ad
    SH.initAudio();
    window._setMusic(6); // 6 = Space

    generateAdScene();adScreen.className='';var timeLeft=30;adTimerSpan.textContent=timeLeft;
    adSkipBtn.style.opacity='0.5';adSkipBtn.style.pointerEvents='none';
    // Reset skip button text (in case of re-show)
    adSkipBtn.innerHTML='Skip <span id="adTimer">5</span>';
    var timerSpan=document.getElementById('adTimer');

    var countdown=setInterval(function(){
      timeLeft--;
      if(timeLeft<=0){clearInterval(countdown);timerSpan.textContent='';adSkipBtn.textContent='Skip ✕';adSkipBtn.style.opacity='1';adSkipBtn.style.pointerEvents='auto';}
      else{timerSpan.textContent=timeLeft;}
    },1000);

    function closeAd(){clearInterval(countdown);stopAdAnim();window._setMusic(0);adScreen.className='hidden';onComplete();}
    adSkipBtn.onclick=function(){if(timeLeft<=0)closeAd();};
    document.getElementById('adCta').onclick=function(){};
  }

  SH.startGame=function(activeFam,selectedAccent,settings){
    adFam=activeFam; // make available to ad scene
    if(!adShown){
      adShown=true;
      showAd(function(){SH.launchGame(activeFam,selectedAccent,settings);});
    } else {
      SH.launchGame(activeFam,selectedAccent,settings);
    }
  };
})();
