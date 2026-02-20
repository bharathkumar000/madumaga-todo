import React from 'react';
import { CheckSquare, Check, Trash2, Pencil, Copy, RotateCw } from 'lucide-react';

const TasksView = React.memo(({ tasks, onToggleTask, onDeleteTask, onDuplicateTask, onEditTask, selectedMemberId, onClearMemberFilter, allUsers = [] }) => {
    const selectedMember = allUsers.find(u => u.id === selectedMemberId);

    const filteredTasks = selectedMemberId
        ? (tasks || []).filter(t => {
            const isAssigned = Array.isArray(t.assignedTo)
                ? t.assignedTo.includes(selectedMemberId)
                : t.assignedTo === selectedMemberId;
            return isAssigned || t.userId === selectedMemberId;
        })
        : (tasks || []);

    const getTaskColor = (task) => {
        const lookupId = Array.isArray(task.assignedTo) ? task.assignedTo[0] : task.assignedTo;
        const assignee = allUsers.find(u => u.id === lookupId) || allUsers.find(u => u.id === task.userId);
        const c = assignee?.color || task.color || 'blue';
        return c === 'blue' ? 'rgba(59, 130, 246, 0.4)' :
            c === 'green' ? 'rgba(16, 185, 129, 0.4)' :
                (c === 'amber' || c === 'yellow') ? 'rgba(245, 158, 11, 0.4)' :
                    c === 'rose' ? 'rgba(244, 63, 94, 0.4)' :
                        c === 'pink' ? 'rgba(236, 72, 153, 0.4)' :
                            c === 'teal' ? 'rgba(20, 184, 166, 0.4)' :
                                c === 'orange' ? 'rgba(249, 115, 22, 0.4)' :
                                    c === 'purple' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(255,255,255,0.05)';
    };

    const tagStyles = {
        'DESIGN': 'bg-[#2D1D32] text-[#EC4899]',
        'MEETING': 'bg-[#1E293B] text-[#3B82F6]',
        'DEV': 'bg-[#32231D] text-[#F97316]',
        'NEW': 'bg-[#1E293B] text-[#3B82F6]',
        'default': 'bg-[#1F2937] text-gray-300'
    };

    return (
        <div className="flex flex-col h-full bg-[#0B0D10] text-white p-6 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <CheckSquare className="text-secondary" />
                    <h2 className="text-2xl font-bold uppercase">
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
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-black text-gray-400 hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest active:scale-95 group"
                    >
                        <RotateCw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                        Refresh
                    </button>
                )}
            </div>

            {filteredTasks.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500 text-sm font-medium">
                        {selectedMember ? `No tasks assigned to ${selectedMember.name.toUpperCase()}` : 'No tasks yet'}
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
                                className={`relative overflow-hidden bg-[#16191D] rounded-xl border border-white/5 p-3 group transition-all hover:border-white/15 hover:shadow-[0_25px_60px_rgba(0,0,0,0.6)] ${task.completed ? 'opacity-50 grayscale-[0.5]' : ''}`}
                                style={{
                                    backgroundImage: !task.completed ? `
                                        radial-gradient(circle at top right, rgba(0,0,0,0.6) 0%, transparent 50%),
                                        radial-gradient(circle at bottom right, ${taskColor} 0%, transparent 70%)
                                    ` : 'none'
                                }}
                            >
                                {/* Ambient glows */}
                                {!task.completed && (
                                    <>
                                        <div
                                            className="absolute -top-12 -left-12 w-[140px] h-[140px] blur-[55px] rounded-full pointer-events-none opacity-25 group-hover:opacity-60 transition-all duration-700"
                                            style={{
                                                backgroundColor:
                                                    (() => {
                                                        const assignee = allUsers.find(u => u.id === task.assignedTo) || allUsers.find(u => u.id === task.userId);
                                                        const c = assignee?.color || task.color || 'blue';
                                                        return c === 'blue' ? '#3B82F6' : c === 'green' ? '#10B981' : (c === 'amber' || c === 'yellow') ? '#F59E0B' : c === 'rose' ? '#F43F5E' : c === 'pink' ? '#EC4899' : c === 'teal' ? '#14B8A6' : c === 'orange' ? '#F97316' : c === 'purple' ? '#A855F7' : '#8AB4F8';
                                                    })()
                                            }}
                                        />
                                        <div
                                            className="absolute -bottom-12 -right-12 w-[180px] h-[180px] blur-[55px] rounded-full pointer-events-none opacity-85 group-hover:opacity-100 transition-all duration-700"
                                            style={{
                                                backgroundColor:
                                                    (() => {
                                                        const assignee = allUsers.find(u => u.id === task.assignedTo) || allUsers.find(u => u.id === task.userId);
                                                        const c = assignee?.color || task.color || 'blue';
                                                        return c === 'blue' ? '#3B82F6' : c === 'green' ? '#10B981' : (c === 'amber' || c === 'yellow') ? '#F59E0B' : c === 'rose' ? '#F43F5E' : c === 'pink' ? '#EC4899' : c === 'teal' ? '#14B8A6' : c === 'orange' ? '#F97316' : c === 'purple' ? '#A855F7' : '#8AB4F8';
                                                    })()
                                            }}
                                        />
                                    </>
                                )}

                                {/* Header with Title and Priority */}
                                <div className="flex justify-between items-start mb-3 relative z-10 gap-4">
                                    <h4 className={`font-black text-lg uppercase tracking-tight relative z-10 line-clamp-2 ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                                        {task.title}
                                    </h4>
                                    {task.priority && (
                                        <div className={`shrink-0 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider border bg-black/40 backdrop-blur-md
                                            ${task.priority === 'HIGH' ? 'text-rose-400 border-rose-500/20' :
                                                task.priority === 'MEDIUM' ? 'text-amber-400 border-amber-500/20' :
                                                    'text-emerald-400 border-emerald-500/20'
                                            }`}>
                                            {task.priority}
                                        </div>
                                    )}
                                </div>
                                {task.description && (
                                    <p className="text-[10px] text-gray-500 font-medium italic mb-3 line-clamp-2 px-1 border-l border-white/10 ml-1">
                                        {task.description}
                                    </p>
                                )}

                                {/* Bottom row: tags + actions */}
                                <div className="flex items-center justify-between relative z-10 mt-auto">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {(() => {
                                            const lookupId = Array.isArray(task.assignedTo) ? task.assignedTo[0] : task.assignedTo;
                                            const assignee = allUsers.find(u => u.id === lookupId) || allUsers.find(u => u.id === task.userId);
                                            if (!assignee) return null;
                                            return (
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-black uppercase border border-white/20 shadow-lg
                                                    ${assignee.color === 'blue' ? 'bg-[#3B82F6]' :
                                                        assignee.color === 'green' ? 'bg-[#10B981]' :
                                                            assignee.color === 'rose' ? 'bg-[#F43F5E]' :
                                                                assignee.color === 'pink' ? 'bg-[#EC4899]' :
                                                                    assignee.color === 'teal' ? 'bg-[#14B8A6]' :
                                                                        assignee.color === 'orange' ? 'bg-[#F97316]' :
                                                                            assignee.color === 'purple' ? 'bg-[#A855F7]' :
                                                                                'bg-[#F59E0B]'}`}>
                                                    {(assignee.name?.charAt(0) || task.creatorInitial || 'B')?.toUpperCase()}
                                                </div>
                                            );
                                        })()}
                                        {(task.projectName || (task.tag && task.tag !== 'NEW')) && (
                                            <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black text-gray-500 uppercase tracking-widest line-clamp-2 max-w-[150px]">
                                                {task.projectName || task.tag}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action buttons area */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 scale-90 translate-x-1 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-300">
                                        {onEditTask && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onEditTask?.(task); }}
                                                className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-amber-400 hover:bg-black transition-all active:scale-95"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                        )}
                                        {onDuplicateTask && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDuplicateTask?.(task.id); }}
                                                className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-blue-400 hover:bg-black transition-all active:scale-95"
                                            >
                                                <Copy size={14} />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onToggleTask?.(task.id); }}
                                            className={`p-1.5 rounded-lg bg-white/5 border border-white/5 transition-all active:scale-95 ${task.completed ? 'text-emerald-400' : 'text-gray-400 hover:text-emerald-400 hover:bg-black'}`}
                                        >
                                            <Check size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDeleteTask?.(task.id); }}
                                            className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-red-400 hover:bg-black transition-all active:scale-95"
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
});

export default TasksView;
