import React, { useState, useMemo } from 'react';
import { Check, ChevronDown, X, Globe, Search } from 'lucide-react';
import type { ContinentType } from '@/types';

const CONTINENTS: ContinentType = {
  'North America': [
    'United States', 'Canada', 'Mexico', 'Guatemala', 'Cuba', 'Haiti', 'Dominican Republic',
    'Honduras', 'Nicaragua', 'El Salvador', 'Costa Rica', 'Panama', 'Jamaica'
  ],
  'South America': [
    'Brazil', 'Argentina', 'Peru', 'Colombia', 'Venezuela', 'Chile', 'Ecuador', 'Bolivia',
    'Paraguay', 'Uruguay'
  ],
  'Europe': [
    'United Kingdom', 'France', 'Germany', 'Italy', 'Spain', 'Ukraine', 'Poland', 'Romania',
    'Netherlands', 'Belgium', 'Greece', 'Czech Republic', 'Portugal', 'Sweden', 'Hungary',
    'Austria', 'Switzerland', 'Bulgaria', 'Denmark', 'Finland', 'Slovakia', 'Norway',
    'Ireland', 'Croatia', 'Moldova', 'Bosnia and Herzegovina', 'Albania', 'Lithuania',
    'North Macedonia', 'Slovenia', 'Latvia', 'Estonia', 'Montenegro', 'Luxembourg', 'Iceland',
    'Russia', 'Belarus', 'Serbia'
  ],
  'Asia': [
    'China', 'India', 'Indonesia', 'Pakistan', 'Bangladesh', 'Japan', 'Philippines',
    'Vietnam', 'Turkey', 'Iran', 'Thailand', 'Myanmar', 'South Korea', 'Iraq', 'Afghanistan',
    'Saudi Arabia', 'Uzbekistan', 'Yemen', 'Malaysia', 'Nepal', 'North Korea', 'Sri Lanka',
    'Kazakhstan', 'Syria', 'Cambodia', 'Jordan', 'Azerbaijan', 'Laos', 'Lebanon', 'Singapore',
    'Mongolia', 'Kuwait', 'Armenia', 'Qatar', 'Timor-Leste', 'Cyprus', 'Kyrgyzstan',
    'Tajikistan', 'Israel', 'Turkmenistan', 'Georgia', 'United Arab Emirates'
  ],
  'Africa': [
    'Nigeria', 'Ethiopia', 'Egypt', 'Democratic Republic of the Congo', 'South Africa',
    'Tanzania', 'Kenya', 'Uganda', 'Algeria', 'Sudan', 'Morocco', 'Ghana', 'Mozambique',
    'Ivory Coast', 'Madagascar', 'Cameroon', 'Niger', 'Burkina Faso', 'Mali', 'Malawi',
    'Zambia', 'Senegal', 'Chad', 'Somalia', 'Zimbabwe', 'Guinea', 'Rwanda', 'Benin',
    'Burundi', 'Tunisia', 'South Sudan', 'Togo', 'Sierra Leone', 'Libya', 'Congo',
    'Liberia', 'Central African Republic', 'Mauritania', 'Eritrea', 'Namibia', 'Gambia',
    'Botswana', 'Gabon', 'Lesotho'
  ],
  'Oceania': [
    'Australia', 'Papua New Guinea', 'New Zealand', 'Fiji', 'Solomon Islands',
    'New Caledonia', 'French Polynesia', 'Samoa', 'Timor-Leste'
  ]
};

interface RegionFilterProps {
  selectedCountries: string[];
  onSelectionChange: (countries: string[], continent?: string | null) => void;
  className?: string;
}

