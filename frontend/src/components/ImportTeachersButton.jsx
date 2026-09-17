import React, { useState, useRef } from 'react';
import api, { API_BASE_URL } from '../api/client.js';
import { FileSpreadsheet, Upload, Download, X, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';

export function ImportTeachersButton({ onImportSuccess }) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an .xlsx file to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const res = await api.importAdminTeachers(file);
      setResult(res);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      setError(err.message || 'Import failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFile(null);
    setError(null);
    setResult(null);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span>Import Excel</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8">
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Bulk Import Faculty from Excel
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Upload an <code>.xlsx</code> spreadsheet with columns <code>Name</code>, <code>College</code> (CTECH, CTE, CBM, CFES, COAS, CADS), optional <code>Department</code>, and optional <code>Photo URL</code>.
            </p>

            {/* Template Download Prompt */}
            <div className="flex items-center justify-between p-3.5 mb-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs">
              <span className="text-emerald-900 dark:text-emerald-300 font-medium">
                Need the official format?
              </span>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await api.downloadTemplate();
                  } catch (err) {
                    alert(`Failed to download template: ${err.message}`);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Template</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 flex items-center gap-2.5 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="mb-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{result.message}</span>
                </div>

                {result.skipped && result.skipped.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs space-y-1">
                    <p className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{result.skipped.length} rows skipped:</span>
                    </p>
                    <div className="max-h-32 overflow-y-auto space-y-1 pl-5">
                      {result.skipped.map((s, idx) => (
                        <p key={idx} className="text-slate-500">
                          Row {s.row}: {s.name ? `"${s.name}" — ` : ''}{s.reason}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-bisu-blue-50 file:text-bisu-blue-700 hover:file:bg-bisu-blue-100 dark:file:bg-bisu-blue-950 dark:file:text-bisu-gold cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold text-white bg-bisu-blue-700 hover:bg-bisu-blue-800 shadow-md transition-all disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? 'Processing...' : 'Upload & Import'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ImportTeachersButton;
