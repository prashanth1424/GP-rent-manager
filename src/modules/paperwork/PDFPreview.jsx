import React from 'react';
import styles from './PDFPreview.module.css';

export const PDFPreview = ({ id, children }) => {
  return (
    <div className={styles.hiddenContainer}>
      <div id={id} className={styles.pdfDocument}>
        {children}
      </div>
    </div>
  );
};
