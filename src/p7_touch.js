/* ---------------- 触屏控制（手机 / 平板） ---------------- */
const TC={roles:new Map(),sid:null,sx:0,sy:0,kx:0,ky:0,vis:false,pm:false,rotOff:false,fsTried:false};
const TCR=60;
const TCK={atk:'KeyJ',heavy:'KeyI',parry:'KeyK',dodge:'KeyL',heal:'KeyQ',jump:'Space'};
const $e=id=>document.getElementById(id);
function tcKeyOn(c){if(!keys[c]){keys[c]=true;anyKeyAction(c)}}
function tcKeyOff(c){keys[c]=false}
function tcBtn(a,el,down){
  if(down)el.classList.add('down');else el.classList.remove('down');
  AU.init();if(AU.c&&AU.c.state==='suspended')AU.c.resume();
  if(a==='pause'){if(down)togglePause();return}
  const c=TCK[a];if(!c)return;if(down)tcKeyOn(c);else tcKeyOff(c);
}
function tcStickSet(x,y){
  let dx=x-TC.sx,dy=y-TC.sy;const d=Math.hypot(dx,dy);if(d>TCR){dx*=TCR/d;dy*=TCR/d}
  TC.kx=dx;TC.ky=dy;const s=$e('stk').style;s.setProperty('--kx',dx+'px');s.setProperty('--ky',dy+'px');
  const L=dx<-TCR*.3,R=dx>TCR*.3,D=dy>TCR*.7;
  if(L)tcKeyOn('ArrowLeft');else tcKeyOff('ArrowLeft');
  if(R)tcKeyOn('ArrowRight');else tcKeyOff('ArrowRight');
  if(D)keys.ArrowDown=true;else keys.ArrowDown=false;
}
function tcStickEnd(){TC.sid=null;TC.kx=TC.ky=0;tcKeyOff('ArrowLeft');tcKeyOff('ArrowRight');keys.ArrowDown=false;
  const e=$e('stk');e.classList.remove('act');e.style.left='';e.style.bottom='';e.style.removeProperty('--kx');e.style.removeProperty('--ky')}
function tcReleaseAll(){
  for(const [id,r] of TC.roles)if(r.k==='b')tcBtn(r.a,r.el,false);
  TC.roles.clear();if(TC.sid!==null)tcStickEnd();
  document.querySelectorAll('#tc .tb.down').forEach(e=>e.classList.remove('down'));
  for(const c of Object.values(TCK))keys[c]=false;
}
function tcFullscreen(){
  if(TC.fsTried)return;TC.fsTried=true;
  try{const d=document.documentElement;if(!document.fullscreenElement&&d.requestFullscreen){const p=d.requestFullscreen();if(p&&p.catch)p.catch(()=>{})}}catch(_){}
  try{if(screen.orientation&&screen.orientation.lock){const p=screen.orientation.lock('landscape');if(p&&p.catch)p.catch(()=>{})}}catch(_){}
}
function tcTitleFromPause(){G.paused=false;G.mode='title';G.player=null;G.enemies=[];G.fade=1}
function tcMenu(m){
  if(m==='resume')togglePause();
  else if(m==='mute'){AU.init();AU.setMute(!AU.muted)}
  else if(m==='fs'){try{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen()}catch(_){}}
  else if(m==='title')tcTitleFromPause();
}
document.addEventListener('touchstart',e=>{
  if(!TOUCH){TOUCH=true;document.body.classList.add('touch');resize()}
  const pm=e.target.closest&&e.target.closest('#pm [data-m]');
  if(pm){tcMenu(pm.dataset.m);e.preventDefault();return}
  if(e.target.id==='rot'){TC.rotOff=true;e.preventDefault();return}
  if(!TC.vis){e.preventDefault();return}
  for(const t of e.changedTouches){
    const el=t.target&&t.target.closest?t.target.closest('[data-a]'):null;
    if(el){TC.roles.set(t.identifier,{k:'b',a:el.dataset.a,el});tcBtn(el.dataset.a,el,true)}
    else if(TC.sid===null&&t.clientX<innerWidth*.5){
      TC.sid=t.identifier;TC.sx=t.clientX;TC.sy=t.clientY;TC.roles.set(t.identifier,{k:'s'});
      const s=$e('stk');s.classList.add('act');s.style.left=(t.clientX-68)+'px';s.style.bottom=(innerHeight-t.clientY-68)+'px';tcStickSet(t.clientX,t.clientY);
    }
  }
  e.preventDefault();
},{passive:false});
document.addEventListener('touchmove',e=>{
  for(const t of e.changedTouches){const r=TC.roles.get(t.identifier);if(r&&r.k==='s')tcStickSet(t.clientX,t.clientY)}
  e.preventDefault();
},{passive:false});
function tcEnd(e){
  for(const t of e.changedTouches){
    const r=TC.roles.get(t.identifier);if(!r)continue;
    if(r.k==='s')tcStickEnd();else if(r.k==='b')tcBtn(r.a,r.el,false);
    TC.roles.delete(t.identifier);
  }
  if(e.cancelable)e.preventDefault();
}
document.addEventListener('touchend',tcEnd,{passive:false});
document.addEventListener('touchcancel',tcEnd,{passive:false});
document.addEventListener('gesturestart',e=>e.preventDefault());
document.addEventListener('visibilitychange',()=>{if(document.hidden&&TOUCH&&G&&G.mode==='play')togglePause(true)});
// 轻触屏幕：标题 / 序章 / 死亡 / 结局 时等同回车（标题页的首次轻触同时尝试全屏）
document.addEventListener('pointerdown',e=>{
  if(!TOUCH||e.pointerType==='mouse')return;
  AU.init();
  if(G.mode==='title'){tcFullscreen();press.ok=performance.now()}
  else if(G.mode==='story')press.ok=performance.now();
  else if(G.ending||(G.player&&G.player.dead))press.ok=performance.now();
});
function tcFrame(dt){
  const play=TOUCH&&G&&G.mode==='play'&&!G.paused&&!G.ending&&!!G.player;
  if(play!==TC.vis){TC.vis=play;$e('tc').classList.toggle('on',play);if(!play)tcReleaseAll()}
  const pm=TOUCH&&G&&G.mode==='play'&&G.paused;
  if(pm!==TC.pm){TC.pm=pm;$e('pm').classList.toggle('on',pm);if(pm)$e('pm').querySelector('[data-m=mute]').textContent=AU.muted?'开启声音':'静音'}
  const rot=TOUCH&&!TC.rotOff&&innerHeight>innerWidth;
  $e('rot').style.display=rot?'block':'none';
}
