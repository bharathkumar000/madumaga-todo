import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, ExternalLink, Plus, ChevronLeft, Box, Sparkles, Link as LinkIcon, Compass, Pencil, X, Check, Trash2, Folder, Bell } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal.jsx';

const EventsView = ({ events = [], onAddEvent, onEventClick, projects = [], users = [], onEdit, onDelete, onToggleComplete, onUpdateEvent, onAddSubEvent, showToast, onGoToProject, activeCollectionId, setActiveCollectionId }) => {
    const [eventToDelete, setEventToDelete] = useState(null);
    const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);

    const activeCollection = events.find(e => e.id === activeCollectionId);

    const getTypeColor = (type, fallbackColor) => {
        const t = (type || '').toUpperCase();
        const colors = {
            'HACKATHON': 'from-pink-500 to-rose-500',
            'WORKSHOP': 'from-purple-500 to-indigo-600',
            'COLLECTION': 'from-[#4F46E5] to-[#4F46E5]',
            'ROBOTICS': 'from-[#22C7B5] to-[#22C7B5]'
        };
        return colors[t] || fallbackColor;
    };

    const getTypeTextColor = (type) => {
        const t = (type || '').toUpperCase();
        const colors = {
            'HACKATHON': 'text-pink-500',
            'WORKSHOP': 'text-purple-500',
            'COLLECTION': 'text-[#4F46E5]',
            'ROBOTICS': 'text-[#22C7B5]'
        };
        return colors[t] || 'text-primary';
    };

    const handleUpdateTeam = (teamId, updates) => {
        if (!activeCollection) return;
        const teams = activeCollection.teams || [];
        onUpdateEvent(activeCollectionId, {
            teams: teams.map(t => t.id === teamId ? { ...t, ...updates } : t)
        });
    };

    const handleSelectMember = (user) => {
        if (!activeCollection) return;
        const teams = activeCollection.teams || [];
        
        // Prevent duplicates
        if (teams.some(t => t.name === user.name)) {
            showToast?.(`${user.name} is already a member`, 'error');
            return;
        }

        const newMember = {
            id: crypto.randomUUID(),
            name: user.name,
            role: 'CORE MEMBER',
            avatar: user.avatar,
            members: []
        };
        onUpdateEvent(activeCollectionId, { teams: [...teams, newMember] });
        setIsMemberDropdownOpen(false);
    };

    const handleRemoveTeam = (teamId) => {
        if (!activeCollection) return;
        const teams = activeCollection.teams || [];
        onUpdateEvent(activeCollectionId, { teams: teams.filter(t => t.id !== teamId) });
    };

    const InlineInput = ({ initialValue, onSave, placeholder, className }) => {
        const [value, setValue] = useState(initialValue);
        useEffect(() => {
            setValue(initialValue);
        }, [initialValue]);

        return (
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={() => { if (value !== initialValue) onSave(value); }}
                className={className}
                placeholder={placeholder}
            />
        );
    };

    // --- RENDER LOGIC ---
    let content;
    if (activeCollection) {
        const eventColor = getTypeColor(activeCollection.type, activeCollection.color);
        const nestedEvents = events.filter(e => String(e.parentId) === String(activeCollectionId));
        const linkedProject = projects.find(p => String(p.id) === String(activeCollection.projectId));
        const teams = activeCollection.teams || [];

        content = (
            <div className="flex-1 h-full bg-[#0F1115] overflow-y-auto custom-scrollbar p-4 lg:p-8 pb-32">
                {/* Back Button and Title */}
                <div className="flex justify-between items-start mb-12">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setActiveCollectionId(null)}
                            className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-gray-400 hover:text-white active:scale-90"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight italic uppercase break-all">{activeCollection.title}</h1>
                                <span className="text-2xl font-black text-white/20 tracking-tight italic uppercase hidden md:inline">— COLLECTION</span>
                            </div>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                                {activeCollection.date} {activeCollection.toDate && activeCollection.toDate !== activeCollection.date ? `— ${activeCollection.toDate}` : ''}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons Top Right */}
                    <div className="flex items-center gap-2 p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/5 backdrop-blur-md">
                        <button
                            onClick={() => onToggleComplete(activeCollection.id)}
                            title={activeCollection.completed ? "Mark Incomplete" : "Mark Complete"}
                            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 ${activeCollection.completed ? 'bg-emerald-500 text-white' : 'hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-500'} group/action`}
                        >
                            <Check size={18} strokeWidth={3} className="group-hover/action:scale-110 transition-transform" />
                        </button>
                        <button
                            onClick={() => onEdit(activeCollection)}
                            title="Edit Event"
                            className="w-11 h-11 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-all active:scale-95 group/action"
                        >
                            <Pencil size={18} strokeWidth={2.5} className="group-hover/action:scale-110 transition-transform" />
                        </button>
                        <button
                            onClick={() => onDelete(activeCollection.id)}
                            title="Delete Event"
                            className="w-11 h-11 rounded-full flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all active:scale-95 group/action"
                        >
                            <Trash2 size={18} strokeWidth={2.5} className="group-hover/action:scale-110 transition-transform" />
                        </button>
                        <div className="w-[1px] h-6 bg-white/10 mx-1"></div>
                        <button
                            onClick={() => setActiveCollectionId(null)}
                            title="Exit View"
                            className="w-11 h-11 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 group/action"
                        >
                            <X size={18} strokeWidth={2.5} className="group-hover/action:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>                <div className="space-y-10">
                    {/* Top Section: Meta & Links Side-by-Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Metadata Grid (Left 2/3) */}
                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-5 rounded-2xl bg-[#16191D] border border-white/5 flex items-center gap-5 group hover:border-blue-500/20 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-all">
                                    <MapPin size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Location</p>
                                    <p className="text-sm font-black text-white uppercase tracking-tight truncate">{activeCollection.location || 'Online'}</p>
                                </div>
                            </div>
                            <div className="p-5 rounded-2xl bg-[#16191D] border border-white/5 flex items-center gap-5 group hover:border-indigo-500/20 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-all">
                                    <Folder size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Project</p>
                                    <p className="text-sm font-black text-white uppercase tracking-tight truncate">
                                        {linkedProject ? linkedProject.name : 'No Project'}
                                    </p>
                                </div>
                            </div>
                            {activeCollection.lastDate && (
                                <div className="p-5 rounded-2xl bg-[#16191D] border border-white/5 flex items-center gap-5 group hover:border-pink-500/20 transition-all sm:col-span-2">
                                    <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-all">
                                        <Bell size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Deadline</p>
                                        <p className="text-sm font-black text-white uppercase tracking-tight">{activeCollection.lastDate}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Links Section (Right 1/3) */}
                        <div className="lg:col-span-1">
                            {activeCollection.links && activeCollection.links.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-white/40 font-bold text-[10px] uppercase tracking-widest px-1">
                                        <LinkIcon size={14} />
                                        <span>Quick Links</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {activeCollection.links.map((link, i) => (
                                            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all flex items-center justify-between group/link">
                                                <span className="text-xs font-bold text-gray-300 group-hover:text-white uppercase tracking-wider">{link.label}</span>
                                                <ExternalLink size={14} className="text-gray-600 group-hover:text-white transition-colors" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center p-6 rounded-2xl border border-dashed border-white/5 bg-white/[0.01]">
                                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest italic">No links added</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Archive Section (Full Width) */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <Box size={20} className="text-gray-500" />
                                <h2 className="text-xl font-black text-white italic uppercase tracking-widest">Contents Archive</h2>
                            </div>
                            <button
                                onClick={() => onAddSubEvent(activeCollectionId)}
                                className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_10px_20px_rgba(79,70,229,0.3)]"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {nestedEvents.length === 0 ? (
                                <div className="md:col-span-2 p-20 rounded-[3rem] border border-dashed border-white/5 bg-white/[0.01] text-center">
                                    <Box className="mx-auto text-gray-800 mb-4" size={48} />
                                    <p className="text-gray-600 text-[11px] font-black uppercase tracking-[0.3em] italic leading-relaxed">Archive currently empty. <br />Start building your legacy.</p>
                                </div>
                            ) : (
                                nestedEvents.map(sub => {
                                    const subColor = getTypeColor(sub.type, sub.color);
                                    const subTextColor = getTypeTextColor(sub.type);
                                    return (
                                        <div
                                            key={sub.id}
                                            onClick={() => onEventClick(sub)}
                                            className="group relative rounded-xl overflow-hidden bg-[#16191D] border border-white/5 hover:border-white/20 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer hover:-translate-y-1 active:scale-[0.98]"
                                        >
                                            <div className="p-0.5">
                                                <div className={`h-1 w-full bg-gradient-to-r ${subColor} opacity-80`}></div>
                                            </div>
                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-lg font-black text-white leading-tight uppercase mb-1.5 line-clamp-2">{sub.title}</h3>
                                                        <div className={`flex items-center gap-1.5 ${subTextColor} font-black text-[9px] uppercase tracking-widest bg-white/5 w-fit px-2 py-1 rounded-md`}>
                                                            <Calendar size={11} />
                                                            <span>{sub.date}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2 ml-3 shrink-0">
                                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded text-white bg-gradient-to-r ${subColor} bg-opacity-10 uppercase tracking-wider`}>
                                                            {sub.type}
                                                        </span>
                                                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={(e) => { e.stopPropagation(); onEdit(sub); }} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"><Pencil size={12} /></button>
                                                            <button onClick={(e) => { e.stopPropagation(); setEventToDelete(sub); }} className="p-1.5 rounded-lg bg-rose-500/5 hover:bg-rose-500/10 text-gray-600 hover:text-rose-500 transition-all"><Trash2 size={12} /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    } else {
        content = (
            <div className="flex-1 h-full bg-[#0F1115] overflow-y-auto custom-scrollbar p-4 lg:p-8 pb-32">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight italic uppercase">TEAM EVENTS</h1>
                    </div>
                    <button
                        onClick={onAddEvent}
                        className="py-2 px-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95 group"
                    >
                        <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span>Create Event</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(events || []).filter(e => !e.parentId && !e.won).sort((a, b) => {
                        const dateA = a.date ? new Date(a.date) : new Date(0);
                        const dateB = b.date ? new Date(b.date) : new Date(0);
                        return dateA - dateB;
                    }).map(event => {
                        const eventColor = getTypeColor(event.type, event.color);
                        const eventTextColor = getTypeTextColor(event.type);

                        return (
                            <div
                                key={event.id}
                                onClick={() => {
                                    if (event.type === 'COLLECTION') {
                                        setActiveCollectionId(event.id);
                                    } else {
                                        onEventClick(event);
                                    }
                                }}
                                className="group relative rounded-xl overflow-hidden bg-[#16191D] border border-white/5 hover:border-white/20 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer hover:-translate-y-1 active:scale-[0.98]"
                            >
                                <div className="p-1">
                                    <div className={`h-1.5 w-full bg-gradient-to-r ${eventColor} opacity-80`}></div>
                                </div>

                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-black text-white leading-tight uppercase mb-1.5 line-clamp-2">{event.title}</h3>
                                            <div className={`flex items-center gap-1.5 ${eventTextColor} font-black text-[9px] uppercase tracking-widest bg-white/5 w-fit px-2 py-1 rounded-md`}>
                                                <Calendar size={11} />
                                                <span>
                                                    {event.date?.replace(/\s?\d{4}/g, '').trim()}
                                                    {event.toDate ? ` — ${event.toDate.replace(/\s?\d{4}/g, '').trim()}` : ''}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded text-white bg-gradient-to-r ${eventColor} bg-opacity-10 uppercase tracking-wider ml-3 shrink-0`}>
                                            {event.type}
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 bg-white/5 py-1.5 px-2.5 rounded-lg border border-white/5">
                                            <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-md">
                                                <MapPin size={14} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Location</p>
                                                <p className="text-[10px] font-bold text-gray-300 truncate tracking-tight">{event.location}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {event.projectId && (
                                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                                            <div className="p-1 px-2 rounded bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em] line-clamp-2">
                                                PROJECT: {projects.find(p => String(p.id) === String(event.projectId))?.name || 'UNKNOWN'}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <>
            {content}
            {eventToDelete && (
                <ConfirmationModal
                    isOpen={!!eventToDelete}
                    title={eventToDelete.type === 'COLLECTION' ? 'Delete Collection?' : 'Delete Event?'}
                    message={`Are you sure you want to delete "${eventToDelete.title}"? This action is permanent and will remove all associated data.`}
                    onConfirm={() => {
                        onDelete(eventToDelete.id);
                        if (eventToDelete.id === activeCollectionId) {
                            setActiveCollectionId(null);
                        }
                        setEventToDelete(null);
                    }}
                    onCancel={() => setEventToDelete(null)}
                    confirmText="Delete Permanently"
                    type="danger"
                />
            )}
        </>
    );
};

export default EventsView;
