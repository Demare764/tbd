// /components/site/ClientLayout.tsx
"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    AOS.init({
      once: true,
      disable: "phone",
      duration: 700,
      easing: "ease-out-cubic",
    });
  }, []);

  return (
    <div className="min-h-dvh flex flex-col overflow-hidden supports-[overflow:clip]:overflow-clip bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Accessibility: skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-slate-900 dark:focus:bg-slate-800 dark:focus:text-white"
      >
        Skip to main content
      </a>

      <Header />
      <main id="main-content" role="main" className="grow">
        {children}
      </main>
      <Footer border={true} />
    </div>
  );
}
