const BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Upload a CSV file to the backend.
 * Returns { success, dataset_id, message, code } or throws an error.
 */
export async function uploadCSV(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message || 'Upload failed');
    error.code = data.code || 'UPLOAD_ERROR';
    error.status = res.status;
    throw error;
  }

  return data;
}
