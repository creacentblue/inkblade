/* ---------------- rendering ---------------- */
const GLOW=(()=>{const c=mk(128,128),g=c.getContext('2d'),r=g.createRadialGradient(64,64,2,64,64,64);r.addColorStop(0,'rgba(255,70,50,.8)');r.addColorStop(.35,'rgba(200,20,25,.3)');r.addColorStop(1,'rgba(150,10,15,0)');g.fillStyle=r;g.fillRect(0,0,128,128);return c})();
const RAIN=[];for(let i=0;i<190;i++)RAIN.push({x:Math.random()*W,y:Math.random()*H,l:rand(12,34),s:rand(1100,1700),a:rand(.12,.4)});
function lantern(x,y,sc,lit,t,seed){const fl=lit?.85+Math.sin(t*7+seed)*.12:.25;ctx.globalAlpha=fl;ctx.drawImage(GLOW,x-70*sc,y-70*sc,140*sc,140*sc);ctx.globalAlpha=1;
  ctx.strokeStyle='#050505';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y-26*sc);ctx.lineTo(x,y-14*sc);ctx.stroke();
  ctx.fillStyle=lit?'#a8161c':'#3a3a3c';ctx.beginPath();ctx.ellipse(x,y,12*sc,15*sc,0,0,TAU);ctx.fill();ctx.fillStyle='#0b0b0c';ctx.fillRect(x-8*sc,y-17*sc,16*sc,4*sc);ctx.fillRect(x-8*sc,y+13*sc,16*sc,4*sc);
  ctx.strokeStyle='#c4161c';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x,y+17*sc);ctx.lineTo(x,y+30*sc);ctx.stroke()}
function eave(x,y,dir,col){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x,y-1);ctx.quadraticCurveTo(x+dir*14,y+3,x+dir*34,y-20);ctx.quadraticCurveTo(x+dir*16,y+10,x,y+23);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(225,220,208,.5)';ctx.beginPath();ctx.moveTo(x,y-1);ctx.quadraticCurveTo(x+dir*14,y+3,x+dir*34,y-20);ctx.lineTo(x+dir*30,y-17);ctx.quadraticCurveTo(x+dir*14,y+1,x,y+2);ctx.fill()}
function drawPlat(p,cam,t){
  const x0=Math.max(p.x,cam.x-60),x1=Math.min(p.x+p.w,cam.x+W+60);if(x1<=x0)return;
  if(p.kind==='roof'){
    const bodyBot=cam.y+H+40;
    ctx.fillStyle='#09090b';ctx.fillRect(x0,p.y+22,x1-x0,bodyBot-p.y);
    // beams, windows
    for(let bx=Math.ceil((x0-p.x)/150)*150+p.x+40;bx<x1;bx+=150){ctx.fillStyle='#17171b';ctx.fillRect(bx,p.y+22,10,400);
      const wy=p.y+70+((bx*7)%3)*20;ctx.fillStyle='#050506';ctx.fillRect(bx+30,wy,56,70);const lit=((bx/150|0)%2)===0;if(lit){ctx.fillStyle='rgba(170,28,30,.5)';ctx.fillRect(bx+32,wy+2,52,66);ctx.fillStyle='#050506';for(let k=1;k<4;k++)ctx.fillRect(bx+32+k*13,wy+2,2,66);ctx.fillRect(bx+32,wy+34,52,2)}}
    // roof tile band
    ctx.fillStyle='#1c1c20';ctx.fillRect(x0,p.y,x1-x0,22);
    ctx.fillStyle='#26262b';ctx.fillRect(x0,p.y,x1-x0,6);
    ctx.strokeStyle='rgba(0,0,0,.7)';ctx.lineWidth=2;ctx.beginPath();for(let tx=Math.ceil(x0/18)*18;tx<x1;tx+=18){ctx.moveTo(tx,p.y+4);ctx.lineTo(tx,p.y+22)}ctx.stroke();
    // wet gleam
    ctx.fillStyle='rgba(228,223,210,.62)';ctx.fillRect(x0,p.y-1,x1-x0,3);
    ctx.fillStyle='rgba(255,255,255,.35)';for(let gx=Math.ceil(x0/170)*170;gx<x1;gx+=170){const o=Math.sin(t*.5+gx)*30;ctx.fillRect(gx+o,p.y-1,50,2)}
    if(p.x>-100&&!(p.x===4880))eave(p.x,p.y,-1,'#1c1c20');
    if(p.x+p.w!==4880&&p.x+p.w<LEVEL_END+1)eave(p.x+p.w,p.y,1,'#1c1c20');
    // hanging lanterns
    for(let lx=Math.ceil((x0-p.x)/420)*420+p.x+200;lx<x1;lx+=420)lantern(lx,p.y+52,.9,true,t,lx);
  }else if(p.kind==='pillar'){
    ctx.fillStyle='#0f0f12';ctx.fillRect(p.x,p.y,p.w,cam.y+H+40-p.y);
    ctx.fillStyle='rgba(220,215,200,.55)';ctx.fillRect(p.x,p.y,3,cam.y+H);ctx.fillRect(p.x+p.w-3,p.y,3,cam.y+H);
    ctx.strokeStyle='rgba(60,60,64,.8)';ctx.lineWidth=2;ctx.beginPath();for(let by=p.y+30;by<cam.y+H;by+=34){ctx.moveTo(p.x,by);ctx.lineTo(p.x+p.w,by)}ctx.stroke();
    ctx.fillStyle='#1c1c20';ctx.fillRect(p.x-14,p.y-10,p.w+28,12);eave(p.x-14,p.y-10,-1,'#1c1c20');eave(p.x+p.w+14,p.y-10,1,'#1c1c20');ctx.fillStyle='rgba(225,220,208,.6)';ctx.fillRect(p.x-14,p.y-11,p.w+28,2);
    ctx.save();ctx.font='bold 30px '+KAI;ctx.fillStyle='rgba(160,20,26,.7)';ctx.textAlign='center';ctx.fillText('雨',p.x+p.w/2,p.y+80);ctx.fillText('夜',p.x+p.w/2,p.y+122);ctx.restore();
  }else{ // awning
    ctx.fillStyle='#17171b';ctx.fillRect(p.x,p.y,p.w,p.h);ctx.fillStyle='rgba(228,223,210,.65)';ctx.fillRect(p.x,p.y-1,p.w,3);
    ctx.fillStyle='#17171b';ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.quadraticCurveTo(p.x-6,p.y+2,p.x-18,p.y-12);ctx.quadraticCurveTo(p.x-4,p.y+10,p.x,p.y+14);ctx.fill();ctx.beginPath();ctx.moveTo(p.x+p.w,p.y);ctx.quadraticCurveTo(p.x+p.w+6,p.y+2,p.x+p.w+18,p.y-12);ctx.quadraticCurveTo(p.x+p.w+4,p.y+10,p.x+p.w,p.y+14);ctx.fill();
    ctx.strokeStyle='#8a1015';ctx.lineWidth=2;for(let k=0;k<p.w;k+=24){ctx.beginPath();ctx.moveTo(p.x+k+8,p.y+14);ctx.lineTo(p.x+k+8+Math.sin(t*3+k)*2,p.y+30);ctx.stroke()}
    lantern(p.x+p.w/2,p.y+34,.6,true,t,p.x)}}
