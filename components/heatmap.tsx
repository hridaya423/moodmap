/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useCallback, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from "react-simple-maps";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Position } from '@/types';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const CONTINENT_COORDINATES: { [key: string]: { coordinates: [number, number]; zoom: number } } = {
  'North America': { coordinates: [-100, 40], zoom: 2 },
  'South America': { coordinates: [-60, -15], zoom: 2 },
  'Europe': { coordinates: [15, 50], zoom: 4 },
  'Asia': { coordinates: [90, 30], zoom: 2 },
  'Africa': { coordinates: [20, 0], zoom: 2 },
  'Oceania': { coordinates: [130, -20], zoom: 3 }
};

const COUNTRY_COORDINATES: { [key: string]: { coordinates: [number, number]; zoom: number } } = {
  'United States': { coordinates: [-95, 40], zoom: 3 },
  'Russia': { coordinates: [90, 65], zoom: 2 },
  'China': { coordinates: [105, 35], zoom: 3 },
  'Brazil': { coordinates: [-55, -15], zoom: 3 },
  'Australia': { coordinates: [133, -25], zoom: 3 },
  'India': { coordinates: [80, 22], zoom: 3 },
  'Canada': { coordinates: [-95, 60], zoom: 2.5 },
  'United Kingdom': { coordinates: [-2, 54], zoom: 5 },
  'France': { coordinates: [2, 47], zoom: 5 },
  'Germany': { coordinates: [10, 51], zoom: 5 },
  'Japan': { coordinates: [138, 38], zoom: 4 },
  'South Africa': { coordinates: [25, -29], zoom: 4 },
};

const MOOD_COLORS = {
  VERY_POSITIVE: '#00aa00',
  POSITIVE: '#66bb66',
  NEUTRAL: '#ffd700',
  NEGATIVE: '#bb6666',
  VERY_NEGATIVE: '#aa0000',
  NO_DATA: '#e5e7eb'
};

interface MoodMapProps {
  sentimentData: {
    [key: string]: {
      score: number;
      sources: {
        reddit: {
          count: number;
          subreddits: string[];
        };
      };
    };
  };
  onCountryClick?: (name: string) => void;
  loading?: boolean;
  selectedCountries?: string[];
  selectedContinent?: keyof typeof CONTINENT_COORDINATES | null;
}

const MoodMap: React.FC<MoodMapProps> = ({
  sentimentData = {},
  onCountryClick,
  loading = false,
  selectedCountries = [],
  selectedContinent = null
}) => {
  const [position, setPosition] = useState<Position>({ coordinates: [0, 0], zoom: 1 });
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (isTransitioning) return;

    const updatePosition = async () => {
      setIsTransitioning(true);

      let newPosition: Position = { coordinates: [0, 0], zoom: 1 };

      if (selectedContinent && CONTINENT_COORDINATES[selectedContinent]) {
        newPosition = CONTINENT_COORDINATES[selectedContinent];
      } else if (selectedCountries.length === 1) {
        const country = selectedCountries[0];
        if (COUNTRY_COORDINATES[country]) {
          newPosition = COUNTRY_COORDINATES[country];
        }
      }

      setPosition(prev => ({
        ...prev,
        ...newPosition,
        transition: true
      }));
      setTimeout(() => setIsTransitioning(false), 1000);
    };

    updatePosition();
  }, [selectedContinent, selectedCountries]);

  const getSentimentColor = useCallback((sentiment: number | undefined): string => {
    if (sentiment === undefined) return MOOD_COLORS.NO_DATA;
    
    if (sentiment >= 0.4) return MOOD_COLORS.VERY_POSITIVE;
    if (sentiment > 0) return MOOD_COLORS.POSITIVE;
    if (sentiment === 0) return MOOD_COLORS.NEUTRAL;
    if (sentiment >= -0.4) return MOOD_COLORS.NEGATIVE;
    return MOOD_COLORS.VERY_NEGATIVE;
  }, []);

  const getSentimentLabel = (score: number): string => {
    if (score >= 0.4) return 'Very Positive';
    if (score > 0) return 'Positive';
    if (score === 0) return 'Neutral';
    if (score >= -0.4) return 'Negative';
    return 'Very Negative';
  };

  const handleMoveEnd = (position: Position) => {
    if (!isTransitioning) {
      setPosition(position);
    }
  };

  const formatTooltipContent = (countryName: string | null) => {
    if (!countryName) return null;

    const data = sentimentData[countryName];
    if (!data) {
      return (
        <div className="p-2">
          <span className="text-gray-500">No sentiment data for {countryName}</span>
        </div>
      );
    }

    const { score, sources } = data;
    const { reddit } = sources;

    return (
      <div className="space-y-2 p-2 max-w-md">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">{countryName}</span>
          <Badge variant={score >= 0 ? "secondary" : "destructive"}>
            {getSentimentLabel(score)} ({(score * 100).toFixed(1)}%)
          </Badge>
        </div>
        
        <div className="text-sm space-y-1">
          {reddit.count > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              <span className="font-medium">Reddit Activity:</span>
              <span>{reddit.count} posts from</span>
              <div className="flex flex-wrap gap-1">
                {reddit.subreddits.slice(0, 3).map((sub) => (
                  <Badge key={sub} variant="secondary">
                    r/{sub}
                  </Badge>
                ))}
                {reddit.subreddits.length > 3 && (
                  <span className="text-gray-500">
                    +{reddit.subreddits.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">MoodMap</span>
            <span className="text-sm text-gray-500">Global Sentiment Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-[600px]">
            <ComposableMap
              projectionConfig={{
                rotate: [-10, 0, 0],
                scale: 147
              }}
              width={980}
              height={551}
            >
              <ZoomableGroup
                zoom={position.zoom}
                center={position.coordinates}
                maxZoom={8}
                minZoom={1}
                onMoveEnd={handleMoveEnd}
                translateExtent={[[-180, -90], [180, 90]]}
              >
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const countryName = geo.properties?.name || null;
                      const countryData = countryName ? sentimentData[countryName] : null;
                      const sentiment = countryData?.score;
                      const isSelected = selectedCountries.includes(countryName || '');
                      
                      return (
                        <Tooltip key={geo.rsmKey}>
                          <TooltipTrigger asChild>
                            <Geography
                              geography={geo}
                              fill={getSentimentColor(sentiment)}
                              stroke="#FFF"
                              strokeWidth={0.5}
                              onClick={() => countryName && onCountryClick?.(countryName)}
                              onMouseEnter={() => setHoveredCountry(countryName)}
                              onMouseLeave={() => setHoveredCountry(null)}
                              style={{
                                default: { 
                                  outline: "none",
                                  opacity: selectedCountries.length === 0 || isSelected ? 1 : 0.3,
                                  transition: 'all 250ms'
                                },
                                hover: { 
                                  outline: "none", 
                                  fill: "#F53",
                                  opacity: 1,
                                  transition: 'all 250ms',
                                  cursor: 'pointer'
                                },
                                pressed: { outline: "none" }
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            {formatTooltipContent(countryName)}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {Object.entries({
              'Very Positive (≥40%)': MOOD_COLORS.VERY_POSITIVE,
              'Positive (>0%)': MOOD_COLORS.POSITIVE,
              'Neutral (0%)': MOOD_COLORS.NEUTRAL,
              'Negative (<0%)': MOOD_COLORS.NEGATIVE,
              'Very Negative (≤-40%)': MOOD_COLORS.VERY_NEGATIVE,
              'No Data': MOOD_COLORS.NO_DATA
            }).map(([label, color]) => (
              <div key={label} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default MoodMap;