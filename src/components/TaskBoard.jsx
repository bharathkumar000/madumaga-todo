// src/components/TaskBoard.jsx
import React, { useMemo } from 'react';
import { MoreHorizontal, Calendar, Check, Trash2, Pencil, Copy, RotateCw, Trophy, MapPin, Box } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { isSameDay, isBefore, startOfDay, endOfWeek, endOfMonth, isAfter } from 'date-fns';

// Sortable Task Card Component
const BoardTask = React.memo(({ task, onToggleTask, onDeleteTask, onDuplicateTask, onEditTask, allUsers = [], currentUser }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: `board-${task.id}`,
        data: { type: 'Task', task }
    });

    // Color logic: if I am in the assigned list, show MY color
    // Otherwise show the first assignee's color
    const assignees = useMemo(() => {
        const ids = Array.isArray(task.assignedTo) ? task.assignedTo : (task.assignedTo ? [task.assignedTo] : []);
        return ids.map(id => allUsers.find(u => u.id === id)).filter(Boolean);
    }, [task.assignedTo, allUsers]);

    const nonMeAssignees = assignees.filter(u => u.id !== currentUser?.id);
    const isMeAssigned = assignees.some(u => u.id === currentUser?.id);
    const myProfile = allUsers.find(u => u.id === currentUser?.id);

    const activeAssignee = nonMeAssignees.length > 0 ? nonMeAssignees[0] : (isMeAssigned ? myProfile : allUsers.find(u => u.id === task.userId));
    const assigneeColor = activeAssignee?.color || 'blue';

    const taskColor = assigneeColor === 'blue' ? 'rgba(59, 130, 246, 0.4)' :
        assigneeColor === 'green' ? 'rgba(16, 185, 129, 0.4)' :
            (assigneeColor === 'amber' || assigneeColor === 'yellow') ? 'rgba(245, 158, 11, 0.4)' :
                assigneeColor === 'rose' ? 'rgba(244, 63, 94, 0.4)' :
                    assigneeColor === 'pink' ? 'rgba(236, 72, 153, 0.4)' :
                        assigneeColor === 'teal' ? 'rgba(20, 184, 166, 0.4)' :
                            assigneeColor === 'orange' ? 'rgba(249, 115, 22, 0.4)' :
                                assigneeColor === 'purple' ? 'rgba(168, 85, 247, 0.4)' :
                                    'rgba(255,255,255,0.05)';

    const style = {
        transform: CSS.Translate.toString(transform),
        transition: isDragging ? 'none' : (transition || 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1), opacity 200ms ease'),
        opacity: isDragging ? 0.3 : 1,
        willChange: 'transform',
        backgroundImage: !task.completed ? `
            radial-gradient(circle at top right, rgba(0,0,0,0.6) 0%, transparent 50%),
            radial-gradient(circle at bottom right, ${taskColor} 0%, transparent 70%)
        ` : 'none'
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-[#1C1F26]/20 px-3 py-2 rounded-lg border border-dashed border-gray-700 h-[100px]"
            />
        );
    }

    const tagStyles = {
        'DESIGN': 'bg-[#2D1D32] text-[#EC4899]',
        'MEETING': 'bg-[#1E293B] text-[#3B82F6]',
        'DEV': 'bg-[#32231D] text-[#F97316]',
        'default': 'bg-[#1F2937] text-gray-300'
    };

    const currentTagStyle = tagStyles[task.tag] || tagStyles.default;

    const colorGradients = {
        blue: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
        green: 'linear-gradient(135deg, #10B981, #059669)',
        amber: 'linear-gradient(135deg, #F59E0B, #D97706)',
        yellow: 'linear-gradient(135deg, #F59E0B, #D97706)',
        rose: 'linear-gradient(135deg, #F43F5E, #E11D48)',
        pink: 'linear-gradient(135deg, #EC4899, #BE185D)',
        teal: 'linear-gradient(135deg, #14B8A6, #0D9488)',
        orange: 'linear-gradient(135deg, #F97316, #EA580C)',
        purple: 'linear-gradient(135deg, #A855F7, #7E22CE)'
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`bg-[#16191D] px-2 py-1.5 rounded-lg border border-white/5 cursor-grab active:cursor-grabbing shadow-2xl group touch-none relative overflow-hidden w-full ${task.completed ? 'opacity-50 grayscale-[0.5]' : 'hover:border-white/20 hover:shadow-[0_25px_60px_rgba(0,0,0,0.6)] transition-all duration-300'} ${isDragging ? 'shadow-[0_0_30px_rgba(0,0,0,0.8)] border-white/20 rotate-2 scale-105 z-50' : 'hover:-translate-y-0.5'}`}
        >
            {/* Ambient Glows - Sync to task color */}
            <div
                className={`absolute -top-12 -left-12 w-[140px] h-[140px] blur-[55px] rounded-full transition-all duration-700 pointer-events-none group-hover:opacity-60
                    ${task.completed ? 'opacity-0' : 'opacity-25'}
                `}
                style={{
                    backgroundColor: assigneeColor === 'blue' ? '#3B82F6' :
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
                    backgroundColor: assigneeColor === 'blue' ? '#3B82F6' :
                        assigneeColor === 'green' ? '#10B981' :
                            (assigneeColor === 'amber' || assigneeColor === 'yellow') ? '#F59E0B' :
                                assigneeColor === 'rose' ? '#F43F5E' :
                                    assigneeColor === 'pink' ? '#EC4899' :
                                        assigneeColor === 'teal' ? '#14B8A6' :
                                            assigneeColor === 'orange' ? '#F97316' :
                                                assigneeColor === 'purple' ? '#A855F7' : '#8AB4F8'
                }}
            ></div>

            <div className="relative z-10 px-3 py-2">
                <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                        <div className="flex items-center gap-2 mb-1.5">
                            {/* Assignee Avatars - Left of Title */}
                            <div className="flex -space-x-2 flex-shrink-0">
                                {assignees.slice(0, 3).map((u, i) => (
                                    <div
                                        key={u.id}
                                        className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-md border border-[#16191D] relative overflow-hidden transition-transform hover:translate-y-[-2px] hover:z-20"
                                        style={{
                                            background: colorGradients[u.color || 'blue'] || colorGradients.blue,
                                            zIndex: 10 - i
                                        }}
                                    >
                                        <span className="relative z-10">
                                            {u.avatar && (u.avatar.startsWith('http') || u.avatar.startsWith('https')) ? (
                                                <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                u.avatar || (u.name?.charAt(0) || 'B').toUpperCase()
                                            )}
                                        </span>
                                    </div>
                                ))}
                                {assignees.length === 0 && (
                                    <div
                                        className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-md border border-[#16191D] relative overflow-hidden"
                                        style={{ background: colorGradients.blue }}
                                    >
                                        <span className="relative z-10">{(task.creatorInitial || 'B').toUpperCase()}</span>
                                    </div>
                                )}
                            </div>

                            <h3 className={`text-sm font-black tracking-tight leading-tight uppercase transition-all line-clamp-2 ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                                {task.title}
                            </h3>
                        </div>

                        {task.description && (
                            <p className="text-[9px] text-gray-500 font-medium italic mt-1 line-clamp-1 opacity-70">
                                {task.description}
                            </p>
                        )}

                        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
                            {task.date && (
                                <div className="flex items-center gap-1 text-[8px] text-gray-400 font-bold uppercase tracking-widest bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                    <Calendar size={8} />
                                    <span>{task.date}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {/* Priority & Project Badge area */}
                        <div className="flex flex-col items-end gap-1">
                            {task.priority && task.duration !== 60 && (
                                <div className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider border bg-black/40 backdrop-blur-md 
                                    ${task.priority === 'High' ? 'text-cyan-400 border-cyan-500/20' :
                                        task.priority === 'Mid' ? 'text-amber-400 border-amber-500/20' :
                                            'text-emerald-400 border-emerald-500/20'
                                    }`}>
                                    {task.priority}
                                </div>
                            )}

                            {(task.projectName || task.tag) && (
                                <span className="text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-[0.1em] border border-white/10 bg-white/10 text-gray-400 max-w-[80px] truncate text-right">
                                    {task.projectName || task.tag}
                                </span>
                            )}
                        </div>


                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all scale-90 translate-x-1 group-hover:translate-x-0 duration-300">
                            <button
                                onClick={(e) => { e.stopPropagation(); onToggleTask && onToggleTask(task.id); }}
                                className={`p-1.5 rounded-lg transition-all active:scale-95 border ${task.completed ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-white/5 border-white/5 text-emerald-400/50 hover:text-emerald-400 hover:bg-black'}`}
                            >
                                <Check size={13} strokeWidth={3} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDeleteTask && onDeleteTask(task.id); }}
                                className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-rose-400/50 hover:text-rose-400 hover:bg-black transition-all active:scale-95"
                            >
                                <Trash2 size={13} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
});

