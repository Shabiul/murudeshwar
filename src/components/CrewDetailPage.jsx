import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSiteData } from '../hooks/useSiteData';
import { crew as fallbackCrew } from '../data/crew';

export default function CrewDetailPage() {
  const { crewId } = useParams();
  const { data: crew } = useSiteData('crew', fallbackCrew);
  const member = crew.find(m => m.id === crewId);

  if (!member) {
    return (
      <section className="min-h-screen w-full bg-[#0c0c0c] pt-32 pb-20 px-4 md:px-10 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-4xl text-white mb-4">Crew Member Not Found</h1>
          <Link to="/crew" className="text-brand-gold hover:underline">
            Back to Crew
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen w-full bg-[#0c0c0c] pt-32 pb-20 px-4 md:px-10">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            to="/crew"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Crew
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="w-64 h-64 mx-auto mb-6 rounded-full overflow-hidden border-4 border-brand-gold/30 shadow-lg">
            <img
              src={member.image}
              alt={member.name}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-brand-gold font-mono text-sm mb-2">{member.team}</p>
          <h1 className="font-serif text-5xl md:text-6xl text-white mb-2">{member.name}</h1>
          <p className="text-white/70 text-lg mb-4">{member.role}</p>
          <p className="text-white/50 text-sm">{member.location} • {member.experience}</p>
        </motion.div>

        {member.quote && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-panel rounded-[30px] p-6 mb-8 max-w-2xl mx-auto"
          >
            <p className="text-white/80 italic text-lg text-center">
              "{member.quote}"
            </p>
          </motion.div>
        )}

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {member.highlights.map((highlight, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
              className="px-4 py-2 rounded-full bg-brand-gold/10 text-brand-gold text-sm font-semibold border border-brand-gold/30"
            >
              ✨ {highlight}
            </motion.span>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {member.skills.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass-panel rounded-[30px] p-8"
            >
              <h2 className="font-serif text-2xl text-brand-gold mb-6">Skills & Strengths</h2>
              <ul className="space-y-3">
                {member.skills.map((skill, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/80">
                    <span className="text-brand-gold mt-1">•</span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {member.certifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="glass-panel rounded-[30px] p-8"
            >
              <h2 className="font-serif text-2xl text-brand-gold mb-6">Certifications</h2>
              <ul className="space-y-3">
                {member.certifications.map((cert, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80">
                    <div className="w-2 h-2 rounded-full bg-brand-gold"></div>
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2 className="font-serif text-2xl text-brand-gold mb-6 text-center">About {member.name}</h2>
          <div className="glass-panel rounded-[30px] p-8">
            <p className="text-white/80 leading-relaxed text-lg">
              {member.description}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
