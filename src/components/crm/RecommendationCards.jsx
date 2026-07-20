import React, { useState, useEffect } from 'react';
import { PredictionService } from '../../services/analytics/PredictionService';

export default function RecommendationCards({ propertyId = 'all' }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecommendations() {
      setLoading(true);
      try {
        const data = await PredictionService.getAIRecommendations(propertyId);
        setRecommendations(data);
      } catch (err) {
        console.error("Failed to load recommendations", err);
      } finally {
        setLoading(false);
      }
    }
    loadRecommendations();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">AI Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          <div className="h-40 bg-stone-900/50 border border-white/5 rounded-2xl"></div>
          <div className="h-40 bg-stone-900/50 border border-white/5 rounded-2xl"></div>
          <div className="h-40 bg-stone-900/50 border border-white/5 rounded-2xl"></div>
          <div className="h-40 bg-stone-900/50 border border-white/5 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'Emergency':
        return 'border-rose-500/20 bg-rose-950/20 text-rose-400';
      case 'High':
        return 'border-amber-500/20 bg-amber-950/20 text-amber-400';
      case 'Medium':
        return 'border-blue-500/20 bg-blue-950/20 text-blue-400';
      default:
        return 'border-stone-500/20 bg-stone-900/20 text-stone-400';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'staffing':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'inventory':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case 'maintenance':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 113.536 0V19h2v2h-4v-2H9v-2.1l-.364-.364z" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-gold"></span>
        </span>
        <h3 className="text-base font-semibold text-white">AI Recommendations & Alerts</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((rec) => (
          <div 
            key={rec.id} 
            className={`border rounded-2xl p-5 flex flex-col justify-between hover:scale-[1.02] hover:shadow-lg transition-all duration-300 ${getPriorityStyles(rec.priority)}`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-1.5 rounded-lg bg-white/5">
                  {getIcon(rec.type)}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10">
                  {rec.priority}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white mb-1.5 leading-snug">{rec.title}</h4>
              <p className="text-xs text-stone-300 leading-relaxed line-clamp-3 mb-4">{rec.message}</p>
            </div>
            
            <button className="w-full text-center text-xs font-semibold py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white transition duration-200">
              {rec.actionLabel}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
