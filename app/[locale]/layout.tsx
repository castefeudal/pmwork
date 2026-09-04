import { notFound } from "next/navigation";
import type { Locale } from "@/domain/schemas";
export function generateStaticParams(){return [{locale:"ru"},{locale:"en"}];}
export default async function LocaleLayout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}){const {locale}=await params;if(locale!=="ru"&&locale!=="en")notFound();return <div lang={locale as Locale}>{children}</div>}
