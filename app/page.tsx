"use client";

import Banner from "@/components/landing/Banner";
import FeaturedComplexes from "@/components/landing/FeaturedComplexes";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { StatsCtaSection } from "@/components/landing/StatsCtaSection";
import { TeamBuilderSection } from "@/components/landing/TeamBuilderSection";
import { useEffect } from "react";

export default function Home() {
    useEffect(() => {
        const hash = window.location.hash;

        if (hash) {
            const id = hash.replace("#", "");
            const element = document.getElementById(id);

            const offsets: Record<string, number> = {
                complejos: -40,
                funciona: 280,
                equipos: 300,
                cta: 400,
            };

            if (element) {
                setTimeout(() => {
                    const rect = element.getBoundingClientRect();
                    const scrollTop =
                        window.scrollY || document.documentElement.scrollTop;
                    const offset = offsets[id] ?? 0;

                    window.scrollTo({
                        top: rect.top + scrollTop + offset,
                        behavior: "smooth",
                    });
                }, 100);
            }
        }
    }, []);

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
