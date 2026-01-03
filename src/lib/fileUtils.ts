/**
 * Centralized file utility functions
 * Used across the application for file processing operations
 */

/**
 * Converts a File object to a base64-encoded data URL string
 * @param file - The File object to convert
 * @returns Promise resolving to a data URL string (e.g., "data:image/png;base64,...")
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Removes the data URL prefix from a base64 string
 * @param base64 - The base64 string, optionally with data URL prefix
 * @returns The raw base64 string without the prefix
 */
export const cleanBase64 = (base64: string): string => {
  return base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
};
