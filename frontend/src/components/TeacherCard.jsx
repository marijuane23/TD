import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldAlert, Award, Trash2 } from 'lucide-react';

export function TeacherCard({
  teacher,
  isAdmin = false,
  onSelect,
  onDelete,
  isSelected = false,
  onToggleSelect,
}) {
  // Generate initials for avatar fallback
  const getInitials = (name = '') => {
    return name
      .replace(/(Dr\.|Prof\.|Engr\.)/gi, '')
      .trim()
      .split(/\s+/)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const cardContent = (
    <div
      className={`relative glass-card glass-card-hover rounded-2xl p-5 flex flex-col items-center text-center h-full group transition-all duration-300 border border-slate-300/60 dark:border-slate-700/60 hover:border-bisu-gold dark:hover:border-bisu-gold ${
        isSelected ? 'ring-2 ring-bisu-gold shadow-lg shadow-bisu-gold/15 bg-bisu-gold/5 dark:bg-bisu-gold/10' : ''
      }`}
    >
      {/* Top-Left Selection Checkbox for Bulk Deletion (Admin mode only) */}
      {isAdmin && onToggleSelect && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(teacher.id);
          }}
          className="absolute top-3 left-3 z-10 cursor-pointer p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isSelected ? 'Deselect teacher' : 'Select teacher'}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}} // State handled by onToggleSelect parent
            className="w-4 h-4 rounded text-bisu-blue-600 focus:ring-bisu-gold cursor-pointer accent-bisu-blue-600 dark:accent-bisu-gold"
          />
        </div>
      )}

      {/* Top-Right Delete Action Button (Admin mode only) */}
      {isAdmin && onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(teacher);
          }}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
          title={`Delete ${teacher.name}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {/* Teacher Avatar / Photo */}
      <div className="relative mb-4 mt-1">
        {teacher.photo_url ? (
          <img
            src={teacher.photo_url}
            alt={teacher.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-bisu-gold shadow-md"
          />
        ) : (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-bisu-blue-800 to-bisu-blue-600 text-bisu-gold flex items-center justify-center text-xl sm:text-2xl font-black border-2 border-bisu-gold/50 shadow-md">
            {getInitials(teacher.name)}
          </div>
        )}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-bisu-gold text-slate-950 flex items-center justify-center shadow">
          <Award className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Teacher Name */}
      <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-bisu-blue-600 dark:group-hover:text-bisu-gold transition-colors line-clamp-2 mb-1.5">
        {teacher.name}
      </h3>

      {/* College Badge */}
      {teacher.college_name && (
        <span className="inline-block px-2 py-0.5 mb-1.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-bisu-blue-50 dark:bg-bisu-blue-950/60 text-bisu-blue-700 dark:text-bisu-gold border border-bisu-blue-100 dark:border-bisu-blue-900/40">
          {teacher.college_code ? `${teacher.college_code} • ` : ''}{teacher.college_name}
        </span>
      )}

      {/* Department (Optional or fallback) */}
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2 mb-4 flex-1">
        {teacher.department || (teacher.college_name ? '' : 'BISU Bilar Faculty')}
      </p>

      {/* Action CTA */}
      {isAdmin ? (
        <button
          onClick={() => onSelect(teacher)}
          className="w-full mt-auto flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-bisu-blue-700 hover:bg-bisu-blue-800 transition-colors shadow-sm"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-bisu-gold" />
          <span>Moderate Timeline</span>
        </button>
      ) : (
        <div className="w-full mt-auto flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-bisu-blue-700 dark:text-bisu-gold bg-bisu-blue-50 dark:bg-bisu-blue-950/50 group-hover:bg-bisu-blue-700 group-hover:text-white dark:group-hover:bg-bisu-gold dark:group-hover:text-slate-900 transition-all">
          <span>View Timeline</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      )}
    </div>
  );

  if (isAdmin) {
    return <div className="h-full">{cardContent}</div>;
  }

  return (
    <Link to={`/teachers/${teacher.slug}`} className="h-full block focus:outline-none focus:ring-2 focus:ring-bisu-gold/50 rounded-2xl">
      {cardContent}
    </Link>
  );
}

export default TeacherCard;
