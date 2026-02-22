// src/components/ProjectsView.jsx
import React from 'react';
import { Folder, MoreHorizontal, Trash2, Plus } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ConfirmationModal from './ConfirmationModal';

const ProjectCard = ({ project, onClick, onDelete, taskCount }) => {
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
                className="bg-[#1C1F26]/20 p-6 rounded-3xl border border-dashed border-gray-700 h-[220px]"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={() => onClick(project.id)}
            className="group relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-[#0B0D10] via-[#0B0D10] to-[#4F46E5]/10 border border-white/5 hover:border-[#4F46E5]/30 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)] cursor-pointer hover:-translate-y-1 active:scale-[0.98] p-7 h-full flex flex-col"
        >
            {/* Ambient Project Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 blur-[80px] rounded-full opacity-0 group-hover:opacity-40 bg-[#4F46E5] transition-opacity duration-700"></div>

            <div className="relative z-10 flex items-center gap-4 mb-6">
                <div
                    {...listeners}
                    {...attributes}
                    className="p-2.5 bg-white/5 rounded-xl group-hover:bg-[#4F46E5]/10 transition-all cursor-grab active:cursor-grabbing border border-white/5 group-hover:border-[#4F46E5]/20 shrink-0"
                >
                    <Folder size={20} className="text-[#4F46E5]" />
                </div>
                <h3 className="text-xl font-black text-white leading-tight uppercase tracking-tight italic group-hover:text-[#4F46E5] transition-colors line-clamp-2">
                    {project.name}
                </h3>
            </div>

            <div className="flex-1 relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest bg-white/5 w-fit px-3 py-1 rounded-full border border-white/5 group-hover:border-[#4F46E5]/10 group-hover:bg-[#4F46E5]/5">
                    <span className="text-[#4F46E5]">{taskCount}</span>
                    <span>Active Tasks</span>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(project.id);
                    }}
                    className="p-2 rounded-xl bg-white/5 border border-white/5 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};

const ProjectsView = ({ projects, onAddProject, onProjectClick, onDeleteProject, tasks = [] }) => {
    const [projectToDelete, setProjectToDelete] = React.useState(null);

    return (
        <div className="flex flex-col h-full bg-[#0B0D10] text-white p-6">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Folder className="text-[#4F46E5] w-8 h-8" /> Projects
                </h2>
                <button
                    onClick={onAddProject}
                    className="py-2.5 px-6 rounded-xl bg-[#4F46E5] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#4F46E5]/20 transition-all active:scale-95 group"
                >
                    <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span>ADD PROJECTS</span>
                </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
                    {projects && projects.map(project => {
                        const taskCount = project.task_count ?? tasks.filter(t => t.projectName === project.name && !t.completed).length;
                        return (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                taskCount={taskCount}
                                onClick={onProjectClick}
                                onDelete={(id) => setProjectToDelete(id)}
                            />
                        );
                    })}
                </SortableContext>
            </div>

            <ConfirmationModal
                isOpen={!!projectToDelete}
                title="Delete Project?"
                message="Are you sure you want to delete this project? This action cannot be undone."
                onConfirm={() => {
                    onDeleteProject(projectToDelete);
                    setProjectToDelete(null);
                }}
                onCancel={() => setProjectToDelete(null)}
                confirmText="Delete Project"
            />
        </div>
    );
};

export default ProjectsView;
