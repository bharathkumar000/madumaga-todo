import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Delete", cancelText = "Cancel", type = "danger" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] animate-in fade-in duration-300 px-4">
            <div className="w-full max-w-[400px] bg-[#16191D] border border-white/10 rounded-[2rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300 relative">
                {/* Background Glow */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 blur-[80px] rounded-full opacity-20 ${type === 'danger' ? 'bg-rose-500' : 'bg-blue-500'}`}></div>

                <div className="p-8 relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className={`p-3 rounded-2xl ${type === 'danger' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'}`}>
                            <AlertTriangle size={24} />
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">{title}</h2>
                    <p className="text-sm font-medium text-gray-400 leading-relaxed mb-8">
                        {message}
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-500 hover:bg-white/5 hover:text-white border border-white/5 transition-all active:scale-95"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 ${type === 'danger'
                                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20'
                                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
