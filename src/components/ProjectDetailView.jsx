// src/components/ProjectDetailView.jsx
import React from 'react';
import { ChevronLeft, Target, Calendar, CheckCircle2, PlayCircle, Clock, Trash2 } from 'lucide-react';

const ProjectDetailView = ({ project, tasks, onBack, onToggleTask, onDeleteProject }) => {
    if (!project) return null;

    const projectTasks = tasks.filter(t => t.projectName === project.name);
    const runningTasks = projectTasks.filter(t => !t.completed);
    const finishedTasks = projectTasks.filter(t => t.completed);

    return (
        <div className="flex flex-col h-full bg-[#0B0D10] text-white overflow-y-auto custom-scrollbar">
            {/* Header / Navigation */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0B0D10]/80 backdrop-blur-md z-20">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-widest">Back to Projects</span>
                </button>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Timeline</div>
                        <div className="text-xs font-black text-cyan-400">{project.startDate} — {project.endDate}</div>
                    </div>
                    <button
                        onClick={() => onDeleteProject(project.id)}
                        className="p-2.5 rounded-full bg-white/5 border border-white/5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all active:scale-90"
                        title="Delete Project"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <div className="p-8 space-y-12 max-w-5xl mx-auto w-full">
                {/* Project Briefing */}
                <header className="space-y-4">
                    <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                        {project.name}
                    </h1>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                            {project.status}
                        </span>
                        <span className="text-xs text-gray-500 font-medium italic">
                            {projectTasks.length} total operations monitored
                        </span>
                    </div>
                </header>

                {/* Goals & Progress */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-[#16191D] p-6 rounded-3xl border border-white/5 space-y-6">
                        <div className="flex items-center gap-3 text-amber-500">
                            <Target size={22} className="stroke-[2.5px]" />
                            <h2 className="text-lg font-black tracking-tight">Project Goals</h2>
                        </div>
                        <ul className="space-y-4">
                            {(project.goals || []).map((goal, i) => (
                                <li key={i} className="flex gap-4 items-start group">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500/40 group-hover:bg-amber-500 transition-colors shadow-[0_0_8px_rgba(245,158,11,0.3)]"></div>
                                    <span className="text-sm text-gray-400 font-medium group-hover:text-gray-200 transition-colors">{goal}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-[#16191D] p-6 rounded-3xl border border-white/5 flex flex-col justify-center items-center space-y-4">
                        <div className="relative w-32 h-32">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path
                                    className="stroke-white/5"
                                    strokeWidth="3"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className="stroke-cyan-500 transition-all duration-1000"
                                    strokeWidth="3"
                                    strokeDasharray={`${projectTasks.length > 0 ? (finishedTasks.length / projectTasks.length) * 100 : 0}, 100`}
                                    strokeLinecap="round"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-black">
                                    {projectTasks.length > 0 ? Math.round((finishedTasks.length / projectTasks.length) * 100) : 0}%
                                </span>
                                <span className="text-[8px] font-black uppercase text-gray-500 tracking-tighter">Completion</span>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Efficiency Rating</p>
                            <p className="text-sm font-black text-white">OPTIMAL</p>
                        </div>
                    </div>
                </section>

                {/* Tasks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Running Tasks */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-emerald-500 px-2">
                            <PlayCircle size={22} className="stroke-[2.5px]" />
                            <h2 className="text-lg font-black tracking-tight">Running Operations</h2>
                            <span className="ml-auto text-[10px] font-black py-1 px-2.5 bg-emerald-500/10 rounded-lg">{runningTasks.length}</span>
                        </div>
                        <div className="space-y-3">
                            {runningTasks.map(task => (
                                <div
                                    key={task.id}
                                    className="bg-[#16191D] p-5 rounded-3xl border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden active:scale-[0.98] cursor-pointer"
                                    onClick={() => onToggleTask(task.id)}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{task.tag || 'TASK'}</span>
                                        <Clock size={14} className="text-gray-700" />
                                    </div>
                                    <h4 className="font-bold text-gray-200 group-hover:text-white transition-colors">{task.title}</h4>
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-black text-gray-400">
                                                {task.creatorInitial}
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">{task.creatorName}</span>
                                        </div>
                                        <span className="text-[9px] font-black text-gray-500">{task.date}</span>
                                    </div>
                                </div>
                            ))}
                            {runningTasks.length === 0 && (
                                <div className="text-center py-12 bg-white/[0.02] rounded-3xl border border-dashed border-white/10 text-gray-600 text-sm italic">
                                    No active operations detected.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Finished Tasks */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-gray-500 px-2">
                            <CheckCircle2 size={22} className="stroke-[2.5px]" />
                            <h2 className="text-lg font-black tracking-tight">Finished Archive</h2>
                            <span className="ml-auto text-[10px] font-black py-1 px-2.5 bg-white/5 rounded-lg">{finishedTasks.length}</span>
                        </div>
                        <div className="space-y-3">
                            {finishedTasks.map(task => (
                                <div
                                    key={task.id}
                                    className="bg-white/[0.02] p-5 rounded-3xl border border-white/5 opacity-60 hover:opacity-100 transition-all group active:scale-[0.98] cursor-pointer"
                                    onClick={() => onToggleTask(task.id)}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest line-through">{task.tag || 'TASK'}</span>
                                        <CheckCircle2 size={14} className="text-emerald-500/50" />
                                    </div>
                                    <h4 className="font-bold text-gray-500 line-through">{task.title}</h4>
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[8px] font-black text-gray-600">
                                                {task.creatorInitial}
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-700 uppercase tracking-tighter line-through">{task.creatorName}</span>
                                        </div>
                                        <span className="text-[9px] font-black text-gray-700 line-through">{task.date}</span>
                                    </div>
                                </div>
                            ))}
                            {finishedTasks.length === 0 && (
                                <div className="text-center py-12 bg-white/[0.02] rounded-3xl border border-dashed border-white/10 text-gray-600 text-sm italic">
                                    Archive is empty.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailView;
