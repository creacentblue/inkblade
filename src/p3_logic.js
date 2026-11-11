/* ---------------- game state ---------------- */
const G={mode:'title',t:0,cam:{x:0,y:0},shake:0,hitstop:0,slowT:0,slowScale:1,flash:0,flashCol:'#fff',zoom:1,
 enemies:[],boss:null,proj:[],player:null,cp:0,bossActive:false,bossLocked:false,gateOpen:false,
 hint:null,hintT:0,shown:{},deaths:0,time:0,deathT:0,endT:0,counterBanner:0,paused:false,stats:{kills:0,pp:0,pd:0,exec:0},storyT:0,fade:0,bossIntro:0,lightning:0,nextLightning:6,msg:null,msgT:0,
 get ts(){return this.slowT>0?this.slowScale:1}};
function setSlow(t,s){G.slowT=Math.max(G.slowT,t);G.slowScale=s}
function shake(v){G.shake=Math.max(G.shake,v)}
function hitstop(t){G.hitstop=Math.max(G.hitstop,t)}
function flash(a,col){G.flash=a;G.flashCol=col||'#fff'}

/* ---------------- collision ---------------- */
function solid(p){return p.kind!=='awn'}
function moveCollide(o,dt,dropThrough){
  const pw=o.w/2;
  o.x+=o.vx*dt;o.hitWall=0;
  for(const p of PL){if(!solid(p))continue;if(o.y>p.y+3&&o.y-o.h<p.y+p.h){const l=o.x-pw,r=o.x+pw;if(r>p.x&&l<p.x+p.w){if(o.mantle&&o.y-p.y<=30&&o.vy>=-120&&!(p.kind==='pillar'&&false)){o.y=p.y;o.vy=0;o.onGround=true;o.plat=p;continue}if(o.x<p.x+p.w/2){o.x=p.x-pw;o.hitWall=1}else{o.x=p.x+p.w+pw;o.hitWall=-1}o.vx=0}}}
  const prevY=o.y;o.y+=o.vy*dt;o.onGround=false;
  for(const p of PL){const l=o.x-pw,r=o.x+pw;if(r<=p.x||l>=p.x+p.w)continue;
    if(o.vy>=0&&prevY<=p.y+4&&o.y>=p.y){if(p.kind==='awn'&&dropThrough)continue;o.y=p.y;o.vy=0;o.onGround=true;o.plat=p}
    else if(solid(p)&&o.vy<0&&o.y-o.h<p.y+p.h&&prevY-o.h>=p.y+p.h-6){o.y=p.y+p.h+o.h;o.vy=0}}
}
function wallTouch(o,dir){const x=o.x+dir*(o.w/2+3);for(const p of PL){if(!solid(p))continue;if(x>p.x&&x<p.x+p.w&&o.y-10>p.y&&o.y-o.h<p.y+p.h)return true}return false}

/* ---------------- player ---------------- */
const ATKL=[
 {wu:.07,act:.1,rec:.2,reach:122,dmg:9,post:10,step:170,arc:[-2.0,.8]},
 {wu:.06,act:.1,rec:.2,reach:122,dmg:9,post:10,step:170,arc:[1.0,-1.7]},
 {wu:.13,act:.12,rec:.36,reach:145,dmg:15,post:18,step:280,arc:[-2.7,1.2],kb:380}];
const PW=.2; // perfect parry window (s)
function newPlayer(c){return{mantle:true,x:c.x,y:c.y,vx:0,vy:0,w:34,h:88,face:1,onGround:true,coyote:0,airJumps:0,wall:0,wallLock:0,hp:100,maxHp:100,hpLag:100,posture:0,maxPost:100,postT:0,
  act:null,st:0,dur:0,combo:0,comboT:0,queued:false,hitSet:new Set(),charge:0,heavyF:0,parryCd:0,parried:false,guarding:false,dodgeT:0,dodgeCd:0,dodgeDir:1,airDodge:false,dodgeI:0,
  invuln:0,hurtT:0,flasks:3,anim:0,dead:false,counterT:0,counterKind:'',counterTarget:null,safe:{x:c.x,y:c.y},safeT:0,trail:[],jumpHeld:false,landed:true,drinkOk:true,ground:0,speed:0,airAtk:false}}
