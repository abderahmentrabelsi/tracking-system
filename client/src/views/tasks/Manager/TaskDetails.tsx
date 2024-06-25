import React from 'react';
import { Card, CardContent, Typography, List, ListItem } from '@mui/material';
import { TaskType, CommentType } from '@/types/taskTypes';

interface TaskDetailsProps {
  task: TaskType;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ task }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5">{task.title}</Typography>
        <Typography variant="subtitle1">{task.description}</Typography>
        <Typography variant="subtitle2">Status: {task.status}</Typography>
        <Typography variant="subtitle2">Due Date: {task.dueDate}</Typography>
        <Typography variant="h6">Comments:</Typography>
        <List>
          {task.comments.map((comment: CommentType) => (
            <ListItem key={comment.ID}>
              <Typography variant="body2">{comment.content}</Typography>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default TaskDetails;
