// src/app/management/tasks/page.tsx
import { checkAuth } from '@/utils/checkAuth'
import ManagerDashboard from '@/views/Management/tasks/Manager'

const App = async () => {
  checkAuth()

  return <ManagerDashboard />
}

export default App
