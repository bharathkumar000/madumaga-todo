import React, { useEffect, useRef, useState } from 'react';
import { format, addHours, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfDay, addDays, subDays } from 'date-fns';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Check, Trash2 } from 'lucide-react';

const HourCell = ({ day, hour }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: `${day.toISOString()}-${hour}`,
    });

    return (
        <div
            ref={setNodeRef}
            className={`h-12 border-b border-r border-[#2A2E35] transition-colors relative ${isOver ? 'bg-primary/20' : ''}`}
        >
        </div>
    );
};

const DraggableCalendarTask = ({ task, startHour, layout, onToggleTask, onDeleteTask, onUpdateTask }) => {
    const [isResizing, setIsResizing] = useState(false);
    const [resizeType, setResizeType] = useState(null); // 'top' or 'bottom'
    const [tempDuration, setTempDuration] = useState(task.duration || 60);
    const [tempStartHour, setTempStartHour] = useState(startHour);
    const taskRef = useRef(null);

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        disabled: isResizing,
        data: { type: 'Task', task }
    });

    useEffect(() => {
        if (!isResizing) {
            setTempDuration(task.duration || 60);
            setTempStartHour(startHour);
        }
    }, [task.duration, startHour]);

    const handleResizeStart = (e, type) => {
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(true);
        setResizeType(type);

        const startY = e.clientY;
        const initialDuration = tempDuration;
        const initialStartHour = tempStartHour;

        const onMouseMove = (moveEvent) => {
            const deltaY = moveEvent.clientY - startY;
            const deltaMinutes = Math.round(deltaY / 12) * 15; // 48px = 60min, 12px = 15min

            if (type === 'bottom') {
                const newDuration = Math.max(15, initialDuration + deltaMinutes);
                setTempDuration(newDuration);
            } else if (type === 'top') {
                const newStartHourRaw = initialStartHour + deltaMinutes / 60;
                const newDuration = initialDuration - deltaMinutes;

                if (newDuration >= 15 && newStartHourRaw >= 0 && newStartHourRaw < 24) {
                    setTempStartHour(newStartHourRaw);
                    setTempDuration(newDuration);
                }
            }
        };

        const onMouseUp = () => {
            setIsResizing(false);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);

            // Finalize time update
            const h = Math.floor(tempStartHour);
            const m = Math.round((tempStartHour - h) * 60);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const displayH = h % 12 || 12;
            const newTime = `${displayH}:${m.toString().padStart(2, '0')} ${ampm}`;

            onUpdateTask(task.id, {
                duration: tempDuration,
                time: newTime
            });
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    if (isDragging) return null;

    const hourHeight = 48;
    const { offset = 0, width = 100 } = layout || {};

    const style = {
        transform: CSS.Translate.toString(transform),
        top: `${tempStartHour * hourHeight}px`,
        height: `${(tempDuration / 60) * hourHeight - 4}px`,
        left: `${6 + offset}%`,
        width: `${width}%`,
        zIndex: isDragging ? 50 : isResizing ? 45 : 10 + Math.floor(offset),
        backgroundImage: !task.completed ? `linear-gradient(135deg, ${task.color === 'blue' ? 'rgba(59, 130, 246, 0.25)' :
            task.color === 'green' ? 'rgba(16, 185, 129, 0.25)' :
                task.color === 'amber' ? 'rgba(245, 158, 11, 0.25)' :
                    task.color === 'rose' ? 'rgba(244, 63, 94, 0.25)' :
                        task.color === 'indigo' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.05)'
            } 0%, rgba(22,25,29,0) 80%)` : 'none'
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={`absolute px-2 py-1 rounded-xl transition-all ${isResizing ? '' : 'duration-500'} overflow-hidden group touch-none border border-white/10
                ${task.completed ? 'bg-white/[0.02] grayscale-[0.5] opacity-50' : 'bg-[#16191D]'}
                hover:border-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)] hover:scale-[1.02] hover:z-50
            `}
        >
            {/* Top Resize Handle */}
            <div
                onMouseDown={(e) => handleResizeStart(e, 'top')}
                className="absolute top-0 left-0 right-0 h-4 cursor-ns-resize z-50 opacity-0 group-hover:opacity-100 flex justify-center items-start pt-1"
            >
                <div className="w-12 h-1.5 bg-white/20 rounded-full hover:bg-white/40 transition-colors"></div>
            </div>

            {/* Bottom Resize Handle */}
            <div
                onMouseDown={(e) => handleResizeStart(e, 'bottom')}
                className="absolute bottom-0 left-0 right-0 h-4 cursor-ns-resize z-50 opacity-0 group-hover:opacity-100 flex justify-center items-end pb-1"
            >
                <div className="w-12 h-1.5 bg-white/20 rounded-full hover:bg-white/40 transition-colors"></div>
            </div>

            {/* Ambient Glows */}
            <div
                className={`absolute -top-10 -left-10 w-[100px] h-[100px] blur-[45px] rounded-full transition-all duration-700 pointer-events-none group-hover:opacity-60
                    ${task.completed ? 'opacity-0' : 'opacity-20'}
                `}
                style={{
                    backgroundColor:
                        task.color === 'blue' ? '#3B82F6' :
                            task.color === 'green' ? '#10B981' :
                                task.color === 'amber' ? '#F59E0B' :
                                    task.color === 'rose' ? '#F43F5E' :
                                        task.color === 'indigo' ? '#6366F1' : '#8AB4F8'
                }}
            ></div>

            <div
                className={`absolute -bottom-10 -right-10 w-[140px] h-[140px] blur-[45px] rounded-full transition-all duration-700 pointer-events-none group-hover:opacity-100
                    ${task.completed ? 'opacity-0' : 'opacity-80'}
                `}
                style={{
                    backgroundColor:
                        task.color === 'blue' ? '#3B82F6' :
                            task.color === 'green' ? '#10B981' :
                                task.color === 'amber' ? '#F59E0B' :
                                    task.color === 'rose' ? '#F43F5E' :
                                        task.color === 'indigo' ? '#6366F1' : '#8AB4F8'
                }}
            ></div>

            <div
                {...listeners}
                className="relative z-10 flex flex-col h-full p-1.5 cursor-grab active:cursor-grabbing"
            >
                <div className="flex justify-between items-start gap-2 h-full">
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                        <div>
                            <div className={`font-black tracking-tight leading-tight uppercase text-[12px] ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                                {task.title}
                            </div>
                            <div className="mt-1.5 flex flex-col gap-0.5">
                                <div className="text-[7px] font-black text-white/90 uppercase tracking-widest leading-none">
                                    {task.time} — {(() => {
                                        const match = task.time?.match(/(\d+):(\d+)\s?(AM|PM)/i);
                                        if (!match) return '';
                                        let h = parseInt(match[1]);
                                        const m = parseInt(match[2]);
                                        const ampm = match[3].toUpperCase();
                                        if (ampm === 'PM' && h < 12) h += 12;
                                        if (ampm === 'AM' && h === 12) h = 0;
                                        const d = new Date();
                                        d.setHours(h, m + tempDuration);
                                        return format(d, 'h:mm a');
                                    })()}
                                </div>
                                <div className="text-[7px] font-black text-white/40 uppercase tracking-widest leading-none">
                                    {tempDuration >= 60 ? `${Math.floor(tempDuration / 60)}h ${tempDuration % 60}m` : `${tempDuration}m`}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0 pointer-events-auto">
                        {task.priority && (
                            <div className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${task.priority === 'High' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                                task.priority === 'Mid' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                }`}>
                                {task.priority}
                            </div>
                        )}

                        <div className="flex items-center gap-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleTask(task.id);
                                }}
                                className={`p-1 rounded-md transition-all active:scale-95 border ${task.completed ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-white/5 border-white/5 text-emerald-400/50 hover:text-emerald-400 hover:bg-black'}`}
                            >
                                <Check size={10} strokeWidth={3} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteTask(task.id);
                                }}
                                className="p-1 rounded-md bg-white/5 border border-white/5 text-rose-400/50 hover:text-rose-400 hover:bg-black transition-all active:scale-95"
                            >
                                <Trash2 size={10} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

