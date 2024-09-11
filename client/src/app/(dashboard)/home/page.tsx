'use client'

import Grid from '@mui/material/Grid'

import country from 'country-list-js'
import { useGetAnalyticsData } from '@/qore-api/qoreComponents'
import WebsiteAnalyticsSlider from '@views/analytics/WebsiteAnalyticsSlider'
import { pluck } from '@/utils/generic-utils'
import LineAreaDailySalesChart from '@views/analytics/charts/LineAreaDailySalesChart'
import SalesByCountries from '@views/analytics/SalesByCountries'
import TimeSeriesChart from '@views/analytics/TimeSeriesChart'
import DeviceCategoryChart from '@views/analytics/DeviceChart' // Import the Device Category Chart component
import EventCountByPagePathChart from '@views/analytics/EventCountByPagePathChart' // Import the Event Count by Page Path Chart component
import AverageSessionDurationByPagePathChart from '@views/analytics/AverageSessionDurationByPagePathChart' // Import the Average Session Duration by Page Path Chart component
import EventCountChart from '@views/analytics/EventCountChart'
import UserAnalyticsMap from '@views/analytics/UserAnalyticsMap' // Import the Event Count Chart component

// Helper function to get the country code from country name
function getCountryCode(countryName: string) {
  const c = country.findByName(countryName)
  console.log(c)
  return c?.code.iso2
}

export default function Page() {
  const { data, status, isLoading, isError, error } = useGetAnalyticsData({})
  console.log(data)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!data || !data.analyticsData || !data.aggregateMetrics) {
    return <div>No data</div>
  }

  if (error) {
    return <div>Error: {error.payload.toString()}</div>
  }

  const analyticsData = pluck(data.aggregateMetrics, [
    'totalConversions' as never,
    'totalRevenue' as never,
    'averageBounceRate' as never
  ])

  // Aggregate event counts by page path
  const pagePathEventCountMap = data.analyticsData.reduce((acc: any, item: any) => {
    if (!acc[item.pagePath]) {
      acc[item.pagePath] = 0
    }

    acc[item.pagePath] += item.eventCount

    return acc
  }, {})

  const aggregatedEventData = Object.keys(pagePathEventCountMap).map(pagePath => ({
    pagePath,
    eventCount: pagePathEventCountMap[pagePath]
  }))

  // Aggregate average session duration by page path
  const pagePathSessionDataMap = data.analyticsData.reduce((acc: any, item: any) => {
    if (!acc[item.pagePath]) {
      acc[item.pagePath] = { totalDuration: 0, sessionCount: 0 }
    }

    acc[item.pagePath].totalDuration += item.averageSessionDuration * item.sessions
    acc[item.pagePath].sessionCount += item.sessions

    return acc
  }, {})

  const aggregatedSessionData = Object.keys(pagePathSessionDataMap).map(pagePath => ({
    pagePath,
    averageSessionDuration:
      pagePathSessionDataMap[pagePath].totalDuration / pagePathSessionDataMap[pagePath].sessionCount
  }))

  // Aggregate event counts for specific events
  const eventCountMap = data.analyticsData.reduce((acc: any, item: any) => {
    const eventTypes = ['page_view', 'form_start', 'scroll', 'session_start', 'first_visit']

    eventTypes.forEach(event => {
      if (!acc[event]) {
        acc[event] = 0
      }

      acc[event] += item.eventCount // Assuming item.eventCount includes the count for all types of events, adjust accordingly if there's a breakdown
    })

    return acc
  }, {})

  const aggregatedEventCounts = Object.keys(eventCountMap).map(event => ({
    event,
    count: eventCountMap[event]
  }))

  const userAnalyticsData = data.analyticsData.map((item: any) => ({
    country: item.country,
    region: item.region,
    city: item.city,
    activeUsers: item.activeUsers,
    screenPageViews: item.screenPageViews, // Include this for the chart
    date: item.date, // Include this for the chart
    deviceCategory: item.deviceCategory, // Include device category
    pagePath: item.pagePath, // Include page path for Event Count chart
    eventCount: item.eventCount, // Include event count for Event Count chart
    averageSessionDuration: item.averageSessionDuration, // Include average session duration
    countryCode: getCountryCode(item.country)
  }))

  return (
    <Grid container spacing={3} justifyContent='center' alignItems='stretch'>
      {/* First line divided into two sections */}
      <Grid container item xs={12} lg={12} spacing={3}>
        <Grid item xs={6} lg={6}>
          <WebsiteAnalyticsSlider metrics={analyticsData} />
        </Grid>
        <Grid item xs={6} lg={6}>
          <TimeSeriesChart data={userAnalyticsData} serverMode={'light'} />
        </Grid>
      </Grid>

      {/* Remaining sections */}
      <Grid container item xs={12} lg={12} spacing={3}>
        <Grid item xs={4} lg={4}>
          <LineAreaDailySalesChart
            title={'Growth'}
            subtitle={'Total New Users'}
            value={data.aggregateMetrics.totalNewUsers!.toString()}
          />
        </Grid>
        <Grid item xs={4} lg={4}>
          <SalesByCountries data={userAnalyticsData} />
        </Grid>
        <Grid item xs={4} lg={4}>
          <DeviceCategoryChart data={userAnalyticsData} serverMode={'light'} />
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <UserAnalyticsMap data={userAnalyticsData} />
      </Grid>

      <Grid item xs={6} lg={6}>
        <EventCountByPagePathChart data={aggregatedEventData} serverMode={'light'} />
      </Grid>
      <Grid item xs={6} lg={6}>
        <AverageSessionDurationByPagePathChart data={aggregatedSessionData} serverMode={'light'} />
      </Grid>
    </Grid>
  )
}
