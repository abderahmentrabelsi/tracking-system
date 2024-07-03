'use client';
import React, { useEffect, useState } from 'react';
import {
  getTimesheet,
  checkIn,
  checkOut,
  getTasksByUserId,
} from '@/app/api/timesheetApi';
import {
  CheckInData,
  WorkHours,
  TaskType,
} from '@/types/timesheetTypes';
import './Employee.css';

const EmployeeDashboard: React.FC = () => {
  const [workHours, setWorkHours] = useState<WorkHours[]>([]);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [checkInData, setCheckInData] = useState<CheckInData>({
    userID: 0,
    taskID: null,
    workType: '',
    location: '',
    comments: '',
  });
  const [currentSession, setCurrentSession] = useState<WorkHours | null>(null);
  const [userID, setUserID] = useState<number | null>(null);

  useEffect(() => {
    const storedUserID = localStorage.getItem('userID');
    if (storedUserID) {
      const id = parseInt(storedUserID, 10);
      setUserID(id);
      fetchTimesheet(id);
      fetchTasks(id);
    }
  }, []);

  const fetchTimesheet = async (id: number) => {
    try {
      const timesheet = await getTimesheet(id);
      setWorkHours(timesheet);
      const ongoingSession = timesheet.find((wh) => !wh.Checkout);
      setCurrentSession(ongoingSession || null);
    } catch (error) {
      console.error('Error fetching timesheet:', error);
    }
  };

  const fetchTasks = async (id: number) => {
    try {
      const tasks = await getTasksByUserId(id);
      setTasks(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCheckInData({ ...checkInData, [e.target.name]: e.target.value });
  };

  const handleCheckIn = async () => {
    if (userID) {
      try {
        const newCheckInData = { ...checkInData, userID };
        const checkedInSession = await checkIn(newCheckInData);
        setCurrentSession(checkedInSession);
        fetchTimesheet(userID);
      } catch (error) {
        console.error('Error checking in:', error);
      }
    }
  };

  const handleCheckOut = async () => {
    if (currentSession) {
      try {
        await checkOut({ workHoursID: currentSession.ID });
        setCurrentSession(null);
        if (userID) {
          fetchTimesheet(userID);
        }
      } catch (error) {
        console.error('Error checking out:', error);
      }
    }
  };

  const formatDuration = (start: string) => {
    const startTime = new Date(start).getTime();
    const currentTime = new Date().getTime();
    const duration = Math.floor((currentTime - startTime) / 1000);
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="timesheet-dashboard">
      <h1>Employee Timesheet Dashboard</h1>

      <div className="check-in-section">
        <h2>Normal Work Check-In</h2>
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
        <button onClick={handleCheckIn}>Check In</button>
      </div>

      <div className="task-timer-section">
        <h2>Task Timer</h2>
        <select
          name="taskID"
          onChange={(e) => setCheckInData({ ...checkInData, taskID: parseInt(e.target.value, 10) })}
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

      {currentSession && (
        <div className="current-session">
          <h2>Current Session</h2>
          <p>Check-in: {new Date(currentSession.Checkin).toLocaleString()}</p>
          <p>Elapsed Time: {formatDuration(currentSession.Checkin)}</p>
          <button onClick={handleCheckOut}>Check Out</button>
        </div>
      )}

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
    </div>
  );
};

export default EmployeeDashboard;
