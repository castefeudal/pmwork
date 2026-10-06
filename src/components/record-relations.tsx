"use client";
import {useState} from "react";
import {recordRelations,relationPath} from "@/domain/record-relations";
import type {Locale,Workspace} from "@/domain/schemas";
import {CollectionPager} from "./collection-pager";
export function RecordRelations({workspace,locale,kind,id}:{workspace:Workspace;locale:Locale;kind:string;id:string}) {
  const [page,setPage]=useState(0),rows=recordRelations(workspace,kind,id),ru=locale==="ru",base=process.env.NEXT_PUBLIC_PMWORK_BASE_PATH??"";
  if(!rows.length)return null;
  const current=Math.min(page,Math.max(0,Math.ceil(rows.length/10)-1));
  return <details><summary>{ru?"Связи и обратные ссылки":"Relationships and backlinks"} ({rows.length})</summary><ul className="clean-list">{rows.slice(current*10,current*10+10).map(row=><li key={`${row.kind}-${row.id}`}><a href={`${base}${relationPath(row,locale)}`}>{row.title}</a> · {row.id} · {row.direction==="incoming"?(ru?"Ссылается на эту запись":"References this record"):(ru?"Связанная исходная запись":"Linked source record")}</li>)}</ul><CollectionPager page={current} total={rows.length} size={10} locale={locale} label={ru?"Страницы связей":"Relationship pages"} onPage={setPage}/></details>;
}
