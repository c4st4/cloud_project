import React from 'react';
import config from '../config';

const TaskList = ({ tasks, onDelete, onEdit }) => {
  if (tasks.length === 0) {
    return <p>No tasks found. Create a new task to get started!</p>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#28a745';
      case 'in-progress':
        return '#ffc107';
      default:
        return '#dc3545';
    }
  };

  return (
    <div>
      {tasks.map((task) => (
        <div key={task.id} className="task-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>{task.title}</h3>
            <div style={{ 
              backgroundColor: getStatusColor(task.status),
              color: task.status === 'in-progress' ? '#000' : '#fff',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              {task.status}
            </div>
          </div>
          
          <p>{task.description}</p>
          
          {task.file_url && (
            <div style={{ marginTop: '10px' }}>
              <a 
                href={`${config.apiUrl}${task.file_url}`} 
                target="_blank" 
                rel="noreferrer"
                style={{ 
                  display: 'inline-block',
                  textDecoration: 'none',
                  color: '#4285f4'
                }}
              >
                View Attachment
              </a>
            </div>
          )}
          
          <div className="task-actions">
            <button 
              style={{ background: '#6c757d' }}
              onClick={() => onEdit(task)}
            >
              Edit
            </button>
            <button 
              style={{ background: '#dc3545' }}
              onClick={() => onDelete(task.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
