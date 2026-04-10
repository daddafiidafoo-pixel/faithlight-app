import type { AudioBible } from '@/types/audioBible';
import { validateAudioBible } from '@/validation/audioBible';

export function validateAudioBibleList(input: unknown): {
  success: boolean;
  data?: AudioBible[];
  errors?: string[];
} {
  if (!Array.isArray(input)) {
    return { success: false, errors: ['Input must be an array.'] };
  }

  const errors: string[] = [];
  const validItems: AudioBible[] = [];

  input.forEach((item, index) => {
    const result = validateAudioBible(item);
    if (!result.success) {
      errors.push(...result.errors.map((e) => `Item ${index}: ${e}`));
    } else {
      validItems.push(result.data);
    }
  });

  if (errors.length > 0) return { success: false, errors };
  return { success: true, data: validItems };
}