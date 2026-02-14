// src/components/TaskBoard.jsx
import React from 'react';
import { MoreHorizontal, Calendar, Check, Trash2 } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Task Card Component
const BoardTask = ({ task, onToggleTask, onDeleteTask }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
        data: { type: 'Task', task }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        backgroundImage: !task.completed ? `linear-gradient(135deg, ${task.color === 'blue' ? 'rgba(59, 130, 246, 0.25)' :
                task.color === 'green' ? 'rgba(16, 185, 129, 0.25)' :
                    task.color === 'amber' ? 'rgba(245, 158, 11, 0.25)' :
                        task.color === 'rose' ? 'rgba(244, 63, 94, 0.25)' :
                            task.color === 'indigo' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.05)'
            } 0%, rgba(22,25,29,0) 80%)` : 'none'
    };

    if (isDragging) {
        return null;
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`relative px-3 py-2 rounded-[1.5rem] border border-white/5 transition-all duration-500 overflow-hidden group touch-none cursor-grab active:cursor-grabbing
                ${task.completed ? 'bg-white/[0.02] grayscale-[0.5] opacity-50' : 'bg-[#16191D]'}
                hover:border-white/10 hover:shadow-[0_25px_60px_rgba(0,0,0,0.6)]
            `}
        >
            {/* Ambient Secondary Glow (Top-Left) - Phase 2 */}
            < div
                className={`absolute -top-10 -left-10 w-[120px] h-[120px] blur-[50px] rounded-full transition-all duration-700 pointer-events-none group-hover:opacity-60
                    ${task.completed ? 'opacity-0' : 'opacity-25'}
                `}
                style={{
                    backgroundColor:
                        task.color === 'blue' ? '#3B82F6' :
                            task.color === 'green' ? '#10B981' :
                                task.color === 'amber' ? '#F59E0B' :
                                    task.color === 'rose' ? '#F43F5E' :
                                        task.color === 'indigo' ? '#6366F1' : '#8AB4F8'
                }}
            ></div >

            {/* Ambient Primary Glow (Bottom-Right) - Synced to Task Color */}
            < div
                className={`absolute -bottom-10 -right-10 w-[160px] h-[160px] blur-[50px] rounded-full transition-all duration-700 pointer-events-none group-hover:opacity-100
                    ${task.completed ? 'opacity-0' : 'opacity-85'}
                `}
                style={{
                    backgroundColor:
                        task.color === 'blue' ? '#3B82F6' :
                            task.color === 'green' ? '#10B981' :
                                task.color === 'amber' ? '#F59E0B' :
                                    task.color === 'rose' ? '#F43F5E' :
                                        task.color === 'indigo' ? '#6366F1' : '#8AB4F8'
                }}
            ></div >
            <div
                className={`absolute top-0 right-0 bottom-0 w-[40px] blur-[35px] pointer-events-none transition-all duration-700 group-hover:opacity-40
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

            <div className="relative z-10 px-3 py-2.5">
                <div className="flex justify-between items-start gap-4">
                    {/* Title Area (IVC Style) */}
                    <div className="flex-1 min-w-0">
                        <h4 className={`font-black text-[13px] leading-tight tracking-tight uppercase transition-all ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                            {task.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[8px] uppercase font-black px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5 text-gray-500 tracking-wider">
                                {task.tag || 'Open'}
                            </span>
                            <div className="flex items-center gap-1 text-[8px] text-gray-600 font-bold uppercase tracking-tighter">
                                <Calendar size={9} />
                                <span>{task.date || 'No Date'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions & User Area */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {/* Priority Badge */}
                        {task.priority && (
                            <div className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${task.priority === 'High' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                                task.priority === 'Mid' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                }`}>
                                {task.priority}
                            </div>
                        )}

                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black bg-white/10 text-gray-400 border border-white/5">
                            {task.creatorInitial || 'ID'}
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleTask(task.id);
                                }}
                                className={`p-1 rounded-md transition-all active:scale-95 border ${task.completed ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-white/5 border-white/5 text-emerald-400/50 hover:text-emerald-400 hover:bg-emerald-500/10'}`}
                            >
                                <Check size={11} strokeWidth={3} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteTask(task.id);
                                }}
                                className="p-1 rounded-md bg-white/5 border border-white/5 text-rose-400/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all active:scale-95"
                            >
                                <Trash2 size={11} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

// Sortable Column Component
const Column = ({ id, title, count, color, tasks = [], onToggleTask, onDeleteTask }) => {
    const { setNodeRef } = useDroppable({
        id: id,
        data: { type: 'Column', id }
    });

    return (
        <div className="flex-1 min-w-[260px] max-w-[320px] flex flex-col h-full border-r border-gray-800 last:border-r-0 bg-[#0F1115]">
            {/* Column Header */}
            <div className={`p-4 border-t-2 ${color} bg-[#16191D]`}>
                <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-gray-200 text-xs tracking-widest uppercase">
                        {title} <span className="ml-2 text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-md">{tasks.length}</span>
                    </h3>
                    <button className="text-gray-500 hover:text-gray-300">
                        <MoreHorizontal size={14} />
                    </button>
                </div>
            </div>

            {/* Column Content */}
            <div
                ref={setNodeRef}
                className="flex-1 p-2 overflow-y-auto custom-scrollbar space-y-3 bg-[#0F1115]"
            >
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <BoardTask
                            key={task.id}
                            task={task}
                            onToggleTask={onToggleTask}
                            onDeleteTask={onDeleteTask}
                        />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
};

const TaskBoard = ({ tasks, onToggleTask, onDeleteTask }) => {
    const getTasksByStatus = (status) => tasks.filter(t => t.status === status);

    return (
        <div className="flex flex-col h-full bg-[#0B0D10] text-white">
            {/* Top Bar / Filter Bar maintained for context */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-[#16191D]">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1 text-gray-400 text-sm font-medium">
                        <span className="text-secondary"><Calendar size={16} /></span>
                        <span>Agenda</span>
                    </div>


                </div>
            </div>

            <div className="flex-1 flex overflow-x-auto overflow-y-hidden">
                <Column id="DELAYED" title="Delayed" color="border-t-orange-500" tasks={getTasksByStatus('DELAYED')} onToggleTask={onToggleTask} onDeleteTask={onDeleteTask} />
                <Column id="TODAY" title="Today" color="border-t-pink-500" tasks={getTasksByStatus('TODAY')} onToggleTask={onToggleTask} onDeleteTask={onDeleteTask} />
                <Column id="THIS_WEEK" title="This week" color="border-t-blue-500" tasks={getTasksByStatus('THIS_WEEK')} onToggleTask={onToggleTask} onDeleteTask={onDeleteTask} />
                <Column id="THIS_MONTH" title="This month" color="border-t-orange-300" tasks={getTasksByStatus('THIS_MONTH')} onToggleTask={onToggleTask} onDeleteTask={onDeleteTask} />
                <Column id="UPCOMING" title="Upcoming" color="border-t-yellow-500" tasks={getTasksByStatus('UPCOMING')} onToggleTask={onToggleTask} onDeleteTask={onDeleteTask} />
                <Column id="NO_DUE_DATE" title="No due date" color="border-t-teal-500" tasks={getTasksByStatus('NO_DUE_DATE')} onToggleTask={onToggleTask} onDeleteTask={onDeleteTask} />
            </div>
        </div>
    );
};

export default TaskBoard;
