import React from 'react';
import { Calendar, MapPin, Users, ExternalLink, Plus } from 'lucide-react';

const EventsView = ({ events = [], onAddEvent, onEventClick, projects = [] }) => {
    return (
        <div className="flex-1 h-full bg-[#0F1115] overflow-y-auto custom-scrollbar p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight italic">TEAM EVENTS</h1>
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

            <div className="grid grid-cols-2 gap-6">
                {(events || []).slice().sort((a, b) => {
                    const dateA = a.date ? new Date(a.date) : new Date(0);
                    const dateB = b.date ? new Date(b.date) : new Date(0);
                    return dateA - dateB;
                }).map(event => {
                    const getTypeColor = (type, fallbackColor) => {
                        const t = type?.toUpperCase();
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
                        const t = type?.toUpperCase();
                        const colors = {
                            'HACKATHON': 'text-pink-500',
                            'WORKSHOP': 'text-purple-500',
                            'MEETUP': 'text-blue-400',
                            'CONFERENCE': 'text-amber-500',
                            'COLLECTION': 'text-[#4F46E5]'
                        };
                        return colors[t] || 'text-primary';
                    };
                    const eventColor = getTypeColor(event.type, event.color);
                    const eventTextColor = getTypeTextColor(event.type);

                    return (
                        <div
                            key={event.id}
                            onClick={() => onEventClick(event)}
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

                                    {event.buildingDescription && (
                                        <div className="px-1">
                                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                                                Building
                                            </p>
                                            <p className="text-[10px] font-medium text-gray-400 line-clamp-2 leading-relaxed italic">
                                                "{event.buildingDescription}"
                                            </p>
                                        </div>
                                    )}
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
};

export default EventsView;
