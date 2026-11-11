(function(){
"use strict";
var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
var FINE = matchMedia('(pointer: fine)').matches;
var DESK = matchMedia('(min-width: 900px)').matches;
var doc = document.documentElement;
if(RM) doc.classList.add('rm');
var hasGsap = typeof gsap !== 'undefined';
if(hasGsap){ gsap.registerPlugin(ScrollTrigger, ScrollToPlugin); }
function q(s,c){return (c||document).querySelector(s)}
function qa(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))}

/* ---------- clock & year ---------- */
q('#yr').textContent = new Date().getFullYear();
function tick(){ try{ q('#clock').textContent = new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',hour:'2-digit',minute:'2-digit'}).format(new Date()); }catch(e){} }
tick(); setInterval(tick, 30000);

/* ---------- marquee duplicate ---------- */
var marq=q('#marq'); if(marq){ marq.innerHTML += marq.innerHTML; }

/* ---------- custom cursor ---------- */
if(FINE && !RM && hasGsap){
  doc.classList.add('cursor-on');
  var dot=q('.cur-dot'), ring=q('.cur-ring'), mx=innerWidth/2,my=innerHeight/2, rx=mx, ry=my;
  addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;
    gsap.set(dot,{x:mx,y:my});});
  gsap.ticker.add(function(){ rx+=(mx-rx)*.16; ry+=(my-ry)*.16; gsap.set(ring,{x:rx,y:ry}); });
  document.addEventListener('mouseover',function(e){ if(e.target.closest('a,button,[data-cursor]')) ring.classList.add('big'); });
  document.addEventListener('mouseout',function(e){ if(e.target.closest('a,button,[data-cursor]')) ring.classList.remove('big'); });
}

/* ---------- magnetic buttons ---------- */
if(FINE && !RM && hasGsap){
  qa('.mag').forEach(function(el){
    el.addEventListener('mousemove',function(e){
      var r=el.getBoundingClientRect();
      gsap.to(el,{x:(e.clientX-r.left-r.width/2)*.25,y:(e.clientY-r.top-r.height/2)*.35,duration:.4,ease:'power3.out'});
    });
    el.addEventListener('mouseleave',function(){ gsap.to(el,{x:0,y:0,duration:.6,ease:'elastic.out(1,.4)'}); });
  });
}

/* ---------- tilt cards ---------- */
if(FINE && !RM && hasGsap){
  qa('.tilt').forEach(function(el){
    el.addEventListener('mousemove',function(e){
      var r=el.getBoundingClientRect();
      gsap.to(el,{rotateY:((e.clientX-r.left)/r.width-.5)*7,rotateX:-((e.clientY-r.top)/r.height-.5)*7,transformPerspective:700,duration:.4});
    });
    el.addEventListener('mouseleave',function(){ gsap.to(el,{rotateX:0,rotateY:0,duration:.6,ease:'power2.out'}); });
  });
}

/* ---------- menu ---------- */
var menuBtn=q('#menuBtn');
function setMenu(open){
  doc.classList.toggle('menu-open',open);
  menuBtn.setAttribute('aria-expanded',open);
  menuBtn.textContent = open?'Close':'Menu';
  if(open && hasGsap && !RM) gsap.fromTo('.menu-link',{y:56,autoAlpha:0},{y:0,autoAlpha:1,duration:.7,stagger:.05,ease:'power3.out',delay:.08});
}
menuBtn.addEventListener('click',function(){ setMenu(!doc.classList.contains('menu-open')); });
addEventListener('keydown',function(e){ if(e.key==='Escape') setMenu(false); });
qa('.menu-link').forEach(function(a){
  a.addEventListener('click',function(e){
    var id=a.getAttribute('href');
    if(id.charAt(0)==='#'){ e.preventDefault(); setMenu(false);
      if(hasGsap && !RM) gsap.to(window,{scrollTo:{y:id,autoKill:true},duration:1.1,ease:'power2.inOut'});
      else q(id).scrollIntoView();
    } else setMenu(false);
  });
});

/* ---------- split hero chars ---------- */
function split(el){
  var t=el.textContent; el.textContent='';
  var frag=document.createDocumentFragment();
  t.split('').forEach(function(ch){ var s=document.createElement('span'); s.className='ch'; s.innerHTML=(ch===' ')?'&nbsp;':ch; frag.appendChild(s); });
  el.appendChild(frag); return qa('.ch',el);
}

