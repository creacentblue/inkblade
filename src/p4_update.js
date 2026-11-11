/* ---------------- player update ---------------- */
function startAttackP(idx){const p=G.player;p.act='attack';p.st=0;p.cur=idx==='air'?{wu:.08,act:.12,rec:.24,reach:116,dmg:8,post:8,arc:[-1.7,1.5],air:true,step:0}:ATKL[idx];p.idx=idx;p.hitSet.clear();p.queued=false;p.slashed=false}
function startDodge(dirIn){const p=G.player;p.act='dodge';p.st=0;p.dodgeDir=dirIn||p.face;if(dirIn)p.face=dirIn;p.dodgeCd=.55;if(!p.onGround)p.airDodge=true;p.hitSet.clear();p.queued=false;p.charge=0;AU.dodge();for(let i=0;i<6;i++)part({t:'dust',x:p.x,y:p.y-4,vx:-p.dodgeDir*rand(30,120),vy:rand(-40,0),life:.4,max:.4,r:rand(4,9)})}
function startParry(){const p=G.player;p.act='parry';p.st=0;p.parried=false;p.guarding=false;p.parryCd=.3;p.queued=false;p.charge=0}
function playerHit(cur,heavy,F){
  const p=G.player;const x1=p.x-p.face*12,x2=p.x+p.face*cur.reach;
  const r={x1:Math.min(x1,x2),x2:Math.max(x1,x2),y1:cur.air?p.y-p.h*.9:p.y-p.h+4,y2:cur.air?p.y+26:p.y-6};
  const all=G.enemies.concat([G.boss]);
  for(const e of all){if(e.dead||p.hitSet.has(e))continue;if(e.kind==='boss'&&!G.bossActive)continue;if(!ov(r,enemyRect(e)))continue;
    p.hitSet.add(e);
    let dmg=cur.dmg,post=cur.post;if(heavy){dmg=24+28*F;post=30+34*F}
    const res=hurtEnemy(e,dmg,post,{heavy,kb:cur.kb||(heavy?420:170)});
    if(res&&res!==false){p.postT=0}
  }}