const RegionFilter: React.FC<RegionFilterProps> = ({ 
  selectedCountries,
  onSelectionChange,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [lastSelectedContinent, setLastSelectedContinent] = useState<string | null>(null);

  const filteredCountries = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return Object.values(CONTINENTS)
      .flat()
      .filter(country => country.toLowerCase().includes(term));
  }, [searchTerm]);

  const handleContinentSelect = (continent: string): void => {
    const continentCountries = CONTINENTS[continent];
    const allSelected = continentCountries.every(country => 
      selectedCountries.includes(country)
    );
    
    if (allSelected) {
      onSelectionChange(
        selectedCountries.filter(country => !continentCountries.includes(country)),
        null
      );
      setLastSelectedContinent(null);
    } else {
      const newCountries = [...new Set([
        ...selectedCountries,
        ...continentCountries
      ])];
      onSelectionChange(newCountries, continent);
      setLastSelectedContinent(continent);
    }
  };

  const handleCountrySelect = (country: string): void => {
    let selectedContinent: string | null = null;

    for (const [continent, countries] of Object.entries(CONTINENTS)) {
      if (countries.includes(country)) {
        selectedContinent = continent;
        break;
      }
    }

    if (selectedCountries.includes(country)) {
      const newCountries = selectedCountries.filter(c => c !== country);
      onSelectionChange(
        newCountries,
        newCountries.length === 0 ? null : lastSelectedContinent
      );
    } else {
      const newCountries = [...selectedCountries, country];
      onSelectionChange(
        newCountries,
        newCountries.length === 1 ? selectedContinent : lastSelectedContinent
      );
      if (newCountries.length === 1) {
        setLastSelectedContinent(selectedContinent);
      }
    }
  };

  const isContinentSelected = (continent: string): boolean => {
    const continentCountries = CONTINENTS[continent];
    return continentCountries.every(country => selectedCountries.includes(country));
  };

  const isContinentPartiallySelected = (continent: string): boolean => {
    const continentCountries = CONTINENTS[continent];
    return continentCountries.some(country => selectedCountries.includes(country)) &&
           !continentCountries.every(country => selectedCountries.includes(country));
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 flex items-center justify-between bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
      >
        <div className="flex items-center">
          <Globe className="w-5 h-5 text-gray-500 mr-2" />
          <span className="text-gray-700">
            {selectedCountries.length === 0 ? "Select Regions" : 
             `${selectedCountries.length} ${selectedCountries.length === 1 ? 'Region' : 'Regions'} Selected`}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[80vh] overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(80vh-4rem)]">
            {searchTerm && (
              <div className="p-2 space-y-1">
                {filteredCountries.map(country => (
                  <button
                    key={country}
                    onClick={() => handleCountrySelect(country)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md flex items-center justify-between group"
                  >
                    <span className="text-gray-700">{country}</span>
                    <span className={`w-5 h-5 rounded-md border flex items-center justify-center
                      ${selectedCountries.includes(country) 
                        ? 'bg-teal-500 border-teal-500 text-white' 
                        : 'border-gray-300 group-hover:border-teal-500'}`}
                    >
                      {selectedCountries.includes(country) && <Check className="w-4 h-4" />}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {!searchTerm && Object.entries(CONTINENTS).map(([continent, countries]) => (
              <div key={continent} className="border-b border-gray-200 last:border-0">
                <button
                  onClick={() => handleContinentSelect(continent)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between font-medium"
                >
                  <span>{continent}</span>
                  <span className={`w-5 h-5 rounded-md border flex items-center justify-center
                    ${isContinentSelected(continent)
                      ? 'bg-teal-500 border-teal-500 text-white'
                      : isContinentPartiallySelected(continent)
                      ? 'bg-teal-100 border-teal-500'
                      : 'border-gray-300'}`}
                  >
                    {isContinentSelected(continent) && <Check className="w-4 h-4" />}
                  </span>
                </button>
                <div className="px-4 pb-2">
                  <div className="grid grid-cols-2 gap-1">
                    {countries.map(country => (
                      <button
                        key={country}
                        onClick={() => handleCountrySelect(country)}
                        className="px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-md flex items-center justify-between group"
                      >
                        <span className="text-gray-600">{country}</span>
                        <span className={`w-4 h-4 rounded-md border flex items-center justify-center
                          ${selectedCountries.includes(country)
                            ? 'bg-teal-500 border-teal-500 text-white'
                            : 'border-gray-300 group-hover:border-teal-500'}`}
                        >
                          {selectedCountries.includes(country) && <Check className="w-3 h-3" />}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  onSelectionChange([], null);
                  setLastSelectedContinent(null);
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionFilter;