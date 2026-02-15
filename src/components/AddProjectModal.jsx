import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';

const AddProjectModal = ({ isOpen, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [status, setStatus] = useState('Planning');

    if (!isOpen) return null;

    const handleSave = () => {
        if (!title.trim()) return;
        onSave({ title, status });
        setTitle('');
        setStatus('Planning');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] backdrop-blur-[6px]">
            <div
                className="w-[520px] rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in duration-300 font-sans border border-white/10 relative"
                style={{ backgroundColor: '#16191D' }}
            >
                {/* Variant Ambient Glows */}
                <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] blur-[100px] rounded-full animate-pulse transition-all duration-1000 opacity-30 bg-blue-600"></div>

                {/* Content Area */}
                <div className="relative z-10 bg-gradient-to-br from-white/[0.02] to-transparent p-1">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b border-white/5">
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                            New Project
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-all active:scale-90">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="px-8 pb-8 pt-6 space-y-8">
                        {/* Title Input */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Project Name"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-transparent text-3xl font-black text-white placeholder-gray-600 border-none focus:ring-0 focus:outline-none transition-all uppercase italic tracking-tight"
                                autoFocus
                            />
                            <div className="h-[1px] w-full bg-gradient-to-r from-blue-500/50 to-transparent mt-2"></div>
                        </div>



                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={onClose}
                                className="flex-1 py-4 rounded-2xl text-xs font-bold text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-all active:scale-95 border border-white/5"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!title.trim()}
                                className="flex-1 py-4 rounded-2xl text-xs font-black transition-all shadow-xl active:scale-95 text-white bg-blue-600 shadow-blue-500/20 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                            >
                                Create Project
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddProjectModal;
