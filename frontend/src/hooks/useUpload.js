import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import { uploadCSV } from '../api/upload';
import { useAppStore } from '../store/appStore';

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB — Render free-tier RAM cap

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { goToWorkspace, addCenterItem } = useAppStore();

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

  /**
   * Parse the first 20 rows client-side using Papa Parse and push an instant
   * preview table into the Canvas panel.  This runs synchronously before the
   * first network request so the user sees real content the moment the
   * workspace mounts — no waiting for backend processing.
   */
  const injectInstantPreview = useCallback((file, addCenterItemFn) => {
    Papa.parse(file, {
      header: true,
      preview: 20,
      skipEmptyLines: true,
      complete: ({ data, meta }) => {
        if (!data?.length || !meta?.fields?.length) return;
        addCenterItemFn({
          type: 'dataset',
          content: {
            columns: meta.fields,
            rows: data.map(row => meta.fields.map(f => row[f] ?? '')),
          },
          title: `Preview — ${file.name} (first ${data.length} rows)`,
        });
      },
      error: () => {
        // Non-fatal: preview is best-effort; don't show a toast for this
      },
    });
  }, []);

  const handleUpload = useCallback(async (file) => {
    if (!validateFile(file)) return;
    setIsUploading(true);
    const tid = toast.loading('Uploading your dataset…');

    try {
      const data = await uploadCSV(file);
      toast.success('Upload complete — processing…', { id: tid });
      // Navigate first so the workspace and CenterPanel mount
      goToWorkspace(data.dataset_id, file.name);
      // Then inject the instant preview — addCenterItem is stable after navigation
      injectInstantPreview(file, addCenterItem);
    } catch (err) {
      toast.error(err.message || 'Upload failed.', { id: tid, duration: 6000 });
    } finally {
      setIsUploading(false);
    }
  }, [goToWorkspace, addCenterItem, injectInstantPreview]);

  return { isUploading, handleUpload };
}
