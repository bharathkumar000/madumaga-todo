import React, { useState, useEffect } from 'react';
import { X, User, Shield, Palette, School, Briefcase, Quote, Check, Save } from 'lucide-react';

const ProfileModal = ({ isOpen, onClose, currentUser, onUpdateProfile, users = [] }) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('blue');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState('');

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name || '');
            setColor(currentUser.color || 'blue');
            setBio(currentUser.bio || '');
            setAvatar(currentUser.avatar || '');
        }
    }, [currentUser, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onUpdateProfile({
            ...currentUser,
            name,
            color,
            bio,
            avatar
        });
        onClose();
    };

    const colors = [
        { id: 'blue', class: 'bg-[#3B82F6]', glow: 'shadow-[#3B82F6]/50', name: 'Ocean' },
        { id: 'green', class: 'bg-[#10B981]', glow: 'shadow-[#10B981]/50', name: 'Emerald' },
        { id: 'amber', class: 'bg-[#F59E0B]', glow: 'shadow-[#F59E0B]/50', name: 'Amber' },
        { id: 'rose', class: 'bg-[#F43F5E]', glow: 'shadow-[#F43F5E]/50', name: 'Rose' },
        { id: 'pink', class: 'bg-[#EC4899]', glow: 'shadow-[#EC4899]/50', name: 'Pink' },
        { id: 'teal', class: 'bg-[#14B8A6]', glow: 'shadow-[#14B8A6]/50', name: 'Teal' },
        { id: 'orange', class: 'bg-[#F97316]', glow: 'shadow-[#F97316]/50', name: 'Sunset' },
        { id: 'purple', class: 'bg-[#A855F7]', glow: 'shadow-[#A855F7]/50', name: 'Galaxy' }
    ];

    const takenColors = users
        .filter(u => u.id !== currentUser?.id)
        .map(u => u.color);

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-[#0B0D10]/80 backdrop-blur-xl animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-lg bg-[#16191D] border border-white/10 rounded-2xl shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="h-24 w-full relative" style={{
                    backgroundImage: `linear-gradient(to right, ${color === 'blue' ? '#3B82F6, #1D4ED8' :
                        color === 'green' ? '#10B981, #047857' :
                            color === 'rose' ? '#F43F5E, #BE123C' :
                                color === 'pink' ? '#EC4899, #BE185D' :
                                    color === 'teal' ? '#14B8A6, #0D9488' :
                                        color === 'orange' ? '#F97316, #EA580C' :
                                            color === 'purple' ? '#A855F7, #7E22CE' :
                                                '#F59E0B, #B45309'
                        })`
                }}>
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all backdrop-blur-md"
                    >
                        <X size={20} />
                    </button>
                    <div className="absolute -bottom-10 left-8">
                        <div className={`w-16 h-16 rounded-2xl border-4 border-[#16191D] flex items-center justify-center text-white text-2xl font-black shadow-2xl transition-all duration-500 hover:scale-105`}
                            style={{
                                backgroundColor:
                                    color === 'blue' ? '#3B82F6' :
                                        color === 'green' ? '#10B981' :
                                            color === 'rose' ? '#F43F5E' :
                                                color === 'indigo' ? '#6366F1' :
                                                    color === 'purple' ? '#A855F7' :
                                                        color === 'pink' ? '#EC4899' :
                                                            '#F59E0B'
                            }}>
                            {avatar && (avatar.startsWith('http') || avatar.startsWith('https')) ? (
                                <img src={avatar} alt="" className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                                <span className={avatar ? "text-3xl" : ""}>{avatar || name.charAt(0) || 'U'}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-10 p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">User Profile</h2>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Identity & Team Personalization</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                <User size={12} /> Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-white/20 transition-colors uppercase tracking-tight"
                                placeholder="..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                <span>🚀</span> Profile Emoji
                            </label>
                            <input
                                type="text"
                                value={avatar}
                                onChange={(e) => setAvatar(e.target.value)}
                                maxLength={2}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-center text-xl focus:outline-none focus:border-white/20 transition-colors"
                                placeholder="🔥"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                            <Palette size={12} /> Allotted Theme Color
                        </label>
                        <div className="flex gap-4">
                            {colors.map((c) => {
                                const isTaken = takenColors.includes(c.id);
                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => !isTaken && setColor(c.id)}
                                        disabled={isTaken}
                                        className={`w-12 h-12 rounded-2xl transition-all bg-gradient-to-br ${c.id === 'blue' ? 'from-blue-500 to-indigo-600' : c.id === 'green' ? 'from-emerald-500 to-teal-600' : c.id === 'rose' ? 'from-rose-500 to-red-600' : c.id === 'pink' ? 'from-pink-400 to-rose-600' : c.id === 'teal' ? 'from-teal-400 to-cyan-600' : c.id === 'orange' ? 'from-orange-400 to-red-500' : c.id === 'purple' ? 'from-purple-400 to-indigo-600' : 'from-amber-400 to-orange-500'} flex items-center justify-center relative shadow-lg
                                            ${color === c.id ? `ring-2 ring-white ring-offset-2 ring-offset-[#16191D] scale-110 ${c.glow}` : ''}
                                            ${isTaken ? 'opacity-20 cursor-not-allowed grayscale' : 'hover:scale-110 opacity-100 hover:shadow-2xl'}`}
                                    >
                                        {color === c.id && <Check size={20} className="text-white drop-shadow-md" strokeWidth={3} />}
                                        {isTaken && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-8 h-0.5 bg-white/40 rotate-45" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>



                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                            <Quote size={12} /> Personal Tagline / Bio
                        </label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-white/20 transition-colors italic min-h-[80px]"
                            placeholder="..."
                        />
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className={`flex-[2] py-3 rounded-xl text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl
                                ${color === 'blue' ? 'bg-blue-600 shadow-blue-500/20' :
                                    color === 'green' ? 'bg-emerald-600 shadow-emerald-500/20' :
                                        color === 'rose' ? 'bg-rose-600 shadow-rose-500/20' :
                                            color === 'pink' ? 'bg-pink-600 shadow-pink-500/20' :
                                                color === 'teal' ? 'bg-teal-600 shadow-teal-500/20' :
                                                    color === 'orange' ? 'bg-orange-500 shadow-orange-500/20' :
                                                        color === 'purple' ? 'bg-purple-600 shadow-purple-500/20' :
                                                            'bg-amber-500 shadow-amber-500/20'}`}
                        >
                            <Save size={16} />
                            Save Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
