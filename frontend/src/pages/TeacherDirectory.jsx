import React from 'react';
import api from '../api/client.js';
import TeacherGrid from '../components/TeacherGrid.jsx';
import { Users, Sparkles } from 'lucide-react';

export function TeacherDirectory() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bisu-blue-100 dark:bg-bisu-blue-950/60 text-bisu-blue-700 dark:text-bisu-gold text-xs font-bold uppercase tracking-wider">
          <Users className="w-3.5 h-3.5" />
          <span>BISU Faculty & Staff</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Campus Directory
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
          Find your teachers and staff across colleges, view their personal timelines, and leave them photos, videos, and tributes.
        </p>
      </div>

      {/* 4x3 Grid with Search, College Selection (Default: CTECH), Sort, and Pagination */}
      <TeacherGrid fetchTeachersFn={api.getTeachers} defaultCollege="CTECH" />
    </div>
  );
}

export default TeacherDirectory;
