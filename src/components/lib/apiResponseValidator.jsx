/**
 * API Response Validation Helpers
 * Ensures backend responses have expected structure before rendering
 */

export function validateAIResponse(response, expectedFields = []) {
  // Basic validation
  if (!response) {
    throw new Error('API returned null response');
  }

  if (typeof response !== 'object') {
    throw new Error('API response is not an object');
  }

  // Check for expected fields
  const missing = expectedFields.filter(field => !(field in response));
  if (missing.length > 0) {
    throw new Error(`API response missing required fields: ${missing.join(', ')}`);
  }

  return response;
}

export function validateGuardrailsResponse(response) {
  // For generateBibleExplanationWithGuardrails
  const required = ['success', 'response'];
  validateAIResponse(response?.data, required);
  
  const aiData = response.data.response;
  if (!aiData.answer) {
    throw new Error('API response missing answer field');
  }

  return response;
}

export function validateBibleGuideResponse(response) {
  // For InvokeLLM with JSON schema
  const required = ['explanation', 'context', 'related_verses', 'application', 'prayer'];
  validateAIResponse(response, required);

  // Validate related_verses is array
  if (!Array.isArray(response.related_verses)) {
    throw new Error('related_verses must be an array');
  }

  return response;
}

export function validateSearchResponse(response) {
  // For search/filter responses
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid search response');
  }

  if (!Array.isArray(response.data?.verses)) {
    return { verses: [] }; // Safe default for optional
  }

  return response;
}

/**
 * Wrap an API call with validation and error handling
 * Usage:
 * const result = await withErrorBoundary(
 *   () => base44.functions.invoke('myFunction', payload),
 *   'myFunction'
 * );
 */
export async function withErrorBoundary(apiCall, functionName = 'API') {
  try {
    const response = await apiCall();
    return { success: true, data: response };
  } catch (error) {
    console.error(`${functionName} failed:`, error);
    return {
      success: false,
      error: error?.message || `${functionName} request failed`,
      originalError: error,
    };
  }
}

/**
 * Safe data accessor - never throw, always return a safe value
 * Usage:
 * const answer = safeGet(response, 'data.response.answer', 'No response');
 */
export function safeGet(obj, path, defaultValue = null) {
  try {
    const value = path.split('.').reduce((acc, part) => acc?.[part], obj);
    return value !== undefined && value !== null ? value : defaultValue;
  } catch {
    return defaultValue;
  }
}