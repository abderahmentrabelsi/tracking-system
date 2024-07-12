export const getEventColor = (priority: string) => {
  switch (priority) {
    case 'High':
      return '#f44336'; // red
    case 'Medium':
      return '#ff9800'; // orange
    case 'Low':
      return '#4caf50'; // green
    default:
      return '#2196f3'; // blue
  }
};

export const formatDate = (date: string) => {
  return new Date(date).toLocaleString();
};
