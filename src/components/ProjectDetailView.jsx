import React, { useRef, useState } from 'react';
import { ChevronLeft, Target, CheckCircle2, PlayCircle, Trash2, FileText, Upload, X, Clock, Edit2, Check } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal.jsx';

const ProjectDetailView = ({ project, tasks, onBack, onToggleTask, onDeleteProject, onUpdateProject, projectFiles = [], onUploadFile, onAddTextAsset, onDeleteFile, currentUser }) => {
    const [activeTab, setActiveTab] = useState('planning');
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(project.name);
    const [showTextModal, setShowTextModal] = useState(false);
    const [textAssetData, setTextAssetData] = useState({ title: '', content: '' });
    const [viewingAsset, setViewingAsset] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);
    const fileInputRef = useRef(null);

    if (!project) return null;

    const projectTasks = tasks.filter(t => t.projectName === project.name || t.projectId === project.id);
    const runningTasks = projectTasks.filter(t => !t.completed);
    const finishedTasks = projectTasks.filter(t => t.completed);
    const currentProjectFiles = projectFiles.filter(f => f.project_id === project.id);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && onUploadFile) {
            onUploadFile(project.id, file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0 && onUploadFile) {
            files.forEach(file => onUploadFile(project.id, file));
        }
    };

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const completionRate = projectTasks.length > 0 ? Math.round((finishedTasks.length / projectTasks.length) * 100) : 0;

    return (
        <div className="flex flex-col h-full bg-[#0B0D10] text-white select-none overflow-hidden font-sans">
            {/* Header */}
            <header className="px-8 py-6 flex items-center justify-between border-b border-white/[0.03]">
                <button
                    onClick={onBack}
                    className="flex items-center gap-3 text-gray-400 hover:text-white transition-all font-bold group"
                >
                    <ChevronLeft size={18} className="translate-y-[0.5px]" />
                    <span className="text-[11px] uppercase tracking-[0.2em]">Back to Projects</span>
                </button>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Timeline</span>
                        <div className="w-4 h-[2px] bg-cyan-500 rounded-full"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsEditingName(!isEditingName)}
                            className={`p-3 rounded-full border transition-all active:scale-95 ${isEditingName
                                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                                : 'bg-white/[0.03] border-white/10 text-gray-500 hover:text-white hover:bg-white/[0.08]'
                                }`}
                        >
                            <Edit2 size={18} />
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="p-3 rounded-full bg-white/[0.03] border border-white/10 text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/10 transition-all active:scale-95"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto custom-scrollbar px-10 py-4">
                <div className="max-w-6xl mx-auto space-y-6">
                    {/* Title Section */}
                    <div className="space-y-3">
                        {isEditingName ? (
                            <div className="flex items-center gap-4">
                                <input
                                    autoFocus
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (onUpdateProject(project.id, { name: newName }), setIsEditingName(false))}
                                    className="text-4xl md:text-5xl font-black tracking-tighter text-white bg-white/5 border-b-2 border-cyan-500 outline-none w-full max-w-2xl px-2 py-1"
                                />
                                <button
                                    onClick={() => { onUpdateProject(project.id, { name: newName }); setIsEditingName(false); }}
                                    className="p-4 rounded-2xl bg-cyan-500 text-black hover:bg-cyan-400 transition-all"
                                >
                                    <Check size={24} strokeWidth={4} />
                                </button>
                            </div>
                        ) : (
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight">
                                {project.name}
                            </h1>
                        )}

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setActiveTab('planning')}
                                className={`px-6 py-1.5 rounded-full text-sm md:text-lg font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'planning'
                                    ? 'bg-[#1E293B] text-[#38BDF8] border border-[#38BDF8]/30 shadow-[0_8px_30px_rgba(56,189,248,0.2)] scale-105'
                                    : 'bg-white/[0.02] text-gray-600 hover:text-gray-300 border border-white/5 hover:bg-white/[0.05]'
                                    }`}
                            >
                                PLAN
                            </button>
                            <button
                                onClick={() => setActiveTab('files')}
                                className={`px-6 py-1.5 rounded-full text-sm md:text-lg font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'files'
                                    ? 'bg-[#1E293B] text-[#38BDF8] border border-[#38BDF8]/30 shadow-[0_8px_30px_rgba(56,189,248,0.2)] scale-105'
                                    : 'bg-white/[0.02] text-gray-600 hover:text-gray-300 border border-white/5 hover:bg-white/[0.05]'
                                    }`}
                            >
                                FILES
                            </button>
                            <div className="w-[1.5px] h-6 bg-white/10 mx-2"></div>
                            <span className="text-[14px] text-gray-500 font-bold italic tracking-tight">
                                {projectTasks.length} nodes
                            </span>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    {activeTab === 'planning' ? (
                        <div className="space-y-8">
                            {/* Goals & Rating Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Project Goals */}
                                <div className="bg-[#111418] rounded-[20px] p-6 border border-white/[0.02]">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[#FF9F0A] border border-[#FF9F0A]/20">
                                            <Target size={16} strokeWidth={2.5} />
                                        </div>
                                        <h2 className="text-lg font-black text-[#FF9F0A] tracking-tight">Project Goals</h2>
                                    </div>
                                    <div className="space-y-2">
                                        {(project.goals || []).map((goal, i) => (
                                            <div key={i} className="flex gap-3 items-center">
                                                <div className="w-1 h-1 rounded-full bg-cyan-500/60"></div>
                                                <span className="text-[13px] text-gray-400 font-medium leading-tight">{goal}</span>
                                            </div>
                                        ))}
                                        {(!project.goals || project.goals.length === 0) && (
                                            <div className="py-8 flex items-center justify-center border border-dashed border-white/5 rounded-lg">
                                                <span className="text-gray-700 text-[9px] font-black uppercase tracking-widest italic">Awaiting Goals</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Efficiency Rating */}
                                <div className="bg-[#111418] rounded-[20px] p-6 border border-white/[0.02] flex flex-col items-center justify-center text-center">
                                    <div className="relative w-28 h-28 mb-4">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                            <circle
                                                cx="18" cy="18" r="16"
                                                className="fill-none stroke-white/[0.03]"
                                                strokeWidth="3.5"
                                            />
                                            <circle
                                                cx="18" cy="18" r="16"
                                                className="fill-none stroke-cyan-500 transition-all duration-1000"
                                                strokeWidth="3.5"
                                                strokeDasharray={`${completionRate}, 100`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-black text-white">{completionRate}%</span>
                                            <span className="text-[6px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-0.5">Completion</span>
                                        </div>
                                        <div
                                            className="absolute w-1.5 h-1.5 rounded-full bg-[#22D3EE] shadow-[0_0_8px_#22D3EE]"
                                            style={{ top: '0%', left: '50%', transform: 'translate(-50%, -50%)' }}
                                        ></div>
                                    </div>
                                    <div className="space-y-0.5">
                                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">Efficiency Rating</span>
                                        <h3 className="text-lg font-black text-white uppercase italic tracking-tighter leading-none">Optimal</h3>
                                    </div>
                                </div>
                            </div>

                            {/* Task Sections */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Running Operations */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[#34C759]">
                                            <PlayCircle size={18} strokeWidth={2.5} />
                                            <h2 className="text-xl font-black text-[#34C759] tracking-tight">Running Operations</h2>
                                        </div>
                                        <div className="w-7 h-5 rounded bg-[#111418] border border-white/5 flex items-center justify-center text-[9px] font-black">
                                            {runningTasks.length}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {runningTasks.map(task => (
                                            <div
                                                key={task.id}
                                                className="bg-[#111418]/60 p-4 rounded-[16px] border border-white/[0.03] hover:border-[#34C759]/30 transition-all group cursor-pointer"
                                                onClick={() => onToggleTask(task.id)}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className="text-[8px] font-black text-[#34C759]/80 uppercase tracking-widest bg-[#34C759]/10 px-2 py-1 rounded-lg border border-[#34C759]/20">
                                                        {task.tag || 'OP_UNIT'}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Clock size={12} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{task.time}</span>
                                                    </div>
                                                </div>
                                                <h4 className="text-lg font-black text-gray-100 group-hover:text-white transition-colors uppercase italic mb-4 tracking-tight leading-tight">{task.title}</h4>
                                                <div className="flex items-center justify-between pt-4 border-t border-white/[0.03]">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center text-[9px] font-bold text-gray-400">
                                                            {task.creatorInitial}
                                                        </div>
                                                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{task.creatorName}</span>
                                                    </div>
                                                    <span className="text-[9px] font-bold text-gray-700 uppercase">{task.date}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {runningTasks.length === 0 && (
                                            <div className="py-8 bg-[#0B0D10] border border-dashed border-white/5 rounded-[16px] flex items-center justify-center">
                                                <span className="text-gray-600 text-[11px] font-medium italic">No active operations.</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Finished Archive */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <CheckCircle2 size={18} strokeWidth={2.5} />
                                            <h2 className="text-xl font-black text-white/50 tracking-tight">Finished Archive</h2>
                                        </div>
                                        <div className="w-7 h-5 rounded bg-[#111418] border border-white/5 flex items-center justify-center text-[9px] font-black text-gray-500">
                                            {finishedTasks.length}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {finishedTasks.map(task => (
                                            <div
                                                key={task.id}
                                                className="bg-[#111418]/30 p-4 rounded-[16px] border border-white/[0.03] opacity-40 hover:opacity-100 transition-all group cursor-pointer"
                                                onClick={() => onToggleTask(task.id)}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                                                        {task.tag || 'ST_UNIT'}
                                                    </span>
                                                    <CheckCircle2 size={16} className="text-[#34C759]/20" />
                                                </div>
                                                <h4 className="text-base font-black text-gray-600 line-through uppercase italic mb-4 tracking-tight leading-tight">{task.title}</h4>
                                                <div className="flex items-center justify-between pt-4 border-t border-white/[0.03]">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center text-[9px] font-bold text-gray-800">
                                                            {task.creatorInitial}
                                                        </div>
                                                        <span className="text-[9px] font-bold text-gray-800 uppercase line-through">{task.creatorName}</span>
                                                    </div>
                                                    <span className="text-[9px] font-bold text-gray-800 line-through uppercase">{task.date}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {finishedTasks.length === 0 && (
                                            <div className="py-8 bg-[#0B0D10] border border-dashed border-white/5 rounded-[16px] flex items-center justify-center">
                                                <span className="text-gray-600 text-[11px] font-medium italic">Archive is empty.</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {/* Modern Drop Zone Interface */}
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`group relative border-2 border-dashed rounded-[32px] p-12 flex flex-col items-center justify-center text-center space-y-8 transition-all duration-300 cursor-pointer ${isDragging
                                    ? 'bg-cyan-500/5 border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.15)] scale-[1.01]'
                                    : 'bg-[#111418] border-white/5 hover:border-white/10 hover:bg-[#15191E]'
                                    }`}
                            >
                                {isDragging && (
                                    <div className="absolute inset-0 bg-cyan-500/5 backdrop-blur-[2px] rounded-[32px] pointer-events-none flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-4 animate-bounce">
                                            <Upload size={48} className="text-cyan-500" />
                                            <span className="text-cyan-400 font-black uppercase tracking-[0.3em]">Drop to Deploy</span>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-medium text-gray-400">or drop your files</h3>
                                    <p className="text-gray-600 text-sm font-medium">
                                        pdf, images, docs, audio, <span className="underline cursor-pointer hover:text-gray-400 transition-colors">and more</span>
                                    </p>
                                </div>

                                <div className="flex flex-wrap justify-center gap-3 pt-4">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-3 px-6 py-3 bg-white/[0.03] border border-white/5 rounded-2xl text-sm font-bold text-gray-300 hover:bg-white/[0.08] hover:text-white transition-all"
                                    >
                                        <Upload size={18} />
                                        Upload files
                                    </button>
                                    <button
                                        onClick={() => setShowTextModal(true)}
                                        className="flex items-center gap-3 px-6 py-3 bg-white/[0.03] border border-white/5 rounded-2xl text-sm font-bold text-gray-300 hover:bg-white/[0.08] hover:text-white transition-all"
                                    >
                                        <FileText size={18} />
                                        Copied text
                                    </button>
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                            </div>

                            {/* Files Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {currentProjectFiles.map(file => (
                                    <div
                                        key={file.id}
                                        className="bg-[#111418] p-4 rounded-2xl border border-white/[0.02] hover:border-white/10 transition-all group relative flex items-center gap-4"
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFileToDelete(file);
                                            }}
                                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10 border border-white/5"
                                        >
                                            <X size={14} strokeWidth={3} />
                                        </button>

                                        <div
                                            onClick={() => {
                                                if (file.file_url) {
                                                    window.open(file.file_url, '_blank');
                                                } else if (file.content) {
                                                    setViewingAsset(file);
                                                }
                                            }}
                                            className="cursor-pointer flex items-center gap-4 flex-1 min-w-0"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex-shrink-0 flex items-center justify-center text-white group-hover:bg-cyan-500 group-hover:text-black transition-all">
                                                {file.file_url ? <Upload size={18} /> : <FileText size={18} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-[13px] font-black text-gray-100 truncate uppercase italic tracking-tight mb-1">{file.file_name}</h3>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                                                        {file.file_url ? formatSize(file.file_size) : `${file.file_size} CHRS`}
                                                    </span>
                                                    <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">
                                                        {file.file_url ? (file.file_type?.split('/')[1] || 'FILE') : 'TEXT'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {currentProjectFiles.length === 0 && (
                                    <div className="col-span-full h-80 border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center grayscale opacity-30">
                                        <FileText size={60} className="text-gray-500 mb-6" />
                                        <p className="text-gray-500 font-black uppercase tracking-widest text-[14px] italic">Vault Offline</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            {/* Text Asset Modal */}
            {showTextModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowTextModal(false)}></div>
                    <div className="relative w-full max-w-xl bg-[#111418] border border-white/10 rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight text-white italic">Deploy Text Asset</h2>
                                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-1">Manual Content Injection</p>
                            </div>
                            <button onClick={() => setShowTextModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-all text-gray-500 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Asset Title</label>
                                <input
                                    type="text"
                                    value={textAssetData.title}
                                    onChange={(e) => setTextAssetData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Operation manifest, key notes, etc."
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-cyan-500/50 transition-all font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Content Injection</label>
                                <textarea
                                    value={textAssetData.content}
                                    onChange={(e) => setTextAssetData(prev => ({ ...prev, content: e.target.value }))}
                                    placeholder="Paste your code, logs, or notes here..."
                                    className="w-full h-64 bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-cyan-500/50 transition-all font-bold resize-none custom-scrollbar"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setShowTextModal(false)}
                                    className="flex-1 px-8 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-[13px] font-black uppercase tracking-widest text-gray-400 hover:bg-white/[0.08] hover:text-white transition-all active:scale-95"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={() => {
                                        if (textAssetData.title && textAssetData.content) {
                                            onAddTextAsset(project.id, textAssetData.title, textAssetData.content);
                                            setTextAssetData({ title: '', content: '' });
                                            setShowTextModal(false);
                                        }
                                    }}
                                    className="flex-3 px-8 py-4 bg-cyan-500 text-black rounded-2xl text-[13px] font-black uppercase tracking-widest shadow-[0_8px_30px_rgba(6,182,212,0.3)] hover:bg-cyan-400 transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <Check size={20} strokeWidth={3} />
                                    Confirm Deployment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Asset Viewer Modal */}
            {viewingAsset && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setViewingAsset(null)}></div>
                    <div className="relative w-full max-w-4xl max-h-[85vh] bg-[#111418] border border-white/10 rounded-[40px] overflow-hidden flex flex-col shadow-3xl animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight text-white italic">{viewingAsset.file_name}</h2>
                                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                                    Project Asset • {viewingAsset.file_size} CHARS • TEXT/PLAIN
                                </p>
                            </div>
                            <button onClick={() => setViewingAsset(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                            <pre className="text-gray-300 font-mono text-sm leading-relaxed whitespace-pre-wrap selection:bg-cyan-500 selection:text-black">
                                {viewingAsset.content}
                            </pre>
                        </div>
                        <div className="p-6 border-t border-white/5 bg-white/[0.01] flex justify-end">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(viewingAsset.content);
                                    // Could add a toast here if showToast was passed as prop
                                }}
                                className="px-8 py-3 bg-cyan-500 text-black rounded-xl text-[12px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all flex items-center gap-2"
                            >
                                <FileText size={16} strokeWidth={3} />
                                Copy to Clipboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showDeleteConfirm && (
                <ConfirmationModal
                    isOpen={showDeleteConfirm}
                    title="Delete Project?"
                    message="Are you sure you want to permanently delete this project and all its associations? This action cannot be undone."
                    onConfirm={() => {
                        onDeleteProject(project.id);
                        setShowDeleteConfirm(false);
                    }}
                    onCancel={() => setShowDeleteConfirm(false)}
                    confirmText="Permanently Delete"
                />
            )}

            {fileToDelete && (
                <ConfirmationModal
                    isOpen={!!fileToDelete}
                    title="Delete File?"
                    message={`Are you sure you want to delete "${fileToDelete.file_name}"? This action is permanent and will remove the file from all archives.`}
                    onConfirm={() => {
                        onDeleteFile(fileToDelete.id, fileToDelete.file_url);
                        setFileToDelete(null);
                    }}
                    onCancel={() => setFileToDelete(null)}
                    confirmText="Delete File"
                    type="danger"
                />
            )}
        </div>
    );
};

export default ProjectDetailView;
