'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import { useColorScheme, useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// Third-party Imports
import type { ApexOptions } from 'apexcharts'

// Type Imports
import type { SystemMode } from '@core/types'

// Util Imports
import { rgbaToHex } from '@/utils/rgbaToHex'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const EventCountByPagePathChart = ({ data, serverMode }: { data: { pagePath: string, eventCount: number }[], serverMode: SystemMode }) => {
  // Hooks
  const theme = useTheme()
  const { mode } = useColorScheme()

  // Vars
  const _mode = (mode === 'system' ? serverMode : mode) || serverMode
  const divider = rgbaToHex(`rgb(${theme.mainColorChannels[_mode]} / 0.12)`)
  const disabledText = rgbaToHex(`rgb(${theme.mainColorChannels[_mode]} / 0.4)`)

  const pagePaths = data.map(item => item.pagePath);
  const eventCounts = data.map(item => item.eventCount);

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
      parentHeightOffset: 0,
      toolbar: { show: false },
      offsetX: theme.direction === 'rtl' ? 10 : -10
    },
    plotOptions: {
      bar: { columnWidth: '40%' }
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      categories: pagePaths,
      axisBorder: { show: false },
      axisTicks: { color: divider },
      crosshairs: {
        stroke: { color: divider }
      },
      labels: {
        style: { colors: disabledText, fontSize: '13px' }
      }
    },
    yaxis: {
      title: { text: 'Event Count' },
      tooltip: { enabled: true },
      crosshairs: {
        stroke: { color: divider }
      },
      labels: {
        style: { colors: disabledText, fontSize: '13px' }
      }
    },
    fill: { opacity: 1 },
    tooltip: {
      y: { formatter: (val: number) => `${val}` }
    },
    colors: [theme.palette.primary.main],
    legend: {
      labels: { colors: disabledText },
      itemMargin: { horizontal: 9 }
    },
    grid: {
      padding: { top: -10 },
      borderColor: divider,
      xaxis: {
        lines: { show: true }
      }
    }
  };

  return (
    <Card>
      <CardHeader
        title='Event Count by Page Path'
        subheader='Number of events for each page path'
        sx={{
          flexDirection: ['column', 'row'],
          alignItems: ['flex-start', 'center'],
          '& .MuiCardHeader-action': { mb: 0 },
          '& .MuiCardHeader-content': { mb: [2, 0] }
        }}
      />
      <CardContent>
        <AppReactApexCharts type='bar' width='100%' height={400} options={options} series={[{ name: 'Events', data: eventCounts }]} />
      </CardContent>
    </Card>
  )
}

export default EventCountByPagePathChart
