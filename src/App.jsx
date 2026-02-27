import React, { useState, useEffect, useCallback, useMemo } from 'react';
import supabase from './supabase';
import Layout from './components/Layout';
import DashboardShell from './components/DashboardShell';
import AddTaskModal from './components/AddTaskModal';
import AddProjectModal from './components/AddProjectModal';
import AddEventModal from './components/AddEventModal';
import EventDetailModal from './components/EventDetailModal';
import ProfileModal from './components/ProfileModal';
import LoginPage from './components/LoginPage';
import EventsView from './components/EventsView';
import AchievementsView from './components/AchievementsView';
import { startOfDay, isBefore, isSameDay, endOfWeek, endOfMonth } from 'date-fns';
import { X, Check } from 'lucide-react';

function App() {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [events, setEvents] = useState([]);
    const [projectFiles, setProjectFiles] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentView, setCurrentView] = useState('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventToEdit, setEventToEdit] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [selectedMemberId, setSelectedMemberId] = useState(null);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, type = 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    }, []);

    // 1. Auth State Listener
    useEffect(() => {
        if (!supabase?.auth) return;
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setIsAuthenticated(true);
                setCurrentUser(session.user);
            } else {
                setIsAuthenticated(false);
                setCurrentUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const mapTask = useCallback((t) => ({
        ...t,
        title: t.task_name,
        id: t.id,
        projectId: t.project_id,
        userId: t.user_id,
        assignedTo: t.assigned_to,
        rawDate: t.raw_date,
        description: t.description
    }), []);

    const handleRefresh = useCallback(async () => {
        if (!currentUser?.id) return;
        try {
            const { data: tasksData, error: tasksError } = await supabase.from('tasks').select('*');
            if (tasksError) throw tasksError;
            if (tasksData) setTasks(tasksData.map(mapTask));

            const { data: projectsData, error: projError } = await supabase.from('projects').select('*');
            if (projError) throw projError;
            if (projectsData) setProjects(projectsData.map(p => ({
                ...p,
                name: p.title,
                id: p.id,
                userId: p.user_id
            })));

            const { data: eventsData, error: eventsError } = await supabase.from('events').select('*');
            if (eventsError) throw eventsError;
            if (eventsData) setEvents(eventsData.map(e => ({
                ...e,
                toDate: e.to_date,
                buildingDescription: e.building_description,
                projectId: e.project_id,
                userId: e.user_id,
                teams: e.teams || [],
                parentId: e.parent_id
            })));

            const { data: usersData, error: usersError } = await supabase.from('users').select('*');
            if (usersError) throw usersError;
            if (usersData) setAllUsers(usersData.map(u => ({
                ...u,
                avatar: u.avatar_url || u.avatar // Support both naming variants for data consistency
            })));

            const { data: filesData, error: filesError } = await supabase.from('project_files').select('*');
            if (filesError) throw filesError;
            if (filesData) setProjectFiles(filesData);
        } catch (err) {
            console.error("Critical Error Fetching Data:", err.message);
        }
    }, [currentUser?.id, mapTask]);

    // 2. Real-time Data Sync (Tasks, Projects, Events)
    useEffect(() => {
        if (!currentUser?.id) return;

        const fetchData = async () => {
            try {
                const { data: tasksData, error: tasksError } = await supabase.from('tasks').select('*');
                if (tasksError) throw tasksError;
                if (tasksData) setTasks(tasksData.map(t => ({
                    ...t,
                    title: t.task_name,
                    id: t.id,
                    projectId: t.project_id,
                    userId: t.user_id,
                    assignedTo: t.assigned_to,
                    rawDate: t.raw_date
                })));

                const { data: projectsData, error: projError } = await supabase.from('projects').select('*');
                if (projError) throw projError;
                if (projectsData) setProjects(projectsData.map(p => ({
                    ...p,
                    name: p.title,
                    id: p.id,
                    userId: p.user_id
                })));

                const { data: eventsData, error: eventsError } = await supabase.from('events').select('*');
                if (eventsError) throw eventsError;
                if (eventsData) setEvents(eventsData.map(e => ({
                    ...e,
                    toDate: e.to_date,
                    buildingDescription: e.building_description,
                    projectId: e.project_id,
                    userId: e.user_id
                })));

                const { data: usersData, error: usersError } = await supabase.from('users').select('*');
                if (usersError) throw usersError;
                if (usersData) setAllUsers(usersData);
            } catch (err) {
                console.error("Critical Error Fetching Data:", err.message);
            }
        };

        fetchData();

        // Realtime Subscription
        const channel = supabase
            .channel('db_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
                const mapTask = (t) => ({
                    ...t,
                    title: t.task_name,
                    id: t.id,
                    projectId: t.project_id,
                    userId: t.user_id,
                    assignedTo: t.assigned_to,
                    rawDate: t.raw_date
                });

                if (payload.eventType === 'INSERT') {
                    setTasks(prev => [...prev, mapTask(payload.new)]);
                } else if (payload.eventType === 'UPDATE') {
                    const updated = mapTask(payload.new);
                    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
                } else if (payload.eventType === 'DELETE') {
                    setTasks(prev => prev.filter(t => t.id !== payload.old.id));
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
                const mapProject = (p) => ({
                    ...p,
                    name: p.title,
                    id: p.id,
                    userId: p.user_id
                });

                if (payload.eventType === 'INSERT') {
                    setProjects(prev => [...prev, mapProject(payload.new)]);
                } else if (payload.eventType === 'UPDATE') {
                    const updated = mapProject(payload.new);
                    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
                } else if (payload.eventType === 'DELETE') {
                    setProjects(prev => prev.filter(p => p.id !== payload.old.id));
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload) => {
                const mapEvent = (e) => ({
                    ...e,
                    toDate: e.to_date,
                    buildingDescription: e.building_description,
                    projectId: e.project_id,
                    userId: e.user_id
                });

                if (payload.eventType === 'INSERT') {
                    setEvents(prev => [...prev, mapEvent(payload.new)]);
                } else if (payload.eventType === 'UPDATE') {
                    const updated = mapEvent(payload.new);
                    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
                } else if (payload.eventType === 'DELETE') {
                    setEvents(prev => prev.filter(e => e.id !== payload.old.id));
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
                const mapUser = (u) => ({ ...u, avatar: u.avatar_url || u.avatar });
                if (payload.eventType === 'INSERT') {
                    setAllUsers(prev => [...prev, mapUser(payload.new)]);
                } else if (payload.eventType === 'UPDATE') {
                    setAllUsers(prev => prev.map(u => u.id === payload.new.id ? mapUser(payload.new) : u));
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'project_files' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setProjectFiles(prev => [...prev, payload.new]);
                } else if (payload.eventType === 'DELETE') {
                    setProjectFiles(prev => prev.filter(f => f.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser?.id, mapTask]);

    // 3. Auto-Categorize Tasks based on Date (Healing Logic)
    useEffect(() => {
        if (!tasks || tasks.length === 0) return;

        const today = startOfDay(new Date());

        tasks.forEach(async (task) => {
            if (!task.date || task.completed) return;

            try {
                const taskDate = task.rawDate ? startOfDay(new Date(task.rawDate)) : startOfDay(new Date(task.date));
                if (isNaN(taskDate.getTime())) return;

                let expectedStatus = 'UPCOMING';
                if (isBefore(taskDate, today)) {
                    expectedStatus = 'DELAYED';
                } else if (isSameDay(taskDate, today)) {
                    expectedStatus = 'TODAY';
                } else if (isBefore(taskDate, endOfWeek(today, { weekStartsOn: 0 }))) {
                    expectedStatus = 'THIS_WEEK';
                } else if (isBefore(taskDate, endOfMonth(today))) {
                    expectedStatus = 'THIS_MONTH';
                }

                const syncableStatuses = ['DELAYED', 'TODAY', 'THIS_WEEK', 'THIS_MONTH', 'UPCOMING', 'waiting', 'todo', 'NO_DUE_DATE', ''];
                if (task.status !== expectedStatus && syncableStatuses.includes(task.status || '')) {
                    await supabase.from('tasks').update({ status: expectedStatus }).eq('id', task.id);
                }
            } catch (e) {
                // Ignore parsing errors
            }
        });
    }, [tasks.length, currentView]);

    // View Persistence
    useEffect(() => {
        const savedView = localStorage.getItem('todo_currentView');
        if (savedView) setCurrentView(savedView);
    }, []);

    useEffect(() => {
        localStorage.setItem('todo_currentView', currentView);
    }, [currentView]);

    const handleLogin = (user) => {
        // Authenticated by listener
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            setIsAuthenticated(false);
            setCurrentUser(null);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const handleEventClick = (event) => {
        setSelectedEvent(event);
    };

    const handleEditEvent = (event) => {
        setEventToEdit(event);
        setSelectedEvent(null);
        setIsEventModalOpen(true);
    };

    const [newTaskDefaults, setNewTaskDefaults] = useState(null);

    const handleAddTask = async (taskData) => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                showToast("You must be logged in to sync tasks.");
                return;
            }

            const safeProjectId = (taskData.projectId && taskData.projectId !== '') ? taskData.projectId : null;

            // Normalize assigned_to: DB expects a single UUID string, but frontend might send an array
            const normalizedAssignee = Array.isArray(taskData.assignedTo)
                ? (taskData.assignedTo.length > 0 ? taskData.assignedTo[0] : null)
                : (taskData.assignedTo || null);

            const fullPayload = {
                task_name: taskData.title,
                project_id: safeProjectId,
                user_id: user.id,
                status: taskData.status || 'waiting',
                assigned_to: normalizedAssignee,
                priority: taskData.priority,
                date: taskData.date || null,
                time: taskData.time || null,
                raw_date: taskData.rawDate || null,
                color: taskData.color || null,
                description: taskData.description || null
            };

            if (editingTask) {
                const { error: updateError } = await supabase.from('tasks').update(fullPayload).eq('id', editingTask.id);
                if (updateError) {
                    console.error("Update failed, trying bare minimum update:", updateError.message);
                    // Minimal fallback update
                    const { error: retryError } = await supabase.from('tasks').update({
                        task_name: taskData.title,
                        description: taskData.description || null
                    }).eq('id', editingTask.id);
                    if (retryError) showToast("Update failed: " + retryError.message);
                }
                setEditingTask(null);
            } else {
                // Try Full Insert First
                const { data, error: insertError } = await supabase.from('tasks').insert([fullPayload]).select();

                if (insertError) {
                    console.error("Error adding task:", insertError.message);
                    throw insertError;
                } else {
                    console.log("Task added successfully via Supabase.");
                }
            }
        } catch (error) {
            console.error("Critical error in handleAddTask:", error);
            showToast("Unexpected error: " + error.message);
        }
    };

    const handleAddProject = async (newProject) => {
        try {
            const { data, error } = await supabase.from('projects').insert([{
                title: newProject.title,
                description: newProject.description || '',
                status: newProject.status || 'Planning',
                user_id: (await supabase.auth.getUser()).data.user?.id
            }]).select();
            if (error) throw error;
            if (data && data.length > 0) {
                setProjects(prev => [...prev, { ...data[0], name: data[0].title, id: data[0].id }]);
            }
        } catch (error) {
            console.error("Error adding project:", error);
        }
    };

    const handleAddEvent = async (newEvent) => {
        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) throw new Error("User not authenticated");

            const mappedEvent = {
                title: newEvent.title,
                date: newEvent.date,
                to_date: newEvent.toDate || null,
                location: newEvent.location || 'Online',
                type: newEvent.type,
                attendees: newEvent.attendees || 1,
                image: newEvent.image || null,
                color: newEvent.color || 'from-blue-500 to-indigo-600',
                description: newEvent.description || '',
                building_description: newEvent.buildingDescription || null,
                project_id: newEvent.projectId || null,
                won: newEvent.won || false,
                user_id: user.id,
                completed: false
            };

            // Only add complex objects if they have data to avoid schema errors if columns missing
            if (newEvent.parentId) mappedEvent.parent_id = newEvent.parentId;
            if (newEvent.teams && newEvent.teams.length > 0) mappedEvent.teams = newEvent.teams;
            if (newEvent.links && newEvent.links.length > 0) mappedEvent.links = newEvent.links;

            if (eventToEdit && eventToEdit.id) {
                // Optimistic Update for Edit
                setEvents(prev => prev.map(e => e.id === eventToEdit.id ? { ...e, ...newEvent } : e));

                const { error } = await supabase.from('events').update(mappedEvent).eq('id', eventToEdit.id);
                if (error) throw error;
                setEventToEdit(null);
            } else {
                // Create a temporary ID for optimistic update
                const tempId = 'temp-' + Date.now();
                const optimisticEvent = {
                    ...mappedEvent,
                    id: tempId,
                    toDate: mappedEvent.to_date,
                    buildingDescription: mappedEvent.building_description,
                    projectId: mappedEvent.project_id,
                    userId: mappedEvent.user_id,
                    parentId: mappedEvent.parent_id
                };

                // Optimistic Update for Insert
                setEvents(prev => [...prev, optimisticEvent]);

                const { data, error } = await supabase.from('events').insert([mappedEvent]).select();
                if (error) throw error;

                // Replace optimistic event with real one if needed, or let real-time handle it
                if (data && data[0]) {
                    const savedEvent = {
                        ...data[0],
                        toDate: data[0].to_date,
                        buildingDescription: data[0].building_description,
                        projectId: data[0].project_id,
                        userId: data[0].user_id,
                        parentId: data[0].parent_id
                    };
                    setEvents(prev => prev.map(e => e.id === tempId ? savedEvent : e));
                }
            }
        } catch (error) {
            console.error("Error in handleAddEvent:", error);
            showToast("Failed to save event: " + error.message);
            // Roll back on error if it was a new event (edit rollback is more complex)
            if (!eventToEdit) {
                setEvents(prev => prev.filter(e => !String(e.id).startsWith('temp-')));
            }
        }
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            // Recursive function to find all nested children IDs
            const getAllDescendantIds = (parentId) => {
                const directChildren = events.filter(e => String(e.parentId) === String(parentId));
                let descendantIds = [];
                directChildren.forEach(child => {
                    descendantIds.push(child.id);
                    descendantIds = [...descendantIds, ...getAllDescendantIds(child.id)];
                });
                return descendantIds;
            };

            const allChildIds = getAllDescendantIds(eventId);

            // Optimistic Update: Remove parent and all descendants
            setEvents(prev => prev.filter(e => e.id !== eventId && !allChildIds.includes(e.id)));
            setSelectedEvent(null);

            // 1. Delete all descendants first (bottom-to-top is handled implicitly by the order or by deleting all at once if supported, 
            // but we'll delete them in a single call which usually works if there is no self-referential constraint inside the set being deleted)
            if (allChildIds.length > 0) {
                const { error: childrenError } = await supabase.from('events').delete().in('id', allChildIds);
                if (childrenError) {
                    console.error("Failed to purge descendants:", childrenError);
                    throw new Error(`Sub-event cleanup failed: ${childrenError.message}`);
                }
            }

            // 2. Delete the parent event
            const { error: parentError } = await supabase.from('events').delete().eq('id', eventId);
            if (parentError) throw parentError;

            showToast("Event purged successfully", "success");
        } catch (error) {
            console.error("Error deleting event:", error);
            showToast("Failed to delete event: " + error.message);

            // Re-fetch to sync state on failure
            const { data } = await supabase.from('events').select('*');
            if (data) setEvents(data.map(e => ({
                ...e,
                toDate: e.to_date,
                buildingDescription: e.building_description,
                projectId: e.project_id,
                userId: e.user_id,
                teams: e.teams || [],
                parentId: e.parent_id
            })));
        }
    };

    const handleUpdateEvent = async (eventId, updates) => {
        try {
            const mappedUpdates = { ...updates };
            if (updates.toDate) mappedUpdates.to_date = updates.toDate;
            if (updates.buildingDescription) mappedUpdates.building_description = updates.buildingDescription;
            if (updates.projectId) mappedUpdates.project_id = updates.projectId;
            if (updates.userId) mappedUpdates.user_id = updates.userId;
            if (updates.parentId) mappedUpdates.parent_id = updates.parentId;

            // Cleanup camelCase
            delete mappedUpdates.toDate;
            delete mappedUpdates.buildingDescription;
            delete mappedUpdates.projectId;
            delete mappedUpdates.userId;
            delete mappedUpdates.parentId;

            const { error } = await supabase.from('events').update(mappedUpdates).eq('id', eventId);
            if (error) throw error;
            setEvents(prev => prev.map(e => e.id === eventId ? { ...e, ...updates } : e));
            if (selectedEvent?.id === eventId) setSelectedEvent(prev => ({ ...prev, ...updates }));
        } catch (error) {
            console.error("Error updating event:", error);
        }
    };

    const handleToggleEventComplete = async (eventId) => {
        try {
            const event = events.find(e => e.id === eventId);
            if (!event) return;

            const newCompleted = !event.completed;

            // Optimistic Update
            setEvents(prev => prev.map(e => e.id === eventId ? { ...e, completed: newCompleted } : e));
            if (selectedEvent?.id === eventId) {
                setSelectedEvent(prev => ({ ...prev, completed: newCompleted }));
            }

            const { error } = await supabase.from('events').update({ completed: newCompleted }).eq('id', eventId);
            if (error) throw error;
        } catch (error) {
            console.error("Error toggling event:", error);
            showToast("Failed to update event status");
        }
    };

    const handleUpdateProfile = async (updatedUser) => {
        try {
            if (!currentUser) return;

            // 1. Update User Metadata (Auth) - This is where we store the avatar since the table lacks a column
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    full_name: updatedUser.name,
                    avatar_url: updatedUser.avatar
                }
            });
            if (authError) console.warn("Metadata sync failed:", authError.message);

            // 2. Update Public Profile (Users Table) - ONLY columns that exist
            const profileData = {
                id: currentUser.id,
                name: updatedUser.name,
                color: updatedUser.color,
                bio: updatedUser.bio,
                last_seen: new Date().toISOString()
            };

            const { error: upsertError } = await supabase.from('users').upsert(profileData);

            if (upsertError) {
                console.error("Profile sync failed:", upsertError);
                // Last ditch effort: Minimal payload
                const { last_seen, ...minimalData } = profileData;
                const { error: retryError } = await supabase.from('users').upsert(minimalData);
                if (retryError) throw retryError;
                showToast("Profile partially saved", "success");
            } else {
                showToast("Profile synced everywhere!", "success");
            }

            // Note: Real-time listener in App.jsx will catch this and update allUsers, 
            // which will in turn update currentUserProfile.
        } catch (error) {
            console.error("Error updating profile:", error);
            showToast("Profile update failed: " + error.message);
        }
    };

    const handleToggleTask = useCallback(async (taskId) => {
        try {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            // Optimistic Update
            const newCompleted = !task.completed;
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: newCompleted } : t));

            const { error } = await supabase.from('tasks').update({ completed: newCompleted }).eq('id', taskId);
            if (error) throw error;
        } catch (error) {
            console.error("Error toggling task:", error);
        }
    }, [tasks]);

    const handleDeleteTask = useCallback(async (taskId) => {
        try {
            // Optimistic Update
            setTasks(prev => prev.filter(t => t.id !== taskId));

            const { error } = await supabase.from('tasks').delete().eq('id', taskId);
            if (error) throw error;
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    }, []);
    const handleDuplicateTask = useCallback(async (taskId) => {
        try {
            const taskToDuplicate = tasks.find(t => t.id === taskId);
            if (!taskToDuplicate) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { id, ...data } = taskToDuplicate;
            const { data: newTasks, error } = await supabase.from('tasks').insert([{
                task_name: `${data.title} (Copy)`,
                project_id: data.projectId || null,
                user_id: user.id,
                status: data.status || 'todo',
                assigned_to: data.assignedTo || null,
                priority: data.priority || null,
                date: data.date || null,
                time: data.time || null,
                color: data.color || null,
                description: data.description || null
            }]).select();

            if (error) throw error;
            console.log("Task duplicated successfully.");
        } catch (error) {
            console.error("Error duplicating task:", error);
        }
    }, [tasks, mapTask]);
    const handleUpdateTask = useCallback(async (taskId, updates) => {
        try {
            const mappedUpdates = {};
            if (updates.title !== undefined) mappedUpdates.task_name = updates.title;
            if (updates.projectId !== undefined) mappedUpdates.project_id = updates.projectId;
            if (updates.assignedTo !== undefined) mappedUpdates.assigned_to = Array.isArray(updates.assignedTo) ? updates.assignedTo[0] : updates.assignedTo;
            if (updates.rawDate !== undefined) mappedUpdates.raw_date = updates.rawDate;

            // Direct mapping for matching keys
            if (updates.status !== undefined) mappedUpdates.status = updates.status;
            if (updates.priority !== undefined) mappedUpdates.priority = updates.priority;
            if (updates.date !== undefined) mappedUpdates.date = updates.date;
            if (updates.time !== undefined) mappedUpdates.time = updates.time;

            if (Object.keys(mappedUpdates).length === 0) return;
            const { error } = await supabase.from('tasks').update(mappedUpdates).eq('id', taskId);

            if (error) {
                console.error("Update sync error:", error.message);
                showToast("Sync failed: " + error.message);
            }
        } catch (error) {
            console.error("Error updating task:", error);
        }
    }, []);

    const handleDeleteProject = async (projectId) => {
        try {
            // Optimistic update
            setProjects(prev => prev.filter(p => p.id !== projectId));
            if (selectedProjectId === projectId) setSelectedProjectId(null);

            // 1. Handle associated tasks - set project_id to null instead of deleting
            const { error: tasksError } = await supabase.from('tasks').update({ project_id: null }).eq('project_id', projectId);
            if (tasksError) console.warn("Failed to detach tasks:", tasksError.message);

            // 2. Handle associated events - set project_id to null
            const { error: eventsError } = await supabase.from('events').update({ project_id: null }).eq('project_id', projectId);
            if (eventsError) console.warn("Failed to detach events:", eventsError.message);

            // 3. Handle associated files - delete them as they are specifically project assets
            const { error: filesError } = await supabase.from('project_files').delete().eq('project_id', projectId);
            if (filesError) console.warn("Failed to delete project files:", filesError.message);

            // 4. Finally delete the project
            const { error } = await supabase.from('projects').delete().eq('id', projectId);

            if (error) {
                // Rollback optimistic update
                handleRefresh();
                throw error;
            }

            showToast("Project purged successfully", "success");
            setCurrentView('projects');
        } catch (error) {
            console.error("Error deleting project:", error);
            showToast("Failed to delete project: " + error.message);
        }
    };

    const handleUpdateProject = useCallback(async (projectId, updates) => {
        try {
            const mappedUpdates = {};
            if (updates.name) mappedUpdates.title = updates.name;
            if (updates.description !== undefined) mappedUpdates.description = updates.description;
            if (updates.status) mappedUpdates.status = updates.status;

            if (Object.keys(mappedUpdates).length === 0) return;

            // Optimistic update
            setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));

            const { error } = await supabase.from('projects').update(mappedUpdates).eq('id', projectId);
            if (error) throw error;
        } catch (error) {
            console.error("Error updating project:", error);
        }
    }, []);

    const handleEditTask = (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            setEditingTask(task);
            setIsModalOpen(true);
        }
    };

    const handleUploadFile = async (projectId, file) => {
        try {
            const fileName = `${Date.now()}_${file.name}`;
            const filePath = `project_${projectId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('project-files')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('project-files')
                .getPublicUrl(filePath);

            const fileData = {
                project_id: projectId,
                file_name: file.name,
                file_url: publicUrl,
                file_size: file.size,
                file_type: file.type,
                user_id: currentUser.id
            };

            const { data, error: dbError } = await supabase.from('project_files').insert([fileData]).select();
            if (dbError) throw dbError;

            if (data && data[0]) {
                setProjectFiles(prev => [...prev, data[0]]);
                showToast("Asset deployed successfully", "success");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            showToast("Deployment failed: " + error.message);
        }
    };

    const handleDeleteFile = async (fileId, fileUrl) => {
        try {
            const filePathArr = fileUrl.split('project-files/');
            if (filePathArr.length > 1) {
                const filePath = filePathArr[1];
                await supabase.storage.from('project-files').remove([filePath]);
            }

            const { error } = await supabase.from('project_files').delete().eq('id', fileId);
            if (error) throw error;
        } catch (error) {
            console.error("Error deleting file:", error);
        }
    };

    const handleAddTextAsset = async (projectId, title, content) => {
        try {
            const assetData = {
                project_id: projectId,
                file_name: title,
                file_url: null,
                file_size: content.length,
                file_type: 'text/plain',
                content: content,
                user_id: currentUser.id
            };

            const { data, error: dbError } = await supabase.from('project_files').insert([assetData]).select();
            if (dbError) throw dbError;

            if (data && data[0]) {
                setProjectFiles(prev => [...prev, data[0]]);
                showToast("Text asset injected", "success");
            }
        } catch (error) {
            console.error("Error saving text asset:", error);
            showToast("Injection failed: " + error.message);
        }
    };

    const currentUserProfile = useMemo(() => {
        const profile = allUsers.find(u => u.id === currentUser?.id);
        if (profile) return profile;
        if (currentUser) {
            return {
                ...currentUser,
                name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0],
                color: 'blue',
                avatar: currentUser.user_metadata?.avatar_url
            };
        }
        return null;
    }, [allUsers, currentUser]);

    if (!isAuthenticated) return <LoginPage onLogin={handleLogin} users={allUsers} />;

    return (
        <Layout
            currentView={currentView}
            onNavigate={(view) => { setCurrentView(view); setSelectedMemberId(null); }}
            onComposeClick={() => setIsModalOpen(true)}
            onAddProject={() => setIsProjectModalOpen(true)}
            onLogout={handleLogout}
            onProfileClick={() => setIsProfileModalOpen(true)}
            currentUser={currentUserProfile}
            users={allUsers}
            onMemberClick={(memberId) => {
                setSelectedMemberId(memberId);
                if (['events', 'achievements', 'projects', 'task-bank'].includes(currentView)) setCurrentView('dashboard');
            }}
            onRefresh={() => {
                handleRefresh();
                setSelectedMemberId(null);
            }}
        >
            {currentView === 'events' ? (
                <EventsView
                    events={events}
                    projects={projects}
                    users={allUsers}
                    onAddEvent={() => setIsEventModalOpen(true)}
                    onEventClick={handleEventClick}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                    onToggleComplete={handleToggleEventComplete}
                    onUpdateEvent={handleUpdateEvent}
                    onAddSubEvent={(parentId) => {
                        setEventToEdit({ parentId });
                        setIsEventModalOpen(true);
                    }}
                    showToast={showToast}
                    onGoToProject={(id) => {
                        setSelectedProjectId(id);
                        setCurrentView('projects');
                    }}
                />
            ) : currentView === 'achievements' ? (
                <AchievementsView projects={projects} events={events} currentUser={currentUser} />
            ) : (
                <DashboardShell
                    currentView={currentView}
                    tasks={tasks}
                    setTasks={setTasks}
                    projects={projects}
                    setProjects={setProjects}
                    events={events}
                    onAddTask={(defaults = null) => { setNewTaskDefaults(defaults); setIsModalOpen(true); }}
                    onAddProject={() => setIsProjectModalOpen(true)}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
                    onDuplicateTask={handleDuplicateTask}
                    onEditTask={handleEditTask}
                    onUpdateTask={handleUpdateTask}
                    onDeleteProject={handleDeleteProject}
                    onUpdateProject={handleUpdateProject}
                    selectedMemberId={selectedMemberId}
                    onClearMemberFilter={() => setSelectedMemberId(null)}
                    allUsers={allUsers}
                    currentUser={currentUserProfile}
                    projectFiles={projectFiles}
                    onUploadFile={handleUploadFile}
                    onAddTextAsset={handleAddTextAsset}
                    onDeleteFile={handleDeleteFile}
                    selectedProjectId={selectedProjectId}
                    setSelectedProjectId={setSelectedProjectId}
                />
            )}
            <AddTaskModal
                isOpen={isModalOpen} initialValues={newTaskDefaults}
                onClose={() => { setIsModalOpen(false); setEditingTask(null); setNewTaskDefaults(null); }}
                onSave={handleAddTask} users={allUsers} currentUser={currentUserProfile} projects={projects} taskToEdit={editingTask}
            />
            <AddProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} onSave={handleAddProject} />
            <AddEventModal
                isOpen={isEventModalOpen}
                onClose={() => { setIsEventModalOpen(false); setEventToEdit(null); }}
                onSave={handleAddEvent}
                projects={projects}
                eventToEdit={eventToEdit}
            />
            <EventDetailModal
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
                onToggleComplete={handleToggleEventComplete}
                onUpdateEvent={handleUpdateEvent}
                projects={projects}
                users={allUsers}
                allEvents={events}
                onAddSubEvent={(parentId) => {
                    setEventToEdit({ parentId });
                    setIsEventModalOpen(true);
                }}
                showToast={showToast}
                onGoToProject={(id) => {
                    setSelectedProjectId(id);
                    setCurrentView('projects');
                    setSelectedEvent(null);
                }}
            />
            <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} currentUser={currentUserProfile} onUpdateProfile={handleUpdateProfile} users={allUsers} />

            {/* Custom Toast Notification */}
            {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-5 duration-300">
                    <div className={`px-6 py-4 rounded-[20px] border shadow-2xl flex items-center gap-4 min-w-[320px] backdrop-blur-xl ${toast.type === 'error'
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${toast.type === 'error' ? 'bg-rose-500/20' : 'bg-emerald-500/20'
                            }`}>
                            {toast.type === 'error' ? <X size={16} strokeWidth={3} /> : <Check size={16} strokeWidth={3} />}
                        </div>
                        <span className="text-[13px] font-black uppercase tracking-widest">{toast.message}</span>
                    </div>
                </div>
            )}
        </Layout>
    );
}

export default App;