const CalendarGrid = ({ tasks, onToggleTask, onDeleteTask, events = [], onUpdateTask }) => {
    const scrollContainerRef = useRef(null);
    const todayRef = useRef(null);
    const [columnWidth, setColumnWidth] = useState(0);

    // Generate a range of dates: 30 days past, 30 days future
    const [days, setDays] = useState(() => {
        const today = new Date();
        return eachDayOfInterval({
            start: subDays(today, 30),
            end: addDays(today, 30)
        });
    });

    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Calculate column width dynamically to show exactly 3 days
    useEffect(() => {
        const updateWidth = () => {
            if (scrollContainerRef.current) {
                // Total available width minus the 80px time column
                const containerWidth = scrollContainerRef.current.clientWidth;
                const availableForDays = containerWidth - 80;
                setColumnWidth(availableForDays / 3);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    // Initial scroll to today
    useEffect(() => {
        if (todayRef.current && scrollContainerRef.current && columnWidth > 0) {
            const container = scrollContainerRef.current;

            // Wait for next frame to ensure the container has laid out its children
            requestAnimationFrame(() => {
                const todayIndex = days.findIndex(d => isSameDay(d, new Date()));
                if (todayIndex !== -1) {
                    // FORCE the scroll position by bypassing snapping/smoothness temporarily
                    const originalSnap = container.style.scrollSnapType;
                    const originalSmooth = container.style.scrollBehavior;

                    container.style.scrollSnapType = 'none';
                    container.style.scrollBehavior = 'auto';

                    // To have Today (todayIndex) in the middle of 3 columns, 
                    // Yesterday (todayIndex - 1) should be at the left edge.
                    const targetScroll = (todayIndex - 1) * columnWidth;

                    container.scrollLeft = targetScroll;

                    // Scroll to 8 AM vertically
                    const currentHour = new Date().getHours();
                    const scrollToHour = Math.max(0, currentHour - 1);
                    container.scrollTop = scrollToHour * 48;

                    // Restore snapped movement for subsequent user scrolls
                    setTimeout(() => {
                        container.style.scrollSnapType = originalSnap;
                        container.style.scrollBehavior = originalSmooth;
                    }, 50);
                }
            });
        }
    }, [columnWidth, days]);

    return (
        <div
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto overflow-y-auto bg-[#0B0D10] text-gray-300 relative custom-scrollbar h-full snap-x snap-mandatory scroll-smooth"
            style={{ scrollPaddingLeft: '80px' }}
        >
            <div className="flex min-w-max min-h-full">
                {/* Sticky Left Column: Time Labels & Corner */}
                <div className="sticky left-0 z-30 bg-[#0B0D10] border-r border-[#1E2025] flex flex-col flex-shrink-0">
                    {/* Top-Left Corner (Sticky Top & Left) */}
                    <div className="sticky top-0 z-40 bg-[#16191D] h-20 border-b border-[#1E2025] flex items-center justify-center w-20">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Time</span>
                    </div>

                    {/* Time Labels */}
                    <div className="flex flex-col w-20 bg-[#0B0D10]">
                        {hours.map((hour) => (
                            <div key={hour} className="h-12 relative border-b border-transparent">
                                <span className="absolute top-2 right-4 text-[10px] text-gray-500 font-bold uppercase">
                                    {format(addHours(startOfDay(new Date()), hour), 'h a')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Grid: Days Columns */}
                <div className="flex">
                    {days.map((day) => {
                        const isToday = isSameDay(day, new Date());
                        const dayEvents = events.filter(e => {
                            const eDate = new Date(e.date);
                            return isSameDay(eDate, day);
                        });

                        return (
                            <div
                                key={day.toString()}
                                ref={isToday ? todayRef : null}
                                className="flex flex-col border-r border-[#1E2025] snap-start"
                                style={{ width: columnWidth || '300px' }}
                            >
                                {/* Day Header (Sticky Top) */}
                                <div className="sticky top-0 z-20 bg-[#16191D] h-20 border-b border-[#1E2025] flex flex-col items-center justify-center">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                        <span>{format(day, 'MMM')}</span>
                                        <span className="opacity-50">•</span>
                                        <span>
                                            {isToday ? 'Today' :
                                                isSameDay(day, addDays(new Date(), -1)) ? 'Yesterday' :
                                                    isSameDay(day, addDays(new Date(), 1)) ? 'Tomorrow' :
                                                        format(day, 'EEE')}
                                        </span>
                                    </div>

                                    {/* Event Indicator - Moved between month/day and date */}
                                    {dayEvents.length > 0 && (
                                        <div className="mb-0.5 flex justify-center w-full px-2">
                                            <div className="flex items-center gap-1 bg-indigo-500/20 border border-indigo-500/20 px-2 py-0.5 rounded-full max-w-full scale-[0.85] origin-center shadow-[0_0_10px_rgba(79,70,229,0.1)]">
                                                <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse"></div>
                                                <span className="text-[9px] font-black text-indigo-400 truncate max-w-[80px] uppercase tracking-tighter">
                                                    {dayEvents[0].title}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className={`w-10 h-10 flex items-center justify-center rounded-full text-xl font-bold transition-all ${isToday
                                        ? 'bg-[#4F46E5] text-white shadow-lg shadow-indigo-500/40 transform scale-110'
                                        : 'text-gray-200'
                                        }`}>
                                        {format(day, 'd')}
                                    </div>
                                </div>

                                {/* Hour Cells for this Day */}
                                <div className="relative bg-[#0B0D10]">
                                    {hours.map((hour) => (
                                        <HourCell key={hour} day={day} hour={hour} />
                                    ))}

                                    {/* Tasks with Overlap Layout */}
                                    {(() => {
                                        const dayTasks = tasks
                                            .filter(task => {
                                                if (task.rawDate) return isSameDay(new Date(task.rawDate), day);
                                                if (!task.date) return false;
                                                const taskDate = new Date(task.date);
                                                return !isNaN(taskDate.getTime()) && isSameDay(taskDate, day);
                                            })
                                            .map(task => {
                                                let start = 9;
                                                if (task.time) {
                                                    const match = task.time.match(/(\d+):(\d+)\s?(AM|PM)/i);
                                                    if (match) {
                                                        let h = parseInt(match[1]);
                                                        const m = parseInt(match[2]);
                                                        const ampm = match[3].toUpperCase();
                                                        if (ampm === 'PM' && h < 12) h += 12;
                                                        if (ampm === 'AM' && h === 12) h = 0;
                                                        start = h + m / 60;
                                                    }
                                                }
                                                return { ...task, start, end: start + (task.duration || 60) / 60 };
                                            })
                                            .sort((a, b) => a.start - b.start);

                                        // Basic overlap algorithm
                                        const columns = [];
                                        dayTasks.forEach(task => {
                                            let placed = false;
                                            for (let i = 0; i < columns.length; i++) {
                                                const lastTaskInCol = columns[i][columns[i].length - 1];
                                                if (task.start >= lastTaskInCol.end) {
                                                    columns[i].push(task);
                                                    placed = true;
                                                    break;
                                                }
                                            }
                                            if (!placed) columns.push([task]);
                                        });

                                        return dayTasks.map(task => {
                                            const colIndex = columns.findIndex(col => col.some(t => t.id === task.id));
                                            const totalCols = columns.length;

                                            // Layout: Start at 6% (to avoid time column overlap), then offset
                                            // width: 85% to stay "big" and overlap slightly
                                            const offset = colIndex * 20;
                                            const width = 85;

                                            return (
                                                <DraggableCalendarTask
                                                    key={task.id}
                                                    task={task}
                                                    startHour={task.start}
                                                    layout={{ offset, width }}
                                                    onToggleTask={onToggleTask}
                                                    onDeleteTask={onDeleteTask}
                                                    onUpdateTask={onUpdateTask}
                                                />
                                            );
                                        });
                                    })()}

                                    {/* Current Time Line Overlay (Only if Today) */}
                                    {isToday && (
                                        <div
                                            className="absolute left-0 right-0 border-t-2 border-[#4F46E5] z-10 pointer-events-none"
                                            style={{
                                                top: `${(new Date().getHours() * 60 + new Date().getMinutes()) / 1440 * 100}%`
                                            }}
                                        >
                                            <div className="absolute -left-1 -top-[5px] w-2.5 h-2.5 rounded-full bg-[#4F46E5] shadow-[0_0_10px_rgba(79,70,229,0.8)]"></div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CalendarGrid;
