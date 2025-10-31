"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

const PAGES_WITH_FOOTER = ["/", "/about", "/contact"];

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Show footer only on specific pages
  const shouldShowFooter = PAGES_WITH_FOOTER.includes(pathname);
  
  if (!shouldShowFooter) {
    return null;
  }
  
  return <Footer />;
}