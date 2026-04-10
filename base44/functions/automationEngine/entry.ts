import { base44 } from '@/api/base44Client';

/**
 * Create an automated reminder
 */
export async function createAutomatedReminder(reminderData) {
  try {
    return await base44.entities.AutomatedReminder.create(reminderData);
  } catch (error) {
    console.error('Error creating reminder:', error);
    return null;
  }
}

/**
 * Send email reminder to students
 */
export async function sendEmailReminder(studentEmails, subject, message) {
  try {
    const results = await Promise.all(
      studentEmails.map((email) =>
        base44.integrations.Core.SendEmail({
          to: email,
          subject,
          body: message,
        })
      )
    );
    return results;
  } catch (error) {
    console.error('Error sending email reminders:', error);
    return null;
  }
}

/**
 * Process active reminders and send if conditions are met
 */
export async function processAutomatedReminders() {
  try {
    const reminders = await base44.entities.AutomatedReminder.filter({
      is_active: true,
    });

    for (const reminder of reminders) {
      const courseProgress = await base44.entities.UserCourseProgress.filter({
        course_id: reminder.course_id,
      });

      // Get student emails
      const studentIds = reminder.target_students === 'all'
        ? courseProgress.map((p) => p.user_id)
        : reminder.target_students;

      const students = await Promise.all(
        studentIds.map((id) =>
          base44.entities.User.filter({ id }, null, 1)
        )
      );

      const studentEmails = students
        .flatMap((user) => user)
        .map((user) => user.email)
        .filter(Boolean);

      if (studentEmails.length > 0) {
        await sendEmailReminder(
          studentEmails,
          `Reminder: ${reminder.reminder_type}`,
          reminder.message_template
        );

        // Update last_sent
        await base44.entities.AutomatedReminder.update(reminder.id, {
          last_sent: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    console.error('Error processing automated reminders:', error);
  }
}

/**
 * Award certificate when course is completed
 */
export async function awardCertificateOnCompletion(userId, courseId, progressData) {
  try {
    // Check if student already has certificate
    const existing = await base44.entities.AwardedCertificate.filter({
      user_id: userId,
      course_id: courseId,
    });

    if (existing.length > 0) {
      return existing[0]; // Already awarded
    }

    // Only award if progress is complete
    if (progressData.progress_percentage < 100) {
      return null;
    }

    const certificateNumber = `CERT-${Date.now()}-${userId.substring(0, 8)}`;

    const certificate = await base44.entities.AwardedCertificate.create({
      course_id: courseId,
      user_id: userId,
      certificate_number: certificateNumber,
      progress_percentage: progressData.progress_percentage,
      final_quiz_score: progressData.final_quiz_score || 0,
      awarded_at: new Date().toISOString(),
      status: 'earned',
    });

    // Send congratulations email
    const user = await base44.entities.User.filter({ id: userId }, null, 1);
    const course = await base44.entities.Course.filter(
      { id: courseId },
      null,
      1
    );

    if (user.length > 0 && course.length > 0) {
      await base44.integrations.Core.SendEmail({
        to: user[0].email,
        subject: `🎉 Certificate Earned: ${course[0].title}`,
        body: `Congratulations on completing the course "${course[0].title}"!\n\nYour certificate has been awarded:\nCertificate Number: ${certificateNumber}\n\nYou can view and download your certificate from your profile.`,
      });
    }

    return certificate;
  } catch (error) {
    console.error('Error awarding certificate:', error);
    return null;
  }
}

/**
 * Get awarded certificates for user
 */
export async function getUserCertificates(userId) {
  try {
    return await base44.entities.AwardedCertificate.filter({
      user_id: userId,
      status: 'earned',
    });
  } catch (error) {
    console.error('Error fetching user certificates:', error);
    return [];
  }
}

/**
 * Claim a certificate
 */
export async function claimCertificate(certificateId) {
  try {
    return await base44.entities.AwardedCertificate.update(certificateId, {
      status: 'claimed',
      claimed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error claiming certificate:', error);
    return null;
  }
}