function drawGate(t){const x=GATE_X,y=560,open=G.gateOpen;
  if(open){const g=ctx.createRadialGradient(x,y-80,10,x,y-80,260);g.addColorStop(0,'rgba(255,230,200,.6)');g.addColorStop(.4,'rgba(200,40,40,.3)');g.addColorStop(1,'rgba(150,10,15,0)');ctx.fillStyle=g;ctx.fillRect(x-300,y-340,600,360)}
  ctx.fillStyle=open?'#2a0709':'#060607';ctx.fillRect(x-60,y-170,120,170);
  if(open){ctx.fillStyle='rgba(255,226,190,.65)';ctx.fillRect(x-46,y-150,92,150)}
  ctx.fillStyle='#4a0a0f';ctx.fillRect(x-78,y-200,22,200);ctx.fillRect(x+56,y-200,22,200);
  ctx.fillStyle='#1b1012';ctx.fillRect(x-104,y-214,208,16);ctx.fillRect(x-84,y-186,168,10);eave(x-104,y-206,-1,'#1b1012');eave(x+104,y-206,1,'#1b1012');
  ctx.fillStyle='rgba(225,220,208,.55)';ctx.fillRect(x-104,y-215,208,2);
  ctx.fillStyle='#0c0b0b';ctx.fillRect(x-48,y-258,96,38);ctx.strokeStyle='#d6b370';ctx.lineWidth=2;ctx.strokeRect(x-48,y-258,96,38);ctx.fillStyle=open?'#ffd9a0':'#8a7a5a';ctx.font='bold 26px '+KAI;ctx.textAlign='center';ctx.fillText('观雨楼',x,y-230);
  lantern(x-120,y-140,.9,open,t,1);lantern(x+120,y-140,.9,open,t,2)}
function drawBarrier(t){if(!G.bossLocked)return;const x=ARENA_L;const g=ctx.createLinearGradient(x-70,0,x+10,0);g.addColorStop(0,'rgba(140,10,16,0)');g.addColorStop(1,'rgba(160,14,20,.65)');ctx.fillStyle=g;ctx.fillRect(x-70,G.cam.y-50,80,H+100);
  ctx.strokeStyle='rgba(15,15,16,.9)';ctx.lineWidth=7;ctx.beginPath();for(let y=G.cam.y-40;y<G.cam.y+H+40;y+=12){ctx.lineTo(x+Math.sin(y*.05+t*4)*6,y)}ctx.stroke();ctx.strokeStyle='#c4161c';ctx.lineWidth=2;ctx.stroke()}
function drawCheckpoints(t){CPS.forEach((c,i)=>{const lit=i<=G.cp;if(i===0&&G.mode==='title'){}ctx.fillStyle='#0a0a0c';ctx.fillRect(c.x-3,c.y-92,6,92);ctx.fillRect(c.x-18,c.y-96,36,5);lantern(c.x,c.y-72,1.4,lit,t,i*3)})}

