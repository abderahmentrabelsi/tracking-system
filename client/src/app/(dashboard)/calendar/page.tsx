// src/app/(dashboard)/calendar/page.tsx
import { checkAuth } from '@/utils/checkAuth';
import CalendarPage from '@/views/calendar/CalendarPage';

const Calendar = async () => {
  checkAuth();

  return (
    <div>
      <CalendarPage />
    </div>
  );
};

export default Calendar;
