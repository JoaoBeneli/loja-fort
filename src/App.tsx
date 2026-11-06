import {useEffect,useState } from 'react';
import {useNow,useShop} from './hooks';
import {Card,Grid,Skeleton,sel} from './ui';
import {brDay,brt} from './history';
const tabs=['Loja de hoje','Novidades','Saídas da loja'];
const fmtCd=(ms:number)=>{if(ms<=0)return'Atualizando…';const s=Math.floor(ms/1e3);return [Math.floor(s/3600),Math.floor(s%3600/60),s%60].map(x=>String(x).padStart(2,'0')).join(':')};

type Theme = 'light' | 'dark';

export default function App(){
  const [theme,setTheme]=useState<Theme>(()=>{
    try { return localStorage.getItem('ftn:theme') === 'dark' ? 'dark' : 'light'; }
    catch { return 'light'; }
  });
  const [tab,setTab]=useState(0);const [min,setMin]=useState(+(localStorage.getItem('ftn:int')||15));
  const [expandedId,setExpandedId]=useState<string|null>(null);
  const [selectedSection,setSelectedSection]=useState<string>('');
  const d=useShop(min);const now=useNow();
  const sectionGroups = (()=>{const g:Record<string,typeof d.items>={}; d.items.filter(i=>!i.isBundle).forEach(i=>(g[i.section]??=[]).push(i)); return Object.entries(g).sort(([a],[b])=>a.localeCompare(b));})();
  useEffect(()=>{
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('ftn:theme', theme);
  },[theme]);
  useEffect(()=>{
    if(!sectionGroups.length) { setSelectedSection(''); return; }
    setSelectedSection(current => current && sectionGroups.some(([section]) => section === current) ? current : sectionGroups[0][0]);
  },[sectionGroups]);
  const outAll=d.items.map(i=>i.outDate).filter(Boolean).sort()[0];
  const body=()=>{
    if(!d.shop&&!d.err) return <Skeleton/>;
    if(tab===0){
      const packs=d.items.filter(i=>i.isBundle);
      const renderShop=(list:typeof d.items, title:string)=><section className="mb-8"><h2 className="title text-xl mb-3 text-[#b7791f]">{title}</h2>
        <Grid list={list} render={i=><Card key={i.id+i.price} img={i.img} name={i.name} rk={i.rarityKey} rarity={i.rarity} type={i.type} price={!i.isBundle || expandedId===i.id ? i.price : undefined} badge={i.isBundle?'PACOTE':i.st?.s==='new'?'NOVO':i.st?.s==='returning'?'RETORNO':undefined} showPrice={!i.isBundle || expandedId===i.id} onClick={()=>setExpandedId(expandedId===i.id?null:i.id)} isPack={!!i.isBundle}>
          {i.isBundle&&<div>Pacote • {i.bundleCount ?? 1} itens</div>}
          {i.bundle&&<div>{i.bundle}</div>}
          {expandedId===i.id && i.isBundle && <div className="rounded-md border border-violet-400/50 bg-violet-500/10 px-2 py-1 text-[11px] text-violet-200">Preço do pacote aparece ao abrir o item.</div>}
          <div>Entrou: {brt(i.inDate)}</div><div>Sai: {brt(i.outDate)}</div></Card>}/></section>;
      const visibleSection = sectionGroups.find(([section]) => section === selectedSection)?.[1] ?? [];
      return <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-5">
        <aside className="mb-5 lg:mb-0">
          <div className="lg:sticky lg:top-24 rounded-[26px] border border-[var(--line)] bg-[var(--surface-soft)] p-3 shadow-[var(--shadow)]">
            <p className="title mb-3 text-[10px] tracking-[0.18em] text-[var(--muted)]">Seções</p>
            <div className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible">
              {packs.length>0 && <button type="button" onClick={()=>setSelectedSection('__packs__')} className={`shrink-0 rounded-2xl border px-3 py-2 text-left text-sm transition lg:flex lg:w-full lg:items-center lg:justify-between ${selectedSection === '__packs__' ? 'border-[#f59e0b]/60 bg-[#fff4d6] text-[#8a4b00]' : 'border-[var(--line)] bg-[var(--cell-bg)] text-[var(--text)] hover:border-[var(--accent)]'}`}><span className="font-semibold">Pacotes</span><span className="ml-2 rounded-full border border-current/30 bg-black/5 px-2 py-0.5 text-[10px] lg:ml-0">{packs.length}</span></button>}
              {sectionGroups.map(([section, items]) => (
                <button key={section} type="button" onClick={()=>setSelectedSection(section)} className={`shrink-0 rounded-2xl border px-3 py-2 text-left text-sm transition lg:flex lg:w-full lg:items-center lg:justify-between ${selectedSection === section ? 'border-sky-400/60 bg-sky-100 text-sky-800 shadow-[0_0_18px_rgba(14,165,233,0.12)]' : 'border-[var(--line)] bg-[var(--cell-bg)] text-[var(--text)] hover:border-[var(--accent)]'}`}>
                  <span className="font-semibold">{section}</span>
                  <span className="ml-2 rounded-full border border-current/30 bg-black/5 px-2 py-0.5 text-[10px] lg:ml-0">{items.length}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
        <div>
          {packs.length>0 && selectedSection === '__packs__' && renderShop(packs,'Pacotes')}
          {selectedSection && selectedSection !== '__packs__' && visibleSection.length>0 && <section className="mb-8"><h2 className="title text-xl mb-3 text-[#8a4b00]">{selectedSection}</h2><Grid list={visibleSection} render={i=><Card key={i.id+i.price} img={i.img} name={i.name} rk={i.rarityKey} rarity={i.rarity} type={i.type} price={i.price} badge={i.st?.s==='new'?'NOVO':i.st?.s==='returning'?'RETORNO':undefined} showPrice={true} onClick={()=>setExpandedId(expandedId===i.id?null:i.id)}>
            <div>Entrou: {brt(i.inDate)}</div><div>Sai: {brt(i.outDate)}</div></Card>}/></section>}
          {!packs.length && !selectedSection && <p className="text-[var(--muted)]">Nenhuma seção disponível.</p>}
        </div>
      </div>;
    }
    if(tab===1){
      if(!d.ready) return <Skeleton/>;
      const todayIn=d.items.filter(i=>i.inDate && i.inDate.slice(0,10)===d.day);
      return <section className="mb-8"><h2 className="title text-xl mb-3 text-[#b7791f]">Entraram hoje ({todayIn.length})</h2>
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
  return <div className="fortnite-grid min-h-screen bg-transparent"><header className="sticky top-0 z-10 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 py-3 backdrop-blur-xl">
    <div className="flex items-center gap-3 flex-wrap"><div className="rounded-full border border-[#f59e0b]/60 bg-[#fff2cf] px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-[#8a4b00]">Shop</div><h1 className="title fortnite-glow text-xl text-sky-700 sm:text-2xl">Loja Fort</h1>
      <span className="ml-auto text-xs text-[var(--muted)]">Atualizado: {brt(d.updated?.toISOString())}</span>
      <select className={sel} value={min} onChange={e=>{setMin(+e.target.value);localStorage.setItem('ftn:int',e.target.value)}}>{[5,15,30,60].map(m=><option key={m} value={m}>Auto: {m} min</option>)}</select>
      <button aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'} className={`${sel} flex h-10 w-10 items-center justify-center rounded-full p-0 ${theme === 'dark' ? 'border-slate-200 bg-white text-slate-900 shadow-[0_0_18px_rgba(255,255,255,0.12)]' : 'border-slate-700 bg-slate-900 text-slate-100 shadow-[0_0_18px_rgba(15,23,42,0.22)]'}`} onClick={()=>setTheme(t=>t==='dark'?'light':'dark')}>
        <span className="text-lg leading-none">{theme === 'dark' ? '☀' : '☾'}</span>
      </button>
      <button className={sel} onClick={d.reload}>↻</button></div>
    <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">{tabs.map((t,i)=><button key={t} onClick={()=>setTab(i)} className={`title whitespace-nowrap rounded-xl border px-3 py-1.5 text-[10px] sm:text-xs ${tab===i?'border-sky-400/60 bg-sky-100 text-sky-800 shadow-[0_0_18px_rgba(14,165,233,0.12)]':'border-[var(--line)] bg-[var(--tab-bg)] text-[var(--muted)] hover:bg-[var(--tab-hover)]'}`}>{t}</button>)}</nav></header>
    <main className="p-4"><div className="fortnite-panel mb-5 overflow-hidden rounded-[32px] border border-violet-200 bg-[var(--hero-bg)] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="title text-[9px] text-violet-700">Item Shop</p>
          <h2 className="title fortnite-glow mt-1 text-2xl text-[var(--text)]">Loja do dia</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <span className="fortnite-chip rounded-full border border-[var(--line)] bg-[var(--pill-bg)] px-2 py-1">{d.items.length} itens</span>
          <span className="fortnite-chip rounded-full border border-[#f5d28a] bg-[#fff4d6] px-2 py-1 text-[#8a4b00]">{brDay(d.day)}</span>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {featured.map(i=><div key={i.id} className="rounded-[22px] border border-[var(--line)] bg-[var(--cell-bg)] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--cell-image-bg)] p-1 shadow-[0_0_16px_rgba(14,165,233,0.08)]"><img src={i.img} alt={i.name} className="h-full w-full object-contain"/></div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[var(--text)]">{i.name}</p>
              <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">{i.rarity || i.type || 'Item'}</p>
            </div>
          </div>
        </div>)}
      </div>
    </div>
    {d.err&&<div className="mb-4 rounded-xl border border-red-500/50 bg-red-900/40 p-3 text-sm text-red-100">⚠️ {d.err}. {d.shop?'Exibindo últimos dados em cache.':'Tente novamente em instantes.'}</div>}
      {d.shop&&<p className="mb-3 text-xs text-slate-400">Rotação de {brDay(d.day)} • próxima atualização em {outAll?fmtCd(Date.parse(outAll)-now):'—'}</p>}{body()}</main></div>;
}
