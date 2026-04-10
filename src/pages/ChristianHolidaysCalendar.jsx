import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Filter, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { buildChristianHolidays } from "@/utils/christianHolidayBuilder";
import HolidayCard from "@/components/holidays/HolidayCard";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function ChristianHolidaysCalendar() {
  const currentYear = new Date().getFullYear();
  const { language } = useLanguage();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const holidays = buildChristianHolidays(selectedYear);
  const [filterType, setFilterType] = useState("all");

  const filtered = filterType === "all" 
    ? holidays 
    : holidays.filter(h => h.type === filterType);

  const today = new Date().toISOString().split('T')[0];
  const upcomingCount = holidays.filter(h => h.date >= today).length;

  const getLocalizedTitle = (titleObj) => titleObj?.[language] || titleObj?.en || '';
  const getLocalizedDescription = (descObj) => descObj?.[language] || descObj?.en || '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Christian Holidays Calendar
                </h1>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => setSelectedYear(selectedYear - 1)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                    aria-label="Previous year"
                  >
                    <ChevronLeft size={18} className="text-slate-600" />
                  </button>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-3 py-1 border border-slate-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {[currentYear - 1, currentYear, currentYear + 1, currentYear + 2, currentYear + 3].map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setSelectedYear(selectedYear + 1)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                    aria-label="Next year"
                  >
                    <ChevronRight size={18} className="text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
            <Link
              to="/holiday-notifications"
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              <Bell size={18} />
              <span className="hidden sm:inline">Notifications</span>
            </Link>
          </div>
          <p className="text-slate-600">
            Celebrate the spiritual seasons and holy days of the Christian faith
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-lg bg-white border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-1">Total Holidays</p>
            <p className="text-2xl font-bold text-slate-900">{holidays.length}</p>
          </div>
          <div className="rounded-lg bg-white border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-1">Upcoming This Year</p>
            <p className="text-2xl font-bold text-purple-600">{upcomingCount}</p>
          </div>
          <div className="rounded-lg bg-white border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-1">Year</p>
            <p className="text-2xl font-bold text-slate-900">{selectedYear}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6 flex items-center gap-2">
          <Filter size={18} className="text-slate-600" />
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterType === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:border-purple-300"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("fixed")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterType === "fixed"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:border-blue-300"
              }`}
            >
              Fixed Dates
            </button>
            <button
              onClick={() => setFilterType("moving")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterType === "moving"
                  ? "bg-purple-600 text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:border-purple-300"
              }`}
            >
              Moving Holidays
            </button>
          </div>
        </div>

        {/* Holiday Grid */}
         <div className="space-y-3">
           {filtered.map((holiday) => (
             <Link
               key={holiday.id}
               to={`/holiday/${holiday.id}?year=${selectedYear}`}
               className="block"
             >
               <div className="rounded-lg bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition p-5">
                 <div className="flex items-start justify-between gap-4">
                   <div className="flex-1">
                     <h3 className="text-lg font-semibold text-slate-900">
                       {getLocalizedTitle(holiday.title)}
                     </h3>
                     <p className="text-sm text-slate-600 mt-1">
                       {holiday.date}
                     </p>
                     <p className="text-sm text-slate-700 mt-2">
                       {getLocalizedDescription(holiday.description)}
                     </p>
                   </div>
                   <div className="flex-shrink-0">
                     <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                       holiday.type === 'fixed' 
                         ? 'bg-blue-100 text-blue-700' 
                         : 'bg-purple-100 text-purple-700'
                     }`}>
                       {holiday.type === 'fixed' ? 'Fixed' : 'Moving'}
                     </span>
                   </div>
                 </div>
               </div>
             </Link>
           ))}
         </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600">No holidays found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}