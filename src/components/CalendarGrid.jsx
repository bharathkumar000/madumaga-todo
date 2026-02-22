import React, { useEffect, useRef, useState } from 'react';
import { format, addHours, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfDay, addDays, subDays } from 'date-fns';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Check, Trash2, RotateCw } from 'lucide-react';

const HourCell = React.memo(({ day, hour }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: `${day.toISOString()}-${hour}`,
    });

    return (
        <div
            ref={setNodeRef}
            className={`h-[50px] border-b border-r border-[#2A2E35] transition-colors relative ${isOver ? 'bg-primary/20' : ''}`}
        />
    );
});

const DraggableCalendarTask = React.memo(({ task, startHour, layout, onToggleTask, onDeleteTask, onUpdateTask, allUsers = [], currentUser }) => {
    const [isResizing, setIsResizing] = useState(false);
    const [resizeType, setResizeType] = useState(null); // 'top' or 'bottom'
    const [tempDuration, setTempDuration] = useState(task.duration || 60);
    const [tempStartHour, setTempStartHour] = useState(startHour);
    const taskRef = useRef(null);

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `calendar-${task.id}`,
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
            const deltaMinutes = Math.round(deltaY / 12.5) * 15; // 50px = 60min, 12.5px = 15min

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

    const hourHeight = 50;
    const ids = Array.isArray(task.assignedTo) ? task.assignedTo : (task.assignedTo ? [task.assignedTo] : []);
    const assignees = ids.map(id => allUsers.find(u => u.id === id)).filter(Boolean);

    const isMeAssigned = assignees.some(u => u.id === currentUser?.id);
    const myProfile = allUsers.find(u => u.id === currentUser?.id);

    const activeAssignee = isMeAssigned ? myProfile : (assignees[0] || allUsers.find(u => u.id === task.userId));
    const assigneeColor = activeAssignee?.color || 'blue';

    const { offset = 0, width = 88 } = layout || {};

    const taskColor = assigneeColor === 'blue' ? 'rgba(59, 130, 246, 0.4)' :
        assigneeColor === 'green' ? 'rgba(16, 185, 129, 0.4)' :
            (assigneeColor === 'amber' || assigneeColor === 'yellow') ? 'rgba(245, 158, 11, 0.4)' :
                assigneeColor === 'rose' ? 'rgba(244, 63, 94, 0.4)' :
                    assigneeColor === 'pink' ? 'rgba(236, 72, 153, 0.4)' :
                        assigneeColor === 'teal' ? 'rgba(20, 184, 166, 0.4)' :
                            assigneeColor === 'orange' ? 'rgba(249, 115, 22, 0.4)' :
                                assigneeColor === 'purple' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(255,255,255,0.05)';

    const style = {
        transform: CSS.Translate.toString(transform),
        top: `${tempStartHour * hourHeight}px`,
        height: `${(tempDuration / 60) * hourHeight - 4}px`,
        left: `${6 + offset}%`,
        width: `${width}%`,
        zIndex: isDragging ? 50 : isResizing ? 45 : 10 + Math.floor(offset),
        backgroundImage: !task.completed ? `
            radial-gradient(circle at top right, rgba(0,0,0,0.6) 0%, transparent 50%),
            radial-gradient(circle at bottom right, ${taskColor} 0%, transparent 70%)
        ` : 'none'
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
                className={`absolute -top-12 -left-12 w-[140px] h-[140px] blur-[55px] rounded-full transition-all duration-700 pointer-events-none group-hover:opacity-60
                    ${task.completed ? 'opacity-0' : 'opacity-25'}
                `}
                style={{
                    backgroundColor:
                        assigneeColor === 'blue' ? '#3B82F6' :
                            assigneeColor === 'green' ? '#10B981' :
                                (assigneeColor === 'amber' || assigneeColor === 'yellow') ? '#F59E0B' :
                                    assigneeColor === 'rose' ? '#F43F5E' :
                                        assigneeColor === 'pink' ? '#EC4899' :
                                            assigneeColor === 'teal' ? '#14B8A6' :
                                                assigneeColor === 'orange' ? '#F97316' :
                                                    assigneeColor === 'purple' ? '#A855F7' : '#8AB4F8'
                }}
            ></div>

            <div
                className={`absolute -bottom-12 -right-12 w-[180px] h-[180px] blur-[55px] rounded-full transition-all duration-700 pointer-events-none group-hover:opacity-100
                    ${task.completed ? 'opacity-0' : 'opacity-85'}
                `}
                style={{
                    backgroundColor:
                        assigneeColor === 'blue' ? '#3B82F6' :
                            assigneeColor === 'green' ? '#10B981' :
                                (assigneeColor === 'amber' || assigneeColor === 'yellow') ? '#F59E0B' :
                                    assigneeColor === 'rose' ? '#F43F5E' :
                                        assigneeColor === 'pink' ? '#EC4899' :
                                            assigneeColor === 'teal' ? '#14B8A6' :
                                                assigneeColor === 'orange' ? '#F97316' :
                                                    assigneeColor === 'purple' ? '#A855F7' : '#8AB4F8'
                }}
            ></div>

            <div
                {...listeners}
                className="relative z-10 flex flex-col h-full p-1.5 cursor-grab active:cursor-grabbing"
            >
                <div className="flex justify-between items-start gap-2 h-full">
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                        <div>
                            <div className="flex -space-x-1.5 mb-1 items-center">
                                {assignees.slice(0, 2).map((u, i) => (
                                    <div key={u.id} className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[7px] font-black uppercase border border-[#16191D] shadow-sm
                                        ${u.color === 'blue' ? 'bg-[#3B82F6]' :
                                            u.color === 'green' ? 'bg-[#10B981]' :
                                                u.color === 'rose' ? 'bg-[#F43F5E]' :
                                                    u.color === 'pink' ? 'bg-[#EC4899]' :
                                                        u.color === 'teal' ? 'bg-[#14B8A6]' :
                                                            u.color === 'orange' ? 'bg-[#F97316]' :
                                                                u.color === 'purple' ? 'bg-[#A855F7]' :
                                                                    'bg-[#F59E0B]'}`}
                                        style={{ zIndex: 10 - i }}
                                    >
                                        {u.avatar || (u.name?.charAt(0) || 'B').toUpperCase()}
                                    </div>
                                ))}
                                {assignees.length === 0 && (
                                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[7px] font-black uppercase border border-[#16191D]">
                                        {(task.creatorInitial || 'B').toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className={`font-black tracking-tight leading-tight uppercase text-[12px] line-clamp-2 ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
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
                                {(task.projectName || (task.tag && task.tag !== 'NEW')) && (
                                    <div className="mt-1 text-[7px] font-black text-white/30 uppercase tracking-[0.15em] border border-white/5 px-1.5 py-0.5 rounded bg-white/5 line-clamp-2 max-w-[100px]">
                                        {task.projectName || task.tag}
                                    </div>
                                )}
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

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 scale-90 translate-x-1 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-300">
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
});

const CalendarGrid = React.memo(({ tasks, onToggleTask, onDeleteTask, events = [], projects = [], onUpdateTask, selectedMemberId, onClearMemberFilter, allUsers = [], currentUser }) => {
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
                    container.scrollTop = scrollToHour * 50;

                    // Restore snapped movement for subsequent user scrolls
                    setTimeout(() => {
                        container.style.scrollSnapType = originalSnap;
                        container.style.scrollBehavior = originalSmooth;
                    }, 50);
                }
            });
        }
    }, [columnWidth, days]); // Only run when columnWidth or days change

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
                    <div className="sticky top-0 z-40 bg-[#16191D] h-[110px] border-b border-[#1E2025] flex flex-col items-center justify-center w-20 shadow-xl">
                        <div className="flex-1 flex items-center justify-center w-full border-b border-white/5">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Time</span>
                        </div>
                        <div className="h-14 flex items-center justify-center w-full bg-[#0F1115]">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest -rotate-90">Events</span>
                        </div>
                    </div>

                    {/* Time Labels */}
                    <div className="flex flex-col w-20 bg-[#0B0D10]">
                        {hours.map((hour) => (
                            <div key={hour} className="h-[50px] relative border-b border-transparent">
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

                        const getTypeColor = (type) => {
                            const t = type?.toUpperCase();
                            const colors = {
                                'HACKATHON': 'from-pink-500 to-rose-500 text-pink-500',
                                'WORKSHOP': 'from-purple-500 to-pink-600 text-purple-500',
                                'MEETUP': 'from-blue-400 to-cyan-500 text-blue-400',
                                'CONFERENCE': 'from-amber-400 to-orange-500 text-amber-500'
                            };
                            return colors[t] || 'from-pink-500 to-blue-500 text-pink-400';
                        };

                        return (
                            <div
                                key={day.toString()}
                                ref={isToday ? todayRef : null}
                                className="flex flex-col border-r border-[#1E2025] snap-start"
                                style={{ width: columnWidth || '300px' }}
                            >
                                {/* Day Header & Events Section (Sticky Top) */}
                                <div className="sticky top-0 z-20 bg-[#16191D] h-[110px] border-b border-[#1E2025] flex flex-col shadow-xl">
                                    {/* Date Header */}
                                    <div className="flex-1 flex flex-col items-center justify-center border-b border-white/5">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                                            <span>{format(day, 'MMM')}</span>
                                            <span className="opacity-50">•</span>
                                            <span>
                                                {isToday ? 'Today' :
                                                    isSameDay(day, addDays(new Date(), -1)) ? 'Yesterday' :
                                                        isSameDay(day, addDays(new Date(), 1)) ? 'Tomorrow' :
                                                            format(day, 'EEE')}
                                            </span>
                                        </div>

                                        <div className={`w-8 h-8 flex items-center justify-center rounded-full text-base font-bold transition-all ${isToday
                                            ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/40 transform scale-105'
                                            : 'text-gray-200'
                                            }`}>
                                            {format(day, 'd')}
                                        </div>
                                    </div>

                                    {/* Dedicated Large High-Visibility Events Row */}
                                    <div className="h-14 bg-[#0F1115] flex items-center px-4 gap-2 overflow-x-auto custom-scrollbar-hide">
                                        {dayEvents.length > 0 ? (
                                            dayEvents.map(event => {
                                                const colors = getTypeColor(event.type);
                                                const textCol = colors.split(' ').pop();
                                                const grad = colors.split(' ').slice(0, 2).join(' ');

                                                return (
                                                    <div
                                                        key={event.id}
                                                        className="flex items-center gap-2.5 bg-white/[0.04] border border-white/10 px-4 py-1.5 rounded-2xl shrink-0 h-[42px] shadow-lg shadow-black/40 min-w-[140px]"
                                                    >
                                                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${grad} animate-pulse shadow-[0_0_12px_rgba(79,70,229,0.5)]`}></div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className={`text-[10px] font-black ${textCol} truncate uppercase tracking-wider leading-tight`}>
                                                                {event.title}
                                                            </span>
                                                            <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest leading-none mt-0.5 opacity-80">
                                                                {projects.find(p => p.id === event.projectId)?.name || 'General'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <span className="text-[9px] font-black text-gray-800 uppercase tracking-[0.3em] ml-2 italic opacity-50">Operational Idle</span>
                                        )}
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
                                                    allUsers={allUsers}
                                                    currentUser={currentUser}
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
            {selectedMemberId && (
                <div className="absolute top-6 right-8 z-[100]">
                    <button
                        onClick={onClearMemberFilter}
                        className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-pink-600 text-white text-xs font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(236,72,153,0.4)] hover:bg-pink-700 transition-all active:scale-95 group border border-white/10"
                    >
                        <RotateCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                        Refresh
                    </button>
                </div>
            )}
        </div>
    );
});

export default CalendarGrid;
