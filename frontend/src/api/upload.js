const BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Upload a CSV file to the backend.
 * Returns { success, dataset_id, message, code } or throws an error.
 */
export async function uploadCSV(file) {
  const formData = new FormData();
  formData.append('file', file);

  let res;
  try {
    res = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });
  } catch (networkErr) {
    const error = new Error('Cannot reach the backend server. Please ensure it is running on port 8000.');
    error.code = 'NETWORK_ERROR';
    throw error;
  }

  let data;
  try {
    data = await res.json();
  } catch {
    const error = new Error(
      res.ok
        ? 'Server returned an invalid response.'
        : `Server error (${res.status}). Please check that the backend is running.`
    );
    error.code = 'PARSE_ERROR';
    error.status = res.status;
    throw error;
  }

  if (!res.ok) {
    const error = new Error(data.message || 'Upload failed');
    error.code = data.code || 'UPLOAD_ERROR';
    error.status = res.status;
    throw error;
  }

  return data;
}
