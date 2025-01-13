/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

interface Position {
  coordinates: [number, number];
  zoom: number;
  label: string;
}

interface MapPreviewProps {
  activeFeature: number;
}

interface SentimentData {
  [countryName: string]: number;
}

interface GeographyFeature {
  rsmKey: string;
  properties: {
    name: string;
    [key: string]: any;
  };
}

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const DEMO_POSITIONS: Position[] = [
  { coordinates: [0, 0], zoom: 1, label: 'Global' },
  { coordinates: [15, 50], zoom: 4, label: 'Regional' },
  { coordinates: [-100, 40], zoom: 3, label: 'Local' }
];

const DEMO_SENTIMENT: SentimentData = {
  'United States': 0.8,
  'Canada': 0.6,
  'United Kingdom': 0.7,
  'France': 0.5,
  'Germany': 0.6,
  'China': -0.3,
  'Japan': 0.4,
  'Australia': 0.5,
  'Brazil': 0.2,
  'India': 0.1,
  'Russia': -0.2
};

const MapPreview: React.FC<MapPreviewProps> = ({ activeFeature }) => {
  const [position, setPosition] = useState<Position>(DEMO_POSITIONS[0]);

  useEffect(() => {
    setPosition(DEMO_POSITIONS[activeFeature]);
  }, [activeFeature]);

  const getSentimentColor = (countryName: string): string => {
    const sentiment = DEMO_SENTIMENT[countryName];
    if (sentiment === undefined) return '#e5e7eb';
    if (sentiment > 0.5) return '#00aa00';
    if (sentiment > 0) return '#66bb66';
    if (sentiment === 0) return '#ffd700';
    return '#bb6666';
  };

  return (
    <div className="w-full h-full">
      <ComposableMap
        projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 147
        }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          maxZoom={8}
          minZoom={1}
          translateExtent={[[-180, -90], [180, 90]]}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo: GeographyFeature) => {
                const countryName = geo.properties?.name;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getSentimentColor(countryName)}
                    stroke="#FFF"
                    strokeWidth={0.5}
                    style={{
                      default: {
                        outline: "none",
                        transition: 'all 250ms'
                      },
                      hover: {
                        outline: "none",
                        fill: "#F53",
                        transition: 'all 250ms',
                        cursor: 'pointer'
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default MapPreview;