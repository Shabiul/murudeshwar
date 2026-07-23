import { useSiteData } from '../hooks/useSiteData';
import { services as fallbackServices } from '../data/services';
import { Link } from 'react-router-dom';

export default function PricingSection() {
    const { data: services } = useSiteData('services', fallbackServices);
    return (
        <section className="relative z-10 w-full bg-[#0c0c0c] py-20 px-4 md:px-10">
            <div className="max-w-7xl mx-auto">
                <h2 className="font-serif text-white text-5xl md:text-7xl mb-6 text-center">Our Services</h2>
                <p className="text-white/60 text-center max-w-2xl mx-auto mb-20 font-sans text-lg">
                    Experience luxury and adventure with our curated selection of premium services.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 min-h-[80vh]">
                    {services.map((card, idx) => {
                        const titleLower = card.title?.toLowerCase() || '';
                        let cardImage = card.image;
                        if (titleLower.includes('cab') || titleLower.includes('car') || titleLower.includes('taxi')) {
                            cardImage = "/cars/Suzuki-Swift-South-Africa-May-2022.webp";
                        } else if (titleLower.includes('bike')) {
                            cardImage = "/bikes/2022-royal-enfield-hunter-350.webp";
                        }

                        const CardContent = () => (
                            <div
                                className="group relative rounded-[40px] overflow-hidden transition-all duration-700 hover:scale-[1.02] shadow-2xl h-full flex flex-col bg-[#1a1a1a] border border-white/10"
                            >
                                {/* Base Image */}
                                <div className="aspect-[16/10] w-full overflow-hidden">
                                    <img
                                        src={cardImage}
                                        alt={card.title}
                                        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                                    />
                                </div>

                                {/* Content */}
                                <div className="p-8 flex-grow flex flex-col justify-between text-white">
                                    <div>
                                        <h3 className="font-serif text-3xl mb-3">{card.title}</h3>
                                        <p className="font-sans text-sm opacity-70 leading-relaxed">
                                            {card.description}
                                        </p>
                                        {card.courses && (
                                            <div className="mt-4">
                                                <p className="text-xs font-semibold mb-2 text-white/80">
                                                    Popular Courses:
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {card.courses.map((course, i) => (
                                                        <span
                                                            key={i}
                                                            className="text-xs px-2.5 py-1 rounded-full border border-white/20 text-white/80 bg-white/5"
                                                        >
                                                            {course.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center border border-white/20 transition-all duration-300 group-hover:bg-white group-hover:text-black">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );

                        if (card.link) {
                            return (
                                <Link key={idx} to={card.link} className="block">
                                    <CardContent />
                                </Link>
                            );
                        }

                        return <div key={idx}><CardContent /></div>;
                    })}
                </div>
            </div>
        </section>
    );
}