function playerRect(p){return{x1:p.x-p.w/2,x2:p.x+p.w/2,y1:p.y-p.h,y2:p.y}}
function respawn(full){
  const c=CPS[G.cp];G.player=newPlayer(c);G.proj.length=0;G.fade=1;
  for(const e of G.enemies){if(e.dead)continue;resetEnemy(e)}
  if(G.boss&&!G.boss.dead){resetEnemy(G.boss)}
  G.bossActive=false;G.bossLocked=false;AU.boss=false;G.slowT=0;G.hitstop=0;G.zoom=1;PART.length=0;FX.length=0;TXT.length=0;
  G.cam.x=clamp(c.x-W*.42,0,LEVEL_END-W);G.cam.y=clamp(c.y-560,-150,120);
}
function hurtPlayerPit(){const p=G.player;p.hp-=18;p.x=p.safe.x;p.y=p.safe.y-2;p.vx=p.vy=0;p.invuln=1.4;p.act=null;shake(10);popText('坠',p.x,p.y-90,'#b3121a',70,.9);AU.hit(false);screenSplat(W/2,H*.8,160,'rgba(10,10,10,.8)',1);if(p.hp<=0)killPlayer()}
function killPlayer(){const p=G.player;if(p.dead)return;p.dead=true;p.hp=0;p.act='dead';p.st=0;G.deathT=0;G.deaths++;setSlow(1.4,.25);shake(16);flash(.6,'#b3121a');bloodBurst(p.x,p.y-50,-p.face,40,520,true);screenSplat(W*.5,H*.5,300,'rgba(150,12,18,.75)',3.2);AU.hit(true);AU.boom();G.hitstop=.12}

function playerTakeHit(src,a){
  const p=G.player;if(p.dead)return'none';
  if(p.act==='counter'||p.act==='exec')return'none';
  if(p.invuln>0){if(p.act==='dodge'&&p.dodgeI>0&&!src.dodgedFlag){src.dodgedFlag=true;perfectDodge(src)}return'dodge'}
  const front=(a.x>p.x)===(p.face>0);
  if(p.act==='parry'&&front&&!a.red){
    if(p.st<PW&&!p.parried){perfectParry(src,a);return'parry'}
    if(p.st>=PW&&p.guarding){ // block
      p.hp-=a.dmg*.12;p.posture+=a.post*1.15;p.vx=-p.face*240;p.parried=true;
      AU.clang(false);sparkBurst(p.x+p.face*30,p.y-62,12,380);ringFx(p.x+p.face*30,p.y-62,34,'#f4f0e6',.25,2);shake(3);hitstop(.04);
      if(p.hp<=0){killPlayer();return'hit'}
      if(p.posture>=p.maxPost)staggerPlayer();
      return'block'}}
  // clean hit
  let d=a.dmg*(p.act==='stagger'?1.4:1);p.hp-=d;p.posture=Math.min(p.maxPost,p.posture+a.post*.5);p.postT=0;p.act='hurt';p.st=0;p.dur=.3;p.hurtT=.3;p.invuln=.55;p.queued=false;p.charge=0;
  const dir=sgn(p.x-a.x);p.vx=dir*(a.red?460:300);p.vy=-170;p.onGround=false;p.face=-dir;
  bloodBurst(p.x,p.y-56,dir,16,360,true);decal(p.x,p.y,20,'#8e0f15');hitstop(.08);shake(a.red?12:7);AU.hit(!!a.red);screenSplat(p.x-G.cam.x+rand(-60,60),p.y-G.cam.y-60,70+d*3,'rgba(160,14,20,.8)',1.1);
  if(p.hp<=0)killPlayer();else if(p.posture>=p.maxPost)staggerPlayer();
  return'hit'}
