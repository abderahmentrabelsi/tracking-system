// Page.tsx
'use client'

import { useGetAnalyticsData } from '@/qore-api/qoreComponents';
import WebsiteAnalyticsSlider from '@views/analytics/WebsiteAnalyticsSlider';
import Grid from '@mui/material/Grid';
import { pluck } from '@/utils/generic-utils';
import LineAreaDailySalesChart from '@views/analytics/charts/LineAreaDailySalesChart';
import SalesByCountries from '@views/analytics/SalesByCountries';
import TimeSeriesChart from '@views/analytics/TimeSeriesChart'; // Import the updated component

// Helper function to get the country code from country name
const getCountryCode = (countryName: string) => {
  const countryCodes: { [key: string]: string } = {
    Italy: 'it',
    Tunisia: 'tn',
    // Add other country codes here
  };
  return countryCodes[countryName] || 'us'; // Default to 'us' if country not found
};

export default function Page() {
  const { data, status, isLoading, isError, error } = useGetAnalyticsData({});

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!data) {
    return <div>No data</div>;
  }

  if (error) {
    return <div>Error: {error.payload.toString()}</div>;
  }

  const analyticsData = pluck(data.aggregateMetrics, ['totalConversions', 'totalRevenue', 'averageBounceRate']);
  // @ts-ignore
  const userAnalyticsData = data.analyticsData.map((item: any) => ({
    country: item.country,
    region: item.region,
    city: item.city,
    activeUsers: item.activeUsers,
    screenPageViews: item.screenPageViews, // Include this for the chart
    date: item.date, // Include this for the chart
    countryCode: getCountryCode(item.country),
  }));

  return (
    <Grid container spacing={6}>
      <Grid item xs={6} lg={6}>
        <WebsiteAnalyticsSlider metrics={analyticsData} />
      </Grid>
      <Grid item xs={3} lg={3}>
        <LineAreaDailySalesChart title={'Growth'} subtitle={'Total New Users'} value={data.aggregateMetrics.totalNewUsers} />
      </Grid>
      <Grid item xs={3} lg={3}>
        <SalesByCountries data={userAnalyticsData} />
      </Grid>
      <Grid item xs={12}>
        <TimeSeriesChart data={userAnalyticsData} serverMode={'light'} /> {/* Pass the data to the updated component */}
      </Grid>

    </Grid>
  );
}