function playerFig(p){
  const f={x:p.x,y:p.y,face:p.face,scale:1,body:'#e8e4da',leg:'#cfcac0',rim:'#030303',skin:'#d8d2c6',hair:'#09090a',scarf:'#b3121a',scarfW:7,sash:'#101012',weapon:'sword',wlen:76,blade:'#f4f1ea',t:p.anim,speed:p.speed,flow:1,theta:-.35,armPhi:1,
   runPh:p.anim*12,run:p.onGround&&p.speed>60&&p.act===null,air:!p.onGround&&p.act!=='dodge',lean:p.speed>30?clamp(p.speed/340*6,0,6):0,crouch:0};
  if(p.onGround&&!f.run&&p.act===null){f.crouch=Math.sin(p.anim*2.4)*.8;f.theta=-.55+Math.sin(p.anim*2)*.06}
  if(f.run)f.theta=-.9+Math.sin(f.runPh)*.15;
  if(!p.onGround&&p.act===null){f.theta=-1.1;f.armPhi=.4}
  switch(p.act){
   case'attack':{const c=p.cur,u=clamp(p.st/(c.wu+c.act),0,1);f.theta=lerp(c.arc[0],c.arc[1],ease(u));f.armPhi=lerp(.8,f.theta,.85);f.lean=4+u*8;f.stance=u*8;f.speed=200;break}
   case'heavy':{const u=clamp(p.st/.3,0,1);f.theta=lerp(-2.8,1.3,ease(u));f.armPhi=lerp(-1.5,f.theta,.8);f.lean=8*u;f.crouch=6;f.stance=10;f.glow=p.heavyF>.5&&u<1;break}
   case'charge':{f.theta=-2.6;f.armPhi=-2.1;f.crouch=6+Math.min(1,p.charge)*6;f.lean=-3;f.glow=p.charge>.5;f.stance=4;break}
   case'parry':{f.theta=p.st<PW?-1.55:-1.15;f.armPhi=-.35;f.lean=1;f.crouch=3;f.blade=p.st<PW?'#ffffff':'#f4f1ea';f.stance=4;break}
   case'dodge':{f.lean=16;f.crouch=14;f.theta=-.05;f.armPhi=.3;f.wide=p.onGround;f.speed=340;break}
   case'hurt':f.lean=-10;f.theta=.7;f.armPhi=1.5;f.crouch=3;break;
   case'stagger':f.lean=-15;f.crouch=16;f.theta=1.2;f.armPhi=1.6;break;
   case'drink':{f.theta=2.0;f.armPhi=-1.3;f.crouch=5;f.lean=-2;break}
   case'counter':{const u=clamp(p.st/.3,0,1);f.theta=lerp(-2.6,1.3,ease(u));f.armPhi=lerp(-1.2,f.theta,.8);f.lean=10*u;f.stance=12;break}
   case'dead':{f.rot=-Math.min(1,p.st*3)*1.5;f.theta=1.2;f.armPhi=1.4;f.run=false;break}
  }
  if(p.invuln>0&&p.act!=='dodge'&&p.act!=='counter'&&!p.dead)f.alpha=Math.sin(G.t*60)>0?1:.45;
  return f}
function enemyFig(e){
  const c=e.cfg,boss=e.kind==='boss';
  const f={x:e.x,y:e.y,face:e.face,scale:c.sc,body:c.body,rim:c.rim,hat:c.hat,eye:c.eye,weapon:c.weapon,wlen:c.wlen,blade:c.blade,t:e.anim,speed:e.moving?e.cfg.speed:0,runPh:e.runPh,run:e.moving,theta:-.5,armPhi:1,shield:c.shield,flow:boss?1.5:.6,leg:c.body,
   mantle:boss?'#0a0a0c':null,mantleR:boss?30:0,hair:boss?'#e6e2da':null,skin:boss?'#cfc9bd':null,sash:boss?'#9d1217':'#5a1216',glow:e.glow,alpha:e.alpha,lean:e.moving?3:0,crouch:0};
  if(boss&&e.ph===2){f.body='#1d0507';f.leg='#1d0507';f.mantle='#7a0d12';f.eye='#ff2a2a';f.glow=e.glow;f.sash='#ff2a2a';f.mantleR=40}
  if(boss&&e.ph===2)f.eyeGlow=true;
  if(!e.moving&&e.state!=='attack'){f.theta=-.6+Math.sin(e.anim*2)*.05;f.crouch=Math.sin(e.anim*2.1)*.8}
  if(e.moving)f.theta=-.8;
  if(e.kind==='spear'){f.theta=.05;f.armPhi=.15;f.handPull=0}
  if(e.state==='attack'&&e.seq){const s=e.seq[e.step];
    if(e.phase==='wu'){const u=clamp(e.t/s.wu,0,1);
      if(e.kind==='spear'){f.theta=s.low?lerp(.05,.5,ease(u)):.05;f.handPull=-26*ease(u);f.armPhi=.15;f.crouch=s.low?10*u:0;f.lean=-3*u}
      else if(s.proj){f.theta=lerp(-.5,-2.0,ease(u));f.armPhi=lerp(1,-.6,ease(u));f.lean=-4*u}
      else{f.theta=lerp(-.5,-2.5,ease(u));f.armPhi=lerp(1,-1.8,ease(u));f.lean=-5*u;f.crouch=3*u;if(boss&&s.red){f.crouch=-4*u;f.theta=lerp(-.5,-2.8,ease(u))}}}
    else if(e.phase==='act'){const u=clamp(e.t/Math.max(.001,s.act),0,1);
      if(e.kind==='spear'){f.theta=s.low?lerp(.5,.1,u):.02;f.handPull=lerp(-26,22,ease(u));f.crouch=s.low?10:0;f.lean=6}
      else if(s.proj){f.theta=lerp(-2,.6,ease(u));f.armPhi=lerp(-.6,.7,u);f.lean=8}
      else{f.theta=lerp(-2.5,.9,ease(u));f.armPhi=lerp(-1.8,.8,ease(u));f.lean=10;f.stance=10}}
    else{ if(e.kind==='spear'){f.theta=.05;f.handPull=18}else{f.theta=.9;f.armPhi=.9}f.lean=6}}
  else if(e.state==='parried'){f.lean=-12;f.theta=.5;f.armPhi=1.5;f.crouch=4}
  else if(e.state==='broken'){f.lean=-12;f.crouch=18;f.theta=1.2;f.armPhi=1.6}
  else if(e.state==='hurt'){f.lean=-9;f.crouch=3}
  else if(e.state==='transform'){f.theta=-2.8;f.armPhi=-2.2;f.crouch=-2;f.lean=-4}
  if(e.dead){f.rot=-Math.min(1,e.deadT*3)*1.5;f.glow=false}
  if(e.flashT>0){f.body='#e8e4da';f.leg='#e8e4da';f.rim='#fff'}
  return f}
