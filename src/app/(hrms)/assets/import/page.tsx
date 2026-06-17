'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Settings, CheckCircle2, ArrowRight, Info, AlertTriangle, Loader2, RotateCcw, ChevronRight, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useAppSelector } from '@/store/hooks';
import apiClient from '@/services/apiClient';
import { ENDPOINTS } from '@/constants/endpoints';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import { assetMappingTemplateService } from '@/services/assetMappingTemplateService';

// Define the schema fields we want the user to map to
interface HRMSField {
    key: string;
    label: string;
    required: boolean;
    description: string;
    matchKeywords: string[];
}

const HRMS_FIELDS: HRMSField[] = [
    { 
        key: 'assetTag', 
        label: 'Asset Tag', 
        required: true, 
        description: 'Unique corporate tag identifier (e.g., AST-1001)', 
        matchKeywords: ['tag', 'asset tag', 'asset_tag', 'asset #', 'barcode', 'id', 'asset tag id', 'asset tag number', 'assetid'] 
    },
    { 
        key: 'name', 
        label: 'Device Name', 
        required: true, 
        description: 'Short descriptive name of the asset (e.g., MacBook Pro 16)', 
        matchKeywords: ['name', 'device name', 'asset name', 'title', 'label', 'item', 'item name', 'devicename'] 
    },
    { 
        key: 'category', 
        label: 'Category', 
        required: true, 
        description: 'Type of asset (e.g., Laptop, Monitor, Furniture)', 
        matchKeywords: ['category', 'asset category', 'type', 'asset type', 'group', 'class', 'classification'] 
    },
    { 
        key: 'serialNumber', 
        label: 'Serial Number', 
        required: false, 
        description: 'Manufacturer hardware serial code (unique)', 
        matchKeywords: ['serial number', 'serial #', 'serial_number', 's/n', 'sn', 'serialnumber', 'serial no', 'serialno'] 
    },
    { 
        key: 'manufacturer', 
        label: 'Manufacturer', 
        required: false, 
        description: 'Maker of the equipment (e.g., Apple, Dell, HP)', 
        matchKeywords: ['manufacturer', 'make', 'brand', 'vendor', 'mfg'] 
    },
    { 
        key: 'model', 
        label: 'Model Name', 
        required: false, 
        description: 'Specific manufacturer model code', 
        matchKeywords: ['model', 'model name', 'model number', 'model #', 'model_number'] 
    },
    { 
        key: 'cost', 
        label: 'Procurement Cost', 
        required: false, 
        description: 'Purchase amount in dollars', 
        matchKeywords: ['cost', 'price', 'purchase price', 'value', 'amount', 'purchase_price'] 
    },
    {
        key: 'assignedTo',
        label: 'Assigned To (Employee Email/ID)',
        required: false,
        description: 'Email address or Employee ID of the employee this asset is assigned to',
        matchKeywords: ['assigned', 'assigned to', 'assignee', 'owner', 'assigned_to', 'employee', 'user', 'names assigned to', 'assigned employee']
    },
    {
        key: 'status',
        label: 'Status',
        required: false,
        description: 'Asset lifecycle status (e.g., Available, Assigned, In Maintenance)',
        matchKeywords: ['status', 'asset status', 'asset_status', 'lifecycle status', 'state status']
    },
    {
        key: 'assignedDate',
        label: 'Assigned Date',
        required: false,
        description: 'Date the asset was assigned (defaults to importing date if empty)',
        matchKeywords: ['assigned date', 'assign date', 'assignment date', 'date assigned', 'assigned_date', 'assignment_date']
    },
    { 
        key: 'condition', 
        label: 'Condition', 
        required: false, 
        description: 'Physical state of the asset (Allowed: New, Good, Fair, Poor, Broken)', 
        matchKeywords: ['condition', 'status condition', 'physical state', 'state'] 
    },
    { 
        key: 'notes', 
        label: 'Condition / Notes', 
        required: false, 
        description: 'General remarks, condition notes, or metadata', 
        matchKeywords: ['notes', 'notes/comments', 'comments', 'description', 'remark', 'remarks'] 
    }
];

