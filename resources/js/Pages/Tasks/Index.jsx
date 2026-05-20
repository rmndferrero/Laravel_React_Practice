import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function TaskIndex({ auth, tasks, stats, statuses, priorities }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Inertia form helper for creating a task
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        due_at: '',
        attachments: [],
    });

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const submitTask = (e) => {
        e.preventDefault();
        post(route('tasks.store'), {
            onSuccess: () => closeModal(),
            forceFormData: true, // Crucial for file uploads
        });
    };

    const deleteTask = (id) => {
        if (confirm('Are you sure you want to delete this task?')) {
            router.delete(route('tasks.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Tasks</h2>}
        >
            <Head title="Tasks" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Stats Summary Bar */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="text-gray-500 text-sm">Total Tasks</div>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="text-blue-500 text-sm">In Progress</div>
                            <div className="text-2xl font-bold">{stats.in_progress}</div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="text-green-500 text-sm">Completed</div>
                            <div className="text-2xl font-bold">{stats.completed}</div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="text-red-500 text-sm">Overdue</div>
                            <div className="text-2xl font-bold">{stats.overdue}</div>
                        </div>
                    </div>

                    {/* Task List */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Your Tasks</h3>
                            <PrimaryButton onClick={openModal}>Create Task</PrimaryButton>
                        </div>

                        {tasks.data.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No tasks found. Create one to get started!</p>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {tasks.data.map((task) => (
                                    <li key={task.id} className="py-4 flex justify-between items-center hover:bg-gray-50 px-2 rounded-md transition">
                                        <div>
                                            <p className="font-medium text-gray-900">{task.name}</p>
                                            <p className="text-sm text-gray-500">
                                                Status: {task.status_label} | Priority: <span style={{color: task.priority_color}}>{task.priority_label}</span>
                                            </p>
                                            {/* Display Attachments if any */}
                                            {task.attachments && task.attachments.length > 0 && (
                                                <div className="flex gap-2 mt-2">
                                                    {task.attachments.map(file => (
                                                        <a 
                                                            key={file.id} 
                                                            href={file.url} 
                                                            download={file.original_name} 
                                                            target="_blank" 
                                                            rel="noreferrer" 
                                                            className="text-xs bg-gray-100 px-2 py-1 rounded text-blue-600 hover:underline"
                                                        >
                                                            📎 {file.original_name}
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => deleteTask(task.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                                                Delete
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        
                        {/* Pagination controls could go here using tasks.links */}
                    </div>
                </div>
            </div>

            {/* Create Task Modal */}
            <Modal show={isModalOpen} onClose={closeModal}>
                <form onSubmit={submitTask} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Task</h2>

                    <div className="mb-4">
                        <InputLabel htmlFor="name" value="Task Name" />
                        <TextInput
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel htmlFor="status" value="Status" />
                            <select
                                id="status"
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                            >
                                {Object.entries(statuses).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                            <InputError message={errors.status} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="priority" value="Priority" />
                            <select
                                id="priority"
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={data.priority}
                                onChange={(e) => setData('priority', e.target.value)}
                            >
                                {Object.entries(priorities).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                            <InputError message={errors.priority} className="mt-2" />
                        </div>
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="attachments" value="Attachments (Optional)" />
                        <input
                            type="file"
                            id="attachments"
                            multiple
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            onChange={(e) => setData('attachments', e.target.files)}
                        />
                        <InputError message={errors.attachments} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={processing}>Save Task</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}