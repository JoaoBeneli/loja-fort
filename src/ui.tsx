import {ReactNode,useState} from 'react';
const rc:Record<string,string>={common:'#b1b1b1',uncommon:'#5bd13a',rare:'#2fb6ff',epic:'#c35cff',legendary:'#ff9d2e',mythic:'#ffd84a'};
export function Card({img,name,rk,rarity,type,price,badge,children,onClick,showPrice=true,isPack=false}:{img:string;name:string;rk:string;rarity?:string;type?:string;price?:number;badge?:string;children?:ReactNode;onClick?:()=>void;showPrice?:boolean;isPack?:boolean}){
  const col=rc[rk]??'#7a86c9';
  return <button type="button" onClick={onClick} className="group relative block w-full overflow-hidden rounded-[24px] border text-left transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)]" style={{borderColor:col, background:'var(--card-bg)', boxShadow:`inset 0 1px 0 rgba(255,255,255,0.12), 0 18px 40px rgba(15,23,42,0.18), 0 0 18px ${col}18`}}>
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.02)_22%,rgba(15,23,42,0.12))]"/>
    <div className="relative aspect-[4/4.8] overflow-hidden" style={{background:`radial-gradient(circle at 50% 22%,${col}42 0%, rgba(15,23,42,0.18) 35%, rgba(15,23,42,0.9) 100%)`}}>
      {isPack ? <div className="flex h-full w-full items-center justify-center p-4"><div className="rounded-2xl border border-white/20 bg-black/30 px-4 py-3 text-center backdrop-blur-sm"><div className="title text-xl tracking-[0.18em] text-yellow-300">PACOTE</div></div></div> : img && <img src={img} alt={name} loading="lazy" className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-110"/>}
      {badge&&<span className="absolute top-2 left-2 rounded-full border border-black/20 bg-yellow-300 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-black">{badge}</span>}
      {showPrice && price!=null && <span className="absolute bottom-2 right-2 rounded-full border border-yellow-300/30 bg-[linear-gradient(135deg,#272f4d,#0f172a)] px-2.5 py-1 text-xs font-bold text-yellow-200 shadow-[0_0_18px_rgba(250,204,21,0.25)]">💠 {price.toLocaleString('pt-BR')}</span>}
    </div>
    <div className="relative p-3 text-sm">
      <div className="title truncate text-base text-[var(--text)]">{name}</div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{color:col}}>{[rarity,type].filter(Boolean).join(' • ')}</div>
      {children&&<div className="mt-2 space-y-1 text-xs text-[var(--muted)]">{children}</div>}
    </div>
  </button>;
}
export const Skeleton=()=><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">{Array.from({length:12},(_,i)=><div key={i} className="aspect-[4/4.8] rounded-[20px] bg-white/10 animate-pulse shadow-[0_0_18px_rgba(255,255,255,0.04)]"/>)}</div>;
export function Grid<T>({list,render,step=60}:{list:T[];render:(x:T)=>ReactNode;step?:number}){
  const [n,setN]=useState(step);
  return <><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">{list.slice(0,n).map(render)}</div>
    {!list.length&&<p className="text-[var(--muted)]">Nenhum resultado.</p>}
    {n<list.length&&<button onClick={()=>setN(n+step)} className="mt-4 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--surface-strong)]">Mostrar mais ({list.length-n})</button>}</>;
}
export const sel='rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2 text-sm font-medium text-[var(--text)] shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition hover:border-[var(--accent)] hover:bg-[var(--surface-strong)]';
