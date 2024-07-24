// src/app/management/timesheet/page.tsx
import { checkAuth } from '@/utils/checkAuth';
import TimesheetManagement from '@/views/Management/timesheet';

const App = async () => {
  checkAuth();

  return <TimesheetManagement />;
};

export default App;
