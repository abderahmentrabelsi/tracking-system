// app/views/attendance/page.tsx
import { checkAuth } from '@/utils/checkAuth';
import LeaveTrackerPage from '@/views/attendance/leavetracker';

const App = async () => {
  checkAuth();

  return <LeaveTrackerPage />;
};

export default App;
