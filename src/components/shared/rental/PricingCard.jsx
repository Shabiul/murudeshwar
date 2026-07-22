import React from 'react';

/**
 * Shared Pricing Breakdown Card for Rental Quotations
 */
export default function PricingCard({
  dailyRate,
  durationDays = 1,
  depositAmount = 1000,
  isChauffeur = false,
  chauffeurAllowance = 500,
  weekendMultiplier = 1.0
}) {
  const baseTotal = dailyRate * durationDays * weekendMultiplier;
  const chauffeurTotal = isChauffeur ? chauffeurAllowance * durationDays : 0;
  const grandTotal = baseTotal + chauffeurTotal;

  return (
    <div className="bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 rounded-2xl p-5 space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400">Pricing Breakdown</h4>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between text-stone-600 dark:text-stone-300">
          <span>Base Daily Rate (₹{dailyRate} × {durationDays} day{durationDays > 1 ? 's' : ''})</span>
          <span className="font-semibold font-mono">₹{(dailyRate * durationDays).toLocaleString('en-IN')}</span>
        </div>

        {weekendMultiplier > 1.0 && (
          <div className="flex justify-between text-amber-600 dark:text-amber-400">
            <span>Weekend Surge Rate (+{((weekendMultiplier - 1) * 100).toFixed(0)}%)</span>
            <span className="font-semibold font-mono">+₹{(dailyRate * durationDays * (weekendMultiplier - 1)).toLocaleString('en-IN')}</span>
          </div>
        )}

        {isChauffeur && (
          <div className="flex justify-between text-indigo-600 dark:text-indigo-400">
            <span>Chauffeur Allowance (₹{chauffeurAllowance} × {durationDays} day{durationDays > 1 ? 's' : ''})</span>
            <span className="font-semibold font-mono">+₹{chauffeurTotal.toLocaleString('en-IN')}</span>
          </div>
        )}

        <div className="flex justify-between text-stone-500 pt-2 border-t border-stone-200 dark:border-stone-700">
          <span>Refundable Security Deposit</span>
          <span className="font-mono">₹{depositAmount.toLocaleString('en-IN')}</span>
        </div>

        <div className="flex justify-between text-sm font-bold text-stone-900 dark:text-white pt-2 border-t border-stone-300 dark:border-stone-600">
          <span>Total Rental Charges</span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400">₹{grandTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
}
