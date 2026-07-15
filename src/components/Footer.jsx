import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="relative w-full bg-stone-900 text-white pt-20 pb-8 px-6 md:px-12 border-t border-stone-800">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16">
                    {/* SERVICES */}
                    <div>
                        <h4 className="font-sans font-bold text-[10px] tracking-[0.2em] text-white/40 mb-6 uppercase">Services</h4>
                        <ul className="space-y-3 font-sans text-sm text-white/70">
                            <li><Link to="/beach-front-stay" className="hover:text-brand-gold transition-colors">Beach-Front Stays</Link></li>
                            <li><Link to="/courses" className="hover:text-brand-gold transition-colors">Scuba Diving Courses</Link></li>
                            <li><Link to="/bike-rental" className="hover:text-brand-gold transition-colors">Bike Rental</Link></li>
                            <li><Link to="/attractions" className="hover:text-brand-gold transition-colors">Attractions</Link></li>
                        </ul>
                    </div>

                    {/* GET IN TOUCH */}
                    <div>
                        <h4 className="font-sans font-bold text-[10px] tracking-[0.2em] text-white/40 mb-6 uppercase">Get in Touch</h4>
                        <ul className="space-y-3 font-sans text-sm text-white/70">
                            <li><Link to="/contact" className="hover:text-brand-gold transition-colors">Contact</Link></li>
                            <li><Link to="/crew" className="hover:text-brand-gold transition-colors">Our Crew</Link></li>
                            <li className="hover:text-white transition-colors cursor-pointer">Press</li>
                        </ul>
                    </div>

                    {/* CONNECT */}
                    <div>
                        <h4 className="font-sans font-bold text-[10px] tracking-[0.2em] text-white/40 mb-6 uppercase">Connect</h4>
                        <ul className="space-y-3 font-sans text-sm text-white/70">
                            <li className="hover:text-brand-gold transition-colors cursor-pointer">Instagram</li>
                            <li className="hover:text-brand-gold transition-colors cursor-pointer">Facebook</li>
                            <li className="hover:text-brand-gold transition-colors cursor-pointer">YouTube</li>
                        </ul>
                    </div>

                    {/* OUR LOCATION MAP */}
                    <div>
                        <h4 className="font-sans font-bold text-[10px] tracking-[0.2em] text-white/40 mb-6 uppercase">Our Location</h4>
                        <div className="w-full h-32 rounded-xl overflow-hidden border border-stone-800 shadow-inner relative mb-3 bg-stone-950">
                            <iframe
                                title="Footer Location Map"
                                src="https://maps.google.com/maps?q=Beach%20road%2C%20Murdeshwar%20Temple%20Main%20Rd%2C%20Matadahitlu%2C%20Murdeshwar%2C%20Karnataka%20581350%2C%20India&t=&z=16&ie=UTF8&iwloc=&output=embed"
                                className="w-full h-full border-0 absolute inset-0 filter invert-[90%] hue-rotate-[180deg] grayscale"
                                allowFullScreen=""
                                loading="lazy"
                            />
                        </div>
                        <p className="font-sans text-[11px] text-white/50 leading-normal">
                            Beach road, Murdeshwar Temple Main Rd, Matadahitlu, Murdeshwar, Karnataka 581350, India
                        </p>
                    </div>
                </div>

                {/* BOTTOM UTILS */}
                <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-white/30 font-sans uppercase tracking-widest">
                    <p>© 2026 Murudeshwara. All rights reserved. Designed & Made by <a href="https://naazailabs.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold transition-colors underline decoration-brand-gold/30">naazailabs.com</a></p>
                    <div className="flex gap-8 mt-4 md:mt-0">
                        <span className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
                        <span className="cursor-pointer hover:text-white transition-colors">Terms</span>
                        <span className="cursor-pointer hover:text-white transition-colors">Sitemap</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