function drawEnemy(e){
  if(!e.vis&&!e.dead){ // vanished: wisp marker at destination
    const x=e.spotX;ctx.strokeStyle='rgba(190,20,26,.85)';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,e.y-2,34+Math.sin(G.t*20)*3,9,0,0,TAU);ctx.stroke();ctx.fillStyle='rgba(190,20,26,.3)';ctx.fill();return}
  if(e.glow&&!e.dead){ctx.globalAlpha=.7+Math.sin(G.t*25)*.2;ctx.drawImage(GLOW,e.x-110,e.y-e.h-30,220,e.h+60);ctx.globalAlpha=1}
  if(e.kind==='boss'&&e.ph===2&&!e.dead){ctx.globalAlpha=.35+Math.sin(G.t*6)*.1;ctx.drawImage(GLOW,e.x-150,e.y-e.h*1.4,300,e.h*1.6);ctx.globalAlpha=1}
  const f=enemyFig(e);drawFigure(ctx,f);
  // low sweep telegraph + dodge cue
  if(e.state==='attack'&&e.seq){const s=e.seq[e.step];
    if(s.low&&e.phase==='wu'){ctx.fillStyle='rgba(190,20,26,'+(.2+.3*Math.sin(G.t*30))+')';ctx.fillRect(Math.min(e.x,e.x+e.face*s.reach),e.y-6,s.reach,6)}
    if(s.red&&e.phase==='wu'){const a=.6+.4*Math.sin(G.t*30);ctx.globalAlpha=a;ctx.fillStyle='#e0262d';ctx.font='bold 34px '+KAI;ctx.textAlign='center';ctx.fillText('危',e.x,e.y-e.h*e.cfg.sc-26);ctx.globalAlpha=1}
    if(s.proj&&e.phase==='wu'){ctx.fillStyle='rgba(190,20,26,.25)';ctx.fillRect(Math.min(e.x,e.x+e.face*800),e.y-40,800,40)}}
  if(e.cue){const tx=e.x+e.face*(e.kind==='spear'?150:70),ty=e.y-e.h*.8*(e.kind==='boss'?1.1:1);ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(tx,ty,14+Math.sin(G.t*50)*3,0,TAU);ctx.stroke();sparkBurst(tx,ty,1,200,'#fff')}
  if(e.state==='broken'&&!e.dead){ctx.fillStyle='#e8e4da';for(let i=0;i<3;i++){const a=G.t*5+i*2.1;ctx.beginPath();ctx.arc(e.x+Math.cos(a)*18,e.y-e.h*e.cfg.sc-14+Math.sin(a)*5,3,0,TAU);ctx.fill()}
    const p=G.player;if(Math.abs(p.x-e.x)<250){ctx.fillStyle='#c4161c';ctx.font='bold 22px '+SERIF;ctx.textAlign='center';ctx.fillText('[J] 处决',e.x,e.y-e.h*e.cfg.sc-34)}}
  // mini bars
  if(!e.dead&&e.kind!=='boss'&&(e.state!=='idle')){const w=50,x=e.x-w/2,y=e.y-e.h*e.cfg.sc-18;ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(x-1,y-1,w+2,8);ctx.fillStyle='#b3121a';ctx.fillRect(x,y,w*e.hp/e.maxHp,3);ctx.fillStyle=e.posture/e.maxPost>.7?'#ff6a50':'#e8e4da';ctx.fillRect(x,y+4,w*Math.min(1,e.posture/e.maxPost),2)}
}
function drawPlayer(){const p=G.player;
  for(const g of p.trail){const f=playerFig(p);f.x=g.x;f.y=g.y;f.face=g.face;f.alpha=g.life/.28*.45;f.body='#b3121a';f.leg='#b3121a';f.rim='#000';f.hair=null;f.scarf=null;f.sash=null;f.weapon=null;f.lean=16;f.crouch=14;f.theta=0;drawFigure(ctx,f)}
  const f=playerFig(p);drawFigure(ctx,f);
  if(p.act==='charge'&&p.charge>.15){ctx.strokeStyle='rgba(255,90,80,'+Math.min(1,p.charge)+')';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y-50,50-p.charge*28,0,TAU*Math.min(1,p.charge/.9));ctx.stroke()}
  if(p.act==='parry'&&p.st<PW){ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x+p.face*28,p.y-62,22,-1.4,1.4);ctx.stroke()}
  if(p.act==='parry'&&p.guarding){ctx.strokeStyle='rgba(235,232,222,.5)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x+p.face*20,p.y-60,36,p.face>0?-1.2:Math.PI-1.2+.0,p.face>0?1.2:Math.PI+1.2);ctx.stroke()}
  if(p.counterT>0&&p.counterTarget&&!p.counterTarget.dead){ctx.fillStyle='#c4161c';ctx.font='bold 34px '+KAI;ctx.textAlign='center';ctx.fillText('J 反击',p.x,p.y-p.h-26)}
}
function drawProj(t){for(const pr of G.proj){const d=sgn(pr.vx);ctx.save();ctx.translate(pr.x,pr.y);ctx.scale(d,1);
  if(pr.pk==='ground'){ctx.fillStyle='rgba(190,20,26,.85)';ctx.beginPath();ctx.moveTo(-30,0);ctx.quadraticCurveTo(0,-pr.h*1.6,32,0);ctx.quadraticCurveTo(0,-pr.h*.5,-30,0);ctx.fill()}
  else{const h=pr.h;ctx.fillStyle=pr.owner==='player'?'rgba(240,236,226,.9)':'rgba(190,18,24,.9)';ctx.beginPath();ctx.moveTo(-26,0);ctx.quadraticCurveTo(-8,-h*.55,34,-h*.55);ctx.quadraticCurveTo(10,-h*.3,-4,-h*.1);ctx.quadraticCurveTo(26,-h*.6,-26,-h);ctx.quadraticCurveTo(-34,-h*.5,-26,0);ctx.fill();ctx.fillStyle='#0a0a0b';ctx.beginPath();ctx.moveTo(-22,-4);ctx.quadraticCurveTo(-4,-h*.5,26,-h*.5);ctx.quadraticCurveTo(0,-h*.25,-22,-4);ctx.fill()}
  ctx.restore()}}

