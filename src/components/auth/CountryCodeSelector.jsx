import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦' },
  { code: '+251', country: 'Ethiopia', flag: '🇪🇹' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
  { code: '+1', country: 'Jamaica', flag: '🇯🇲' },
  { code: '+1876', country: 'Jamaica', flag: '🇯🇲' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+966', flag: '🇸🇦', country: 'Saudi Arabia' },
  { code: '+213', country: 'Algeria', flag: '🇩🇿' },
  { code: '+216', country: 'Tunisia', flag: '🇹🇳' },
  { code: '+260', country: 'Zambia', flag: '🇿🇲' },
  { code: '+263', country: 'Zimbabwe', flag: '🇿🇼' },
  { code: '+265', country: 'Malawi', flag: '🇲🇼' },
  { code: '+358', country: 'Finland', flag: '🇫🇮' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
];

export default function CountryCodeSelector({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedCountry = COUNTRY_CODES.find(c => c.code === value) || COUNTRY_CODES[0];
  
  const filtered = COUNTRY_CODES.filter(c =>
    c.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.includes(searchTerm)
  );

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition"
      >
        <span className="flex items-center gap-2">
          <span>{selectedCountry.flag}</span>
          <span className="font-semibold">{selectedCountry.code}</span>
          <span className="text-sm text-gray-500">{selectedCountry.country}</span>
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg">
          <input
            type="text"
            placeholder="Search country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border-b border-gray-200 focus:outline-none"
          />
          <div className="max-h-64 overflow-y-auto">
            {filtered.map((country) => (
              <button
                key={`${country.code}-${country.country}`}
                onClick={() => {
                  onChange(country.code);
                  setIsOpen(false);
                  setSearchTerm('');
                  localStorage.setItem('lastCountryCode', country.code);
                }}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition flex items-center gap-2"
              >
                <span>{country.flag}</span>
                <span>{country.country}</span>
                <span className="ml-auto text-gray-500 font-semibold">{country.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}