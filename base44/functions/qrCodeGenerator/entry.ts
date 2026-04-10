import QRCode from 'qrcode';

/**
 * Generate QR code data URL for certificate verification
 */
export async function generateCertificateQRCode(certificateNumber) {
  try {
    const verificationUrl = `https://faithlight.app/verify/${certificateNumber}`;
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 1,
      color: {
        dark: '#0A1F44',
        light: '#FFFFFF',
      },
    });
    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

/**
 * Generate SVG QR code for embedding in components
 */
export async function generateQRCodeSVG(certificateNumber) {
  try {
    const verificationUrl = `https://faithlight.app/verify/${certificateNumber}`;
    const svgString = await QRCode.toString(verificationUrl, {
      errorCorrectionLevel: 'H',
      type: 'svg',
      width: 200,
      margin: 2,
      color: {
        dark: '#0A1F44',
        light: '#FFFFFF',
      },
    });
    return svgString;
  } catch (error) {
    console.error('Error generating QR code SVG:', error);
    throw error;
  }
}