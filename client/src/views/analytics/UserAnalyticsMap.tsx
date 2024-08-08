import React from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import country from 'country-list-js';
import geoUrl from './custom.geo.json';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // Import Tippy's CSS
import { Card, CardHeader, CardContent } from '@mui/material';

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
    <Card>
      <CardHeader
        title="User Analytics Map"
        subheader="Distribution of active users across different countries"
      />
      <CardContent>
        <ComposableMap projection="geoMercator" projectionConfig={{ scale: 150 }}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryCode = geo.properties.iso_a2;
                const activeUsers = countryData[countryCode] || 0;
                const countryName = geo.properties.name;

                return (
                  <Tippy
                    key={geo.rsmKey}
                    content={`Country: ${countryName}, Active Users: ${activeUsers}`}
                    placement="top" // You can adjust this to place the tooltip where you prefer
                    arrow={false} // Optionally remove the arrow
                  >
                    <Geography
                      geography={geo}
                      fill={activeUsers > 0 ? '#F53' : '#DDD'}
                      style={{
                        default: { outline: 'none' },
                        hover: { fill: '#F53', outline: 'none' },
                        pressed: { outline: 'none' },
                      }}
                    />
                  </Tippy>
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </CardContent>
    </Card>
  );
};

export default UserAnalyticsMap;
