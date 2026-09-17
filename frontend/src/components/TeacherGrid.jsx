import React, { useState, useEffect } from 'react';
import TeacherCard from './TeacherCard.jsx';
import api from '../api/client.js';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Loader2, Users, Trash2, CheckSquare, GraduationCap } from 'lucide-react';

export function TeacherGrid({
  fetchTeachersFn,
  isAdmin = false,
  onSelectTeacher,
  onDeleteTeacher,
  onBulkDelete,
  refreshTrigger = 0,
  defaultCollege = 'CTECH',
}) {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState([]);

  // Filter & Pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCollege, setSelectedCollege] = useState(defaultCollege);
  const [collegesList, setCollegesList] = useState([
    { code: 'CTECH', name: 'CTECH (Technology)' },
    { code: 'CTE', name: 'CTE (Teacher Education)' },
    { code: 'CBM', name: 'CBM (Business & Mgmt)' },
    { code: 'CFES', name: 'CFES (Forestry & Env Sci)' },
    { code: 'COAS', name: 'COAS (Arts & Sciences)' },
    { code: 'CADS', name: 'CADS (Agriculture)' },
  ]);
  const [sortOption, setSortOption] = useState('name_asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce search input (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to page 1 on search change
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset selections when page, search, college, sort, or refresh trigger changes
  useEffect(() => {
    setSelectedIds([]);
  }, [currentPage, debouncedSearch, selectedCollege, sortOption, refreshTrigger]);

  // Load official colleges list
  useEffect(() => {
    let isMounted = true;
    api.getColleges()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCollegesList(data.map((c) => ({
            code: c.code,
            name: `${c.code}${c.name ? ` (${c.name})` : ''}`,
          })));
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Load teachers from backend API
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTeachersFn({
          q: debouncedSearch,
          college: selectedCollege,
          sort: sortOption,
          page: currentPage,
          limit: 12, // 4 cols x 3 rows
        });
        if (isMounted) {
          setTeachers(data.items || []);
          setTotalPages(data.totalPages || 1);
          setTotalCount(data.totalCount || 0);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load teachers.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, selectedCollege, sortOption, currentPage, refreshTrigger, fetchTeachersFn]);

  // Selection toggle handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    teachers.length > 0 && teachers.every((t) => selectedIds.includes(t.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(teachers.map((t) => t.id));
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Search, Filter & Count Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 glass-card p-4 rounded-2xl border border-slate-300/60 dark:border-slate-700/60">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by teacher name or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bisu-gold/50"
          />
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          {/* College Dropdown Select (Default: CTECH) */}
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-bisu-gold shrink-0" />
            <select
              value={selectedCollege}
              onChange={(e) => {
                setSelectedCollege(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-bisu-gold/50 cursor-pointer shadow-sm"
              title="Filter / Select College (Default: CTECH)"
            >
              <option value="CTECH">CTECH</option>
              <option value="CTE">CTE</option>
              <option value="CBM">CBM</option>
              <option value="CFES">CFES</option>
              <option value="COAS">COAS</option>
              <option value="CADS">CADS</option>
              <option value="all">All Colleges</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-bisu-gold/50 cursor-pointer"
            >
              <option value="name_asc">Name (A → Z)</option>
              <option value="name_desc">Name (Z → A)</option>
              <option value="college_asc">College (A → Z)</option>
              <option value="college_desc">College (Z → A)</option>
              <option value="department">By Department</option>
              <option value="newest">Newest Added</option>
            </select>
          </div>

          {/* Quick Select All Page button in Admin mode */}
          {isAdmin && teachers.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shrink-0"
              title={isAllSelected ? 'Deselect all faculty on this page' : 'Select all faculty on this page'}
            >
              <CheckSquare className={`w-4 h-4 ${isAllSelected ? 'text-bisu-gold' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">{isAllSelected ? 'Deselect All' : 'Select All'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Bulk Actions Bar (Admin Mode) */}
      {isAdmin && selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-bisu-blue-900/90 to-bisu-blue-950/95 border border-bisu-gold/40 text-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-bisu-gold text-slate-950 font-black text-xs">
              {selectedIds.length}
            </span>
            <span className="text-xs sm:text-sm font-bold">
              {selectedIds.length === 1 ? '1 faculty member selected' : `${selectedIds.length} faculty members selected`}
            </span>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs text-bisu-gold hover:underline font-semibold ml-1"
            >
              {isAllSelected ? 'Deselect page' : 'Select all on page'}
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (onBulkDelete) {
                  const selectedTeachers = teachers.filter((t) => selectedIds.includes(t.id));
                  onBulkDelete(selectedIds, selectedTeachers);
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/30 transition-all active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-bisu-gold mb-3" />
          <p className="text-sm font-medium">Loading faculty members...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-center text-red-600 dark:text-red-300">
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : teachers.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl border border-slate-300/60 dark:border-slate-700/60">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-1">No faculty found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm
              ? `No teachers match "${searchTerm}". Try a different keyword.`
              : selectedCollege && selectedCollege !== 'all'
              ? `No faculty currently listed under ${selectedCollege}. Try selecting another college or "All Colleges".`
              : 'No teachers in the directory yet.'}
          </p>
        </div>
      ) : (
        <>
          {/* 4-column desktop, 2-column mobile grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {teachers.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                teacher={teacher}
                isAdmin={isAdmin}
                onSelect={onSelectTeacher}
                onDelete={onDeleteTeacher}
                isSelected={selectedIds.includes(teacher.id)}
                onToggleSelect={handleToggleSelect}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">
                Showing {teachers.length} of {totalCount} teachers (Page {currentPage} of {totalPages})
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-bisu-blue-50 dark:bg-bisu-blue-950/60 text-bisu-blue-800 dark:text-bisu-gold">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default TeacherGrid;
