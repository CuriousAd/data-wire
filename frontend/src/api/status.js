const BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Poll the dataset status endpoint.
 * Returns the full status payload from the backend.
 */
export async function getDatasetStatus(datasetId) {
  const res = await fetch(`${BASE_URL}/api/dataset/${datasetId}/status`);
  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message || 'Status check failed');
    error.code = data.code || 'STATUS_ERROR';
    error.status = res.status;
    throw error;
  }

  return data;
}