function staggerPlayer(){const p=G.player;p.act='stagger';p.st=0;p.dur=1.0;p.posture=40;popText('失衡',p.x,p.y-110,'#d9d5cc',44,.9);AU.noise(.3,.4,'lowpass',500,100)}
function perfectParry(src,a){
  const p=G.player;p.parried=true;G.stats.pp++;p.posture=Math.max(0,p.posture-30);
  const px=p.x+p.face*34,py=p.y-64;
  AU.clang(true);sparkBurst(px,py,26,620);ringFx(px,py,80,'#fff',.4,5);ringFx(px,py,46,'#c4161c',.3,4);hitstop(.14);shake(6);flash(.25,'#fff');setSlow(.62,.25);popText('卸',p.x+p.face*50,p.y-120,'#c4161c',84,.8);
  p.counterT=.65;p.counterKind='parry';p.counterTarget=src.cfg?src:null;
  if(src.cfg){const e=src;e.state='parried';e.t=0;e.atk=null;e.glow=false;e.hitDone=true;e.posture+=(e.kind==='boss'?24:30);e.noHit=0;e.vx=-sgn(p.x-e.x)*140;if(e.posture>=e.maxPost)breakPosture(e)}
  else{reflectProj(src)}}
function reflectProj(pr){pr.vx=-pr.vx*1.3;pr.owner='player';pr.life=3;pr.parried=true;pr.dmg=0}
function perfectDodge(src){const p=G.player;G.stats.pd++;setSlow(.55,.35);p.dodgeCd=0;p.airDodge=false;popText('闪',p.x,p.y-120,'#d9d5cc',76,.7);AU.tone(1400,.4,.12,'sine',2400,1);ringFx(p.x,p.y-50,70,'#d9d5cc',.4,3);p.counterT=.5;p.counterKind='dodge';p.counterTarget=src.cfg?src:null}

/* ---------------- enemies ---------------- */
const ATKS={
 gSlash:{seq:[{wu:.55,act:.12,rec:.55,reach:128,dmg:12,post:14,lunge:200}]},
 gDouble:{seq:[{wu:.5,act:.1,rec:.12,reach:122,dmg:10,post:12,lunge:200},{wu:.3,act:.1,rec:.6,reach:128,dmg:12,post:14,lunge:220}]},
 gLunge:{seq:[{wu:.75,act:.2,rec:.8,reach:115,dmg:16,post:16,lunge:850,red:true}]},
 sThrust:{seq:[{wu:.62,act:.16,rec:.7,reach:240,dmg:14,post:16,yHi:-88,yLo:-48}]},
 sSweep:{seq:[{wu:.85,act:.2,rec:.85,reach:210,dmg:14,post:12,low:true,red:true}]},
 shBash:{seq:[{wu:.6,act:.14,rec:.75,reach:100,dmg:10,post:22,lunge:150}]},
 shChop:{seq:[{wu:1.0,act:.15,rec:.95,reach:125,dmg:20,post:25,red:true,lunge:60}]},
 // boss
 bCombo:{seq:[{wu:.55,act:.1,rec:.16,reach:155,dmg:15,post:14,lunge:260},{wu:.33,act:.1,rec:.16,reach:155,dmg:15,post:14,lunge:260},{wu:.6,act:.12,rec:.75,reach:185,dmg:24,post:20,lunge:380}]},
 bCombo4:{seq:[{wu:.45,act:.1,rec:.12,reach:155,dmg:14,post:14,lunge:260},{wu:.28,act:.1,rec:.12,reach:155,dmg:14,post:14,lunge:260},{wu:.28,act:.1,rec:.12,reach:155,dmg:14,post:14,lunge:260},{wu:.55,act:.12,rec:.7,reach:190,dmg:22,post:20,lunge:420}]},
 bDash:{seq:[{wu:.85,act:.22,rec:.85,reach:135,dmg:24,post:20,lunge:1200}]},
 bCrush:{seq:[{wu:1.1,act:.16,rec:1.0,reach:210,dmg:32,post:30,red:true,lunge:80,shock:true}]},
 bPhantom:{seq:[{wu:.62,act:0,rec:0,vanish:true},{wu:.4,act:.12,rec:.65,reach:160,dmg:18,post:16,lunge:200}]},
 bWave:{seq:[{wu:.72,act:.1,rec:.65,reach:0,dmg:0,post:0,proj:true}]},
 bWave2:{seq:[{wu:.65,act:.1,rec:.18,reach:0,dmg:0,post:0,proj:true},{wu:.3,act:.1,rec:.7,reach:0,dmg:0,post:0,proj:true,hi:true}]}
};
const ECFG={
 grunt:{w:36,h:86,sc:1,hp:36,post:40,speed:165,want:[85,115],range:128,atks:['gSlash','gSlash','gDouble','gLunge'],body:'#17171a',rim:'#c4bfb4',hat:'#0e0e10',eye:'#e0262d',weapon:'sword',wlen:68},
 spear:{w:36,h:86,sc:1,hp:44,post:50,speed:150,want:[190,235],range:250,atks:['sThrust','sThrust','sSweep'],body:'#1d1a19',rim:'#c4bfb4',hat:'#0e0e10',eye:'#e0262d',weapon:'spear',wlen:110},
 shield:{w:46,h:88,sc:1.04,hp:72,post:64,speed:105,want:[78,100],range:108,atks:['shBash','shBash','shChop'],body:'#161618',rim:'#c4bfb4',hat:'#0e0e10',eye:'#e0262d',weapon:'sword',wlen:56,shield:true},
 boss:{w:54,h:120,sc:1.32,hp:560,post:120,speed:190,want:[110,150],range:200,atks:[],body:'#0f0f12',rim:'#d4cfc4',eye:'#ff3a3a',weapon:'sword',wlen:78,blade:'#cfcac0'}
};
function makeEnemy(kind,x){
  const c=ECFG[kind];let pl=null;for(const p of PL){if(p.kind==='roof'&&x>=p.x&&x<=p.x+p.w)pl=p}
  const e={kind,cfg:c,x,y:pl.y,w:c.w,h:c.h,vx:0,face:-1,hp:c.hp,maxHp:c.hp,posture:0,maxPost:c.post,state:'idle',t:0,cd:rand(.3,1),aggro:false,atk:null,seq:null,step:0,phase:'wu',hitDone:false,noHit:0,
    minX:Math.max(pl.x+40,kind==='boss'?ARENA_L+34:0),maxX:Math.min(pl.x+pl.w-40,ARENA_R-30),spawnX:x,dead:false,alpha:1,turnT:0,anim:rand(0,9),runPh:0,moving:false,glow:false,cue:false,vis:true,flashT:0,invuln:false,ph:1,last:'',spd:1,spotX:0,deadT:0,hurtT:0};
  return e}
