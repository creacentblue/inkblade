/* ---------------- procedural backdrop ---------------- */
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
const BG={};
function pagoda(c,x,base,w,floors,col){ // layered eaves silhouette
  c.fillStyle=col;let cw=w,y=base;
  c.fillRect(x-cw*.32,y-floors*w*.42-8,cw*.64,floors*w*.42+8);
  for(let i=0;i<floors;i++){const ww=cw*(1-i*.14),yy=y-i*w*.42;
    c.beginPath();c.moveTo(x-ww*.78,yy-w*.1);c.quadraticCurveTo(x-ww*.45,yy-w*.02,x-ww*.18,yy-w*.3);c.lineTo(x+ww*.18,yy-w*.3);c.quadraticCurveTo(x+ww*.45,yy-w*.02,x+ww*.78,yy-w*.1);c.quadraticCurveTo(x+ww*.5,yy+w*.04,x,yy+w*.04);c.quadraticCurveTo(x-ww*.5,yy+w*.04,x-ww*.78,yy-w*.1);c.fill();}
  const top=y-floors*w*.42;c.fillRect(x-1.5,top-w*.55,3,w*.5);
}
function house(c,x,base,w,h,col){c.fillStyle=col;c.fillRect(x-w*.4,base-h,w*.8,h);
  c.beginPath();c.moveTo(x-w*.62,base-h+8);c.quadraticCurveTo(x-w*.3,base-h+2,x-w*.12,base-h-h*.5);c.lineTo(x+w*.12,base-h-h*.5);c.quadraticCurveTo(x+w*.3,base-h+2,x+w*.62,base-h+8);c.quadraticCurveTo(x,base-h+22,x-w*.62,base-h+8);c.fill();}
function buildBG(){
  // sky
  const sky=mk(W,H),c=sky.getContext('2d');
  let g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#050506');g.addColorStop(.45,'#1d1e20');g.addColorStop(.72,'#6b6d6c');g.addColorStop(.86,'#3a3b3c');g.addColorStop(1,'#0e0e10');c.fillStyle=g;c.fillRect(0,0,W,H);
  g=c.createRadialGradient(930,190,10,930,190,380);g.addColorStop(0,'rgba(190,20,25,.55)');g.addColorStop(.25,'rgba(120,14,18,.25)');g.addColorStop(1,'rgba(120,14,18,0)');c.fillStyle=g;c.fillRect(0,0,W,H);
  c.fillStyle='#a8171c';c.beginPath();c.arc(930,190,74,0,TAU);c.fill();
  g=c.createRadialGradient(915,175,5,930,190,76);g.addColorStop(0,'rgba(255,120,110,.35)');g.addColorStop(1,'rgba(60,0,0,.35)');c.fillStyle=g;c.beginPath();c.arc(930,190,74,0,TAU);c.fill();
  // ink-wash cloud streaks
  const r=mulberry(7);c.filter='blur(14px)';for(let i=0;i<14;i++){const y=60+r()*380,x=r()*W,w=260+r()*520;c.fillStyle='rgba('+(r()<.5?'8,8,9':'95,96,96')+','+(.18+r()*.2)+')';c.beginPath();c.ellipse(x,y,w,10+r()*22,0,0,TAU);c.fill()}c.filter='none';
  BG.sky=sky;
  // parallax strips (seamless period)
  const P=2400;
  function strip(col,fn,blur){const s=mk(P,H),c=s.getContext('2d');if(blur)c.filter='blur('+blur+'px)';c.fillStyle=col;fn(c);c.filter='none';return s}
  const rr=mulberry(11);
  BG.far=strip('#4c4d4e',c=>{c.beginPath();c.moveTo(0,H);for(let x=0;x<=P;x+=20){const a=x/P*TAU;const y=470-70*Math.sin(a*3+1)-45*Math.sin(a*7+.4)-25*Math.sin(a*13)-10*Math.sin(a*29);c.lineTo(x,y)}c.lineTo(P,H);c.fill()},3);
  BG.mid=strip('#2f3031',c=>{c.beginPath();c.moveTo(0,H);for(let x=0;x<=P;x+=16){const a=x/P*TAU;const y=520-55*Math.sin(a*4+2)-30*Math.sin(a*9+1)-14*Math.sin(a*21);c.lineTo(x,y)}c.lineTo(P,H);c.fill();
     [300,1100,1850].forEach((x,i)=>{pagoda(c,x,500-i*8,70+i*10,5-(i%2),'#262728');pagoda(c,x+P,500,70,5,'#262728');pagoda(c,x-P,500,70,5,'#262728')})},1.5);
  BG.near=strip('#161618',c=>{const rr=mulberry(5);let x=-100;while(x<P+100){const w=110+rr()*120,h=50+rr()*80;house(c,x+w/2,H-110+40,w,h,'#141416');house(c,x+w/2+P,H-110+40,w,h,'#141416');x+=w*.85;}
     [620,1500,2200].forEach(x=>{pagoda(c,x,H-60,60,4,'#121214');pagoda(c,x-P,H-60,60,4,'#121214');pagoda(c,x+P,H-60,60,4,'#121214')});
     c.fillRect(0,H-110,P,110)},0);
  BG.P=P;
  // paper grain
  const gr=mk(256,256),gc=gr.getContext('2d'),id=gc.createImageData(256,256);const nr=mulberry(3);for(let i=0;i<id.data.length;i+=4){const v=nr()*255;id.data[i]=id.data[i+1]=id.data[i+2]=v;id.data[i+3]=255}gc.putImageData(id,0,0);BG.grain=ctx.createPattern(gr,'repeat');
  // vignette
  const vg=mk(W,H),vc=vg.getContext('2d');g=vc.createRadialGradient(W/2,H*.55,H*.35,W/2,H*.55,W*.72);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.72)');vc.fillStyle=g;vc.fillRect(0,0,W,H);BG.vig=vg;
}
buildBG();
function drawStrip(img,f,yoff,cam,alpha){const P=BG.P;let ox=-((cam.x*f)%P);if(ox>0)ox-=P;ctx.globalAlpha=alpha==null?1:alpha;const y=yoff-cam.y*f*.35;ctx.drawImage(img,ox,y);ctx.drawImage(img,ox+P,y);ctx.globalAlpha=1}
function mistBand(y,a,speed,t,cam,f){const g=ctx.createLinearGradient(0,y-60,0,y+60);g.addColorStop(0,'rgba(170,172,170,0)');g.addColorStop(.5,'rgba(170,172,170,'+a+')');g.addColorStop(1,'rgba(170,172,170,0)');ctx.fillStyle=g;const sh=((t*speed+cam.x*f)%W);ctx.save();ctx.translate(-sh,0);ctx.fillRect(0,y-60,W*2,120);ctx.restore()}

