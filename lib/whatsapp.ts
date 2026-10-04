import { siteData } from "../data/site";

export function buildWhatsAppLink(message: string): string {
  const number = siteData.whatsappNumber.replace(/[^0-9]/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
