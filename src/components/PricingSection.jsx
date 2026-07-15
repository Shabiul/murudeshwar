import { services } from '../data/services';
import { Link } from 'react-router-dom';

export default function PricingSection() {
    return (
        <section className="relative z-10 w-full bg-[#0c0c0c] py-20 px-4 md:px-10">
            <div className="max-w-7xl mx-auto">
                <h2 className="font-serif text-white text-5xl md:text-7xl mb-6 text-center">Our Services</h2>
                <p className="text-white/60 text-center max-w-2xl mx-auto mb-20 font-sans text-lg">
                    Experience luxury and adventure with our curated selection of premium services.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 min-h-[80vh]">
                    {services.map((card, idx) => {
                        const CardContent = () => (
                            <div
                                className={`group relative rounded-[40px] overflow-hidden transition-all duration-700 hover:scale-[1.02] shadow-2xl h-full flex flex-col
                                    ${card.dark ? 'bg-[#1a1a1a]' : 'bg-white'}
                                    ${card.accent ? 'border border-brand-gold/30' : ''}
                                `}
                            >
                                {/* Base Image */}
                                <div className="aspect-[16/10] w-full overflow-hidden">
                                    <img
                                        src={card.image}
                                        alt={card.title}
                                        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                                    />
                                </div>

                                {/* Content */}
                                <div className={`p-8 flex-grow flex flex-col justify-between ${card.dark ? 'text-white' : 'text-black'}`}>
                                    <div>
                                        <h3 className="font-serif text-3xl mb-3">{card.title}</h3>
                                        <p className="font-sans text-sm opacity-60 leading-relaxed">
                                            {card.description}
                                        </p>
                                        {card.courses && (
                                            <div className="mt-4">
                                                <p className={`text-xs font-semibold mb-2 ${card.dark ? 'text-white/80' : 'text-black/70'}`}>
                                                    Popular Courses:
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {card.courses.map((course, i) => (
                                                        <span
                                                            key={i}
                                                            className={`text-xs px-2 py-1 rounded-full border ${
                                                                card.dark 
                                                                    ? 'border-white/20 text-white/70' 
                                                                    : 'border-black/10 text-black/60'
                                                            }`}
                                                        >
                                                            {course.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300
                                            ${card.dark ? 'border-white/20 group-hover:bg-white group-hover:text-black' : 'border-black/10 group-hover:bg-black group-hover:text-white'}
                                        `}>
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
