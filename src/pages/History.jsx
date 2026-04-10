import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Book, ArrowLeft } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [activeDates, setActiveDates] = useState(new Set());

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const user = await base44.auth.me();
      if (!user) return;

      const records = await base44.entities.VerseHistory.filter({
        userId: user.email,
      });

      setHistory(records || []);

      // Build set of active dates
      const dates = new Set((records || []).map(r => r.date));
      setActiveDates(dates);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const isDateActive = (date) => {
    return activeDates.has(date);
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 bg-gray-50"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      const isActive = isDateActive(dateStr);

      days.push(
        <div
          key={day}
          className={`flex items-center justify-center h-10 rounded-lg text-sm font-medium transition-colors ${
            isActive
              ? 'bg-violet-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const monthName = selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1));
  };

  const historyThisMonth = history.filter(h => {
    const d = new Date(h.date);
    return d.getMonth() === selectedMonth.getMonth() && d.getFullYear() === selectedMonth.getFullYear();
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <Link to={createPageUrl('FaithWidget')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Scripture History</h1>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading your verse history...</div>
        ) : (
          <>
            {/* Calendar View */}
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-violet-600" />
                {monthName}
              </h2>

              <div className="flex justify-between items-center mb-4">
                <Button variant="outline" size="sm" onClick={prevMonth}>
                  ← Previous
                </Button>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  Next →
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
                {renderCalendar()}
              </div>

              <div className="mt-6 text-sm text-gray-600">
                <span className="inline-block w-4 h-4 bg-violet-500 rounded mr-2"></span>
                Days you checked your daily scripture: <strong>{activeDates.size}</strong>
              </div>
            </Card>

            {/* Verses for Current Month */}
            {historyThisMonth.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Book className="w-5 h-5 text-violet-600" />
                  Verses This Month ({historyThisMonth.length})
                </h2>

                <div className="space-y-3">
                  {historyThisMonth.map((record, idx) => (
                    <div key={idx} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-semibold text-violet-700">{record.reference}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(record.date).toLocaleDateString('default', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {history.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-gray-600 mb-4">No verses logged yet.</p>
                <p className="text-sm text-gray-500">
                  Check your daily verse on the FaithWidget page to start building your reading history.
                </p>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}