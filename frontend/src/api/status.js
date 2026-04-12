const BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Poll the dataset status endpoint.
 * Returns the full status payload from the backend.
 */
export async function getDatasetStatus(datasetId) {
  let res;
  try {
    res = await fetch(`${BASE_URL}/api/dataset/${datasetId}/status`);
  } catch {
    const error = new Error('Cannot reach the backend server.');
    error.code = 'NETWORK_ERROR';
    throw error;
  }

  let data;
  try {
    data = await res.json();
  } catch {
    const error = new Error(`Server error (${res.status}). Invalid response.`);
    error.code = 'PARSE_ERROR';
    error.status = res.status;
    throw error;
  }

  if (!res.ok) {
    const error = new Error(data.message || 'Status check failed');
    error.code = data.code || 'STATUS_ERROR';
    error.status = res.status;
    throw error;
  }

  return data;
}
