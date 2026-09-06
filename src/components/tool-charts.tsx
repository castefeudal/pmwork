import type {Locale} from '@/domain/schemas';
export function ValueBars({values,label}:{values:{label:string;value:number}[];label:string}){
 const max=Math.max(1,...values.map(v=>v.value));
 return <figure className="value-bars"><figcaption>{label}</figcaption>{values.map(v=><div key={v.label}><span>{v.label}</span><span className="value-track"><i style={{width:`${v.value/max*100}%`}}/></span><b>{Math.round(v.value).toLocaleString()}</b></div>)}</figure>;
}
export function SampleHistogram({values,locale}:{values:number[];locale:Locale}){
 const min=values[0],max=values[values.length-1],step=Math.max(1,Math.ceil((max-min+1)/12));
 const bins=Array.from({length:Math.ceil((max-min+1)/step)},(_,i)=>({label:`${min+i*step}–${Math.min(max,min+(i+1)*step-1)}`,value:0}));
 for(const value of values)bins[Math.floor((value-min)/step)].value++;
 return <ValueBars label={locale==='ru'?'Элементов к выбранному горизонту → число симуляций':'Items by selected horizon → simulation count'} values={bins}/>;
}
