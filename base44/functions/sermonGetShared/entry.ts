import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token } = await req.json();
    if (!token) return Response.json({ error: 'Missing token' }, { status: 400 });

    // Find the collaborator record by token
    const collaborators = await base44.asServiceRole.entities.SermonCollaborator.filter({ token });
    if (!collaborators.length) {
      return Response.json({ error: 'Invalid or expired link' }, { status: 404 });
    }
    const collaborator = collaborators[0];

    // Mark as accepted if not already
    if (!collaborator.accepted) {
      await base44.asServiceRole.entities.SermonCollaborator.update(collaborator.id, { accepted: true });
    }

    // Fetch the sermon
    const sermon = await base44.asServiceRole.entities.SermonOutline.get(collaborator.sermon_id);
    if (!sermon) return Response.json({ error: 'Sermon not found' }, { status: 404 });

    // Fetch comments
    const comments = await base44.asServiceRole.entities.SermonComment.filter(
      { sermon_id: collaborator.sermon_id },
      '-created_date',
      100
    );

    return Response.json({
      sermon,
      collaborator: {
        id: collaborator.id,
        role: collaborator.role,
        invited_email: collaborator.invited_email,
        invited_by: collaborator.invited_by,
      },
      comments,
    });
  } catch (error) {
    console.error('sermonGetShared error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});