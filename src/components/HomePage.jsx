import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroCanvas from './HeroCanvas';
import PricingSection from './PricingSection';
import StatsAbout from './StatsAbout';
import WhyChooseUs from './WhyChooseUs';

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
    return (
        <main className="w-full bg-[#faf9f7]">
            {/* HERO SECTION */}
            <div className="relative h-screen w-full overflow-hidden">
                <HeroCanvas />
            </div>

            {/* CONTENT SECTIONS */}
            <div className="relative z-10 bg-[#faf9f7]">
                <StatsAbout />
                <PricingSection />
                <WhyChooseUs />
            </div>
        </main>
    );
}
