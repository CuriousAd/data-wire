import { useState, useCallback, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { uploadCSV } from '../api/upload';
import { getDatasetStatus } from '../api/status';
import { useAppStore } from '../store/appStore';

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 150;

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { goToWorkspace, updateDataset } = useAppStore();
  const pollTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, []);

  const validateFile = (file) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Only CSV files are supported.', { id: 'file-type' });
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File exceeds the 100MB limit.', { id: 'file-size', duration: 5000 });
      return false;
    }
    return true;
  };

  const handleUpload = useCallback(async (file) => {
    if (!validateFile(file)) return;
    setIsUploading(true);
    const tid = toast.loading('Uploading your dataset…');

    try {
      const data = await uploadCSV(file);
      toast.success('Upload complete — processing…', { id: tid });
      goToWorkspace(data.dataset_id, file.name);
      startPolling(data.dataset_id);
    } catch (err) {
      toast.error(err.message || 'Upload failed.', { id: tid, duration: 6000 });
      setIsUploading(false);
    }
  }, [goToWorkspace]);

  const startPolling = useCallback(async (datasetId) => {
    let attempts = 0;
    const poll = async () => {
      try {
        const status = await getDatasetStatus(datasetId);
        if (status.status === 'ready') {
          updateDataset(datasetId, { status: 'ready', rowCount: status.row_count, columnCount: status.column_count, profile: status.profile });
          setIsUploading(false);
          toast.success('Dataset ready!');
          return;
        }
        if (status.status === 'error') {
          updateDataset(datasetId, { status: 'error' });
          toast.error(status.message || 'Processing failed.');
          setIsUploading(false);
          return;
        }
        attempts++;
        if (attempts >= MAX_POLL_ATTEMPTS) {
          updateDataset(datasetId, { status: 'error' });
          toast.error('Processing timed out.');
          setIsUploading(false);
          return;
        }
        pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        updateDataset(datasetId, { status: 'error' });
        toast.error(err.message || 'Status check failed.');
        setIsUploading(false);
      }
    };
    pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
  }, [updateDataset]);

  return { isUploading, handleUpload };
}
