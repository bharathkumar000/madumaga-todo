import React from 'react';
import { CheckSquare, Circle, CheckCircle2, Trash2, Pencil, Copy, X } from 'lucide-react';

const TasksView = ({ tasks, onToggleTask, onDeleteTask, onDuplicateTask, onEditTask, selectedMemberId, onClearMemberFilter, allUsers = [] }) => {
    const selectedMember = allUsers.find(u => u.id === selectedMemberId);

    const filteredTasks = selectedMemberId
        ? (tasks || []).filter(t => t.assignedTo === selectedMemberId)
        : (tasks || []);

    const getTaskColor = (task) => {
        return task.color?.includes('blue') ? 'rgba(59, 130, 246, 0.4)' :
            task.color?.includes('emerald') || task.color?.includes('green') ? 'rgba(16, 185, 129, 0.4)' :
                task.color?.includes('amber') || task.color?.includes('yellow') ? 'rgba(245, 158, 11, 0.4)' : 'rgba(59, 130, 246, 0.25)';
    };

    const tagStyles = {
        'DESIGN': 'bg-[#2D1D32] text-[#EC4899]',
        'MEETING': 'bg-[#1E293B] text-[#3B82F6]',
        'DEV': 'bg-[#32231D] text-[#F97316]',
        'NEW': 'bg-[#1E293B] text-[#3B82F6]',
        'default': 'bg-[#1F2937] text-gray-300'
    };

    const priorityStyles = {
        'HIGH': 'bg-red-500/10 text-red-400 border border-red-500/20',
        'MEDIUM': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
        'LOW': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    };

    return (
        <div className="flex flex-col h-full bg-[#0B0D10] text-white p-6 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <CheckSquare className="text-secondary" />
                    <h2 className="text-2xl font-bold">
                        {selectedMember ? `${selectedMember.name}'s Tasks` : 'All Tasks'}
                    </h2>
                    {selectedMember && (
                        <span className="text-xs text-gray-500 font-medium">
                            ({filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''})
                        </span>
                    )}
                </div>
                {selectedMemberId && (
                    <button
                        onClick={onClearMemberFilter}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                    >
                        <X size={14} />
                        Clear Filter
                    </button>
                )}
            </div>

            {filteredTasks.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500 text-sm font-medium">
                        {selectedMember ? `No tasks assigned to ${selectedMember.name}` : 'No tasks yet'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {filteredTasks.map((task) => {
                        const taskColor = getTaskColor(task);
                        const currentTagStyle = tagStyles[task.tag] || tagStyles.default;

                        return (
                            <div
                                key={task.id}
                                className={`relative overflow-hidden bg-[#16191D] rounded-[1.5rem] border border-white/5 p-4 group transition-all hover:border-white/15 hover:shadow-[0_25px_60px_rgba(0,0,0,0.6)] ${task.completed ? 'opacity-50 grayscale-[0.5]' : ''}`}
                                style={{
                                    backgroundImage: !task.completed ? `
                                        radial-gradient(circle at top right, rgba(0,0,0,0.6) 0%, transparent 50%),
                                        radial-gradient(circle at bottom right, ${taskColor} 0%, transparent 70%)
                                    ` : 'none'
                                }}
                            >
                                {/* Ambient glow */}
                                {!task.completed && (
                                    <div
                                        className="absolute -top-12 -left-12 w-[140px] h-[140px] blur-[55px] rounded-full pointer-events-none opacity-25 group-hover:opacity-60 transition-all duration-700"
                                        style={{ backgroundColor: taskColor }}
                                    />
                                )}

                                {/* Title */}
                                <h4 className={`font-black text-lg uppercase tracking-tight mb-3 relative z-10 ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                                    {task.title}
                                </h4>

                                {/* Bottom row: tags + actions */}
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {task.assignedTo && (() => {
                                            const assignee = allUsers.find(u => u.id === task.assignedTo);
                                            if (!assignee) return null;
                                            return (
                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black
                                                    ${assignee.color === 'blue' ? 'bg-[#3B82F6]' :
                                                        assignee.color === 'green' ? 'bg-[#10B981]' :
                                                            assignee.color === 'rose' ? 'bg-[#F43F5E]' :
                                                                assignee.color === 'indigo' ? 'bg-[#6366F1]' :
                                                                    'bg-[#F59E0B]'}`}>
                                                    {assignee.avatar || assignee.name?.charAt(0)}
                                                </div>
                                            );
                                        })()}
                                        {task.tag && (
                                            <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${currentTagStyle}`}>
                                                {task.tag}
                                            </span>
                                        )}
                                        {task.priority && (
                                            <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${priorityStyles[task.priority] || ''}`}>
                                                {task.priority}
                                            </span>
                                        )}
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {onEditTask && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onEditTask?.(task); }}
                                                className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 text-gray-400 hover:text-amber-400 transition-all"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                        )}
                                        {onDuplicateTask && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDuplicateTask?.(task.id); }}
                                                className="p-1.5 rounded-lg bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-all"
                                            >
                                                <Copy size={14} />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onToggleTask?.(task.id); }}
                                            className={`p-1.5 rounded-lg bg-white/5 transition-all ${task.completed ? 'text-emerald-400 hover:bg-emerald-500/20' : 'text-gray-400 hover:bg-emerald-500/20 hover:text-emerald-400'}`}
                                        >
                                            {task.completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDeleteTask?.(task.id); }}
                                            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TasksView;
