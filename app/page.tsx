import Banner from "@/components/landing/Banner";
import FeaturedComplexes from "@/components/landing/FeaturedComplexes";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { StatsCtaSection } from "@/components/landing/StatsCtaSection";
import { TeamBuilderSection } from "@/components/landing/TeamBuilderSection";

export default function Home() {
    return (
        <div className="flex flex-col scroll-smooth">
            <section id="inicio" className="scroll-mt-16">
                <Banner />
            </section>

            <section id="complejos" className="scroll-mt-16">
                <FeaturedComplexes />
            </section>

            <section id="funciona" className="scroll-mt-16">
                <HowItWorks />
            </section>

            <section id="equipos" className="scroll-mt-16">
                <TeamBuilderSection />
            </section>

            <section id="cta" className="scroll-mt-16">
                <StatsCtaSection />
            </section>
        </div>
    );
}
