import Image from 'next/image';
export function Brand() {
 return <span className="brand"><Image className="brand-image" src={`${process.env.NEXT_PUBLIC_PMWORK_BASE_PATH??''}/brand/logo-mark.webp`} alt="" width={44} height={44}/><strong>PMWORK</strong></span>;
}
