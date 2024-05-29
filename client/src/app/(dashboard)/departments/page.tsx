import Departments from '@views/departments'
import type { DepartmentRowType } from '@/types/departmentTypes'

const getData = async () => {
  const res = await fetch('https://api.example.com/apps/departments') // replace with your static URL

  if (!res.ok) {
    throw new Error('Failed to fetch department data')
  }

  return res.json()
}

const DepartmentsApp = async () => {
  // Static department data for testing purposes
  const staticDepartmentsData: DepartmentRowType[] = [
    {
      id: 1,
      name: 'Human Resources',
      supervisorId: 1,
      createdDate: '2023-01-01'
    },
    {
      id: 2,
      name: 'Engineering',
      supervisorId: 2,
      createdDate: '2023-02-01'
    }
    // Add more departments as needed
  ]

  // Use static data instead of fetching from the API
  const data: DepartmentRowType[] = staticDepartmentsData

  return <Departments departmentsData={data} />
}

export default DepartmentsApp
