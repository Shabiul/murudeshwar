import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { padiCourses } from '../data/padiCourses';

// ─── Small reusable components ────────────────────────────────────────────────

const Tag = ({ children, color = 'cyan' }) => {
  const palette = {
    cyan: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/30',
    amber: 'text-amber-400 border-amber-500/30 bg-amber-950/30',
    emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30',
  };
  return (
    <span className={`inline-flex items-center px-3.5 py-1.5 text-[11px] font-mono font-semibold border rounded-full uppercase tracking-widest ${palette[color]}`}>
      {children}
    </span>
  );
};

const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="flex items-center gap-4 mb-7">
    <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-cyan-950/60 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
      {icon}
    </div>
    <div>
      <h2 className="font-serif text-xl md:text-2xl text-cyan-100 leading-tight">{title}</h2>
      {subtitle && <p className="text-xs text-cyan-100/40 mt-0.5 font-sans">{subtitle}</p>}
    </div>
  </div>
);

const ListItem = ({ children, icon }) => (
  <li className="flex items-start gap-3.5 group">
    <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-cyan-900/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400/10 transition-colors">
      {icon}
    </div>
    <span className="text-sm md:text-base text-cyan-100/75 leading-relaxed">{children}</span>
  </li>
);

const CheckIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ArrowIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
  </svg>
);

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const course = padiCourses.find(c => c.id === courseId);

  if (!course) {
    return (
      <section className="min-h-screen w-full bg-gradient-to-b from-blue-950 to-slate-950 pt-40 pb-20 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-serif text-4xl text-cyan-100 mb-4">Course Not Found</h1>
          <Link to="/courses" className="text-cyan-400 hover:text-cyan-300 underline text-sm">
            ← Back to Courses
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen w-full relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950 via-[#071828] to-slate-950" />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'linear-gradient(rgba(100,220,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(100,220,255,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-6 pt-32 pb-24">

        {/* ── Back Link ── */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="mb-10">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-cyan-100/50 hover:text-cyan-300 transition-colors text-sm font-sans group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            All Courses
          </Link>
        </motion.div>

        {/* ── Hero Image ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="relative h-[300px] md:h-[420px] rounded-3xl overflow-hidden mb-10 border border-cyan-500/15 shadow-2xl shadow-cyan-950/50"
        >
          <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-900/30 to-transparent" />

          {/* Overlay badge */}
          <div className="absolute bottom-5 left-5">
            <Tag color="cyan">{course.details.level}</Tag>
          </div>
        </motion.div>

        {/* ── Title & Tags ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-10">
          <div className="flex flex-wrap gap-2 mb-5">
            <Tag color="amber">Duration: {course.details.duration}</Tag>
            {course.details.maximumDepth !== 'N/A' && (
              <Tag color="cyan">Max Depth: {course.details.maximumDepth}</Tag>
            )}
            <Tag color="emerald">Age: {course.details.minimumAge}+</Tag>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl text-cyan-50 mb-5 leading-tight">
            {course.title}
          </h1>
          <p className="text-cyan-100/60 font-sans text-base md:text-lg leading-relaxed">
            {course.description}
          </p>
        </motion.div>

        {/* ── Divider ── */}
        <div className="border-t border-cyan-500/10 mb-12" />

        {/* ── Prerequisites ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mb-12"
        >
          <SectionHeader
            title="Prerequisites"
            subtitle="Required qualifications to enroll"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          />
          <ul className="space-y-3.5">
            {course.prerequisites.map((item, i) => (
              <ListItem key={i} icon={<CheckIcon />}>{item}</ListItem>
            ))}
          </ul>
        </motion.div>

        {/* ── Divider ── */}
        <div className="border-t border-cyan-500/10 mb-12" />

        {/* ── What You'll Learn ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mb-12"
        >
          <SectionHeader
            title="What You'll Learn"
            subtitle="Core skills and knowledge acquired"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
          <ul className="space-y-3.5">
            {course.whatYoullLearn.map((item, i) => (
              <ListItem key={i} icon={<ArrowIcon />}>{item}</ListItem>
            ))}
          </ul>
        </motion.div>

        {/* ── Divider ── */}
        <div className="border-t border-cyan-500/10 mb-12" />

        {/* ── What's Included ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mb-12"
        >
          <SectionHeader
            title="What's Included"
            subtitle="Equipment, materials & services covered"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
          />
          <ul className="space-y-3.5">
            {course.whatsIncluded.map((item, i) => (
              <ListItem key={i} icon={<CheckIcon />}>{item}</ListItem>
            ))}
          </ul>
        </motion.div>

        {/* ── Divider ── */}
        <div className="border-t border-cyan-500/10 mb-12" />

        {/* ── Ideal For ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mb-12"
        >
          <SectionHeader
            title="Ideal For"
            subtitle="Who should take this course"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <ul className="space-y-3.5">
            {course.idealFor.map((item, i) => (
              <ListItem key={i} icon={<StarIcon />}>{item}</ListItem>
            ))}
          </ul>
        </motion.div>

        {/* ── Divider ── */}
        <div className="border-t border-cyan-500/10 mb-12" />

        {/* ── Certification ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mb-14"
        >
          <SectionHeader
            title="Certification"
            subtitle="World-recognized credential on completion"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            }
          />
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-950/20 backdrop-blur-sm p-6 md:p-8">
            <p className="text-cyan-100/75 text-sm md:text-base leading-relaxed">{course.certification}</p>
          </div>
        </motion.div>

        {/* ── CTA ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <a
            href="https://wa.me/919459363333"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2.5 px-7 py-4 bg-cyan-400 hover:bg-cyan-300 text-blue-950 font-sans font-bold text-sm tracking-wide rounded-2xl transition-all duration-300 hover:scale-[1.02]"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Book via WhatsApp
          </a>
          <Link
            to="/contact"
            className="flex-1 flex items-center justify-center gap-2 px-7 py-4 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-cyan-200 font-sans font-semibold text-sm tracking-wide rounded-2xl transition-all duration-300 hover:bg-cyan-950/30"
          >
            Send Enquiry
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