/* ---------------- particles / fx ---------------- */
const PART=[],FX=[],SPLAT=[],DECAL=[],TXT=[];
function part(o){if(PART.length>900)PART.shift();PART.push(o)}
function inkBlobPts(r,seed){const rn=mulberry(seed|0),n=16,pts=[];for(let i=0;i<n;i++){const a=i/n*TAU,k=.55+rn()*.7;pts.push([Math.cos(a)*r*k,Math.sin(a)*r*k*(.8+rn()*.3)])}const sat=[];for(let i=0;i<6;i++){const a=rn()*TAU,d=r*(1+rn()*.9);sat.push([Math.cos(a)*d,Math.sin(a)*d,r*(.08+rn()*.18)])}return{pts,sat}}
function drawBlob(c,b,x,y,col,s){c.fillStyle=col;c.beginPath();for(let i=0;i<b.pts.length;i++){const p=b.pts[(i)%b.pts.length],q=b.pts[(i+1)%b.pts.length];const mx=(p[0]+q[0])/2*s,my=(p[1]+q[1])/2*s;if(i===0)c.moveTo(x+mx,y+my);else c.quadraticCurveTo(x+p[0]*s,y+p[1]*s,x+mx,y+my)}c.closePath();c.fill();for(const a of b.sat){c.beginPath();c.arc(x+a[0]*s,y+a[1]*s,a[2]*s,0,TAU);c.fill()}}
function screenSplat(x,y,r,col,life){SPLAT.push({x,y,r,col,life:life||1.6,max:life||1.6,b:inkBlobPts(r,Math.random()*1e6)})}
function decal(x,y,r,col){if(DECAL.length>50)DECAL.shift();DECAL.push({x,y,r,col,a:1,b:inkBlobPts(r,Math.random()*1e6)})}
function bloodBurst(x,y,dir,n,pow,black){for(let i=0;i<n;i++){const a=(dir>0?-.3:Math.PI+.3)+rand(-1.1,1.1)*(1);const s=rand(.3,1)*pow;part({t:'ink',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-rand(0,120),life:rand(.4,.9),max:.9,r:rand(2,6),col:(black&&Math.random()<.5)?'#0a0a0b':(Math.random()<.8?'#b3121a':'#d9d5cc'),g:900})}}
function sparkBurst(x,y,n,pow,col){for(let i=0;i<n;i++){const a=rand(0,TAU),s=rand(.3,1)*pow;part({t:'spark',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rand(.15,.4),max:.4,r:rand(8,22),col:col||'#f4f0e6',g:300})}}
function ringFx(x,y,r,col,life,w){FX.push({k:'ring',x,y,r,col,life:life||.4,max:life||.4,w:w||3})}
function slashFx(x,y,face,r,a0,a1,col,life){FX.push({k:'slash',x,y,face,r,a0,a1,col:col||'#f4f0e6',life:life||.18,max:life||.18})}
function popText(txt,x,y,col,size,life){TXT.push({txt,x,y,col:col||'#c4161c',size:size||90,life:life||1,max:life||1})}

