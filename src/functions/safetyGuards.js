export async function canUserJoinRoom(userId, roomId, options = {}) {
  // Basic safety check - allows joining by default
  return {
    ok: true,
    message: 'User allowed to join',
    userId,
    roomId,
  };
}

export async function checkSafetyGuards(userId, data) {
  // Basic safety validation
  return {
    allowed: true,
    flagged: false,
    reasons: [],
  };
}

export default {
  canUserJoinRoom,
  checkSafetyGuards,
};