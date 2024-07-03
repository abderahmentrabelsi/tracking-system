import React from 'react';
import { WorkHours } from '@/types/timesheetTypes';

interface TimesheetHistoryProps {
  workHours: WorkHours[];
}

const TimesheetHistory: React.FC<TimesheetHistoryProps> = ({ workHours }) => {
  return (
    <div className="timesheet-history-section">
      <h2>Check-In/Check-Out History</h2>
      {workHours.map((wh) => (
        <div key={wh.ID} className="timesheet-entry">
          <p>Check-in: {new Date(wh.Checkin).toLocaleString()}</p>
          <p>Check-out: {wh.Checkout ? new Date(wh.Checkout).toLocaleString() : 'Not checked out'}</p>
          <p>Duration: {wh.Duration} hours</p>
          <p>Work Type: {wh.WorkType}</p>
          <p>Location: {wh.Location}</p>
          <p>Comments: {wh.Comments}</p>
        </div>
      ))}
    </div>
  );
};

export default TimesheetHistory;