function resetEnemy(e){e.maxPost=e.cfg.post;e.spd=1;e.x=e.spawnX;e.hp=e.maxHp;e.posture=0;e.state='idle';e.t=0;e.aggro=false;e.atk=null;e.seq=null;e.vx=0;e.glow=false;e.vis=true;e.invuln=false;e.ph=1;e.cd=1;e.face=-1;e.alpha=1;e.last=''}
function initWorld(){G.enemies=SPAWNS.map(s=>makeEnemy(s[0],s[1]));G.boss=makeEnemy('boss',BOSS_X);G.boss.name='寒鸦判官'}
function enemyRect(e){return{x1:e.x-e.w/2,x2:e.x+e.w/2,y1:e.y-e.h,y2:e.y}}
const ov=(a,b)=>a.x1<b.x2&&a.x2>b.x1&&a.y1<b.y2&&a.y2>b.y1;

function startAttack(e,id){
  const a=ATKS[id];e.atkId=id;e.seq=a.seq.map(s=>({...s,wu:s.wu*e.spd,rec:s.rec*e.spd}));e.step=0;e.phase='wu';e.t=0;e.state='attack';e.hitDone=false;e.cue=false;e.last=id;beginStep(e)}
function beginStep(e){const s=e.seq[e.step];e.dodgedFlag=false;e.phase='wu';e.t=0;e.hitDone=false;e.cue=false;e.glow=!!s.red;
  if(s.vanish){e.vis=false;const p=G.player;e.spotX=clamp(p.x+(e.x<p.x?150:-150),e.minX,e.maxX);if(Math.abs(e.spotX-p.x)<90)e.spotX=clamp(p.x-(e.spotX>p.x?150:-150),e.minX,e.maxX);for(let i=0;i<18;i++)part({t:'wisp',x:e.x+rand(-20,20),y:e.y-rand(10,110),vx:rand(-60,60),vy:rand(-80,0),life:rand(.4,.8),max:.8,r:rand(6,16),col:'#0a0a0b'});AU.noise(.3,.3,'bandpass',600,200,1)}
  if(s.red&&e.kind==='boss')AU.tone(140,.9,.25,'sawtooth',300,1)}