/* ---------- preloader + hero intro ---------- */
var pre=q('#pre');
function heroIntro(instant){
  if(!hasGsap || instant){ return; }
  if(!q('#ln1')||!q('#ln2')){
    gsap.from('[data-hero]',{y:34,autoAlpha:0,duration:.9,stagger:.09,ease:'power3.out'});
    return;
  }
  var chars1=split(q('#ln1')), chars2=split(q('#ln2'));
  var tl=gsap.timeline();
  tl.from(chars1,{yPercent:112,rotate:5,duration:1,stagger:.035,ease:'power4.out'},0)
    .from(chars2,{yPercent:112,rotate:-4,duration:1,stagger:.035,ease:'power4.out'},.12)
    .from('[data-hero]',{y:34,autoAlpha:0,duration:.9,stagger:.09,ease:'power3.out'},.45)
    .from('.scrollcue',{autoAlpha:0,duration:.8},1)
    .call(typeGreet,null,1.05);
}
function typeGreet(){
  var el=q('#greet'); if(!el) return;
  var hr=new Date().getHours();
  try{hr=parseInt(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',hour:'2-digit',hour12:false}).format(new Date()),10);}catch(e){}
  var g=hr<12?'Good morning':hr<18?'Good afternoon':'Good evening';
  var full='// '+g+' — DHE core online · systems nominal';
  if(!hasGsap||RM){el.textContent=full;return;}
  var o={i:0}; el.classList.add('typing');
  gsap.to(o,{i:full.length,duration:1.5,ease:'none',
    onUpdate:function(){el.textContent=full.slice(0,Math.round(o.i));},
    onComplete:function(){el.classList.remove('typing');}});
}
if(!pre){
  if(hasGsap && !RM) heroIntro(false);
}else if(hasGsap && !RM){
  var n={v:0}, num=q('#preNum'), boot=q('#preBoot');
  var lines=['Initialising DHE core','Calibrating sensor array','Syncing structural twin','All systems nominal'];
  var ptl=gsap.timeline({onComplete:function(){
    gsap.to(pre,{yPercent:-100,duration:.8,ease:'power4.inOut',onComplete:function(){pre.style.display='none';}});
    heroIntro(false);
  }});
  ptl.to(n,{v:100,duration:1.5,ease:'power2.inOut',onUpdate:function(){num.textContent=String(Math.round(n.v)).padStart(3,'0');}},0)
     .to('#preBar',{scaleX:1,duration:1.5,ease:'power2.inOut'},0);
  lines.forEach(function(l,i){ ptl.call(function(){boot.textContent=l;},null,i*.42); });
}else{
  pre.style.display='none';
  typeGreet();
}

/* ---------- chapters: rail + hud ---------- */
var chapters=qa('[data-ch]').map(function(s){ return [s.id, s.dataset.ch]; });
var ticksBox=q('#ticks'), hudCh=q('#hudCh');
if(ticksBox && chapters.length>1) chapters.forEach(function(c,i){
  var t=document.createElement('i'); t.className='rail-tick'; t.style.top=(i/(chapters.length-1)*100)+'%'; t.dataset.ch=c[0]; ticksBox.appendChild(t);
});
if(hasGsap){
  chapters.forEach(function(c){
    ScrollTrigger.create({trigger:'#'+c[0],start:'top 55%',end:'bottom 55%',
      onToggle:function(self){ if(self.isActive){ hudCh.textContent=c[1];
        qa('.rail-tick').forEach(function(t){t.classList.toggle('on',t.dataset.ch===c[0])}); } }});
  });
  ScrollTrigger.create({start:0,end:function(){return document.documentElement.scrollHeight-innerHeight},
    onUpdate:function(s){ q('#hudDepth').textContent=(s.progress*42).toFixed(1)+' M'; gsap.set('.rail-prog',{scaleY:s.progress}); }});
}

/* ---------- horizontal framework ---------- */
var hTween=null;
if(hasGsap && q('#fwTrack')){
  var mm=gsap.matchMedia();
  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)',function(){
    var track=q('#fwTrack');
    var amt=function(){return track.scrollWidth - innerWidth};
    hTween=gsap.to(track,{x:function(){return -amt()},ease:'none',
      scrollTrigger:{trigger:'#framework',start:'top top',end:function(){return '+='+amt()},scrub:1,pin:true,anticipatePin:1,invalidateOnRefresh:true}});
    drawSchems(true);
    return function(){ hTween=null; };
  });
  mm.add('(max-width: 899px), (prefers-reduced-motion: reduce)',function(){ drawSchems(false); });
}
function drawSchems(horizontal){
  if(!hasGsap) return;
  qa('.fw-schem').forEach(function(svg){
    qa('path,circle,line,rect',svg).forEach(function(p){
      var len=0; try{len=p.getTotalLength();}catch(e){len=300;}
      gsap.set(p,{strokeDasharray:len,strokeDashoffset:len});
      var st={once:true, start: horizontal?'left 75%':'top 80%'};
      if(horizontal && hTween){ st.containerAnimation=hTween; st.trigger=svg; }
      else { st.trigger=svg; }
      gsap.to(p,{strokeDashoffset:0,duration:RM?0:1.4,ease:'power2.inOut',scrollTrigger:st});
    });
  });
}