function rainLayer(dt,a,dir){ctx.strokeStyle='rgba(205,210,208,1)';ctx.lineWidth=1.2;for(const r of RAIN){r.y+=r.s*dt;r.x-=r.s*dt*.22;if(r.y>H){r.y=-r.l;r.x=Math.random()*(W+300)}if(r.x<-40)r.x+=W+300;ctx.globalAlpha=r.a*a;ctx.beginPath();ctx.moveTo(r.x,r.y);ctx.lineTo(r.x+r.l*.22,r.y-r.l);ctx.stroke()}ctx.globalAlpha=1}

function drawScene(dt){
  const cam=G.cam,t=G.t;
  ctx.drawImage(BG.sky,0,0);
  ctx.save();
  drawStrip(BG.far,.06,-30,cam,.9);mistBand(470,.22,6,t,cam,.1);
  drawStrip(BG.mid,.14,-10,cam,.95);mistBand(540,.25,10,t,cam,.2);
  drawStrip(BG.near,.32,30,cam,1);
  mistBand(640,.16,16,t,cam,.4);
  ctx.restore();
  ctx.save();
  const sx=G.shake>0?rand(-G.shake,G.shake):0,sy=G.shake>0?rand(-G.shake,G.shake):0;
  ctx.translate(-Math.round(cam.x)+sx,-Math.round(cam.y)+sy);
  for(const p of PL)drawPlat(p,cam,t);
  drawGate(t);drawCheckpoints(t);
  for(const d of DECAL){ctx.globalAlpha=.55;drawBlob(ctx,d.b,d.x,d.y-2,d.col,d.r/20*.0+1);}ctx.globalAlpha=1;
  if(G.enemies.length){for(const e of G.enemies)if(e.x>cam.x-200&&e.x<cam.x+W+200)drawEnemy(e);drawEnemy(G.boss)}
  if(G.player)drawPlayer();
  drawProj(t);drawBarrier(t);
  drawFX(ctx,dt);drawParticles(ctx,dt);
  for(const tx of TXT){if(!tx.txt)continue;const k=tx.life/tx.max,pop=1+Math.max(0,k-.8)*3;ctx.save();ctx.globalAlpha=Math.min(1,k*2.2);ctx.translate(tx.x,tx.y-(1-k)*30);ctx.scale(pop,pop);ctx.font='bold '+tx.size+'px '+KAI;ctx.textAlign='center';ctx.lineWidth=6;ctx.strokeStyle='#000';ctx.strokeText(tx.txt,0,0);ctx.fillStyle=tx.col;ctx.fillText(tx.txt,0,0);ctx.restore()}
  ctx.restore();
  // front rain
  ctx.save();rainLayer(dt,1);ctx.restore();
}
function brushBar(x,y,w,h,k,col,lag,bg){ctx.fillStyle='rgba(0,0,0,.65)';ctx.beginPath();ctx.moveTo(x-4,y+h/2);ctx.lineTo(x+4,y-3);ctx.lineTo(x+w+4,y-1);ctx.lineTo(x+w-2,y+h+3);ctx.lineTo(x,y+h+2);ctx.closePath();ctx.fill();
  if(lag!=null){ctx.fillStyle='#e8e4da';ctx.fillRect(x,y,w*clamp(lag,0,1),h)}ctx.fillStyle=col;ctx.fillRect(x,y,w*clamp(k,0,1),h);ctx.strokeStyle='rgba(232,228,218,.7)';ctx.lineWidth=1.5;ctx.strokeRect(x-.5,y-.5,w+1,h+1)}
