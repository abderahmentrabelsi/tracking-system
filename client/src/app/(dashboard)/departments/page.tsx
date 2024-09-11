// app/views/departments/page.tsx
import { checkAuth } from '../../../utils/checkAuth'
import Departments from '@views/departments'

const DepartmentsPage = async () => {
  checkAuth()

  return <Departments />
}

export default DepartmentsPage
