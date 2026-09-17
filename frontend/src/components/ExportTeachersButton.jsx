import React, { useState } from 'react';
import api from '../api/client.js';
import { Download, Loader2 } from 'lucide-react';

export function ExportTeachersButton() {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await api.exportTeachers();
    } catch (err) {
      alert(`Export failed: ${err.message || 'Unauthorized or server error'}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
      title="Export teacher directory to Excel"
    >
      {exporting ? (
        <Loader2 className="w-4 h-4 animate-spin text-bisu-blue-600 dark:text-bisu-gold" />
      ) : (
        <Download className="w-4 h-4 text-bisu-blue-600 dark:text-bisu-gold" />
      )}
      <span>{exporting ? 'Exporting...' : 'Export Excel'}</span>
    </button>
  );
}

export default ExportTeachersButton;