function drawHUD(){
  const p=G.player;if(!p)return;ctx.save();ctx.textAlign='left';
  ctx.font='bold 22px '+KAI;ctx.fillStyle='#e8e4da';ctx.strokeStyle='#000';ctx.lineWidth=4;ctx.strokeText('命',30,60);ctx.fillText('命',30,60);
  brushBar(64,46,380,16,p.hp/p.maxHp,'#b3121a',p.hpLag/p.maxHp);
  ctx.strokeText('势',30,86);ctx.fillText('势',30,86);
  const pk=p.posture/p.maxPost;brushBar(64,74,270,8,pk,pk>.7?'#ff5a40':'#e8e4da',null);
  for(let i=0;i<3;i++){const x=70+i*30,y=104;ctx.fillStyle=i<p.flasks?'#b3121a':'rgba(232,228,218,.15)';ctx.beginPath();ctx.ellipse(x,y+6,8,10,0,0,TAU);ctx.fill();ctx.beginPath();ctx.ellipse(x,y-6,4.5,6,0,0,TAU);ctx.fill();ctx.strokeStyle='rgba(232,228,218,.7)';ctx.lineWidth=1.2;ctx.stroke()}
  ctx.font='14px '+SERIF;ctx.fillStyle='rgba(232,228,218,.6)';ctx.fillText('[Q] 药',150,110);
  // letter seal
  ctx.fillStyle='#a8161c';ctx.fillRect(470,44,34,34);ctx.fillStyle='#f0e8dc';ctx.font='bold 24px '+KAI;ctx.textAlign='center';ctx.fillText('信',487,69);ctx.textAlign='left';ctx.font='14px '+SERIF;ctx.fillStyle='rgba(232,228,218,.7)';ctx.fillText('密信 · 送至观雨楼',512,66);
  // top right
  ctx.textAlign='right';ctx.font='13px '+SERIF;ctx.fillStyle='rgba(232,228,218,.5)';ctx.fillText('P 暂停　M 静音　F 全屏',W-24,34);
  ctx.restore();
  // boss bar
  const b=G.boss;if(G.bossActive&&b&&!b.dead){const w=700,x=(W-w)/2,y=H-70,show=Math.min(1,(2.4-G.bossIntro)*1.2);ctx.save();ctx.globalAlpha=show;
    ctx.font='bold 28px '+KAI;ctx.textAlign='center';ctx.fillStyle='#e8e4da';ctx.strokeStyle='#000';ctx.lineWidth=5;ctx.strokeText('寒鸦判官',W/2,y-12);ctx.fillText('寒鸦判官',W/2,y-12);
    brushBar(x,y,w,14,b.hp/b.maxHp,b.ph===2?'#d11a22':'#a8141b',null);ctx.fillStyle='rgba(255,255,255,.7)';ctx.fillRect(x+w/2-1,y-4,2,22);
    const pk=b.posture/b.maxPost;brushBar(x+w*.15,y+22,w*.7,6,pk,pk>.7?'#ff5a40':'#e8e4da',null);
    if(b.state==='broken'){ctx.font='bold 20px '+SERIF;ctx.fillStyle='#ff5a40';ctx.fillText('失衡 · 近身按 J 处决',W/2,y+50)}
    ctx.restore()}
  // intro card
  if(G.bossIntro>0&&G.bossActive){const k=G.bossIntro/2.4,a=Math.min(1,(1-k)*4)*Math.min(1,k*3);ctx.save();ctx.globalAlpha=a;ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,H*.34,W,130);ctx.font='bold 76px '+KAI;ctx.textAlign='center';ctx.fillStyle='#c4161c';ctx.fillText('寒鸦判官',W/2,H*.34+80);ctx.font='18px '+SERIF;ctx.fillStyle='#d9d5cc';ctx.fillText('观雨楼守楼人 · 刀下无信',W/2,H*.34+112);ctx.restore()}
  // hints / messages
  if(G.hintT>0&&G.hint){const a=Math.min(1,G.hintT);ctx.save();ctx.globalAlpha=a;ctx.font='19px '+SERIF;ctx.textAlign='center';const w=ctx.measureText(G.hint).width+50;ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(W/2-w/2,H-130,w,38);ctx.fillStyle='#e8e4da';ctx.fillText(G.hint,W/2,H-105);ctx.restore()}
  if(G.msgT>0&&G.msg){const a=Math.min(1,G.msgT);ctx.save();ctx.globalAlpha=a;ctx.font='bold 26px '+KAI;ctx.textAlign='center';ctx.lineWidth=5;ctx.strokeStyle='#000';ctx.strokeText(G.msg,W/2,170);ctx.fillStyle='#e8e4da';ctx.fillText(G.msg,W/2,170);ctx.restore()}
  // low hp pulse
  if(p.hp/p.maxHp<.3&&!p.dead){const a=.12+.1*Math.sin(G.t*6);const g=ctx.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,W*.65);g.addColorStop(0,'rgba(150,0,10,0)');g.addColorStop(1,'rgba(150,0,10,'+(a*2)+')');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
}
function postFX(){
  ctx.drawImage(BG.vig,0,0);
  if(G.lightning>0){ctx.fillStyle='rgba(235,240,255,'+(G.lightning*.35)+')';ctx.fillRect(0,0,W,H)}
  if(G.flash>0){ctx.globalAlpha=G.flash;ctx.fillStyle=G.flashCol;ctx.fillRect(0,0,W,H);ctx.globalAlpha=1}
  if(G.slowT>0&&G.slowScale<.5){ctx.fillStyle='rgba(110,8,14,.16)';ctx.fillRect(0,0,W,H);ctx.drawImage(BG.vig,0,0);
    ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=1.5;for(let i=0;i<18;i++){const a=i/18*TAU+G.t*.3,r1=300+Math.sin(i*5+G.t*3)*40,r2=r1+rand(80,300);ctx.beginPath();ctx.moveTo(W/2+Math.cos(a)*r1*1.5,H/2+Math.sin(a)*r1*.9);ctx.lineTo(W/2+Math.cos(a)*r2*1.5,H/2+Math.sin(a)*r2*.9);ctx.stroke()}}
  for(const s of SPLAT){const k=s.life/s.max;ctx.globalAlpha=Math.min(1,k*1.4)*.9;drawBlob(ctx,s.b,s.x,s.y,s.col,1+(1-k)*.15)}ctx.globalAlpha=1;
  ctx.globalAlpha=.07;ctx.globalCompositeOperation='overlay';ctx.fillStyle=BG.grain;ctx.save();ctx.translate(Math.random()*256|0,Math.random()*256|0);ctx.fillRect(-256,-256,W+512,H+512);ctx.restore();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  if(G.fade>0){ctx.fillStyle='rgba(0,0,0,'+G.fade+')';ctx.fillRect(0,0,W,H)}
}
/* ---- ink brush title helpers ---- */
function brushText(txt,x,y,size,col,font){ctx.save();ctx.font='bold '+size+'px '+(font||KAI);ctx.textAlign='center';ctx.lineJoin='round';ctx.lineWidth=size*.12;ctx.strokeStyle='rgba(0,0,0,.85)';ctx.strokeText(txt,x,y);ctx.fillStyle=col;ctx.fillText(txt,x,y);ctx.restore()}
function drawTitle(){
  ctx.fillStyle='rgba(0,0,0,.52)';ctx.fillRect(0,0,W,H);
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(0,0,0,.35)');g.addColorStop(.5,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.7)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  // ink splash behind title
  const tt=G.t;ctx.save();ctx.globalAlpha=.9;if(!G.tb)G.tb=[inkBlobPts(210,3),inkBlobPts(120,9),inkBlobPts(90,21)];drawBlob(ctx,G.tb[0],W/2-10,150,'rgba(4,4,5,.92)',1.9);drawBlob(ctx,G.tb[1],W/2+300,100,'rgba(150,14,20,.85)',1.3);drawBlob(ctx,G.tb[2],W/2-330,190,'rgba(150,14,20,.7)',1.0);ctx.restore();
  brushText('墨雨孤刃',W/2,175,128,'#efe9dc');
  ctx.save();ctx.fillStyle='#b3121a';ctx.fillRect(W/2+330,92,58,58);ctx.fillStyle='#f0e8dc';ctx.font='bold 42px '+KAI;ctx.textAlign='center';ctx.fillText('刃',W/2+359,136);ctx.restore();
  ctx.save();ctx.textAlign='center';ctx.font='20px '+SERIF;ctx.fillStyle='#d9d5cc';ctx.fillText('I N K  &  R A I N　·　A  B L A D E  A L O N E',W/2,222);
  ctx.font='16px '+SERIF;ctx.fillStyle='rgba(232,228,218,.7)';ctx.fillText('江南雨夜，屋脊之上。一封染血的密信，一柄孤刃，一座拦路的观雨楼。',W/2,252);ctx.restore();
  // controls
  const rows=[['← → / A D','移动'],['Space','跳跃 · 空中二段跳 · 长按滑翔 · 贴墙蹬墙跳'],['J','出剑（连按三下连招 · 空中劈斩）'],['I','重击（按住蓄力 · 可破盾）'],['K','格挡 / 弹反（出招瞬间按 = 精准格挡 → 慢动作反击）'],['L','闪避（无敌帧 · 精准闪避触发慢动作）'],['Q','饮药　　P 暂停　M 静音　F 全屏']];
  const bx=W/2-380,by=300;ctx.save();ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(bx-20,by-30,780,rows.length*34+40);ctx.strokeStyle='rgba(232,228,218,.35)';ctx.lineWidth=1;ctx.strokeRect(bx-20,by-30,780,rows.length*34+40);
  ctx.font='bold 17px '+SERIF;rows.forEach((r,i)=>{const y=by+i*34;ctx.textAlign='left';ctx.fillStyle='#0b0b0c';ctx.strokeStyle='#d9d5cc';ctx.lineWidth=1.2;const w=Math.max(66,ctx.measureText(r[0]).width+22);ctx.fillRect(bx,y-20,w,28);ctx.strokeRect(bx,y-20,w,28);ctx.fillStyle='#f0e8dc';ctx.fillText(r[0],bx+11,y);ctx.fillStyle='#d9d5cc';ctx.font='17px '+SERIF;ctx.fillText(r[1],bx+190,y);ctx.font='bold 17px '+SERIF});ctx.restore();
  ctx.save();ctx.textAlign='center';ctx.font='15px '+SERIF;ctx.fillStyle='rgba(232,228,218,.65)';ctx.fillText('红色「危」光 = 不可格挡，须闪避或跳起　·　势条打满的敌人会失衡，近身按 J 处决',W/2,by+rows.length*34+44);
  ctx.font='16px '+KAI;ctx.fillStyle='rgba(232,228,218,.75)';ctx.fillText('浮士德工作室 出品',W/2,H-110);
  ctx.font='13px '+SERIF;ctx.fillStyle='rgba(232,228,218,.5)';ctx.fillText('Faustus Studio',W/2,H-90);
  const a=.55+.45*Math.sin(tt*3);ctx.globalAlpha=a;ctx.font='bold 30px '+KAI;ctx.fillStyle='#e8e4da';ctx.fillText('按 Enter 开始',W/2,H-52);ctx.restore()}