export default function AssetImportPage() {
    const router = useRouter();
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    // Stepper Wizard State
    const [step, setStep] = useState(1); // 1: Upload, 2: Mapping, 3: Preview

    // File Upload States
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [headers, setHeaders] = useState<string[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [rawPreviewRows, setRawPreviewRows] = useState<any[]>([]);
    const [allParsedRows, setAllParsedRows] = useState<any[]>([]);

    // Validation States
    const [isValidating, setIsValidating] = useState(false);
    const [validCount, setValidCount] = useState(0);
    const [invalidCount, setInvalidCount] = useState(0);
    const [validationErrors, setValidationErrors] = useState<any[]>([]);
    const [validationWarnings, setValidationWarnings] = useState<any[]>([]);
    const [isImporting, setIsImporting] = useState(false);
    const [isExportingErrors, setIsExportingErrors] = useState(false);

    // Column Mapping States
    const [mappings, setMappings] = useState<Record<string, string>>({});
    const [saveDraft, setSaveDraft] = useState(true);
    const [validationError, setValidationError] = useState('');

    // Mapping Templates States
    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [isLoadingTemplates, setIsLoadingTemplates] = useState<boolean>(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
    const [newTemplateName, setNewTemplateName] = useState<string>('');
    const [newTemplateDesc, setNewTemplateDesc] = useState<string>('');
    const [isSavingTemplate, setIsSavingTemplate] = useState<boolean>(false);
    const [createdTemplateIds, setCreatedTemplateIds] = useState<string[]>([]);

    // Fetch Saved Templates
    const fetchTemplates = async () => {
        setIsLoadingTemplates(true);
        try {
            const res = await assetMappingTemplateService.getTemplates();
            setTemplates(res.data || []);
        } catch (err) {
            console.error("Failed to load templates:", err);
            toast.error("Failed to load mapping templates.");
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    // Load draft mappings from localStorage on mount
    useEffect(() => {
        const savedDraft = localStorage.getItem('hrms_asset_import_draft_mapping');
        if (savedDraft) {
            try {
                setMappings(JSON.parse(savedDraft));
            } catch (err) {
                console.error("Failed to load draft mappings:", err);
            }
        }
    }, []);


    // Load templates when Step 2 is active
    useEffect(() => {
        if (step === 2) {
            fetchTemplates();
        }
    }, [step]);

    // Apply selected template
    const handleApplyTemplate = (templateId: string) => {
        setSelectedTemplateId(templateId);
        if (!templateId) return;
        const selected = templates.find(t => t._id === templateId);
        if (selected) {
            const rawMappings = selected.mappings || {};
            const updatedMappings = { ...mappings };
            HRMS_FIELDS.forEach(field => {
                const val = rawMappings[field.key];
                if (val !== undefined && val !== null) {
                    updatedMappings[field.key] = val;
                } else {
                    updatedMappings[field.key] = '';
                }
            });
            setMappings(updatedMappings);
            toast.success(`Template "${selected.name}" applied successfully!`);
        }
    };

    // Save Template Action
    const handleSaveTemplateSubmit = async () => {
        if (!newTemplateName.trim()) {
            toast.error("Please enter a template name.");
            return;
        }

        setIsSavingTemplate(true);
        try {
            const activeMappings: Record<string, string> = {};
            Object.entries(mappings).forEach(([key, val]) => {
                if (val) activeMappings[key] = val;
            });

            const res = await assetMappingTemplateService.createTemplate({
                name: newTemplateName.trim(),
                description: newTemplateDesc.trim(),
                mappings: activeMappings
            });

            toast.success("Mapping template saved successfully!");
            setIsSaveModalOpen(false);
            setNewTemplateName('');
            setNewTemplateDesc('');
            await fetchTemplates();
            if (res.data && res.data._id) {
                setSelectedTemplateId(res.data._id);
                setCreatedTemplateIds(prev => [...prev, res.data._id]);
            }
        } catch (err: any) {
            console.error("Failed to save template:", err);
            const errMsg = err.response?.data?.message || "Failed to save template.";
            toast.error(errMsg);
        } finally {
            setIsSavingTemplate(false);
        }
    };

    // Update Template Action
    const handleUpdateTemplate = async () => {
        if (!selectedTemplateId) {
            toast.error("No template is currently selected to update.");
            return;
        }

        const template = templates.find(t => t._id === selectedTemplateId);
        if (!template) return;

        setIsSavingTemplate(true);
        try {
            const activeMappings: Record<string, string> = {};
            Object.entries(mappings).forEach(([key, val]) => {
                if (val) activeMappings[key] = val;
            });

            await assetMappingTemplateService.updateTemplate(selectedTemplateId, {
                name: template.name,
                description: template.description,
                mappings: activeMappings
            });

            toast.success(`Template "${template.name}" updated successfully!`);
            await fetchTemplates();
        } catch (err: any) {
            console.error("Failed to update template:", err);
            const errMsg = err.response?.data?.message || "Failed to update template.";
            toast.error(errMsg);
        } finally {
            setIsSavingTemplate(false);
        }
    };

    // Delete Template Action
    const handleDeleteTemplate = async () => {
        if (!selectedTemplateId) {
            toast.error("No template is currently selected to delete.");
            return;
        }

        const template = templates.find(t => t._id === selectedTemplateId);
        if (!template) return;

        if (!confirm(`Are you sure you want to delete the mapping template "${template.name}"?`)) {
            return;
        }

        try {
            await assetMappingTemplateService.deleteTemplate(selectedTemplateId);
            toast.success(`Template "${template.name}" deleted successfully!`);
            setSelectedTemplateId('');
            await fetchTemplates();
        } catch (err: any) {
            console.error("Failed to delete template:", err);
            const errMsg = err.response?.data?.message || "Failed to delete template.";
            toast.error(errMsg);
        }
    };

    // Perform Fuzzy Auto-Matching when file headers are parsed
    const performFuzzyAutoMatch = (parsedHeaders: string[]) => {
        const newMappings: Record<string, string> = {};
        
        // Load draft mapping first
        const savedDraft = localStorage.getItem('hrms_asset_import_draft_mapping');
        let draftObj: Record<string, string> = {};
        if (savedDraft) {
            try {
                draftObj = JSON.parse(savedDraft);
            } catch (e) {}
        }

        HRMS_FIELDS.forEach((field) => {
            // 1. If draft contains a mapping for this key and it's present in current headers, use it!
            if (draftObj[field.key] && parsedHeaders.includes(draftObj[field.key])) {
                newMappings[field.key] = draftObj[field.key];
                return;
            }

            // 2. Perform keyword fuzzy auto-suggestion
            const matchedHeader = parsedHeaders.find((hdr) => {
                const cleanHdr = hdr.toLowerCase().trim();
                return field.matchKeywords.some(keyword => 
                    cleanHdr === keyword || 
                    cleanHdr.includes(keyword) || 
                    keyword.includes(cleanHdr)
                );
            });

            if (matchedHeader) {
                newMappings[field.key] = matchedHeader;
            } else {
                newMappings[field.key] = '';
            }
        });

        setMappings(newMappings);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
            setValidationError('');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setValidationError('Please select a file to upload.');
            return;
        }

        const ext = selectedFile.name.split('.').pop()?.toLowerCase();
        if (ext !== 'xlsx' && ext !== 'xls' && ext !== 'csv') {
            setValidationError('Unsupported file type. Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed.');
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            setValidationError('File size exceeds the limit. Maximum allowed size is 10MB.');
            return;
        }

        setIsUploading(true);
        setValidationError('');

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await apiClient.post(ENDPOINTS.ASSET.UPLOAD, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const fileData = response.data.data;
            setHeaders(fileData.headers || []);
            setTotalRows(fileData.totalRows || 0);
            setRawPreviewRows(fileData.preview || []);
            setAllParsedRows(fileData.rows || []);
            
            performFuzzyAutoMatch(fileData.headers || []);
            setStep(2); // Advance to mapping step
            toast.success('File uploaded and analyzed successfully!');
        } catch (error: any) {
            console.error('File analysis failed:', error);
            const errMsg = error.response?.data?.message || 'Failed to upload and parse the spreadsheet.';
            setValidationError(errMsg);
            toast.error(errMsg);
        } finally {
            setIsUploading(false);
        }
    };

    const handleMappingChange = (fieldKey: string, excelHeader: string) => {
        setMappings(prev => ({
            ...prev,
            [fieldKey]: excelHeader
        }));
        setValidationError('');
    };

    const validateMappings = () => {
        setValidationError('');

        // 1. Required Fields mapped validation
        const missingRequired = HRMS_FIELDS.filter(f => f.required && !mappings[f.key]);
        if (missingRequired.length > 0) {
            setValidationError(`Required fields mapping missing: ${missingRequired.map(f => f.label).join(', ')}.`);
            return false;
        }

        // 2. Prevent mapping duplicate columns (excluding unmapped/empty fields)
        const activeMappedValues = Object.entries(mappings)
            .filter(([_, val]) => !!val)
            .map(([_, val]) => val);
        const uniqueValues = new Set(activeMappedValues);
        if (activeMappedValues.length !== uniqueValues.size) {
            setValidationError('Each Excel column can only be mapped to a single HRMS field.');
            return false;
        }

        // Save mapping template draft to localStorage if enabled
        if (saveDraft) {
            localStorage.setItem('hrms_asset_import_draft_mapping', JSON.stringify(mappings));
        }

        return true;
    };

    const handleProceedToPreview = async () => {
        if (!validateMappings()) return;

        setIsValidating(true);
        setValidationError('');

        try {
            const response = await apiClient.post(ENDPOINTS.ASSET.VALIDATE, {
                rows: allParsedRows,
                mappings
            });

            const valData = response.data.data;
            setValidCount(valData.validCount);
            setInvalidCount(valData.invalidCount);
            setValidationErrors(valData.errors || []);
            setValidationWarnings(valData.warnings || []);
            setStep(3);
            toast.success('Row validation completed successfully!');
        } catch (error: any) {
            console.error('Validation failed:', error);
            const errMsg = error.response?.data?.message || 'Failed to validate imported rows.';
            setValidationError(errMsg);
            toast.error(errMsg);
        } finally {
            setIsValidating(false);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await apiClient.get(ENDPOINTS.ASSET.TEMPLATE, { responseType: 'blob' });
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Asset_Import_Template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Template downloaded successfully!');
        } catch (error) {
            console.error('Failed to download template:', error);
            toast.error('Failed to download import template.');
        }
    };

    const handleImportSubmit = async () => {
        setIsImporting(true);
        try {
            const response = await apiClient.post(ENDPOINTS.ASSET.IMPORT, {
                rows: allParsedRows,
                mappings,
                fileName: selectedFile ? selectedFile.name : 'unknown_spreadsheet.xlsx',
                failureCount: invalidCount
            });
            const result = response.data.data;
            setCreatedTemplateIds([]); // Clear tracking without deleting on successful import
            toast.success(`Successfully imported ${result.count} assets in ${result.metrics.totalMs}ms!`);
            router.push('/assets');
        } catch (error: any) {
            console.error('Import failed:', error);
            const errMsg = error.response?.data?.message || 'Failed to complete the asset import.';
            toast.error(errMsg);
        } finally {
            setIsImporting(false);
        }
    };

    const handleExportErrors = async (format: 'csv' | 'xlsx') => {
        if (validationErrors.length === 0) {
            toast.error("No errors to export.");
            return;
        }

        setIsExportingErrors(true);
        try {
            const response = await apiClient.post(
                ENDPOINTS.ASSET.EXPORT_ERRORS,
                { errors: validationErrors, format },
                { responseType: 'blob' }
            );

            // Create blob link and trigger download
            const blob = new Blob([response.data], {
                type: format === 'csv' 
                    ? 'text/csv' 
                    : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `import_errors.${format}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success(`Error report downloaded in ${format.toUpperCase()} format.`);
        } catch (error: any) {
            console.error('Exporting errors failed:', error);
            toast.error('Failed to export error report.');
        } finally {
            setIsExportingErrors(false);
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setHeaders([]);
        setTotalRows(0);
        setRawPreviewRows([]);
        setAllParsedRows([]);
        setValidCount(0);
        setInvalidCount(0);
        setValidationErrors([]);
        setValidationWarnings([]);
        setValidationError('');
        setIsImporting(false);
        setIsExportingErrors(false);

        // Clean up newly created templates if the user aborts/clears the import
        if (createdTemplateIds.length > 0) {
            createdTemplateIds.forEach(async (templateId) => {
                try {
                    await assetMappingTemplateService.deleteTemplate(templateId);
                } catch (err) {
                    console.error("Failed to delete aborted template:", templateId, err);
                }
            });
            setCreatedTemplateIds([]);
        }

        setStep(1);
    };

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Header Section */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            if (step > 1) {
                                setStep(prev => prev - 1);
                                setValidationError('');
                            } else {
                                router.push('/assets');
                            }
                        }}
                        className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-all shadow-sm"
                        aria-label="Back"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">
                            Import Assets Inventory
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium transition-colors">
                            Upload spreadsheet files, map columns dynamically, and preview raw data before importing.
                        </p>
                    </div>
                </div>

                {/* Stepper Status Indicators */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-colors duration-300 font-medium text-sm">
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs",
                            step === 1 ? "bg-blue-600 text-white" : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        )}>
                            1
                        </span>
                        <span className={cn(step === 1 ? "text-gray-900 dark:text-gray-100" : "text-gray-500")}>Upload File</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs",
                            step === 2 ? "bg-blue-600 text-white" : step > 2 ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                        )}>
                            2
                        </span>
                        <span className={cn(step === 2 ? "text-gray-900 dark:text-gray-100" : "text-gray-500")}>Column Mapping</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs",
                            step === 3 ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                        )}>
                            3
                        </span>
                        <span className={cn(step === 3 ? "text-gray-900 dark:text-gray-100" : "text-gray-500")}>Preview Data</span>
                    </div>
                </div>

                {/* Validation Error Message Alert */}
                {validationError && (
                    <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-medium text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                        <div>{validationError}</div>
                    </div>
                )}

                {/* Card Container */}
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 transition-colors duration-300">
                    
                    {/* STEP 1: UPLOAD CARD CONTENT */}
                    {step === 1 && (
                        <>
                            <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
                                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                                    Step 1: Select Spreadsheet File
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-10 text-center cursor-pointer transition-colors relative bg-gray-50/20 dark:bg-gray-950/5 flex flex-col items-center justify-center group">
                                    <input 
                                        type="file" 
                                        onChange={handleFileChange}
                                        disabled={isUploading}
                                        accept=".xlsx,.xls,.csv"
                                        className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                        aria-label="Upload file"
                                    />
                                    <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300 mb-4 shrink-0">
                                        <Upload size={32} />
                                    </div>
                                    <p className="font-bold text-gray-900 dark:text-gray-100 text-base">
                                        {selectedFile ? selectedFile.name : 'Click or drag file here to upload'}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Supports Excel (.xlsx, .xls) and CSV (.csv) formats up to 10MB.
                                    </p>
                                    {selectedFile && (
                                        <div className="mt-4 px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                            Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between items-center pt-4">
                                    <Button 
                                        variant="outline" 
                                        onClick={handleDownloadTemplate}
                                        disabled={isUploading}
                                        className="gap-2 font-semibold text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                                    >
                                        <Download size={16} />
                                        Download Template
                                    </Button>
                                    <div className="flex gap-3">
                                        {selectedFile && (
                                            <Button variant="ghost" onClick={() => setSelectedFile(null)} disabled={isUploading}>
                                                Reset Selection
                                            </Button>
                                        )}
                                        <Button 
                                            variant="primary" 
                                            onClick={handleUpload}
                                            disabled={!selectedFile || isUploading}
                                            className="min-w-[140px] font-bold gap-2"
                                        >
                                            {isUploading ? <Loader2 size={16} className="animate-spin" /> : null}
                                            {isUploading ? 'Analyzing...' : 'Upload & Match'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </>
                    )}

                    {/* STEP 2: COLUMN MAPPING CARD CONTENT */}
                    {step === 2 && !isValidating && (
                        <>
                            <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
                                <CardTitle className="text-lg text-gray-900 dark:text-gray-100 flex items-center justify-between">
                                    <span>Step 2: Map Excel Columns to HRMS Fields</span>
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 font-mono">
                                        Headers Found: {headers.length} | Rows Found: {totalRows}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                
                                {/* Mapping Template Controls */}
                                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 space-y-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Saved Mapping Templates</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Apply, update, or delete pre-defined column mapping templates.</p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsSaveModalOpen(true)}
                                            className="text-xs font-bold shrink-0 self-start md:self-auto"
                                        >
                                            Save Current as Template
                                        </Button>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                                        <select
                                            value={selectedTemplateId}
                                            onChange={(e) => handleApplyTemplate(e.target.value)}
                                            className="flex-1 h-9 px-3 rounded-md border border-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500/40 focus:border-transparent text-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 cursor-pointer transition-all"
                                            disabled={isLoadingTemplates}
                                        >
                                            <option value="">-- Apply a Saved Template --</option>
                                            {templates.map((t) => (
                                                <option key={t._id} value={t._id}>{t.name}</option>
                                            ))}
                                        </select>
                                        {selectedTemplateId && (
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={handleUpdateTemplate}
                                                    disabled={isSavingTemplate}
                                                    className="text-xs font-bold h-9"
                                                >
                                                    {isSavingTemplate ? 'Updating...' : 'Update Template'}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={handleDeleteTemplate}
                                                    className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-9"
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Info Box */}
                                <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-955/10 text-blue-750 dark:text-blue-400 text-sm flex gap-3 leading-relaxed transition-colors">
                                    <Info size={18} className="shrink-0 mt-0.5" />
                                    <div>
                                        <strong>Fuzzy Matching Activated:</strong> We automatically matched columns based on label likeness. Please review all fields, especially required targets marked with red asterisks (<span className="text-red-500">*</span>).
                                    </div>
                                </div>

                                {/* Columns Mapping Form */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                    {HRMS_FIELDS.map((field) => (
                                        <div key={field.key} className="space-y-1.5 p-3 rounded-lg border border-gray-100 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-950/20 transition-all">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                                </label>
                                                {mappings[field.key] && (
                                                    <span className="text-[10px] bg-green-50 text-green-700 dark:bg-green-955/35 dark:text-green-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <CheckCircle2 size={10} /> Auto-suggested
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{field.description}</p>
                                            
                                            <select
                                                value={mappings[field.key] || ''}
                                                onChange={(e) => handleMappingChange(field.key, e.target.value)}
                                                className="w-full mt-2 h-9 px-3 rounded-md border border-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500/40 focus:border-transparent text-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 cursor-pointer transition-all"
                                            >
                                                <option value="">-- Do Not Map --</option>
                                                {headers.map((header) => (
                                                    <option key={header} value={header}>
                                                        {header}
                                                     </option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>

                                {/* Save Draft Checkbox */}
                                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-955/40 border border-gray-200 dark:border-gray-850 rounded-xl mt-4">
                                    <input 
                                        type="checkbox"
                                        id="saveDraft"
                                        checked={saveDraft}
                                        onChange={(e) => setSaveDraft(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-355 dark:border-gray-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                    <label htmlFor="saveDraft" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                                        Save mapping settings as draft template in local storage
                                    </label>
                                </div>

                                {/* Footers Actions */}
                                <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
                                    <Button variant="ghost" onClick={handleReset} className="gap-2">
                                        <RotateCcw size={16} /> Start Over
                                    </Button>
                                    <div className="flex gap-3">
                                        <Button variant="ghost" onClick={() => setStep(1)}>
                                            Back
                                        </Button>
                                        <Button variant="primary" onClick={handleProceedToPreview} className="gap-2 font-bold min-w-[120px]">
                                            Continue <ArrowRight size={16} />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </>
                    )}

                    {/* LIVE VALIDATION LOADER CARD */}
                    {isValidating && (
                        <div className="flex flex-col items-center justify-center p-20 space-y-4">
                            <Loader2 size={40} className="animate-spin text-blue-600 dark:text-blue-500" />
                            <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">Running validation rules...</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Verifying unique asset tags, serial numbers, date formats, and dynamic references.</p>
                        </div>
                    )}

                    {/* STEP 3: MAPPED PREVIEW CARD CONTENT */}
                    {step === 3 && !isValidating && (
                        <>
                            <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
                                <CardTitle className="text-lg text-gray-900 dark:text-gray-100 flex items-center justify-between">
                                    <span>Step 3: Mapped Asset Validation Summary</span>
                                    <span className={cn(
                                        "text-xs px-2.5 py-1 rounded-full font-bold",
                                        invalidCount === 0 
                                            ? "bg-green-100 text-green-800 dark:bg-green-955/30 dark:text-green-450"
                                            : "bg-red-100 text-red-800 dark:bg-red-955/30 dark:text-red-450"
                                    )}>
                                        {invalidCount === 0 ? 'Validation Passed' : `${invalidCount} Errors Detected`}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                
                                {/* Stats Summary Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-955/20">
                                        <div className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider">Total Rows Checked</div>
                                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalRows}</div>
                                    </div>
                                    <div className="p-4 rounded-xl border border-green-200 dark:border-green-900/20 bg-green-50/20 dark:bg-green-955/10">
                                        <div className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Valid Rows</div>
                                        <div className="text-2xl font-bold text-green-700 dark:text-green-400 mt-1">{validCount}</div>
                                    </div>
                                    <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/20 bg-red-50/20 dark:bg-red-955/10">
                                        <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Invalid Rows</div>
                                        <div className="text-2xl font-bold text-red-700 dark:text-red-400 mt-1">{invalidCount}</div>
                                    </div>
                                </div>

                                {/* Status Banner Box */}
                                {invalidCount === 0 && validationWarnings.length === 0 ? (
                                    <div className="p-4 rounded-xl border border-green-150 dark:border-green-900/35 bg-green-50/50 dark:bg-green-955/10 text-green-800 dark:text-green-400 text-sm flex gap-3 leading-relaxed">
                                        <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-green-600" />
                                        <div>
                                            <strong>Success:</strong> All records are validated successfully! The template and asset data are fully aligned.
                                        </div>
                                    </div>
                                ) : invalidCount === 0 && validationWarnings.length > 0 ? (
                                    <div className="p-4 rounded-xl border border-amber-150 dark:border-amber-900/35 bg-amber-50/50 dark:bg-amber-955/10 text-amber-850 dark:text-amber-400 text-sm flex gap-3 leading-relaxed">
                                        <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-600" />
                                        <div>
                                            <strong>Warnings Detected:</strong> {validationWarnings.length} warnings found. You can still complete the import; these assets will be marked as unassigned.
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-xl border border-red-150 dark:border-red-900/35 bg-red-50/50 dark:bg-red-955/10 text-red-800 dark:text-red-400 text-sm flex gap-3 leading-relaxed">
                                        <AlertTriangle size={18} className="shrink-0 mt-0.5 text-red-600" />
                                        <div>
                                            <strong>Validation Flagged:</strong> {invalidCount} records fail the validation rules. Correct the issues listed below to allow imports.
                                        </div>
                                    </div>
                                )}

                                {/* Validation Errors Summary Table */}
                                {validationErrors.length > 0 && (
                                    <div className="border border-red-200 dark:border-red-900/30 rounded-xl overflow-hidden shadow-sm">
                                        <div className="px-4 py-3 bg-red-50/80 dark:bg-red-955/20 border-b border-red-100 dark:border-red-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <span className="text-sm font-bold text-red-800 dark:text-red-400 flex items-center gap-2">
                                                <AlertTriangle size={16} /> Row Validation Failure Details ({validationErrors.length})
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleExportErrors('csv')}
                                                    disabled={isExportingErrors}
                                                    className="text-xs font-bold py-1 h-8 text-red-700 hover:text-red-800 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-955/20 shrink-0"
                                                >
                                                    Export CSV
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleExportErrors('xlsx')}
                                                    disabled={isExportingErrors}
                                                    className="text-xs font-bold py-1 h-8 text-red-700 hover:text-red-800 border-red-200 dark:border-red-900/50 hover:bg-red-55 dark:hover:bg-red-955/20 shrink-0"
                                                >
                                                    Export Excel
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto divide-y divide-red-100 dark:divide-red-955/20 bg-white dark:bg-gray-950/10">
                                            {validationErrors.map((err, idx) => (
                                                <div key={idx} className="px-4 py-3 text-xs md:text-sm flex items-start gap-4 hover:bg-red-50/10 transition-colors">
                                                    <span className="font-mono font-bold bg-red-100 dark:bg-red-950/80 text-red-750 dark:text-red-450 px-2 py-0.5 rounded shrink-0">
                                                        Row {err.row}
                                                    </span>
                                                    <span className="font-bold text-gray-500 dark:text-gray-405 font-mono shrink-0 uppercase">
                                                        [{err.field}]
                                                    </span>
                                                    <span className="text-gray-700 dark:text-gray-300">
                                                        {err.message}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Validation Warnings Summary Table */}
                                {validationWarnings.length > 0 && (
                                    <div className="border border-amber-205 dark:border-amber-900/30 rounded-xl overflow-hidden shadow-sm">
                                        <div className="px-4 py-3 bg-amber-50/80 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/20">
                                            <span className="text-sm font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2">
                                                <AlertTriangle size={16} /> Row Validation Warning Details ({validationWarnings.length})
                                            </span>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto divide-y divide-amber-100 dark:divide-amber-955/20 bg-white dark:bg-gray-950/10">
                                            {validationWarnings.map((warn, idx) => (
                                                <div key={idx} className="px-4 py-3 text-xs md:text-sm flex items-start gap-4 hover:bg-amber-50/10 transition-colors">
                                                    <span className="font-mono font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-750 dark:text-amber-400 px-2 py-0.5 rounded shrink-0">
                                                        Row {warn.row}
                                                    </span>
                                                    <span className="font-bold text-gray-500 dark:text-gray-405 font-mono shrink-0 uppercase">
                                                        [{warn.field}]
                                                    </span>
                                                    <span className="text-gray-700 dark:text-gray-300">
                                                        {warn.message}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Grid Preview */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Data Preview (First 3 Mapped Rows)
                                    </h3>
                                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50/20">
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 font-bold uppercase tracking-wider text-xs font-mono">
                                                <tr>
                                                    {HRMS_FIELDS.filter(f => !!mappings[f.key]).map((f) => (
                                                        <th key={f.key} className="px-4 py-3 border-r border-gray-100 dark:border-gray-800/50 last:border-r-0">
                                                            {f.label}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900 font-medium">
                                                {rawPreviewRows.map((row, rowIdx) => (
                                                    <tr key={rowIdx} className="hover:bg-gray-50 dark:hover:bg-gray-850/50">
                                                        {HRMS_FIELDS.filter(f => !!mappings[f.key]).map((f) => {
                                                            const excelHeader = mappings[f.key];
                                                            const cellValue = row[excelHeader];
                                                            return (
                                                                <td key={f.key} className="px-4 py-3 border-r border-gray-100 dark:border-gray-800/50 last:border-r-0 text-gray-800 dark:text-gray-200">
                                                                    {cellValue !== undefined && cellValue !== null ? cellValue.toString() : <span className="text-gray-400 italic">None</span>}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-955/10 text-blue-750 dark:text-blue-405 text-sm flex gap-3 leading-relaxed">
                                    <Info size={18} className="shrink-0 mt-0.5 text-blue-550" />
                                    <div>
                                        <strong>Ready to Import:</strong> Confirming this action will atomically persist the validated records to the database.
                                    </div>
                                </div>

                                {/* Footers Actions */}
                                <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
                                    <Button variant="ghost" onClick={handleReset} disabled={isImporting} className="gap-2">
                                        <RotateCcw size={16} /> Cancel Import
                                    </Button>
                                    <div className="flex gap-3">
                                        <Button variant="ghost" onClick={() => setStep(2)} disabled={isImporting}>
                                            Back
                                        </Button>
                                        <Button 
                                            variant="primary" 
                                            onClick={handleImportSubmit} 
                                            disabled={invalidCount > 0 || isImporting}
                                            className="gap-2 font-bold min-w-[140px] shadow-sm shadow-blue-500/25"
                                        >
                                            {isImporting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                            {isImporting ? 'Importing...' : 'Complete Import'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </>
                    )}
                </Card>
            </div>

            {/* Save Mapping Template Modal */}
            {isSaveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Save Mapping Template</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Provide a name to save these mapped column fields for reuse.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label htmlFor="tempName" className="text-xs font-bold text-gray-700 dark:text-gray-300">Template Name *</label>
                                <input
                                    type="text"
                                    id="tempName"
                                    value={newTemplateName}
                                    onChange={(e) => setNewTemplateName(e.target.value)}
                                    placeholder="e.g. Dell Asset Import"
                                    className="w-full h-9 px-3 rounded-md border border-gray-350 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500/40 text-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
                                    maxLength={100}
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="tempDesc" className="text-xs font-bold text-gray-700 dark:text-gray-300">Description</label>
                                <textarea
                                    id="tempDesc"
                                    value={newTemplateDesc}
                                    onChange={(e) => setNewTemplateDesc(e.target.value)}
                                    placeholder="Optional description of the import source or file format"
                                    className="w-full p-2.5 rounded-md border border-gray-350 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500/40 text-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 h-20 resize-none"
                                    maxLength={500}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setIsSaveModalOpen(false);
                                    setNewTemplateName('');
                                    setNewTemplateDesc('');
                                }}
                                disabled={isSavingTemplate}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleSaveTemplateSubmit}
                                disabled={!newTemplateName.trim() || isSavingTemplate}
                                className="font-bold gap-2"
                            >
                                {isSavingTemplate ? <Loader2 size={14} className="animate-spin" /> : null}
                                Save Template
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
