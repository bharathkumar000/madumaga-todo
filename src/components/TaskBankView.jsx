import React, { useMemo } from 'react';
import { Database, Search, Filter, ArrowUpDown, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';

const TaskBankView = ({ tasks = [], allUsers = [], projects = [] }) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('ALL');

    const filteredTasks = useMemo(() => {
        return tasks.filter(t => {
            const matchesSearch = t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [tasks, searchTerm, statusFilter]);

    const getStatusIcon = (status, completed) => {
        if (completed) return <CheckCircle2 size={14} className="text-emerald-500" />;
        switch (status) {
            case 'DELAYED': return <AlertCircle size={14} className="text-rose-500" />;
            case 'TODAY': return <Clock size={14} className="text-pink-500" />;
            case 'waiting': return <Circle size={14} className="text-gray-500" />;
            default: return <Circle size={14} className="text-blue-500" />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0B0D10] text-white p-8 overflow-hidden font-sans">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <Database size={24} />
                        </div>
                        <h1 className="text-3xl font-black uppercase tracking-tight italic">Task Bank</h1>
                    </div>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                        Complete database synchronization of all project operations
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-400 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search Database..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[#16191D] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold focus:outline-none focus:border-blue-500/30 transition-all w-[240px]"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-[#16191D] border border-white/5 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-blue-500/30 transition-all appearance-none cursor-pointer"
                    >
                        <option value="ALL">All Status</option>
                        <option value="TODAY">Today</option>
                        <option value="DELAYED">Delayed</option>
                        <option value="waiting">Waiting</option>
                        <option value="THIS_WEEK">This Week</option>
                    </select>
                </div>
            </header>

            <div className="flex-1 overflow-hidden bg-[#16191D] rounded-[2rem] border border-white/5 shadow-2xl flex flex-col">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.25em]">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.25em]">Task Details</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.25em]">Project</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.25em]">Assignee</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.25em]">Timeline</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.25em]">Database Sync</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {filteredTasks.map((task) => {
                                const assignee = allUsers.find(u => u.id === task.assignedTo) || allUsers.find(u => u.id === task.userId);
                                const project = projects.find(p => p.name === task.projectName);

                                return (
                                    <tr key={task.id} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {getStatusIcon(task.status, task.completed)}
                                                <span className={`text-[10px] font-black uppercase tracking-wider ${task.completed ? 'text-emerald-500/50' : 'text-gray-400'}`}>
                                                    {task.completed ? 'Synchronized' : (task.status || 'Active')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-sm">
                                            <div className="space-y-1">
                                                <div className={`text-sm font-bold uppercase tracking-tight ${task.completed ? 'text-gray-600 line-through' : 'text-white'}`}>
                                                    {task.title}
                                                </div>
                                                {task.description && (
                                                    <div className="text-[10px] text-gray-600 italic line-clamp-1 group-hover:line-clamp-none transition-all">
                                                        {task.description}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {task.projectName ? (
                                                <span className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                    {task.projectName}
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-bold text-gray-700 uppercase italic">Unlinked</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-lg ${assignee?.color === 'blue' ? 'bg-blue-500' :
                                                    assignee?.color === 'green' ? 'bg-emerald-500' :
                                                        assignee?.color === 'rose' ? 'bg-rose-500' : 'bg-gray-600'
                                                    }`}>
                                                    {assignee?.name?.charAt(0) || '?'}
                                                </div>
                                                <span className="text-[11px] font-bold text-gray-400">{assignee?.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                                                {task.date || 'No Deadline'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500/40 uppercase tracking-widest">
                                                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                                                Live-Connected
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredTasks.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                        <Database size={48} className="text-white/5 mb-4" />
                        <p className="text-gray-600 font-bold uppercase tracking-[0.2em] text-xs">No database entries found for current criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskBankView;
