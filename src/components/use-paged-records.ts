"use client";
import {useState} from "react";
/** Bound rendered records while retaining the complete source collection and typed deep links. */
export function usePagedRecords<T extends {id:string}>(records:T[],focusId:string,clearFocus:()=>void,collectionKey:string,size=10) {
 const [position,setPosition]=useState({key:collectionKey,page:0});
 const focused=focusId?records.findIndex(row=>row.id===focusId):-1;
 const page=focused>=0?Math.floor(focused/size):Math.min(position.key===collectionKey?position.page:0,Math.max(0,Math.ceil(records.length/size)-1));
 return {rows:records.slice(page*size,page*size+size),page,size,total:records.length,onPage:(next:number)=>{setPosition({key:collectionKey,page:Math.max(0,next)});if(focusId)clearFocus();}};
}
