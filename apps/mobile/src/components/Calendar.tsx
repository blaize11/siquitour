import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors, radius, spacing } from './theme';

interface CalendarProps {
  selectedDate?: string;
  startDate?: string;
  endDate?: string;
  onSelectDate?: (date: string) => void;
  onSelectDateRange?: (startDate: string, endDate?: string) => void;
  unavailableDates?: string[];
  bookedDates?: string[];
  minimumDate?: Date;
  maximumDate?: Date;
}

export function Calendar({
  selectedDate,
  startDate,
  endDate,
  onSelectDate,
  onSelectDateRange,
  unavailableDates = [],
  bookedDates = [],
  minimumDate = new Date(),
  maximumDate,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(minimumDate));
  const [tempStartDate, setTempStartDate] = useState(startDate || selectedDate || '');
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [isSelectingRange, setIsSelectingRange] = useState(!startDate && !selectedDate);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create array of weeks
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);
  }

  const isDateBooked = (day: number): boolean => {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    return bookedDates.includes(dateStr) || unavailableDates.includes(dateStr);
  };

  const isDateDisabled = (day: number): boolean => {
    const date = new Date(year, month, day);
    if (date < minimumDate) return true;
    if (maximumDate && date > maximumDate) return true;
    return false;
  };

  const isDateInRange = (day: number): boolean => {
    if (!tempStartDate || !tempEndDate) return false;
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    const start = new Date(tempStartDate);
    const end = new Date(tempEndDate);
    return date >= start && date <= end && dateStr !== tempStartDate && dateStr !== tempEndDate;
  };

  const isDateStartOrEnd = (day: number): boolean => {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    return dateStr === tempStartDate || dateStr === tempEndDate;
  };

  const isDateBookedInRange = (day: number): boolean => {
    if (!tempStartDate || !tempEndDate) return false;
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    const start = new Date(tempStartDate);
    const end = new Date(tempEndDate);

    if (dateStr === tempStartDate || dateStr === tempEndDate) {
      return isDateBooked(day);
    }

    return (
      isDateBooked(day) &&
      date >= start &&
      date <= end
    );
  };

  const handleDatePress = (day: number) => {
    if (isDateDisabled(day) || isDateBooked(day)) return;

    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];

    if (!isSelectingRange || !tempStartDate) {
      // Start new selection
      setTempStartDate(dateStr);
      setTempEndDate(undefined);
      setIsSelectingRange(true);
    } else {
      // Complete range selection
      const start = new Date(tempStartDate);
      const end = new Date(dateStr);

      // Check if any booked dates are in the range
      let hasBookedDates = false;
      const current = new Date(start);
      while (current <= end) {
        const currentStr = current.toISOString().split('T')[0];
        if (bookedDates.includes(currentStr) || unavailableDates.includes(currentStr)) {
          hasBookedDates = true;
          break;
        }
        current.setDate(current.getDate() + 1);
      }

      if (hasBookedDates) {
        // Can't select a range with booked dates - restart
        setTempStartDate(dateStr);
        setTempEndDate(undefined);
        return;
      }

      if (end < start) {
        // If end is before start, swap them
        setTempStartDate(dateStr);
        setTempEndDate(tempStartDate);
      } else if (dateStr === tempStartDate) {
        // If clicking same date, just use that day
        setTempEndDate(undefined);
      } else {
        setTempEndDate(dateStr);
      }

      setIsSelectingRange(false);
    }
  };

  const handleConfirm = () => {
    if (tempStartDate) {
      if (onSelectDate) {
        onSelectDate(tempStartDate);
      } else if (onSelectDateRange) {
        onSelectDateRange(tempStartDate, tempEndDate);
      }
      setIsSelectingRange(false);
    }
  };

  const handleReset = () => {
    setTempStartDate('');
    setTempEndDate(undefined);
    setIsSelectingRange(true);
  };

  const handlePrevMonth = () => {
    const prev = new Date(year, month - 1);
    if (prev >= minimumDate) {
      setCurrentDate(prev);
    }
  };

  const handleNextMonth = () => {
    const next = new Date(year, month + 1);
    if (!maximumDate || next <= maximumDate) {
      setCurrentDate(next);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDayCount = (): number => {
    if (!tempStartDate) return 0;
    if (!tempEndDate) return 1;
    const start = new Date(tempStartDate);
    const end = new Date(tempEndDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <View style={{ gap: spacing.xs }}>
      {/* Month/Year Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xs,
        marginBottom: spacing.xs,
      }}>
        <Pressable
          onPress={handlePrevMonth}
          style={{
            paddingHorizontal: spacing.xs,
            paddingVertical: 2,
            borderRadius: radius.sm,
            backgroundColor: colors.surface,
          }}
        >
          <Text style={{ fontSize: 12 }}>‹</Text>
        </Pressable>

        <Text style={{ fontSize: 12, textAlign: 'center', flex: 1, fontWeight: '600' }}>
          {monthNames[month]} {year}
        </Text>

        <Pressable
          onPress={handleNextMonth}
          style={{
            paddingHorizontal: spacing.xs,
            paddingVertical: 2,
            borderRadius: radius.sm,
            backgroundColor: colors.surface,
          }}
        >
          <Text style={{ fontSize: 12 }}>›</Text>
        </Pressable>
      </View>

      {/* Day names */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
        {dayNames.map((day) => (
          <Text
            key={day}
            style={{ fontSize: 10, textAlign: 'center', flex: 1, fontWeight: '600', color: colors.text }}
          >
            {day.slice(0, 2)}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
          {week.map((day, dayIndex) => {
            const isBooked = day !== null && isDateBooked(day);
            const isDisabled = day !== null && isDateDisabled(day);
            const isSelected = day !== null && isDateStartOrEnd(day);
            const inRange = day !== null && isDateInRange(day);
            const bookedInRange = day !== null && isDateBookedInRange(day);

            return (
              <Pressable
                key={dayIndex}
                onPress={() => day !== null && handleDatePress(day)}
                disabled={isDisabled || isBooked}
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 4,
                  backgroundColor: isSelected
                    ? colors.primary
                    : inRange
                      ? colors.primary + '40'
                      : bookedInRange
                        ? '#ffcccc'
                        : isBooked
                          ? '#f3f3f3'
                          : isDisabled
                            ? '#fafafa'
                            : 'transparent',
                  borderWidth: isSelected ? 0 : 0.5,
                  borderColor: isBooked ? '#e0e0e0' : 'transparent',
                  opacity: isDisabled ? 0.5 : 1,
                }}
              >
                {day !== null && (
                  <Text
                    style={{
                      fontSize: 11,
                      color: isSelected
                        ? '#fff'
                        : isBooked
                          ? '#999'
                          : inRange
                            ? colors.primary
                            : colors.text,
                      fontWeight: isSelected || inRange ? '600' : '400',
                    }}
                  >
                    {day}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}

      {/* Selected date range display */}
      {tempStartDate && (
        <View style={{ paddingHorizontal: spacing.xs, paddingTop: spacing.xs }}>
          <View style={{ backgroundColor: colors.surface, padding: spacing.xs, borderRadius: radius.sm, marginBottom: spacing.xs }}>
            <Text style={{ fontSize: 11, fontWeight: '600', marginBottom: 4, color: colors.primary }}>
              {tempStartDate}{tempEndDate && tempEndDate !== tempStartDate ? ` → ${tempEndDate}` : ''}
            </Text>
            <Text style={{ fontSize: 10, color: colors.primary }}>
              {getDayCount()} day{getDayCount() > 1 ? 's' : ''}
            </Text>
          </View>

          {isSelectingRange && tempEndDate === undefined && (
            <Text style={{ fontSize: 10, color: '#666', fontStyle: 'italic', marginBottom: spacing.xs }}>
              Click end date or Book
            </Text>
          )}

          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            <Pressable
              onPress={handleConfirm}
              disabled={!tempStartDate}
              style={{
                flex: 1,
                backgroundColor: colors.primary,
                paddingVertical: spacing.xs,
                borderRadius: radius.sm,
                alignItems: 'center',
                opacity: tempStartDate ? 1 : 0.5,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>Book</Text>
            </Pressable>

            <Pressable
              onPress={handleReset}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                paddingVertical: spacing.xs,
                borderRadius: radius.sm,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.text, fontWeight: '600', fontSize: 12 }}>Reset</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Legend */}
      <View style={{ marginTop: spacing.xs, paddingHorizontal: spacing.xs, flexDirection: 'row', flexWrap: 'wrap' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: spacing.md, marginBottom: 4 }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              backgroundColor: colors.primary,
              marginRight: 3,
            }}
          />
          <Text style={{ fontSize: 10 }}>Selected</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: spacing.md, marginBottom: 4 }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              backgroundColor: colors.primary + '40',
              marginRight: 3,
            }}
          />
          <Text style={{ fontSize: 10 }}>Range</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              backgroundColor: '#f3f3f3',
              borderWidth: 0.5,
              borderColor: '#e0e0e0',
              marginRight: 3,
            }}
          />
          <Text style={{ fontSize: 10 }}>Booked</Text>
        </View>
      </View>
    </View>
  );
}


