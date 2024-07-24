// app/views/attendance/page.tsx
import { checkAuth } from '@/utils/checkAuth';
import AttendancePage from '@/views/attendance';

const App = async () => {
  checkAuth();

  return <AttendancePage />;
};

export default App;
