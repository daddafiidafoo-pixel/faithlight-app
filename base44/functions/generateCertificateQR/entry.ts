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
      return Response.json({ error: 'certificate_id is required' }, { status: 400 });
    }

    // Fetch certificate
    const certs = await base44.asServiceRole.entities.AwardedCertificate.filter({ id: certificate_id });
    const certificate = certs?.[0];
    if (!certificate) {
      return Response.json({ error: 'Certificate not found' }, { status: 404 });
    }

    // Only the certificate owner can generate a QR code
    if (certificate.user_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build the verification URL
    const appId = Deno.env.get('BASE44_APP_ID') || '';
    const verifyUrl = `https://app.base44.com/apps/${appId}/VerifyCertificateFormal?cert=${certificate.certificate_number}&code=${certificate.verification_code}`;

    // Generate QR code as data URL (PNG base64)
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1E1B4B',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });

    return Response.json({
      qr_data_url: qrDataUrl,
      verify_url: verifyUrl,
      certificate_number: certificate.certificate_number,
    });
  } catch (error) {
    console.error('QR generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});