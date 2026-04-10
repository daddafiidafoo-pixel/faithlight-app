import { PDFDocument, rgb, degrees } from 'pdf-lib';
import QRCode from 'qrcode';
import { base44 } from '@/api/base44Client';

/**
 * Generate professional PDF certificate
 */
export async function generateCertificatePDF(certificate, isVerified = false) {
  try {
    const pdfDoc = await PDFDocument.create();
    
    // Landscape A4 dimensions
    const page = pdfDoc.addPage([842, 595]); // A4 Landscape in points
    const { width, height } = page.getSize();

    // Colors
    const navyBlue = rgb(0.039, 0.122, 0.267); // #0A1F44
    const gold = rgb(0.784, 0.635, 0.298); // #C8A24C
    const darkGray = rgb(0.2, 0.2, 0.2);
    const lightGray = rgb(0.4, 0.4, 0.4);

    // Margins
    const marginX = 50;
    const marginY = 40;

    // Add subtle watermark
    if (isVerified) {
      page.drawText('✝️', {
        x: width / 2 - 30,
        y: height / 2 - 30,
        size: 200,
        opacity: 0.05,
        color: navyBlue,
      });
    }

    let yPosition = height - marginY;

    // 1. HEADER SECTION
    page.drawText('FAITHLIGHT SCHOOL OF BIBLICAL LEADERSHIP', {
      x: marginX,
      y: yPosition,
      size: 20,
      font: await pdfDoc.embedFont('Helvetica-Bold'),
      color: navyBlue,
      maxWidth: width - marginX * 2,
      align: 'center',
    });

    yPosition -= 18;

    page.drawText('Equipping Believers. Strengthening Leaders. Advancing the Gospel.', {
      x: marginX,
      y: yPosition,
      size: 10,
      font: await pdfDoc.embedFont('Helvetica'),
      color: darkGray,
      maxWidth: width - marginX * 2,
      align: 'center',
    });

    yPosition -= 18;

    // Gold divider line
    page.drawLine({
      start: { x: width / 2 - 60, y: yPosition },
      end: { x: width / 2 + 60, y: yPosition },
      thickness: 1.5,
      color: gold,
    });

    yPosition -= 20;

    // 2. TITLE
    const title = isVerified
      ? 'CERTIFICATE IN CHRISTIAN LEADERSHIP\n& THEOLOGICAL STUDIES'
      : 'CERTIFICATE OF COMPLETION';

    page.drawText(title, {
      x: marginX,
      y: yPosition,
      size: isVerified ? 18 : 20,
      font: await pdfDoc.embedFont('Helvetica-Bold'),
      color: navyBlue,
      maxWidth: width - marginX * 2,
      align: 'center',
      lineHeight: 20,
    });

    yPosition -= isVerified ? 50 : 45;

    // 3. BODY TEXT
    page.drawText('This certifies that', {
      x: marginX,
      y: yPosition,
      size: 12,
      font: await pdfDoc.embedFont('Helvetica'),
      color: darkGray,
      maxWidth: width - marginX * 2,
      align: 'center',
    });

    yPosition -= 20;

    // Student name with underline
    const nameWidth = width - marginX * 4;
    page.drawText(certificate.student_name, {
      x: marginX + nameWidth / 4,
      y: yPosition,
      size: 22,
      font: await pdfDoc.embedFont('Helvetica-Bold'),
      color: navyBlue,
      maxWidth: nameWidth,
      align: 'center',
    });

    yPosition -= 8;

    // Name underline
    page.drawLine({
      start: { x: marginX + 20, y: yPosition },
      end: { x: width - marginX - 20, y: yPosition },
      thickness: 2,
      color: isVerified ? gold : darkGray,
    });

    yPosition -= 22;

    // Body paragraph
    page.drawText('has successfully completed the prescribed program of study in', {
      x: marginX,
      y: yPosition,
      size: 11,
      font: await pdfDoc.embedFont('Helvetica'),
      color: darkGray,
      maxWidth: width - marginX * 2,
      align: 'center',
    });

    yPosition -= 18;

    page.drawText(certificate.program_name, {
      x: marginX,
      y: yPosition,
      size: 14,
      font: await pdfDoc.embedFont('Helvetica-Bold'),
      color: navyBlue,
      maxWidth: width - marginX * 2,
      align: 'center',
    });

    yPosition -= 18;

    page.drawText(
      'and has demonstrated understanding of Biblical doctrine,\nChristian leadership principles, and faithful ministry service\nin accordance with the teachings of Holy Scripture.',
      {
        x: marginX,
        y: yPosition,
        size: 11,
        font: await pdfDoc.embedFont('Helvetica'),
        color: darkGray,
        maxWidth: width - marginX * 2,
        align: 'center',
        lineHeight: 14,
      }
    );

    yPosition -= 50;

    // 4. SCRIPTURE
    page.drawText('"Be diligent to present yourself approved to God…"', {
      x: marginX,
      y: yPosition,
      size: 10,
      font: await pdfDoc.embedFont('Helvetica-Oblique'),
      color: lightGray,
      maxWidth: width - marginX * 2,
      align: 'center',
    });

    yPosition -= 14;

    page.drawText('— 2 Timothy 2:15', {
      x: marginX,
      y: yPosition,
      size: 9,
      font: await pdfDoc.embedFont('Helvetica-Oblique'),
      color: lightGray,
      maxWidth: width - marginX * 2,
      align: 'center',
    });

    yPosition -= 35;

    // 5. FOOTER SECTION
    // Divider line
    page.drawLine({
      start: { x: marginX, y: yPosition },
      end: { x: width - marginX, y: yPosition },
      thickness: 1,
      color: navyBlue,
    });

    yPosition -= 22;

    // Three column footer
    const colWidth = (width - marginX * 2) / 3;

    // Left: Date
    page.drawText('ISSUED', {
      x: marginX,
      y: yPosition,
      size: 9,
      font: await pdfDoc.embedFont('Helvetica-Bold'),
      color: navyBlue,
      maxWidth: colWidth,
      align: 'center',
    });

    page.drawText(
      new Date(certificate.awarded_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      {
        x: marginX,
        y: yPosition - 14,
        size: 10,
        font: await pdfDoc.embedFont('Helvetica'),
        color: darkGray,
        maxWidth: colWidth,
        align: 'center',
      }
    );

    // Center: Certificate ID
    page.drawText('CERTIFICATE ID', {
      x: marginX + colWidth,
      y: yPosition,
      size: 9,
      font: await pdfDoc.embedFont('Helvetica-Bold'),
      color: navyBlue,
      maxWidth: colWidth,
      align: 'center',
    });

    page.drawText(certificate.certificate_number, {
      x: marginX + colWidth,
      y: yPosition - 14,
      size: 10,
      font: await pdfDoc.embedFont('Courier'),
      color: navyBlue,
      maxWidth: colWidth,
      align: 'center',
    });

    // Right: Instructor
    page.drawText('AUTHORIZED BY', {
      x: marginX + colWidth * 2,
      y: yPosition,
      size: 9,
      font: await pdfDoc.embedFont('Helvetica-Bold'),
      color: navyBlue,
      maxWidth: colWidth,
      align: 'center',
    });

    page.drawText(certificate.instructor_name, {
      x: marginX + colWidth * 2,
      y: yPosition - 14,
      size: 10,
      font: await pdfDoc.embedFont('Helvetica'),
      color: darkGray,
      maxWidth: colWidth,
      align: 'center',
    });

    // 6. VERIFIED-ONLY ELEMENTS
    if (isVerified) {
      const bottomY = 60;

      // Generate and embed QR code
      const qrDataUrl = await QRCode.toDataURL(
        `https://faithlight.app/verify/${certificate.certificate_number}`
      );
      const qrImage = await pdfDoc.embedPng(qrDataUrl);

      // Draw QR code (bottom right)
      page.drawImage(qrImage, {
        x: width - marginX - 60,
        y: bottomY,
        width: 60,
        height: 60,
      });

      // Verification code label (left side)
      page.drawText('VERIFICATION CODE:', {
        x: marginX,
        y: bottomY + 40,
        size: 8,
        font: await pdfDoc.embedFont('Helvetica-Bold'),
        color: lightGray,
      });

      page.drawText(certificate.verification_code.substring(0, 20), {
        x: marginX,
        y: bottomY + 26,
        size: 8,
        font: await pdfDoc.embedFont('Courier'),
        color: darkGray,
      });

      // Seal placeholder text
      page.drawText('Official FaithLight Seal', {
        x: width / 2 - 40,
        y: bottomY + 8,
        size: 7,
        font: await pdfDoc.embedFont('Helvetica'),
        color: gold,
        align: 'center',
      });
    }

    // 7. LEGAL DISCLAIMER (Bottom)
    const disclaimerY = 10;
    page.drawText(
      'FaithLight School of Biblical Leadership provides ministry training certification and does not confer government-accredited academic degrees.',
      {
        x: marginX,
        y: disclaimerY,
        size: 7,
        font: await pdfDoc.embedFont('Helvetica-Oblique'),
        color: rgb(0.6, 0.6, 0.6),
        maxWidth: width - marginX * 2,
        align: 'center',
      }
    );

    // Save and return PDF as data URL
    const pdfBytes = await pdfDoc.save();
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    return URL.createObjectURL(pdfBlob);
  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    throw error;
  }
}

/**
 * Download certificate PDF
 */
export function downloadCertificatePDF(pdfUrl, certificateNumber) {
  const link = document.createElement('a');
  link.href = pdfUrl;
  link.download = `FaithLight-Certificate-${certificateNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}