function drawStory(){
  ctx.fillStyle='rgba(0,0,0,.86)';ctx.fillRect(0,0,W,H);
  const lines=['三更，雨。','','你怀揣一封染血的密信，','自江南屋脊之上，夜行而来。','','观雨楼灯火在前，守楼人寒鸦判官横刀拦路——','信，必须送到。','','按 Enter 入夜'];
  ctx.save();ctx.textAlign='center';lines.forEach((l,i)=>{const a=clamp(G.storyT*1.6-i*.35,0,1);ctx.globalAlpha=a;ctx.font=(i===0?'bold 52px ':'24px ')+KAI;ctx.fillStyle=i===0?'#c4161c':'#e8e4da';ctx.fillText(l,W/2,170+i*48)});ctx.restore()}
function drawDeath(){const k=clamp((G.deathT-.6)*1.4,0,1);if(k<=0)return;ctx.save();ctx.globalAlpha=k;ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,0,W,H);brushText('殒',W/2,H/2+40,200,'#b3121a');ctx.font='22px '+SERIF;ctx.textAlign='center';ctx.fillStyle='#e8e4da';if(G.deathT>1.2)ctx.fillText('按 Enter 自灯笼处重来',W/2,H/2+110);ctx.restore()}
function drawPause(){ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,W,H);brushText('暂 停',W/2,200,96,'#e8e4da');ctx.save();ctx.textAlign='center';ctx.font='20px '+SERIF;ctx.fillStyle='#d9d5cc';['P / Esc 继续','← → / A D 移动 · Space 跳 · J 出剑 · I 重击 · K 格挡 · L 闪避 · Q 饮药','R 返回标题'].forEach((l,i)=>ctx.fillText(l,W/2,290+i*40));ctx.restore()}
function drawWin(){const k=clamp(G.endT*.5-.5,0,1);if(k<=0)return;ctx.save();ctx.globalAlpha=k;ctx.fillStyle='rgba(235,230,218,.0)';ctx.fillRect(0,0,W,H);
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(0,0,0,.92)');g.addColorStop(1,'rgba(10,8,8,.96)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  brushText('信已送达',W/2,230,130,'#efe9dc');ctx.font='24px '+KAI;ctx.textAlign='center';ctx.fillStyle='#d9d5cc';ctx.fillText('雨停了。天，快亮了。',W/2,290);
  ctx.font='16px '+KAI;ctx.fillStyle='rgba(217,213,204,.8)';ctx.fillText('浮士德工作室 出品',W/2,318);
  ctx.font='13px '+SERIF;ctx.fillStyle='rgba(217,213,204,.5)';ctx.fillText('Faustus Studio',W/2,338);
  const m=Math.floor(G.time/60),s=Math.floor(G.time%60);
  ctx.font='20px '+SERIF;ctx.fillStyle='#e8e4da';const L=[['用时',m+' 分 '+s+' 秒'],['倒下',G.deaths+' 次'],['精准格挡',G.stats.pp+' 次'],['精准闪避',G.stats.pd+' 次'],['处决',G.stats.exec+' 次'],['斩敌',G.stats.kills+' 人']];L.forEach((r,i)=>{ctx.textAlign='right';ctx.fillStyle='rgba(232,228,218,.6)';ctx.fillText(r[0],W/2-20,360+i*36);ctx.textAlign='left';ctx.fillStyle='#e8e4da';ctx.fillText(r[1],W/2+20,360+i*36)});
  ctx.textAlign='center';ctx.fillStyle='#b3121a';ctx.fillRect(W/2-30,H-130,60,60);ctx.fillStyle='#f0e8dc';ctx.font='bold 44px '+KAI;ctx.fillText('完',W/2,H-84);
  if(G.endT>3){ctx.globalAlpha=.6+.4*Math.sin(G.t*3);ctx.font='20px '+SERIF;ctx.fillStyle='#d9d5cc';ctx.fillText('按 Enter 返回标题',W/2,H-30)}ctx.restore()}

