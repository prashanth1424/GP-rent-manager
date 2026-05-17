import React from 'react';
import styles from './Input.module.css';

export const Input = React.forwardRef(({ 
  label, 
  error, 
  className = '', 
  containerClassName = '',
  ...props 
}, ref) => {
  return (
    <div className={`${styles.container} ${containerClassName}`}>
      {label && <label className={styles.label}>{label}</label>}
      <input 
        ref={ref}
        className={`${styles.input} ${error ? styles.error : ''} ${className}`} 
        {...props} 
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
