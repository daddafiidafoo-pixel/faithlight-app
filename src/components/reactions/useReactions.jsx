import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Hook to manage reactions for a given target.
 * @param {string} targetType - 'post' | 'comment' | 'prayer_request' | 'forum_reply'
 * @param {string} targetId
 * @param {object} user - current user object
 */
export function useReactions(targetType, targetId, user) {
  const queryClient = useQueryClient();
  const qKey = ['reactions', targetType, targetId];

  const { data: reactions = [] } = useQuery({
    queryKey: qKey,
    queryFn: () => base44.entities.Reaction.filter({ target_type: targetType, target_id: targetId }, '-created_date', 200),
    enabled: !!targetId,
    staleTime: 30_000,
  });

  // Aggregate counts
  const counts = reactions.reduce((acc, r) => {
    acc[r.reaction_key] = (acc[r.reaction_key] || 0) + 1;
    return acc;
  }, {});

  // Current user's reaction
  const myReaction = user ? reactions.find(r => r.user_id === user.id) : null;
  const myReactionKey = myReaction?.reaction_key || null;

  const reactMutation = useMutation({
    mutationFn: async (reactionKey) => {
      // Remove existing if any
      if (myReaction) {
        await base44.entities.Reaction.delete(myReaction.id);
      }
      // If same key → just removing (toggle off)
      if (myReaction?.reaction_key === reactionKey) return null;
      // Add new reaction
      return base44.entities.Reaction.create({
        user_id: user.id,
        user_name: user.full_name,
        target_type: targetType,
        target_id: targetId,
        reaction_key: reactionKey,
      });
    },
    onMutate: async (reactionKey) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: qKey });
      const prev = queryClient.getQueryData(qKey) || [];
      const withoutMine = prev.filter(r => r.user_id !== user?.id);
      const optimistic = reactionKey === myReaction?.reaction_key
        ? withoutMine
        : [...withoutMine, { id: '__opt__', user_id: user.id, user_name: user.full_name, target_type: targetType, target_id: targetId, reaction_key: reactionKey }];
      queryClient.setQueryData(qKey, optimistic);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(qKey, ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qKey });
    },
  });

  return { reactions, counts, myReactionKey, reactMutation };
}