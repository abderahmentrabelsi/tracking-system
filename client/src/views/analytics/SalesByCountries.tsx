// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Third-party Imports
import classnames from 'classnames'

// Components Imports
import OptionMenu from '@core/components/option-menu'

// Helper function to get the country flag URL from the API
const getCountryFlagUrl = (countryCode: string) => {
  return `https://flagcdn.com/48x36/${countryCode}.png`
}

type DataType = {
  country: string
  region: string
  city: string
  activeUsers: number
  countryCode: string
}

type SalesByCountriesProps = {
  data: DataType[]
}

const SalesByCountries = ({ data }: SalesByCountriesProps) => {
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.country]) {
      acc[item.country] = { entries: [], totalActiveUsers: 0 }
    }
    acc[item.country].entries.push(item)
    acc[item.country].totalActiveUsers += item.activeUsers
    return acc
  }, {} as Record<string, { entries: DataType[], totalActiveUsers: number }>)

  return (
    <Card>
      <CardHeader
        title='User Activity by Country'
        subheader='Analytics Overview according to Active users'
        action={<OptionMenu options={['Last Week', 'Last Month', 'Last Year']} />}
      />
      <CardContent className='flex flex-col gap-[1.0875rem]'>
        {Object.entries(groupedData).map(([country, data], index) => (
          <div key={index} className='mb-4'>
            <div className='flex items-center gap-2'>
              <img src={getCountryFlagUrl(data.entries[0].countryCode)} alt={country} width={34} />
              <Typography variant='h6' color='text.primary'>
                {country}
              </Typography>
              <Typography variant='body2'>Total Active Users: {data.totalActiveUsers}</Typography>
            </div>
            {data.entries.map((item, idx) => (
              <div key={idx} className='flex justify-between items-center gap-4 ml-4'>
                <div className='flex flex-col'>
                  <Typography className='font-medium' color='text.primary'>
                    {item.region} - {item.city}
                  </Typography>
                </div>
                <div className='flex flex-col items-center'>
                  <i
                    className={classnames(
                      item.activeUsers < 0 ? 'tabler-chevron-down text-error' : 'tabler-chevron-up text-success',
                      'text-xl'
                    )}
                  />
                  <Typography
                    variant='h6'
                    color={`${item.activeUsers < 0 ? 'error' : 'success'}.main`}
                  >{`${item.activeUsers}`}</Typography>
                  <Typography variant='body2'>Active Users</Typography>
                </div>
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default SalesByCountries
