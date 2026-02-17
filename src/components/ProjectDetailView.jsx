// src/components/ProjectDetailView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Target, Calendar, CheckCircle2, PlayCircle, Clock, Trash2, Image, Layout as LayoutIcon, File as FileIcon, Upload as UploadIcon, X, Loader2 } from 'lucide-react';
import { db, storage } from '../firebase';
import { collection, onSnapshot, addDoc, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const ProjectDetailView = ({ project, tasks, onBack, onToggleTask, onDeleteProject, currentUser }) => {
    const [activeTab, setActiveTab] = useState('planning');
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileComment, setFileComment] = useState('');
    const fileInputRef = useRef(null);

    // Sync Gallery Data
    useEffect(() => {
        if (!project?.id) return;
        const q = query(collection(db, `projects/${project.id}/gallery`), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const files = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGalleryFiles(files);
        });
        return () => unsubscribe();
    }, [project?.id]);

    const handleFileSelect = (e) => {
        if (e.target.files?.[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !currentUser) return;

        setIsUploading(true);
        const storageRef = ref(storage, `projects/${project.id}/${Date.now()}_${selectedFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload failed:", error);
                setIsUploading(false);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                await addDoc(collection(db, `projects/${project.id}/gallery`), {
                    name: selectedFile.name,
                    url: downloadURL,
                    type: selectedFile.type,
                    size: selectedFile.size,
                    comment: fileComment,
                    uploadedBy: currentUser.id,
                    uploaderName: currentUser.name || currentUser.email,
                    uploaderAvatar: currentUser.color, // Using color as avatar proxy since we don't have real avatars
                    createdAt: new Date().toISOString()
                });

                setIsUploading(false);
                setSelectedFile(null);
                setFileComment('');
                setUploadProgress(0);
            }
        );
    };

    const handleDeleteFile = async (fileId) => {
        if (window.confirm("Are you sure you want to delete this file?")) {
            await deleteDoc(doc(db, `projects/${project.id}/gallery`, fileId));
        }
    };

    if (!project) return null;

    const projectTasks = tasks.filter(t => t.projectName === project.name);
    const runningTasks = projectTasks.filter(t => !t.completed);
    const finishedTasks = projectTasks.filter(t => t.completed);

    const getFileIcon = (type) => {
        if (type.startsWith('image/')) return <Image size={24} className="text-purple-400" />;
        if (type.includes('pdf')) return <FileIcon size={24} className="text-rose-400" />;
        return <FileIcon size={24} className="text-blue-400" />;
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

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

                {/* Tabs Navigation */}
                <div className="flex items-center gap-6 border-b border-white/5 mb-8">
                    <button
                        onClick={() => setActiveTab('planning')}
                        className={`pb-3 text-sm font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 ${activeTab === 'planning' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <LayoutIcon size={16} />
                        Planning
                        {activeTab === 'planning' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4F46E5] shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('gallery')}
                        className={`pb-3 text-sm font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 ${activeTab === 'gallery' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <Image size={16} />
                        Gallery
                        {activeTab === 'gallery' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4F46E5] shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                        )}
                    </button>
                </div>

                {activeTab === 'planning' ? (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

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
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                                    {task.projectName || (task.tag !== 'NEW' ? task.tag : '') || 'TASK'}
                                                </span>
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
                                                <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest line-through bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                                    {task.projectName || (task.tag !== 'NEW' ? task.tag : '') || 'TASK'}
                                                </span>
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
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        {/* Upload Section */}
                        <div
                            className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center transition-all 
                            ${selectedFile ? 'border-[#4F46E5]/50 bg-[#4F46E5]/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}
                        >
                            {!selectedFile ? (
                                <>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 cursor-pointer hover:scale-110 transition-transform hover:bg-[#4F46E5] group"
                                    >
                                        <UploadIcon size={24} className="text-gray-400 group-hover:text-white" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Upload Project Assets</p>
                                    <p className="text-xs text-gray-600">Supports Images, Documents, PDFs, and Archives</p>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </>
                            ) : (
                                <div className="w-full max-w-md animate-in zoom-in-95 duration-200">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                                {getFileIcon(selectedFile.type)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white truncate max-w-[200px]">{selectedFile.name}</span>
                                                <span className="text-[10px] text-gray-500">{formatSize(selectedFile.size)}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedFile(null)}
                                            className="p-1 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <textarea
                                        value={fileComment}
                                        onChange={(e) => setFileComment(e.target.value)}
                                        placeholder="Add a comment or description (optional)..."
                                        className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-3 text-xs text-gray-300 focus:outline-none focus:border-[#4F46E5] transition-colors resize-none h-20 mb-4"
                                    />

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setSelectedFile(null)}
                                            className="flex-1 py-2.5 rounded-xl bg-white/5 text-gray-400 font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-all"
                                            disabled={isUploading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleUpload}
                                            className="flex-1 py-2.5 rounded-xl bg-[#4F46E5] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#4338ca] transition-all flex items-center justify-center gap-2"
                                            disabled={isUploading}
                                        >
                                            {isUploading ? (
                                                <>
                                                    <Loader2 size={14} className="animate-spin" />
                                                    {Math.round(uploadProgress)}%
                                                </>
                                            ) : (
                                                'Upload File'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Gallery Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {galleryFiles.map((file) => (
                                <div key={file.id} className="aspect-square bg-[#16191D] rounded-3xl border border-white/5 overflow-hidden group relative flex flex-col hover:border-[#4F46E5]/30 transition-all">
                                    {/* Preview */}
                                    {file.type.startsWith('image/') ? (
                                        <img src={file.url} alt={file.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-white/5 to-transparent p-4">
                                            {getFileIcon(file.type)}
                                            <span className="mt-2 text-[10px] text-gray-500 font-mono text-center break-all line-clamp-2">{file.name}</span>
                                        </div>
                                    )}

                                    {/* Overlay Info */}
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <p className="text-white text-xs font-bold truncate mb-0.5">{file.name}</p>
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[6px] font-black text-white
                                                ${file.uploaderAvatar === 'blue' ? 'bg-blue-500' :
                                                    file.uploaderAvatar === 'green' ? 'bg-emerald-500' :
                                                        'bg-amber-500'}`}
                                            >
                                                {file.uploaderName?.charAt(0)}
                                            </div>
                                            <span className="text-[9px] text-gray-400 capitalize">{file.uploaderName}</span>
                                        </div>
                                        {file.comment && (
                                            <p className="text-[10px] text-gray-400 italic mb-3 line-clamp-2">"{file.comment}"</p>
                                        )}
                                        <div className="flex gap-2">
                                            <a
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 py-1.5 bg-white/10 rounded flex items-center justify-center hover:bg-[#4F46E5] text-white transition-colors"
                                            >
                                                <UploadIcon size={12} className="rotate-180" />
                                            </a>
                                            {currentUser?.id === file.uploadedBy && (
                                                <button
                                                    onClick={() => handleDeleteFile(file.id)}
                                                    className="w-8 py-1.5 bg-white/10 rounded flex items-center justify-center hover:bg-rose-500 text-white transition-colors"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Empty State */}
                            {galleryFiles.length === 0 && !selectedFile && (
                                <div className="col-span-full py-12 flex flex-col items-center justify-center opacity-30">
                                    <Image size={48} className="text-gray-500 mb-4" />
                                    <p className="text-sm font-bold text-gray-400">No media uploaded yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectDetailView;
