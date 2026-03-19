import { X, Calendar, MapPin, Info, Bell, ArrowRight, Pencil, Folder, Link as LinkIcon, Compass, Sparkles, Box, Check, Trash2, Trophy, Users, Plus, UserPlus } from 'lucide-react';
import { useState } from 'react';
import ConfirmationModal from './ConfirmationModal.jsx';

const EventDetailModal = ({ event, onClose, onEdit, onDelete, onToggleComplete, onUpdateEvent, projects = [], users = [], allEvents = [], onAddSubEvent, showToast, onGoToProject, currentUser }) => {
    if (!event) return null;

    const [isAddingMember, setIsAddingMember] = useState(null); // teamId being added to
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);

    const linkedProject = projects.find(p => String(p.id) === String(event.projectId));

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
    const eventColor = getTypeColor(event.type, event.color);
    const nestedEvents = allEvents.filter(e => String(e.parentId) === String(event.id));

    const teams = event.teams || [];

    const handleSelectMember = (user) => {
        if (!event) return;
        const currentTeams = event.teams || [];
        
        // Prevent duplicates
        if (currentTeams.some(t => t.name === user.name)) {
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
        onUpdateEvent(event.id, { teams: [...currentTeams, newMember] });
        setIsMemberDropdownOpen(false);
    };

    const handleRemoveTeam = (teamId) => {
        onUpdateEvent(event.id, { teams: teams.filter(t => t.id !== teamId) });
    };

    const handleUpdateTeam = (teamId, updates) => {
        onUpdateEvent(event.id, {
            teams: teams.map(t => t.id === teamId ? { ...t, ...updates } : t)
        });
    };

    const handleAddMemberToTeam = (teamId, userId) => {
        const team = teams.find(t => t.id === teamId);
        if (!team || team.members.includes(userId)) return;

        onUpdateEvent(event.id, {
            teams: teams.map(t =>
                t.id === teamId ? { ...t, members: [...t.members, userId] } : t
            )
        });
        setIsAddingMember(null);
    };

    const handleRemoveMemberFromTeam = (teamId, userId) => {
        onUpdateEvent(event.id, {
            teams: teams.map(t =>
                t.id === teamId ? { ...t, members: t.members.filter(id => id !== userId) } : t
            )
        });
    };

    const InlineInput = ({ initialValue, onSave, placeholder, className }) => {
        const [value, setValue] = useState(initialValue);

        return (
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={() => {
                    if (value !== initialValue) onSave(value);
                }}
                className={className}
                placeholder={placeholder}
            />
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#0B0D10]/80 backdrop-blur-xl animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-[#16191D] border border-white/10 rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                {/* Decorative Glow */}
                <div
                    className={`absolute -top-24 -right-24 w-64 h-64 blur-[80px] rounded-full opacity-30 bg-gradient-to-br ${eventColor}`}
                ></div>

                {/* Header Area */}
                <div className={`h-24 w-full bg-gradient-to-r ${eventColor} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>

                    <div className="absolute top-6 left-8 flex items-center gap-3 z-10">
                        <div className="px-4 py-1.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 text-[11px] font-black text-white uppercase tracking-[0.2em] shadow-lg">
                            {event.type}
                        </div>
                        {event.won && (
                            <div className="px-4 py-1.5 rounded-xl bg-emerald-500/30 backdrop-blur-md border border-emerald-500/40 text-[11px] font-black text-white uppercase tracking-[0.2em] shadow-lg flex items-center gap-2">
                                <Trophy size={12} />
                                WINNER
                            </div>
                        )}
                    </div>

                    <div className="absolute top-6 right-6 flex items-center gap-2.5 z-10">
                        {!currentUser?.isGuest && (
                            <>
                                <button
                                    onClick={() => onToggleComplete(event.id)}
                                    className={`p-2.5 rounded-full border border-white/10 text-white transition-all shadow-lg backdrop-blur-md ${event.completed ? 'bg-green-500/40' : 'bg-black/20 hover:bg-black/40'}`}
                                    title={event.completed ? "Mark as Incomplete" : "Mark as Completed"}
                                >
                                    <Check size={18} />
                                </button>
                                <button
                                    onClick={() => onEdit(event)}
                                    className="p-2.5 rounded-full bg-black/20 border border-white/10 text-white hover:bg-black/40 transition-all shadow-lg backdrop-blur-md"
                                    title="Edit Event"
                                >
                                    <Pencil size={18} />
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="p-2.5 rounded-full bg-black/20 border border-white/10 text-white hover:bg-rose-500/40 transition-all shadow-lg backdrop-blur-md"
                                    title="Delete Event"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </>
                        )}
                        <button onClick={onClose} className="p-2.5 rounded-full bg-black/20 border border-white/10 text-white hover:bg-black/40 transition-all shadow-lg backdrop-blur-md">
                            <X size={18} />
                        </button>
                    </div>

                </div>

                <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col gap-6">
                        {/* Title & Date */}
                        <div>
                            {(() => {
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
                                const eventTextColor = getTypeTextColor(event.type);
                                return (
                                    <div className={`flex items-center gap-2 ${eventTextColor} font-bold text-xs uppercase tracking-[0.2em] mb-2.5`}>
                                        <Calendar size={14} />
                                        <span>{event.date} {event.toDate ? `— ${event.toDate}` : ''}</span>
                                    </div>
                                );
                            })()}
                            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight uppercase tracking-tight italic">
                                {event.title}
                            </h2>
                        </div>

                        {/* Core Info Grid - Side by Side */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 group hover:bg-white/[0.06] transition-all hover:scale-[1.02]">
                                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                                    <MapPin size={20} />
                                </div>
                                <div className="text-center min-w-0 w-full">
                                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] mb-0.5">LOC</p>
                                    <p className="text-[11px] font-bold text-white uppercase truncate">{event.location || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 group hover:bg-white/[0.06] transition-all hover:scale-[1.02]">
                                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                                    <Folder size={20} />
                                </div>
                                <div className="text-center min-w-0 w-full">
                                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] mb-0.5">FOLDER</p>
                                    <p className="text-[11px] font-bold text-white uppercase truncate">
                                        {linkedProject ? linkedProject.name : 'NONE'}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 group hover:bg-white/[0.06] transition-all hover:scale-[1.02]">
                                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                                    <Calendar size={20} />
                                </div>
                                <div className="text-center min-w-0 w-full">
                                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] mb-0.5">DATES</p>
                                    <p className="text-[11px] font-bold text-white uppercase truncate">{event.date}</p>
                                </div>
                            </div>
                        </div>

                        {/* Building Objective Section */}
                        {event.buildingDescription && (
                            <div className="relative group">
                                <div className={`absolute -inset-1 bg-gradient-to-r ${eventColor} opacity-10 rounded-3xl blur transition duration-1000 group-hover:opacity-20`}></div>
                                <div className="relative p-6 bg-[#1A1D21] border border-white/5 rounded-3xl space-y-3">
                                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                                        <Sparkles size={14} />
                                        <span>What we are building</span>
                                    </div>
                                    <p className="text-lg font-bold text-white leading-snug uppercase tracking-tight italic">
                                        "{event.buildingDescription}"
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Participating Members Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-white/40 font-bold text-[10px] uppercase tracking-widest">
                                    <Users size={14} />
                                    <span>Participating Members</span>
                                </div>
                                {!currentUser?.isGuest && (
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsMemberDropdownOpen(!isMemberDropdownOpen)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] font-bold text-white uppercase tracking-wider"
                                        >
                                            <Plus size={14} /> Add Member
                                        </button>

                                        {isMemberDropdownOpen && (
                                            <div className="absolute top-full right-0 mt-2 w-56 bg-[#1A1D21] border border-white/10 rounded-2xl shadow-2xl z-[50] py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                <div className="px-4 py-2 border-b border-white/5 mb-1">
                                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Select Team Member</p>
                                                </div>
                                                <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                                                    {users.filter(u => !teams.some(t => t.name === u.name)).length === 0 ? (
                                                        <div className="px-4 py-3 text-[10px] text-gray-500 italic">All users added</div>
                                                    ) : (
                                                        users.filter(u => !teams.some(t => t.name === u.name)).map(user => (
                                                            <button
                                                                key={user.id}
                                                                onClick={() => handleSelectMember(user)}
                                                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors group/u"
                                                            >
                                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-black text-white uppercase">
                                                                    {user.name.charAt(0)}
                                                                </div>
                                                                <div className="flex-1 text-left">
                                                                    <p className="text-[11px] font-black text-white uppercase tracking-wider group-hover/u:text-indigo-400 transition-colors">{user.name}</p>
                                                                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mt-0.5">{user.role || 'Member'}</p>
                                                                </div>
                                                                <ArrowRight size={10} className="text-gray-700 group-hover/u:translate-x-0.5 transition-transform" />
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {teams.length === 0 ? (
                                <div className="p-8 rounded-3xl border border-dashed border-white/5 bg-white/[0.01] text-center">
                                    <p className="text-gray-600 font-bold text-[10px] uppercase tracking-widest italic">No members added yet.</p>
                                </div>
                            ) : (
                                <div className="flex flex-row flex-wrap items-center gap-2">
                                    {teams.map(team => (
                                        <div key={team.id} className="group flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full bg-[#1A1D21] border border-white/5 hover:border-indigo-500/30 transition-all">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.3)]"></div>
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest pr-1">{team.name}</span>
                                            {!currentUser?.isGuest && (
                                                <button 
                                                    onClick={() => handleRemoveTeam(team.id)} 
                                                    className="p-1 rounded-full text-gray-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                                                >
                                                    <X size={10} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Collection Contents Section */}
                        {event.type === 'COLLECTION' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-white/40 font-bold text-[10px] uppercase tracking-widest">
                                        <Box size={14} />
                                        <span>Collection Contents</span>
                                    </div>
                                    {!currentUser?.isGuest && (
                                        <button
                                            onClick={() => onAddSubEvent(event.id)}
                                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#4F46E5]/10 border border-[#4F46E5]/20 hover:bg-[#4F46E5]/20 transition-all text-[10px] font-bold text-[#4F46E5] uppercase tracking-wider"
                                        >
                                            <Plus size={12} />
                                            Add Sub-Event
                                        </button>
                                    )}
                                </div>

                                {nestedEvents.length === 0 ? (
                                    <div className="p-8 rounded-2xl border border-dashed border-white/5 bg-white/[0.01] text-center">
                                        <p className="text-gray-600 text-[11px] font-medium uppercase tracking-widest italic">No events in this collection yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-2">
                                        {nestedEvents.map(subEvent => (
                                            <div key={subEvent.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex items-center justify-between group/sub">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${getTypeColor(subEvent.type, subEvent.color)}`} />
                                                    <div>
                                                        <h4 className="text-xs font-bold text-white uppercase tracking-tight">{subEvent.title}</h4>
                                                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{subEvent.date} • {subEvent.type}</p>
                                                    </div>
                                                </div>
                                                {!currentUser?.isGuest && (
                                                    <div className="flex items-center gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => onEdit(subEvent)}
                                                            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                                                        >
                                                            <Pencil size={12} />
                                                        </button>
                                                        <button
                                                            onClick={() => onDelete(subEvent.id)}
                                                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-gray-500 hover:text-rose-500 transition-colors"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Resources & Info Section */}
                        <div className="grid grid-cols-1 gap-8">
                            {/* Background Info */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-white/40 font-bold text-[10px] uppercase tracking-widest">
                                    <Info size={14} />
                                    <span>Background / Context</span>
                                </div>
                                <p className="text-gray-400 font-medium leading-relaxed italic border-l-2 border-white/10 pl-4">
                                    {event.description || "No additional context available for this event."}
                                </p>
                            </div>
                        </div>

                        {/* Social / External Links Section */}
                        {event.links && event.links.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-white/40 font-bold text-[10px] uppercase tracking-widest">
                                    <LinkIcon size={14} />
                                    <span>Event Links</span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {event.links.map((link, i) => (
                                        <a
                                            key={i}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-white"
                                        >
                                            <Compass size={14} />
                                            <span className="uppercase tracking-widest">{link.label}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Bar */}
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => event.projectId && onGoToProject(event.projectId)}
                                disabled={!event.projectId}
                                className={`flex-2 flex-[2] py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] group ${event.projectId ? 'bg-white text-black' : 'bg-white/5 text-gray-500 cursor-not-allowed'}`}
                            >
                                <Folder size={18} />
                                <span>Go to Project Folder</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all group">
                                <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={showDeleteConfirm}
                title="Delete Event?"
                message="Are you sure you want to delete this event? This action cannot be undone."
                onConfirm={() => {
                    onDelete(event.id);
                    setShowDeleteConfirm(false);
                }}
                onCancel={() => setShowDeleteConfirm(false)}
                confirmText="Delete Event"
            />
        </div>
    );
};

export default EventDetailModal;
