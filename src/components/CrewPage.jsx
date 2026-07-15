import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { crew } from '../data/crew';

export default function CrewPage() {
  const teams = [...new Set(crew.map(member => member.team))];

  return (
    <section className="min-h-screen w-full bg-[#0c0c0c] pt-32 pb-20 px-4 md:px-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h1 className="font-serif text-5xl md:text-7xl text-white mb-6">Our <span className="text-brand-gold">Crew</span></h1>
          <p className="text-white/60 font-sans text-lg max-w-2xl mx-auto">
            Meet the passionate team behind your underwater adventures.
          </p>
        </motion.div>

        {teams.map((team) => (
          <div key={team} className="mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-8 flex items-center gap-2">
              <span className="w-8 h-1 bg-brand-gold"></span>
              {team}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {crew.filter(member => member.team === team).map((member, idx) => (
                <Link key={member.id} to={`/crew/${member.id}`} className="block">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="group relative overflow-hidden rounded-[40px] bg-[#1a1a1a] border border-white/10 hover:border-brand-gold/30 transition-all duration-500 cursor-pointer"
                  >
                    <div className="pt-8 flex justify-center">
                      <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-brand-gold/30 shadow-lg transition-transform duration-500 group-hover:scale-110">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="p-8">
                      <h3 className="font-serif text-2xl text-white mb-2 text-center">{member.name}</h3>
                      <p className="text-brand-gold font-mono text-sm mb-4 text-center">{member.role}</p>
                      <p className="text-white/60 text-sm mb-4 text-center">{member.location} • {member.experience}</p>
                      {member.quote && (
                        <p className="text-white/80 italic text-sm mb-4 border-l-2 border-brand-gold pl-4">
                          "{member.quote}"
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-4 justify-center">
                        {member.highlights.map((highlight, i) => (
                          <span
                            key={i}
                            className="text-xs px-3 py-1 rounded-full bg-black/30 text-white/70 border border-white/20"
                          >
                            ✨ {highlight}
                          </span>
                        ))}
                      </div>
                      <p className="text-white/70 text-sm line-clamp-3 mb-4">{member.description}</p>
                      {member.skills.length > 0 && (
                        <div className="mb-4">
                          <p className="text-white/80 font-semibold text-sm mb-2">Skills & Strengths</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {member.skills.slice(0, 3).map((skill, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/60 border border-white/10"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {member.certifications.length > 0 && (
                        <div>
                          <p className="text-white/80 font-semibold text-sm mb-2">Certifications</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {member.certifications.slice(0, 3).map((cert, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/30"
                              >
                                {cert}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