/* ---------- reveals ---------- */
if(hasGsap && !RM){
  qa('[data-rev]').forEach(function(el){
    gsap.from(el,{y:44,autoAlpha:0,duration:1,ease:'power3.out',
      scrollTrigger:{trigger:el,start:'top 86%',once:true}});
  });
}

/* ---------- counters ---------- */
if(hasGsap){
  qa('[data-count]').forEach(function(el){
    var end=parseInt(el.dataset.count,10), o={v:0};
    ScrollTrigger.create({trigger:el,start:'top 88%',once:true,onEnter:function(){
      if(RM){el.textContent=end;return;}
      gsap.to(o,{v:end,duration:1.6,ease:'power2.out',onUpdate:function(){el.textContent=Math.round(o.v);}});
    }});
  });
}

/* ---------- image scan reveals ---------- */
if(hasGsap && !RM){
  qa('[data-scan]').forEach(function(fig){
    var img=q('img',fig), veil=q('.veil',fig);
    var tl=gsap.timeline({scrollTrigger:{trigger:fig,start:'top 82%',once:true}});
    tl.to(veil,{yPercent:102,duration:1.1,ease:'power4.inOut'},0)
      .to(img,{scale:1,duration:1.5,ease:'power3.out'},.1);
  });
}else{
  qa('.veil').forEach(function(v){v.style.display='none'});
  qa('.scan img').forEach(function(i){i.style.transform='none'});
}

/* ---------- timeline spine draw ---------- */
if(hasGsap && !RM){
  var spine=q('#spineDraw'), tbox=q('#tline');
  if(spine && tbox){
    var H=function(){return tbox.offsetHeight};
    gsap.set(spine,{attr:{y2:0}});
    gsap.to(spine,{attr:{y2:function(){return H()}},ease:'none',
      scrollTrigger:{trigger:tbox,start:'top 70%',end:'bottom 60%',scrub:1,invalidateOnRefresh:true}});
  }
}

