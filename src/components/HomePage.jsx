import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroCanvas from './HeroCanvas';
import PricingSection from './PricingSection';
import StatsAbout from './StatsAbout';
import WhyChooseUs from './WhyChooseUs';
import SEOHead from './SEOHead';
import StructuredData, {
    getOrganizationSchema,
    getWebSiteSchema,
    getLocalBusinessSchema,
    getFAQSchema,
    getBreadcrumbSchema,
} from './StructuredData';
import FAQSection from './FAQSection';

gsap.registerPlugin(ScrollTrigger);

const homeFAQs = [
    {
        question: 'What services does Murudeshwara Beach Resort offer?',
        answer:
            'We offer a comprehensive range of services including beachfront accommodation with sea views, PADI certified scuba diving courses (from beginner Discover Scuba to professional Divemaster), bike rentals, cab/taxi services, and guided tours to local attractions like Murudeshwar Temple, Netrani Island, and Gokarna.',
    },
    {
        question: 'Where is Murudeshwara Beach Resort located?',
        answer:
            'We are located on Beach Road, Murdeshwar Temple Main Rd, Matadahitlu, Murudeshwar, Karnataka 581350, India. Our resort is right next to the famous Murudeshwar Temple and overlooks the beautiful Arabian Sea.',
    },
    {
        question: 'How do I book a stay or service in Murudeshwar?',
        answer:
            'You can book directly through our website by clicking the "Book Now" button on any service page, or reach us via WhatsApp at +91 94593 63333. For room bookings, call the Stay desk at +91 89883 38383. For scuba diving, contact +91 92022 29292.',
    },
    {
        question: 'Is scuba diving safe for beginners in Murudeshwar?',
        answer:
            'Absolutely! Our PADI certified instructors have 15+ years of experience and maintain the highest safety standards. We offer the "Discover Scuba Diving" program specifically designed for first-timers with no prior experience required. All equipment is professionally maintained and sanitized.',
    },
    {
        question: 'What is the best time to visit Murudeshwar?',
        answer:
            'The best time to visit Murudeshwar is from October to May when the weather is pleasant and sea conditions are ideal for scuba diving and water sports. The monsoon season (June–September) brings heavy rains but offers a unique lush green landscape.',
    },
    {
        question: 'Do you offer packages combining stay and activities?',
        answer:
            'Yes! We offer all-inclusive packages that combine beachfront accommodation with scuba diving courses, guided temple tours, and transportation. Contact us directly on WhatsApp for customized package deals with the best rates.',
    },
];

export default function HomePage() {
    return (
        <main className="w-full bg-[#faf9f7]">
            {/* SEO Head */}
            <SEOHead
                title="Scuba Diving, Beachfront Stay, Bike & Cab Rental in Murudeshwar"
                description="Book beachfront stays, PADI certified scuba diving courses, bike & cab rentals in Murudeshwar, Karnataka. Located near Murudeshwar Temple with stunning Arabian Sea views. Best prices guaranteed."
                path="/"
            />

            {/* Structured Data */}
            <StructuredData data={getOrganizationSchema()} />
            <StructuredData data={getWebSiteSchema()} />
            <StructuredData data={getLocalBusinessSchema()} />
            <StructuredData
                data={getBreadcrumbSchema([{ name: 'Home', url: '/' }])}
            />

            {/* HERO SECTION */}
            <div className="relative h-screen w-full overflow-hidden">
                <HeroCanvas />
            </div>

            {/* CONTENT SECTIONS */}
            <div className="relative z-10 bg-[#faf9f7]">
                <StatsAbout />
                <PricingSection />
                <WhyChooseUs />
                <FAQSection
                    faqs={homeFAQs}
                    title="Frequently Asked Questions"
                    subtitle="Everything you need to know about visiting Murudeshwar"
                />
            </div>
        </main>
    );
}
