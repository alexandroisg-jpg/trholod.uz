import type { Metadata } from 'next';
import './globals.css';
import './storefront.css';
export const metadata:Metadata={metadataBase:new URL('https://trholod.uz'),title:{default:'TR HOLOD — хладагенты и компрессоры в Ташкенте',template:'%s | TR HOLOD'},description:'Хладагенты TR Gas, холодильные и кондиционерные компрессоры, комплектующие и инструменты VALUE в каталоге TR HOLOD. Ташкент, Узбекистан.',robots:{index:true,follow:true},openGraph:{siteName:'TR HOLOD',locale:'ru_UZ',type:'website',images:[{url:'/brand/tr-monogram.webp',alt:'TR HOLOD'}]},icons:{icon:'/favicon.png',shortcut:'/favicon.png'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ru"><body>{children}</body></html>}
