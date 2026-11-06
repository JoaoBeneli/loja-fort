/** Camada de API (Fortnite-API v2). Endpoints usados: GET /v2/shop e GET /v2/cosmetics/br. */
const BASE='https://fortnite-api.com/v2';
const mem=new Map<string,{t:number;d:any}>();

async function get(path:string,ttl:number):Promise<any>{
  const hit=mem.get(path); if(hit&&Date.now()-hit.t<ttl) return hit.d;
  const ck='ftn:cache:'+path;
  try{const c=JSON.parse(localStorage.getItem(ck)||'null'); if(c&&Date.now()-c.t<ttl){mem.set(path,c);return c.d}}catch{}
  const r=await fetch(BASE+path);
  if(!r.ok) throw new Error(r.status===429?'Limite de requisições da API atingido':`API indisponível (HTTP ${r.status})`);
  const d=(await r.json()).data, e={t:Date.now(),d}; mem.set(path,e);
  try{localStorage.setItem(ck,JSON.stringify(e))}catch{} // pode estourar a cota: cache em memória segue valendo
  return d;
}

export interface Cosmetic{id:string;name:string;type:string;rarity:string;rarityKey:string;set:string;img:string;hist:string[]}
export interface ShopItem extends Omit<Cosmetic,'hist'>{
  price:number;
  section:string;
  inDate?:string;
  outDate?:string;
  bundle?:string;
  bundleCount?:number;
  bundleIds?:string[];
  isBundle?:boolean;
}

export async function getShop(ttl:number){
  const d=await get('/shop?language=pt-BR',ttl);
  const grouped=new Map<string,ShopItem>();

  for(const e of d.entries??[]){
    for(const b of e.brItems??[]){
      const bundleName=(typeof b.bundle?.name==='string' ? b.bundle.name.trim() : '').trim();
      const bundleImage=(b.bundle?.image ?? b.bundle?.images?.icon ?? b.images?.icon ?? b.images?.smallIcon ?? '').trim();
      const key=bundleName ? `${e.layout?.name ?? 'shop'}::${bundleName}` : b.id;
      const itemPrice = Number(b.price ?? b.finalPrice ?? e.finalPrice ?? 0);

      const item:ShopItem={
        id:key,
        name:bundleName||b.name,
        type:b.type?.displayValue??'',
        rarity:b.rarity?.displayValue??'',
        rarityKey:b.rarity?.value??'common',
        set:b.set?.text??'',
        img:bundleImage || b.images?.icon || b.images?.smallIcon || '',
        price:Number.isFinite(itemPrice) && itemPrice > 0 ? itemPrice : Number(e.finalPrice ?? 0),
        section:e.layout?.name??'Outros',
        inDate:e.inDate,
        outDate:e.outDate,
        bundle:bundleName||undefined,
        bundleCount:1,
        bundleIds:[b.id],
        isBundle:Boolean(bundleName),
      };

      const current=grouped.get(key);
      if(current){
        current.bundleCount=(current.bundleCount??1)+1;
        current.bundleIds=[...new Set([...(current.bundleIds??[]), ...item.bundleIds ?? []])];
        if(!current.img && item.img) current.img=item.img;
        if(!current.price && item.price) current.price=item.price;
        if(!current.name) current.name=item.name;
      }else{
        grouped.set(key,item);
      }
    }
  }

  return {day:String(d.date).slice(0,10),hash:d.hash as string,items:[...grouped.values()]};
}
/** Catálogo completo; `shopHistory` (datas em que o item esteve na loja) é usado para semear o histórico, se existir. */
export async function getCosmetics():Promise<Cosmetic[]>{
  const d=await get('/cosmetics/br?language=pt-BR',24*36e5);
  return d.map((b:any)=>({id:b.id,name:b.name,type:b.type?.displayValue??'',rarity:b.rarity?.displayValue??'',rarityKey:b.rarity?.value??'common',
    set:b.set?.text??'',img:b.images?.smallIcon??'',hist:(b.shopHistory??[]).map((x:string)=>x.slice(0,10))}));
}
