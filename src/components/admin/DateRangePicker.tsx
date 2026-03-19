import React, { useState } from 'react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface DateRangeValue {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  onClear: () => void;
  placeholder?: string;
  disabled?: boolean;
}

const toYMD = (d: Date) => format(d, 'yyyy-MM-dd');

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Select date range',
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);

  const selected: DateRange | undefined =
    value.startDate
      ? {
          from: new Date(value.startDate + 'T00:00:00'),
          to: value.endDate ? new Date(value.endDate + 'T00:00:00') : undefined,
        }
      : undefined;

  const hasValue = !!(value.startDate || value.endDate);

  const displayLabel = () => {
    if (!value.startDate && !value.endDate) return null;
    if (value.startDate && value.endDate)
      return `${format(new Date(value.startDate + 'T00:00:00'), 'MMM d, yyyy')} – ${format(new Date(value.endDate + 'T00:00:00'), 'MMM d, yyyy')}`;
    if (value.startDate)
      return `From ${format(new Date(value.startDate + 'T00:00:00'), 'MMM d, yyyy')}`;
    return `Until ${format(new Date(value.endDate + 'T00:00:00'), 'MMM d, yyyy')}`;
  };

  const handleSelect = (range: DateRange | undefined) => {
    if (!range) {
      onChange({ startDate: '', endDate: '' });
      return;
    }
    const start = range.from ? toYMD(range.from) : '';
    const end = range.to ? toYMD(range.to) : '';
    onChange({ startDate: start, endDate: end });
    // Close only when both dates are picked
    if (range.from && range.to) setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClear();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex items-center gap-2 h-9 px-3 rounded-md text-sm transition-colors',
            'border border-white/15 bg-white/5',
            'text-slate-400 hover:border-white/30 hover:text-slate-200',
            'focus:outline-none focus:border-violet-500 focus:text-slate-200',
            hasValue && 'border-violet-500/50 text-slate-200 bg-violet-500/8',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
          style={{ minWidth: 220 }}
        >
          <CalendarIcon size={15} className={cn('shrink-0', hasValue ? 'text-violet-400' : 'text-slate-500')} />
          <span className={cn('flex-1 text-left truncate', !hasValue && 'text-slate-500')}>
            {displayLabel() ?? placeholder}
          </span>
          {hasValue && (
            <span
              role="button"
              onClick={handleClear}
              className="shrink-0 rounded-full p-0.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <X size={13} />
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-auto p-0 border-white/10 bg-[#0f0f17] shadow-2xl"
        style={{ zIndex: 1400 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-white/8">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date Range</span>
          {hasValue && (
            <button
              onClick={handleClear}
              className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
            >
              <X size={11} /> Clear
            </button>
          )}
        </div>

        {/* Calendar */}
        <Calendar
          mode="range"
          selected={selected}
          onSelect={handleSelect}
          numberOfMonths={2}
          initialFocus
          className="p-3"
          classNames={{
            months: 'flex gap-4',
            month: 'space-y-3',
            caption: 'flex justify-center pt-1 relative items-center',
            caption_label: 'text-sm font-medium text-slate-200',
            nav: 'space-x-1 flex items-center',
            nav_button:
              'h-7 w-7 bg-transparent border border-white/10 rounded-md p-0 text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-colors flex items-center justify-center',
            nav_button_previous: 'absolute left-1',
            nav_button_next: 'absolute right-1',
            table: 'w-full border-collapse',
            head_row: 'flex',
            head_cell: 'text-slate-500 rounded-md w-9 font-normal text-[0.75rem] text-center',
            row: 'flex w-full mt-1',
            cell: cn(
              'h-9 w-9 text-center text-sm p-0 relative',
              '[&:has([aria-selected].day-range-end)]:rounded-r-md',
              '[&:has([aria-selected].day-outside)]:bg-violet-500/10',
              '[&:has([aria-selected])]:bg-violet-500/15',
              'first:[&:has([aria-selected])]:rounded-l-md',
              'last:[&:has([aria-selected])]:rounded-r-md',
              'focus-within:relative focus-within:z-20',
            ),
            day: 'h-9 w-9 p-0 font-normal text-slate-300 rounded-md hover:bg-white/8 hover:text-slate-100 transition-colors aria-selected:opacity-100',
            day_range_start: 'day-range-start !bg-violet-600 !text-white rounded-md',
            day_range_end: 'day-range-end !bg-violet-600 !text-white rounded-md',
            day_selected: '!bg-violet-600 !text-white hover:!bg-violet-500',
            day_today: 'bg-white/8 text-violet-400 font-semibold',
            day_outside: 'text-slate-600 opacity-50',
            day_disabled: 'text-slate-600 opacity-30 cursor-not-allowed',
            day_range_middle: 'aria-selected:bg-violet-500/15 aria-selected:text-slate-200 rounded-none',
            day_hidden: 'invisible',
          }}
        />

        {/* Footer hint */}
        <div className="px-4 pb-3 pt-1 border-t border-white/8">
          <p className="text-xs text-slate-500">
            {!selected?.from
              ? 'Click to select start date'
              : !selected?.to
              ? 'Click to select end date'
              : `${format(selected.from, 'MMM d')} – ${format(selected.to, 'MMM d, yyyy')}`}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;
