import React, { useState, useRef } from 'react';
import api from '../api/client.js';
import {
  FileSpreadsheet,
  Briefcase,
  Upload,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Trash2,
  Loader2,
  FileCheck,
  Info,
} from 'lucide-react';

export function ImportTeachersButton({ onImportSuccess, role = 'faculty' }) {
  const isStaff = role === 'staff';
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.name.toLowerCase().endsWith('.xlsx')) {
        setError('Only .xlsx spreadsheet files are supported.');
        return;
      }
      setFile(selected);
      setError(null);
      setResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      if (!dropped.name.toLowerCase().endsWith('.xlsx')) {
        setError('Only .xlsx spreadsheet files are supported.');
        return;
      }
      setFile(dropped);
      setError(null);
      setResult(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    setError(null);
    try {
      await api.downloadTemplate(role);
    } catch (err) {
      setError(`Failed to download template: ${err.message}`);
    } finally {
      setDownloadingTemplate(false);
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
      const res = await api.importAdminTeachers(file, role);
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
    setIsDragging(false);
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-colors ${
          isStaff
            ? 'text-teal-800 dark:text-teal-200 bg-teal-100/80 dark:bg-teal-900/50 hover:bg-teal-200/80 dark:hover:bg-teal-800/60 border border-teal-300/60 dark:border-teal-700/60'
            : 'text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/60'
        }`}
        title={isStaff ? 'Bulk import staff roster via Excel' : 'Bulk import faculty roster via Excel'}
      >
        <FileSpreadsheet className={`w-3.5 h-3.5 ${isStaff ? 'text-teal-600 dark:text-teal-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
        <span>{isStaff ? 'Import Staff (Excel)' : 'Import Faculty (Excel)'}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Close Button */}
            <button
              onClick={handleClose}
              disabled={uploading}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-6 sm:p-8 space-y-5">
              {/* Header */}
              <div className="flex items-start gap-3.5 pr-8">
                <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${
                  isStaff
                    ? 'bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border-teal-500/20'
                    : 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                }`}>
                  {isStaff ? <Briefcase className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                    {isStaff ? 'Bulk Import Staff' : 'Bulk Import Faculty'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {isStaff
                      ? 'Upload an Excel roster to batch register staff members into the directory.'
                      : 'Upload an Excel roster to batch register faculty members into the directory.'}
                  </p>
                </div>
              </div>

              {/* Template Download Prompt */}
              <div className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border ${
                isStaff
                  ? 'bg-teal-50/70 dark:bg-teal-950/30 border-teal-200/80 dark:border-teal-900/60'
                  : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/60'
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <Info className={`w-4 h-4 shrink-0 ${isStaff ? 'text-teal-600 dark:text-teal-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${isStaff ? 'text-teal-950 dark:text-teal-200' : 'text-emerald-950 dark:text-emerald-200'}`}>
                      Need the standard format?
                    </p>
                    <p className={`text-[11px] truncate ${isStaff ? 'text-teal-700/90 dark:text-teal-400/80' : 'text-emerald-700/90 dark:text-emerald-400/80'}`}>
                      Includes preset columns and college reference codes
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  disabled={downloadingTemplate || uploading}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-white active:scale-95 shadow-sm transition-all disabled:opacity-60 ${
                    isStaff
                      ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  }`}
                >
                  {downloadingTemplate ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{downloadingTemplate ? 'Downloading...' : `${isStaff ? 'Staff' : 'Faculty'} Template`}</span>
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/70 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{error}</div>
                </div>
              )}

              {/* Result Summary */}
              {result && (
                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs sm:text-sm">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>{result.message}</span>
                  </div>

                  {result.skipped && result.skipped.length > 0 && (
                    <div className="pt-3 border-t border-emerald-200/70 dark:border-emerald-900/40 text-xs space-y-1.5">
                      <p className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{result.skipped.length} row(s) skipped during import:</span>
                      </p>
                      <div className="max-h-28 overflow-y-auto space-y-1 pl-5 pr-1 text-slate-600 dark:text-slate-400 text-[11px]">
                        {result.skipped.map((s, idx) => (
                          <div key={idx} className="flex items-start gap-1">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0">
                              Row {s.row}:
                            </span>
                            <span className="truncate">
                              {s.name ? `"${s.name}" — ` : ''}{s.reason}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* File Dropzone & Selection Area */}
              <form onSubmit={handleUpload} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Excel Spreadsheet (.xlsx) *
                  </label>

                  {!file ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 sm:p-7 text-center cursor-pointer transition-all duration-200 group ${
                        isDragging
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 scale-[1.01]'
                          : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500/70 bg-slate-50/50 dark:bg-slate-950/40'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                        Click to browse or drag & drop file here
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                        Standard Microsoft Excel spreadsheet (.xlsx) up to 10MB
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                            {formatFileSize(file.size)} • Ready to import
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        disabled={uploading}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors shrink-0"
                        title="Remove selected file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Column Specification Guide */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 text-[11px] space-y-2">
                  <p className="font-bold text-slate-700 dark:text-slate-300">
                    Spreadsheet Column Format:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isStaff ? 'bg-teal-500' : 'bg-emerald-500'}`} />
                      <span><strong className="text-slate-700 dark:text-slate-300">{isStaff ? 'Staff Name' : 'Faculty Name'}</strong> (Required)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <span>College <span className="text-[10px] opacity-70">(optional)</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <span>{isStaff ? 'Department / Office' : 'Department'} <span className="text-[10px] opacity-70">(optional)</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <span>Photo URL <span className="text-[10px] opacity-70">(optional)</span></span>
                    </div>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center gap-1 flex-wrap text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Supported Colleges:</span>
                    {['CTECH', 'CTE', 'CBM', 'CFES', 'COAS', 'CADS'].map((col) => (
                      <span
                        key={col}
                        className="px-1.5 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-semibold"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Modal Actions */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={uploading}
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !file}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none ${
                      isStaff
                        ? 'bg-teal-700 hover:bg-teal-800 shadow-teal-700/20'
                        : 'bg-bisu-blue-700 hover:bg-bisu-blue-800 shadow-bisu-blue/20'
                    }`}
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>
                      {uploading
                        ? (isStaff ? 'Importing Staff Roster...' : 'Importing Faculty Roster...')
                        : (isStaff ? 'Upload & Import Staff' : 'Upload & Import Faculty')}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ImportTeachersButton;

