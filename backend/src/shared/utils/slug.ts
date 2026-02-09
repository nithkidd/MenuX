/**
 * Generates a URL-friendly slug from a string
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .substring(0, 100); // Limit length
};

/**
 * Generates a unique slug by appending a random suffix if needed
 */
export const generateUniqueSlug = (text: string): string => {
  const baseSlug = generateSlug(text);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${randomSuffix}`;
};
