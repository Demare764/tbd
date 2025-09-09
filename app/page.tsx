// /app/page.tsx

import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Discover Black-Owned Businesses That Feel Like Home | Crowned Commerce",
  description:
    "Crowned Commerce helps you discover, support, and celebrate Black-owned businesses, events, and stories — all matched to your vibe, values, and neighborhood.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Your Next Favorite Business Might Be Around the Corner | Crowned Commerce",
    description:
      "Explore Black-owned businesses, local events, and powerful stories — personalized to what moves you.",
    images: [
      {
        url: "/og/home.jpg",
        width: 1200,
        height: 630,
        alt: "Crowned Commerce: personalized local matches rooted in culture, care, and community",
      },
    ],
  },
  twitter: {
    title: "Discover Black-Owned Businesses That Feel Like Home",
    description:
      "Explore local businesses, events, and stories — matched to your vibe, values, and community love.",
    images: ["/og/home.jpg"],
  },
};


import Hero from "@/components/hero-home";
import BusinessCategories from "@/components/business-categories";
import LargeTestimonial from "@/components/large-testimonial";
import FeaturesPlanet from "@/components/features-planet";
import Features from "@/components/features-home";
import TestimonialsCarousel from "@/components/testimonials-carousel";
import Cta from "@/components/cta";

import ClientLayout from "@/components/site/ClientLayout";

export default function Home() {
  // Optional JSON-LD specific to the home WebPage
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Home",
    description:
      "Discover nearby Black-owned businesses, events, and stories—personalized to your vibe and values.",
  };

  return (
    <ClientLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <Hero />
      <BusinessCategories />
      <LargeTestimonial />
      <FeaturesPlanet />
      <Features />
      <TestimonialsCarousel />
      <Cta />
    </ClientLayout>
  );
}