function enemyHitRect(e,s){
  const x1=e.x-e.face*12,x2=e.x+e.face*s.reach;let y1,y2;
  if(s.low){y1=e.y-34;y2=e.y}else if(s.yHi!=null){y1=e.y+s.yHi;y2=e.y+s.yLo}else{y1=e.y-e.h*.95;y2=e.y-6}
  return{x1:Math.min(x1,x2),x2:Math.max(x1,x2),y1,y2}}
function endAttack(e,cdmin,cdmax){e.state='chase';e.atk=null;e.seq=null;e.glow=false;e.vis=true;e.cd=rand(cdmin,cdmax);e.t=0}
function nAttackers(){let n=0;for(const e of G.enemies)if(!e.dead&&e.state==='attack')n++;return n}
function spawnProj(e,hi){const dir=e.face;G.proj.push({x:e.x+dir*50,y:e.y,vx:dir*(e.ph===2?640:540),w:70,h:hi?150:105,dmg:20,post:18,owner:'enemy',life:3.2,pk:'wave',hi,src:e})}
function spawnWaves(e){for(const d of[-1,1])G.proj.push({x:e.x+d*100,y:e.y,vx:d*520,w:60,h:46,dmg:16,post:12,owner:'enemy',life:1.9,pk:'ground',noParry:true,src:e})}

