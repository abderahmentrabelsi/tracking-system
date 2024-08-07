"use client";

import { useGetAnalyticsData } from '@/qore-api/qoreComponents';

export default function AnalyticsComponent() {
  const { data, status, isLoading, isError, error  } = useGetAnalyticsData({});

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.payload.toString()}</div>;
  }

  return (
    <div>
      <h1>Analytics Page</h1>
      {data && (
        <>
          {data.aggregateMetrics && (
            <div>
              <h2>Aggregate Metrics</h2>
              <ul>
                {data.aggregateMetrics.averageBounceRate !== undefined && (
                  <li>Average Bounce Rate: {data.aggregateMetrics.averageBounceRate}</li>
                )}
                {data.aggregateMetrics.averageSessionDuration !== undefined && (
                  <li>Average Session Duration: {data.aggregateMetrics.averageSessionDuration}</li>
                )}
                {data.aggregateMetrics.topCityByActiveUsers && (
                  <li>Top City By Active Users: {data.aggregateMetrics.topCityByActiveUsers}</li>
                )}
                {data.aggregateMetrics.topPageByScreenPageViews && (
                  <li>Top Page By Screen Page Views: {data.aggregateMetrics.topPageByScreenPageViews}</li>
                )}
                {data.aggregateMetrics.topRegionByRevenue && (
                  <li>Top Region By Revenue: {data.aggregateMetrics.topRegionByRevenue}</li>
                )}
                {data.aggregateMetrics.totalActiveUsers !== undefined && (
                  <li>Total Active Users: {data.aggregateMetrics.totalActiveUsers}</li>
                )}
                {data.aggregateMetrics.totalConversions !== undefined && (
                  <li>Total Conversions: {data.aggregateMetrics.totalConversions}</li>
                )}
                {data.aggregateMetrics.totalEventCount !== undefined && (
                  <li>Total Event Count: {data.aggregateMetrics.totalEventCount}</li>
                )}
                {data.aggregateMetrics.totalNewUsers !== undefined && (
                  <li>Total New Users: {data.aggregateMetrics.totalNewUsers}</li>
                )}
                {data.aggregateMetrics.totalRevenue !== undefined && (
                  <li>Total Revenue: {data.aggregateMetrics.totalRevenue}</li>
                )}
                {data.aggregateMetrics.totalScreenPageViews !== undefined && (
                  <li>Total Screen Page Views: {data.aggregateMetrics.totalScreenPageViews}</li>
                )}
                {data.aggregateMetrics.totalSessions !== undefined && (
                  <li>Total Sessions: {data.aggregateMetrics.totalSessions}</li>
                )}
              </ul>
            </div>
          )}
          {data.analyticsData && (
            <div>
              <h2>Analytics Data</h2>
              <ul>
                {data.analyticsData.map((item, index) => (
                  <li key={index}>
                    <h3>Data {index + 1}</h3>
                    {item.activeUsers !== undefined && <p>Active Users: {item.activeUsers}</p>}
                    {item.averageSessionDuration !== undefined && (
                      <p>Average Session Duration: {item.averageSessionDuration}</p>
                    )}
                    {item.bounceRate !== undefined && <p>Bounce Rate: {item.bounceRate}</p>}
                    {item.city && <p>City: {item.city}</p>}
                    {item.conversions !== undefined && <p>Conversions: {item.conversions}</p>}
                    {item.country && <p>Country: {item.country}</p>}
                    {item.deviceCategory && <p>Device Category: {item.deviceCategory}</p>}
                    {item.eventCount !== undefined && <p>Event Count: {item.eventCount}</p>}
                    {item.newUsers !== undefined && <p>New Users: {item.newUsers}</p>}
                    {item.pagePath && <p>Page Path: {item.pagePath}</p>}
                    {item.region && <p>Region: {item.region}</p>}
                    {item.revenue !== undefined && <p>Revenue: {item.revenue}</p>}
                    {item.screenPageViews !== undefined && (
                      <p>Screen Page Views: {item.screenPageViews}</p>
                    )}
                    {item.sessions !== undefined && <p>Sessions: {item.sessions}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
