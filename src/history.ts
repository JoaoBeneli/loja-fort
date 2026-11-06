/** Histórico: união de `shopHistory` da API + coleta própria (localStorage), sem duplicar dias. */
const KEY='ftn:history';
export const loadLocal=():Record<string,string[]>=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}};
export function record(day:string,ids:string[]){
  const h=loadLocal();let ch=false;
  for(const id of ids){const a=h[id]??(h[id]=[]);if(!a.includes(day)){a.push(day);ch=true}}
  if(ch)try{localStorage.setItem(KEY,JSON.stringify(h))}catch{}
  return h;
}
export const dayDiff=(a:string,b:string)=>Math.round((Date.parse(b)-Date.parse(a))/864e5);
export function stats(dates:string[],today:string){
  const d=[...new Set(dates)].sort(); if(!d.length) return null;
  let max=0; for(let i=1;i<d.length;i++) max=Math.max(max,dayDiff(d[i-1],d[i]));
  return {first:d[0],last:d[d.length-1],count:d.length,maxGap:d.length>1?max:null,since:dayDiff(d[d.length-1],today)};
}
export type Status='new'|'returning'|'staying';
/** new = nunca visto antes de hoje; staying = visto ontem/hoje; returning = voltou após intervalo. */
export function status(dates:string[],today:string):{s:Status;gap:number}{
  const p=dates.filter(x=>x<today).sort(); if(!p.length) return {s:'new',gap:0};
  const gap=dayDiff(p[p.length-1],today); return {s:gap<=1?'staying':'returning',gap};
}
export const human=(d:number)=>{const y=Math.floor(d/365),m=Math.floor(d%365/30);
  const x=[y&&`${y} ${y>1?'anos':'ano'}`,m&&`${m} ${m>1?'meses':'mês'}`].filter(Boolean).join(' e ');return `${d} dias`+(x?` (${x})`:'')};
export const brt=(s?:string)=>s?new Date(s).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',dateStyle:'short',timeStyle:'short'})+' (BRT)':'—';
export const brDay=(s:string)=>new Date(s+'T12:00:00Z').toLocaleDateString('pt-BR',{timeZone:'UTC'});
