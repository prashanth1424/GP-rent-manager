import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPDF = async (elementId, filename) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error("Element not found:", elementId);
    return;
  }

  // Clone the element to render it properly in the viewport
  const clone = element.cloneNode(true);
  document.body.appendChild(clone);
  
  clone.style.display = 'block';
  clone.style.position = 'absolute';
  clone.style.left = '0';
  clone.style.top = '0';
  clone.style.zIndex = '-1';

  try {
    const canvas = await html2canvas(clone, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error("html2canvas generated an empty canvas");
    }

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    
    // Calculate dimensions (A4 size: 210 x 297 mm)
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
  } finally {
    // Cleanup clone
    document.body.removeChild(clone);
  }
};
