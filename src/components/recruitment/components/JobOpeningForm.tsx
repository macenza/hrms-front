// src/components/recruitment/components/JobOpeningForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { JobOpening, ScreeningQuestion } from "../types";

interface JobOpeningFormProps {
    jobToEdit?: JobOpening | null;
    onSave: (statusType: 'Draft' | 'Active', jobData: Omit<JobOpening, 'id' | 'applicantsCount' | 'createdAt'>) => void;
    onCancel: () => void;
}

export default function JobOpeningForm({ jobToEdit, onSave, onCancel }: JobOpeningFormProps) {
    const isEditing = !!jobToEdit;

    // Form inputs state
    const [formTitle, setFormTitle] = useState("");
    const [formDepartment, setFormDepartment] = useState("Engineering");
    const [formEmploymentType, setFormEmploymentType] = useState("Full-time");
    const [formOpenings, setFormOpenings] = useState(1);
    const [formExperience, setFormExperience] = useState("2+ years");
    const [formLocation, setFormLocation] = useState("Mumbai, India (Hybrid)");
    const [formDescription, setFormDescription] = useState("");
    const [formWorkMode, setFormWorkMode] = useState<'On-site' | 'Hybrid' | 'Remote'>("Hybrid");
    const [formSalaryRange, setFormSalaryRange] = useState("");
    const [formDeadline, setFormDeadline] = useState("");
    const [formQuestions, setFormQuestions] = useState<ScreeningQuestion[]>([]);

    useEffect(() => {
        if (jobToEdit) {
            setFormTitle(jobToEdit.title);
            setFormDepartment(jobToEdit.department);
            setFormEmploymentType(jobToEdit.employmentType);
            setFormOpenings(jobToEdit.openings);
            setFormExperience(jobToEdit.experienceRequired);
            setFormLocation(jobToEdit.location);
            setFormDescription(jobToEdit.description);
            setFormWorkMode(jobToEdit.workMode || "Hybrid");
            setFormSalaryRange(jobToEdit.salaryRange || "");
            setFormDeadline(jobToEdit.deadline || "");
            setFormQuestions(jobToEdit.screeningQuestions || []);
        } else {
            setFormTitle("");
            setFormDepartment("Engineering");
            setFormEmploymentType("Full-time");
            setFormOpenings(1);
            setFormExperience("2+ years");
            setFormLocation("Mumbai, India (Hybrid)");
            setFormDescription("");
            setFormWorkMode("Hybrid");
            setFormSalaryRange("");
            setFormDeadline("");
            setFormQuestions([]);
        }
    }, [jobToEdit]);

    const handleAddQuestion = () => {
        const newQuestion: ScreeningQuestion = {
            id: `q-${Date.now()}`,
            questionText: "",
            isOptional: false
        };
        setFormQuestions(prev => [...prev, newQuestion]);
    };

    const handleQuestionTextChange = (id: string, text: string) => {
        setFormQuestions(prev => prev.map(q => q.id === id ? { ...q, questionText: text } : q));
    };

    const handleQuestionOptionalToggle = (id: string) => {
        setFormQuestions(prev => prev.map(q => q.id === id ? { ...q, isOptional: !q.isOptional } : q));
    };

    const handleDeleteQuestion = (id: string) => {
        setFormQuestions(prev => prev.filter(q => q.id !== id));
    };

    const handleSubmit = (statusType: 'Draft' | 'Active') => {
        if (!formTitle.trim()) {
            toast.error("Please provide a Job Title.");
            return;
        }

        const jobSlug = formTitle
            .toLowerCase()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

        const jobData = {
            title: formTitle,
            department: formDepartment,
            employmentType: formEmploymentType,
            openings: formOpenings,
            experienceRequired: formExperience,
            location: formLocation,
            description: formDescription,
            status: statusType,
            slug: jobSlug,
            workMode: formWorkMode,
            salaryRange: formSalaryRange,
            deadline: formDeadline,
            screeningQuestions: formQuestions.map(q => ({
                questionText: q.questionText,
                isOptional: q.isOptional
            })) as unknown as ScreeningQuestion[] // API does not need mock frontend ids, but matches shape
        };

        onSave(statusType, jobData);
    };

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-none space-y-6 max-w-4xl mx-auto">
            <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                    {isEditing ? "Edit Job Opening" : "Create New Job Opening"}
                </h2>
                <p className="text-xs text-gray-550 dark:text-gray-400 mt-1">
                    Provide the details for the role. Launching the job generates a public application form URL.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Job Title */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Job Title *</label>
                    <input
                        type="text"
                        placeholder="e.g. Frontend Developer"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-850 dark:text-gray-200"
                    />
                </div>

                {/* Department */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Department</label>
                    <select
                        value={formDepartment}
                        onChange={(e) => setFormDepartment(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-850 dark:text-gray-200"
                    >
                        <option value="Engineering">Engineering</option>
                        <option value="Design">Design</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Finance">Finance</option>
                        <option value="Sales">Sales</option>
                    </select>
                </div>

                {/* Employment Type */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Employment Type</label>
                    <select
                        value={formEmploymentType}
                        onChange={(e) => setFormEmploymentType(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-850 dark:text-gray-200"
                    >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                    </select>
                </div>

                {/* Openings Count */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Number of Openings</label>
                    <input
                        type="number"
                        min={1}
                        value={formOpenings}
                        onChange={(e) => setFormOpenings(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-850 dark:text-gray-200"
                    />
                </div>

                {/* Experience Required */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Experience Required</label>
                    <input
                        type="text"
                        placeholder="e.g. 2+ years, Entry level, 5-8 years"
                        value={formExperience}
                        onChange={(e) => setFormExperience(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-850 dark:text-gray-200"
                    />
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Location</label>
                    <input
                        type="text"
                        placeholder="e.g. Mumbai, India (Hybrid) or Remote"
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-850 dark:text-gray-200"
                    />
                </div>

                {/* Work Mode */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Work Mode</label>
                    <select
                        value={formWorkMode}
                        onChange={(e) => setFormWorkMode(e.target.value as 'On-site' | 'Hybrid' | 'Remote')}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-850 dark:text-gray-200"
                    >
                        <option value="On-site">On-site</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Remote">Remote</option>
                    </select>
                </div>

                {/* Salary Range */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Compensation / Salary Range</label>
                    <input
                        type="text"
                        placeholder="e.g. ₹8,00,000 - ₹12,00,000 P.A."
                        value={formSalaryRange}
                        onChange={(e) => setFormSalaryRange(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-850 dark:text-gray-200"
                    />
                </div>

                {/* Application Deadline */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Application Deadline</label>
                    <input
                        type="date"
                        value={formDeadline}
                        onChange={(e) => setFormDeadline(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-855 dark:text-gray-200"
                    />
                </div>

                {/* Description */}
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Job Description</label>
                    <textarea
                        placeholder="Detail the duties, responsibilities, role expectations, and candidate requirements..."
                        rows={6}
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200 resize-y"
                    />
                </div>

                {/* Screening Questions Section */}
                <div className="col-span-1 md:col-span-2 border-t border-gray-200 dark:border-gray-800 pt-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-950 dark:text-white">Screening Questions</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Add custom questions for candidates to answer when applying.</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddQuestion}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Question
                        </button>
                    </div>

                    {formQuestions.length === 0 ? (
                        <p className="text-xs text-gray-400 dark:text-gray-500 italic p-3 bg-gray-50 dark:bg-gray-955/40 rounded-xl text-center border border-dashed border-gray-200 dark:border-gray-850">
                            No screening questions added yet. Candidates will only submit the standard application form.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {formQuestions.map((q, idx) => (
                                <div key={q.id} className="flex items-start gap-4 p-4 bg-gray-50/50 dark:bg-gray-955/30 border border-gray-200 dark:border-gray-850 rounded-xl">
                                    <span className="text-xs font-bold text-gray-400 mt-2.5">Q{idx + 1}</span>
                                    
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. What is your notice period?"
                                            value={q.questionText}
                                            onChange={(e) => handleQuestionTextChange(q.id, e.target.value)}
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                                        />
                                        
                                        <label className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={q.isOptional}
                                                onChange={() => handleQuestionOptionalToggle(q.id)}
                                                className="rounded text-primary focus:ring-primary border-gray-300 dark:border-gray-700 w-3.5 h-3.5 bg-white dark:bg-gray-900"
                                            />
                                            <span>Optional Question</span>
                                        </label>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleDeleteQuestion(q.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 rounded-lg transition-colors mt-1"
                                        title="Delete Question"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-5 flex items-center justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850 font-bold transition-colors text-sm text-gray-700 dark:text-gray-300"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={() => handleSubmit("Draft")}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-800 dark:text-gray-200 rounded-xl font-bold transition-colors text-sm"
                >
                    Save Draft
                </button>
                <button
                    type="button"
                    onClick={() => handleSubmit("Active")}
                    className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all text-sm shadow-md shadow-primary/20"
                >
                    Launch Job
                </button>
            </div>
        </div>
    );
}
