import React from 'react';
import { Trophy, Calendar, MapPin, Sparkles } from 'lucide-react';

const AchievementsView = ({ events = [] }) => {
    // Collect all events that have been marked as won
    const wonEvents = events.filter(e => e.won);

    return (
        <div className="flex-1 h-full bg-[#0F1115] overflow-y-auto custom-scrollbar p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white tracking-tight italic uppercase">Team Achievements</h1>
                <p className="text-gray-500 font-medium mt-1 uppercase text-[10px] tracking-widest leading-loose">
                    Celebrating real wins: Hackathon and Event Victories.
                </p>
            </div>

            {wonEvents.length === 0 ? (
                <div className="p-12 rounded-[2.5rem] border border-dashed border-white/5 bg-white/[0.01] text-center flex flex-col items-center justify-center mt-12">
                    <Trophy className="mx-auto text-gray-800 mb-6" size={56} />
                    <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em] italic leading-relaxed">
                        No victories recorded yet.<br />Keep pushing the limits!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {wonEvents.map((event) => {
                        const colors = {
                            'HACKATHON': 'from-pink-500 to-rose-500',
                            'WORKSHOP': 'from-purple-500 to-indigo-600',
                            'COLLECTION': 'from-[#4F46E5] to-[#4F46E5]',
                            'ROBOTICS': 'from-[#22C7B5] to-[#22C7B5]'
                        };
                        const eventColor = colors[event.type?.toUpperCase()] || 'from-emerald-400 to-teal-500';

                        return (
                            <div
                                key={event.id}
                                className="relative rounded-3xl p-6 border border-white/10 bg-[#16191D] hover:border-white/20 transition-all duration-500 group overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                            >
                                {/* Decorative Glow */}
                                <div className={`absolute -top-20 -right-20 w-48 h-48 blur-[60px] rounded-full opacity-20 bg-gradient-to-br ${eventColor}`} />

                                {/* Status Badge */}
                                <div className="absolute top-5 right-5 text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                    <Trophy size={14} /> WINNER
                                </div>

                                <div className="flex flex-col h-full relative z-10">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3 italic pr-24 line-clamp-2">
                                        {event.title}
                                    </h3>
                                    
                                    <div className="flex items-center gap-5 mb-6">
                                        <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[10px] uppercase tracking-widest bg-white/5 py-1 px-2.5 rounded-lg">
                                            <Calendar size={12} className="text-gray-500" />
                                            <span>{event.date}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[10px] uppercase tracking-widest bg-white/5 py-1 px-2.5 rounded-lg">
                                            <MapPin size={12} className="text-blue-500/70" />
                                            <span className="truncate max-w-[120px]">{event.location || 'Unknown'}</span>
                                        </div>
                                    </div>

                                    {event.buildingDescription && (
                                        <div className="mt-auto bg-black/20 border border-white/5 rounded-2xl p-4">
                                            <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[9px] uppercase tracking-[0.2em] mb-2">
                                                <Sparkles size={12} />
                                                <span>Winning Build</span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-300 leading-snug italic line-clamp-3">
                                                "{event.buildingDescription}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AchievementsView;
