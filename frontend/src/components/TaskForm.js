import React, { useState, useEffect } from 'react';

const TaskForm = ({ addTask, updateTask, editTask, setShowForm }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    file: null
  });

  const [filePreview, setFilePreview] = useState('');

  useEffect(() => {
    if (editTask) {
      setFormData({
        title: editTask.title || '',
        description: editTask.description || '',
        status: editTask.status || 'pending',
        file: null
      });
    }
  }, [editTask]);

  const { title, description, status } = formData;

  const onChange = e => {
    const { name, value, files } = e.target;
    
    if (name === 'file' && files.length > 0) {
      setFormData({ ...formData, file: files[0] });
      
      // Create preview URL for the file
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const onSubmit = e => {
    e.preventDefault();
    if (editTask) {
      updateTask(editTask.id, formData);
    } else {
      addTask(formData);
    }
  };

  return (
    <div className="form-container" style={{ margin: '20px 0' }}>
      <h3>{editTask ? 'Edit Task' : 'Add New Task'}</h3>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={onChange}
            rows="4"
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={status}
            onChange={onChange}
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="file">Attachment</label>
          <input
            type="file"
            id="file"
            name="file"
            onChange={onChange}
          />
        </div>
        
        {filePreview && (
          <div style={{ marginBottom: '15px' }}>
            <p>File Preview:</p>
            <img src={filePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
          </div>
        )}
        
        {editTask && editTask.file_url && !filePreview && (
          <div style={{ marginBottom: '15px' }}>
            <p>Current File:</p>
            <a href={editTask.file_url} target="_blank" rel="noreferrer">View attached file</a>
          </div>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button type="submit">
            {editTask ? 'Update Task' : 'Add Task'}
          </button>
          <button type="button" onClick={() => {
            setShowForm(false);
          }} style={{ background: '#6c757d' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
