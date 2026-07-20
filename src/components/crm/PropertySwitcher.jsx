import React, { useState, useEffect } from 'react';
import { PropertyService } from '../../services/properties/PropertyService';

export default function PropertySwitcher() {
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(() => {
    return localStorage.getItem('crm_selected_property_id') || 'all';
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    async function fetchPropertiesList() {
      try {
        const list = await PropertyService.getProperties();
        setProperties(list);
      } catch (err) {
        console.error("Failed to load properties list", err);
      }
    }
    fetchPropertiesList();
  }, []);

  const handlePropertySelect = (propertyId) => {
    setSelectedPropertyId(propertyId);
    localStorage.setItem('crm_selected_property_id', propertyId);
    setDropdownOpen(false);
    
    // Dispatch a global event so that other mounted components (e.g., CrmDashboard, CrmLayout) know to refresh
    window.dispatchEvent(new Event('crmPropertyScopeChanged'));
  };

  const getSelectedPropertyName = () => {
    if (selectedPropertyId === 'all') return 'All Properties';
    const prop = properties.find(p => p.id === selectedPropertyId);
    return prop ? prop.property_name : 'Selected Resort';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 dark:bg-stone-850 hover:bg-stone-200/60 dark:hover:bg-stone-800/80 border border-stone-200 dark:border-stone-750 text-xs font-semibold rounded-lg text-stone-700 dark:text-stone-300 transition-colors"
      >
        <svg className="w-4 h-4 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span>{getSelectedPropertyName()}</span>
        <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
          <div className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xl z-50 overflow-hidden font-sans">
            <div className="px-3 py-2 border-b border-stone-100 dark:border-stone-800">
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Select Resort Scope</span>
            </div>
            <div className="py-1 max-h-60 overflow-y-auto">
              <button
                onClick={() => handlePropertySelect('all')}
                className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-stone-50 dark:hover:bg-stone-800/50 flex items-center justify-between ${selectedPropertyId === 'all' ? 'text-brand-gold bg-brand-gold/5' : 'text-stone-700 dark:text-stone-300'}`}
              >
                <span>All Properties (Consolidated)</span>
                {selectedPropertyId === 'all' && (
                  <svg className="w-4 h-4 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              {properties.map(prop => (
                <button
                  key={prop.id}
                  onClick={() => handlePropertySelect(prop.id)}
                  className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-stone-50 dark:hover:bg-stone-800/50 flex items-center justify-between ${selectedPropertyId === prop.id ? 'text-brand-gold bg-brand-gold/5' : 'text-stone-700 dark:text-stone-300'}`}
                >
                  <div>
                    <span className="block font-semibold">{prop.property_name}</span>
                    <span className="block text-[9px] text-stone-400 font-normal">{prop.location}</span>
                  </div>
                  {selectedPropertyId === prop.id && (
                    <svg className="w-4 h-4 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
