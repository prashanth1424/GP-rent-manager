import React from 'react';
import styles from './Badge.module.css';

export const Badge = ({ variant = 'pending', children, className = '' }) => {
  const variantClass = styles[variant] || styles.pending;
  
  return (
    <span className={`${styles.badge} ${variantClass} ${className}`}>
      {children}
    </span>
  );
};
