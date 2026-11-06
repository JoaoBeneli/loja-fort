import {useCallback,useEffect,useMemo,useState} from 'react';
import {Cosmetic,getCosmetics,getShop} from './api';
import {loadLocal,record,stats,status} from './history';
export function useNow(){const [n,s]=useState(Date.now());useEffect(()=>{const t=setInterval(()=>s(Date.now()),1000);return()=>clearInterval(t)},[]);return n}
export function useShop(min:number){
  const [shop,setShop]=useState<Awaited<ReturnType<typeof getShop>>>();const [cos,setCos]=useState<Cosmetic[]>([]);
  const [ready,setReady]=useState(false);const [err,setErr]=useState('');const [updated,setUpdated]=useState<Date>();const [local,setLocal]=useState(loadLocal);
  const load=useCallback(async()=>{try{const s=await getShop(min*6e4*0.9);setShop(s);setErr('');setUpdated(new Date());record(s.day,s.items.map(i=>i.id));setLocal(loadLocal())}
    catch(e:any){setErr(e.message||'Falha de conexão')}},[min]);
  useEffect(()=>{load();const t=setInterval(load,min*6e4);return()=>clearInterval(t)},[load,min]);
  useEffect(()=>{getCosmetics().then(c=>{setCos(c);setReady(true)}).catch(e=>setErr(e.message))},[]);
  const day=shop?.day??new Date().toISOString().slice(0,10);
  const hist=useMemo(()=>{const h:Record<string,string[]>={};for(const c of cos)h[c.id]=[...c.hist];
    for(const[id,a]of Object.entries(local))h[id]=[...new Set([...(h[id]??[]),...a])];return h},[cos,local]);
  const rows=useMemo(()=>cos.map(c=>({c,s:stats(hist[c.id]??[],day)})),[cos,hist,day]);
  const items=useMemo(()=>(shop?.items??[]).map(i=>{
    const ids=i.bundleIds?.length ? i.bundleIds : [i.id];
    const dates=ids.flatMap(id => hist[id] ?? []);
    return {...i,st:ready?status(dates,day):undefined,s:stats(dates,day)};
  }),[shop,hist,ready,day]);
  return {shop,items,rows,ready,err,updated,day,reload:load};
}
