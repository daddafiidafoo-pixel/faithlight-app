import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook to check if user is suspended from community posting/commenting
 */
export function useModerationStatus(userId) {
  const [status, setStatus] = useState(null);
  const [isSuspended, setIsSuspended] = useState(false);
  const [suspendedUntil, setSuspendedUntil] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const checkStatus = async () => {
      setLoading(true);
      try {
        const records = await base44.entities.UserModerationStatus.filter(
          { user_id: userId },
          '-updated_date',
          1
        );

        if (records.length === 0) {
          setStatus(null);
          setIsSuspended(false);
          setSuspendedUntil(null);
          return;
        }

        const record = records[0];
        setStatus(record);

        // Check if suspension is still active
        if (
          record.status === 'suspended' &&
          record.suspended_until &&
          new Date(record.suspended_until) > new Date()
        ) {
          setIsSuspended(true);
          setSuspendedUntil(record.suspended_until);
        } else {
          setIsSuspended(false);
          setSuspendedUntil(null);
        }
      } catch (error) {
        console.error('Failed to check moderation status:', error);
        setStatus(null);
        setIsSuspended(false);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [userId]);

  return {
    status,
    isSuspended,
    suspendedUntil,
    loading,
  };
}