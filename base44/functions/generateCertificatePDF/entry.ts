import { PDFDocument, rgb, StandardFonts } from 'npm:pdf-lib@1.17.1';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import QRCode from 'npm:qrcode@1.5.3';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { certificate_id } = await req.json();
    if (!certificate_id) {
      return Response.json({ error: 'certificate_id required' }, { status: 400 });
    }

    // Fetch certificate
    const certs = await base44.entities.AwardedCertificate.filter({ id: certificate_id }, null, 1);
    if (!certs.length) {
      return Response.json({ error: 'Certificate not found' }, { status: 404 });
    }
    const cert = certs[0];

    if (cert.user_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build verify URL for QR
    const appId = Deno.env.get('BASE44_APP_ID') || '';
    const verifyUrl = `https://app.base44.com/apps/${appId}/VerifyCertificateFormal?cert=${cert.certificate_number}&code=${cert.verification_code || ''}`;

    // Generate QR code as PNG buffer
    const qrBuffer = await QRCode.toBuffer(verifyUrl, {
      width: 200,
      margin: 1,
      color: { dark: '#1E1B4B', light: '#FFFFFF' },
      errorCorrectionLevel: 'H',
      type: 'png',
    });

    // Create PDF (landscape A4: 841 x 595 pt)
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([841, 595]);
    const { width, height } = page.getSize();

    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const navy = rgb(0.118, 0.106, 0.294);   // #1E1B4B
    const gold = rgb(0.984, 0.749, 0.141);   // #FBBF24
    const lightGold = rgb(0.980, 0.878, 0.502); // light amber
    const white = rgb(1, 1, 1);
    const gray = rgb(0.4, 0.4, 0.4);
    const lightGray = rgb(0.95, 0.95, 0.95);

    // --- Background ---
    page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.98, 0.97, 0.945) }); // parchment #FAF8F2

    // Gold top bar
    page.drawRectangle({ x: 0, y: height - 12, width, height: 12, color: gold });
    // Gold bottom bar
    page.drawRectangle({ x: 0, y: 0, width, height: 12, color: gold });

    // Navy left accent bar
    page.drawRectangle({ x: 0, y: 0, width: 8, height, color: navy });
    // Navy right accent bar
    page.drawRectangle({ x: width - 8, y: 0, width: 8, height, color: navy });

    // Double navy border
    page.drawRectangle({ x: 28, y: 28, width: width - 56, height: height - 56, borderColor: navy, borderWidth: 1.5, color: rgb(0, 0, 0, 0) });
    page.drawRectangle({ x: 22, y: 22, width: width - 44, height: height - 44, borderColor: gold, borderWidth: 0.8, color: rgb(0, 0, 0, 0) });

    // --- Header area (navy band) ---
    page.drawRectangle({ x: 8, y: height - 130, width: width - 16, height: 118, color: navy });

    // Institute name in header
    page.drawText('GLOBAL BIBLICAL LEADERSHIP INSTITUTE', {
      x: 48, y: height - 65,
      size: 16, font: boldFont, color: gold,
    });
    page.drawText('FaithLight · Biblical Training for a Global Generation', {
      x: 48, y: height - 88,
      size: 9, font: regularFont, color: rgb(0.65, 0.65, 0.85),
    });
    page.drawText('CERTIFICATE OF COMPLETION', {
      x: 48, y: height - 116,
      size: 12, font: boldFont, color: white,
    });

    // --- Main content area ---
    const contentStartY = height - 155;

    page.drawText('This certifies that', {
      x: 60, y: contentStartY,
      size: 11, font: italicFont, color: gray,
    });

    // Student name (large)
    const studentName = cert.student_name || 'Student Name';
    page.drawText(studentName, {
      x: 60, y: contentStartY - 35,
      size: 30, font: boldFont, color: navy,
    });

    // Gold underline under name
    const nameWidth = boldFont.widthOfTextAtSize(studentName, 30);
    page.drawRectangle({ x: 60, y: contentStartY - 42, width: Math.min(nameWidth, 500), height: 2, color: gold });

    page.drawText('has successfully completed the requirements for', {
      x: 60, y: contentStartY - 68,
      size: 11, font: italicFont, color: gray,
    });

    // Course/program name
    const programName = cert.program_name || 'Biblical Leadership Program';
    page.drawText(programName, {
      x: 60, y: contentStartY - 100,
      size: 18, font: boldFont, color: navy,
    });

    // Track / tier
    const tierLabel = cert.certificate_tier
      ? cert.certificate_tier.charAt(0).toUpperCase() + cert.certificate_tier.slice(1) + ' Track'
      : 'Foundations Track';
    page.drawText(`Global Biblical Leadership Institute — ${tierLabel}`, {
      x: 60, y: contentStartY - 122,
      size: 9, font: regularFont, color: gray,
    });

    // --- Details row ---
    const detailY = contentStartY - 165;
    page.drawRectangle({ x: 55, y: detailY - 8, width: 500, height: 0.5, color: lightGold });

    const issuedDate = cert.awarded_at
      ? new Date(cert.awarded_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    page.drawText('DATE ISSUED', { x: 60, y: detailY - 25, size: 7, font: boldFont, color: gray });
    page.drawText(issuedDate, { x: 60, y: detailY - 39, size: 10, font: boldFont, color: navy });

    page.drawText('CERTIFICATE ID', { x: 230, y: detailY - 25, size: 7, font: boldFont, color: gray });
    page.drawText(cert.certificate_number || 'GBLI-2026-0001', { x: 230, y: detailY - 39, size: 10, font: boldFont, color: navy });

    page.drawText('STUDY HOURS', { x: 420, y: detailY - 25, size: 7, font: boldFont, color: gray });
    page.drawText(String(cert.study_hours || 40) + ' hours', { x: 420, y: detailY - 39, size: 10, font: boldFont, color: navy });

    page.drawRectangle({ x: 55, y: detailY - 50, width: 500, height: 0.5, color: lightGold });

    // --- Signature line ---
    const sigY = detailY - 90;
    page.drawRectangle({ x: 60, y: sigY, width: 140, height: 0.8, color: navy });
    page.drawText('Program Director', { x: 60, y: sigY - 14, size: 8, font: boldFont, color: gray });
    page.drawText('Global Biblical Leadership Institute', { x: 60, y: sigY - 26, size: 7, font: regularFont, color: gray });

    // Bible verse footer
    page.drawText('"Study to show yourself approved to God..." — 2 Timothy 2:15', {
      x: 60, y: 35,
      size: 8, font: italicFont, color: rgb(0.5, 0.5, 0.5),
    });

    // --- QR Code (embed PNG) ---
    const qrImage = await pdfDoc.embedPng(qrBuffer);
    const qrSize = 90;
    const qrX = width - 140;
    const qrY = detailY - 95;

    // White background for QR
    page.drawRectangle({ x: qrX - 5, y: qrY - 5, width: qrSize + 10, height: qrSize + 10, color: white, borderColor: lightGold, borderWidth: 1 });
    page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });
    page.drawText('Scan to Verify', { x: qrX + 5, y: qrY - 15, size: 7, font: boldFont, color: gray });

    // Save
    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="GBLI-Certificate-${cert.certificate_number || 'cert'}.pdf"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Certificate PDF error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});