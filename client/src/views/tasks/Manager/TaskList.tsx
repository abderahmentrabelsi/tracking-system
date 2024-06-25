import React from 'react';
import { List, ListItem, ListItemText } from '@mui/material';
import { TaskType } from '@/types/taskTypes';

interface TaskListProps {
  tasks: TaskType[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  return (
    <List>
      {tasks.map(task => (
        <ListItem key={task.ID}>
          <ListItemText primary={task.title} secondary={task.status} />
        </ListItem>
      ))}
    </List>
  );
};

export default TaskList;
