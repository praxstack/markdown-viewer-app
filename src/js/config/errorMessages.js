/**
 * Centralized Error Messages
 *
 * All user-facing error messages are defined here for:
 * - Consistency across the application
 * - Easy localization/internationalization
 * - Single source of truth for error handling
 */

export const ERROR_MESSAGES = {
  // File System Access API
  API_NOT_SUPPORTED: 'File System Access API not supported. Please use Chrome or Edge browser.',

  // Folder Operations
  NO_FOLDER_OPEN: 'No folder is currently open. Please open a folder first.',
  PERMISSION_DENIED: 'Permission denied. Please re-open the folder.',
  PERMISSION_DENIED_WRITE: 'Write permission denied. Cannot create file.',
  PERMISSION_DENIED_SAVE: 'Write permission denied. Cannot save file.',

  // File Operations
  INVALID_FILENAME: 'Invalid filename. Please provide a valid name.',
  INVALID_FILENAME_PROVIDED: 'Invalid filename provided.',
  FILE_EXISTS: filename => `File "${filename}" already exists. Please choose a different name.`,
  FILE_CREATE_FAILED: 'Failed to create file.',
  FILE_SAVE_FAILED: 'Failed to save file.',
  NO_FILE_HANDLE: 'No file handle provided.',

  // Directory Operations
  INVALID_DIRECTORY_NAME: 'Invalid directory name.',

  // Validation
  MAX_DEPTH_REACHED: (depth, path) => `Max depth ${depth} reached at: ${path}`,
  MAX_FILES_REACHED: count => `Max files ${count} reached`,
};

/**
 * Get error message with optional parameter substitution
 *
 * @param {string|Function} message - Error message string or function
 * @param {any} params - Parameters for function-based messages
 * @returns {string} Final error message
 */
export function getErrorMessage(message, ...params) {
  if (typeof message === 'function') {
    return message(...params);
  }
  return message;
}
