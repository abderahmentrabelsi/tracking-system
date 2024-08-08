// components/UserAnalyticsMap.tsx

import React from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import country from 'country-list-js'
import geoUrl from './custom.geo.json'


interface AnalyticsData {
  country: string
  activeUsers: number
}

interface UserAnalyticsMapProps {
  data: AnalyticsData[]
}

const getCountryCode = (countryName: string): string | undefined => {
  const c = country.findByName(countryName)
  return c?.code.iso2
}

const UserAnalyticsMap: React.FC<UserAnalyticsMapProps> = ({ data }) => {
  const countryData = data.reduce<Record<string, number>>((acc, item) => {
    const code = getCountryCode(item.country)
    if (!code) return acc
    if (!acc[code]) {
      acc[code] = 0
    }
    acc[code] += item.activeUsers
    return acc
  }, {})

  return (
    <div>
      <ComposableMap>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map(geo => {
              const countryCode = geo.properties.ISO_A2
              const activeUsers = countryData[countryCode] || 0
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={activeUsers > 0 ? '#F53' : '#DDD'}
                  onMouseEnter={() => {
                    const { NAME } = geo.properties
                    console.log(`Country: ${NAME}, Active Users: ${activeUsers}`)
                  }}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: '#F53', outline: 'none' },
                    pressed: { outline: 'none' }
                  }}
                />
              )
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  )
}

export default UserAnalyticsMap
