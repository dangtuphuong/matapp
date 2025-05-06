import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logoImage from "../img/logo.png"; 

export const exportElementToPDF = async (element, filename = "document.pdf", margin = 10) => {
  const canvas = await html2canvas(element, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  // Create a new jsPDF instance
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pageWidth - margin * 2;
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  // Add the main content
  pdf.addImage(imgData, "PNG", margin, margin, pdfWidth, pdfHeight);

  // Load and add watermark logo
  const logo = new Image();
  logo.src = logoImage;

  // Wait for the logo to load before adding it to the PDF
  logo.onload = () => {
    const logoWidth = 80;
    const logoHeight = 80;
    const centerX = (pageWidth - logoWidth) / 2;
    const centerY = (pdf.internal.pageSize.getHeight() - logoHeight) / 2;

    pdf.setGState(new pdf.GState({ opacity: 0.08 }));
    pdf.addImage(logo, "PNG", centerX, centerY, logoWidth, logoHeight);
    pdf.save(filename);
  };
};
