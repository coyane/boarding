import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Lock, Unlock, Calendar, CheckCircle2, X } from 'lucide-react';

const DAYS_OF_WEEK = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

type Mode = 'block' | 'unblock' | 'range';

interface Toast {
  message: string;
  show: boolean;
}

const AvailabilityCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<Mode>('block');
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>({ message: '', show: false });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ message: '', show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (message: string) => {
    setToast({ message, show: true });
  };

  const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const isPastDate = (date: Date): boolean => {
    return date < today;
  };

  const getBlockedDaysInMonth = (): number => {
    const days = getDaysInMonth(currentDate);
    return days.filter(day => day && blockedDates.has(formatDateKey(day))).length;
  };

  const getTotalDaysInMonth = (): number => {
    const days = getDaysInMonth(currentDate);
    return days.filter(day => day && !isPastDate(day)).length;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const days: (Date | null)[] = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    if (isPastDate(date)) return;

    const dateKey = formatDateKey(date);

    if (mode === 'range') {
      if (!rangeStart) {
        setRangeStart(dateKey);
        setHoveredDate(null);
      } else {
        const startDate = new Date(rangeStart);
        const endDate = date;

        const start = startDate < endDate ? startDate : endDate;
        const end = startDate < endDate ? endDate : startDate;

        const newBlockedDates = new Set(blockedDates);
        let affectedDays = 0;

        const currentDate = new Date(start);
        while (currentDate <= end) {
          if (!isPastDate(currentDate)) {
            const key = formatDateKey(currentDate);
            const isCurrentlyBlocked = blockedDates.has(rangeStart);

            if (isCurrentlyBlocked) {
              newBlockedDates.delete(key);
            } else {
              newBlockedDates.add(key);
            }
            affectedDays++;
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }

        setBlockedDates(newBlockedDates);
        const action = blockedDates.has(rangeStart) ? 'liberados' : 'bloqueados';
        showToast(`${affectedDays} días ${action}`);
        setRangeStart(null);
        setHoveredDate(null);
      }
    } else {
      const newBlockedDates = new Set(blockedDates);

      if (mode === 'block') {
        newBlockedDates.add(dateKey);
        showToast('Día bloqueado');
      } else {
        newBlockedDates.delete(dateKey);
        showToast('Día liberado');
      }

      setBlockedDates(newBlockedDates);
    }
  };

  const handleMouseEnter = (date: Date) => {
    if (mode === 'range' && rangeStart && !isPastDate(date)) {
      setHoveredDate(formatDateKey(date));
    }
  };

  const cancelRangeSelection = () => {
    setRangeStart(null);
    setHoveredDate(null);
  };

  const isInRange = (date: Date): boolean => {
    if (!rangeStart || !hoveredDate) return false;

    const dateKey = formatDateKey(date);
    const start = new Date(rangeStart);
    const end = new Date(hoveredDate);
    const current = date;

    const rangeMin = start < end ? start : end;
    const rangeMax = start < end ? end : start;

    return current >= rangeMin && current <= rangeMax;
  };

  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth(currentDate);

  const canGoPrevious =
    currentDate.getFullYear() > today.getFullYear() ||
    (currentDate.getFullYear() === today.getFullYear() && currentDate.getMonth() > today.getMonth());

  const blockedDaysCount = getBlockedDaysInMonth();
  const totalDaysCount = getTotalDaysInMonth();
  const availableDaysCount = totalDaysCount - blockedDaysCount;

  const getModeInstructions = () => {
    if (mode === 'block') return 'Haz clic en los días que quieres bloquear';
    if (mode === 'unblock') return 'Haz clic en los días que quieres liberar';
    if (rangeStart) return 'Ahora selecciona la fecha final del rango';
    return 'Selecciona la fecha de inicio, luego la fecha final';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Mi Disponibilidad
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Gestiona los días que no estarás disponible
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="text-xs text-blue-600 font-medium mb-1">Disponibles</div>
              <div className="text-2xl font-bold text-blue-700">{availableDaysCount}</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
              <div className="text-xs text-red-600 font-medium mb-1">Bloqueados</div>
              <div className="text-2xl font-bold text-red-700">{blockedDaysCount}</div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <div className="text-xs text-gray-600 font-medium mb-1">Total</div>
              <div className="text-2xl font-bold text-gray-700">{totalDaysCount}</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-sm font-semibold text-gray-700 mb-3">Modo de Edición:</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setMode('block');
                  cancelRangeSelection();
                }}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  mode === 'block'
                    ? 'bg-red-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span className="text-sm">Bloquear</span>
              </button>
              <button
                onClick={() => {
                  setMode('unblock');
                  cancelRangeSelection();
                }}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  mode === 'unblock'
                    ? 'bg-green-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Unlock className="w-4 h-4" />
                <span className="text-sm">Desbloquear</span>
              </button>
              <button
                onClick={() => {
                  setMode('range');
                  setRangeStart(null);
                  setHoveredDate(null);
                }}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  mode === 'range'
                    ? 'bg-amber-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Rango</span>
              </button>
            </div>
          </div>

          {mode === 'range' && rangeStart && (
            <div className="mb-4 p-3 bg-amber-100 rounded-lg border border-amber-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  1/2
                </div>
                <span className="text-sm text-amber-800 font-medium">
                  Fecha de inicio seleccionada
                </span>
              </div>
              <button
                onClick={cancelRangeSelection}
                className="text-amber-700 hover:text-amber-900 transition-colors p-1"
                aria-label="Cancelar selección"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">💡 </span>
              {getModeInstructions()}
            </p>
          </div>

          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goToPreviousMonth}
              disabled={!canGoPrevious}
              className={`p-2 rounded-lg transition-colors ${
                canGoPrevious
                  ? 'hover:bg-gray-100 text-gray-700'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
              aria-label="Mes anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <h2 className="text-lg md:text-xl font-semibold text-gray-800 capitalize">
              {monthName}
            </h2>

            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="text-center text-xs md:text-sm font-semibold text-gray-600 py-2"
              >
                {day}
              </div>
            ))}

            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dateKey = formatDateKey(date);
              const isBlocked = blockedDates.has(dateKey);
              const isPast = isPastDate(date);
              const isToday = formatDateKey(date) === formatDateKey(today);
              const inRange = isInRange(date);

              const isRangeStart = rangeStart === dateKey;

              return (
                <button
                  key={dateKey}
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={() => handleMouseEnter(date)}
                  disabled={isPast}
                  className={`
                    aspect-square rounded-lg font-medium text-sm md:text-base
                    transition-all duration-200 select-none relative
                    ${isPast ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                    ${!isPast && !isBlocked && !isRangeStart && !inRange ? 'bg-white border-2 border-gray-300 hover:border-orange-400 hover:bg-orange-50 text-gray-800' : ''}
                    ${!isPast && isBlocked && !isRangeStart && !inRange ? 'bg-red-500 text-white border-2 border-red-500 hover:bg-red-600' : ''}
                    ${isToday && !isPast && !isRangeStart ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
                    ${inRange && !isPast && !isRangeStart ? 'bg-amber-200 border-2 border-amber-400' : ''}
                    ${isRangeStart ? 'bg-amber-500 text-white border-2 border-amber-600 ring-2 ring-amber-300' : ''}
                    active:scale-95
                  `}
                  aria-label={`${date.getDate()} de ${monthName}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {toast.show && (
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
              <div className="bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="font-medium">{toast.message}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
