import {ReactNode,useState} from 'react';
const rc:Record<string,string>={common:'#b1b1b1',uncommon:'#5bd13a',rare:'#2fb6ff',epic:'#c35cff',legendary:'#ff9d2e',mythic:'#ffd84a'};
export function Card({img,name,rk,rarity,type,price,badge,children,onClick,showPrice=true,isPack=false}:{img:string;name:string;rk:string;rarity?:string;type?:string;price?:number;badge?:string;children?:ReactNode;onClick?:()=>void;showPrice?:boolean;isPack?:boolean}){
  const col=rc[rk]??'#7a86c9';
  return <button type="button" onClick={onClick} className="group relative block w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0f153a] text-left shadow-[0_0_28px_rgba(34,211,238,0.08)] transition hover:border-violet-400/70" style={{borderColor:col}}>
    <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-[#050816] opacity-90"/>
    <div className="relative aspect-square" style={{background:`radial-gradient(circle at 50% 30%,${col}66,#0a102f 65%)`}}>
      {isPack ? <div className="flex h-full w-full items-center justify-center p-3"><div className="rounded-2xl border border-white/25 bg-black/40 px-4 py-3 text-center"><div className="title text-xl tracking-[0.18em] text-yellow-300">PACOTE</div></div></div> : img && <img src={img} alt={name} loading="lazy" className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105"/>}
      {badge&&<span className="absolute top-2 left-2 rounded-full border border-black/30 bg-yellow-300 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-black">{badge}</span>}
      {showPrice && price!=null && <span className="absolute bottom-2 right-2 rounded-full bg-black/75 px-2 py-1 text-xs font-bold text-white shadow-lg">💠 {price.toLocaleString('pt-BR')}</span>}
    </div>
    <div className="relative p-3 text-sm">
      <div className="title truncate text-base text-white">{name}</div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{color:col}}>{[rarity,type].filter(Boolean).join(' • ')}</div>
      {children&&<div className="mt-2 space-y-1 text-xs text-slate-300">{children}</div>}
    </div>
  </button>;
}
export const Skeleton=()=><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">{Array.from({length:12},(_,i)=><div key={i} className="aspect-[3/4] rounded-2xl bg-white/10 animate-pulse shadow-[0_0_18px_rgba(255,255,255,0.04)]"/>)}</div>;
export function Grid<T>({list,render,step=60}:{list:T[];render:(x:T)=>ReactNode;step?:number}){
  const [n,setN]=useState(step);
  return <><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">{list.slice(0,n).map(render)}</div>
    {!list.length&&<p className="text-slate-400">Nenhum resultado.</p>}
    {n<list.length&&<button onClick={()=>setN(n+step)} className="mt-4 rounded-full border border-violet-400 bg-violet-600 px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-violet-500">Mostrar mais ({list.length-n})</button>}</>;
}
export const sel='bg-[#141a44] border border-white/20 rounded-xl px-2 py-1.5 text-sm text-white shadow-[0_0_18px_rgba(99,102,241,0.15)] transition hover:border-violet-400';
