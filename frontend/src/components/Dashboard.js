import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import config from '../config';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  // Fetch tasks from API
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${config.apiUrl}/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setTasks(res.data);
      setIsLoading(false);
    } catch (err) {
      setError('Error fetching tasks');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (newTask) => {
    try {
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      Object.keys(newTask).forEach(key => {
        formData.append(key, newTask[key]);
      });
      
      const res = await axios.post(
        `${config.apiUrl}/api/tasks`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setTasks([res.data, ...tasks]);
      setShowForm(false);
    } catch (err) {
      setError('Failed to add task');
    }
  };

  const updateTask = async (id, updatedTask) => {
    try {
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      Object.keys(updatedTask).forEach(key => {
        formData.append(key, updatedTask[key]);
      });
      
      const res = await axios.put(
        `${config.apiUrl}/api/tasks/${id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setTasks(tasks.map(task => task.id === id ? res.data : task));
      setEditTask(null);
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const deleteTask = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${config.apiUrl}/api/tasks/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setShowForm(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Dashboard</h2>
        <button onClick={() => {
          setShowForm(!showForm);
          if (editTask) setEditTask(null);
        }}>
          {showForm ? 'Cancel' : 'Add New Task'}
        </button>
      </div>
      
      {user && (
        <p>Welcome, {user.username}!</p>
      )}
      
      {error && <div className="alert alert-error">{error}</div>}
      
      {showForm && (
        <TaskForm 
          addTask={addTask} 
          updateTask={updateTask} 
          editTask={editTask}
          setShowForm={setShowForm}
        />
      )}
      
      {isLoading ? (
        <p>Loading tasks...</p>
      ) : (
        <TaskList 
          tasks={tasks} 
          onDelete={deleteTask} 
          onEdit={handleEdit} 
        />
      )}
    </div>
  );
};

export default Dashboard;