function updatePlayer(dt,rdt){
  const p=G.player;p.anim+=dt;
  if(p.dead){p.st+=dt;p.vx*=.96;p.vy+=2200*dt;moveCollide(p,dt);return}
  p.coyote-=dt;p.dodgeCd-=dt;p.parryCd-=dt;p.invuln-=dt;p.comboT-=dt;p.wallLock-=dt;p.counterT-=rdt;p.postT+=dt;
  if(p.counterT<=0)p.counterTarget=null;
  if(p.postT>1.4&&p.act!=='parry'&&p.act!=='stagger')p.posture=Math.max(0,p.posture-24*dt);
  p.hpLag=p.hpLag>p.hp?Math.max(p.hp,p.hpLag-30*dt):p.hp;
  const dirIn=(down('right')?1:0)-(down('left')?1:0);
  p.jumpHeld=down('jump');
  const free=p.act===null;
  let cancel=false;
  if(p.act==='attack'&&p.st>=p.cur.wu+p.cur.act)cancel=true;
  if(p.act==='heavy'&&p.st>=.3)cancel=true;
  if(p.act==='charge'||p.act==='drink')cancel=true;
  if(p.act==='parry'&&p.parried&&p.st>PW)cancel=true; // after a parry/block you may act again
  // --- counter (parry/dodge reward)
  if(p.counterT>0&&p.counterTarget&&!p.counterTarget.dead&&!['hurt','stagger','counter'].includes(p.act)&&consume('atk',.22)){execute(p.counterTarget,p.counterKind);return}
  if(free||cancel){
    if(consume('dodge',.14)&&p.dodgeCd<=0&&(p.onGround||!p.airDodge)){startDodge(dirIn)}
    else if(consume('parry',.12)&&p.parryCd<=0&&p.act!=='parry'){startParry()}
  }
  if(free||(p.act==='attack'&&p.st>=p.cur.wu+p.cur.act)||(p.act==='heavy'&&p.st>=.3)||p.act==='drink'){
    // execution of a broken enemy
    if(p.act!=='attack'||true){
      if(press.atk&&performance.now()-press.atk<180){
        const all=G.enemies.concat([G.boss]);let tgt=null,bd=240;
        for(const e of all){if(e.dead||e.state!=='broken')continue;const d=Math.abs(e.x-p.x);if(d<bd&&Math.abs(e.y-p.y)<110){bd=d;tgt=e}}
        if(tgt){press.atk=0;execute(tgt,'exec');return}}}
  }
  if(p.act===null){
    if(consume('heal',.2)&&p.onGround&&p.flasks>0&&p.hp<p.maxHp){p.act='drink';p.st=0}
    else if(consume('atk',.16)){
      if(!p.onGround)startAttackP('air');
      else{let idx=0;if(p.comboT>0)idx=(p.idx+1)%3;if(p.idx==='air')idx=0;startAttackP(idx)}}
    else if(consume('heavy',.12)){p.act='charge';p.st=0;p.charge=0}
  }
  // --- act processing
  const a=p.act;
  if(a){p.st+=dt}
  if(a==='attack'){const c=p.cur;
    if(!p.slashed&&p.st>=c.wu){p.slashed=true;AU.slash(false);if(c.step&&p.onGround)p.vx=p.face*c.step;
      slashFx(p.x+p.face*10,p.y-60,p.face,c.reach*.88,c.arc[0],c.arc[1],'#f4f0e6',.2)}
    if(p.st>=c.wu&&p.st<=c.wu+c.act)playerHit(c,false);
    if(consume('atk',.2))p.queued=true;
    if(p.queued&&p.st>=c.wu+c.act&&!c.air&&p.idx<2){startAttackP(p.idx+1);p.st=0}
    else if(p.st>=c.wu+c.act+c.rec){p.act=null;p.comboT=.32}}
  else if(a==='charge'){p.charge+=dt;
    if(p.charge>.5&&Math.random()<.4)part({t:'spark',x:p.x+p.face*30+rand(-10,10),y:p.y-80+rand(-20,20),vx:rand(-80,80),vy:rand(-100,-20),life:.3,max:.3,r:10,col:'#ff5050'});
    if(!down('heavy')||p.charge>=1.0){p.heavyF=clamp(p.charge/.9,0,1);p.act='heavy';p.st=0;p.hitSet.clear();p.slashed=false;p.charge=0}}
  else if(a==='heavy'){const wu=.16,ac=.14,rec=.44,F=p.heavyF;const cur={reach:150+36*F,dmg:0,post:0,kb:420};
    if(!p.slashed&&p.st>=wu){p.slashed=true;AU.slash(true);p.vx=p.face*(300+120*F);slashFx(p.x+p.face*10,p.y-62,p.face,cur.reach*.92,-2.8,1.3,F>.5?'#ff6060':'#f4f0e6',.28);shake(2+F*3)}
    if(p.st>=wu&&p.st<=wu+ac)playerHit(cur,true,F);
    if(p.st>=wu+ac+rec)p.act=null}
  else if(a==='parry'){p.guarding=p.st>=PW&&down('parry');
    if(p.st>=PW+.1&&!down('parry')){p.act=null;p.guarding=false;if(!p.parried)p.parryCd=.38}}
  else if(a==='dodge'){p.dodgeI=p.st<.21?1:0;if(p.dodgeI)p.invuln=Math.max(p.invuln,dt*3);
    p.vx=p.dodgeDir*(p.st<.2?820:300);if(!p.onGround)p.vy=Math.min(p.vy,0)*.3;
    p.trailT=(p.trailT||0)-dt;if(p.trailT<=0){p.trail.push({x:p.x,y:p.y,face:p.face,life:.28,lean:16});p.trailT=.04}
    if(p.st>=.27){p.act=null;p.vx*=.3;p.dodgeI=0}}
  else if(a==='hurt'){if(p.st>=p.dur)p.act=null}
  else if(a==='stagger'){if(p.st>=p.dur)p.act=null}
  else if(a==='drink'){if(p.st>=1.0){p.hp=Math.min(p.maxHp,p.hp+42);p.flasks--;p.act=null;AU.heal();ringFx(p.x,p.y-50,60,'#d9d5cc',.5,3);for(let i=0;i<10;i++)part({t:'spark',x:p.x+rand(-14,14),y:p.y-20,vx:rand(-30,30),vy:rand(-220,-80),life:.7,max:.7,r:10,col:'#e8e4da'});popText('',0,0)}}
  else if(a==='counter'){p.vx*=.9;if(p.st>=p.dur){p.act=null;p.exec=false}}
  // --- movement
  const onG=p.onGround;
  if(onG){p.coyote=.1;p.airJumps=0;p.airDodge=false;p.safeT-=dt}
  p.wall=0;if(!onG&&(p.act===null||p.act==='attack')){if(wallTouch(p,-1))p.wall=-1;else if(wallTouch(p,1))p.wall=1}
  const canMove=p.act===null||p.act==='charge'||p.act==='drink';
  if(canMove){
    let sp=330;if(p.act==='charge')sp*=.3;if(p.act==='drink')sp*=.35;
    if(p.wallLock<=0){const tgt=dirIn*sp,acc=onG?(dirIn?3600:3000):(dirIn?2100:500);p.vx+=clamp(tgt-p.vx,-acc*dt,acc*dt)}
    if(dirIn&&p.act===null)p.face=dirIn;
    else if(dirIn&&p.act==='charge')p.face=dirIn;
  }else if(a==='parry'){p.vx*=.8}
  else if(a==='attack'||a==='heavy'||a==='hurt'||a==='stagger'||a==='counter'){p.vx*=onG?Math.pow(.02,dt):Math.pow(.3,dt)}
  // jump
  if(p.act===null||(p.act==='attack'&&p.st>=p.cur.wu+p.cur.act)){
    if(consume('jump',.12)){
      if(p.coyote>0&&p.act===null){p.vy=-820;p.coyote=0;p.onGround=false;AU.jump(false);for(let i=0;i<5;i++)part({t:'dust',x:p.x,y:p.y-3,vx:rand(-60,60),vy:rand(-40,0),life:.4,max:.4,r:rand(4,8)})}
      else if(p.wall&&!onG){p.vy=-790;p.vx=-p.wall*430;p.wallLock=.2;p.face=-p.wall;p.airJumps=0;AU.jump(false);sparkBurst(p.x+p.wall*18,p.y-50,8,300,'#d9d5cc')}
      else if(p.airJumps<1){p.vy=-730;p.airJumps++;AU.jump(true);ringFx(p.x,p.y-10,36,'#d9d5cc',.3,2);if(p.act==='attack')p.act=null}
      if(dirIn&&down('down')===false&&onG===false){}
    }
  }
  // gravity
  if(p.act==='dodge'&&!onG){}else{
    let g=2200;if(p.vy<0&&!p.jumpHeld&&p.wallLock<=0&&p.act===null)g+=4200;
    p.vy+=g*dt;
    let maxFall=1000;
    if(p.wall&&p.vy>0&&p.act===null&&dirIn===p.wall)maxFall=130;
    else if(p.airJumps>=1&&p.jumpHeld&&p.vy>0&&p.act===null)maxFall=240;
    if(p.vy>maxFall)p.vy=maxFall}
  const was=p.onGround,vy0=p.vy;
  const dropThrough=down('down')&&p.act===null;
  moveCollide(p,dt,dropThrough);
  if(p.onGround&&!was&&vy0>350){AU.land();for(let i=0;i<6;i++)part({t:'dust',x:p.x+rand(-14,14),y:p.y-2,vx:rand(-90,90),vy:rand(-50,0),life:.4,max:.4,r:rand(4,9)})}
  p.speed=Math.abs(p.vx);
  // bounds
  const lo=G.bossLocked?ARENA_L+p.w/2:p.w/2,hi=ARENA_R-p.w/2;
  if(p.x<lo){p.x=lo;p.vx=Math.max(0,p.vx)}if(p.x>hi){p.x=hi;p.vx=Math.min(0,p.vx)}
  // safe spot
  if(p.onGround&&p.plat&&p.plat.kind==='roof'&&p.x>p.plat.x+90&&p.x<p.plat.x+p.plat.w-90&&p.act!=='dodge'){p.safe.x=p.x;p.safe.y=p.y}
  if(p.y>1100)hurtPlayerPit();
  for(let i=p.trail.length-1;i>=0;i--){p.trail[i].life-=dt;if(p.trail[i].life<=0)p.trail.splice(i,1)}
}
/* ---------------- projectiles ---------------- */
function updateProj(dt){const p=G.player;
  for(let i=G.proj.length-1;i>=0;i--){const pr=G.proj[i];pr.x+=pr.vx*dt;pr.life-=dt;
    if(pr.life<=0||pr.x<ARENA_L-120||pr.x>ARENA_R+60){G.proj.splice(i,1);continue}
    if(Math.random()<.6)part({t:'ink',x:pr.x-sgn(pr.vx)*20+rand(-8,8),y:pr.y-rand(5,pr.h),vx:-pr.vx*.1,vy:rand(-60,20),life:.4,max:.4,r:rand(3,7),col:pr.owner==='player'?'#f4f0e6':(Math.random()<.5?'#b3121a':'#0a0a0b')});
    const r={x1:pr.x-pr.w/2,x2:pr.x+pr.w/2,y1:pr.y-pr.h,y2:pr.y};
    if(pr.owner==='enemy'){
      if(!p.dead&&ov(r,playerRect(p))){const res=playerTakeHit(pr,{dmg:pr.dmg,post:pr.post,red:!!pr.noParry,x:pr.x,src:pr});
        if(res==='hit'||res==='block'){G.proj.splice(i,1)}else if(res==='parry'){/* reflected */}}}
    else{const b=G.boss;if(!b.dead&&G.bossActive&&ov(r,enemyRect(b))){hurtEnemy(b,34,34,{heavy:true,pierce:true});popText('返',b.x,b.y-b.h-20,'#d9d5cc',60,.7);G.proj.splice(i,1)}}
  }}
