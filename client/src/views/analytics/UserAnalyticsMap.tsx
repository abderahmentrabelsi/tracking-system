import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import country from 'country-list-js';
import geoUrl from './custom.geo.json'; // Ensure this GeoJSON file has proper country data

interface AnalyticsData {
  country: string;
  activeUsers: number;
}

interface UserAnalyticsMapProps {
  data: AnalyticsData[];
}

// Helper function to get the country code from the country name
const getCountryCode = (countryName: string): string | undefined => {
  const c = country.findByName(countryName);
  return c?.code.iso2;
};

const UserAnalyticsMap: React.FC<UserAnalyticsMapProps> = ({ data }) => {
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  // Map country codes to active users
  const countryData = data.reduce<Record<string, number>>((acc, item) => {
    const code = getCountryCode(item.country);
    if (!code) return acc;
    if (!acc[code]) {
      acc[code] = 0;
    }
    acc[code] += item.activeUsers;
    return acc;
  }, {});

  return (
    <div style={{ position: 'relative' }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 150 }}
        onMouseMove={(e) => {
          setPosition({ x: e.clientX, y: e.clientY });
        }}
        onMouseLeave={() => {
          setTooltipContent(null);
          setPosition(null);
        }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const countryCode = geo.properties.iso_a2;
              const activeUsers = countryData[countryCode] || 0;
              const countryName = geo.properties.name;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={activeUsers > 0 ? '#F53' : '#DDD'}
                  onMouseEnter={() => {
                    setTooltipContent(`Country: ${countryName}, Active Users: ${activeUsers}`);
                  }}
                  onMouseLeave={() => {
                    setTooltipContent(null);
                  }}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: '#F53', outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      {tooltipContent && position && (
        <div
          style={{
            position: 'absolute',
            top: position.y + 15, // Adjusted closer to the cursor
            left: position.x + 15, // Adjusted closer to the cursor
            transform: 'translate(-50%, -50%)', // Adjusting to center the tooltip better relative to the cursor
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '5px',
            borderRadius: '3px',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );
};

export default UserAnalyticsMap;
