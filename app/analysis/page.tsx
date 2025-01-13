'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import MoodMap from '@/components/heatmap';
import RegionFilter from '@/components/regionfilter';
import { fetchSentimentData } from '@/services/sentimentService';
import { 
  Globe, RefreshCw, X, Users, ArrowLeft,
  MapPin, TrendingUp, Share2
} from 'lucide-react';
import type { SentimentData, FilterOptions } from '@/types';

const ALL_COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Angola', 'Argentina', 'Armenia', 'Australia', 
  'Austria', 'Azerbaijan', 'Bangladesh', 'Belarus', 'Belgium', 'Benin', 'Bolivia', 
  'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Bulgaria', 'Burkina Faso', 
  'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 
  'Chile', 'China', 'Colombia', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 
  'Czech Republic', 'Democratic Republic of the Congo', 'Denmark', 'Dominican Republic', 
  'Ecuador', 'Egypt', 'El Salvador', 'Eritrea', 'Estonia', 'Ethiopia', 'Finland', 
  'France', 'Gabon', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Guatemala', 'Guinea', 
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 
  'Ireland', 'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 
  'Kazakhstan', 'Kenya', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 
  'Lesotho', 'Liberia', 'Libya', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 
  'Malaysia', 'Mali', 'Mauritania', 'Mexico', 'Moldova', 'Mongolia', 'Montenegro', 
  'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nepal', 'Netherlands', 
  'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 
  'Norway', 'Oman', 'Pakistan', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 
  'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 
  'Saudi Arabia', 'Senegal', 'Serbia', 'Sierra Leone', 'Singapore', 'Slovakia', 
  'Slovenia', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 
  'Sri Lanka', 'Sudan', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 
  'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tunisia', 'Turkey', 'Turkmenistan', 
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 
  'Uruguay', 'Uzbekistan', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