const BoardEvent = React.memo(({ event, projects = [] }) => {
    const getTypeColor = (type) => {
        const t = (type || '').toUpperCase();
        const colors = {
            'HACKATHON': 'from-violet-600 to-fuchsia-600 text-fuchsia-400 border-fuchsia-500/20 bg-fuchsia-500/10',
            'WORKSHOP': 'from-amber-500 to-orange-600 text-amber-400 border-amber-500/20 bg-amber-500/10',
            'COLLECTION': 'from-emerald-500 to-teal-500 text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
            'ROBOTICS': 'from-cyan-500 to-blue-600 text-cyan-400 border-cyan-500/20 bg-cyan-500/10'
        };
        return colors[t] || 'from-zinc-500 to-zinc-700 text-zinc-300 border-zinc-500/20 bg-zinc-500/10';
    };

    const colors = getTypeColor(event.type);
    const textCol = colors.split(' ').find(c => c.startsWith('text-')) || 'text-white';
    const grad = colors.split(' ').slice(0, 2).join(' ');
    const bgCol = colors.split(' ').find(c => c.startsWith('bg-')) || 'bg-white/[0.04]';
    const borderCol = colors.split(' ').find(c => c.startsWith('border-')) || 'border-white/10';

    const project = projects.find(p => p.id === event.projectId);

    return (
        <div className={`relative px-4 py-3 rounded-xl border ${borderCol} ${bgCol} shadow-xl group overflow-hidden transition-all hover:scale-[1.02] hover:shadow-2xl`}>
            {/* Subtle glow */}
            <div className={`absolute -right-4 -top-4 w-12 h-12 rounded-full ${bgCol} blur-xl opacity-40 group-hover:opacity-100 transition-opacity`}></div>

            <div className="relative z-10 flex flex-col gap-2">
                <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${grad} animate-pulse shadow-[0_0_8px_currentColor]`}></div>
                            <span className={`text-[9px] font-black ${textCol} uppercase tracking-widest`}>{event.type}</span>
                        </div>
                        <h3 className="text-sm font-black text-white leading-tight uppercase tracking-tight truncate group-hover:whitespace-normal">
                            {event.title}
                        </h3>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1 text-[8px] text-gray-500 font-bold uppercase tracking-widest">
                        <Calendar size={10} />
                        <span>{event.date}</span>
                    </div>
                    {event.location && (
                        <div className="flex items-center gap-1 text-[8px] text-gray-500 font-bold uppercase tracking-widest">
                            <MapPin size={10} />
                            <span className="truncate max-w-[80px]">{event.location}</span>
                        </div>
                    )}
                </div>

                {project && (
                    <div className="flex items-center gap-1.5 mt-1 pt-2 border-t border-white/5">
                        <Box size={10} className="text-gray-600" />
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest truncate">{project.name}</span>
                    </div>
                )}
            </div>
        </div>
    );
});

// Sortable Column Component
const Column = React.memo(({ id, title, count, color, tasks = [], events = [], projects = [], onToggleTask, onDeleteTask, onDuplicateTask, onEditTask, allUsers = [], currentUser }) => {
    const { setNodeRef } = useDroppable({
        id: id,
        data: { type: 'Column', id }
    });

    const totalCount = tasks.length + events.length;

    return (
        <div className="flex-1 min-w-[280px] max-w-[320px] flex flex-col h-full border-r border-[#1E2025] last:border-r-0 bg-[#0B0D10]">
            {/* Column Header */}
            <div className={`p-4 flex items-center justify-between border-t-2 ${color} bg-[#16191D] border-b border-white/[0.03]`}>
                <div className="flex items-center gap-3">
                    <h3 className="font-black text-gray-200 text-[10px] tracking-[0.2em] uppercase italic">
                        {title}
                    </h3>
                </div>
                <span className="text-[10px] font-black bg-white/5 text-gray-400 px-2 py-0.5 rounded-lg border border-white/5">
                    {totalCount}
                </span>
            </div>

            {/* Column Content */}
            <div
                ref={setNodeRef}
                className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4 bg-gradient-to-b from-[#0F1115] to-[#0B0D10]"
            >
                {/* Events Section */}
                {events.length > 0 && (
                    <div className="space-y-3 pb-2">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-[1px] flex-1 bg-white/5"></div>
                            <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.3em]">Live Events</span>
                            <div className="h-[1px] flex-1 bg-white/5"></div>
                        </div>
                        {events.map(event => (
                            <BoardEvent key={event.id} event={event} projects={projects} />
                        ))}
                    </div>
                )}

                {/* Tasks Section */}
                <SortableContext items={tasks.map(t => `board-${t.id}`)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                        {tasks.map((task) => (
                            <BoardTask
                                key={task.id}
                                task={task}
                                onToggleTask={onToggleTask}
                                onDeleteTask={onDeleteTask}
                                onDuplicateTask={onDuplicateTask}
                                onEditTask={onEditTask}
                                allUsers={allUsers}
                                currentUser={currentUser}
                            />
                        ))}
                    </div>
                </SortableContext>
            </div>
        </div>
    );
});

const TaskBoard = ({ tasks, events = [], projects = [], onToggleTask, onDeleteTask, onDuplicateTask, onEditTask, selectedMemberId, onClearMemberFilter, allUsers = [], currentUser }) => {
    const selectedMember = allUsers.find(u => u.id === selectedMemberId);
    
    // Categorization logic for both tasks and events
    const today = startOfDay(new Date());
    
    const getItemsByCategory = (category) => {
        const filteredTasks = tasks.filter(t => t.status === category);
        
        const filteredEvents = events.filter(e => {
            if (e.won || e.completed) return false;
            const eventDate = startOfDay(new Date(e.date));
            if (isNaN(eventDate.getTime())) return false;

            if (category === 'DELAYED') {
                return isBefore(eventDate, today);
            } else if (category === 'TODAY') {
                return isSameDay(eventDate, today);
            } else if (category === 'THIS_WEEK') {
                return isAfter(eventDate, today) && isBefore(eventDate, endOfWeek(today));
            } else if (category === 'THIS_MONTH') {
                return isAfter(eventDate, endOfWeek(today)) && isBefore(eventDate, endOfMonth(today));
            } else if (category === 'UPCOMING') {
                return isAfter(eventDate, endOfMonth(today));
            }
            return false;
        });

        return { tasks: filteredTasks, events: filteredEvents };
    };

    const categories = [
        { id: 'DELAYED', title: 'Delayed', color: 'border-t-orange-500' },
        { id: 'TODAY', title: 'Today', color: 'border-t-pink-500' },
        { id: 'THIS_WEEK', title: 'This week', color: 'border-t-blue-500' },
        { id: 'THIS_MONTH', title: 'This month', color: 'border-t-indigo-500' },
        { id: 'UPCOMING', title: 'Upcoming', color: 'border-t-yellow-500' },
        { id: 'waiting', title: 'Waiting List', color: 'border-t-gray-500' }
    ];

    return (
        <div className="flex flex-col h-full bg-[#0B0D10] text-white">
            {/* Top Bar / Filter Bar maintained for context */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-[#16191D]">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1 text-gray-400 text-sm font-medium">
                        <span className="text-secondary"><Calendar size={16} /></span>
                        <span className="uppercase">{selectedMember ? `${(selectedMember.name || 'Team member').toUpperCase()}'S Agenda` : 'Agenda'}</span>
                    </div>
                </div>
                {selectedMemberId && (
                    <button
                        onClick={onClearMemberFilter}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-gray-400 hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest active:scale-95 group"
                    >
                        <RotateCw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                        Refresh
                    </button>
                )}
            </div>

            <div className="flex-1 flex overflow-x-auto overflow-y-hidden">
                {categories.map(cat => {
                    const { tasks: catTasks, events: catEvents } = getItemsByCategory(cat.id);
                    return (
                        <Column 
                            key={cat.id} 
                            id={cat.id} 
                            title={cat.title} 
                            color={cat.color} 
                            tasks={catTasks} 
                            events={catEvents}
                            projects={projects}
                            onToggleTask={onToggleTask} 
                            onDeleteTask={onDeleteTask} 
                            onEditTask={onEditTask} 
                            onDuplicateTask={onDuplicateTask} 
                            allUsers={allUsers} 
                            currentUser={currentUser} 
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default TaskBoard;
