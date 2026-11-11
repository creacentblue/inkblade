/* ============================================================
   墨雨孤刃 · Ink & Rain — an original ink-wash wuxia side-scroller
   Single file, no external assets. All art is procedural canvas.
   ============================================================ */
const W=1280,H=720,TAU=Math.PI*2;
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
document.getElementById('nojs').style.display='none';
let VS=1,VX=0,VY=0;
let TOUCH=!!((window.matchMedia&&matchMedia('(pointer:coarse)').matches)||/[?&]touch=1/.test(location.search));
document.body.classList.toggle('touch',TOUCH);
const TT=(a,b)=>TOUCH?b:a;
function resize(){const d=Math.min(window.devicePixelRatio||1,2);cv.width=Math.floor(innerWidth*d);cv.height=Math.floor(innerHeight*d);cv.style.width=innerWidth+'px';cv.style.height=innerHeight+'px';VS=Math.min(cv.width/W,cv.height/H);VX=(cv.width-W*VS)/2;VY=(cv.height-H*VS)/2;if(TOUCH&&innerHeight>innerWidth)VY=Math.min(VY,40*d)}
addEventListener('resize',resize);resize();
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,rand=(a,b)=>a+Math.random()*(b-a),ease=t=>t*t*(3-2*t);
const sgn=v=>v<0?-1:1;
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const SERIF='"Noto Serif CJK SC","Source Han Serif SC","Songti SC","STSong","SimSun","Noto Serif SC",serif';
const KAI='"STKaiti","KaiTi","Kaiti SC","AR PL UKai CN","Noto Serif CJK SC","Songti SC",serif';

/* ---------------- audio (procedural) ---------------- */
const AU={c:null,m:null,muted:false,rain:null,started:false,nextNote:0,boss:false,
 init(){if(this.c)return;try{const C=window.AudioContext||window.webkitAudioContext;this.c=new C();this.m=this.c.createGain();this.m.gain.value=this.muted?0:.8;this.m.connect(this.c.destination);
   this.verb=this.c.createDelay(1);this.verb.delayTime.value=.27;const fb=this.c.createGain();fb.gain.value=.38;this.verb.connect(fb);fb.connect(this.verb);const vg=this.c.createGain();vg.gain.value=.5;this.verb.connect(vg);vg.connect(this.m);
   // rain bed
   const len=this.c.sampleRate*2,b=this.c.createBuffer(1,len,this.c.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;this.nbuf=b;
   const s=this.c.createBufferSource();s.buffer=b;s.loop=true;const hp=this.c.createBiquadFilter();hp.type='highpass';hp.frequency.value=900;const lp=this.c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=6500;const g=this.c.createGain();g.gain.value=.06;s.connect(hp);hp.connect(lp);lp.connect(g);g.connect(this.m);s.start();this.rainG=g;
   this.started=true}catch(e){this.c=null}},
 setMute(v){this.muted=v;if(this.m)this.m.gain.value=v?0:.8},
 tone(f,dur,vol,type,slide,send){if(!this.c)return;const t=this.c.currentTime,o=this.c.createOscillator(),g=this.c.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,slide),t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(this.m);if(send)g.connect(this.verb);o.start(t);o.stop(t+dur+.02)},
 noise(dur,vol,type,f0,f1,q){if(!this.c)return;const t=this.c.currentTime,s=this.c.createBufferSource();s.buffer=this.nbuf;const f=this.c.createBiquadFilter();f.type=type;f.frequency.setValueAtTime(f0,t);if(f1)f.frequency.exponentialRampToValueAtTime(f1,t+dur);f.Q.value=q||1;const g=this.c.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(this.m);s.start(t,Math.random(),dur+.05)},
 slash(h){this.noise(h?.28:.16,h?.5:.32,'bandpass',h?500:900,h?2400:3600,1.2)},
 clang(p){this.noise(.12,.5,'highpass',2500,0,1);this.tone(p?2200:1500,p?.7:.35,.22,'triangle',0,1);this.tone(p?3300:2300,p?.9:.4,.13,'sine',0,1);if(p)this.tone(880,.5,.1,'sine',0,1)},
 hit(h){this.noise(.18,.55,'lowpass',h?900:600,120,1);this.tone(h?90:130,.2,.5,'sine',40)},
 dodge(){this.noise(.22,.3,'highpass',1200,5000,.8)},
 jump(d){this.tone(d?420:300,.15,.12,'triangle',d?760:520)},
 land(){this.noise(.08,.18,'lowpass',500,200,1)},
 boom(){this.tone(60,.9,.7,'sine',22);this.noise(.7,.5,'lowpass',400,60,1)},
 thunder(){this.noise(1.6,.6,'lowpass',260,50,.7);this.tone(46,1.4,.4,'sine',28)},
 heal(){[523,659,784].forEach((f,i)=>setTimeout(()=>this.tone(f,.5,.14,'triangle',0,1),i*90))},
 pluck(f,v){this.tone(f,1.1,v||.1,'triangle',f*.995,1);this.tone(f*2,.5,(v||.1)*.3,'sine',0,1)},
 gong(){this.tone(110,2.2,.35,'sine',100,1);this.tone(165,1.8,.2,'triangle',0,1);this.noise(.2,.25,'bandpass',1200,800,2)},
 tick(dt){ // ambient guzheng-ish phrases
  if(!this.c||this.muted)return;const t=this.c.currentTime;if(t<this.nextNote)return;
  const sc=this.boss?[146.8,174.6,196,220,261.6,293.7]:[146.8,164.8,196,220,246.9,293.7,329.6,392];
  const f=sc[Math.floor(Math.random()*sc.length)];this.pluck(f,this.boss?.12:.08);
  if(this.boss){this.tone(55,.35,.5,'sine',40);}
  this.nextNote=t+(this.boss?rand(.5,.9):rand(.9,2.4));}
};
/* ---------------- input ---------------- */
const BIND={left:['ArrowLeft','KeyA'],right:['ArrowRight','KeyD'],up:['ArrowUp','KeyW'],down:['ArrowDown','KeyS'],jump:['Space','ArrowUp','KeyW'],atk:['KeyJ'],heavy:['KeyI'],parry:['KeyK'],dodge:['KeyL'],heal:['KeyQ'],ok:['Enter']};
const keys={},press={};
const down=a=>BIND[a].some(k=>keys[k]);
function consume(a,win){const t=press[a];if(t&&performance.now()-t<(win||.14)*1000){press[a]=0;return true}return false}
function anyKeyAction(code){for(const a in BIND)if(BIND[a].includes(code))press[a]=performance.now()}
addEventListener('keydown',e=>{
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(e.code))e.preventDefault();
  if(e.repeat)return;keys[e.code]=true;anyKeyAction(e.code);AU.init();
  if(AU.c&&AU.c.state==='suspended')AU.c.resume();
  if(e.code==='KeyM'){AU.setMute(!AU.muted)}
  if(e.code==='KeyP'||e.code==='Escape')togglePause();
  if(e.code==='KeyF'){if(!document.fullscreenElement)document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen();else document.exitFullscreen()}
});
addEventListener('keyup',e=>{keys[e.code]=false});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;if(G&&G.mode==='play')togglePause(true)});
cv.addEventListener('pointerdown',()=>{cv.focus();AU.init();if(G.mode==='title'||G.mode==='story'){press.ok=performance.now()}});