const chunkArray = <T,>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export default function SentimentPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [sentimentData, setSentimentData] = useState<SentimentData>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: ALL_COUNTRIES.length });
  const [mounted, setMounted] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadSentimentData = async (countries: string[] = []) => {
    setLoading(true);
    setError(null);
    
    const targetCountries = countries.length > 0 ? countries : ALL_COUNTRIES;
    setProgress({ current: 0, total: targetCountries.length });
    
    const allSentimentData: SentimentData = {};
    const CHUNK_SIZE = 5;
    const chunks = chunkArray(targetCountries, CHUNK_SIZE);

    try {
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const options: FilterOptions = {
          locations: chunk
        };

        try {
          const response = await fetchSentimentData(options);
          if (response.data) {
            Object.entries(response.data).forEach(([country, data]) => {
              if (typeof data === 'number') {
                allSentimentData[country] = {
                  score: data,
                  sources: {
                    reddit: {
                      count: 0,
                      subreddits: []
                    },
                  }
                };
              } else {
                allSentimentData[country] = data;
              }
            });
          }
          setProgress({
            current: Math.min((i + 1) * CHUNK_SIZE, targetCountries.length),
            total: targetCountries.length
          });
        } catch (err) {
          console.warn(`Failed to fetch data for chunk ${i}:`, err);
          chunk.forEach(country => {
            allSentimentData[country] = {
              score: 0,
              sources: {
                reddit: { count: 0, subreddits: [] }
              }
            };
          });
        }
      }
      setSentimentData(allSentimentData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sentiment data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSentimentData(selectedCountries);
  }, [selectedCountries]);

  const handleCountryClick = (countryName: string) => {
    setSelectedCountry(prevCountry => 
      prevCountry === countryName ? null : countryName
    );
    const sentiment = sentimentData[countryName];
    if (sentiment) {
      console.log(`Sentiment for ${countryName}:`, sentiment);
    }
  };

  const handleRefreshClick = () => {
    loadSentimentData(selectedCountries);
  };

  const handleRegionChange = (countries: string[], continent?: string | null) => {
    setSelectedCountries(countries);
    setSelectedContinent(continent ?? null);
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-blue-500/20 to-teal-500/20 blur-3xl -top-40 -right-40 animate-pulse" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-3xl -bottom-40 -left-40 animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(16,185,129,0.1),transparent)]" />
        <div className="absolute inset-0 bg-white/50 backdrop-blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 relative">
        <div className={`transition-all duration-1000 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-green-500 bg-clip-text text-transparent">
                <img src="/logo.png" className='w-24' />
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefreshClick}
                disabled={loading}
                className="flex items-center px-6 py-2.5 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-full hover:shadow-lg disabled:opacity-50 transition-all hover:-translate-y-0.5 hover:scale-105"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Loading...' : 'Refresh Data'}
              </button>
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-teal-500/10 to-green-500/10 border border-teal-500/20">
                <span className="text-sm text-teal-700">
                  {Object.keys(sentimentData).length} countries loaded
                </span>
              </div>
            </div>
          </div>

          <div className="relative mb-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-4 z-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <RegionFilter
                  selectedCountries={selectedCountries}
                  onSelectionChange={handleRegionChange}
                  className="w-72"
                />
                {selectedCountries.length > 0 && (
                  <button
                    onClick={() => setSelectedCountries([])}
                    className="text-sm text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    View All Countries
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  <span>Global View</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>Hover over country for details</span>
                </div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="mb-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-teal-100 shadow-sm p-6">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between text-teal-700">
                  <span className="flex items-center">
                    <Globe className="w-5 h-5 mr-2 animate-pulse" />
                    Loading sentiment data...
                  </span>
                  <span className="font-medium">{progress.current} of {progress.total}</span>
                </div>
                <div className="w-full bg-teal-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-500 to-green-500 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50/50 backdrop-blur-sm rounded-2xl border border-red-100 shadow-sm p-6 text-red-700">
              {error}
            </div>
          )}
          
          <div className="relative z-10 bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform transition-all duration-500 hover:shadow-2xl">
            <div className="p-6">
              <MoodMap 
                sentimentData={sentimentData} 
                loading={loading}
                onCountryClick={handleCountryClick}
                selectedCountries={selectedCountries}
                selectedContinent={selectedContinent}
              />
            </div>
          </div>
          {selectedCountry && sentimentData[selectedCountry] && (
            <div className="mt-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedCountry} Analysis
                </h2>
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Sentiment Score</span>
                    <TrendingUp className="w-5 h-5 text-teal-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mt-2">
                    {sentimentData[selectedCountry].score.toFixed(2)}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Data Sources</span>
                    <Share2 className="w-5 h-5 text-teal-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mt-2">
                    {sentimentData[selectedCountry].sources.reddit.count || 'N/A'}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Active Communities</span>
                    <Users className="w-5 h-5 text-teal-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mt-2">
                    {sentimentData[selectedCountry].sources.reddit.subreddits.length || 'N/A'}
                  </div>
                </div>
              </div>

              {sentimentData[selectedCountry].sources.reddit.subreddits.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Active Communities</h3>
                  <div className="flex flex-wrap gap-2">
                    {sentimentData[selectedCountry].sources.reddit.subreddits.map((subreddit, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm"
                      >
                        r/{subreddit}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {[
              {
                title: 'Global Coverage',
                value: `${Object.keys(sentimentData).length} Countries`,
                icon: <Globe className="w-6 h-6" />,
                color: 'from-blue-500 to-teal-500'
              },
              {
                title: 'Average Sentiment',
                value: Object.values(sentimentData).length > 0
                  ? ((Object.values(sentimentData)
                      .filter(data => data?.score !== undefined)
                      .reduce((acc, curr) => acc + (curr.score * 100), 0) / 
                    Object.values(sentimentData)
                      .filter(data => data?.score !== undefined)
                      .length
                    ).toFixed(1) + '%')
                  : 'N/A',
                icon: <TrendingUp className="w-6 h-6" />,
                color: 'from-teal-500 to-green-500'
              },
              {
                title: 'Total Data Points',
                value: Object.values(sentimentData).reduce((acc, curr) => acc + (curr.sources.reddit.count || 0), 0).toLocaleString(),
                icon: <Share2 className="w-6 h-6" />,
                color: 'from-green-500 to-emerald-500'
              }
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6 transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} p-0.5`}>
                    <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                      {stat.icon}
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                </div>
                <h3 className="text-gray-500">{stat.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}