"use client";
import type {Locale} from "@/domain/schemas";
import {usePagedRecords} from "./use-paged-records";
import {CollectionPager} from "./collection-pager";
export function EvidenceHistory({entries,locale,label}:{entries:{id:string;text:string}[];locale:Locale;label:string}) {
 const pager=usePagedRecords(entries,"",()=>undefined,label,20);
 return <><ol className="clean-list">{pager.rows.map(row=><li key={row.id}>{row.text}</li>)}</ol><CollectionPager {...pager} locale={locale} label={label}/></>;
}