function drawParticles(c,dt){
  for(let i=PART.length-1;i>=0;i--){const p=PART[i];p.life-=dt;if(p.life<=0){PART.splice(i,1);continue}
    p.vy+=(p.g||0)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const k=p.life/p.max;
    if(p.t==='ink'){c.globalAlpha=Math.min(1,k*1.6);c.fillStyle=p.col;c.beginPath();c.arc(p.x,p.y,p.r*(.5+k*.5),0,TAU);c.fill()}
    else if(p.t==='spark'){c.globalAlpha=k;c.strokeStyle=p.col;c.lineWidth=2;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x-p.vx*.03,p.y-p.vy*.03);c.stroke()}
    else if(p.t==='splash'){c.globalAlpha=k*.6;c.strokeStyle='#cfd2d0';c.lineWidth=1;c.beginPath();c.ellipse(p.x,p.y,p.r*(1-k)*2+1,p.r*(1-k)*.6+.5,0,0,TAU);c.stroke()}
    else if(p.t==='dust'){c.globalAlpha=k*.35;c.fillStyle='#aaa';c.beginPath();c.arc(p.x,p.y,p.r*(2-k),0,TAU);c.fill()}
    else if(p.t==='wisp'){c.globalAlpha=k*.7;c.fillStyle=p.col;c.beginPath();c.arc(p.x,p.y,p.r*(1.4-k*.6),0,TAU);c.fill()}
  }c.globalAlpha=1}
function drawFX(c,dt){
  for(let i=FX.length-1;i>=0;i--){const f=FX[i];f.life-=dt;if(f.life<=0){FX.splice(i,1);continue}const k=f.life/f.max;
    if(f.k==='ring'){c.globalAlpha=k;c.strokeStyle=f.col;c.lineWidth=f.w*k+1;c.beginPath();c.arc(f.x,f.y,f.r*(1-k*k)+4,0,TAU);c.stroke()}
    else if(f.k==='slash'){c.save();c.translate(f.x,f.y);c.scale(f.face,1);const u=1-k;
      const a1=lerp(f.a0,f.a1,Math.min(1,u*2.6)),a0=lerp(f.a0,f.a1,Math.max(0,u*2.6-1.1));
      c.globalAlpha=k;c.lineCap='round';
      c.strokeStyle='rgba(180,15,22,.8)';c.lineWidth=14*k+2;c.beginPath();c.arc(0,0,f.r,Math.min(a0,a1),Math.max(a0,a1),a1<a0);c.stroke();
      c.strokeStyle=f.col;c.lineWidth=5*k+1;c.beginPath();c.arc(0,0,f.r*.97,Math.min(a0,a1),Math.max(a0,a1),a1<a0);c.stroke();c.restore()}
    else if(f.k==='line'){c.globalAlpha=k;c.strokeStyle=f.col;c.lineWidth=f.w*k;c.beginPath();c.moveTo(f.x,f.y);c.lineTo(f.x2,f.y2);c.stroke()}
  }c.globalAlpha=1}

