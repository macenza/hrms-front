'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import {
    Sparkles, Send, Trash2, Edit3, Plus, Search, Brain,
    Calendar, DollarSign, Package, User, Info, Check, X,
    ChevronRight, Loader2, AlertCircle
} from 'lucide-react';
import { aiService, ChatMessage, Conversation } from '@/services/aiService';
import { toast } from 'sonner';

export default function AIAssistantPage() {
    const { user } = useAppSelector((state) => state.auth);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [inputMessage, setInputMessage] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [showSlashCommands, setShowSlashCommands] = useState(false);
    const [activeCommandIndex, setActiveCommandIndex] = useState(0);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // List of available slash commands
    const slashCommands = useMemo(() => [
        { command: '/profile', description: 'View your detailed profile info' },
        { command: '/attendance', description: 'Check your recent attendance logs' },
        { command: '/leave', description: 'Check leave requests and statuses' },
        { command: '/payroll', description: 'Check your payroll and payslips history' },
        { command: '/assets', description: 'Check assets assigned to you' },
        { command: '/dashboard', description: 'Show summary status overview' },
        { command: '/employees', description: 'List team members or directory' },
        { command: '/recruitment', description: 'Check recruitment status and pipelines' }
    ], []);

    // Filtered commands based on input
    const filteredCommands = useMemo(() => {
        if (!inputMessage.startsWith('/')) return [];
        const search = inputMessage.toLowerCase();
        return slashCommands.filter(c => c.command.startsWith(search));
    }, [inputMessage, slashCommands]);

    const loadConversations = async () => {
        try {
            const list = await aiService.listConversations();
            setConversations(list || []);
            // Set the first conversation as active if none is active
            if (list && list.length > 0 && !activeConversationId) {
                setActiveConversationId(list[0].conversation_id);
            }
        } catch (error) {
            console.error('Failed to load conversations:', error);
            toast.error('Could not fetch conversations history');
        }
    };

    const loadMessages = async (id: string) => {
        try {
            const chatHistory = await aiService.getConversationHistory(id);
            setMessages(chatHistory || []);
        } catch (error) {
            console.error('Failed to load messages:', error);
            toast.error('Could not load chat messages');
        }
    };

    // Fetch conversations list on mount
    useEffect(() => {
        loadConversations();
    }, []);

    // Fetch messages when active conversation changes
    useEffect(() => {
        if (activeConversationId) {
            loadMessages(activeConversationId);
        } else {
            setMessages([]);
        }
    }, [activeConversationId]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isThinking]);

    // Handle show/hide slash commands popover
    useEffect(() => {
        if (inputMessage.startsWith('/')) {
            setShowSlashCommands(true);
            setActiveCommandIndex(0);
        } else {
            setShowSlashCommands(false);
        }
    }, [inputMessage]);

    const handleCreateConversation = async () => {
        try {
            const { conversation_id } = await aiService.createConversation();
            await loadConversations();
            setActiveConversationId(conversation_id);
            setMessages([]);
            toast.success('Started a new conversation');
            inputRef.current?.focus();
        } catch (error) {
            console.error('Failed to create conversation:', error);
            toast.error('Could not start new conversation');
        }
    };

    const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await aiService.deleteConversation(id);
            toast.success('Conversation deleted');
            if (activeConversationId === id) {
                setActiveConversationId(null);
            }
            loadConversations();
        } catch (error) {
            console.error('Failed to delete conversation:', error);
            toast.error('Could not delete conversation');
        }
    };

    const startEditing = (conversation: Conversation, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(conversation.conversation_id);
        setEditingTitle(conversation.title);
    };

    const handleRenameConversation = async (id: string) => {
        if (!editingTitle.trim()) return;
        try {
            await aiService.renameConversation(id, editingTitle.trim());
            setEditingId(null);
            loadConversations();
            toast.success('Conversation renamed');
        } catch (error) {
            console.error('Failed to rename conversation:', error);
            toast.error('Could not rename conversation');
        }
    };

    const handleSendMessage = async (customMessage?: string) => {
        const textToSend = customMessage || inputMessage;
        if (!textToSend.trim() || isThinking) return;

        let convoId = activeConversationId;

        // Auto-create conversation if none active
        if (!convoId) {
            try {
                const newConvo = await aiService.createConversation();
                convoId = newConvo.conversation_id;
                setActiveConversationId(convoId);
                await loadConversations();
            } catch (err) {
                console.error(err);
                toast.error('Failed to start conversation context');
                return;
            }
        }

        if (!convoId) return;

        // Optimistically add user message to messages list
        const newUserMsg: ChatMessage = {
            user_message: textToSend,
            assistant_response: ''
        };
        setMessages(prev => [...prev, newUserMsg]);
        setInputMessage('');
        setIsThinking(true);
        setShowSlashCommands(false);

        // Check if message starts with a slash command to parse it out
        const slashMatch = textToSend.startsWith('/') ? textToSend.split(' ')[0] : undefined;

        try {
            const data = await aiService.sendMessage(convoId, textToSend, slashMatch);
            setMessages(prev => {
                const updated = [...prev];
                if (updated.length > 0) {
                    updated[updated.length - 1].assistant_response = data.response;
                }
                return updated;
            });
            // Reload conversations to pull updated titles if it was renamed automatically by AI
            loadConversations();
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate assistant response');
            setMessages(prev => {
                const updated = [...prev];
                if (updated.length > 0) {
                    updated[updated.length - 1].assistant_response = 'Error: The AI assistant is currently offline. Please verify the microservice is running on http://localhost:8000 and has a valid GEMINI_API_KEY.';
                }
                return updated;
            });
        } finally {
            setIsThinking(false);
        }
    };

    // Handle Keyboard events in input
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showSlashCommands && filteredCommands.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveCommandIndex(prev => (prev + 1) % filteredCommands.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveCommandIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                const selected = filteredCommands[activeCommandIndex].command;
                setInputMessage(selected + ' ');
                setShowSlashCommands(false);
            } else if (e.key === 'Escape') {
                setShowSlashCommands(false);
            }
        } else {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        }
    };

    const triggerQuickCommand = (cmd: string) => {
        setInputMessage('');
        handleSendMessage(cmd);
    };

    // Filter conversations list by search query
    const filteredConversations = useMemo(() => {
        return conversations.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [conversations, searchQuery]);

    // Simple parser to render markdown details
    const renderMarkdown = (text: string) => {
        if (!text) return null;

        // Code Block Splitter
        const parts = text.split(/(```[\s\S]*?```)/g);

        return parts.map((part, index) => {
            if (part.startsWith('```')) {
                const lines = part.split('\n');
                const language = lines[0].replace('```', '').trim();
                const code = lines.slice(1, -1).join('\n');
                return (
                    <pre key={index} className="bg-gray-900 text-gray-100 p-4 rounded-xl my-3 overflow-x-auto text-xs font-mono border border-gray-800 shadow-md">
                        <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-2 mb-2 font-bold font-sans">
                            <span>{language || 'code'}</span>
                        </div>
                        <code>{code}</code>
                    </pre>
                );
            }

            // Grid Tables
            if (part.includes('|') && part.includes('\n')) {
                const lines = part.split('\n').filter(l => l.trim() !== '');
                const rows = lines.map(line => line.split('|').map(cell => cell.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1));

                if (rows.length >= 2 && rows[1].every(cell => cell.startsWith('-') || cell.includes(':'))) {
                    const headers = rows[0];
                    const dataRows = rows.slice(2);
                    return (
                        <div key={index} className="overflow-x-auto my-4 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                                <thead className="bg-gray-50 dark:bg-gray-850">
                                    <tr>
                                        {headers.map((h, hi) => (
                                            <th key={hi} className="px-4 py-2 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                                    {dataRows.map((row, ri) => (
                                        <tr key={ri} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                                            {row.map((cell, ci) => (
                                                <td key={ci} className="px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">{cell}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                }
            }

            // Normal Lines
            const lines = part.split('\n');
            return (
                <div key={index} className="space-y-1.5 my-1">
                    {lines.map((line, li) => {
                        const rendered = line;
                        if (rendered.startsWith('### ')) {
                            return <h3 key={li} className="text-sm font-black text-gray-900 dark:text-gray-100 mt-4 mb-1.5 uppercase tracking-wide">{rendered.replace('### ', '')}</h3>;
                        }
                        if (rendered.startsWith('## ')) {
                            return <h2 key={li} className="text-base font-black text-gray-900 dark:text-gray-100 mt-5 mb-2 border-b border-gray-150 dark:border-gray-800 pb-1">{rendered.replace('## ', '')}</h2>;
                        }
                        if (rendered.startsWith('# ')) {
                            return <h1 key={li} className="text-lg font-black text-gray-900 dark:text-gray-100 mt-6 mb-3">{rendered.replace('# ', '')}</h1>;
                        }

                        if (rendered.trim().startsWith('- ') || rendered.trim().startsWith('* ')) {
                            const cleanLine = rendered.trim().replace(/^[-*]\s+/, '');
                            return (
                                <ul key={li} className="list-disc pl-5 space-y-1 my-0.5">
                                    <li className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                                        {parseInlineMarkdown(cleanLine)}
                                    </li>
                                </ul>
                            );
                        }

                        if (rendered.trim() === '') return <div key={li} className="h-1.5" />;

                        return (
                            <p key={li} className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                                {parseInlineMarkdown(rendered)}
                            </p>
                        );
                    })}
                </div>
            );
        });
    };

    const parseInlineMarkdown = (text: string) => {
        const boldParts = text.split(/(\*\*.*?\*\*)/g);
        return boldParts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="font-extrabold text-gray-900 dark:text-gray-100">{part.slice(2, -2)}</strong>;
            }

            const codeParts = part.split(/(`.*?`)/g);
            return codeParts.map((subPart, subIndex) => {
                if (subPart.startsWith('`') && subPart.endsWith('`')) {
                    return (
                        <code key={subIndex} className="bg-gray-100 dark:bg-gray-800 text-red-500 dark:text-red-400 px-1.5 py-0.5 rounded font-mono text-[10px] border border-gray-250 dark:border-gray-750">
                            {subPart.slice(1, -1)}
                        </code>
                    );
                }
                return subPart;
            });
        });
    };

    return (
        <div className="flex h-[calc(100vh-5rem)] bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-850 rounded-2xl overflow-hidden shadow-sm">

            {/* Left Panel: Conversation History */}
            <div className="w-[320px] bg-gray-50 dark:bg-gray-900 flex flex-col border-r border-gray-200 dark:border-gray-850 shrink-0">
                <div className="p-4 border-b border-gray-200 dark:border-gray-850 flex flex-col gap-3 shrink-0">
                    <button
                        onClick={handleCreateConversation}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white rounded-xl shadow-md shadow-primary/10 transition-all text-xs font-bold active:scale-95 cursor-pointer"
                    >
                        <Plus size={16} strokeWidth={2.5} />
                        New Conversation
                    </button>

                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search conversation..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-xs outline-none focus:border-primary transition-all font-semibold"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                    {filteredConversations.length > 0 ? (
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-2 mb-2 block">All Chats</span>
                            {filteredConversations.map((convo) => {
                                const isActive = convo.conversation_id === activeConversationId;
                                const isEditing = convo.conversation_id === editingId;

                                return (
                                    <div
                                        key={convo.conversation_id}
                                        onClick={() => !isEditing && setActiveConversationId(convo.conversation_id)}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group cursor-pointer ${isActive
                                                ? 'bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-800 shadow-sm text-primary'
                                                : 'hover:bg-white/50 dark:hover:bg-gray-850/50 text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                            <Brain size={16} className={isActive ? 'text-primary' : 'text-gray-450'} />
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editingTitle}
                                                    onChange={(e) => setEditingTitle(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleRenameConversation(convo.conversation_id)}
                                                    onBlur={() => handleRenameConversation(convo.conversation_id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 border border-gray-300 dark:border-gray-700 rounded text-xs font-semibold outline-none focus:border-primary"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="text-xs font-bold truncate pr-2">
                                                    {convo.title || 'New Conversation'}
                                                </span>
                                            )}
                                        </div>

                                        {!isEditing && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => startEditing(convo, e)}
                                                    className="p-1 hover:text-gray-900 dark:hover:text-gray-100 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                    title="Rename Chat"
                                                >
                                                    <Edit3 size={12} />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteConversation(convo.conversation_id, e)}
                                                    className="p-1 hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                                    title="Delete Chat"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-400">
                            <AlertCircle size={24} className="mb-2 text-gray-300" />
                            <p className="text-[11px] font-bold">No conversations found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Center Panel: Active Chat Room */}
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-950">
                {activeConversationId ? (
                    <>
                        {/* Chat Room Header */}
                        <div className="h-16 border-b border-gray-200 dark:border-gray-850 px-6 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Sparkles size={18} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h2 className="text-xs font-black text-gray-900 dark:text-gray-100 tracking-tight">
                                        {conversations.find(c => c.conversation_id === activeConversationId)?.title || 'AI Assistant Chat'}
                                    </h2>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                                        Deeply Integrated HRMS Agent
                                    </p>
                                </div>
                            </div>
                            <span className="text-[10px] font-extrabold px-2.5 py-1 bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400 rounded-full border border-green-200/50 dark:border-green-900/50">
                                {user?.role ? user.role.toUpperCase() : 'EMPLOYEE'} ACCESS
                            </span>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar bg-gray-50/30 dark:bg-gray-950/30">
                            {messages.length > 0 ? (
                                messages.map((msg, idx) => (
                                    <div key={idx} className="space-y-4">
                                        {/* User Message */}
                                        <div className="flex items-start justify-end gap-3">
                                            <div className="max-w-[70%] bg-primary text-white px-4 py-3 rounded-2xl rounded-tr-none shadow-sm text-xs font-semibold leading-relaxed border border-primary/20">
                                                {msg.user_message}
                                            </div>
                                            <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-300 dark:border-gray-700">
                                                <User size={14} className="text-gray-600 dark:text-gray-450" />
                                            </div>
                                        </div>

                                        {/* Assistant Message */}
                                        {msg.assistant_response && (
                                            <div className="flex items-start justify-start gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 text-primary">
                                                    <Brain size={14} />
                                                </div>
                                                <div className="max-w-[80%] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm space-y-1">
                                                    {renderMarkdown(msg.assistant_response)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
                                    <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 animate-pulse">
                                        <Brain size={32} />
                                    </div>
                                    <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 tracking-tight">
                                        Welcome, {user?.name || 'Employee'}!
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed font-semibold">
                                        I am your deeply integrated HRMS AI Assistant. You can ask me questions about company policies, leave applications, payroll slips, assets, or query team records depending on your role permissions.
                                    </p>
                                    <div className="w-full border-t border-dashed border-gray-200 dark:border-gray-850 my-5" />
                                    <p className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-850">
                                        💡 Type <code className="text-primary font-mono font-bold">/</code> to trigger direct database logs context!
                                    </p>
                                </div>
                            )}

                            {isThinking && (
                                <div className="flex items-start justify-start gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 text-primary animate-spin">
                                        <Loader2 size={14} />
                                    </div>
                                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                                        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">AI Assistant is pulling logs and thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Box Area */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-850 bg-white dark:bg-gray-950 shrink-0 relative">
                            {/* Slash Command Overlay */}
                            {showSlashCommands && filteredCommands.length > 0 && (
                                <div className="absolute bottom-full left-4 right-4 bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-2xl shadow-xl max-h-[220px] overflow-y-auto z-50 p-2 divide-y divide-gray-100 dark:divide-gray-850 custom-scrollbar animate-in slide-in-from-bottom-2 duration-200">
                                    <div className="px-3 py-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                        Live Database Integrations
                                    </div>
                                    {filteredCommands.map((cmd, idx) => (
                                        <div
                                            key={cmd.command}
                                            onClick={() => {
                                                setInputMessage(cmd.command + ' ');
                                                setShowSlashCommands(false);
                                                inputRef.current?.focus();
                                            }}
                                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${idx === activeCommandIndex
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-850/50 text-gray-700 dark:text-gray-300'
                                                }`}
                                        >
                                            <span>{cmd.command}</span>
                                            <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">{cmd.description}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-3 items-end">
                                <div className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-2.5 flex items-end">
                                    <textarea
                                        ref={inputRef}
                                        rows={1}
                                        placeholder="Send a message or type '/' for quick integrations..."
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="flex-1 max-h-24 bg-transparent outline-none border-none resize-none text-xs font-semibold text-gray-800 dark:text-gray-200 py-1 font-sans custom-scrollbar leading-relaxed"
                                    />
                                    <button
                                        onClick={() => setShowSlashCommands(prev => !prev)}
                                        className={`p-1.5 rounded-lg border transition-all text-[10px] font-black ${inputMessage.startsWith('/')
                                                ? 'bg-primary/20 text-primary border-primary/20'
                                                : 'hover:bg-gray-200 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500'
                                            }`}
                                        title="Trigger Quick Command Integration"
                                    >
                                        /
                                    </button>
                                </div>
                                <button
                                    onClick={() => handleSendMessage()}
                                    disabled={!inputMessage.trim() || isThinking}
                                    className="p-3.5 bg-primary hover:bg-primary/95 disabled:bg-gray-200 dark:disabled:bg-gray-800 text-white rounded-2xl shadow-md transition-all active:scale-95 disabled:scale-100 disabled:shadow-none cursor-pointer"
                                >
                                    <Send size={16} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
                        <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 animate-bounce">
                            <Sparkles size={30} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 tracking-tight">
                            Start Chatting with HRMS AI
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed font-semibold">
                            Select an existing conversation from the sidebar history panel, or spin up a new chat to begin querying live database logs contextually.
                        </p>
                        <button
                            onClick={handleCreateConversation}
                            className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md text-xs font-bold transition-all active:scale-95 cursor-pointer"
                        >
                            <Plus size={14} strokeWidth={2.5} />
                            Start New Chat
                        </button>
                    </div>
                )}
            </div>

            {/* Right Panel: Context Panel */}
            <div className="w-[280px] bg-gray-50 dark:bg-gray-900 flex flex-col border-l border-gray-200 dark:border-gray-850 shrink-0 hidden xl:flex">
                <div className="p-4 border-b border-gray-200 dark:border-gray-850 shrink-0">
                    <h3 className="text-xs font-black text-gray-900 dark:text-gray-100 tracking-tight">
                        Live Session Profile
                    </h3>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                        Authenticated Credentials
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                    {/* User Mini Profile Card */}
                    <div className="bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col items-center text-center">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-blue-500 text-white flex items-center justify-center font-black text-lg mb-3 shadow-md">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'E'}
                        </div>
                        <h4 className="text-xs font-black text-gray-900 dark:text-gray-100 truncate w-full">
                            {user?.name || 'Employee'}
                        </h4>
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-0.5 truncate w-full">
                            {user?.email || 'employee@company.com'}
                        </span>
                        <div className="w-full border-t border-dashed border-gray-200 dark:border-gray-800 my-3" />
                        <div className="w-full text-left space-y-1.5">
                            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 dark:text-gray-450">
                                <span>Designation</span>
                                <span className="text-gray-800 dark:text-gray-300 font-extrabold text-right truncate max-w-[120px]">{user?.profile?.employment?.designation || 'Staff'}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 dark:text-gray-450">
                                <span>Department</span>
                                <span className="text-gray-800 dark:text-gray-300 font-extrabold text-right truncate max-w-[120px]">{user?.profile?.employment?.department || 'Operations'}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 dark:text-gray-450">
                                <span>Designated Role</span>
                                <span className="text-primary font-black uppercase text-[9px] bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{user?.role || 'employee'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Context Triggers */}
                    <div className="space-y-3">
                        <div>
                            <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1 mb-2">
                                Context Actions
                            </h4>
                            <p className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold pl-1 leading-normal mb-3">
                                Click any card to dynamically inject live database logs directly into your chat.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <button
                                onClick={() => triggerQuickCommand('/attendance')}
                                className="w-full text-left bg-white hover:bg-gray-100/50 dark:bg-gray-850 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 p-3 rounded-2xl flex items-center justify-between group transition-all"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 rounded-lg group-hover:scale-105 transition-transform">
                                        <Info size={14} />
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-black text-gray-800 dark:text-gray-200">Attendance Log</div>
                                        <div className="text-[9px] font-semibold text-gray-400 dark:text-gray-500">Inject clock-in history</div>
                                    </div>
                                </div>
                                <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                            </button>

                            <button
                                onClick={() => triggerQuickCommand('/leave')}
                                className="w-full text-left bg-white hover:bg-gray-100/50 dark:bg-gray-850 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 p-3 rounded-2xl flex items-center justify-between group transition-all"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-lg group-hover:scale-105 transition-transform">
                                        <Calendar size={14} />
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-black text-gray-800 dark:text-gray-200">Leave Balance</div>
                                        <div className="text-[9px] font-semibold text-gray-400 dark:text-gray-500">Inject active leaf days</div>
                                    </div>
                                </div>
                                <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                            </button>

                            <button
                                onClick={() => triggerQuickCommand('/payroll')}
                                className="w-full text-left bg-white hover:bg-gray-100/50 dark:bg-gray-850 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 p-3 rounded-2xl flex items-center justify-between group transition-all"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 bg-amber-50 text-amber-600 dark:bg-amber-955/40 dark:text-amber-400 rounded-lg group-hover:scale-105 transition-transform">
                                        <DollarSign size={14} />
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-black text-gray-800 dark:text-gray-200">Payroll Slips</div>
                                        <div className="text-[9px] font-semibold text-gray-400 dark:text-gray-500">Inject monthly salary pay</div>
                                    </div>
                                </div>
                                <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                            </button>

                            <button
                                onClick={() => triggerQuickCommand('/assets')}
                                className="w-full text-left bg-white hover:bg-gray-100/50 dark:bg-gray-850 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 p-3 rounded-2xl flex items-center justify-between group transition-all"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 rounded-lg group-hover:scale-105 transition-transform">
                                        <Package size={14} />
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-black text-gray-800 dark:text-gray-200">Assigned Assets</div>
                                        <div className="text-[9px] font-semibold text-gray-400 dark:text-gray-500">Inject hardware inventory</div>
                                    </div>
                                </div>
                                <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
