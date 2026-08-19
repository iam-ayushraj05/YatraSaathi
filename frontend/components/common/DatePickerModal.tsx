'use client';

import React, { useState } from 'react';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDeparture?: (dateStr: string) => void;
  onSelectReturn?: (dateStr: string) => void;
  onSelectDates?: (datesStr: string) => void;
  targetField?: 'depart' | 'return';
  isRange?: boolean;
}

export default function DatePickerModal({
  isOpen,
  onClose,
  onSelectDeparture,
  onSelectReturn,
  onSelectDates,
  targetField = 'depart',
  isRange = true
}: DatePickerModalProps) {
  const [activeTab, setActiveTab] = useState<'calendar' | 'flexible'>('calendar');
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  
  // Default present / today date
  const today = new Date();

  const [selectedStart, setSelectedStart] = useState<Date>(today);
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null);
  const [flexOption, setFlexOption] = useState<string>('exact');

  if (!isOpen) return null;

  // Month navigation
  const prevMonth = () => {
    setCurrentMonthDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const nextMonth = () => {
    setCurrentMonthDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  // Helper to format date label
  const formatDateLabel = (d: Date) => {
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Helper to generate days matrix for a given year and month
  const getDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    return { firstDay, totalDays };
  };

  const month1 = currentMonthDate;
  const month2 = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1);

  const m1Data = getDaysInMonth(month1.getFullYear(), month1.getMonth());
  const m2Data = getDaysInMonth(month2.getFullYear(), month2.getMonth());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleDateClick = (year: number, month: number, day: number) => {
    const clickedDate = new Date(year, month, day);
    const dateLabel = formatDateLabel(clickedDate);
    
    if (!isRange) {
      setSelectedStart(clickedDate);
      setSelectedEnd(null);
      if (onSelectDeparture) onSelectDeparture(dateLabel);
      if (onSelectDates) onSelectDates(dateLabel);
      onClose();
      return;
    }

    if (targetField === 'return') {
      setSelectedEnd(clickedDate);
      if (onSelectReturn) onSelectReturn(dateLabel);
      onClose();
      return;
    }

    // Default or targetField === 'depart'
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(clickedDate);
      setSelectedEnd(null);
      if (onSelectDeparture) onSelectDeparture(dateLabel);
      if (onSelectReturn) onSelectReturn(''); // Clear return date so it's not set in both
    } else if (clickedDate < selectedStart) {
      setSelectedStart(clickedDate);
      setSelectedEnd(null);
      if (onSelectDeparture) onSelectDeparture(dateLabel);
      if (onSelectReturn) onSelectReturn('');
    } else {
      setSelectedEnd(clickedDate);
      if (onSelectReturn) onSelectReturn(dateLabel);
      if (onSelectDates) onSelectDates(`${formatDateLabel(selectedStart)} — ${dateLabel}`);
      onClose();
    }
  };

  const isSelectedDay = (year: number, month: number, day: number) => {
    const d = new Date(year, month, day);
    if (selectedStart && d.toDateString() === selectedStart.toDateString()) return true;
    if (selectedEnd && d.toDateString() === selectedEnd.toDateString()) return true;
    return false;
  };

  const isInRangeDay = (year: number, month: number, day: number) => {
    if (!selectedStart || !selectedEnd) return false;
    const d = new Date(year, month, day);
    return d > selectedStart && d < selectedEnd;
  };

  const renderMonthGrid = (targetDate: Date, data: { firstDay: number; totalDays: number }) => {
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const daysArr = [];

    // Blank cells before day 1
    for (let i = 0; i < data.firstDay; i++) {
      daysArr.push(<div key={`blank-${i}`} className="h-9 sm:h-10"></div>);
    }

    // Actual days
    for (let day = 1; day <= data.totalDays; day++) {
      const isSelected = isSelectedDay(year, month, day);
      const inRange = isInRangeDay(year, month, day);
      const dateObj = new Date(year, month, day);
      const isPast = dateObj.setHours(0,0,0,0) < new Date().setHours(0,0,0,0);

      daysArr.push(
        <button
          key={`day-${day}`}
          disabled={isPast}
          onClick={() => handleDateClick(year, month, day)}
          className={`h-9 sm:h-10 w-full rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center transition-all cursor-pointer ${
            isPast 
              ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
              : isSelected
              ? 'bg-[#0071c2] text-white shadow-md font-black scale-105 z-10'
              : inRange
              ? 'bg-blue-100 dark:bg-blue-900/60 text-[#0071c2] dark:text-blue-300 rounded-none'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
          }`}
        >
          {day}
        </button>
      );
    }

    return daysArr;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
      <div className="bg-white dark:bg-[#121420] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 max-w-3xl w-full shadow-2xl space-y-6 text-slate-900 dark:text-white relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Top Tabs matching screenshot */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setActiveTab('calendar')}
            className={`pb-3 px-6 text-sm font-black transition-colors cursor-pointer ${
              activeTab === 'calendar' 
                ? 'text-[#0071c2] dark:text-blue-400 border-b-2 border-[#0071c2] dark:border-blue-400' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            Calendar
          </button>
          <button 
            onClick={() => setActiveTab('flexible')}
            className={`pb-3 px-6 text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'flexible' 
                ? 'text-[#0071c2] dark:text-blue-400 border-b-2 border-[#0071c2] dark:border-blue-400' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            I&apos;m flexible
          </button>
        </div>

        {activeTab === 'calendar' ? (
          <>
            {/* Dual Month View Header with Arrows */}
            <div className="flex items-center justify-between font-black text-sm sm:text-base px-2">
              <button 
                onClick={prevMonth}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                ‹
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 text-center">
                <div>{monthNames[month1.getMonth()]} {month1.getFullYear()}</div>
                <div className="hidden md:block">{monthNames[month2.getMonth()]} {month2.getFullYear()}</div>
              </div>

              <button 
                onClick={nextMonth}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                ›
              </button>
            </div>

            {/* Dual Month Grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Month 1 */}
              <div className="space-y-2">
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {renderMonthGrid(month1, m1Data)}
                </div>
              </div>

              {/* Month 2 */}
              <div className="space-y-2 hidden md:block">
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {renderMonthGrid(month2, m2Data)}
                </div>
              </div>

            </div>

            {/* Flexible Date Options Pills */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
              <div className="text-xs font-black text-slate-900 dark:text-white">
                Flexible date options
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'exact', label: 'Exact dates' },
                  { id: '1day', label: '± 1 day' },
                  { id: '2days', label: '± 2 days' },
                  { id: '3days', label: '± 3 days' },
                  { id: '7days', label: '± 7 days' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setFlexOption(item.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      flexOption === item.id 
                        ? 'bg-[#0071c2] text-white shadow' 
                        : 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="py-8 text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-[#0071c2]">calendar_today</span>
            <h4 className="font-black text-base">Flexible Trip Durations</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
              Choose a weekend, a week, or a full month anytime in the next 12 months for optimal step-free travel availability.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button 
                onClick={() => {
                  const end = new Date(today);
                  end.setDate(today.getDate() + 7);
                  onSelectDates?.(`${formatDateLabel(today)} — ${formatDateLabel(end)}`);
                  onClose();
                }}
                className="bg-[#0071c2] text-white text-xs font-black px-5 py-2.5 rounded-xl shadow cursor-pointer"
              >
                Select 1 Week
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
