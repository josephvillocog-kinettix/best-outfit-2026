// Shared registry of successfully preloaded/downloaded candidate photo URLs
export const preloadedPhotoUrls = new Set<string>();

// Keep references to preloaded Image elements in memory to prevent garbage collection/eviction
export const preloadedImageElements: HTMLImageElement[] = [];
