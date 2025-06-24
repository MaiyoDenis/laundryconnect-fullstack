import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  text = '', 
  color = 'primary',
  className = '' 
}) => {
  return (
    <div className={`loading-spinner ${size} ${className}`}>
      <div className={`spinner ${color}`}></div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;