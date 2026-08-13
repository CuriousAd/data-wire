import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { uploadCSV } from '../api/upload';
import { useAppStore } from '../store/appStore';

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB — Render free-tier RAM cap

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { goToWorkspace } = useAppStore();

  const validateFile = (file) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Only CSV files are supported.', { id: 'file-type' });
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File exceeds the 3 MB limit. Please trim or sample your CSV before uploading.', { id: 'file-size', duration: 6000 });
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
      // Polling is handled by LeftPanel which stays mounted in workspace
    } catch (err) {
      toast.error(err.message || 'Upload failed.', { id: tid, duration: 6000 });
    } finally {
      setIsUploading(false);
    }
  }, [goToWorkspace]);

  return { isUploading, handleUpload };
}