/* ---------- THREE.js sea + monopile ---------- */
(function(){
  var stage=q('#stage'), renderer;
  if(!stage) return;
  if(RM || typeof THREE==='undefined'){ doc.classList.add(RM?'rm':'no-webgl'); return; }
  try{
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  }catch(e){ doc.classList.add('no-webgl'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
  renderer.setSize(stage.clientWidth,stage.clientHeight);
  stage.appendChild(renderer.domElement);
  var scene=new THREE.Scene();
  scene.fog=new THREE.Fog(0x04101c,16,46);
  var cam=new THREE.PerspectiveCamera(55,stage.clientWidth/stage.clientHeight,.1,100);
  cam.position.set(0,6.2,17);

  var segX=DESK?110:56, segY=DESK?70:36;
  var geo=new THREE.PlaneGeometry(64,42,segX,segY);
  var uni={uTime:{value:0}};
  var vsh='uniform float uTime;varying float vE;varying float vD;'+
    'void main(){vec3 p=position;'+
    'float e=.42*sin(p.x*.32+uTime*.85)+.28*sin(p.y*.48+uTime*.62)+.16*sin((p.x+p.y)*.22-uTime*1.25)+.1*sin(p.x*.9-uTime*1.7);'+
    'p.z+=e; vE=e;'+
    'vec4 mv=modelViewMatrix*vec4(p,1.);vD=-mv.z;'+
    'gl_Position=projectionMatrix*mv;}';
  var mat=new THREE.ShaderMaterial({
    uniforms:uni,
    vertexShader:vsh,
    fragmentShader:'varying float vE;varying float vD;'+
      'void main(){vec3 deep=vec3(.012,.085,.15);vec3 crest=vec3(.09,.36,.56);'+
      'vec3 c=mix(deep,crest,smoothstep(-.7,1.,vE));'+
      'float f=smoothstep(13.,44.,vD);'+
      'c=mix(c,vec3(.016,.063,.11),f);'+
      'gl_FragColor=vec4(c,1.);}'
  });
  var sea=new THREE.Mesh(geo,mat); sea.rotation.x=-Math.PI/2; scene.add(sea);
  var wire=new THREE.Mesh(geo,new THREE.ShaderMaterial({uniforms:uni,wireframe:true,transparent:true,
    vertexShader:vsh,
    fragmentShader:'varying float vE;varying float vD;void main(){float f=1.-smoothstep(10.,40.,vD);gl_FragColor=vec4(.31,.85,1.,.09*f);}'}));
  wire.rotation.x=-Math.PI/2; wire.position.y=.02; scene.add(wire);

  // monopile (edges cylinder)
  var pileGeo=new THREE.CylinderGeometry(1.05,1.35,30,20,6,true);
  var pile=new THREE.LineSegments(new THREE.EdgesGeometry(pileGeo,12),new THREE.LineBasicMaterial({color:0x9ec5d6,transparent:true,opacity:.34}));
  pile.position.set(7.5,3,-2); scene.add(pile);
  // sensors
  var sensors=[]; var sGeo=new THREE.SphereGeometry(.2,12,12);
  for(var i=0;i<5;i++){
    var amber=(i===1);
    var m=new THREE.Mesh(sGeo,new THREE.MeshBasicMaterial({color:amber?0xffb454:0x4fd8ff}));
    m.position.set(7.5+(i%2? .95:-.95),12-i*5.4,-2); m.userData.ph=i*1.3; scene.add(m); sensors.push(m);
  }
  // transmission: static dashed link + travelling data packets
  var A=new THREE.Vector3(7.5,18,-2), B=new THREE.Vector3(21,27,-7);
  var lg=new THREE.BufferGeometry().setFromPoints([A,B]);
  var dash=new THREE.Line(lg,new THREE.LineDashedMaterial({color:0x4fd8ff,dashSize:.55,gapSize:.5,transparent:true,opacity:.55}));
  dash.computeLineDistances(); scene.add(dash);
  var packets=[]; var pGeo=new THREE.SphereGeometry(.13,10,10);
  for(var k=0;k<3;k++){
    var pk=new THREE.Mesh(pGeo,new THREE.MeshBasicMaterial({color:0x4fd8ff,transparent:true,opacity:.95}));
    pk.userData.off=k/3; scene.add(pk); packets.push(pk);
  }

  var mxT=0,myT=0;
  if(FINE) addEventListener('mousemove',function(e){ mxT=(e.clientX/innerWidth-.5)*2; myT=(e.clientY/innerHeight-.5)*2; });

  var visible=true;
  new IntersectionObserver(function(en){visible=en[0].isIntersecting;},{threshold:0}).observe(stage);

  var clock=new THREE.Clock();
  function loop(){
    requestAnimationFrame(loop);
    if(!visible) return;
    var t=clock.getElapsedTime();
    uni.uTime.value=t;
    sensors.forEach(function(s,i){var k=1+Math.sin(t*2+s.userData.ph)*.35;s.scale.setScalar(k);});
    packets.forEach(function(pk){var u=(t*.22+pk.userData.off)%1;pk.position.lerpVectors(A,B,u);pk.material.opacity=.95*(1-Math.abs(u-.5)*1.4);});
    cam.position.x+=((mxT*1.4)-cam.position.x)*.03;
    cam.position.y+=((6.2 - myT*.8)-cam.position.y)*.03;
    cam.lookAt(1.5,2.2,0);
    renderer.render(scene,cam);
  }
  loop();
  addEventListener('resize',function(){
    renderer.setSize(stage.clientWidth,stage.clientHeight);
    cam.aspect=stage.clientWidth/stage.clientHeight; cam.updateProjectionMatrix();
  });
})();

addEventListener('load',function(){ if(hasGsap) ScrollTrigger.refresh(); });
})();
