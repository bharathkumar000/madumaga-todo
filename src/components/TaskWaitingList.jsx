// src/components/TaskWaitingList.jsx
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Inbox, Plus, Check, Trash2, Copy, Pencil } from 'lucide-react';

const TaskItem = ({ task, onToggleTask, onDeleteTask, onDuplicateTask, onEditTask }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
        data: { type: 'Task', task }
    });

    const taskColor = task.color?.includes('blue') ? 'rgba(59, 130, 246, 0.4)' :
        task.color?.includes('emerald') || task.color?.includes('green') ? 'rgba(16, 185, 129, 0.4)' :
            task.color?.includes('amber') || task.color?.includes('yellow') ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255,255,255,0.05)';

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

    // Map tags to specific colors for the waiting list look
    const tagStyles = {
        'DESIGN': 'bg-[#2D1D32] text-[#EC4899]',
        'MEETING': 'bg-[#1E293B] text-[#3B82F6]',
        'DEV': 'bg-[#32231D] text-[#F97316]',
        'default': 'bg-[#1F2937] text-gray-300'
    };

    const currentTagStyle = tagStyles[task.tag] || tagStyles.default;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`bg-[#16191D] px-3 py-2 rounded-[1.5rem] border border-white/5 cursor-grab active:cursor-grabbing shadow-2xl group touch-none relative overflow-hidden mx-auto max-w-[280px] w-full ${task.completed ? 'opacity-50 grayscale-[0.5]' : 'hover:border-white/20 hover:shadow-[0_25px_60px_rgba(0,0,0,0.6)]'}`}
        >
            {/* Ambient Secondary Glow (Top-Left) - Phase 2 */}
            <div
                className={`absolute -top-12 -left-12 w-[140px] h-[140px] blur-[55px] rounded-full transition-all duration-700 pointer-events-none group-hover:opacity-60
                    ${task.completed ? 'opacity-0' : 'opacity-25'}
                `}
                style={{
                    backgroundColor: task.color?.includes('blue') ? '#3B82F6' :
                        task.color?.includes('emerald') || task.color?.includes('green') ? '#10B981' :
                            task.color?.includes('amber') || task.color?.includes('yellow') ? '#F59E0B' : '#8AB4F8'
                }}
            ></div>

            {/* Ambient Primary Glow (Bottom-Right) - Synced to Task Color */}
            <div
                className={`absolute -bottom-12 -right-12 w-[180px] h-[180px] blur-[55px] rounded-full transition-all duration-700 pointer-events-none group-hover:opacity-100
                    ${task.completed ? 'opacity-0' : 'opacity-85'}
                `}
                style={{
                    backgroundColor: task.color?.includes('blue') ? '#3B82F6' :
                        task.color?.includes('emerald') || task.color?.includes('green') ? '#10B981' :
                            task.color?.includes('amber') || task.color?.includes('yellow') ? '#F59E0B' : '#8AB4F8'
                }}
            ></div>
            <div
                className={`absolute top-0 right-0 bottom-0 w-[40px] blur-[35px] pointer-events-none transition-all duration-700 group-hover:opacity-40
                    ${task.completed ? 'opacity-0' : 'opacity-20'}
                `}
                style={{
                    backgroundColor: task.color?.includes('blue') ? '#3B82F6' :
                        task.color?.includes('emerald') || task.color?.includes('green') ? '#10B981' :
                            task.color?.includes('amber') || task.color?.includes('yellow') ? '#F59E0B' : '#8AB4F8'
                }}
            ></div>

            <div className="relative z-10 px-4 py-3">
                <div className="flex justify-between items-start gap-4">
                    {/* Title & Tag Area */}
                    {/* Title & Tag Area */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                        <h3 className={`text-[15px] font-black tracking-tight leading-tight uppercase transition-all ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                            {task.title}
                        </h3>
                        <div className="mt-auto flex items-center gap-2 pt-3">
                            {/* User Icon - Premium Stamp Style */}
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-[0_2px_10px_rgba(0,0,0,0.5)] border border-white/20 relative overflow-hidden flex-shrink-0 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 ring-1 ring-white/10"
                                style={{
                                    background: `linear-gradient(135deg, ${taskColor.replace('0.4', '0.8')}, ${taskColor.replace('0.4', '0.2')})`,
                                    boxShadow: `0 4px 12px ${taskColor.replace('0.4', '0.3')}`
                                }}
                            >
                                <span className="relative z-10 drop-shadow-md">{task.creatorInitial || 'ID'}</span>
                                {/* Gloss Effect */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-50" />
                            </div>

                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-[0.1em] border border-white/5 bg-white/5 text-gray-500 ${currentTagStyle}`}>
                                {task.tag || 'TASK'}
                            </span>
                            {/* Priority Badge */}
                            {task.priority && (
                                <div className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${task.priority === 'High' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                                    task.priority === 'Mid' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    }`}>
                                    {task.priority || 'LOW'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions Area */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {/* 4-Button Grid */}
                        <div className="grid grid-cols-2 gap-1.5">
                            {/* Row 1: Edit & Duplicate */}
                            {/* Edit Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditTask(task.id);
                                }}
                                className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-amber-400/50 hover:text-amber-400 hover:bg-black transition-all active:scale-95"
                            >
                                <Pencil size={13} strokeWidth={3} />
                            </button>

                            {/* Duplicate Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDuplicateTask(task.id);
                                }}
                                className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-indigo-400/50 hover:text-indigo-400 hover:bg-black transition-all active:scale-95"
                            >
                                <Copy size={13} strokeWidth={3} />
                            </button>

                            {/* Row 2: Complete & Delete */}
                            {/* Complete Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleTask(task.id);
                                }}
                                className={`p-1.5 rounded-lg transition-all active:scale-95 border ${task.completed ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-white/5 border-white/5 text-emerald-400/50 hover:text-emerald-400 hover:bg-black'}`}
                            >
                                <Check size={13} strokeWidth={3} />
                            </button>

                            {/* Delete Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteTask(task.id);
                                }}
                                className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-rose-400/50 hover:text-rose-400 hover:bg-black transition-all active:scale-95"
                            >
                                <Trash2 size={13} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TaskWaitingList = ({ tasks = [], onAddTask, onToggleTask, onDeleteTask, onDuplicateTask, onEditTask }) => {
    const { setNodeRef } = useDroppable({
        id: 'WAITING',
    });

    return (
        <div className="flex flex-col h-full p-4 bg-[#0D1117]">
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <Inbox size={14} className="text-gray-400" />
                    </div>
                    <h2 className="text-sm font-black tracking-widest uppercase text-gray-300">Waiting List</h2>
                </div>
                <span className="bg-white/5 text-[10px] font-black px-2 py-0.5 rounded-md text-gray-500 border border-white/5">
                    {tasks.length}
                </span>
            </div>

            <div
                ref={setNodeRef}
                className="flex-1 overflow-y-auto pr-1 custom-scrollbar transition-colors flex flex-col gap-3"
            >
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map(task => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onToggleTask={onToggleTask}
                            onDeleteTask={onDeleteTask}
                            onDuplicateTask={onDuplicateTask}
                            onEditTask={onEditTask}
                        />
                    ))}
                </SortableContext>
                {tasks.length === 0 && (
                    <div className="text-center text-gray-500 py-10 text-xs font-medium">
                        Drop tasks here to move to backlog
                    </div>
                )}
            </div>

            <button
                onClick={onAddTask}
                className="mt-6 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-sm text-gray-300 transition-all flex items-center justify-center gap-2 active:scale-95 group"
            >
                <Plus size={18} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                Add Task
            </button>
        </div>
    );
};

export default TaskWaitingList;
