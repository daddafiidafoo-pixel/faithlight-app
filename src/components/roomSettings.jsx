// Default room settings for 500-person live audio sessions

export const DEFAULT_ROOM_SETTINGS = {
  capacity: 500,
  joinMode: "LISTEN_ONLY",
  muteOnJoin: true,
  allowSelfUnmute: false,
  requestToSpeakEnabled: true,
  maxSpeakers: 10,
  coHostsAllowed: true,

  moderation: {
    hostCanMuteAll: true,
    hostCanUnmuteAnyone: true,
    coHostCanMuteAnyone: true,
    coHostCanUnmuteSpeakersOnly: true,
    removeParticipantEnabled: true,
    lockRoomEnabled: true,
  },

  privacy: {
    showParticipantListToAll: true,
    showRoles: true,
    showVerifiedBadges: true,
  },

  antiChaos: {
    rateLimitRequestsPerUserPerMinute: 2,
    spamProtectionEnabled: true,
    autoDemoteSpeakerOnSilenceSeconds: 120,
  },

  recording: {
    enabled: false,
    announceRecording: true,
  },

  language: {
    primary: "en",
    autoCaptions: false,
  },
};

export function createRoomSettings(overrides = {}) {
  return {
    ...DEFAULT_ROOM_SETTINGS,
    ...overrides,
    moderation: {
      ...DEFAULT_ROOM_SETTINGS.moderation,
      ...(overrides.moderation || {}),
    },
    privacy: {
      ...DEFAULT_ROOM_SETTINGS.privacy,
      ...(overrides.privacy || {}),
    },
    antiChaos: {
      ...DEFAULT_ROOM_SETTINGS.antiChaos,
      ...(overrides.antiChaos || {}),
    },
    recording: {
      ...DEFAULT_ROOM_SETTINGS.recording,
      ...(overrides.recording || {}),
    },
    language: {
      ...DEFAULT_ROOM_SETTINGS.language,
      ...(overrides.language || {}),
    },
  };
}