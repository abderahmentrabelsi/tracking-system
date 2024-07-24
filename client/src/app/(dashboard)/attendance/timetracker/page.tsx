// app/views/attendance/page.tsx
import { checkAuth } from '@/utils/checkAuth';
import WorkHoursPage from '@/views/attendance/timetracker';

const App = async () => {
  checkAuth();

  return <WorkHoursPage />;
};

export default App;
