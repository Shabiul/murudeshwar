import React from 'react';
import { CircularGallery } from './ui/circular-gallery-2';
import { useSiteData } from '../hooks/useSiteData';
import { galleryData as fallbackGalleryData } from '../data/galleryData';

export default function GalleryPage() {
    const { data: galleryData } = useSiteData('galleryData', fallbackGalleryData);
    // Map galleryData to the items format required by CircularGallery
    const galleryItems = galleryData.map((item) => ({
        image: item.src,
        text: "",
    }));

    return (
        <section className="min-h-screen bg-[#faf9f7] text-stone-900 relative flex flex-col justify-between overflow-hidden">
            {/* Header */}
            <div className="pt-32 pb-6 px-4 md:px-12 text-center z-10">
                <div className="max-w-4xl mx-auto">
                    <span className="font-mono text-brand-gold text-xs uppercase tracking-[0.3em] mb-3 block">
                        Visual Registry
                    </span>
                    <h1 className="font-serif text-5xl md:text-7xl text-stone-900 tracking-tight leading-none mb-4">
                        Captured Moments
                    </h1>
                    <p className="font-sans text-xs md:text-sm text-stone-500 max-w-md mx-auto leading-relaxed uppercase tracking-wider">
                        Drag or scroll to rotate through the coastal memories of Murudeshwar.
                    </p>
                </div>
            </div>

            {/* Circular WebGL Gallery container */}
            <div className="relative flex-grow w-full h-[60vh] min-h-[500px] mb-12 select-none z-0">
                <CircularGallery
                    items={galleryItems}
                    bend={3}
                    borderRadius={0.04}
                    scrollEase={0.03}
                    scrollSpeed={2.5}
                    className="text-stone-800 font-serif text-[24px]"
                />
            </div>

            {/* Bottom guide */}
            <div className="pb-12 text-center z-10 pointer-events-none">
                <span className="font-mono text-[10px] tracking-[0.2em] text-stone-400 uppercase flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Swipe / Scroll to Explore
                </span>
            </div>
        </section>
    );
}
