// Stub: certificate generator used by VerifyCertificate page
import { base44 } from '@/api/base44Client';

export async function verifyCertificate(certificateNumber, verificationCode) {
  try {
    const results = await base44.entities.AwardedCertificate.filter({
      certificate_number: certificateNumber,
    });
    const cert = results?.[0];
    if (!cert) return { valid: false, message: 'Certificate not found' };
    if (cert.verification_code !== verificationCode) {
      return { valid: false, message: 'Invalid verification code' };
    }
    return {
      valid: true,
      certificate: cert,
      tierInfo: { subtitle: cert.program_name || 'FaithLight Certificate' },
    };
  } catch {
    return { valid: false, message: 'Verification service unavailable' };
  }
}