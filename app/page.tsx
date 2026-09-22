import type {Metadata} from 'next';
import Store from './store';
export const metadata:Metadata={alternates:{canonical:'/'},openGraph:{title:'TR HOLOD — хладагенты и компрессоры в Ташкенте',description:'Хладагенты TR Gas, холодильные и кондиционерные компрессоры, комплектующие и инструменты VALUE в каталоге TR HOLOD.',url:'https://trholod.uz/'}};
export default function Page(){return <Store/>}
