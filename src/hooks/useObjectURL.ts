import { useState, useEffect } from 'react';

/**
 * Custom hook that creates an object URL for a File or Blob and automatically
 * revokes it when the file changes or the component unmounts to prevent memory leaks.
 *
 * @param file - The File or Blob to create an object URL for, or null
 * @returns The object URL string, or null if no file is provided
 */
export function useObjectURL(file: File | Blob | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return url;
}

/**
 * Custom hook that manages multiple object URLs for an array of files.
 * Automatically revokes URLs when files are removed or the component unmounts.
 *
 * @param files - Array of objects containing an id and file
 * @returns Map of id to object URL
 */
export function useObjectURLMap<T extends { id: string; file: File | Blob }>(
  files: T[]
): Map<string, string> {
  const [urlMap, setUrlMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const newUrlMap = new Map<string, string>();
    const currentIds = new Set(files.map(f => f.id));

    // Revoke URLs for removed files
    urlMap.forEach((url, id) => {
      if (!currentIds.has(id)) {
        URL.revokeObjectURL(url);
      }
    });

    // Create or reuse URLs for current files
    files.forEach(({ id, file }) => {
      const existingUrl = urlMap.get(id);
      if (existingUrl && currentIds.has(id)) {
        // Reuse existing URL if file is still present
        newUrlMap.set(id, existingUrl);
      } else {
        // Create new URL for new files
        newUrlMap.set(id, URL.createObjectURL(file));
      }
    });

    setUrlMap(newUrlMap);

    // Cleanup on unmount
    return () => {
      newUrlMap.forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [files]);

  return urlMap;
}

export default useObjectURL;
