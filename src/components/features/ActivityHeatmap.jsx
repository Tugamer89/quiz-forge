import { useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import { Flame, Activity } from 'lucide-react';
import { getLocalYYYYMMDD } from '../../utils/helpers';

const buildHeatmapData = (deckLog, todayDate, columns) => {
    const daysArray = [];
    const todayStr = getLocalYYYYMMDD(todayDate);
    let total = 0;

    const totalDaysToShow = columns * 7 - 1;

    for (let i = totalDaysToShow; i >= 0; i--) {
        const d = new Date(todayDate);
        d.setDate(todayDate.getDate() - i);
        const dateStr = getLocalYYYYMMDD(d);
        if (!dateStr) continue;

        const count = deckLog[dateStr] || 0;
        daysArray.push({ date: dateStr, count, nativeDate: d });
        total += count;
    }

    return { daysArray, total, todayStr };
};

const getMonthLabels = (daysArray, columns) => {
    const labels = [];
    let lastMonth = -1;

    for (let i = 0; i < columns; i++) {
        const dayIndex = i * 7;
        if (dayIndex >= daysArray.length) continue;

        const date = daysArray[dayIndex].nativeDate;
        const month = date.getMonth();
        if (month === lastMonth) continue;

        labels.push({
            name: date.toLocaleString('en-US', { month: 'short' }),
            index: i,
        });
        lastMonth = month;
    }

    return labels;
};

const getCurrentStreak = (deckLog, todayDate, todayStr) => {
    let streak = 0;
    const checkDate = new Date(todayDate);

    if (!deckLog[todayStr]) {
        checkDate.setDate(checkDate.getDate() - 1);
    }

    let safetyLimit = 5000;
    while (safetyLimit > 0) {
        const dStr = getLocalYYYYMMDD(checkDate);
        if (!dStr || deckLog[dStr] <= 0) break;

        checkDate.setDate(checkDate.getDate() - 1);
        streak++;
        safetyLimit--;
    }

    return streak;
};

// perf: Wrapped ActivityHeatmap in React.memo to prevent unnecessary re-renders when parent state changes (e.g., when user is typing in SidebarControls)
export const ActivityHeatmap = memo(({ deckLog = {} }) => {
    const COLUMNS = 104;

    const { days, currentStreak, totalCards, monthLabels } = useMemo(() => {
        const todayDate = new Date();
        const { daysArray, total, todayStr } = buildHeatmapData(deckLog, todayDate, COLUMNS);
        const labels = getMonthLabels(daysArray, COLUMNS);
        const streak = getCurrentStreak(deckLog, todayDate, todayStr);

        return { days: daysArray, currentStreak: streak, totalCards: total, monthLabels: labels };
    }, [deckLog]);

    const getColorClass = (count) => {
        if (count === 0) return 'bg-slate-100 dark:bg-slate-700/30';
        if (count <= 5) return 'bg-indigo-200 dark:bg-indigo-900/50';
        if (count <= 15) return 'bg-indigo-400 dark:bg-indigo-700/70';
        if (count <= 30) return 'bg-indigo-500 dark:bg-indigo-500/90';
        return 'bg-indigo-600 dark:bg-indigo-400';
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 text-slate-900 dark:text-white">
                    <Activity className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                    <h2 className="text-lg font-semibold">Deck Activity</h2>
                </div>
                <div
                    className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400"
                    title="Current daily streak for this deck"
                >
                    <Flame
                        className={`w-3.5 h-3.5 mr-1 ${currentStreak > 0 ? 'text-amber-500' : 'text-slate-400'}`}
                    />
                    <span
                        className={
                            currentStreak > 0 ? 'text-amber-700 dark:text-amber-500 font-bold' : ''
                        }
                    >
                        {currentStreak}
                    </span>
                </div>
            </div>

            <div className="sr-only">
                Current study streak for this deck is {currentStreak} days. Total cards reviewed:{' '}
                {totalCards}.
            </div>

            <div className="flex w-full mt-4">
                <div className="flex flex-col pr-2" aria-hidden="true">
                    <div className="h-4 mb-1 pt-1"></div>
                    <div className="flex flex-col justify-between text-[9px] text-slate-500 dark:text-slate-400 font-medium py-0.5 h-27">
                        <span>Mon</span>
                        <span>Wed</span>
                        <span>Fri</span>
                    </div>
                </div>

                <div
                    className="flex-1 overflow-hidden flex justify-end p-0.5 -m-0.5"
                    aria-hidden="true"
                >
                    <div className="flex flex-col">
                        {/* Months */}
                        <div
                            className="grid gap-1 w-full mb-1 pt-1"
                            style={{ gridTemplateColumns: `repeat(${COLUMNS}, 12px)` }}
                        >
                            {Array.from({ length: COLUMNS }).map((_, colIndex) => {
                                const label = monthLabels.find((m) => m.index === colIndex);
                                const isNearRightEdge = colIndex >= COLUMNS - 3;

                                return (
                                    <div
                                        key={label?.name || `col-${colIndex}`}
                                        className="relative h-4"
                                    >
                                        {label && (
                                            <span
                                                className={`absolute bottom-0 text-[9px] text-slate-500 dark:text-slate-400 font-medium leading-tight whitespace-nowrap z-10 ${isNearRightEdge ? 'right-0' : 'left-0'}`}
                                            >
                                                {label.name}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Heatmap */}
                        <div className="inline-grid grid-rows-7 grid-flow-col gap-1">
                            {days.map((day) => (
                                <div
                                    key={day.date}
                                    className={`w-3 h-3 rounded-sm ${getColorClass(day.count)} transition-colors hover:ring-1 hover:ring-slate-400 cursor-help`}
                                    title={
                                        day.count === 0
                                            ? `0 reviews on ${day.date}`
                                            : `${day.count} reviews on ${day.date}`
                                    }
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div
                className="flex items-center justify-between mt-4 text-[10px] text-slate-600 dark:text-slate-400"
                aria-hidden="true"
            >
                <span className="font-medium">{totalCards} reviews</span>
                <div className="flex items-center gap-1">
                    <span>Less</span>
                    <div className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-slate-700/30" />
                    <div className="w-2.5 h-2.5 rounded-sm bg-indigo-200 dark:bg-indigo-900/50" />
                    <div className="w-2.5 h-2.5 rounded-sm bg-indigo-400 dark:bg-indigo-700/70" />
                    <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500 dark:bg-indigo-500/90" />
                    <div className="w-2.5 h-2.5 rounded-sm bg-indigo-600 dark:bg-indigo-400" />
                    <span>More</span>
                </div>
            </div>
        </div>
    );
});

ActivityHeatmap.propTypes = {
    deckLog: PropTypes.object,
};