/* ---------------- figure renderer (brush-silhouette fighters) ---------------- */
function drawFigure(c,f){
  c.save();c.translate(f.x,f.y);if(f.rot)c.rotate(f.rot*f.face);c.scale(f.face*f.scale,f.scale);c.globalAlpha=f.alpha==null?1:f.alpha;c.lineCap='round';c.lineJoin='round';
  const lean=f.lean||0,cr=f.crouch||0,hipY=-46+cr,T=f.t||0;
  const hip=[lean*.3,hipY],sh=[lean,hipY-34],head=[lean*1.25+2,hipY-52];
  const armL=34,phi=f.armPhi==null?1:f.armPhi;
  const hand=[sh[0]+Math.cos(phi)*armL+(f.handPull||0),sh[1]+Math.sin(phi)*armL];
  function pass(extra,rim){
    const C=col=>rim?f.rim:col;
    // legs
    c.strokeStyle=C(f.leg||f.body);c.lineWidth=10+extra;
    for(let s=0;s<2;s++){let fx,fy;
      if(f.air){fx=s?14:-6;fy=s?-14:-6}
      else if(f.run){const ph=f.runPh+s*Math.PI;fx=Math.sin(ph)*22;fy=-Math.max(0,Math.cos(ph))*12}
      else{fx=s?11+(f.stance||0):-9-(f.stance||0)*.5;fy=0}
      if(f.wide){fx=s?30:-26}
      const kx=(hip[0]+fx)/2+5,ky=(hip[1]+fy)/2-3;
      c.beginPath();c.moveTo(hip[0],hip[1]);c.quadraticCurveTo(kx,ky,fx,fy);c.stroke()}
    // back arm
    c.lineWidth=7+extra;c.strokeStyle=C(f.body);c.beginPath();c.moveTo(sh[0]-2,sh[1]);c.quadraticCurveTo(sh[0]-12,sh[1]+14,sh[0]-6+(f.backArm||0),sh[1]+28);c.stroke();
    // robe / torso
    const fl=Math.sin(T*8)*3*(f.flow||0);
    c.fillStyle=C(f.body);c.beginPath();c.moveTo(sh[0]-12,sh[1]-2);c.lineTo(sh[0]+12,sh[1]-2);c.lineTo(hip[0]+16+fl,hip[1]+22);c.quadraticCurveTo(hip[0],hip[1]+30+fl,hip[0]-17-fl,hip[1]+22);c.closePath();c.fill();
    if(extra>0){c.lineWidth=extra;c.stroke()}
    // front arm
    c.lineWidth=8+extra;c.strokeStyle=C(f.body);const el=[(sh[0]+hand[0])/2,(sh[1]+hand[1])/2+5];c.beginPath();c.moveTo(sh[0],sh[1]);c.quadraticCurveTo(el[0],el[1],hand[0],hand[1]);c.stroke();
    // head
    if(f.hat){c.fillStyle=C(f.hat);c.beginPath();c.moveTo(head[0]-24,head[1]-2);c.quadraticCurveTo(head[0],head[1]-16,head[0],head[1]-26);c.quadraticCurveTo(head[0],head[1]-16,head[0]+24,head[1]-2);c.quadraticCurveTo(head[0],head[1]+4,head[0]-24,head[1]-2);c.fill();if(extra>0){c.lineWidth=extra;c.stroke()}
       c.fillStyle=C(f.body);c.beginPath();c.arc(head[0],head[1]+4,8,0,TAU);c.fill()}
    else{c.fillStyle=C(f.skin||'#d8d2c6');c.beginPath();c.arc(head[0],head[1],9.5,0,TAU);c.fill()}
  }
  // cape / scarf behind
  if(f.scarf&&!f.noScarf){c.strokeStyle=f.scarf;c.lineWidth=f.scarfW||6;c.beginPath();let px=sh[0]-6,py=sh[1]-4;c.moveTo(px,py);const sp=(f.speed||0)/340;for(let i=1;i<=7;i++){px-=7+sp*7;py+=Math.sin(T*10-i*.8)*3*(.4+sp)+(f.air?-1.8:1.2);c.lineTo(px,py)}c.stroke()}
  if(f.mantle){c.fillStyle=f.mantle;for(let i=0;i<7;i++){const a=-2.9+i*.32,r=f.mantleR||26;c.beginPath();c.moveTo(sh[0]+Math.cos(a+.3)*10,sh[1]+Math.sin(a+.3)*8);c.lineTo(sh[0]+Math.cos(a)*(r+ (i%2)*10),sh[1]-6+Math.sin(a)*(r+(i%2)*10)+Math.sin(T*6+i)*2);c.lineTo(sh[0]+Math.cos(a-.3)*10,sh[1]+Math.sin(a-.3)*8);c.fill()}}
  // weapon (behind rim? draw after body so it shows)
  pass(3.5,true);pass(0,false);
  // detail: hair / bun / mask band
  if(f.hair){c.strokeStyle=f.hair;c.lineWidth=5;c.beginPath();c.moveTo(head[0]-2,head[1]-6);let hx=head[0]-4,hy=head[1]-4;const sp=(f.speed||0)/340;for(let i=1;i<=6;i++){hx-=5+sp*6;hy+=Math.sin(T*9-i)*2.4+i*.6;c.lineTo(hx,hy)}c.stroke();c.fillStyle=f.hair;c.beginPath();c.arc(head[0]-1,head[1]-10,5,0,TAU);c.fill()}
  if(f.eye){c.fillStyle=f.eye;c.beginPath();c.arc(head[0]+5,head[1]+(f.hat?3:-1),2,0,TAU);c.fill();if(f.glow){c.shadowColor=f.eye;c.shadowBlur=10;c.fill();c.shadowBlur=0}}
  if(f.sash){c.strokeStyle=f.sash;c.lineWidth=5;c.beginPath();c.moveTo(hip[0]-14,hip[1]+2);c.lineTo(hip[0]+14,hip[1]-1);c.stroke()}
  if(f.shield){const sx=hand[0]+14,sy=hand[1]-18;c.fillStyle='#0d0d0f';c.strokeStyle='#d9d5cc';c.lineWidth=2.5;c.beginPath();c.ellipse(sx,sy,16,40,0,0,TAU);c.fill();c.stroke();c.fillStyle=f.glow?'#ff3030':'#9d1217';c.beginPath();c.arc(sx,sy,8,0,TAU);c.fill();c.strokeStyle='#d9d5cc';c.lineWidth=1.5;c.beginPath();c.moveTo(sx,sy-34);c.lineTo(sx,sy+34);c.stroke()}
  // blade
  if(f.weapon){const th=f.theta==null?-.3:f.theta,L=f.wlen||70;const bx=hand[0]+Math.cos(th)*L,by=hand[1]+Math.sin(th)*L;
    if(f.weapon==='spear'){c.strokeStyle='#2a2522';c.lineWidth=4;c.beginPath();c.moveTo(hand[0]-Math.cos(th)*60,hand[1]-Math.sin(th)*60);c.lineTo(bx,by);c.stroke();
      c.fillStyle='#e6e2da';c.beginPath();c.moveTo(bx,by);c.lineTo(bx-Math.cos(th)*26-Math.sin(th)*6,by-Math.sin(th)*26+Math.cos(th)*6);c.lineTo(bx-Math.cos(th)*26+Math.sin(th)*6,by-Math.sin(th)*26-Math.cos(th)*6);c.closePath();c.fill();
      c.fillStyle=f.glow?'#d11a22':'#9d1217';c.beginPath();c.arc(bx-Math.cos(th)*30,by-Math.sin(th)*30,4,0,TAU);c.fill()}
    else{const col=f.blade||'#e8e4da';
      if(f.glow){c.shadowColor='#ff2020';c.shadowBlur=16}
      c.strokeStyle='#050505';c.lineWidth=6;c.beginPath();c.moveTo(hand[0]-Math.cos(th)*10,hand[1]-Math.sin(th)*10);c.lineTo(bx,by);c.stroke();
      c.strokeStyle=f.glow?'#ff8f8f':col;c.lineWidth=3;c.beginPath();c.moveTo(hand[0]+Math.cos(th)*8,hand[1]+Math.sin(th)*8);c.lineTo(bx,by);c.stroke();c.shadowBlur=0;
      c.strokeStyle=f.hilt||'#7a0f14';c.lineWidth=5;c.beginPath();c.moveTo(hand[0]-Math.cos(th)*8,hand[1]-Math.sin(th)*8);c.lineTo(hand[0]+Math.cos(th)*8,hand[1]+Math.sin(th)*8);c.stroke()}}
  c.restore()}
