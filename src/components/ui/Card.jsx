import React from 'react';
import styles from './Card.module.css';

export const Card = ({ children, className = '', isActive = false, onClick, ...props }) => {
  const classes = [
    styles.card,
    isActive ? styles.active : '',
    onClick ? styles.interactive : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
};
