import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sermon_id, invited_email, role } = await req.json();
    if (!sermon_id || !invited_email || !role) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the sermon belongs to this user
    const sermon = await base44.asServiceRole.entities.SermonOutline.get(sermon_id).catch(() => null);
    if (!sermon || sermon.user_id !== user.id) {
      return Response.json({ error: 'Sermon not found or unauthorized' }, { status: 403 });
    }

    // Check if already invited
    const existing = await base44.asServiceRole.entities.SermonCollaborator.filter({
      sermon_id,
      invited_email,
    });
    if (existing.length > 0) {
      return Response.json({ error: 'User already invited' }, { status: 409 });
    }

    // Generate a secure token
    const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');

    // Create the collaborator record
    const collaborator = await base44.asServiceRole.entities.SermonCollaborator.create({
      sermon_id,
      invited_email,
      invited_by: user.email,
      role,
      token,
      accepted: false,
    });

    // Build the share link
    const appUrl = req.headers.get('origin') || 'https://app.base44.com';
    const shareLink = `${appUrl}/SharedSermonView?token=${token}`;

    // Send email invite
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: invited_email,
      subject: `${user.full_name} invited you to collaborate on a sermon`,
      body: `
<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;">
  <h2 style="color:#4f46e5;">You've been invited to collaborate!</h2>
  <p><strong>${user.full_name}</strong> (${user.email}) has invited you to ${role === 'editor' ? 'view and suggest edits on' : 'view'} a sermon:</p>
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:20px 0;">
    <h3 style="margin:0 0 8px;color:#1e293b;">${sermon.title}</h3>
    <p style="margin:0;color:#64748b;font-size:14px;">Theme: ${sermon.theme || 'General'}</p>
  </div>
  <p>Your role: <strong style="color:#4f46e5;">${role === 'editor' ? 'Editor (can comment & suggest edits)' : 'Viewer (read-only)'}</strong></p>
  <a href="${shareLink}" style="display:inline-block;background:#4f46e5;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;margin-top:16px;">
    Open Sermon
  </a>
  <p style="margin-top:24px;color:#94a3b8;font-size:12px;">This link is personal to you. Do not share it with others.</p>
</div>
      `.trim(),
    });

    console.log('Invite sent to', invited_email, 'for sermon', sermon_id, 'with token', token.slice(0, 8) + '...');
    return Response.json({ success: true, collaborator_id: collaborator.id });
  } catch (error) {
    console.error('sermonInviteCollaborator error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});