/* ---------------- main loop ---------------- */
function update(rdt){
  G.t+=rdt;
  G.nextLightning-=rdt;if(G.nextLightning<=0){G.lightning=1;G.nextLightning=rand(9,18);if(G.mode==='play')setTimeout(()=>AU.thunder(),rand(300,900))}
  G.lightning=Math.max(0,G.lightning-rdt*2.2);
  G.flash=Math.max(0,G.flash-rdt*1.8);G.shake=Math.max(0,G.shake-rdt*40);
  if(G.fade>0)G.fade=Math.max(0,G.fade-rdt*1.6);
  AU.tick(rdt);
  if(G.mode==='title'){G.cam.x=300+Math.sin(G.t*.1)*200;G.cam.y=0;G.dummy=true;if(consume('ok',.3)){G.mode='story';G.storyT=0}
    if(!G.player){G.enemies=[];G.boss=makeEnemy('boss',BOSS_X);G.player=newPlayer(CPS[0])}
    return}
  if(G.mode==='story'){G.storyT+=rdt;if(G.storyT>.5&&consume('ok',.3))startGame();return}
  if(G.ending){G.endT+=rdt;if(G.endT>3&&consume('ok',.3)){G.mode='title';G.player=null;G.ending=false;G.enemies=[];G.fade=1}
    if(G.endT<2.4){} }
  if(G.paused){if(keys.KeyR){G.paused=false;G.mode='title';G.player=null;G.enemies=[];G.fade=1}return}
  if(G.zoomT>0)G.zoomT-=rdt;G.zoom+=((G.zoomT>0?1.14:1)-G.zoom)*Math.min(1,rdt*8);
  let dt;
  if(G.hitstop>0){G.hitstop-=rdt;dt=0}else{if(G.slowT>0)G.slowT-=rdt;dt=rdt*G.ts}
  if(dt>0){const n=Math.max(1,Math.ceil(dt/.0125));for(let i=0;i<n;i++)worldUpdate(dt/n,rdt/n)}
  else{G.hintT-=0;}
  if(G.player.dead&&G.deathT>1.3&&consume('ok',.25)){respawn()}
  updateCamera(rdt,false);
}
function render(){
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#000';ctx.fillRect(0,0,cv.width,cv.height);
  ctx.setTransform(VS,0,0,VS,VX,VY);ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();
  const rdt=G._rdt||.016;
  if(G.mode==='story'){drawStory()}
  else{
    ctx.save();if(G.zoom>1.001&&G.player){const px=G.player.x-G.cam.x,py=G.player.y-G.cam.y-60;ctx.translate(px,py);ctx.scale(G.zoom,G.zoom);ctx.translate(-px,-py)}
    drawScene(G.paused?0:(G.hitstop>0?0:rdt*(G.ts<1?.5:1)));ctx.restore();
    postFX();
    if(G.mode==='title')drawTitle();
    else{drawHUD();if(G.player&&G.player.dead)drawDeath();if(G.paused)drawPause();if(G.ending)drawWin()}
  }
  ctx.restore();
}
let lastT=performance.now();
function frame(now){const rdt=Math.min(.05,Math.max(.001,(now-lastT)/1000));lastT=now;G._rdt=rdt;
  try{update(rdt);render()}catch(e){console.error(e);window.__err=(window.__err||[]);window.__err.push(String(e&&e.stack||e));if(window.__err.length>5)window.__err.shift()}
  requestAnimationFrame(frame)}
requestAnimationFrame(frame);
window.__G=G;window.__dbg={PL,CPS,startGame,respawn,hurtEnemy,execute};
