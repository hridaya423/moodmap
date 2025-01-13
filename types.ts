export interface Position {
  coordinates: [number, number];
  zoom: number;
}

export interface ContentItem {
  text: string;
  source: 'reddit';
  timestamp: Date;
  url?: string;
  author?: string;
  location: string;
  language?: string;
}

export interface SentimentResult {
  score: number;
  confidence: number;
}

export interface SourceData {
  count: number;
  sites?: string[];
  subreddits?: string[];
}

export interface CountrySentiment {
  score: number;
  sources: {
    reddit: {
      count: number;
      subreddits: string[];
    };
  };
}

export interface SentimentData {
  [country: string]: CountrySentiment;
}

export interface FilterOptions {
  startDate?: Date;
  endDate?: Date;
  keywords?: string[];
  locations?: string[];
}

export interface SentimentResponse {
  data: SentimentData;
  timestamp: string;
  status: 'success' | 'error' | 'partial';
  errors?: string[];
}

export interface MoodMapProps {
  sentimentData: SentimentData;
  onCountryClick?: (name: string) => void;
  loading?: boolean;
}

export interface RegionFilterProps {
  selectedCountries: string[];
  onSelectionChange: (countries: string[]) => void;
  className?: string;
}

export type ContinentType = {
  [key: string]: string[];
};

export interface CountryData {
  name: string;
  continent: string;
}

export interface FilterState {
  searchTerm: string;
  selectedContinent: string | null;
  isOpen: boolean;
}

export interface CityData {
  name: string;
  subreddits: string[];
  population?: number;
}

export interface CountryData {
  name: string;
  cities: CityData[];
  generalSubreddits: string[];
  languages?: string[];
}

export interface ContinentData {
  name: string;
  countries: string[];
  generalSubreddits: string[];
}