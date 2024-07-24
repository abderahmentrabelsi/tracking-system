// src/app/dashboard/page.tsx
import { checkAuth } from '@/utils/checkAuth';
import TaskDashboard from '@/views/tasks';

const DashboardPage: React.FC = async () => {
  checkAuth();

  return <TaskDashboard />;
};

export default DashboardPage;
