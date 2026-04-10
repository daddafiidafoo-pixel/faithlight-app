import { base44 } from '@/api/base44Client';

/**
 * Determine certificate tier based on course category/level
 */
export function determineCertificateTier(courseType) {
  const tierMap = {
    foundation: 'foundation',
    basics: 'foundation',
    introduction: 'foundation',
    
    leadership: 'leadership',
    church_leadership: 'leadership',
    ministry: 'leadership',
    
    theological: 'theological',
    theology: 'theological',
    advanced: 'theological',
    hermeneutics: 'theological',
    apologetics: 'theological',
  };

  return tierMap[courseType?.toLowerCase()] || 'foundation';
}

/**
 * Get certificate tier metadata
 */
export function getCertificateTierInfo(tier) {
  const tiers = {
    foundation: {
      title: 'Certificate in Christian Foundations',
      description: 'Basic Bible study, Christian doctrine fundamentals, Christian ethics',
      subtitle: 'Foundation Certificate',
      color: 'from-blue-600 to-blue-800',
      icon: '📕',
    },
    leadership: {
      title: 'Certificate in Christian Leadership & Ministry',
      description: 'Church leadership training, Servant leadership, Biblical conflict resolution',
      subtitle: 'Leadership Certificate',
      color: 'from-purple-600 to-purple-800',
      icon: '👑',
    },
    theological: {
      title: 'Certificate in Biblical & Theological Studies',
      description: 'Systematic theology, Church history, Hermeneutics, Apologetics',
      subtitle: 'Theological Completion Certificate',
      color: 'from-amber-700 to-amber-900',
      icon: '🎓',
    },
  };

  return tiers[tier] || tiers.foundation;
}

/**
 * Generate unique certificate number and verification code
 */
export function generateCertificateCredentials() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  return {
    certificateNumber: `FL-${new Date().getFullYear()}-${random}`,
    verificationCode: `VERIFY-${timestamp}-${random}`,
  };
}

/**
 * Create and award certificate (basic or verified)
 */
export async function createAndAwardCertificate(data) {
  try {
    const { userId, courseId, studentName, programName, instructorName, courseType, certificateType = 'basic' } = data;

    // Check if already awarded
    const existing = await base44.entities.AwardedCertificate.filter({
      user_id: userId,
      course_id: courseId,
    });

    if (existing.length > 0) {
      return { success: false, error: 'Certificate already awarded', certificate: existing[0] };
    }

    // Generate credentials
    const { certificateNumber, verificationCode } = generateCertificateCredentials();
    const tier = determineCertificateTier(courseType);

    // Create certificate record
    const certificate = await base44.entities.AwardedCertificate.create({
      course_id: courseId,
      user_id: userId,
      student_name: studentName,
      certificate_number: certificateNumber,
      certificate_tier: tier,
      certificate_type: certificateType,
      program_name: programName,
      verification_code: certificateType === 'verified' ? verificationCode : undefined,
      instructor_name: instructorName || 'FaithLight Team',
      awarded_at: new Date().toISOString(),
      status: 'earned',
      is_paid: certificateType === 'verified' ? false : false, // Paid status set separately during checkout
    });

    // Generate PDF (for verified certificates)
    if (certificateType === 'verified') {
      try {
        const { generateCertificatePDF } = await import('./pdfCertificateGenerator.js');
        const pdfUrl = await generateCertificatePDF(certificate, true);
        // Store PDF URL in certificate if you want to save it
        // For now, we'll generate on-demand when needed
      } catch (pdfError) {
        console.error('Warning: PDF generation failed, but certificate was created:', pdfError);
        // Continue - PDF can be generated on-demand later
      }
    }

    // Send congratulations email
    try {
      const user = await base44.entities.User.filter({ id: userId }, null, 1);
      if (user.length > 0) {
        const tierInfo = getCertificateTierInfo(tier);
        const message = certificateType === 'basic'
          ? `Congratulations on completing "${programName}"!\n\nYour Certificate of Completion is ready.\n\nCertificate ID: ${certificateNumber}\n\nYou can view and download your certificate from your profile.`
          : `Congratulations on completing "${programName}"!\n\nYou are eligible for our Official Verified Certificate ($9.99).\n\nThis premium certificate includes:\n✓ Official FaithLight Seal\n✓ QR Code verification\n✓ Ministry credibility\n✓ Resume-ready format\n\nCertificate ID: ${certificateNumber}\n\nUpgrade to Verified Certificate from your profile.`;

        await base44.integrations.Core.SendEmail({
          to: user[0].email,
          subject: `🎓 ${tierInfo.title} - Certificate Ready`,
          body: message,
        });
      }
    } catch (emailError) {
      console.error('Error sending certificate email:', emailError);
    }

    return { success: true, certificate };
  } catch (error) {
    console.error('Error creating certificate:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Upgrade basic certificate to verified (paid)
 */
export async function upgradeCertificateToVerified(certificateId, paymentIntentId) {
  try {
    return await base44.entities.AwardedCertificate.update(certificateId, {
      certificate_type: 'verified',
      is_paid: true,
      payment_status: 'completed',
    });
  } catch (error) {
    console.error('Error upgrading certificate:', error);
    return null;
  }
}

/**
 * Verify a certificate by code
 */
export async function verifyCertificate(certificateNumber, verificationCode) {
  try {
    const certificates = await base44.entities.AwardedCertificate.filter({
      certificate_number: certificateNumber,
      verification_code: verificationCode,
    });

    if (certificates.length === 0) {
      return { valid: false, message: 'Certificate not found' };
    }

    const cert = certificates[0];
    return {
      valid: true,
      certificate: cert,
      tierInfo: getCertificateTierInfo(cert.certificate_tier),
    };
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return { valid: false, message: 'Verification error' };
  }
}

/**
 * Get all certificates for a user
 */
export async function getUserCertificates(userId) {
  try {
    return await base44.entities.AwardedCertificate.filter({
      user_id: userId,
    }, '-awarded_at');
  } catch (error) {
    console.error('Error fetching user certificates:', error);
    return [];
  }
}