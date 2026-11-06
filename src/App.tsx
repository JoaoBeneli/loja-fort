import {useState } from 'react';
import {useNow,useShop} from './hooks';
import {Card,Grid,Skeleton,sel} from './ui';
import {brDay,brt} from './history';
const tabs=['Loja de hoje','Novidades','Saídas da loja'];
const fmtCd=(ms:number)=>{if(ms<=0)return'Atualizando…';const s=Math.floor(ms/1e3);return [Math.floor(s/3600),Math.floor(s%3600/60),s%60].map(x=>String(x).padStart(2,'0')).join(':')};

export default function App(){
  const [tab,setTab]=useState(0);const [min,setMin]=useState(+(localStorage.getItem('ftn:int')||15));
  const [expandedId,setExpandedId]=useState<string|null>(null);
  const d=useShop(min);const now=useNow();
  const outAll=d.items.map(i=>i.outDate).filter(Boolean).sort()[0];
  const body=()=>{
    if(!d.shop&&!d.err) return <Skeleton/>;
    if(tab===0){
      const packs=d.items.filter(i=>i.isBundle);
      const regular=d.items.filter(i=>!i.isBundle);
      const renderShop=(list:typeof d.items, title:string)=><section className="mb-8"><h2 className="title text-xl mb-3 text-yellow-300">{title}</h2>
        <Grid list={list} render={i=><Card key={i.id+i.price} img={i.img} name={i.name} rk={i.rarityKey} rarity={i.rarity} type={i.type} price={!i.isBundle || expandedId===i.id ? i.price : undefined} badge={i.isBundle?'PACOTE':i.st?.s==='new'?'NOVO':i.st?.s==='returning'?'RETORNO':undefined} showPrice={!i.isBundle || expandedId===i.id} onClick={()=>setExpandedId(expandedId===i.id?null:i.id)} isPack={!!i.isBundle}>
          {i.isBundle&&<div>Pacote • {i.bundleCount ?? 1} itens</div>}
          {i.bundle&&<div>{i.bundle}</div>}
          {expandedId===i.id && i.isBundle && <div className="rounded-md border border-violet-400/50 bg-violet-500/10 px-2 py-1 text-[11px] text-violet-200">Preço do pacote aparece ao abrir o item.</div>}
          <div>Entrou: {brt(i.inDate)}</div><div>Sai: {brt(i.outDate)}</div></Card>}/></section>;
      return <>
        {packs.length>0 && renderShop(packs,'Pacotes')}
        {regular.length>0 && (()=>{const g:Record<string,typeof d.items>={};regular.forEach(i=>(g[i.section]??=[]).push(i)); return Object.entries(g).map(([s,l])=><section key={s} className="mb-8"><h2 className="title text-xl mb-3 text-yellow-300">{s}</h2><Grid list={l} render={i=><Card key={i.id+i.price} img={i.img} name={i.name} rk={i.rarityKey} rarity={i.rarity} type={i.type} price={i.price} badge={i.st?.s==='new'?'NOVO':i.st?.s==='returning'?'RETORNO':undefined} showPrice={true} onClick={()=>setExpandedId(expandedId===i.id?null:i.id)}>
          <div>Entrou: {brt(i.inDate)}</div><div>Sai: {brt(i.outDate)}</div></Card>}/></section>)})()}
      </>;
    }
    if(tab===1){
      if(!d.ready) return <Skeleton/>;
      const todayIn=d.items.filter(i=>i.inDate && i.inDate.slice(0,10)===d.day);
      return <section className="mb-8"><h2 className="title text-xl mb-3 text-yellow-300">Entraram hoje ({todayIn.length})</h2>
        {!todayIn.length?<p className="text-slate-400">Nenhum item entrou hoje.</p>:<Grid list={todayIn} render={i=><Card key={i.id+i.price} img={i.img} name={i.name} rk={i.rarityKey} rarity={i.rarity} type={i.type} price={!i.isBundle || expandedId===i.id ? i.price : undefined} badge={i.isBundle?'PACOTE':'NOVO'} showPrice={!i.isBundle || expandedId===i.id} onClick={()=>setExpandedId(expandedId===i.id?null:i.id)} isPack={!!i.isBundle}>
          {i.isBundle&&<div>Pacote • {i.bundleCount ?? 1} itens</div>}
          {i.bundle&&<div>{i.bundle}</div>}
          {expandedId===i.id && i.isBundle && <div className="rounded-md border border-violet-400/50 bg-violet-500/10 px-2 py-1 text-[11px] text-violet-200">Preços do pacote aparecem ao abrir o item.</div>}
          <div>Entrou: {brt(i.inDate)}</div><div>Sai: {brt(i.outDate)}</div></Card>}/>}</section>;
    }
    const leaving=d.items.filter(i=>i.outDate && i.outDate.slice(0,10)===d.day);
    return <><p className="mb-4 text-sm text-slate-300">Itens que saem hoje. {leaving.length ? `Próxima saída em ${brt(leaving[0].outDate)}` : 'Nenhuma saída prevista para hoje.'}</p>
      {!leaving.length?<p className="text-slate-400">Nenhum item está saindo hoje.</p>:<Grid list={leaving} render={i=><Card key={i.id+i.price} img={i.img} name={i.name} rk={i.rarityKey} rarity={i.rarity} type={i.type} price={!i.isBundle || expandedId===i.id ? i.price : undefined} badge={i.isBundle?'PACOTE':'SAINDO'} showPrice={!i.isBundle || expandedId===i.id} onClick={()=>setExpandedId(expandedId===i.id?null:i.id)} isPack={!!i.isBundle}>
        {i.isBundle&&<div>Pacote • {i.bundleCount ?? 1} itens</div>}
        {i.bundle&&<div>{i.bundle}</div>}
        {expandedId===i.id && i.isBundle && <div className="rounded-md border border-violet-400/50 bg-violet-500/10 px-2 py-1 text-[11px] text-violet-200">Preço do pacote detalhado ao abrir.</div>}
        <div>Entrou: {brt(i.inDate)}</div><div>Sai: {brt(i.outDate)}</div></Card>}/>}</>;
  };
  const featured = d.items.slice(0,3);
  return <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.25),transparent_20%),linear-gradient(180deg,#050816_0%,#0b0e2a_100%)]"><header className="sticky top-0 z-10 border-b border-white/10 bg-[#0b0e2a]/85 px-4 py-3 backdrop-blur-xl">
    <div className="flex items-center gap-3 flex-wrap"><h1 className="title text-2xl text-yellow-300">Loja Fort</h1>
      <span className="ml-auto text-xs text-slate-400">Atualizado: {brt(d.updated?.toISOString())}</span>
      <select className={sel} value={min} onChange={e=>{setMin(+e.target.value);localStorage.setItem('ftn:int',e.target.value)}}>{[5,15,30,60].map(m=><option key={m} value={m}>Auto: {m} min</option>)}</select>
      <button className={sel} onClick={d.reload}>↻</button></div>
    <nav className="mt-3 flex gap-1 overflow-x-auto">{tabs.map((t,i)=><button key={t} onClick={()=>setTab(i)} className={`title whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${tab===i?'bg-violet-600 text-white shadow-[0_0_18px_rgba(168,85,247,0.5)]':'bg-white/5 text-slate-300 hover:bg-white/10'}`}>{t}</button>)}</nav></header>
    <main className="p-4"><div className="mb-5 overflow-hidden rounded-3xl border border-violet-400/40 bg-[linear-gradient(135deg,rgba(30,41,59,0.85),rgba(91,33,182,0.5),rgba(15,23,42,0.95))] p-4 shadow-[0_0_45px_rgba(168,85,247,0.22)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="title text-xs text-yellow-300">Item Shop</p>
          <h2 className="title mt-1 text-2xl text-white">Loja do dia</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-200">
          <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">{d.items.length} itens</span>
          <span className="rounded-full border border-yellow-300/30 bg-yellow-400/10 px-2 py-1 text-yellow-200">{brDay(d.day)}</span>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {featured.map(i=><div key={i.id} className="rounded-2xl border border-white/10 bg-black/20 p-2">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-xl border border-white/10 bg-[#0a102f] p-1"><img src={i.img} alt={i.name} className="h-full w-full object-contain"/></div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{i.name}</p>
              <p className="text-[10px] uppercase tracking-[0.12em] text-slate-300">{i.rarity || i.type || 'Item'}</p>
            </div>
          </div>
        </div>)}
      </div>
    </div>
    {d.err&&<div className="mb-4 rounded-xl border border-red-500/50 bg-red-900/40 p-3 text-sm text-red-100">⚠️ {d.err}. {d.shop?'Exibindo últimos dados em cache.':'Tente novamente em instantes.'}</div>}
      {d.shop&&<p className="mb-3 text-xs text-slate-400">Rotação de {brDay(d.day)} • próxima atualização em {outAll?fmtCd(Date.parse(outAll)-now):'—'}</p>}{body()}</main></div>;
}
