import React from 'react';
import { Button } from 'reactstrap'; // Usando componentes de Argon Dashboard
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const DownloadReportButton = ({ targetElementId, fileName = 'reporte.pdf' }) => {
  const handleDownloadPDF = () => {
    const input = document.getElementById(targetElementId);
    
    html2canvas(input, { 
      scale: 2, // Mejor calidad
      logging: false,
      useCORS: true,
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // Ancho A4 en mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(fileName);
    });
  };

  return (
    <Button color="primary" onClick={handleDownloadPDF}>
      Descargar Reporte
    </Button>
  );
};

export default DownloadReportButton;