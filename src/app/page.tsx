import { Navbar } from "@/components/home/navbar";
import { Hero } from "@/components/home/hero";
import { About, Contact, Services, WhyUs } from "@/components/home/sections";
import { Footer } from "@/components/home/footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <About />
        <WhyUs />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
