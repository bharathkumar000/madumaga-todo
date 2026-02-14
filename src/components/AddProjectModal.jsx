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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-[2px]">
            <div className="bg-[#28292C] w-[450px] rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 font-sans">
                {/* Header */}
                <div className="flex justify-end items-center px-4 py-3">
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 pb-6">
                    {/* Title Input */}
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Add project title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-transparent text-2xl text-[#E8EAED] placeholder-[#9AA0A6] border-b border-gray-600 focus:border-[#8AB4F8] focus:outline-none pb-2 font-normal transition-colors"
                            autoFocus
                        />
                    </div>

                    {/* Status Selection */}
                    <div className="flex gap-2 mb-6">
                        {['Planning', 'In Progress', 'Active', 'Completed'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setStatus(type)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${status === type
                                    ? 'bg-[#8AB4F8] text-[#202124]'
                                    : 'bg-[#3C4043] text-[#E8EAED] hover:bg-[#4A4E54]'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                </div>

                {/* Footer */}
                <div className="flex justify-end items-center px-6 py-4 bg-[#1F1F1F] border-t border-gray-800">
                    <button
                        onClick={handleSave}
                        disabled={!title.trim()}
                        className="bg-[#8AB4F8] hover:bg-[#AECBFA] text-[#202124] px-6 py-2 rounded-md font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddProjectModal;
