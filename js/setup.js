// ═══════════════════════════════════════════════
// setup.js — Setup screen, photos, modals, settings
// ═══════════════════════════════════════════════
(function(){
  var SH=window.SH;
  var FAMILY=[],activeThemes=[],selectedAccent='us';
  var settings={babyName:'',bubbleCount:5,defaultMusic:3};

  var setupEl=document.getElementById('setup'),sectionsEl=document.getElementById('familySections');
  var startBtn=document.getElementById('startBtn'),skipBtn=document.getElementById('skipBtn');
  var bottomBar=document.getElementById('bottomBar'),photoInput=document.getElementById('photoInput');
  var editModal=document.getElementById('editModal');
  var loadingEl=document.getElementById('loading'),editingIndex=-1;

  function buildPaletteRow(container,colors,sel,onSelect){container.innerHTML='';colors.forEach(function(c){var sw=document.createElement('div');sw.className='palette-swatch'+(c===sel?' selected':'');sw.style.background=c;sw.addEventListener('click',function(){onSelect(c);});container.appendChild(sw);});}
  function refreshPalettes(c1,c2,sel,onSelect){buildPaletteRow(c1,SH.LIGHT_PASTELS,sel,onSelect);buildPaletteRow(c2,SH.DARK_PASTELS,sel,onSelect);}

  // ═══════════════════════════════════════════════
  // Build setup screen
  // ═══════════════════════════════════════════════
  function buildSetup(){
    sectionsEl.innerHTML='';

    // ── Settings section ──
    var settingsSection=document.createElement('div');
    settingsSection.className='theme-section';settingsSection.style.marginTop='0';
    settingsSection.innerHTML='<div class="theme-section-label">Settings</div>';
    var settingsBox=document.createElement('div');settingsBox.className='settings-box';
    settingsBox.innerHTML=
      '<div class="setting-row"><label class="setting-label">Baby\'s name</label><input type="text" class="setting-input" id="babyNameInput" placeholder="(optional)" maxlength="20" value="'+(settings.babyName||'')+'"></div>'+
      '<div class="setting-row"><label class="setting-label">Bubbles on screen</label><div class="setting-slider-row"><input type="range" id="bubbleSlider" min="3" max="15" value="'+settings.bubbleCount+'" class="setting-slider"><span id="bubbleVal" class="setting-val">'+settings.bubbleCount+'</span></div></div>'+
      '<div class="setting-row"><label class="setting-label">Background music</label><div class="music-picker" id="musicPicker"></div></div>';
    settingsSection.appendChild(settingsBox);sectionsEl.appendChild(settingsSection);

    document.getElementById('babyNameInput').addEventListener('input',function(){settings.babyName=this.value.trim();saveFamily();});
    var slider=document.getElementById('bubbleSlider'),valSpan=document.getElementById('bubbleVal');
    slider.addEventListener('input',function(){valSpan.textContent=slider.value;settings.bubbleCount=parseInt(slider.value);saveFamily();});
    var picker=document.getElementById('musicPicker');
    SH.MUSIC_MODES.forEach(function(mode,i){var btn=document.createElement('button');btn.className='music-pick-btn'+(settings.defaultMusic===i?' selected':'');btn.textContent=mode;btn.addEventListener('click',function(){settings.defaultMusic=i;saveFamily();buildSetup();});picker.appendChild(btn);});

    // ── Global accent (default for members without their own) ──
    var accentSection=document.createElement('div');accentSection.className='theme-section';
    accentSection.innerHTML='<div class="theme-section-label">Default voice accent</div>';
    var accentRow=document.createElement('div');accentRow.className='accent-row';
    SH.ACCENTS.forEach(function(acc){
      var btn=document.createElement('button');btn.className='accent-btn'+(selectedAccent===acc.key?' selected':'');
      btn.innerHTML='<span class="accent-flag">'+acc.flag+'</span><span class="accent-label">'+acc.label+'</span>';
      btn.addEventListener('click',function(){selectedAccent=acc.key;saveFamily();buildSetup();});
      accentRow.appendChild(btn);
    });
    accentSection.appendChild(accentRow);sectionsEl.appendChild(accentSection);

    // ── Family groups ──
    SH.GROUPS.forEach(function(group){
      var members=[];
      FAMILY.forEach(function(f,i){if(f.group===group)members.push({fam:f,idx:i});});
      if(members.length===0&&group!=='Custom'&&group!=='Pets')return;

      var label=document.createElement('div');label.className='section-label';label.textContent=group;sectionsEl.appendChild(label);
      var grid=document.createElement('div');grid.className='family-grid';

      members.forEach(function(m){
        var card=document.createElement('div');card.className='family-card'+(m.fam.custom?' custom':'');
        var dn=SH.displayName(m.fam);
        var photoHtml=m.fam.photo?'<img src="'+m.fam.photo+'">':'<span class="plus">+</span>';
        // Show role name, and nickname underneath if different
        var nameHtml='<span class="name-label">'+m.fam.name+'</span>';
        if(m.fam.nickname&&m.fam.nickname!==m.fam.name) nameHtml+='<span class="nick-label">'+m.fam.nickname+'</span>';
        // Show accent flag if member has a custom accent
        var accentFlag='';
        if(m.fam.accent){for(var a=0;a<SH.ACCENTS.length;a++){if(SH.ACCENTS[a].key===m.fam.accent){accentFlag=SH.ACCENTS[a].flag;break;}}}

        card.innerHTML='<div class="photo-circle'+(m.fam.photo?' has-photo':'')+'" style="border-color:'+(m.fam.photo?m.fam.fill:'#ccc')+'">'+photoHtml+'</div>'+
          '<div class="color-dot" style="background:'+m.fam.fill+'"></div>'+
          (accentFlag?'<div class="accent-dot">'+accentFlag+'</div>':'')+
          nameHtml+
          (m.fam.custom?'<button class="remove-btn">&times;</button>':'');

        var idx=m.idx;
        // Tapping the photo opens photo picker
        card.querySelector('.photo-circle').addEventListener('click',function(){pickPhoto(idx);});
        // Tapping the name or the card body opens edit modal
        card.addEventListener('click',function(e){
          if(e.target.closest('.photo-circle')||e.target.closest('.color-dot')||e.target.closest('.remove-btn'))return;
          openEditModal(idx);
        });
        card.querySelector('.color-dot').addEventListener('click',function(e){e.stopPropagation();openEditModal(idx);});
        if(m.fam.custom){card.querySelector('.remove-btn').addEventListener('click',function(e){e.stopPropagation();FAMILY.splice(idx,1);saveFamily();buildSetup();});}
        grid.appendChild(card);
      });

      var addCard=document.createElement('div');addCard.className='add-card';
      addCard.innerHTML='<div class="add-circle"><span>+</span></div><span class="name-label">Add new</span>';
      addCard.addEventListener('click',function(){openEditModal(-1,group);});
      grid.appendChild(addCard);sectionsEl.appendChild(grid);
    });

    // ── Theme packs ──
    var themeLabel=document.createElement('div');themeLabel.className='theme-section';
    themeLabel.innerHTML='<div class="theme-section-label">Theme packs — mix in with family!</div>';
    var themeGrid=document.createElement('div');themeGrid.className='theme-grid';
    Object.keys(SH.THEMES).forEach(function(key){
      var theme=SH.THEMES[key],isActive=activeThemes.indexOf(key)!==-1;
      var card=document.createElement('div');card.className='theme-card'+(isActive?' selected':'');
      card.innerHTML='<div class="theme-icons">'+theme.icons+'</div><div><div class="theme-label">'+theme.label+'</div><div class="theme-count">'+theme.items.length+' bubbles</div></div>';
      card.addEventListener('click',function(){var idx=activeThemes.indexOf(key);if(idx!==-1)activeThemes.splice(idx,1);else activeThemes.push(key);saveFamily();buildSetup();});
      themeGrid.appendChild(card);
    });
    themeLabel.appendChild(themeGrid);sectionsEl.appendChild(themeLabel);
  }

  // ═══════════════════════════════════════════════
  // Photo handling
  // ═══════════════════════════════════════════════
  function pickPhoto(idx){editingIndex=idx;photoInput.click();}

  photoInput.addEventListener('change',function(e){
    if(editingIndex<0||!e.target.files.length)return;
    var file=e.target.files[0],reader=new FileReader();
    reader.onload=function(ev){var tempImg=new Image();tempImg.onload=function(){processPhoto(tempImg,function(url){FAMILY[editingIndex].photo=url;var gi=new Image();gi.onload=function(){FAMILY[editingIndex].img=gi;};gi.src=url;saveFamily();buildSetup();});};tempImg.src=ev.target.result;};
    reader.readAsDataURL(file);photoInput.value='';
  });

  function processPhoto(img,callback){
    var OUT=256;detectFace(img,function(faceBox){
      var cx,cy,faceR;
      if(faceBox){cx=faceBox.x+faceBox.width/2;cy=faceBox.y+faceBox.height/2;faceR=Math.max(faceBox.width,faceBox.height)*1.1;}
      else{cx=img.width/2;cy=img.height*0.4;faceR=Math.min(img.width,img.height)*0.35;}
      var cropSize=Math.max(faceR*2.2,Math.min(img.width,img.height)*0.5);cropSize=Math.min(cropSize,Math.min(img.width,img.height));
      var sx=cx-cropSize/2,sy=cy-cropSize/2;sx=Math.max(0,Math.min(sx,img.width-cropSize));sy=Math.max(0,Math.min(sy,img.height-cropSize));
      var c=document.createElement('canvas');c.width=OUT;c.height=OUT;var ctx2=c.getContext('2d');ctx2.drawImage(img,sx,sy,cropSize,cropSize,0,0,OUT,OUT);applyRadialBlur(c,ctx2,faceBox?0.32:0.38);callback(c.toDataURL('image/jpeg',0.88));
    });
  }

  function detectFace(img,callback){
    if(typeof FaceDetector!=='undefined'){try{var detector=new FaceDetector({fastMode:true,maxDetectedFaces:1});detector.detect(img).then(function(faces){callback(faces.length>0?faces[0].boundingBox:null);}).catch(function(){callback(null);});return;}catch(e){}}
    var sc=document.createElement('canvas'),small=100;sc.width=small;sc.height=small;var sctx=sc.getContext('2d');sctx.drawImage(img,0,0,small,small);var data=sctx.getImageData(0,0,small,small).data;
    var sumX=0,sumY=0,count=0;
    for(var y=0;y<small;y++){for(var x=0;x<small;x++){var i=(y*small+x)*4,r=data[i],g=data[i+1],b=data[i+2];if(r>60&&g>40&&b>20&&r>g&&r>b&&(r-g)>10&&(r-b)>10&&Math.abs(r-g)<130){var weight=y<small*0.6?2:1;sumX+=x*weight;sumY+=y*weight;count+=weight;}}}
    if(count>small*2){var fcx=(sumX/count)/small*img.width,fcy=(sumY/count)/small*img.height,fsize=Math.min(img.width,img.height)*0.35;callback({x:fcx-fsize/2,y:fcy-fsize/2,width:fsize,height:fsize});}else{callback(null);}
  }

  function applyRadialBlur(canvas,ctx,sharpRadius){
    var w=canvas.width,h=canvas.height,cx=w/2,cy=h/2,maxR=Math.sqrt(cx*cx+cy*cy);
    var original=ctx.getImageData(0,0,w,h),blurred=ctx.getImageData(0,0,w,h);boxBlur(blurred.data,w,h,8);boxBlur(blurred.data,w,h,6);
    var out=ctx.createImageData(w,h),od=out.data,orig=original.data,blur=blurred.data;
    for(var y=0;y<h;y++){for(var x=0;x<w;x++){var i=(y*w+x)*4,dx=x-cx,dy=y-cy,dist=Math.sqrt(dx*dx+dy*dy)/maxR,t=Math.max(0,Math.min(1,(dist-sharpRadius)/0.35));t=t*t;od[i]=orig[i]*(1-t)+blur[i]*t;od[i+1]=orig[i+1]*(1-t)+blur[i+1]*t;od[i+2]=orig[i+2]*(1-t)+blur[i+2]*t;od[i+3]=255;}}
    ctx.putImageData(out,0,0);var grad=ctx.createRadialGradient(cx,cy,w*0.25,cx,cy,w*0.55);grad.addColorStop(0,'rgba(0,0,0,0)');grad.addColorStop(1,'rgba(0,0,0,0.15)');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
  }

  function boxBlur(data,w,h,radius){
    var copy=new Uint8ClampedArray(data);for(var y=0;y<h;y++){for(var x=0;x<w;x++){var r=0,g=0,b=0,cnt=0;for(var dx=-radius;dx<=radius;dx++){var nx=x+dx;if(nx>=0&&nx<w){var i=(y*w+nx)*4;r+=copy[i];g+=copy[i+1];b+=copy[i+2];cnt++;}}var i2=(y*w+x)*4;data[i2]=r/cnt;data[i2+1]=g/cnt;data[i2+2]=b/cnt;}}
    copy=new Uint8ClampedArray(data);for(var y=0;y<h;y++){for(var x=0;x<w;x++){var r=0,g=0,b=0,cnt=0;for(var dy=-radius;dy<=radius;dy++){var ny=y+dy;if(ny>=0&&ny<h){var i=(ny*w+x)*4;r+=copy[i];g+=copy[i+1];b+=copy[i+2];cnt++;}}var i2=(y*w+x)*4;data[i2]=r/cnt;data[i2+1]=g/cnt;data[i2+2]=b/cnt;}}
  }

  // ═══════════════════════════════════════════════
  // Edit modal — used for both Add and Edit
  // ═══════════════════════════════════════════════
  var editIdx=-1; // -1 = adding new
  var editGender='f',editColor='',editAccent='',editGroup='Custom';

  function setEditGender(g){
    editGender=g;
    document.getElementById('editGF').className='gender-btn'+(g==='f'?' active':'');
    document.getElementById('editGM').className='gender-btn'+(g==='m'?' active':'');
  }

  function selectEditColor(c){
    editColor=c;
    refreshPalettes(document.getElementById('editLightPalette'),document.getElementById('editDarkPalette'),editColor,selectEditColor);
  }

  function buildAccentPicker(){
    var row=document.getElementById('editAccentRow');row.innerHTML='';
    // "Default" option (uses global accent)
    var defBtn=document.createElement('button');defBtn.className='accent-btn-sm'+(editAccent===''?' selected':'');
    defBtn.innerHTML='<span class="accent-label">Default</span>';
    defBtn.addEventListener('click',function(){editAccent='';buildAccentPicker();});
    row.appendChild(defBtn);

    SH.ACCENTS.forEach(function(acc){
      var btn=document.createElement('button');btn.className='accent-btn-sm'+(editAccent===acc.key?' selected':'');
      btn.innerHTML='<span class="accent-flag-sm">'+acc.flag+'</span>';
      btn.title=acc.label;
      btn.addEventListener('click',function(){editAccent=acc.key;buildAccentPicker();});
      row.appendChild(btn);
    });
  }

  function openEditModal(idx,addGroup){
    editIdx=idx;
    var isNew=(idx===-1);
    var title,nameVal,nickVal;

    if(isNew){
      editGroup=addGroup||'Custom';
      editGender='f';
      editColor=SH.ALL_PASTELS[Math.floor(Math.random()*SH.ALL_PASTELS.length)];
      editAccent='';
      title=editGroup==='Pets'?'Add a pet':'Add family member';
      nameVal='';nickVal='';
    } else {
      var f=FAMILY[idx];
      editGroup=f.group;
      editGender=f.gender;
      editColor=f.fill;
      editAccent=f.accent||'';
      title='Edit — '+f.name;
      nameVal=f.name;nickVal=f.nickname||'';
    }

    document.getElementById('editTitle').textContent=title;
    document.getElementById('editName').value=nameVal;
    document.getElementById('editName').placeholder=editGroup==='Pets'?'Role (e.g. Dog, Cat)':'Role (e.g. Sister, Uncle)';
    document.getElementById('editNickname').value=nickVal;
    document.getElementById('editNickname').placeholder='Their real name (e.g. Luna, Carlos)';
    document.getElementById('editConfirm').textContent=isNew?'Add':'Save';
    // Hide name field for new custom/pet (they just type the name)
    var nameRow=document.getElementById('editNameRow');
    nameRow.style.display='';

    setEditGender(editGender);
    refreshPalettes(document.getElementById('editLightPalette'),document.getElementById('editDarkPalette'),editColor,selectEditColor);
    buildAccentPicker();
    editModal.className='modal-overlay';
    setTimeout(function(){document.getElementById(isNew?'editName':'editNickname').focus();},100);
  }

  document.getElementById('editCancel').addEventListener('click',function(){editModal.className='modal-overlay hidden';});

  document.getElementById('editConfirm').addEventListener('click',function(){
    var name=document.getElementById('editName').value.trim();
    var nickname=document.getElementById('editNickname').value.trim();
    if(!name&&!nickname)return;
    if(!name)name=nickname; // if they only typed a name, use it as both

    if(editIdx===-1){
      FAMILY.push({name:name,nickname:nickname,fill:editColor,gender:editGender,accent:editAccent,photo:null,img:null,group:editGroup,custom:true});
    } else {
      FAMILY[editIdx].name=name;
      FAMILY[editIdx].nickname=nickname;
      FAMILY[editIdx].fill=editColor;
      FAMILY[editIdx].gender=editGender;
      FAMILY[editIdx].accent=editAccent;
    }
    editModal.className='modal-overlay hidden';
    saveFamily();buildSetup();
  });

  document.getElementById('editName').addEventListener('keydown',function(e){if(e.key==='Enter')document.getElementById('editNickname').focus();});
  document.getElementById('editNickname').addEventListener('keydown',function(e){if(e.key==='Enter')document.getElementById('editConfirm').click();});
  document.getElementById('editGF').addEventListener('click',function(){setEditGender('f');});
  document.getElementById('editGM').addEventListener('click',function(){setEditGender('m');});

  // ═══════════════════════════════════════════════
  // Persistence
  // ═══════════════════════════════════════════════
  function saveFamily(){
    SH.saveToDB(SH.serializeFamily(FAMILY,activeThemes,selectedAccent,settings),function(){
      var note=document.getElementById('savedNote');note.className='saved-note show';setTimeout(function(){note.className='saved-note';},1500);
    });
  }

  // ═══════════════════════════════════════════════
  // Start game
  // ═══════════════════════════════════════════════
  function startGame(){
    setupEl.className='hidden';bottomBar.className='bottom-bar hidden';
    var activeFam=FAMILY.map(function(f){
      // Use nickname for display/TTS if set, per-member accent if set, else global
      return{name:SH.displayName(f),fill:f.fill,gender:f.gender,photo:f.photo,img:f.img,
        accent:f.accent||selectedAccent};
    });
    activeThemes.forEach(function(key){var theme=SH.THEMES[key];if(!theme)return;theme.items.forEach(function(item){
      activeFam.push({name:item.name,fill:item.fill,gender:item.gender,photo:null,img:null,emoji:item.emoji,sfx:item.subsfx||theme.sfx,accent:selectedAccent});
    });});
    SH.startGame(activeFam,selectedAccent,settings);
  }
  startBtn.addEventListener('click',startGame);skipBtn.addEventListener('click',startGame);

  // ═══════════════════════════════════════════════
  // Boot
  // ═══════════════════════════════════════════════
  SH.openDB(function(){
    SH.loadFromDB(function(saved){
      try{
        if(saved&&(Array.isArray(saved)?saved.length>0:(saved.members||saved.themes))){
          var result=SH.deserializeFamily(saved);FAMILY=result.members;activeThemes=result.themes;selectedAccent=result.accent||'us';
          settings.babyName=result.babyName||'';settings.bubbleCount=result.bubbleCount||5;
          settings.defaultMusic=(typeof result.defaultMusic==='number')?result.defaultMusic:3;
          // Migrate old dogs/cats themes to dogsandcats
          var needMigration=false;
          if(activeThemes.indexOf('dogs')!==-1||activeThemes.indexOf('cats')!==-1){
            activeThemes=activeThemes.filter(function(k){return k!=='dogs'&&k!=='cats';});
            if(activeThemes.indexOf('dogsandcats')===-1)activeThemes.push('dogsandcats');
            needMigration=true;
          }
          if(needMigration)saveFamily();
        }else{
          // First run — default family tree + educational themes on
          FAMILY=SH.DEFAULT_FAMILY.map(function(f){return Object.assign({},f);});
          activeThemes=['numbers','abcs','shapes','colors'];
        }
      }catch(e){console.error('Load error:',e);FAMILY=SH.DEFAULT_FAMILY.map(function(f){return Object.assign({},f);});activeThemes=['numbers','abcs','shapes','colors'];}
      try{
        loadingEl.className='hidden';setupEl.className='';bottomBar.className='bottom-bar';buildSetup();
      }catch(e2){console.error('Setup build error:',e2);loadingEl.innerHTML='<span style="color:red;padding:20px;text-align:center">'+e2.message+'</span>';}
    });
  });
})();
