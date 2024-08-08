import Card from '@mui/material/Card'
import { useColorScheme, useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import dynamic from 'next/dynamic'
import type { ApexOptions } from 'apexcharts'
import type { SystemMode } from '@core/types'
import { rgbaToHex } from '@/utils/rgbaToHex'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const donutColors = {
  desktop: '#fdd835',
  mobile: '#00d4bd',
  tablet: '#826bf8',
}

const DeviceCategoryChart = ({ data, serverMode }: { data: { deviceCategory: string }[], serverMode: SystemMode }) => {
  const theme = useTheme()
  const { mode } = useColorScheme()

  const deviceCategories = data.reduce((acc: { [key: string]: number }, item) => {
    acc[item.deviceCategory] = (acc[item.deviceCategory] || 0) + 1;
    return acc;
  }, {});

  const series = Object.values(deviceCategories);
  const labels = Object.keys(deviceCategories);

  const _mode = (mode === 'system' ? serverMode : mode) || serverMode
  const textSecondary = rgbaToHex(`rgb(${theme.mainColorChannels[_mode]} / 0.7)`)

  const options: ApexOptions = {
    stroke: { width: 0 },
    labels,
    colors: labels.map(label => donutColors[label]),
    dataLabels: {
      enabled: true,
      formatter: (val: string) => `${parseInt(val, 10)}%`
    },
    legend: {
      fontSize: '13px',
      position: 'bottom',
      markers: {
        offsetX: theme.direction === 'rtl' ? 7 : -4
      },
      labels: { colors: textSecondary },
      itemMargin: {
        horizontal: 9
      }
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              fontSize: '1.2rem'
            },
            value: {
              fontSize: '1.2rem',
              color: textSecondary,
              formatter: (val: string) => `${parseInt(val, 10)}`
            },
            total: {
              show: true,
              fontSize: '1.2rem',
              label: 'Total',
              formatter: () => `${series.reduce((a, b) => a + b, 0)}`,
              color: rgbaToHex(`rgb(${theme.mainColorChannels[_mode]} / 0.9)`)
            }
          }
        }
      }
    },
    responsive: [
      {
        breakpoint: 992,
        options: {
          chart: {
            height: 380
          },
          legend: {
            position: 'bottom'
          }
        }
      },
      {
        breakpoint: 576,
        options: {
          chart: {
            height: 320
          },
          plotOptions: {
            pie: {
              donut: {
                labels: {
                  show: true,
                  name: {
                    fontSize: '1rem'
                  },
                  value: {
                    fontSize: '1rem'
                  },
                  total: {
                    fontSize: '1rem'
                  }
                }
              }
            }
          }
        }
      }
    ]
  }

  return (
    <Card
      sx={{
        transition: 'transform 0.3s',
        '&:hover': {
          transform: 'scale(1.05)',
        },
      }}
    >
      <CardHeader title='Device Category Distribution' subheader='Distribution of users by device category' />
      <CardContent>
        <AppReactApexCharts type='donut' width='100%' height={430} options={options} series={series} />
      </CardContent>
    </Card>
  )
}

export default DeviceCategoryChart