function updateEnemy(e,dt){
  const p=G.player;e.anim+=dt;e.t+=dt;e.noHit+=dt;e.flashT=Math.max(0,e.flashT-dt);
  if(e.dead){e.deadT+=dt;e.alpha=Math.max(0,1-(e.deadT-.9)/1.2);return}
  const isBoss=e.kind==='boss';
  if(e.state!=='broken'&&e.state!=='transform'&&e.noHit>(isBoss?2.2:1.6)){e.posture=Math.max(0,e.posture-(isBoss?(e.ph===2?16:12):14)*dt)}
  const dx=p.x-e.x,dist=Math.abs(dx),want=sgn(dx);
  e.moving=false;
  if(p.dead&&e.state!=='attack'){e.state=e.state==='dead'?e.state:'idle';e.aggro=false}
  // facing / turning
  const canTurn=e.state==='idle'||e.state==='chase'||(e.state==='attack'&&e.phase==='wu'&&e.t<e.seq[e.step].wu*.55&&!e.seq[e.step].noTrack);
  if(canTurn&&want!==e.face){e.turnT+=dt;if(e.turnT>(e.kind==='shield'?.5:isBoss?.05:.1)){e.face=want;e.turnT=0}}else if(want===e.face)e.turnT=0;
  switch(e.state){
   case'idle':
     if(isBoss){if(G.bossActive&&G.bossIntro<=0){e.state='chase';e.cd=.8}}
     else if(!p.dead&&dist<540&&Math.abs(p.y-e.y)<260){e.state='chase';e.aggro=true;e.cd=rand(.5,1)}
     break;
   case'chase':{
     e.cd-=dt;const sp=e.cfg.speed*(isBoss&&e.ph===2?1.35:1);
     if(dist>e.cfg.want[1]){e.vx=want*sp;e.moving=true}
     else if(dist<e.cfg.want[0]-18){e.vx=-want*sp*.6;e.moving=true}else e.vx=0;
     if(e.cd<=0&&dist<=e.cfg.range&&!p.dead&&e.turnT===0&&e.face===want&&Math.abs(p.y-e.y)<120){
       if(isBoss){bossPick(e)}else if(nAttackers()<2){startAttack(e,e.cfg.atks[Math.floor(Math.random()*e.cfg.atks.length)])}else e.cd=.35}
     else if(isBoss&&e.cd<=0&&dist>e.cfg.range){bossPick(e)}
     break}
   case'attack':{
     const s=e.seq[e.step];e.vx=0;
     if(e.phase==='wu'){
       e.cue=!s.red&&e.t>s.wu-.22&&!s.vanish&&!s.proj;
       if(e.t>=s.wu){
         if(s.vanish){e.x=e.spotX;e.vis=true;e.face=sgn(p.x-e.x);for(let i=0;i<14;i++)part({t:'wisp',x:e.x+rand(-20,20),y:e.y-rand(10,110),vx:rand(-80,80),vy:rand(-80,0),life:rand(.3,.6),max:.6,r:rand(6,14),col:'#0a0a0b'});ringFx(e.x,e.y-50,60,'#b3121a',.3,3);e.step++;if(e.step>=e.seq.length)endAttack(e,.5,.9);else beginStep(e);break}
         e.phase='act';e.t=0;e.hitDone=false;e.glow=!!s.red;
         AU.slash(!!s.red);
         if(s.proj){spawnProj(e,s.hi);sparkBurst(e.x+e.face*50,e.y-60,10,300,'#ff3a3a');AU.tone(200,.4,.2,'sawtooth',90,1)}
         else if(s.reach>0){const sy=e.y-(s.low?10:e.h*.55);slashFx(e.x,sy,e.face,Math.min(s.reach,150),s.low?.9:-2.4,s.low?-.1:1.0,s.red?'#ff5050':'#f4f0e6',.2)}
       }}
     else if(e.phase==='act'){
       if(s.lunge){e.vx=e.face*s.lunge*(1-e.t/(s.act||1)*.3)}
       if(!e.hitDone&&s.reach>0){const hr=enemyHitRect(e,s);if(p.act==='dodge'&&p.dodgeI>0&&!e.dodgedFlag){const pr=playerRect(p);if(ov({x1:hr.x1-70,x2:hr.x2+70,y1:hr.y1-30,y2:hr.y2+30},pr)){e.dodgedFlag=true;perfectDodge(e)}}if(ov(hr,playerRect(p))){const r=playerTakeHit(e,{dmg:s.dmg,post:s.post,red:s.red,x:e.x,src:e});if(r==='hit'||r==='block'||r==='parry')e.hitDone=true;if(r==='parry'){break}}}
       if(e.t>=s.act){
         if(s.shock&&e.ph===2){spawnWaves(e)}
         if(s.shock){shake(10);AU.boom();ringFx(e.x+e.face*120,e.y,120,'#b3121a',.5,6);for(let i=0;i<14;i++)part({t:'dust',x:e.x+e.face*120+rand(-60,60),y:e.y-4,vx:rand(-80,80),vy:rand(-120,-20),life:.6,max:.6,r:rand(5,12)});}
         e.phase='rec';e.t=0;e.glow=false}}
     else if(e.phase==='rec'){e.vx=0;if(e.t>=s.rec){e.step++;if(e.step>=e.seq.length){e.cue=false;if(isBoss)endAttack(e,e.ph===2?.2:.4,e.ph===2?.55:.9);else endAttack(e,.6,1.5)}else beginStep(e)}}
     break}
   case'hurt':e.vx*=.9;if(e.t>e.hurtT){e.state='chase';e.cd=Math.max(e.cd,.25)}break;
   case'parried':e.vx*=.88;if(e.t>.75){e.state='chase';e.cd=.35}break;
   case'broken':e.vx*=.9;if(e.t>(isBoss?2.8:3)){e.state='chase';e.posture=isBoss?20:e.maxPost*.3;e.cd=.5;popText('',e.x,e.y,'#000',1,.1)}break;
   case'transform':e.vx=0;e.invuln=true;e.glow=true;if(Math.random()<.5)part({t:'ink',x:e.x+rand(-30,30),y:e.y-rand(0,130),vx:rand(-200,200),vy:rand(-300,-50),life:.8,max:.8,r:rand(3,8),col:Math.random()<.5?'#b3121a':'#0a0a0b',g:600});if(e.t>2.3){e.state='chase';e.invuln=false;e.glow=false;e.ph=2;e.spd=.78;e.cd=.4;e.posture=0;e.maxPost=140;e.hp=Math.max(e.hp,1)}break;
  }
  // integrate (grounded, no gravity)
  e.x+=e.vx*dt;e.x=clamp(e.x,e.minX,e.maxX);if(e.moving)e.runPh+=dt*e.cfg.speed/18;
}
function bossPick(e){
  const p=G.player,dist=Math.abs(p.x-e.x),ph=e.ph,opts=[];
  const add=(id,w)=>{if(id!==e.last)opts.push([id,w])};
  if(dist<230){add(ph===2?'bCombo4':'bCombo',4);add('bCrush',2.2);if(ph===2)add('bPhantom',2)}
  else{add('bDash',4);if(ph===2){add('bWave2',3.2);add('bPhantom',2)}else add('bWave',2.2);add('bCrush',dist<330?1:0)}
  if(!opts.length)opts.push(['bCombo',1]);
  let tot=0;for(const o of opts)tot+=o[1];let r=Math.random()*tot,id=opts[0][0];for(const o of opts){r-=o[1];if(r<=0){id=o[0];break}}
  if(id==='bWave'&&ph===2)id='bWave2';
  startAttack(e,id)}
