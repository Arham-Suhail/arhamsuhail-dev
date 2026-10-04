import Hero from "../components/sections/Hero";
import About from "../components/sections/About";
import Services from "../components/sections/Services";
import Work from "../components/sections/Work";
import FAQ from "../components/sections/FAQ";
import Contact from "../components/sections/Contact";
import { testimonials } from "../data/testimonials";

// Optional Testimonials Section inline if needed, but the prompt says:
// "Build the section/component from /data/testimonials.ts. If the array is empty (default), do NOT render the section at all."
// I will create a Testimonials component quickly and import it.

import Testimonials from "../components/sections/Testimonials";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Work />
      {testimonials.length > 0 && <Testimonials />}
      <FAQ />
      <Contact />
    </>
  );
}
