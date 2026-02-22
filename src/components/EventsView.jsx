import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, ExternalLink, Plus, ChevronLeft, Box, Sparkles, Link as LinkIcon, Compass, Pencil, X, Check, Trash2, Folder } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

const EventsView = ({ events = [], onAddEvent, onEventClick, projects = [], users = [], onEdit, onDelete, onToggleComplete, onUpdateEvent, onAddSubEvent, showToast, onGoToProject }) => {
    const [activeCollectionId, setActiveCollectionId] = useState(null);
    const [eventToDelete, setEventToDelete] = useState(null);

    const activeCollection = events.find(e => e.id === activeCollectionId);

    const getTypeColor = (type, fallbackColor) => {
        const t = (type || '').toUpperCase();
        const colors = {
            'HACKATHON': 'from-pink-500 to-rose-500',
            'WORKSHOP': 'from-purple-500 to-indigo-600',
            'MEETUP': 'from-blue-400 to-cyan-500',
            'CONFERENCE': 'from-amber-400 to-orange-500',
            'COLLECTION': 'from-[#4F46E5] to-[#4F46E5]'
        };
        return colors[t] || fallbackColor;
    };

    const getTypeTextColor = (type) => {
        const t = (type || '').toUpperCase();
        const colors = {
            'HACKATHON': 'text-pink-500',
            'WORKSHOP': 'text-purple-500',
            'MEETUP': 'text-blue-400',
            'CONFERENCE': 'text-amber-500',
            'COLLECTION': 'text-[#4F46E5]'
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

    const handleAddTeam = () => {
        if (!activeCollection) return;
        const teams = activeCollection.teams || [];
        const newTeam = {
            id: crypto.randomUUID(),
            name: `New Member`,
            role: 'Position',
            members: []
        };
        onUpdateEvent(activeCollectionId, { teams: [...teams, newTeam] });
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

    // --- COLLECTION DETAIL VIEW ---
    if (activeCollection) {
        const eventColor = getTypeColor(activeCollection.type, activeCollection.color);
        const nestedEvents = events.filter(e => String(e.parentId) === String(activeCollectionId));
        const linkedProject = projects.find(p => String(p.id) === String(activeCollection.projectId));
        const teams = activeCollection.teams || [];

        return (
            <div className="flex-1 h-full bg-[#0F1115] overflow-y-auto custom-scrollbar p-8">
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
                                <h1 className="text-4xl font-black text-white tracking-tight italic uppercase break-all">{activeCollection.title}</h1>
                                <span className="text-2xl font-black text-white/20 tracking-tight italic uppercase hidden md:inline">— COLLECTION</span>
                            </div>
                            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em] leading-loose">Managing Archive and Collaborative Events</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left & Middle Column (Main Content) */}
                    <div className="space-y-8">
                        {/* Quick Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-[2rem] bg-[#16191D] border border-white/5 flex items-center gap-4 group">
                                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Location</p>
                                    <p className="text-sm font-bold text-white uppercase tracking-tight">{activeCollection.location || 'Online'}</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-[2rem] bg-[#16191D] border border-white/5 flex items-center gap-4 group">
                                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                                    <Folder size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Linked Project</p>
                                    <p className="text-sm font-bold text-white uppercase tracking-tight truncate max-w-[150px]">
                                        {linkedProject ? linkedProject.name : 'No Project Linked'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Participating Teams Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-white/40 font-bold text-[10px] uppercase tracking-widest">
                                    <Users size={14} />
                                    <span>Participating Members</span>
                                </div>
                                <button
                                    onClick={handleAddTeam}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] font-bold text-white uppercase tracking-wider"
                                >
                                    <Plus size={14} /> Add Member
                                </button>
                            </div>

                            {teams.length === 0 ? (
                                <div className="p-8 rounded-3xl border border-dashed border-white/5 bg-white/[0.01] text-center">
                                    <p className="text-gray-600 font-bold text-[10px] uppercase tracking-widest italic">No members added to this collection yet.</p>
                                </div>
                            ) : (
                                <div className="bg-[#16191D] border border-white/5 rounded-3xl overflow-hidden divide-y divide-white/[0.03]">
                                    {teams.map(team => (
                                        <div key={team.id} className="p-4 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
                                            <div className="flex items-center gap-4 sm:gap-8 flex-1">
                                                <div className="flex-1">
                                                    <InlineInput
                                                        initialValue={team.name}
                                                        onSave={(n) => handleUpdateTeam(team.id, { name: n })}
                                                        placeholder="Name"
                                                        className="bg-transparent text-white font-black text-sm uppercase tracking-wider focus:outline-none focus:border-b border-white/20 pb-0.5 w-full"
                                                    />
                                                </div>
                                                <div className="flex-[1.5]">
                                                    <InlineInput
                                                        initialValue={team.role || ''}
                                                        onSave={(r) => handleUpdateTeam(team.id, { role: r })}
                                                        placeholder="Position / Role"
                                                        className="bg-transparent text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] focus:outline-none focus:border-b border-indigo-500/30 pb-0.5 w-full"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveTeam(team.id)}
                                                className="ml-4 p-2 rounded-xl hover:bg-rose-500/10 text-gray-600 hover:text-rose-500 transition-all sm:opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Collection Info (Moved here) */}
                        <div className="p-8 rounded-[2.5rem] bg-[#16191D] border border-white/5 relative overflow-hidden group">
                            <div className={`absolute -top-12 -right-12 w-32 h-32 blur-[40px] rounded-full opacity-20 bg-gradient-to-br ${eventColor}`}></div>
                            <div className="relative z-10 space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-white/40 font-bold text-[10px] uppercase tracking-widest">
                                        <Sparkles size={14} />
                                        <span>Collection Info</span>
                                    </div>
                                    <p className="text-gray-400 text-sm font-medium leading-relaxed italic">
                                        {activeCollection.description || "Aggregating knowledge and events for centralized management."}
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => onEdit(activeCollection)}
                                        className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Pencil size={14} /> Edit Collection
                                    </button>
                                    <button
                                        onClick={() => setEventToDelete(activeCollection)}
                                        className="flex-1 py-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-rose-500/60 font-black text-[10px] uppercase tracking-widest hover:bg-rose-500/10 hover:text-rose-500 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={14} /> Delete Archive
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Meta & Actions) */}
                    <div className="space-y-8">
                        {/* Collection Contents Section (Moved to Right) */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-white/40 font-bold text-[10px] uppercase tracking-widest">
                                    <Box size={14} />
                                    <span>Contents Archive</span>
                                </div>
                                <button
                                    onClick={() => onAddSubEvent(activeCollectionId)}
                                    className="p-1.5 rounded-lg bg-indigo-500 text-white hover:scale-[1.1] active:scale-[0.9] transition-all"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {nestedEvents.length === 0 ? (
                                    <div className="p-12 rounded-[2.5rem] border border-dashed border-white/5 bg-white/[0.01] text-center">
                                        <Box className="mx-auto text-gray-800 mb-3" size={32} />
                                        <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] italic leading-relaxed">Archive currently empty. <br />Start creating memories.</p>
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
                                                <div className="p-5">
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

                                                    <div className="flex items-center gap-2 bg-white/5 py-1.5 px-2.5 rounded-lg border border-white/5">
                                                        <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-md shrink-0">
                                                            <MapPin size={14} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest leading-none mb-0.5">Location</p>
                                                            <p className="text-[10px] font-bold text-gray-300 truncate tracking-tight">{sub.location || 'Online'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {activeCollection.links && activeCollection.links.length > 0 && (
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-2 text-white/40 font-bold text-[10px] uppercase tracking-widest">
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
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- MAIN EVENTS LIST VIEW ---
    return (
        <div className="flex-1 h-full bg-[#0F1115] overflow-y-auto custom-scrollbar p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight italic uppercase">TEAM EVENTS</h1>
                    <p className="text-gray-500 font-medium mt-1 uppercase text-[10px] tracking-widest leading-loose">Internal Hackathons, Meetups, and Goal Tracking.</p>
                </div>
                <button
                    onClick={onAddEvent}
                    className="py-2 px-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95 group"
                >
                    <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span>Create Event</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(events || []).filter(e => !e.parentId).sort((a, b) => {
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
        </div>
    );
};

export default EventsView;
