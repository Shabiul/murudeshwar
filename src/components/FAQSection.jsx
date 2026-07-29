import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StructuredData, { getFAQSchema } from './StructuredData';

/**
 * Premium FAQ accordion with schema markup for AEO/AIEO/GEO.
 *
 * @param {Array<{question: string, answer: string}>} faqs – FAQ items
 * @param {string} [title]    – Section heading
 * @param {string} [subtitle] – Section sub-heading
 * @param {string} [variant]  – 'light' (default) or 'dark'
 */
export default function FAQSection({
  faqs = [],
  title = 'Frequently Asked Questions',
  subtitle,
  variant = 'light',
}) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!faqs.length) return null;

  const isDark = variant === 'dark';

  return (
    <section
      className={`relative w-full py-20 md:py-28 px-6 md:px-12 ${
        isDark ? 'bg-slate-950 text-white' : 'bg-[#faf9f7] text-stone-900'
      }`}
    >
      {/* Schema Markup */}
      <StructuredData data={getFAQSchema(faqs)} />

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p
            className={`font-sans text-xs tracking-[0.3em] uppercase mb-4 ${
              isDark ? 'text-cyan-400' : 'text-brand-gold'
            }`}
          >
            FAQ
          </p>
          <h2
            className={`font-serif text-3xl md:text-5xl mb-4 ${
              isDark ? 'text-white' : 'text-stone-900'
            }`}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className={`font-sans text-base max-w-xl mx-auto ${
                isDark ? 'text-white/60' : 'text-stone-500'
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isDark
                    ? `border-white/10 ${isOpen ? 'bg-white/5' : 'bg-white/[0.02] hover:bg-white/[0.04]'}`
                    : `border-stone-200 ${isOpen ? 'bg-white shadow-sm' : 'bg-white/60 hover:bg-white'}`
                }`}
              >
                {/* Question Button */}
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <h3
                    className={`font-sans text-sm md:text-base font-semibold leading-snug pr-4 ${
                      isDark ? 'text-white' : 'text-stone-800'
                    }`}
                  >
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.25 }}
                    className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                      isDark
                        ? isOpen
                          ? 'bg-cyan-500 text-white'
                          : 'bg-white/10 text-white/60'
                        : isOpen
                        ? 'bg-brand-gold text-white'
                        : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                    </svg>
                  </motion.div>
                </button>

                {/* Answer */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                      <div
                        className={`px-5 md:px-6 pb-5 md:pb-6 font-sans text-sm leading-relaxed ${
                          isDark ? 'text-white/70' : 'text-stone-600'
                        }`}
                      >
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
