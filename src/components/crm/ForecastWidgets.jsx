import React, { useState, useEffect } from 'react';
import { PredictionService } from '../../services/analytics/PredictionService';

export default function ForecastWidgets({ propertyId = 'all' }) {
  const [occupancy, setOccupancy] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadForecasts() {
      setLoading(true);
      try {
        const [occData, revData, invData] = await Promise.all([
          PredictionService.getOccupancyForecast(propertyId),
          PredictionService.getRevenueForecast(propertyId),
          PredictionService.getInventoryForecast(propertyId)
        ]);
        setOccupancy(occData);
        setRevenue(revData);
        setInventory(invData);
      } catch (err) {
        console.error("Failed to load predictions", err);
      } finally {
        setLoading(false);
      }
    }
    loadForecasts();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        <div className="h-64 bg-stone-900/50 border border-white/5 rounded-2xl"></div>
        <div className="h-64 bg-stone-900/50 border border-white/5 rounded-2xl"></div>
        <div className="h-64 bg-stone-900/50 border border-white/5 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Occupancy Forecast */}
      <div className="bg-stone-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">Occupancy Forecast</h3>
          <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </span>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-stone-400 mb-1">
              <span>Tomorrow</span>
              <span className="font-semibold text-white">{occupancy?.tomorrow}%</span>
            </div>
            <div className="w-full bg-stone-800 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${occupancy?.tomorrow || 0}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm text-stone-400 mb-1">
              <span>Next 7 Days Avg</span>
              <span className="font-semibold text-white">{occupancy?.next7Days}%</span>
            </div>
            <div className="w-full bg-stone-800 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${occupancy?.next7Days || 0}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm text-stone-400 mb-1">
              <span>Next 30 Days Avg</span>
              <span className="font-semibold text-white">{occupancy?.next30Days}%</span>
            </div>
            <div className="w-full bg-stone-800 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${occupancy?.next30Days || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-stone-500 block">Peak Days:</span>
              <span className="text-stone-300 font-medium">{occupancy?.peakDays?.join(', ') || 'None'}</span>
            </div>
            <div>
              <span className="text-stone-500 block">Low Days:</span>
              <span className="text-stone-300 font-medium">{occupancy?.lowOccupancyDays?.join(', ') || 'None'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Projection */}
      <div className="bg-stone-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">Revenue Projection</h3>
          <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v1m0-1V7m0 5h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <span className="text-sm text-stone-400">Daily Forecast</span>
            <span className="text-base font-semibold text-white">INR {revenue?.dailyRevenue.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <span className="text-sm text-stone-400">Weekly Forecast</span>
            <span className="text-base font-semibold text-white">INR {revenue?.weeklyRevenue.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <span className="text-sm text-stone-400">Monthly Forecast</span>
            <span className="text-base font-semibold text-white">INR {revenue?.monthlyRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Inventory Alerts */}
      <div className="bg-stone-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">Inventory Restock Forecast</h3>
          <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </span>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-48 scrollbar-thin">
          {inventory.length === 0 ? (
            <div className="text-center py-8 text-stone-500 text-sm">
              All inventory levels stable.
            </div>
          ) : (
            inventory.map(item => (
              <div key={item.id} className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-rose-500/10">
                <div>
                  <span className="text-sm font-medium text-stone-200 block">{item.name}</span>
                  <span className="text-xs text-stone-500">Qty: {item.quantity} (Min: {item.minQuantity})</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-rose-400 block">{item.estimatedDaysRemaining} days left</span>
                  <span className="text-[10px] text-stone-400">Restock: {item.suggestedRestockDate}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
