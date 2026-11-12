// Procedural alpha cloud layers (fBm + domain warp + top-lit shading). Output: transparent WebP.
import sharp from 'sharp';
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function makeNoise(seed){const r=mulberry(seed);const p=new Uint8Array(512);const perm=[...Array(256).keys()];for(let i=255;i>0;i--){const j=Math.floor(r()*(i+1));[perm[i],perm[j]]=[perm[j],perm[i]]}for(let i=0;i<512;i++)p[i]=perm[i&255];
 const g=(h,x,y)=>{const a=(h&7)*Math.PI/4;return Math.cos(a)*x+Math.sin(a)*y};const f=t=>t*t*t*(t*(t*6-15)+10);
 return(x,y)=>{const X=Math.floor(x)&255,Y=Math.floor(y)&255;x-=Math.floor(x);y-=Math.floor(y);const u=f(x),v=f(y);const A=p[X]+Y,B=p[X+1]+Y;
 const l=(a,b,t)=>a+t*(b-a);return l(l(g(p[A],x,y),g(p[B],x-1,y),u),l(g(p[A+1],x,y-1),g(p[B+1],x-1,y-1),u),v)}}
const fbm=(n,x,y,o)=>{let s=0,a=.5,fq=1;for(let i=0;i<o;i++){s+=a*n(x*fq,y*fq);fq*=2.03;a*=.5}return s};
const sm=(e0,e1,x)=>{const t=Math.min(1,Math.max(0,(x-e0)/(e1-e0)));return t*t*(3-2*t)};
async function layer({name,W,H,seed,edge,count,rmin,rmax}){
  const n=makeNoise(seed),n2=makeNoise(seed+7);const r=mulberry(seed*3+1);const buf=Buffer.alloc(W*H*4);
  // cumulus: a row of overlapping soft spheres sitting on a solid cloud deck
  const puffs=[];
  for(let i=0;i<count;i++){const x=r()*W*1.1-W*0.05;const big=r();const rad=(rmin+(rmax-rmin)*big*big)*H;
    const cy=edge*H+ (1-big)*0.12*H + (r()-0.5)*0.08*H; puffs.push({x,y:cy,r:rad});}
  // second tier of smaller puffs on top of the large ones
  for(let i=0;i<count*0.8;i++){const b=puffs[Math.floor(r()*puffs.length)];const ang=-Math.PI*(0.15+r()*0.7);
    const rad=b.r*(0.35+r()*0.35);puffs.push({x:b.x+Math.cos(ang)*b.r*0.7,y:b.y+Math.sin(ang)*b.r*0.6,r:rad});}
  const deckTop=edge*H+0.0*H;
  const field=new Float32Array(W*H);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const nx=x/W*7,ny=y/W*7;
    const warp=fbm(n2,nx*0.8,ny*0.8,4);
    let sum=0;
    for(const p of puffs){const dx=(x-p.x)/p.r,dy=(y-p.y)/p.r;const q=dx*dx+dy*dy;if(q>=3)continue;
      const dist=Math.sqrt(q)-warp*0.55; sum+=Math.max(0,1-dist)*1.0;}
    const deck=sm(deckTop-0.06*H,deckTop+0.16*H,y+warp*0.12*H);
    const ero=fbm(n,nx*1.6+warp,ny*1.6,6);
    let d=1-Math.exp(-sum*2.2); d=Math.max(d,deck);
    d=d+ero*0.55*(1-d*0.6);
    field[y*W+x]=d;}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const d=field[y*W+x];const up=y>18?field[(y-18)*W+x]:0;
    const a=sm(0.22,0.85,d);
    const grad=Math.max(-1,Math.min(1,(d-up)*2.2)); // >0 at top edges (lit), <0 underside
    const core=sm(0.7,1.25,d);
    const base=242 + grad*12 - core*6 - Math.max(0,y/H-0.6)*8;
    const i=(y*W+x)*4;
    buf[i]=Math.round(Math.min(255,base-1));buf[i+1]=Math.round(Math.min(255,base));buf[i+2]=Math.round(Math.min(255,base+5));buf[i+3]=Math.round(a*255);}
  await sharp(buf,{raw:{width:W,height:H,channels:4}}).blur(2.2).webp({quality:80,alphaQuality:85,effort:5}).toFile(`public/images/clouds/${name}.webp`);
  console.log(name);
}
await layer({name:'cloud-back',W:1600,H:700,seed:11,edge:0.42,count:34,rmin:0.09,rmax:0.24});
await layer({name:'cloud-mid',W:1600,H:760,seed:23,edge:0.40,count:28,rmin:0.1,rmax:0.30});
await layer({name:'cloud-front',W:1600,H:820,seed:37,edge:0.40,count:24,rmin:0.11,rmax:0.34});
