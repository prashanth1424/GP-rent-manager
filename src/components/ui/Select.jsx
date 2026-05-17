import React from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './Select.module.css';

export const Select = React.forwardRef(({ 
  label, 
  error, 
  options = [], 
  className = '', 
  containerClassName = '',
  ...props 
}, ref) => {
  return (
    <div className={`${styles.container} ${containerClassName}`}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.selectWrapper}>
        <select 
          ref={ref}
          className={`${styles.select} ${error ? styles.error : ''} ${className}`} 
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className={styles.icon} />
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
});

Select.displayName = 'Select';
