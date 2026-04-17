// ═══════════════════════════════════════════════
// data.js — Colors, family, themes, accents, IndexedDB
// ═══════════════════════════════════════════════
(function(){
  var LIGHT_PASTELS=['#FFB3B3','#FFDAB3','#FFFFB3','#B3FFB3','#B3FFE0','#B3F0FF','#B3C6FF','#D4B3FF','#FFB3EC','#FFD6E0','#C9E4DE','#FAEDCB'];
  var DARK_PASTELS=['#E06060','#D98C4F','#C4B44D','#5CB85C','#3DAD8E','#4AADCC','#5B7FD4','#8B5FCC','#CC5BA8','#D47B8A','#6BA392','#C4A24D'];
  var ALL_PASTELS=LIGHT_PASTELS.concat(DARK_PASTELS);
  var colorIdx=0;
  function nextColor(){var c=ALL_PASTELS[colorIdx%ALL_PASTELS.length];colorIdx++;return c;}

  // name = role label (Sister, Grandpa, etc), nickname = what TTS says and bubble shows
  // If nickname is blank, name is used for display and TTS
  var DEFAULT_FAMILY=[];

  var GROUPS=['Parents','Grandparents','Siblings','Aunts & Uncles','Cousins','Custom','Pets'];

  var THEMES={
    dinosaurs:{label:'Dinosaurs',icons:'🦕🦖🦴',sfx:'dino',items:[
      {name:'T-Rex',emoji:'🦖',fill:'#E06060',gender:'m'},{name:'Brontosaurus',emoji:'🦕',fill:'#5CB85C',gender:'f'},
      {name:'Triceratops',emoji:'🦏',fill:'#5B7FD4',gender:'m'},{name:'Stegosaurus',emoji:'🐊',fill:'#C4A24D',gender:'f'},
      {name:'Raptor',emoji:'🦎',fill:'#CC5BA8',gender:'m'},{name:'Pterodactyl',emoji:'🦅',fill:'#4AADCC',gender:'f'},
      {name:'Baby Dino',emoji:'🥒',fill:'#B8E994',gender:'f'},{name:'Mama Rex',emoji:'🦖',fill:'#FF9FF3',gender:'f'},
      {name:'Volcano',emoji:'🌋',fill:'#D98C4F',gender:'m'},{name:'Fossil',emoji:'🦴',fill:'#B3C6FF',gender:'f'},
    ]},
    trucks:{label:'Trucks',icons:'🚛🚒🚜',sfx:'engine',items:[
      {name:'Fire Truck',emoji:'🚒',fill:'#E06060',gender:'m'},{name:'Monster Truck',emoji:'🛻',fill:'#5B7FD4',gender:'m'},
      {name:'Dump Truck',emoji:'🚚',fill:'#C4A24D',gender:'m'},{name:'Tractor',emoji:'🚜',fill:'#5CB85C',gender:'m'},
      {name:'Cement Mixer',emoji:'🏗️',fill:'#8B5FCC',gender:'m'},{name:'Ambulance',emoji:'🚑',fill:'#FFB3B3',gender:'f'},
      {name:'Police Car',emoji:'🚓',fill:'#4AADCC',gender:'m'},{name:'Ice Cream Truck',emoji:'🍦',fill:'#FF9FF3',gender:'f'},
      {name:'School Bus',emoji:'🚌',fill:'#FFDAB3',gender:'f'},{name:'Pickup Truck',emoji:'🚙',fill:'#6BA392',gender:'f'},
    ]},
    dirtbikes:{label:'Dirt Bikes',icons:'🏍️🏁💨',sfx:'revv',items:[
      {name:'Dirt Bike',emoji:'🏍️',fill:'#E06060',gender:'m'},{name:'Motocross',emoji:'🏁',fill:'#5B7FD4',gender:'m'},
      {name:'Helmet',emoji:'⛑️',fill:'#C4A24D',gender:'m'},{name:'Wheelie',emoji:'🤸',fill:'#CC5BA8',gender:'f'},
      {name:'Mud',emoji:'💨',fill:'#6BA392',gender:'m'},{name:'Trophy',emoji:'🏆',fill:'#FFDAB3',gender:'f'},
      {name:'Ramp',emoji:'⛰️',fill:'#8B5FCC',gender:'m'},{name:'Nitro',emoji:'🔥',fill:'#D98C4F',gender:'m'},
      {name:'Racing Girl',emoji:'🏎️',fill:'#FF9FF3',gender:'f'},{name:'Checkered Flag',emoji:'🏁',fill:'#FFB3B3',gender:'f'},
    ]},
    jungle:{label:'Jungle Animals',icons:'🦁🐒🦜',sfx:'animal',items:[
      {name:'Lion',emoji:'🦁',fill:'#C4A24D',gender:'m'},{name:'Lioness',emoji:'🦁',fill:'#FFDAB3',gender:'f'},
      {name:'Monkey',emoji:'🐒',fill:'#D98C4F',gender:'m'},{name:'Parrot',emoji:'🦜',fill:'#E06060',gender:'f'},
      {name:'Elephant',emoji:'🐘',fill:'#B3C6FF',gender:'m'},{name:'Mama Elephant',emoji:'🐘',fill:'#D4B3FF',gender:'f'},
      {name:'Giraffe',emoji:'🦒',fill:'#FFDAB3',gender:'f'},{name:'Tiger',emoji:'🐯',fill:'#D98C4F',gender:'m'},
      {name:'Tigress',emoji:'🐯',fill:'#FF9FF3',gender:'f'},{name:'Snake',emoji:'🐍',fill:'#5CB85C',gender:'m'},
      {name:'Toucan',emoji:'🦅',fill:'#4AADCC',gender:'f'},{name:'Hippo',emoji:'🦛',fill:'#8B5FCC',gender:'f'},
      {name:'Crocodile',emoji:'🐊',fill:'#6BA392',gender:'m'},{name:'Butterfly',emoji:'🦋',fill:'#FFB3B3',gender:'f'},
      {name:'Frog',emoji:'🐸',fill:'#B8E994',gender:'m'},
    ]},
    dogsandcats:{label:'Dogs & Cats',icons:'🐶🐱🐾',sfx:'petmix',items:[
      {name:'Golden',emoji:'🐕',fill:'#FFDAB3',gender:'m',subsfx:'dog'},{name:'Puppy',emoji:'🐶',fill:'#FFB3EC',gender:'f',subsfx:'dog'},
      {name:'Husky',emoji:'🐺',fill:'#B3C6FF',gender:'m',subsfx:'dog'},{name:'Poodle',emoji:'🐩',fill:'#D4B3FF',gender:'f',subsfx:'dog'},
      {name:'Bulldog',emoji:'🐶',fill:'#D98C4F',gender:'m',subsfx:'dog'},{name:'Corgi',emoji:'🐕',fill:'#FFDAB3',gender:'f',subsfx:'dog'},
      {name:'Boston Terrier',emoji:'🐕',fill:'#2C3E50',gender:'m',subsfx:'dog'},{name:'Chihuahua',emoji:'🐕',fill:'#FAEDCB',gender:'f',subsfx:'dog'},
      {name:'Boxer',emoji:'🐕',fill:'#C4A24D',gender:'m',subsfx:'dog'},{name:'Doberman',emoji:'🐕',fill:'#6BA392',gender:'m',subsfx:'dog'},
      {name:'Good Boy',emoji:'🦴',fill:'#C9E4DE',gender:'m',subsfx:'dog'},{name:'Good Girl',emoji:'🎀',fill:'#FFB3B3',gender:'f',subsfx:'dog'},
      {name:'Fetch!',emoji:'🎾',fill:'#B3FFB3',gender:'m',subsfx:'dog'},
      {name:'Kitty',emoji:'🐱',fill:'#FFB3EC',gender:'f',subsfx:'cat'},{name:'Tabby',emoji:'🐈',fill:'#FFDAB3',gender:'m',subsfx:'cat'},
      {name:'Black Cat',emoji:'🐈‍⬛',fill:'#8B5FCC',gender:'f',subsfx:'cat'},{name:'Kitten',emoji:'😺',fill:'#FFD6E0',gender:'f',subsfx:'cat'},
      {name:'Tom Cat',emoji:'😼',fill:'#5B7FD4',gender:'m',subsfx:'cat'},{name:'Calico',emoji:'🐱',fill:'#D98C4F',gender:'f',subsfx:'cat'},
      {name:'Siamese',emoji:'🐱',fill:'#B3F0FF',gender:'f',subsfx:'cat'},{name:'Purr',emoji:'😻',fill:'#D4B3FF',gender:'f',subsfx:'cat'},
      {name:'Yarn Ball',emoji:'🧶',fill:'#E06060',gender:'f',subsfx:'cat'},{name:'Catnip',emoji:'🌿',fill:'#B3FFB3',gender:'m',subsfx:'cat'},
    ]},
    catmode:{label:'Cat Mode 🐱',icons:'🐟🐠🐡',sfx:'fish',items:[
      {name:'Goldfish',emoji:'🐟',fill:'#FFDAB3',gender:'f'},{name:'Clownfish',emoji:'🐠',fill:'#E06060',gender:'m'},
      {name:'Blowfish',emoji:'🐡',fill:'#B3F0FF',gender:'m'},{name:'Tuna',emoji:'🐟',fill:'#5B7FD4',gender:'m'},
      {name:'Salmon',emoji:'🐟',fill:'#FFB3B3',gender:'f'},{name:'Shrimp',emoji:'🦐',fill:'#CC5BA8',gender:'f'},
      {name:'Sardine',emoji:'🐟',fill:'#B3C6FF',gender:'f'},{name:'Crab',emoji:'🦀',fill:'#D98C4F',gender:'m'},
      {name:'Octopus',emoji:'🐙',fill:'#8B5FCC',gender:'f'},{name:'Sushi',emoji:'🍣',fill:'#D47B8A',gender:'f'},
    ]},
    iguanamode:{label:'Iguana Mode 🦎',icons:'🪰🦟🪲',sfx:'fly',items:[
      {name:'Fly',emoji:'🪰',fill:'#6BA392',gender:'m'},{name:'Mosquito',emoji:'🦟',fill:'#5CB85C',gender:'f'},
      {name:'Beetle',emoji:'🪲',fill:'#D98C4F',gender:'m'},{name:'Cricket',emoji:'🦗',fill:'#B8E994',gender:'m'},
      {name:'Dragonfly',emoji:'🪰',fill:'#4AADCC',gender:'f'},{name:'Ladybug',emoji:'🐞',fill:'#E06060',gender:'f'},
      {name:'Butterfly',emoji:'🦋',fill:'#D4B3FF',gender:'f'},{name:'Ant',emoji:'🐜',fill:'#C4B44D',gender:'m'},
      {name:'Caterpillar',emoji:'🐛',fill:'#5CB85C',gender:'f'},{name:'Worm',emoji:'🪱',fill:'#D47B8A',gender:'m'},
    ]},
    numbers:{label:'Numbers 123',icons:'1️⃣2️⃣3️⃣',sfx:null,items:[
      {name:'One',emoji:'1️⃣',fill:'#E06060',gender:'f'},{name:'Two',emoji:'2️⃣',fill:'#5B7FD4',gender:'m'},
      {name:'Three',emoji:'3️⃣',fill:'#5CB85C',gender:'f'},{name:'Four',emoji:'4️⃣',fill:'#8B5FCC',gender:'m'},
      {name:'Five',emoji:'5️⃣',fill:'#CC5BA8',gender:'f'},{name:'Six',emoji:'6️⃣',fill:'#4AADCC',gender:'m'},
      {name:'Seven',emoji:'7️⃣',fill:'#D98C4F',gender:'f'},{name:'Eight',emoji:'8️⃣',fill:'#3DAD8E',gender:'m'},
      {name:'Nine',emoji:'9️⃣',fill:'#D47B8A',gender:'f'},{name:'Ten',emoji:'🔟',fill:'#6BA392',gender:'m'},
    ]},
    abcs:{label:'ABCs',icons:'🔤🅰️🅱️',sfx:null,items:[
      {name:'A is for Apple',emoji:'🍎',fill:'#E06060',gender:'f'},{name:'B is for Ball',emoji:'⚽',fill:'#5B7FD4',gender:'m'},
      {name:'C is for Cat',emoji:'🐱',fill:'#FFDAB3',gender:'f'},{name:'D is for Dog',emoji:'🐶',fill:'#D98C4F',gender:'m'},
      {name:'E is for Egg',emoji:'🥚',fill:'#FAEDCB',gender:'f'},{name:'F is for Fish',emoji:'🐟',fill:'#4AADCC',gender:'m'},
      {name:'G is for Grape',emoji:'🍇',fill:'#8B5FCC',gender:'f'},{name:'H is for Hat',emoji:'🎩',fill:'#2C3E50',gender:'m'},
      {name:'I is for Ice Cream',emoji:'🍦',fill:'#FFB3EC',gender:'f'},{name:'J is for Juice',emoji:'🧃',fill:'#5CB85C',gender:'m'},
      {name:'K is for Kite',emoji:'🪁',fill:'#CC5BA8',gender:'f'},{name:'L is for Lion',emoji:'🦁',fill:'#C4A24D',gender:'m'},
      {name:'M is for Moon',emoji:'🌙',fill:'#B3C6FF',gender:'f'},{name:'N is for Nose',emoji:'👃',fill:'#D47B8A',gender:'m'},
      {name:'O is for Orange',emoji:'🍊',fill:'#D98C4F',gender:'f'},{name:'P is for Pig',emoji:'🐷',fill:'#FFB3B3',gender:'m'},
      {name:'Q is for Queen',emoji:'👑',fill:'#FFDAB3',gender:'f'},{name:'R is for Rain',emoji:'🌧️',fill:'#B3F0FF',gender:'m'},
      {name:'S is for Star',emoji:'⭐',fill:'#FECA57',gender:'f'},{name:'T is for Tree',emoji:'🌳',fill:'#5CB85C',gender:'m'},
      {name:'U is for Umbrella',emoji:'☂️',fill:'#5B7FD4',gender:'f'},{name:'V is for Violin',emoji:'🎻',fill:'#D98C4F',gender:'m'},
      {name:'W is for Whale',emoji:'🐳',fill:'#4AADCC',gender:'f'},{name:'X is for Xylophone',emoji:'🎵',fill:'#3DAD8E',gender:'m'},
      {name:'Y is for Yarn',emoji:'🧶',fill:'#E06060',gender:'f'},{name:'Z is for Zebra',emoji:'🦓',fill:'#6BA392',gender:'m'},
    ]},
    shapes:{label:'Shapes',icons:'🔵🔺⭐',sfx:null,items:[
      {name:'Circle',emoji:'🔵',fill:'#5B7FD4',gender:'f'},{name:'Square',emoji:'🟧',fill:'#D98C4F',gender:'m'},
      {name:'Triangle',emoji:'🔺',fill:'#E06060',gender:'f'},{name:'Star',emoji:'⭐',fill:'#FECA57',gender:'m'},
      {name:'Heart',emoji:'❤️',fill:'#CC5BA8',gender:'f'},{name:'Diamond',emoji:'💎',fill:'#4AADCC',gender:'m'},
      {name:'Moon',emoji:'🌙',fill:'#B3C6FF',gender:'f'},{name:'Oval',emoji:'🥚',fill:'#FAEDCB',gender:'m'},
    ]},
    colors:{label:'Colors',icons:'🔴🟢🔵',sfx:null,items:[
      {name:'Red',emoji:'🔴',fill:'#E06060',gender:'f'},{name:'Blue',emoji:'🔵',fill:'#5B7FD4',gender:'m'},
      {name:'Green',emoji:'🟢',fill:'#5CB85C',gender:'f'},{name:'Yellow',emoji:'🟡',fill:'#FECA57',gender:'m'},
      {name:'Orange',emoji:'🟠',fill:'#D98C4F',gender:'f'},{name:'Purple',emoji:'🟣',fill:'#8B5FCC',gender:'m'},
      {name:'Pink',emoji:'💗',fill:'#FFB3EC',gender:'f'},{name:'Brown',emoji:'🟤',fill:'#C4A24D',gender:'m'},
      {name:'White',emoji:'⚪',fill:'#E8E8E8',gender:'f'},{name:'Black',emoji:'⚫',fill:'#2C3E50',gender:'m'},
    ]}
  };

  var MUSIC_MODES=['Off','Baby Jingle','Baby Rock','Chill Lo-fi','Jungle Beat','Adventure','Space'];
  var ACCENTS=[
    {key:'us',flag:'🇺🇸',label:'US',lang:'en-US'},{key:'uk',flag:'🇬🇧',label:'UK',lang:'en-GB'},
    {key:'au',flag:'🇦🇺',label:'Aussie',lang:'en-AU'},{key:'in',flag:'🇮🇳',label:'Indian',lang:'en-IN'},
    {key:'mx',flag:'🇲🇽',label:'Mexico',lang:'es-MX'},{key:'es',flag:'🇪🇸',label:'Spain',lang:'es-ES'},
    {key:'fr',flag:'🇫🇷',label:'French',lang:'fr-FR'},{key:'br',flag:'🇧🇷',label:'Brazil',lang:'pt-BR'},
    {key:'de',flag:'🇩🇪',label:'German',lang:'de-DE'},{key:'jp',flag:'🇯🇵',label:'Japanese',lang:'ja-JP'},
    {key:'kr',flag:'🇰🇷',label:'Korean',lang:'ko-KR'},{key:'cn',flag:'🇨🇳',label:'Chinese',lang:'zh-CN'},
  ];

  var DB_NAME='SlapHappyDB',DB_VERSION=1,STORE_NAME='family',db=null;
  function openDB(cb){var req=indexedDB.open(DB_NAME,DB_VERSION);req.onupgradeneeded=function(e){var d=e.target.result;if(!d.objectStoreNames.contains(STORE_NAME))d.createObjectStore(STORE_NAME,{keyPath:'key'});};req.onsuccess=function(e){db=e.target.result;cb();};req.onerror=function(){cb();};}
  function saveToDB(data,cb){if(!db){if(cb)cb();return;}var tx=db.transaction(STORE_NAME,'readwrite');tx.objectStore(STORE_NAME).put({key:'familyData',value:data});tx.oncomplete=function(){if(cb)cb();};tx.onerror=function(){if(cb)cb();};}
  function loadFromDB(cb){if(!db){cb(null);return;}var tx=db.transaction(STORE_NAME,'readonly');var req=tx.objectStore(STORE_NAME).get('familyData');req.onsuccess=function(e){cb(e.target.result?e.target.result.value:null);};req.onerror=function(){cb(null);};}

  function serializeFamily(family,activeThemes,selectedAccent,settings){
    return {
      members:family.map(function(f){return{name:f.name,nickname:f.nickname||'',fill:f.fill,gender:f.gender,accent:f.accent||'',photo:f.photo,group:f.group,custom:f.custom};}),
      themes:activeThemes,accent:selectedAccent,
      babyName:(settings&&settings.babyName)||'',bubbleCount:(settings&&settings.bubbleCount)||5,
      defaultMusic:(settings&&typeof settings.defaultMusic==='number')?settings.defaultMusic:3
    };
  }

  function deserializeFamily(data){
    var members=Array.isArray(data)?data:data.members;
    var themes=Array.isArray(data)?[]:(data.themes||[]);
    var accent=Array.isArray(data)?'us':(data.accent||'us');
    var result=members.map(function(f){
      var entry={name:f.name,nickname:f.nickname||'',fill:f.fill,gender:f.gender,accent:f.accent||'',photo:f.photo||null,img:null,group:f.group,custom:!!f.custom};
      if(entry.photo){var gi=new Image();gi.onload=function(){entry.img=gi;};gi.src=entry.photo;}
      return entry;
    });
    colorIdx=result.length;
    return{members:result,themes:themes,accent:accent,
      babyName:data.babyName||'',bubbleCount:data.bubbleCount||5,
      defaultMusic:(typeof data.defaultMusic==='number')?data.defaultMusic:3};
  }

  // Helper: get display name for a family member
  function displayName(f){return f.nickname||f.name;}

  window.SH=window.SH||{};
  window.SH.LIGHT_PASTELS=LIGHT_PASTELS;window.SH.DARK_PASTELS=DARK_PASTELS;window.SH.ALL_PASTELS=ALL_PASTELS;
  window.SH.DEFAULT_FAMILY=DEFAULT_FAMILY;window.SH.GROUPS=GROUPS;window.SH.THEMES=THEMES;
  window.SH.MUSIC_MODES=MUSIC_MODES;window.SH.ACCENTS=ACCENTS;window.SH.nextColor=nextColor;
  window.SH.openDB=openDB;window.SH.saveToDB=saveToDB;window.SH.loadFromDB=loadFromDB;
  window.SH.serializeFamily=serializeFamily;window.SH.deserializeFamily=deserializeFamily;
  window.SH.displayName=displayName;
})();
