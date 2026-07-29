import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSiteData } from '../hooks/useSiteData';
import { padiCourses as fallbackPadiCourses } from '../data/padiCourses';
import SEOHead from './SEOHead';
import StructuredData, { getCoursesListSchema, getBreadcrumbSchema, getFAQSchema } from './StructuredData';
import FAQSection from './FAQSection';

const scubaFAQs = [
  {
    question: 'What is PADI certification and why does it matter?',
    answer: 'PADI (Professional Association of Diving Instructors) is the world\'s leading scuba diving training organization. A PADI certification is recognized globally and allows you to dive at any PADI affiliated dive centre worldwide. Our Murudeshwara Dive Centre is fully PADI certified.',
  },
  {
    question: 'What is the best time for scuba diving in Murudeshwar?',
    answer: 'The best time for scuba diving in Murudeshwar is from October to May, when the sea is calm and visibility is excellent (10-25 meters). The water temperature ranges from 26-30°C during this period, making it comfortable for diving without thick wetsuits.',
  },
  {
    question: 'Do I need to know swimming for scuba diving in Murudeshwar?',
    answer: 'For the Discover Scuba Diving experience (beginner program), basic comfort in water is sufficient — you don\'t need to be an expert swimmer. For PADI Open Water certification and above, you need to swim 200 meters and float for 10 minutes.',
  },
  {
    question: 'How deep can I dive with a PADI Open Water certification?',
    answer: 'With a PADI Open Water Diver certification, you can dive up to 18 meters (60 feet). The Advanced Open Water certification extends this to 30 meters (100 feet). Our dive sites at Murudeshwar and nearby Netrani Island offer depths suitable for all levels.',
  },
  {
    question: 'What marine life can I see while diving in Murudeshwar?',
    answer: 'Murudeshwar and nearby Netrani Island offer incredible marine biodiversity including reef sharks, manta rays, sea turtles, moray eels, barracudas, and colourful coral formations. Netrani Island is especially known for its whale shark sightings during season.',
  },
  {
    question: 'How long does each PADI course take?',
    answer: 'Discover Scuba Diving takes 1 day. PADI Open Water Diver takes 3-4 days. Advanced Open Water takes 2-3 days. Rescue Diver takes 3-4 days. Divemaster (professional level) takes 2-4 weeks depending on prior experience.',
  },
];

const levelColors = {
  beginner:     'text-emerald-400 border-emerald-500/30 bg-emerald-950/30',
  intermediate: 'text-amber-400  border-amber-500/30  bg-amber-950/30',
  advanced:     'text-orange-400 border-orange-500/30 bg-orange-950/30',
  professional: 'text-rose-400   border-rose-500/30   bg-rose-950/30',
};

function LevelBadge({ level = '' }) {
  const key = Object.keys(levelColors).find(k => level.toLowerCase().includes(k));
  const cls = levelColors[key] || 'text-cyan-400 border-cyan-500/30 bg-cyan-950/30';
  return (
    <span className={`inline-flex items-center px-3 py-1 text-[10px] font-mono font-semibold border rounded-full uppercase tracking-widest ${cls}`}>
      {level}
    </span>
  );
}

export default function CoursesPage() {
  const { data: padiCourses } = useSiteData('padiCourses', fallbackPadiCourses);
  return (
    <>
    <SEOHead
      title="Scuba Diving Courses in Murudeshwar | PADI Certified Dive Centre"
      description="Book PADI certified scuba diving courses in Murudeshwar, Karnataka. From beginner Discover Scuba to professional Divemaster. Expert instructors, best prices, Netrani Island dives."
      path="/courses"
    />
    <StructuredData data={getCoursesListSchema(padiCourses)} />
    <StructuredData data={getBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Scuba Diving Courses', url: '/courses' }])} />

    <section className="min-h-screen w-full relative pt-32 pb-24 px-4 md:px-10 overflow-hidden">
      {/* Ocean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950 via-blue-900 to-slate-950" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(100,220,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(100,220,255,1) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-14 text-center"
        >
          <p className="font-mono text-cyan-400 text-xs tracking-[0.35em] uppercase mb-4">
            Murudeshwara Dive Centre
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-cyan-50 mb-5 leading-tight">
            PADI <span className="text-cyan-400">Courses</span>
          </h1>
          <p className="text-cyan-100/55 font-sans text-base max-w-xl mx-auto leading-relaxed">
            From your first breath underwater to professional instructor training — every certification at Murudeshwara's premier dive school.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {padiCourses.map((course, idx) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.07 }}
            >
              <Link
                to={`/courses/${course.id}`}
                className="group flex flex-col h-full bg-white/[0.03] hover:bg-cyan-950/30 backdrop-blur-md rounded-3xl overflow-hidden border border-cyan-500/10 hover:border-cyan-400/30 transition-all duration-400 shadow-lg shadow-cyan-950/20"
              >
                {/* Thumbnail */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 to-transparent" />

                  {/* Level badge on image */}
                  <div className="absolute top-4 left-4">
                    <LevelBadge level={course.details.level} />
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1 p-6">
                  {/* Tags row */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono text-cyan-100/50 border border-cyan-200/10 rounded-full bg-blue-950/30">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {course.details.duration}
                    </span>

                    {course.details.maximumDepth !== 'N/A' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono text-cyan-300/60 border border-cyan-300/10 rounded-full bg-blue-950/30">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        {course.details.maximumDepth}
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono text-cyan-100/40 border border-cyan-200/10 rounded-full bg-blue-950/30">
                      Age {course.details.minimumAge}+
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-xl md:text-2xl text-cyan-50 leading-snug group-hover:text-cyan-300 transition-colors duration-300 mb-3">
                    {course.title}
                  </h3>

                  {/* Description */}
                  <p className="text-cyan-100/50 text-sm leading-relaxed line-clamp-3 flex-1">
                    {course.description}
                  </p>

                  {/* Footer CTA */}
                  <div className="mt-5 pt-4 border-t border-cyan-500/10 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-100/30 uppercase tracking-wider">
                      {course.prerequisites?.length ?? 0} prereq{course.prerequisites?.length !== 1 ? 's' : ''}
                    </span>
                    <div className="flex items-center gap-1.5 text-cyan-400 group-hover:text-cyan-300 text-[10px] font-bold uppercase tracking-widest transition-colors">
                      <span>View Course</span>
                      <svg
                        className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-14 text-center text-xs text-cyan-100/25 font-mono uppercase tracking-widest"
        >
          All courses conducted under PADI international certification standards
        </motion.p>
      </div>
    </section>
    <FAQSection
      faqs={scubaFAQs}
      title="Scuba Diving FAQ"
      subtitle="Common questions about diving in Murudeshwar"
      variant="dark"
    />
    </>
  );
}
