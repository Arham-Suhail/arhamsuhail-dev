"use client";

import Image from "next/image";
import { siteData } from "../../data/site";

export default function Logo() {
  if (siteData.logoSrc) {
    return (
      <Image 
        src={siteData.logoSrc} 
        alt="Arham Suhail" 
        width={0}
        height={32}
        sizes="32px"
        className="h-8 w-auto object-contain" 
      />
    );
  }

  return (
    <span className="font-display text-2xl tracking-wider text-ice">
      Arham<span className="text-steel">.</span>
    </span>
  );
}