function breakPosture(e){e.state='broken';e.t=0;e.atk=null;e.seq=null;e.glow=false;e.posture=e.maxPost;e.vis=true;popText('破',e.x,e.y-e.h-30,'#d9d5cc',60,1);AU.noise(.35,.5,'bandpass',900,300,2);AU.tone(260,.5,.2,'sawtooth',70);ringFx(e.x,e.y-e.h*.6,90,'#f4f0e6',.5,4);shake(5);hitstop(.1);sparkBurst(e.x,e.y-e.h*.6,20,500)}
function hurtEnemy(e,dmg,post,o){o=o||{};
  if(e.dead||e.invuln)return false;const p=G.player;
  const front=(p.x>e.x)===(e.face>0);
  if(e.kind==='shield'&&!o.pierce&&e.state!=='broken'&&e.state!=='parried'&&!(e.state==='attack'&&e.phase!=='wu')&&front){
    const hx=e.x+e.face*26,hy=e.y-56;
    if(o.heavy){e.state='broken';e.t=0;e.atk=null;e.seq=null;e.glow=false;e.posture=e.maxPost*.8;popText('破',e.x,e.y-e.h-30,'#d9d5cc',60,1);AU.clang(true);sparkBurst(hx,hy,24,520);ringFx(hx,hy,70,'#fff',.4,4);shake(6);hitstop(.12);return true}
    e.posture=Math.min(e.maxPost-1,e.posture+post*.7);e.noHit=0;e.flashT=.08;AU.clang(false);sparkBurst(hx,hy,10,320);hitstop(.05);p.vx=-p.face*180;e.vx=p.face*60;return'blocked'}
  const brk=e.state==='broken';
  const d=dmg*(brk?1.5:1);e.hp-=d;e.noHit=0;e.flashT=.1;if(!brk)e.posture+=(e.kind==='boss'&&!o.pierce?post*.55:post);
  const dir=p.face;bloodBurst(e.x,e.y-e.h*.6,dir,o.heavy?22:12,o.heavy?460:320,true);
  if(Math.random()<.5)decal(e.x+rand(-30,30),e.y,rand(12,24),'#7e0d13');
  AU.hit(!!o.heavy);hitstop(o.heavy?.11:.06);shake(o.heavy?8:3);
  if(e.hp<=0){killEnemy(e,o);return true}
  if(e.kind==='boss'&&e.ph===1&&e.hp<=e.maxHp*.5){startTransform(e);return true}
  if(e.state!=='broken'&&e.posture>=e.maxPost){breakPosture(e);return true}
  if(e.kind!=='boss'&&e.state!=='broken'&&e.state!=='parried'){
    if(e.state==='attack'){if(o.heavy||o.counter){e.state='hurt';e.t=0;e.hurtT=.4;e.seq=null;e.atk=null;e.glow=false}}
    else{e.state='hurt';e.t=0;e.hurtT=.3;e.aggro=true}
    e.vx=dir*(o.kb||170)}
  else if(e.kind==='boss'&&e.state==='idle'){e.state='chase'}
  return true}
