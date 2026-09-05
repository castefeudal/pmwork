import {Fragment, type ReactNode} from 'react';
/** Render the document subset as React text; user HTML is never executed. */
export function DocumentPreview({body}:{body:string}) {
 const lines=body.replace(/\r/g,'').split('\n'),blocks:ReactNode[]=[];
 const inline=(s:string)=>s.split(/(\*\*[^*]+\*\*)/g).map((part,i)=>part.startsWith('**')?<strong key={i}>{part.slice(2,-2)}</strong>:part);
 for(let i=0;i<lines.length;i++){
  const line=lines[i].trim();if(!line)continue;
  const heading=line.match(/^(#{1,6})\s+(.+)$/);
  if(heading){const Tag=heading[1].length===1?'h2':heading[1].length===2?'h3':'h4';blocks.push(<Tag key={i}>{inline(heading[2])}</Tag>);continue;}
  if(/^[-*]\s|^\d+\.\s/.test(line)){const ordered=/^\d/.test(line),items=[];const key=i;while(i<lines.length&&/^([-*]|\d+\.)\s/.test(lines[i].trim())){items.push(<li key={i}>{inline(lines[i].trim().replace(/^([-*]|\d+\.)\s/,''))}</li>);i++;}i--;blocks.push(ordered?<ol key={key}>{items}</ol>:<ul key={key}>{items}</ul>);continue;}
  if(line.startsWith('|')&&/^\|?\s*:?-+/.test(lines[i+1]?.trim()??'')){const cells=(s:string)=>s.trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim());const head=cells(line),rows=[];const key=i;i+=2;while(i<lines.length&&lines[i].trim().startsWith('|')){rows.push(cells(lines[i]));i++;}i--;blocks.push(<div className="document-table" role="region" aria-label={head.join(', ')} tabIndex={0} key={key}><table><thead><tr>{head.map((h,j)=><th scope="col" key={j}>{inline(h)}</th>)}</tr></thead><tbody>{rows.map((row,j)=><tr key={j}>{head.map((_,k)=><td key={k}>{inline(row[k]??'')}</td>)}</tr>)}</tbody></table></div>);continue;}
  const parts=[line],key=i;while(i+1<lines.length&&lines[i+1].trim()&&!/^(#|[-*] |\d+\. |\|)/.test(lines[i+1].trim()))parts.push(lines[++i]);blocks.push(<p key={key}>{parts.map((p,j)=><Fragment key={j}>{j>0&&<br/>}{inline(p)}</Fragment>)}</p>);
 }
 return <article className="document-paper">{blocks}</article>;
}
