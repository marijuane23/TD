import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import api from '../api/client.js';
import TeacherGrid from '../components/TeacherGrid.jsx';
import AddTeacherForm from '../components/AddTeacherForm.jsx';
import ImportTeachersButton from '../components/ImportTeachersButton.jsx';
import ExportTeachersButton from '../components/ExportTeachersButton.jsx';
import AdminTimelineEntryList from '../components/AdminTimelineEntryList.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import bisuLogo from '../assets/bisubilar2009.png';
import {
  Users,
  MessageSquare,
  LogOut,
  UserPlus,
  ArrowLeft,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Search,
  Loader2,
  Calendar,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon,
} from 'lucide-react';

export function AdminDashboard() {
  const { admin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Sidebar Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Active Tab: 'teachers' | 'wall'
  const [activeTab, setActiveTab] = useState('teachers');

  // Teacher Management State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [gridRefreshKey, setGridRefreshKey] = useState(0);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [bulkDeletePayload, setBulkDeletePayload] = useState(null);

  // Selected Teacher for Timeline Moderation
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherMessages, setTeacherMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Public Wall Moderation State
  const [wallGreetings, setWallGreetings] = useState([]);
  const [wallLoading, setWallLoading] = useState(false);
  const [wallSearch, setWallSearch] = useState('');
  const [wallPage, setWallPage] = useState(1);
  const [greetingToDelete, setGreetingToDelete] = useState(null);

  // Logout Confirmation State
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleConfirmLogout = () => {
    logout();
    navigate('/');
  };

  // Single teacher deletion handler
  const handleConfirmDeleteTeacher = async () => {
    if (!teacherToDelete) return;
    try {
      await api.deleteAdminTeacher(teacherToDelete.id);
      setTeacherToDelete(null);
      setGridRefreshKey(k => k + 1);
    } catch (err) {
      alert(`Failed to delete teacher: ${err.message}`);
    }
  };

  // Bulk teachers deletion handler
  const handleConfirmBulkDeleteTeachers = async () => {
    if (!bulkDeletePayload || !bulkDeletePayload.ids?.length) return;
    try {
      await api.bulkDeleteAdminTeachers(bulkDeletePayload.ids);
      setBulkDeletePayload(null);
      setGridRefreshKey(k => k + 1);
    } catch (err) {
      alert(`Failed to bulk delete teachers: ${err.message}`);
    }
  };

  // Load selected teacher messages
  const handleSelectTeacher = async (teacher) => {
    setSelectedTeacher(teacher);
    setLoadingMessages(true);
    try {
      const data = await api.getAdminTeacherMessages(teacher.id);
      setTeacherMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load teacher messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Load Wall greetings when Wall tab is active
  useEffect(() => {
    if (activeTab === 'wall') {
      fetchWallGreetings();
    }
  }, [activeTab]);

  const fetchWallGreetings = async () => {
    setWallLoading(true);
    try {
      const res = await api.getWallGreetings({ limit: 150 });
      setWallGreetings(res.items || []);
    } catch (err) {
      console.error('Failed to load wall greetings:', err);
    } finally {
      setWallLoading(false);
    }
  };

  const handleConfirmDeleteWallGreeting = async () => {
    if (!greetingToDelete) return;
    try {
      await api.deleteAdminWallGreeting(greetingToDelete.id);
      setWallGreetings(prev => prev.filter(g => g.id !== greetingToDelete.id));
      setGreetingToDelete(null);
    } catch (err) {
      alert(`Failed to delete greeting: ${err.message}`);
    }
  };

  // 3x4 Grid Pagination calculation for Public Wall
  const filteredWallGreetings = wallGreetings.filter(g =>
    wallSearch
      ? g.message_text.toLowerCase().includes(wallSearch.toLowerCase()) ||
        (g.sender_name && g.sender_name.toLowerCase().includes(wallSearch.toLowerCase()))
      : true
  );

  const WALL_PAGE_SIZE = 12; // 3 columns x 4 rows
  const totalWallPages = Math.max(1, Math.ceil(filteredWallGreetings.length / WALL_PAGE_SIZE));
  const paginatedWallGreetings = filteredWallGreetings.slice(
    (wallPage - 1) * WALL_PAGE_SIZE,
    wallPage * WALL_PAGE_SIZE
  );

  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileDrawerOpen && (
        <div
          onClick={() => setIsMobileDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* LEFT SIDEBAR (Sticky on Desktop, Full Height, No Collapse Indicator Icon) */}
      <aside
        className={`fixed lg:relative top-0 bottom-0 left-0 h-full z-50 flex flex-col justify-between border-r border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shrink-0 transition-all duration-300 ease-in-out ${
          isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isSidebarCollapsed ? 'lg:w-20 w-72' : 'w-72'}`}
      >
        {/* Top Header of Sidebar: Admin Avatar & Identity (Indicator icon removed) */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <div
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer group select-none ${
              isSidebarCollapsed ? 'lg:justify-center justify-between' : 'justify-between'
            }`}
            title={isSidebarCollapsed ? 'Click Avatar to expand sidebar' : 'Click Avatar to collapse sidebar'}
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Admin Avatar with Official BISU Logo */}
              <div className="relative w-11 h-11 shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center">
                <img
                  src={bisuLogo}
                  alt="BISU Bilar"
                  className="w-11 h-11 object-contain drop-shadow"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 shadow-sm" />
              </div>

              {/* Admin Name & Role */}
              <div
                className={`text-left min-w-0 transition-opacity duration-200 ${
                  isSidebarCollapsed ? 'lg:hidden block' : 'block'
                }`}
              >
                <h2 className="text-sm font-black text-slate-900 dark:text-white truncate">
                  {admin?.username || 'Administrator'}
                </h2>
                <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Admin Portal</span>
                </p>
              </div>
            </div>

            {/* Mobile close button only (Desktop indicator icon removed) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileDrawerOpen(false);
              }}
              className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden shrink-0"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {/* Navigation Item 1: Faculty Directory */}
          <button
            onClick={() => {
              setActiveTab('teachers');
              setSelectedTeacher(null);
              setIsMobileDrawerOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 ${
              activeTab === 'teachers'
                ? 'bg-bisu-blue-700 text-white shadow-md shadow-bisu-blue/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            } ${isSidebarCollapsed ? 'lg:justify-center' : ''}`}
            title="Faculty Directory & Timelines"
          >
            <Users className="w-5 h-5 shrink-0" />
            <span
              className={`truncate transition-opacity duration-200 ${
                isSidebarCollapsed ? 'lg:hidden block' : 'block'
              }`}
            >
              Faculty Directory
            </span>
          </button>

          {/* Navigation Item 2: Public Wall Moderation */}
          <button
            onClick={() => {
              setActiveTab('wall');
              setIsMobileDrawerOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 ${
              activeTab === 'wall'
                ? 'bg-bisu-blue-700 text-white shadow-md shadow-bisu-blue/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            } ${isSidebarCollapsed ? 'lg:justify-center' : ''}`}
            title="Public Wall Greetings Moderation"
          >
            <MessageSquare className="w-5 h-5 shrink-0" />
            <div
              className={`flex items-center justify-between w-full min-w-0 transition-opacity duration-200 ${
                isSidebarCollapsed ? 'lg:hidden flex' : 'flex'
              }`}
            >
              <span className="truncate">Public Wall</span>
              {wallGreetings.length > 0 && (
                <span className="ml-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-bisu-gold/20 text-bisu-gold">
                  {wallGreetings.length}
                </span>
              )}
            </div>
          </button>
        </nav>

        {/* Sidebar Footer: Log Out Button (Prompts confirmation modal) */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 shrink-0">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors ${
              isSidebarCollapsed ? 'lg:justify-center' : ''
            }`}
            title="Log Out of Admin Session"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span
              className={`truncate transition-opacity duration-200 ${
                isSidebarCollapsed ? 'lg:hidden block' : 'block'
              }`}
            >
              Log Out
            </span>
          </button>
        </div>
      </aside>

      {/* MAIN LAYOUT WRAPPER (Topbar pinned, main content container scrolls) */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Main Topbar */}
        <header className="shrink-0 h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between z-20">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger to trigger sidebar drawer */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumbs / Section Title */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 truncate">
              <span className="text-slate-400 font-normal hidden sm:inline">Admin Portal</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline shrink-0" />
              <span className="text-slate-900 dark:text-white font-extrabold truncate">
                {selectedTeacher
                  ? `Moderating Timeline: ${selectedTeacher.name}`
                  : activeTab === 'teachers'
                  ? 'Faculty Directory & Timeline Oversight'
                  : 'Public Wall Greetings Moderation'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Dark / Light Mode Switch in Topbar */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-bisu-gold" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>


            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Session Live</span>
            </div>
          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT AREA (Only this container scrolls) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* TAB 1: FACULTY DIRECTORY & TIMELINES */}
            {activeTab === 'teachers' && (
              <div className="space-y-6">
                {!selectedTeacher ? (
                  <>
                    {/* Faculty Actions Header */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                      <div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                          Faculty Directory Oversight
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Manage teachers, bulk import/export rosters, or click any card to inspect and moderate its tributes.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          onClick={() => setIsAddModalOpen(true)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-bisu-blue-700 hover:bg-bisu-blue-800 shadow-sm transition-all"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Add Teacher</span>
                        </button>

                        <ImportTeachersButton onImportSuccess={() => setGridRefreshKey(k => k + 1)} />
                        <ExportTeachersButton />
                      </div>
                    </div>

                    {/* Shared 4x3 Teacher Grid in Admin Mode */}
                    <TeacherGrid
                      fetchTeachersFn={api.getAdminTeachers}
                      isAdmin={true}
                      onSelectTeacher={handleSelectTeacher}
                      onDeleteTeacher={(t) => setTeacherToDelete(t)}
                      onBulkDelete={(ids, items) => setBulkDeletePayload({ ids, count: ids.length })}
                      refreshTrigger={gridRefreshKey}
                    />
                  </>
                ) : (
                  /* Selected Teacher Timeline Moderation View */
                  <div className="space-y-6">
                    <div className="flex items-center justify-between glass-card p-5 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setSelectedTeacher(null)}
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Back to Faculty Grid"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                              Moderating Timeline for: {selectedTeacher.name}
                            </h2>
                            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-bisu-blue-100 dark:bg-bisu-blue-900/50 text-bisu-blue-800 dark:text-bisu-blue-300">
                              {teacherMessages.length} {teacherMessages.length === 1 ? 'Tribute' : 'Tributes'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {selectedTeacher.department} • Slug: <code className="text-bisu-blue-600 dark:text-bisu-gold">{selectedTeacher.slug}</code>
                          </p>
                        </div>
                      </div>

                      <a
                        href={`/teachers/${selectedTeacher.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-bisu-blue-600 dark:text-bisu-gold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span>View Public Timeline</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {loadingMessages ? (
                      <div className="py-20 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-bisu-gold mx-auto mb-2" />
                        <p className="text-xs text-slate-400">Loading messages for {selectedTeacher.name}...</p>
                      </div>
                    ) : (
                      <AdminTimelineEntryList
                        teacher={selectedTeacher}
                        messages={teacherMessages}
                        onMessageDeleted={(id) => setTeacherMessages(prev => prev.filter(m => m.id !== id))}
                        onMediaDeleted={(msgId) => {
                          setTeacherMessages(prev =>
                            prev.map(m => (m.id === msgId ? { ...m, media_id: null, media_url: null } : m))
                          );
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PUBLIC WALL GREETINGS MODERATION (3x4 Grid + Pagination) */}
            {activeTab === 'wall' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                      Public Wall Greetings Moderation
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Review and remove inappropriate greetings from the public wall. Showing 12 items per page in a 3×4 grid.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Search Wall Greetings */}
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Filter greetings..."
                        value={wallSearch}
                        onChange={(e) => {
                          setWallSearch(e.target.value);
                          setWallPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-bisu-gold/50"
                      />
                    </div>

                    {/* View Live Public Wall Button */}
                    <a
                      href="/wall"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-bisu-blue-700 hover:bg-bisu-blue-800 shadow-sm shadow-bisu-blue/20 hover:shadow transition-all shrink-0"
                      title="View Public Wall on live site"
                    >
                      <span>View Public Wall</span>
                      <ExternalLink className="w-4 h-4 text-bisu-gold" />
                    </a>
                  </div>
                </div>

                {wallLoading ? (
                  <div className="py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-bisu-gold mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Loading live wall greetings...</p>
                  </div>
                ) : filteredWallGreetings.length === 0 ? (
                  <div className="text-center py-16 glass-card rounded-2xl">
                    <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      {wallSearch ? 'No greetings match your search query.' : 'No public wall greetings found.'}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* 3x4 Grid Display */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {paginatedWallGreetings.map((item) => (
                        <div
                          key={item.id}
                          className="p-5 rounded-2xl glass-card flex flex-col justify-between space-y-3 h-full border border-slate-200/90 dark:border-slate-800/90 hover:shadow-md transition-shadow duration-200"
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                              <span className="font-bold text-slate-900 dark:text-white truncate max-w-[170px]">
                                {item.sender_name || 'Anonymous'}
                              </span>
                              <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full shrink-0">
                                #{item.id}
                              </span>
                            </div>
                            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
                              {item.message_text}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                            <span className="text-slate-400 text-[11px] flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Live'}
                            </span>
                            <button
                              onClick={() => setGreetingToDelete(item)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700 font-bold text-xs p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                              title="Delete greeting"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
                      <p className="text-xs text-slate-500">
                        Showing {(wallPage - 1) * WALL_PAGE_SIZE + 1} to{' '}
                        {Math.min(wallPage * WALL_PAGE_SIZE, filteredWallGreetings.length)} of{' '}
                        {filteredWallGreetings.length} greetings (Page {wallPage} of {totalWallPages})
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setWallPage(p => Math.max(1, p - 1))}
                          disabled={wallPage <= 1}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          title="Previous Page"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {wallPage} / {totalWallPages}
                        </span>

                        <button
                          onClick={() => setWallPage(p => Math.min(totalWallPages, p + 1))}
                          disabled={wallPage >= totalWallPages}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          title="Next Page"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Add Teacher Modal Form */}
            <AddTeacherForm
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onTeacherAdded={() => setGridRefreshKey(k => k + 1)}
            />

            {/* Single Teacher Deletion Confirm Dialog */}
            <ConfirmDialog
              isOpen={!!teacherToDelete}
              title="Delete Faculty Member?"
              message={`Are you sure you want to permanently delete "${teacherToDelete?.name}"? All associated tributes, messages, and uploaded media will be permanently removed.`}
              confirmText="Delete Teacher"
              onConfirm={handleConfirmDeleteTeacher}
              onCancel={() => setTeacherToDelete(null)}
            />

            {/* Bulk Teachers Deletion Confirm Dialog */}
            <ConfirmDialog
              isOpen={!!bulkDeletePayload}
              title={`Delete ${bulkDeletePayload?.count} Faculty Members?`}
              message={`Are you sure you want to permanently delete these ${bulkDeletePayload?.count} selected faculty members? All associated tributes, messages, and uploaded media will be permanently removed from the database.`}
              confirmText={`Delete ${bulkDeletePayload?.count} Teachers`}
              onConfirm={handleConfirmBulkDeleteTeachers}
              onCancel={() => setBulkDeletePayload(null)}
            />

            {/* Delete Wall Greeting Confirm Dialog */}
            <ConfirmDialog
              isOpen={!!greetingToDelete}
              title="Delete Wall Greeting?"
              message={`Are you sure you want to permanently delete greeting #${greetingToDelete?.id} by "${greetingToDelete?.sender_name || 'Anonymous'}" from the Public Wall?`}
              confirmText="Delete Greeting"
              onConfirm={handleConfirmDeleteWallGreeting}
              onCancel={() => setGreetingToDelete(null)}
            />

            {/* Logout Confirmation Dialog (Navigates to Hero section on confirm) */}
            <ConfirmDialog
              isOpen={isLogoutModalOpen}
              title="Log Out of Admin Portal?"
              message="Are you sure you want to end your administrator session? You will be signed out and returned to the celebration home page."
              confirmText="Log Out"
              onConfirm={handleConfirmLogout}
              onCancel={() => setIsLogoutModalOpen(false)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