/* ---------------- world update ---------------- */
function worldUpdate(dt,rdt){
  G.time+=rdt;const p=G.player;
  updatePlayer(dt,rdt);
  for(const e of G.enemies)updateEnemy(e,dt);
  updateEnemy(G.boss,dt);
  updateProj(dt);
  // triggers
  if(!p.dead){
    CPS.forEach((c,i)=>{if(i>G.cp&&Math.abs(p.x-c.x)<80&&Math.abs(p.y-c.y)<90){G.cp=i;p.hp=p.maxHp;p.flasks=3;p.posture=0;G.msg='灯火已燃　·　记下此处';G.msgT=2.5;AU.heal();AU.tone(220,1.2,.2,'triangle',0,1);ringFx(c.x,c.y-60,90,'#e33',.8,4);for(let k=0;k<14;k++)part({t:'spark',x:c.x,y:c.y-70,vx:rand(-120,120),vy:rand(-260,-60),life:.9,max:.9,r:12,col:'#ff6a50',g:200})}});
    for(const h of HINTS){if(!G.shown[h.id]&&p.x>h.x&&p.x<h.x+700){G.shown[h.id]=1;G.hint=h.t;G.hintT=5.5}}
    if(!G.bossActive&&!G.boss.dead&&p.x>BOSS_TRIGGER&&p.onGround){G.bossActive=true;G.bossLocked=true;G.bossIntro=2.4;AU.boss=true;AU.gong();shake(8);G.boss.state='idle';G.boss.x=BOSS_X}
    if(G.gateOpen&&p.x>GATE_X-30&&!G.ending){G.ending=true;G.endT=0;G.fade=0}
  }
  if(G.bossIntro>0)G.bossIntro-=dt;
  // timers
  G.hintT-=rdt;G.msgT-=rdt;
  for(const t of TXT)t.life-=rdt;for(let i=TXT.length-1;i>=0;i--)if(TXT[i].life<=0)TXT.splice(i,1);
  for(const s of SPLAT)s.life-=rdt;for(let i=SPLAT.length-1;i>=0;i--)if(SPLAT[i].life<=0)SPLAT.splice(i,1);
  // rain splashes on visible roofs
  for(let i=0;i<2;i++){const x=G.cam.x+rand(0,W);for(const pl of PL){if(x>pl.x&&x<pl.x+pl.w&&pl.kind!=='pillar'){part({t:'splash',x,y:pl.y,vx:0,vy:0,life:.35,max:.35,r:rand(3,7)});break}}}
  if(G.player.dead){G.deathT+=rdt}
}
function updateCamera(dt,snap){
  const p=G.player;let tx=p.x-W*.42+p.face*70,ty=clamp(p.y-560,-150,120);
  if(G.bossLocked){tx=clamp(tx,ARENA_L-240,ARENA_R-W+60)}
  if(G.bossLocked&&G.boss&&!G.boss.dead)tx=(p.x*1.4+G.boss.x)/2.4-W/2;
  if(G.bossLocked)tx=clamp(tx,ARENA_L-240,ARENA_R-W+60);
  tx=clamp(tx,0,LEVEL_END-W);
  const k=snap?1:1-Math.pow(.0008,dt);G.cam.x+=(tx-G.cam.x)*k;G.cam.y+=(ty-G.cam.y)*(snap?1:1-Math.pow(.02,dt));
}
function togglePause(forceOn){if(G.mode!=='play'||G.player.dead||G.ending)return;G.paused=forceOn===true?true:!G.paused}
function startGame(){
  G.stats={kills:0,pp:0,pd:0,exec:0};G.deaths=0;G.time=0;G.cp=0;G.shown={};G.gateOpen=false;G.ending=false;G.endT=0;G.msg=null;G.hint=null;
  initWorld();G.mode='play';respawn(true);G.fade=1;AU.boss=false;
  G.msg='三更雨夜。怀中密信，须在天明前送至观雨楼。';G.msgT=4}
