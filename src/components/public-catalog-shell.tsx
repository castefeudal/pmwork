import type { ReactNode } from 'react';
import type { Locale } from '@/domain/schemas';
import { PublicHeader } from './public-header';
import { Footer } from './footer';
export function PublicCatalogShell({locale,children}:{locale:Locale;children:ReactNode}) {
 return <div className="catalog-layout"><PublicHeader locale={locale}/><main id="main">{children}</main><Footer locale={locale}/></div>;
}
