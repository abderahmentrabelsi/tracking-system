import React from 'react';
import { CheckInData, TaskType } from '@/types/timesheetTypes';

interface TaskTimerProps {
  tasks: TaskType[];
  checkInData: CheckInData;
  handleCheckInChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleCheckIn: () => void;
}

const TaskTimer: React.FC<TaskTimerProps> = ({ tasks, checkInData, handleCheckInChange, handleCheckIn }) => {
  return (
    <div className="task-timer-section">
      <h2>Task Timer</h2>
      <select
        name="taskID"
        onChange={(e) => handleCheckInChange(e as React.ChangeEvent<HTMLSelectElement>)}
      >
        <option value="">Select Task</option>
        {tasks.map((task) => (
          <option key={task.ID} value={task.ID}>
            {task.title}
          </option>
        ))}
      </select>
      <input
        type="text"
        name="workType"
        placeholder="Work Type"
        value={checkInData.workType}
        onChange={handleCheckInChange}
      />
      <input
        type="text"
        name="location"
        placeholder="Location"
        value={checkInData.location}
        onChange={handleCheckInChange}
      />
      <input
        type="text"
        name="comments"
        placeholder="Comments"
        value={checkInData.comments}
        onChange={handleCheckInChange}
      />
      <button onClick={handleCheckIn}>Start Task Timer</button>
    </div>
  );
};

export default TaskTimer;
