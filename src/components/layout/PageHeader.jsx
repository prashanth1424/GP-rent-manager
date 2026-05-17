import React from 'react';
import styles from './PageHeader.module.css';

export const PageHeader = ({ title, actions }) => {
  return (
    <div className={styles.header}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{title}</h1>
        {actions && (
          <div className={styles.actions}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
