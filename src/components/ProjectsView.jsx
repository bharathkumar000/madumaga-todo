// src/components/ProjectsView.jsx
import React from 'react';
import { Folder, MoreHorizontal, Trash2 } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const ProjectCard = ({ project, onClick, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: project.id,
        data: { type: 'Project', project }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-[#1C1F26]/20 p-6 rounded-xl border border-dashed border-gray-700 h-[200px]"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-[#1C1F26] p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-all hover:shadow-lg group"
        >
            <div className="flex justify-between items-start mb-4">
                <div
                    {...listeners}
                    {...attributes}
                    className="p-3 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors cursor-grab active:cursor-grabbing"
                >
                    <Folder size={24} className="text-blue-400" />
                </div>
                <div className="flex gap-2">
                    <button
                        className="text-gray-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-all"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(project.id);
                        }}
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
            <div onClick={() => onClick(project.id)} className="cursor-pointer">
                <h3 className="font-semibold text-lg mb-1">{project.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{project.tasks} active tasks</p>
            </div>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800">
                <span className="text-xs font-medium px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">{project.status}</span>
                <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-[#1C1F26]" />
                    <div className="w-6 h-6 rounded-full bg-teal-500 border-2 border-[#1C1F26]" />
                </div>
            </div>
        </div>
    );
};

const ProjectsView = ({ projects, onAddProject, onProjectClick, onDeleteProject }) => {

    return (
        <div className="flex flex-col h-full bg-[#0B0D10] text-white p-6">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Folder className="text-primary w-8 h-8" /> Projects
                </h2>
                <button
                    onClick={onAddProject}
                    className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95 group"
                >
                    ADD PROJECTS
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
                    {projects && projects.map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onClick={onProjectClick}
                            onDelete={onDeleteProject}
                        />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
};

export default ProjectsView;
