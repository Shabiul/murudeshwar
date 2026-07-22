import React from 'react';
import classNames from 'classnames';

/**
 * Shared Status Badge for Vehicle Rentals (Bikes & Cars)
 */
export default function RentalStatusBadge({ status }) {
  const normalized = (status || '').toLowerCase();

  const getStatusStyles = () => {
    switch (normalized) {
      case 'available':
      case 'complete':
      case 'completed':
      case 'repaired':
      case 'closed':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      
      case 'reserved':
      case 'confirmation':
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      
      case 'on trip':
      case 'pickup':
      case 'in progress':
      case 'trip':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      
      case 'vehicle inspection':
      case 'inspection':
      case 'inspection pending':
      case 'pending review':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      
      case 'maintenance':
      case 'scheduled':
      case 'repairing':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      
      case 'returned':
      case 'invoice':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800';

      default:
        return 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-200 dark:border-stone-700';
    }
  };

  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
        getStatusStyles()
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {status || 'Unknown'}
    </span>
  );
}
