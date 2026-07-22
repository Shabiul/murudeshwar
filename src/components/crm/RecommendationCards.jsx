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
      <div className="space-y-4 font-sans">
        <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">AI Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          <div className="h-40 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl"></div>
          <div className="h-40 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl"></div>
          <div className="h-40 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl"></div>
          <div className="h-40 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'Emergency':
        return 'border-rose-200 bg-rose-50/70 text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300';
      case 'High':
        return 'border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300';
      case 'Medium':
        return 'border-blue-200 bg-blue-50/70 text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300';
      default:
        return 'border-stone-200 bg-stone-50/70 text-stone-900 dark:border-stone-800 dark:bg-stone-800/50 dark:text-stone-200';
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
    <div className="space-y-4 font-sans">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">AI Recommendations & Alerts</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((rec) => (
          <div 
            key={rec.id} 
            className={`border rounded-3xl p-5 flex flex-col justify-between hover:scale-[1.01] hover:shadow-md transition-all duration-300 ${getPriorityStyles(rec.priority)}`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-xl bg-white dark:bg-stone-800 shadow-xs border border-stone-200/50 dark:border-stone-700">
                  {getIcon(rec.type)}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white/80 dark:bg-stone-800/80 shadow-xs border border-stone-200/50 dark:border-stone-700">
                  {rec.priority}
                </span>
              </div>
              <h4 className="text-sm font-serif font-bold text-stone-900 dark:text-white mb-1.5 leading-snug">{rec.title}</h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-3 mb-4">{rec.message}</p>
            </div>
            
            <button className="w-full text-center text-xs font-bold py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 transition-colors shadow-xs">
              {rec.actionLabel}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
