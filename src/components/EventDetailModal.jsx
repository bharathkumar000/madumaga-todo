import { X, Calendar, MapPin, Info, Bell, ArrowRight, Pencil, Folder, Link as LinkIcon, Compass, Sparkles, Box, Check, Trash2, Trophy } from 'lucide-react';

const EventDetailModal = ({ event, onClose, onEdit, onDelete, onToggleComplete, projects = [] }) => {
    if (!event) return null;

    const linkedProject = projects.find(p => String(p.id) === String(event.projectId));

    const getTypeColor = (type, fallbackColor) => {
        const t = (type || '').toUpperCase();
        const colors = {
            'HACKATHON': 'from-pink-500 to-rose-500',
            'WORKSHOP': 'from-purple-500 to-indigo-600',
            'MEETUP': 'from-blue-400 to-cyan-500',
            'CONFERENCE': 'from-amber-400 to-orange-500'
        };
        return colors[t] || fallbackColor;
    };
    const eventColor = getTypeColor(event.type, event.color);

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
                            onClick={() => onDelete(event.id)}
                            className="p-2.5 rounded-full bg-black/20 border border-white/10 text-white hover:bg-rose-500/40 transition-all shadow-lg backdrop-blur-md"
                            title="Delete Event"
                        >
                            <Trash2 size={18} />
                        </button>
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
                                        'MEETUP': 'text-blue-400',
                                        'CONFERENCE': 'text-amber-500'
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

                        {/* Core Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white/5 border border-white/5 rounded-2xl py-2.5 px-4 flex items-center gap-4 group hover:bg-white/[0.08] transition-colors">
                                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                                    <MapPin size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Location</p>
                                    <p className="text-sm font-bold text-white uppercase tracking-tight truncate">{event.location}</p>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/5 rounded-2xl py-2.5 px-4 flex items-center gap-4 group hover:bg-white/[0.08] transition-colors">
                                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                                    <Folder size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Linked Project</p>
                                    <p className="text-sm font-bold text-white uppercase tracking-tight truncate">
                                        {linkedProject ? linkedProject.name : 'No Project Linked'}
                                    </p>
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
                            <button className="flex-2 flex-[2] py-4 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] group">
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
        </div>
    );
};

export default EventDetailModal;
