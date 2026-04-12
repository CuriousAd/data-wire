import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { uploadCSV } from '../api/upload';
import { getDatasetStatus } from '../api/status';
import { useAppStore } from '../store/appStore';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB — mirror backend limit
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 150; // 5 minutes

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { goToProcessing, goToChat, resetToUpload } = useAppStore();

  const validateFile = (file) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Only CSV files are supported.', { id: 'file-type' });
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File exceeds the 100MB limit. Please compress or trim your dataset.', {
        id: 'file-size',
        duration: 5000,
      });
      return false;
    }
    return true;
  };

  const handleUpload = useCallback(async (file) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    const uploadToastId = toast.loading('Uploading your dataset...');

    try {
      const data = await uploadCSV(file);
      toast.success('Upload successful! Processing your data...', { id: uploadToastId });
      goToProcessing(data.dataset_id, file.name);
      startPolling(data.dataset_id);
    } catch (err) {
      let message = err.message || 'Upload failed. Please try again.';
      if (err.status === 413 || err.code === 'FILE_TOO_LARGE') {
        message = 'File exceeds the 100MB limit. Please compress or trim your dataset.';
      }
      toast.error(message, { id: uploadToastId, duration: 6000 });
      setIsUploading(false);
    }
  }, [goToProcessing]);

  const startPolling = useCallback(async (datasetId) => {
    let attempts = 0;
    const poll = async () => {
      try {
        const status = await getDatasetStatus(datasetId);

        if (status.status === 'ready') {
          goToChat({
            id: datasetId,
            rowCount: status.row_count,
            columnCount: status.column_count,
            profile: status.profile,
          });
          setIsUploading(false);
          return;
        }

        if (status.status === 'error') {
          toast.error(status.message || 'Processing failed. Please re-upload your file.', {
            duration: 8000,
          });
          resetToUpload();
          setIsUploading(false);
          return;
        }

        // Still processing
        attempts++;
        if (attempts >= MAX_POLL_ATTEMPTS) {
          toast.error('Processing timed out. Please try again.', { duration: 6000 });
          resetToUpload();
          setIsUploading(false);
          return;
        }

        setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        toast.error(err.message || 'Failed to check processing status.', { duration: 5000 });
        resetToUpload();
        setIsUploading(false);
      }
    };

    setTimeout(poll, POLL_INTERVAL_MS);
  }, [goToChat, resetToUpload]);

  return { isUploading, handleUpload };
}
