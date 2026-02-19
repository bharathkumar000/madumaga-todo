// src/components/TaskWaitingList.jsx
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Inbox, Plus, Check, Trash2, Copy, Pencil } from 'lucide-react';

const TaskItem = ({ task, onToggleTask, onDeleteTask, onDuplicateTask, onEditTask, allUsers = [] }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: `waiting-${task.id}`,
        data: { type: 'Task', task }
    });

    const assignee = allUsers.find(u => u.id === task.assignedTo) || allUsers.find(u => u.id === task.userId);
    const assigneeColor = assignee?.color || task.color || 'blue';
    const initial = (assignee?.name?.charAt(0) || task.creatorInitial || 'B')?.toUpperCase();

    // 3 Colors: Blue (Bharath), Green (Srinivas), Amber/Yellow (Rishith)
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
        transition: isDragging ? 'none' : (transition || 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1), opacity 200ms ease'),
        opacity: isDragging ? 0.3 : 1,
        willChange: 'transform',
        backgroundImage: !task.completed ? `
            radial-gradient(circle at top right, rgba(0,0,0,0.6) 0%, transparent 50%),
            radial-gradient(circle at bottom right, ${taskColor} 0%, transparent 70%)
        ` : 'none',
        backgroundColor: task.completed ? '#1a1d21' : 'transparent'
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`p-3 rounded-lg border border-white/10 cursor-grab active:cursor-grabbing shadow-xl group relative overflow-hidden w-full transition-all duration-300
                ${task.completed ? 'opacity-50 grayscale-[0.5]' : 'hover:border-white/20 hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)]'}
            `}
        >
            {/* Ambient Glows */}
            {!task.completed && (
                <>
                    <div
                        className="absolute -top-12 -left-12 w-[140px] h-[140px] blur-[55px] rounded-full transition-all duration-700 pointer-events-none group-hover:opacity-60 opacity-25"
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
                        className="absolute -bottom-12 -right-12 w-[180px] h-[180px] blur-[55px] rounded-full transition-all duration-700 pointer-events-none group-hover:opacity-100 opacity-85"
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
                </>
            )}

            <div className="relative z-10">
                {/* Row 1: Avatar + Title */}
                <div className="flex items-center gap-2.5 mb-3">
                    <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white shadow-lg border-2 border-white/20 flex-shrink-0"
                        style={{
                            backgroundColor:
                                assigneeColor === 'blue' ? '#3B82F6' :
                                    assigneeColor === 'green' ? '#10B981' :
                                        (assigneeColor === 'amber' || assigneeColor === 'yellow') ? '#F59E0B' :
                                            assigneeColor === 'rose' ? '#F43F5E' :
                                                assigneeColor === 'pink' ? '#EC4899' :
                                                    assigneeColor === 'teal' ? '#14B8A6' :
                                                        assigneeColor === 'orange' ? '#F97316' :
                                                            assigneeColor === 'purple' ? '#A855F7' : '#F59E0B'
                        }}
                    >
                        {initial}
                    </div>
                    <h3 className="text-base font-black text-white uppercase tracking-tight leading-tight drop-shadow-sm line-clamp-2">
                        {task.title}
                    </h3>
                </div>

                {/* Row 2: Badges (left) + Action icons pill (right) */}
                <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1">
                        {task.priority && (
                            <div className="px-2 py-1 rounded-md bg-white/10 border border-white/10 text-[8px] font-black text-cyan-400 uppercase tracking-widest">
                                {task.priority}
                            </div>
                        )}
                        {(task.projectName || (task.tag && task.tag !== 'NEW')) && (
                            <div className="px-2 py-1 rounded-md bg-white/10 border border-white/10 text-[8px] font-black text-gray-300 uppercase tracking-widest line-clamp-2 max-w-[120px]">
                                {task.projectName || task.tag}
                            </div>
                        )}
                    </div>

                    <div className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 scale-90 translate-x-1 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-300">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEditTask(task.id); }}
                            className="p-1.5 rounded-md text-white/40 hover:text-amber-400 hover:bg-black transition-all active:scale-90"
                        >
                            <Pencil size={12} strokeWidth={2} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDuplicateTask(task.id); }}
                            className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-black transition-all active:scale-90"
                        >
                            <Copy size={12} strokeWidth={2} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleTask(task.id); }}
                            className={`p-1.5 rounded-md transition-all active:scale-90 ${task.completed ? 'text-green-400' : 'text-white/40 hover:text-green-400 hover:bg-black'}`}
                        >
                            <Check size={12} strokeWidth={2} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                            className="p-1.5 rounded-md text-white/40 hover:text-rose-400 hover:bg-black transition-all active:scale-90"
                        >
                            <Trash2 size={12} strokeWidth={2} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TaskWaitingList = ({ tasks = [], onAddTask, onToggleTask, onDeleteTask, onDuplicateTask, onEditTask, allUsers = [] }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: 'WAITING',
    });

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col h-full p-2 bg-[#0D1117] transition-all duration-300 ${isOver ? 'bg-cyan-900/10 ring-2 ring-inset ring-cyan-500/30' : ''}`}
        >
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center">
                        <Inbox size={12} className="text-gray-400" />
                    </div>
                    <h2 className="text-[10px] font-black tracking-widest uppercase text-gray-400">Waiting Tasks</h2>
                </div>
                <span className="bg-white/5 text-[9px] font-black px-1.5 py-0.5 rounded text-gray-500 border border-white/5">
                    {tasks.length}
                </span>
            </div>

            <div
                className="flex-1 overflow-y-auto px-2 custom-scrollbar transition-colors flex flex-col gap-3"
            >
                <SortableContext items={tasks.map(t => `waiting-${t.id}`)} strategy={verticalListSortingStrategy}>
                    {tasks.map(task => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onToggleTask={onToggleTask}
                            onDeleteTask={onDeleteTask}
                            onDuplicateTask={onDuplicateTask}
                            onEditTask={onEditTask}
                            allUsers={allUsers}
                        />
                    ))}
                </SortableContext>
                {tasks.length === 0 && (
                    <div className="text-center text-gray-700 py-10 text-[9px] font-bold uppercase tracking-widest">
                        Waiting Tasks Empty
                    </div>
                )}
            </div>

            <div className="px-2 pt-4">
                <button
                    onClick={() => onAddTask({ date: null, status: 'WAITING' })}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-black text-[10px] uppercase tracking-[0.15em] text-gray-400 transition-all flex items-center justify-center gap-2 active:scale-95 group shadow-lg"
                >
                    <Plus size={14} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                    Quick Add
                </button>
            </div>
        </div>
    );
};

export default TaskWaitingList;
