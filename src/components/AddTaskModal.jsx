// src/components/AddTaskModal.jsx
import React, { useState } from 'react';
import { X, Clock, AlignLeft, Calendar as CalendarIcon, Palette, Folder, ChevronLeft, ChevronRight } from 'lucide-react';
import { isSameDay, isBefore, startOfDay, endOfWeek, endOfMonth } from 'date-fns';

const AddTaskModal = ({ isOpen, onClose, onSave, users = [], currentUser, projects = [], taskToEdit }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('Task');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
    const [selectedColor, setSelectedColor] = useState(currentUser?.color || 'blue');
    const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
    const [viewDate, setViewDate] = useState(new Date()); // For calendar navigation
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [priority, setPriority] = useState('High');
    const [isPriorityOpen, setIsPriorityOpen] = useState(false);

    React.useEffect(() => {
        if (taskToEdit) {
            setTitle(taskToEdit.title);
            // setType(taskToEdit.type || 'Task'); // If you have types
            setDate(taskToEdit.date ? new Date(taskToEdit.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
            setPriority(taskToEdit.priority || 'High');
            // Logic for project and color if needed
        } else {
            // Reset fields for new task
            setTitle('');
            setPriority('High');
            setDate(new Date().toISOString().split('T')[0]);
        }
    }, [taskToEdit, isOpen]);

    const generateDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        // Previous month padding
        const prevMonthDays = new Date(year, month, 0).getDate();
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({ day: prevMonthDays - i, current: false, date: new Date(year, month - 1, prevMonthDays - i) });
        }
        // Current month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, current: true, date: new Date(year, month, i) });
        }
        // Next month padding
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ day: i, current: false, date: new Date(year, month + 1, i) });
        }
        return days;
    };

    if (!isOpen) return null;

    const handleSave = () => {
        if (!title.trim()) return;

        // Find the user assigned to this color
        const assignedUser = users.find(u => u.color === selectedColor) || users[0];
        const selectedProject = projects.find(p => String(p.id) === String(selectedProjectId));

        const colorClasses = {
            blue: 'rgba(59, 130, 246, 0.25)',
            green: 'rgba(16, 185, 129, 0.25)',
            amber: 'rgba(245, 158, 11, 0.25)',
            rose: 'rgba(244, 63, 94, 0.25)',
            indigo: 'rgba(99, 102, 241, 0.25)'
        };

        const selectedDate = new Date(date);
        const today = startOfDay(new Date());
        const taskDateObj = startOfDay(selectedDate);
        let status = 'WAITING';

        onSave({
            title,
            type,
            status,
            tag: 'NEW',
            userId: assignedUser?.id,
            creatorName: assignedUser?.name,
            creatorInitial: assignedUser?.name?.charAt(0),
            projectName: selectedProject?.name || 'General',
            color: selectedColor, // Store just the name for consistency with other parts
            isGradient: true,
            priority,
            date: selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        });
        setTitle('');
        setType('Task');
        setDate(new Date().toISOString().split('T')[0]);
        setSelectedColor(currentUser?.color || 'blue');
        setSelectedProjectId(projects[0]?.id || '');
        setPriority('High');
        onClose();
    };

    const activeUser = users.find(u => u.color === selectedColor);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] backdrop-blur-[6px]">
            <div
                className={`w-[520px] rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in duration-300 font-sans border border-white/10 relative group-modal`}
                style={{
                    backgroundColor: '#16191D',
                }}
            >
                {/* Vibrant Bottom-Right Ambient Glows */}
                <div
                    className="absolute -bottom-20 -right-20 w-[400px] h-[400px] blur-[100px] rounded-full animate-pulse transition-all duration-1000 opacity-30"
                    style={{
                        backgroundColor:
                            selectedColor === 'blue' ? '#3B82F6' :
                                selectedColor === 'green' ? '#10B981' :
                                    selectedColor === 'rose' ? '#F43F5E' :
                                        selectedColor === 'indigo' ? '#6366F1' :
                                            '#F59E0B'
                    }}
                ></div>
                <div
                    className="absolute -bottom-10 -right-10 w-[200px] h-[200px] blur-[60px] rounded-full opacity-20 transition-all duration-700"
                    style={{
                        backgroundColor:
                            selectedColor === 'blue' ? '#3B82F6' :
                                selectedColor === 'green' ? '#10B981' :
                                    selectedColor === 'rose' ? '#F43F5E' :
                                        selectedColor === 'indigo' ? '#6366F1' :
                                            '#F59E0B'
                    }}
                ></div>

                {/* Content Area */}
                <div className="relative z-10 bg-gradient-to-br from-white/[0.02] to-transparent p-1">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b border-white/5">
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                            Create New Task
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-all active:scale-90">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="max-h-[min(650px,80vh)] overflow-y-auto custom-scrollbar px-8 pb-10 pt-6 space-y-8">
                        {/* Title Input */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Add title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-transparent text-2xl font-black text-white placeholder-gray-600 border-none focus:ring-0 focus:outline-none transition-all"
                                autoFocus
                            />
                            <div className="h-[1px] w-full bg-gradient-to-r from-cyan-500/50 to-transparent mt-1"></div>
                        </div>

                        {/* Assignee / Color Selector */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                <span>Assign To</span>
                                <div className="h-[1px] flex-1 bg-gray-800/50"></div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex gap-2.5">
                                    {[...users]
                                        .sort((a, b) => (a.id === currentUser?.id ? -1 : b.id === currentUser?.id ? 1 : 0))
                                        .map((u) => (
                                            <button
                                                key={u.id}
                                                onClick={() => setSelectedColor(u.color)}
                                                className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-black transition-all transform active:scale-90 relative uppercase
                                                ${u.color === 'blue' ? 'bg-[#3B82F6]' :
                                                        u.color === 'green' ? 'bg-[#10B981]' :
                                                            u.color === 'rose' ? 'bg-[#F43F5E]' :
                                                                u.color === 'indigo' ? 'bg-[#6366F1]' :
                                                                    'bg-[#F59E0B]'}
                                                ${selectedColor === u.color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#16191D] scale-110 shadow-lg' : 'opacity-40 hover:opacity-100 hover:scale-110'}
                                            `}
                                            >
                                                {u.name?.charAt(0) || 'U'}
                                            </button>
                                        ))}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[13px] font-black text-white tracking-tight uppercase italic">{activeUser?.name || 'Unassigned'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Meta Grid */}
                        <div className="grid grid-cols-2 gap-3 bg-white/[0.02] p-4 rounded-xl border border-white/5 font-bold relative z-20">
                            <div className="space-y-1 relative">
                                <div className="flex items-center gap-2 text-[9px] text-gray-500 uppercase tracking-widest">
                                    <CalendarIcon size={11} />
                                    <span>Date</span>
                                </div>
                                <button
                                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                                    className="text-xs text-gray-300 cursor-pointer hover:text-white transition-colors block w-full text-left py-1"
                                >
                                    {new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </button>

                                {/* Custom Calendar Popup */}
                                {isCalendarOpen && (
                                    <div className="relative mt-2 w-full bg-[#1A1D21] border border-white/10 rounded-2xl shadow-inner z-10 p-4 animate-in fade-in zoom-in duration-200">
                                        <div className="flex justify-between items-center mb-4">
                                            <button
                                                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                                                className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                                            >
                                                <ChevronLeft size={16} />
                                            </button>
                                            <div className="text-[11px] font-black text-white uppercase tracking-widest">
                                                {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                            </div>
                                            <button
                                                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                                                className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                                            >
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-7 gap-1 mb-2">
                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                                <div key={d} className="text-[8px] font-black text-gray-600 text-center uppercase py-1">
                                                    {d}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-7 gap-1">
                                            {generateDays().map((d, i) => {
                                                const isSelected = d.date.toISOString().split('T')[0] === date;
                                                const isToday = d.date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];

                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => {
                                                            setDate(d.date.toISOString().split('T')[0]);
                                                            setIsCalendarOpen(false);
                                                        }}
                                                        className={`text-[10px] aspect-square rounded-2xl flex items-center justify-center font-bold transition-all
                                                            ${!d.current ? 'text-gray-700 pointer-events-none opacity-20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                                                            ${isSelected ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:bg-cyan-400' : ''}
                                                            ${isToday && !isSelected ? 'border border-cyan-500/30' : ''}
                                                        `}
                                                    >
                                                        {d.day}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-[9px] text-gray-500 uppercase tracking-widest">
                                    <Clock size={11} />
                                    <span>Priority</span>
                                </div>
                                <div className="relative group/priority">
                                    <button
                                        onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                                        className={`text-xs font-bold transition-colors block w-full text-left py-1 flex items-center gap-2
                                            ${priority === 'High' ? 'text-cyan-400' : priority === 'Mid' ? 'text-amber-400' : 'text-gray-400'}
                                        `}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full ${priority === 'High' ? 'bg-cyan-400' : priority === 'Mid' ? 'bg-amber-400' : 'bg-gray-400'}`}></div>
                                        {priority} Priority
                                    </button>

                                    {isPriorityOpen && (
                                        <div className="absolute top-full left-0 mt-2 w-36 bg-[#1A1D21] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-[150] p-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                            {['Low', 'Mid', 'High'].map((p) => (
                                                <button
                                                    key={p}
                                                    onClick={() => {
                                                        setPriority(p);
                                                        setIsPriorityOpen(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2
                                                        ${p === priority ? 'bg-white/5 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'}
                                                    `}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${p === 'High' ? 'bg-cyan-400' : p === 'Mid' ? 'bg-amber-400' : 'bg-gray-400'}`}></div>
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Project Selection Grid */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                <Folder size={12} />
                                <span>Project Link</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {projects.map(p => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => setSelectedProjectId(p.id)}
                                        className={`relative p-3 rounded-2xl border transition-all duration-300 text-left flex flex-col gap-2 group/project overflow-hidden
                                                ${String(selectedProjectId) === String(p.id)
                                                ? 'bg-white/[0.1] border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.1)] ring-1 ring-cyan-500/20'
                                                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'}
                                            `}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className={`p-1.5 rounded-lg transition-colors ${selectedProjectId === Number(p.id) || selectedProjectId === String(p.id) ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-gray-600'}`}>
                                                <Folder size={12} />
                                            </div>
                                            {(selectedProjectId === Number(p.id) || selectedProjectId === String(p.id)) && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className={`text-[10px] font-black tracking-tight leading-none mb-1 truncate ${selectedProjectId === Number(p.id) || selectedProjectId === String(p.id) ? 'text-white' : 'text-gray-500'}`}>
                                                {p.name}
                                            </div>
                                            <div className="text-[7px] font-bold text-gray-600 uppercase tracking-[0.1em] opacity-60">
                                                {p.tasks || 0} OPS
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                <AlignLeft size={12} />
                                <span>Contextual Notes</span>
                            </div>
                            <textarea
                                placeholder="Add more details..."
                                className="w-full bg-white/[0.02] text-gray-400 placeholder-gray-700 resize-none focus:outline-none text-xs font-bold p-4 rounded-2xl border border-white/5 min-h-[100px] focus:border-cyan-500/30 transition-all"
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 p-6 pt-0">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 rounded-2xl text-xs font-bold text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-all active:scale-95 border border-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className={`flex-1 py-4 rounded-2xl text-xs font-black transition-all shadow-xl active:scale-95 text-white uppercase tracking-widest
                                    ${selectedColor === 'blue' ? 'bg-[#3B82F6] shadow-blue-500/20 hover:bg-blue-500' :
                                    selectedColor === 'green' ? 'bg-[#10B981] shadow-emerald-500/20 hover:bg-emerald-500' :
                                        selectedColor === 'rose' ? 'bg-[#F43F5E] shadow-rose-500/20 hover:bg-rose-500' :
                                            selectedColor === 'indigo' ? 'bg-[#6366F1] shadow-indigo-500/20 hover:bg-indigo-500' :
                                                'bg-[#F59E0B] shadow-amber-500/20 hover:bg-[#D97706]'}
                                `}
                        >
                            Sync Task
                        </button>
                    </div>
                </div>
            </div>
        </div >

    );
};

export default AddTaskModal;
