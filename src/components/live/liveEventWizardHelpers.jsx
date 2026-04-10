// Validation helpers for Live Event Wizard
export const validateStep = (stepNum, formData) => {
  const errors = {};

  if (stepNum === 1) {
    if (!formData.title?.trim()) {
      errors.title = 'Event title is required.';
    } else if (formData.title.length < 3) {
      errors.title = 'Event title must be at least 3 characters.';
    }
    if (!formData.description?.trim()) {
      errors.description = 'Add a short description so people know what to expect.';
    }
    if (!formData.event_type) {
      errors.event_type = 'Please select an event type.';
    }
    if (!formData.mode) {
      errors.mode = 'Please choose Online, In-person, or Hybrid.';
    }
  }

  if (stepNum === 2) {
    if (!formData.date) {
      errors.date = 'Select a date for your event.';
    }
    if (!formData.start_time) {
      errors.start_time = 'Select a start time.';
    }
    if (!formData.timezone) {
      errors.timezone = 'Choose a timezone.';
    }
    const duration = parseInt(formData.duration_minutes);
    if (!duration || duration < 15 || duration > 240) {
      errors.duration_minutes = 'Duration must be between 15 and 240 minutes.';
    }
  }

  if (stepNum === 3) {
    if (formData.mode === 'online' || formData.mode === 'hybrid') {
      if (!formData.online_provider) {
        errors.online_provider = 'Select a streaming provider.';
      }
      if (!formData.online_url?.trim()) {
        errors.online_url = 'Add a live link (https://…).';
      } else if (!formData.online_url.startsWith('https://')) {
        errors.online_url = "That link doesn't look valid. Please paste a full https:// link.";
      }
    }
    if (formData.mode === 'in_person' || formData.mode === 'hybrid') {
      if (!formData.location_name?.trim()) {
        errors.location_name = 'Enter a location name.';
      }
      if (!formData.address?.trim()) {
        errors.address = 'Enter the address.';
      }
    }
  }

  if (stepNum === 4) {
    if (!formData.visibility) {
      errors.visibility = 'Choose who can see this event.';
    }
    if (formData.visibility === 'group_only' && !formData.group_id) {
      errors.group_id = 'Select a group to publish this event.';
    }
    if (!formData.agree_guidelines) {
      errors.agree_guidelines = 'You must agree to the Community Guidelines to publish.';
    }
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors
  };
};

// Get friendly error message
export const getRequiredFieldsMessage = (errors) => {
  const errorMessages = Object.values(errors);
  if (errorMessages.length === 0) return null;
  return 'Complete the required fields marked with * to continue.';
};

// Friendly error messages
export const FRIENDLY_ERRORS = {
  load: "We couldn't load this right now. Please try again.",
  save: 'Failed to save event. Please try again.',
  publish: 'Failed to publish event. Please check your settings and try again.',
  network: 'Connection problem. Please check your internet and try again.',
};

// Empty states
export const EMPTY_STATES = {
  noEvents: 'No live events yet. Create one to get started.',
  noMatch: "No events match your filters. Try changing the date or type.",
  offline: "You're offline. Some events may not load. Try again when connected.",
};