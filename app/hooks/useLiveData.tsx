"use client";
import { useEffect, useState } from 'react';
interface LivePayload { matches?: any[]; stats?: any[]; news?: any[]; source?: string; error?: string; }
export default function useLiveData() {
 const [payload,setPayload]=useState<LivePayload|null>(null);
 useEffect(()=>{
  let poller:number|null=null;
  const fetchOnce=async()=>{
   try{
    const res=await fetch('/api/live/schedule',{cache:'no-store',headers:{pragma:'no-cache'}});
    if(!res.ok) return;
    setPayload(await res.json());
   }catch(e){console.error(e);}
  };
  fetchOnce();
  poller=window.setInterval(fetchOnce,5000);
  return ()=>{ if(poller) clearInterval(poller); };
 },[]);
 return payload;
}