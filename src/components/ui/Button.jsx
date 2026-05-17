import React from 'react';
import styles from './Button.module.css';

export const Button = ({ 
  children, 
  variant = 'primary', 
  iconOnly = false,
  className = '', 
  ...props 
}) => {
  const classes = [
    styles.button,
    styles[variant],
    iconOnly ? styles.iconOnly : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