/* ---------------- level ---------------- */
const PL=[
 {x:-120,y:560,w:1420,h:900,kind:'roof'},
 {x:520,y:452,w:180,h:14,kind:'awn'},
 {x:1480,y:520,w:700,h:900,kind:'roof'},
 {x:1700,y:412,w:170,h:14,kind:'awn'},
 {x:2400,y:580,w:500,h:900,kind:'roof'},
 {x:2860,y:478,w:92,h:14,kind:'awn'},
 {x:3000,y:380,w:62,h:900,kind:'pillar'},
 {x:3150,y:540,w:1000,h:900,kind:'roof'},
 {x:3590,y:430,w:210,h:14,kind:'awn'},
 {x:3900,y:430,w:150,h:14,kind:'awn'},
 {x:4215,y:530,w:110,h:14,kind:'awn'},
 {x:4400,y:500,w:480,h:900,kind:'roof'},
 {x:4880,y:560,w:1500,h:900,kind:'roof'}
];
const LEVEL_END=6380,ARENA_L=4975,ARENA_R=6345,BOSS_TRIGGER=5170,GATE_X=6270,BOSS_X=5960;
const CPS=[{x:90,y:560},{x:2460,y:580},{x:3220,y:540},{x:4440,y:500},{x:4950,y:560}];
const SPAWNS=[['grunt',880],['grunt',1760],['grunt',2040],['spear',2660],['grunt',3390],['shield',3660],['spear',3960],['grunt',4030],['shield',4640],['grunt',4780]];
const HINTS=[
 {x:60,t:'← → / A D 移动　Space 跳跃（空中再按二段跳，长按滑翔）',t2:'摇杆左右移动　「跳」跳跃（空中再点二段跳，长按滑翔）',id:'h0'},
 {x:420,t:'J 出剑　连按三下成连招　　L 闪避（短暂无敌）',t2:'「攻」出剑　连点三下成连招　　「闪」闪避（短暂无敌）',id:'h1'},
 {x:1320,t:'贴墙时按住方向可滑墙，Space 蹬墙跳　　Space 长按可滑翔过沟',t2:'贴墙时朝墙推摇杆可滑墙，「跳」蹬墙跳　　「跳」长按可滑翔过沟',id:'h2'},
 {x:1700,t:'K 在敌人出招瞬间按下 = 精准格挡 → 慢动作 → 立刻按 J 反击',t2:'「挡」在敌人出招瞬间点按 = 精准格挡 → 慢动作 → 立刻点「攻」反击',id:'h3'},
 {x:2480,t:'红光＝不可格挡的杀招，用 L 闪避或跳起躲开　　Q 饮药',t2:'红光＝不可格挡的杀招，用「闪」闪避或跳起躲开　　「药」饮药',id:'h4'},
 {x:3070,t:'I 重击（按住蓄力）可破盾卫架势　势条满则失衡，近身按 J 处决',t2:'「重」重击（按住蓄力）可破盾卫架势　势条满则失衡，近身点「攻」处决',id:'h5'},
 {x:4420,t:'前方灯笼可点亮存档。观雨楼就在前面——送信，闯过守楼人。',id:'h6'}
];
function platAt(x,y,tol){for(const p of PL){if(p.kind==='awn')continue;if(x>=p.x&&x<=p.x+p.w&&Math.abs(p.y-y)<(tol||8))return p}return null}
