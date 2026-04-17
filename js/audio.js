// ═══════════════════════════════════════════════
// audio.js — TTS, pop SFX, theme SFX, background music
// ═══════════════════════════════════════════════
(function(){
  var SH = window.SH;
  var synth = window.speechSynthesis;
  var cachedVoices = [], voiceReady = false, audioCtx = null;

  function loadVoices(){ cachedVoices=synth.getVoices(); if(cachedVoices.length>0) voiceReady=true; }
  loadVoices();
  if(synth.onvoiceschanged!==undefined) synth.onvoiceschanged=loadVoices;
  setTimeout(loadVoices,500); setTimeout(loadVoices,2000);

  var femNames=['samantha','victoria','karen','fiona','tessa','moira','allison','nicky','ava','joana','sara','paulina','monica','lupe','kathy','serena','shelley','sandy','princess','female','woman','wavenet-c','wavenet-e','wavenet-f','wavenet-h','zira','hazel','susan','jenny','aria','elsa','elena','rosa','lucia','isabel','carmen','maria'];
  var mascNames=['daniel','aaron','arthur','gordon','oliver','lee','ralph','rishi','thomas','fred','male','man','wavenet-a','wavenet-b','wavenet-d','david','mark','richard','george','sean','jorge','juan','diego','carlos','pablo','pedro','enrique'];
  var premiumKeywords=['premium','enhanced','siri','google','neural','wavenet','natural','eloquence'];

  function pickVoice(langPrefix,gender){
    var vs=cachedVoices.filter(function(v){return v.lang.startsWith(langPrefix);});
    if(vs.length===0){vs=cachedVoices;if(vs.length===0)return null;}
    var targetNames=gender==='f'?femNames:mascNames;
    function scoreV(v){var lo=v.name.toLowerCase(),s=0;if(targetNames.some(function(k){return lo.indexOf(k)!==-1;}))s+=10;premiumKeywords.forEach(function(k){if(lo.indexOf(k)!==-1)s+=20;});if(v.localService)s+=5;if(v.name.length>20)s+=3;if(lo.indexOf('compact')!==-1)s-=15;if(lo.indexOf('basic')!==-1)s-=10;return s;}
    var scored=vs.map(function(v){return{voice:v,score:scoreV(v)};});scored.sort(function(a,b){return b.score-a.score;});return scored[0].voice;
  }

  var spanishWords=['abuel','tia','tio','primo','prima','mami','papi','nana','abuelo','abuela'];
  function isSpanishName(n){var lo=n.toLowerCase();return spanishWords.some(function(w){return lo.indexOf(w)!==-1;});}

  var iosKeepAlive=null;
  function startKeepAlive(){if(iosKeepAlive)return;if(!/iPad|iPhone|iPod/.test(navigator.userAgent))return;iosKeepAlive=setInterval(function(){synth.pause();synth.resume();},5000);}

  function sayName(name,gender,selectedAccent){
    startKeepAlive(); synth.cancel();
    var speak=function(){
      var utter=new SpeechSynthesisUtterance(name);
      var spanish=isSpanishName(name);
      var accentObj=null;
      for(var i=0;i<SH.ACCENTS.length;i++){if(SH.ACCENTS[i].key===selectedAccent){accentObj=SH.ACCENTS[i];break;}}
      if(!accentObj)accentObj=SH.ACCENTS[0];
      if(spanish){
        utter.lang=selectedAccent==='es'?'es-ES':'es-MX';
        var voice=pickVoice(utter.lang.substring(0,2),gender);if(voice)utter.voice=voice;
      } else {
        utter.lang=accentObj.lang;
        var langPrefix=accentObj.lang.substring(0,2);
        var exactVoices=cachedVoices.filter(function(v){return v.lang===accentObj.lang||v.lang.replace('_','-')===accentObj.lang;});
        if(exactVoices.length>0){
          var targetNames2=gender==='f'?femNames:mascNames;var best=exactVoices[0],bestScore=-1;
          exactVoices.forEach(function(v){var lo=v.name.toLowerCase(),s=0;if(targetNames2.some(function(k){return lo.indexOf(k)!==-1;}))s+=10;premiumKeywords.forEach(function(k){if(lo.indexOf(k)!==-1)s+=20;});if(v.localService)s+=5;if(s>bestScore){bestScore=s;best=v;}});
          utter.voice=best;
        } else { var voice=pickVoice(langPrefix,gender);if(voice)utter.voice=voice; }
      }
      utter.rate=0.9;utter.pitch=gender==='f'?1.2:0.95;utter.volume=1.0;synth.speak(utter);
    };
    setTimeout(speak,50);
  }

  // ═══════════════════════════════════════════════
  // Web Audio
  // ═══════════════════════════════════════════════
  function initAudio(){if(audioCtx)return;try{audioCtx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){audioCtx=null;}}

  function playPop(combo){
    if(!audioCtx)return;var basePitch=600+Math.min(combo,10)*80,now=audioCtx.currentTime;
    var osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type='sine';
    osc.frequency.setValueAtTime(basePitch,now);osc.frequency.exponentialRampToValueAtTime(basePitch*0.4,now+0.15);
    gain.gain.setValueAtTime(0.3,now);gain.gain.exponentialRampToValueAtTime(0.001,now+0.15);
    osc.connect(gain);gain.connect(audioCtx.destination);osc.start(now);osc.stop(now+0.15);
    var bufSize=audioCtx.sampleRate*0.06,buf=audioCtx.createBuffer(1,bufSize,audioCtx.sampleRate),data=buf.getChannelData(0);
    for(var i=0;i<bufSize;i++)data[i]=(Math.random()*2-1)*(1-i/bufSize);
    var noise=audioCtx.createBufferSource(),nGain=audioCtx.createGain();noise.buffer=buf;
    nGain.gain.setValueAtTime(0.15,now);nGain.gain.exponentialRampToValueAtTime(0.001,now+0.06);
    noise.connect(nGain);nGain.connect(audioCtx.destination);noise.start(now);
    if(combo>=3){var chime=audioCtx.createOscillator(),cGain=audioCtx.createGain();chime.type='triangle';chime.frequency.setValueAtTime(basePitch*1.5,now+0.05);chime.frequency.exponentialRampToValueAtTime(basePitch*2,now+0.2);cGain.gain.setValueAtTime(0.15,now+0.05);cGain.gain.exponentialRampToValueAtTime(0.001,now+0.25);chime.connect(cGain);cGain.connect(audioCtx.destination);chime.start(now+0.05);chime.stop(now+0.25);}
  }

  function playMilestone(){
    if(!audioCtx)return;var now=audioCtx.currentTime;
    [523,659,784,1047].forEach(function(freq,i){var osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type='triangle';osc.frequency.value=freq;gain.gain.setValueAtTime(0,now+i*0.1);gain.gain.linearRampToValueAtTime(0.2,now+i*0.1+0.05);gain.gain.exponentialRampToValueAtTime(0.001,now+i*0.1+0.4);osc.connect(gain);gain.connect(audioCtx.destination);osc.start(now+i*0.1);osc.stop(now+i*0.1+0.4);});
  }

  // ═══════════════════════════════════════════════
  // Theme SFX
  // ═══════════════════════════════════════════════
  function playSfx(type){
    if(!audioCtx)return;var now=audioCtx.currentTime;

    if(type==='dino'){
      var o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sawtooth';o.frequency.setValueAtTime(180,now);o.frequency.exponentialRampToValueAtTime(60,now+0.5);g.gain.setValueAtTime(0.25,now);g.gain.linearRampToValueAtTime(0.3,now+0.08);g.gain.exponentialRampToValueAtTime(0.001,now+0.5);o.connect(g);g.connect(audioCtx.destination);o.start(now);o.stop(now+0.5);
      var o2=audioCtx.createOscillator(),g2=audioCtx.createGain();o2.type='square';o2.frequency.setValueAtTime(45,now);o2.frequency.exponentialRampToValueAtTime(25,now+0.4);g2.gain.setValueAtTime(0.1,now);g2.gain.exponentialRampToValueAtTime(0.001,now+0.4);o2.connect(g2);g2.connect(audioCtx.destination);o2.start(now);o2.stop(now+0.4);
      var buf=audioCtx.createBuffer(1,audioCtx.sampleRate*0.3,audioCtx.sampleRate),d=buf.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2);var ns=audioCtx.createBufferSource(),ng=audioCtx.createGain();ns.buffer=buf;ng.gain.setValueAtTime(0.12,now);ng.gain.exponentialRampToValueAtTime(0.001,now+0.3);ns.connect(ng);ng.connect(audioCtx.destination);ns.start(now);

    } else if(type==='engine'){
      var o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sawtooth';o.frequency.setValueAtTime(80,now);o.frequency.exponentialRampToValueAtTime(300,now+0.2);o.frequency.exponentialRampToValueAtTime(120,now+0.5);g.gain.setValueAtTime(0.15,now);g.gain.linearRampToValueAtTime(0.2,now+0.15);g.gain.exponentialRampToValueAtTime(0.001,now+0.5);o.connect(g);g.connect(audioCtx.destination);o.start(now);o.stop(now+0.5);
      var o2=audioCtx.createOscillator(),g2=audioCtx.createGain();o2.type='square';o2.frequency.setValueAtTime(40,now);o2.frequency.exponentialRampToValueAtTime(90,now+0.2);o2.frequency.exponentialRampToValueAtTime(50,now+0.45);g2.gain.setValueAtTime(0.08,now);g2.gain.exponentialRampToValueAtTime(0.001,now+0.45);o2.connect(g2);g2.connect(audioCtx.destination);o2.start(now);o2.stop(now+0.45);

    } else if(type==='revv'){
      var o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sawtooth';o.frequency.setValueAtTime(200,now);o.frequency.exponentialRampToValueAtTime(800,now+0.15);o.frequency.exponentialRampToValueAtTime(400,now+0.4);g.gain.setValueAtTime(0.12,now);g.gain.linearRampToValueAtTime(0.18,now+0.1);g.gain.exponentialRampToValueAtTime(0.001,now+0.4);o.connect(g);g.connect(audioCtx.destination);o.start(now);o.stop(now+0.4);
      var buf=audioCtx.createBuffer(1,audioCtx.sampleRate*0.2,audioCtx.sampleRate),d=buf.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(i%80<40?0.8:0.2)*(1-i/d.length);var ns=audioCtx.createBufferSource(),ng=audioCtx.createGain();ns.buffer=buf;ng.gain.setValueAtTime(0.08,now);ng.gain.exponentialRampToValueAtTime(0.001,now+0.2);ns.connect(ng);ng.connect(audioCtx.destination);ns.start(now);

    } else if(type==='animal'){
      var variant=Math.random(),o=audioCtx.createOscillator(),g=audioCtx.createGain();
      if(variant<0.33){o.type='sine';o.frequency.setValueAtTime(800,now);o.frequency.exponentialRampToValueAtTime(1200,now+0.08);o.frequency.exponentialRampToValueAtTime(600,now+0.2);o.frequency.exponentialRampToValueAtTime(1000,now+0.28);g.gain.setValueAtTime(0.15,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.35);o.connect(g);g.connect(audioCtx.destination);o.start(now);o.stop(now+0.35);
      } else if(variant<0.66){o.type='sine';o.frequency.setValueAtTime(400,now);o.frequency.exponentialRampToValueAtTime(900,now+0.1);o.frequency.exponentialRampToValueAtTime(500,now+0.15);o.frequency.exponentialRampToValueAtTime(1000,now+0.25);g.gain.setValueAtTime(0.2,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.3);o.connect(g);g.connect(audioCtx.destination);o.start(now);o.stop(now+0.3);
      } else {o.type='sawtooth';o.frequency.setValueAtTime(120,now);o.frequency.exponentialRampToValueAtTime(70,now+0.4);g.gain.setValueAtTime(0.18,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.4);o.connect(g);g.connect(audioCtx.destination);o.start(now);o.stop(now+0.4);
        var buf=audioCtx.createBuffer(1,audioCtx.sampleRate*0.25,audioCtx.sampleRate),dd=buf.getChannelData(0);for(var i=0;i<dd.length;i++)dd[i]=(Math.random()*2-1)*Math.pow(1-i/dd.length,1.5);var ns=audioCtx.createBufferSource(),ng=audioCtx.createGain();ns.buffer=buf;ng.gain.setValueAtTime(0.08,now);ng.gain.exponentialRampToValueAtTime(0.001,now+0.25);ns.connect(ng);ng.connect(audioCtx.destination);ns.start(now);
      }

    } else if(type==='dog'){
      // BARK: sharp attack, mid-frequency
      var o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sawtooth';
      o.frequency.setValueAtTime(350,now);o.frequency.exponentialRampToValueAtTime(200,now+0.12);
      g.gain.setValueAtTime(0.3,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.18);
      o.connect(g);g.connect(audioCtx.destination);o.start(now);o.stop(now+0.2);
      // Second bark (double bark!)
      var o2=audioCtx.createOscillator(),g2=audioCtx.createGain();o2.type='sawtooth';
      o2.frequency.setValueAtTime(380,now+0.22);o2.frequency.exponentialRampToValueAtTime(220,now+0.34);
      g2.gain.setValueAtTime(0.25,now+0.22);g2.gain.exponentialRampToValueAtTime(0.001,now+0.4);
      o2.connect(g2);g2.connect(audioCtx.destination);o2.start(now+0.22);o2.stop(now+0.42);
      // Noise burst for texture
      var buf=audioCtx.createBuffer(1,audioCtx.sampleRate*0.1,audioCtx.sampleRate),d=buf.getChannelData(0);
      for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);
      var ns=audioCtx.createBufferSource(),ng=audioCtx.createGain();ns.buffer=buf;
      ng.gain.setValueAtTime(0.1,now);ng.gain.exponentialRampToValueAtTime(0.001,now+0.1);
      ns.connect(ng);ng.connect(audioCtx.destination);ns.start(now);

    } else if(type==='cat'){
      // MEOW: rising then falling sine
      var o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';
      o.frequency.setValueAtTime(500,now);o.frequency.linearRampToValueAtTime(900,now+0.15);
      o.frequency.linearRampToValueAtTime(600,now+0.4);o.frequency.linearRampToValueAtTime(400,now+0.55);
      g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(0.2,now+0.05);
      g.gain.setValueAtTime(0.2,now+0.3);g.gain.exponentialRampToValueAtTime(0.001,now+0.55);
      o.connect(g);g.connect(audioCtx.destination);o.start(now);o.stop(now+0.6);
      // Purr undertone
      var o2=audioCtx.createOscillator(),g2=audioCtx.createGain();o2.type='triangle';
      o2.frequency.value=25;g2.gain.setValueAtTime(0.05,now+0.1);
      g2.gain.exponentialRampToValueAtTime(0.001,now+0.5);
      o2.connect(g2);g2.connect(audioCtx.destination);o2.start(now+0.1);o2.stop(now+0.5);

    } else if(type==='fish'){
      // SPLASH: noise burst with filter sweep
      var buf=audioCtx.createBuffer(1,audioCtx.sampleRate*0.3,audioCtx.sampleRate),d=buf.getChannelData(0);
      for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,1.5);
      var ns=audioCtx.createBufferSource(),ng=audioCtx.createGain(),filt=audioCtx.createBiquadFilter();
      ns.buffer=buf;filt.type='bandpass';filt.frequency.setValueAtTime(2000,now);
      filt.frequency.exponentialRampToValueAtTime(200,now+0.3);filt.Q.value=2;
      ng.gain.setValueAtTime(0.2,now);ng.gain.exponentialRampToValueAtTime(0.001,now+0.3);
      ns.connect(filt);filt.connect(ng);ng.connect(audioCtx.destination);ns.start(now);
      // Bubble blop
      var o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';
      o.frequency.setValueAtTime(600,now+0.05);o.frequency.exponentialRampToValueAtTime(200,now+0.2);
      g.gain.setValueAtTime(0.12,now+0.05);g.gain.exponentialRampToValueAtTime(0.001,now+0.2);
      o.connect(g);g.connect(audioCtx.destination);o.start(now+0.05);o.stop(now+0.25);

    } else if(type==='fly'){
      // BUZZ: oscillating high-frequency
      var o=audioCtx.createOscillator(),g=audioCtx.createGain(),lfo=audioCtx.createOscillator(),lfoG=audioCtx.createGain();
      o.type='sawtooth';o.frequency.setValueAtTime(220,now);
      lfo.frequency.value=40;lfoG.gain.value=80;
      lfo.connect(lfoG);lfoG.connect(o.frequency);
      g.gain.setValueAtTime(0.1,now);g.gain.setValueAtTime(0.1,now+0.2);
      g.gain.exponentialRampToValueAtTime(0.001,now+0.35);
      o.connect(g);g.connect(audioCtx.destination);
      o.start(now);lfo.start(now);o.stop(now+0.4);lfo.stop(now+0.4);
      // Snap (tongue catch)
      var o2=audioCtx.createOscillator(),g2=audioCtx.createGain();o2.type='square';
      o2.frequency.setValueAtTime(1200,now+0.15);o2.frequency.exponentialRampToValueAtTime(100,now+0.2);
      g2.gain.setValueAtTime(0.15,now+0.15);g2.gain.exponentialRampToValueAtTime(0.001,now+0.22);
      o2.connect(g2);g2.connect(audioCtx.destination);o2.start(now+0.15);o2.stop(now+0.25);
    }
  }

  // ═══════════════════════════════════════════════
  // Background music
  // ═══════════════════════════════════════════════
  var currentMusic=0, musicPlaying=false, musicNodes=[], musicTimer=null;

  function stopMusic(){musicPlaying=false;if(musicTimer){clearInterval(musicTimer);musicTimer=null;}musicNodes.forEach(function(n){try{n.stop();}catch(e){}});musicNodes=[];}

  function scheduleNote(freq,startTime,duration,type,vol,detune){
    if(!audioCtx)return;var osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type=type||'sine';osc.frequency.value=freq;if(detune)osc.detune.value=detune;gain.gain.setValueAtTime(0,startTime);gain.gain.linearRampToValueAtTime(vol||0.08,startTime+0.02);gain.gain.setValueAtTime(vol||0.08,startTime+duration-0.04);gain.gain.linearRampToValueAtTime(0,startTime+duration);osc.connect(gain);gain.connect(audioCtx.destination);osc.start(startTime);osc.stop(startTime+duration+0.05);musicNodes.push(osc);return osc;
  }
  function scheduleNoise(startTime,duration,vol){
    if(!audioCtx)return;var len=Math.floor(audioCtx.sampleRate*duration),buf=audioCtx.createBuffer(1,len,audioCtx.sampleRate),d=buf.getChannelData(0);for(var i=0;i<len;i++)d[i]=(Math.random()*2-1);var src=audioCtx.createBufferSource(),gain=audioCtx.createGain(),filt=audioCtx.createBiquadFilter();filt.type='lowpass';filt.frequency.value=200;src.buffer=buf;gain.gain.setValueAtTime(0,startTime);gain.gain.linearRampToValueAtTime(vol||0.06,startTime+0.01);gain.gain.setValueAtTime(vol||0.06,startTime+duration-0.01);gain.gain.linearRampToValueAtTime(0,startTime+duration);src.connect(filt);filt.connect(gain);gain.connect(audioCtx.destination);src.start(startTime);src.stop(startTime+duration+0.05);musicNodes.push(src);
  }

  function startMusic(mode){if(!audioCtx)return;musicPlaying=true;if(mode===1)playBabyJingle();else if(mode===2)playBabyRock();else if(mode===3)playChillLofi();else if(mode===4)playJungleBeat();else if(mode===5)playAdventure();else if(mode===6)playSpace();}

  function playBabyJingle(){var notes=[523,587,659,698,784,698,659,587,523,659,784,1047,784,659,523,587],bpm=140,bl=60/bpm;function lp(){if(!musicPlaying)return;var now=audioCtx.currentTime+0.05;for(var i=0;i<notes.length;i++){scheduleNote(notes[i],now+i*bl,bl*0.7,'sine',0.07);scheduleNote(notes[i]*3,now+i*bl,bl*0.3,'sine',0.02);}musicTimer=setTimeout(lp,notes.length*bl*1000-100);}lp();}

  function playBabyRock(){var chords=[[165,247,330],[147,220,294],[131,196,262],[147,220,294]],bpm=120,bl=60/bpm;function lp(){if(!musicPlaying)return;var now=audioCtx.currentTime+0.05,t=0;for(var c=0;c<chords.length;c++){var ch=chords[c];for(var h=0;h<2;h++){for(var n=0;n<ch.length;n++){scheduleNote(ch[n],now+t,bl*0.6,'square',0.04,(Math.random()-0.5)*10);scheduleNote(ch[n],now+t,bl*0.6,'sawtooth',0.03);}t+=bl;}}[0,2,4,6].forEach(function(k){scheduleNoise(now+k*bl,0.12,0.1);});[1,3,5,7].forEach(function(s){var sLen=Math.floor(audioCtx.sampleRate*0.08),sBuf=audioCtx.createBuffer(1,sLen,audioCtx.sampleRate),sd=sBuf.getChannelData(0);for(var i=0;i<sLen;i++)sd[i]=(Math.random()*2-1)*(1-i/sLen);var ss=audioCtx.createBufferSource(),sg=audioCtx.createGain(),sf=audioCtx.createBiquadFilter();sf.type='highpass';sf.frequency.value=800;ss.buffer=sBuf;sg.gain.setValueAtTime(0.08,now+s*bl);sg.gain.exponentialRampToValueAtTime(0.001,now+s*bl+0.08);ss.connect(sf);sf.connect(sg);sg.connect(audioCtx.destination);ss.start(now+s*bl);ss.stop(now+s*bl+0.1);musicNodes.push(ss);});var bass=[82,82,73,73,65,65,73,73];for(var i=0;i<bass.length;i++)scheduleNote(bass[i],now+i*bl,bl*0.8,'triangle',0.1);musicTimer=setTimeout(lp,8*bl*1000-100);}lp();}

  function playChillLofi(){var chords=[[262,330,392],[247,311,370],[220,277,330],[247,311,370]],bpm=75,bl=60/bpm;function lp(){if(!musicPlaying)return;var now=audioCtx.currentTime+0.05,t=0;for(var c=0;c<chords.length;c++){var ch=chords[c];for(var n=0;n<ch.length;n++){scheduleNote(ch[n],now+t,bl*3.5,'sine',0.05);scheduleNote(ch[n]*1.001,now+t,bl*3.5,'sine',0.03);}t+=bl*4;}for(var k=0;k<4;k++){scheduleNoise(now+k*bl*4,0.15,0.07);scheduleNoise(now+k*bl*4+bl*2,0.15,0.05);}musicTimer=setTimeout(lp,16*bl*1000-200);}lp();}

  function playJungleBeat(){var melody=[392,440,523,440,392,349,330,349],bpm=130,bl=60/bpm;function lp(){if(!musicPlaying)return;var now=audioCtx.currentTime+0.05;for(var i=0;i<melody.length;i++){scheduleNote(melody[i],now+i*bl,bl*0.5,'sine',0.07);scheduleNote(melody[i]*4,now+i*bl,bl*0.15,'sine',0.03);}[0,0.5,1.5,2,3,3.5,4.5,5,6,7,7.5].forEach(function(h){var t=now+h*bl,o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.setValueAtTime(400,t);o.frequency.exponentialRampToValueAtTime(200,t+0.06);g.gain.setValueAtTime(0.1,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.08);o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+0.1);musicNodes.push(o);});[1,3,5,7].forEach(function(h){var t=now+h*bl,o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.setValueAtTime(180,t);o.frequency.exponentialRampToValueAtTime(80,t+0.1);g.gain.setValueAtTime(0.12,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.12);o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+0.15);musicNodes.push(o);});musicTimer=setTimeout(lp,8*bl*1000-100);}lp();}

  function playAdventure(){var melody=[523,523,659,659,784,784,659,0,587,587,523,523,494,494,523,0],bass=[131,0,131,165,175,0,175,131,131,0,131,165,131,0,131,0],bpm=110,bl=60/bpm;function lp(){if(!musicPlaying)return;var now=audioCtx.currentTime+0.05;for(var i=0;i<melody.length;i++){if(melody[i]>0){scheduleNote(melody[i],now+i*bl,bl*0.8,'square',0.04);scheduleNote(melody[i],now+i*bl,bl*0.8,'triangle',0.05);}if(bass[i]>0)scheduleNote(bass[i],now+i*bl,bl*0.9,'triangle',0.08);}for(var s=0;s<16;s++){if(s%2===0)scheduleNoise(now+s*bl,0.08,0.06);else{var sLen=Math.floor(audioCtx.sampleRate*0.06),sBuf=audioCtx.createBuffer(1,sLen,audioCtx.sampleRate),sd=sBuf.getChannelData(0);for(var j=0;j<sLen;j++)sd[j]=(Math.random()*2-1)*(1-j/sLen);var ss=audioCtx.createBufferSource(),sg=audioCtx.createGain(),sf=audioCtx.createBiquadFilter();sf.type='highpass';sf.frequency.value=600;ss.buffer=sBuf;sg.gain.setValueAtTime(0.06,now+s*bl);sg.gain.exponentialRampToValueAtTime(0.001,now+s*bl+0.06);ss.connect(sf);sf.connect(sg);sg.connect(audioCtx.destination);ss.start(now+s*bl);ss.stop(now+s*bl+0.08);musicNodes.push(ss);}}musicTimer=setTimeout(lp,16*bl*1000-100);}lp();}

  function playSpace(){var chords=[[130.8,196,261.6],[123.5,185,246.9],[110,165,220],[116.5,174.6,233.1]],bpm=50,bl=60/bpm;function lp(){if(!musicPlaying)return;var now=audioCtx.currentTime+0.05,t=0;for(var c=0;c<chords.length;c++){var ch=chords[c];for(var n=0;n<ch.length;n++){scheduleNote(ch[n],now+t,bl*7.5,'sine',0.04);scheduleNote(ch[n]*1.003,now+t,bl*7.5,'sine',0.03);scheduleNote(ch[n]*0.997,now+t,bl*7.5,'triangle',0.02);}t+=bl*8;}for(var i=0;i<12;i++){var bTime=now+Math.random()*32*bl,bFreq=800+Math.random()*2000,bOsc=audioCtx.createOscillator(),bGain=audioCtx.createGain();bOsc.type='sine';bOsc.frequency.setValueAtTime(bFreq,bTime);bOsc.frequency.exponentialRampToValueAtTime(bFreq*0.7,bTime+0.3);bGain.gain.setValueAtTime(0,bTime);bGain.gain.linearRampToValueAtTime(0.04,bTime+0.02);bGain.gain.exponentialRampToValueAtTime(0.001,bTime+0.4);bOsc.connect(bGain);bGain.connect(audioCtx.destination);bOsc.start(bTime);bOsc.stop(bTime+0.5);musicNodes.push(bOsc);}for(var p=0;p<8;p++){var pTime=now+p*bl*4,pOsc=audioCtx.createOscillator(),pGain=audioCtx.createGain();pOsc.type='sine';pOsc.frequency.value=40+Math.random()*20;pGain.gain.setValueAtTime(0,pTime);pGain.gain.linearRampToValueAtTime(0.08,pTime+bl);pGain.gain.linearRampToValueAtTime(0,pTime+bl*3.5);pOsc.connect(pGain);pGain.connect(audioCtx.destination);pOsc.start(pTime);pOsc.stop(pTime+bl*4);musicNodes.push(pOsc);}musicTimer=setTimeout(lp,32*bl*1000-200);}lp();}

  window._cycleMusic=function(){
    initAudio();currentMusic=(currentMusic+1)%SH.MUSIC_MODES.length;
    document.getElementById('musicLabel').textContent=SH.MUSIC_MODES[currentMusic];
    stopMusic();if(currentMusic>0)startMusic(currentMusic);
  };

  // Auto-start music from settings
  window._setMusic=function(mode){
    initAudio();currentMusic=mode;
    document.getElementById('musicLabel').textContent=SH.MUSIC_MODES[currentMusic];
    stopMusic();if(currentMusic>0)startMusic(currentMusic);
  };

  SH.initAudio=initAudio; SH.playPop=playPop; SH.playMilestone=playMilestone;
  SH.playSfx=playSfx; SH.sayName=sayName;

  // ═══════════════════════════════════════════════
  // Intro jingle — catchy kid-friendly melody
  // "Slap Happy!" style xylophone + chime fanfare
  // ═══════════════════════════════════════════════
  function playIntroJingle(cb){
    initAudio();
    if(!audioCtx){if(cb)cb();return;}
    var now=audioCtx.currentTime+0.05;

    // Melody: bouncy ascending xylophone — think "do re mi fa sol la ti DO!"
    // Then a triumphant little fanfare at the end
    var melody=[
      // "Slap" — two quick punchy notes
      {f:523,t:0,d:0.12,v:0.15,type:'sine'},      // C5
      {f:587,t:0.13,d:0.12,v:0.15,type:'sine'},    // D5
      // "Hap-" — rising
      {f:659,t:0.3,d:0.15,v:0.18,type:'sine'},     // E5
      {f:784,t:0.48,d:0.15,v:0.18,type:'sine'},    // G5
      // "-py!" — big landing note
      {f:1047,t:0.68,d:0.35,v:0.2,type:'sine'},    // C6 (high, bright)

      // Sparkle echo — descending chimes
      {f:1568,t:1.1,d:0.1,v:0.08,type:'sine'},     // G6
      {f:1319,t:1.2,d:0.1,v:0.07,type:'sine'},     // E6
      {f:1047,t:1.3,d:0.1,v:0.06,type:'sine'},     // C6
      {f:784,t:1.4,d:0.15,v:0.05,type:'sine'},     // G5

      // Final triumphant chord
      {f:523,t:1.6,d:0.5,v:0.1,type:'triangle'},   // C5
      {f:659,t:1.6,d:0.5,v:0.08,type:'triangle'},  // E5
      {f:784,t:1.6,d:0.5,v:0.08,type:'triangle'},  // G5
      {f:1047,t:1.6,d:0.5,v:0.1,type:'triangle'},  // C6
    ];

    melody.forEach(function(n){
      var osc=audioCtx.createOscillator(),gain=audioCtx.createGain();
      osc.type=n.type;osc.frequency.value=n.f;
      gain.gain.setValueAtTime(0,now+n.t);
      gain.gain.linearRampToValueAtTime(n.v,now+n.t+0.02);
      gain.gain.setValueAtTime(n.v,now+n.t+n.d*0.6);
      gain.gain.exponentialRampToValueAtTime(0.001,now+n.t+n.d);
      osc.connect(gain);gain.connect(audioCtx.destination);
      osc.start(now+n.t);osc.stop(now+n.t+n.d+0.05);

      // Xylophone shimmer overtone
      if(n.type==='sine'){
        var osc2=audioCtx.createOscillator(),g2=audioCtx.createGain();
        osc2.type='sine';osc2.frequency.value=n.f*3;
        g2.gain.setValueAtTime(0,now+n.t);
        g2.gain.linearRampToValueAtTime(n.v*0.2,now+n.t+0.01);
        g2.gain.exponentialRampToValueAtTime(0.001,now+n.t+n.d*0.4);
        osc2.connect(g2);g2.connect(audioCtx.destination);
        osc2.start(now+n.t);osc2.stop(now+n.t+n.d*0.5);
      }
    });

    // Percussion hits on the beats
    var hits=[0,0.13,0.3,0.48,0.68,1.6];
    hits.forEach(function(ht){
      var len=Math.floor(audioCtx.sampleRate*0.04);
      var buf=audioCtx.createBuffer(1,len,audioCtx.sampleRate),d=buf.getChannelData(0);
      for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);
      var src=audioCtx.createBufferSource(),g=audioCtx.createGain(),filt=audioCtx.createBiquadFilter();
      src.buffer=buf;filt.type='highpass';filt.frequency.value=2000;
      g.gain.setValueAtTime(0.06,now+ht);g.gain.exponentialRampToValueAtTime(0.001,now+ht+0.04);
      src.connect(filt);filt.connect(g);g.connect(audioCtx.destination);
      src.start(now+ht);src.stop(now+ht+0.06);
    });

    // TTS says "Slap Happy!" after the jingle
    setTimeout(function(){
      synth.cancel();
      var utter=new SpeechSynthesisUtterance('Slap Happy!');
      utter.rate=1.0;utter.pitch=1.3;utter.volume=1.0;utter.lang='en-US';
      var voice=pickVoice('en','f');if(voice)utter.voice=voice;
      synth.speak(utter);
    },800);

    // Callback after jingle finishes
    if(cb) setTimeout(cb,2200);
  }

  SH.playIntroJingle=playIntroJingle;
})();