function startTransform(e){e.state='transform';e.t=0;e.atk=null;e.seq=null;e.invuln=true;e.glow=true;e.vis=true;G.proj.length=0;shake(14);flash(.8,'#b3121a');setSlow(.9,.3);AU.boom();AU.gong();screenSplat(W/2,H/2,230,'rgba(150,12,18,.8)',2);ringFx(e.x,e.y-70,260,'#b3121a',1,8);popText('血',e.x,e.y-e.h-30,'#c4161c',100,1.8);G.msg='寒鸦判官　撕下衣袍——杀气更盛';G.msgT=3.5}
function killEnemy(e,o){
  e.dead=true;e.state='dead';e.deadT=0;e.hp=0;e.vx=0;G.stats.kills++;
  bloodBurst(e.x,e.y-e.h*.6,G.player.face,e.kind==='boss'?60:30,520,true);decal(e.x,e.y,e.kind==='boss'?50:30,'#8e0f15');
  screenSplat(rand(300,900),rand(200,500),e.kind==='boss'?200:80,'rgba(10,10,10,.8)',1.1);
  if(e.kind==='boss'){bossDeath(e)}else{setSlow(.35,.4)}}
function bossDeath(e){G.gateOpen=true;G.bossLocked=false;G.proj.length=0;setSlow(1.8,.2);flash(.9,'#fff');shake(18);hitstop(.25);AU.boom();AU.gong();AU.boss=false;popText('诛',e.x,e.y-e.h-40,'#c4161c',130,2.4);G.msg='守楼人已倒。前往观雨楼，送出密信。';G.msgT=5;
  for(let i=0;i<5;i++)setTimeout(()=>{screenSplat(rand(200,1000),rand(150,550),rand(70,150),i%2?'rgba(150,12,18,.8)':'rgba(8,8,8,.85)',2.6)},i*180)}

/* counter / execution */
function execute(e,kind){
  const p=G.player;p.face=sgn(e.x-p.x)||p.face;p.x=e.x-p.face*(e.w/2+58);p.vx=p.vy=0;p.act='counter';p.st=0;p.exec=kind==='exec';p.dur=kind==='exec'?.75:.45;p.invuln=p.dur+.35;p.queued=false;p.counterT=0;p.dodgeI=0;
  const boss=e.kind==='boss';let dmg,post=0;
  if(kind==='exec'){dmg=boss?44:999;G.stats.exec++}else if(kind==='parry'){dmg=boss?26:999;post=boss?36:0}else{dmg=boss?24:26;post=30}
  const cy=p.y-64;slashFx(p.x,cy,p.face,150,-2.8,1.6,'#fff',.3);
  setTimeout(()=>slashFx(e.x,e.y-60,-p.face,120,-2.2,1.4,'#ff4040',.28),90);
  FX.push({k:'line',x:e.x-p.face*260,y:e.y-e.h*.9,x2:e.x+p.face*260,y2:e.y-e.h*.1,col:'#fff',w:12,life:.3,max:.3});
  popText(kind==='exec'?'斩':kind==='parry'?'断':'破',e.x,e.y-e.h-30,'#c4161c',kind==='exec'?110:90,1);
  AU.clang(true);AU.slash(true);flash(.55,'#fff');shake(12);hitstop(.18);setSlow(kind==='exec'?.9:.55,.2);G.zoomT=kind==='exec'?1.3:.7;
  e.invuln=false;
  const wasBroken=e.state==='broken';
  if(boss&&kind==='exec'){e.posture=0}
  const r=hurtEnemy(e,dmg,post,{heavy:true,pierce:true,counter:true,kb:300});
  if(boss&&kind==='exec'&&!e.dead&&e.state!=='transform'){e.state='hurt';e.t=0;e.hurtT=1.2;e.posture=0;e.vx=p.face*160}
  else if(boss&&kind==='exec'&&e.state==='transform'){}
  else if(!e.dead&&boss&&wasBroken){}
}
