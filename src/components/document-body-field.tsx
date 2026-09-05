"use client";
import {useState} from 'react';
import {DocumentPreview} from './document-preview';
export function DocumentBodyField({id,name,value,ru}:{id:string;name:string;value:string;ru:boolean}) {
 const [body,setBody]=useState(value),[preview,setPreview]=useState(false);
 return <div className="document-editor-body"><div className="button-row"><button type="button" className="button small" aria-pressed={!preview} onClick={()=>setPreview(false)}>{ru?'Редактировать':'Edit'}</button><button type="button" className="button small" aria-pressed={preview} onClick={()=>setPreview(true)}>{ru?'Читать документ':'Read document'}</button></div><textarea id={id} name={name} value={body} onChange={e=>setBody(e.target.value)} hidden={preview} rows={16}/>{preview&&<DocumentPreview body={body}/>}</div>;
}
