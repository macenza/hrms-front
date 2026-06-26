// src/app/interview/[token]/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { 
    Camera, 
    Mic, 
    CheckCircle2, 
    AlertCircle, 
    Laptop, 
    Video, 
    Play, 
    ArrowRight, 
    Lock,
    ShieldCheck,
    AlertTriangle,
    Wifi
} from "lucide-react";
import apiClient from "@/services/apiClient";
import { cn } from "@/utils/cn";

interface RoundInfo {
    id: string;
    roundNumber: number;
    roundType: string;
    status: string;
    scheduledTime: string;
    durationMinutes: number;
    notes?: string;
    candidateName: string;
    candidateEmail: string;
    jobTitle: string;
    jobDepartment?: string;
    jobLocation?: string;
    interviewers?: string[];
}

export default function CandidateInterviewPortal() {
    const params = useParams();
    const token = params.token as string;

    // Phase / UI state
    const [step, setStep] = useState<"loading" | "error" | "welcome" | "diagnostics" | "completed">("loading");
    const [errorMessage, setErrorMessage] = useState("");
    const [roundInfo, setRoundInfo] = useState<RoundInfo | null>(null);

    // Diagnostics states
    const [browserCompatible, setBrowserCompatible] = useState<boolean | null>(null);
    const [internetConnected, setInternetConnected] = useState<boolean | null>(null);
    const [cameraPassed, setCameraPassed] = useState<boolean | null>(null);
    const [microphonePassed, setMicrophonePassed] = useState<boolean | null>(null);

    // Media streams
    const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
    const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
    
    // Audio Level Metering
    const [audioLevel, setAudioLevel] = useState<number>(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    // Final meeting URL
    const [meetingUrl, setMeetingUrl] = useState("");
    const [isSubmittingCheck, setIsSubmittingCheck] = useState(false);

    // 1. Fetch Round Info on Mount
    useEffect(() => {
        if (!token) {
            setStep("error");
            setErrorMessage("Interview token is missing.");
            return;
        }

        const fetchRoundDetails = async () => {
            try {
                const response = await apiClient.get(`/interviews/public/round/${token}`);
                if (response.data?.success && response.data?.data) {
                    setRoundInfo(response.data.data);
                    setStep("welcome");
                } else {
                    setStep("error");
                    setErrorMessage("Unable to fetch interview details.");
                }
            } catch (err: any) {
                setStep("error");
                setErrorMessage(
                    err.response?.data?.message || 
                    "This interview link is invalid, expired, or has been cancelled."
                );
            }
        };

        fetchRoundDetails();
    }, [token]);

    // Clean up streams on unmount or state changes
    useEffect(() => {
        return () => {
            stopAllStreams();
        };
    }, [videoStream, audioStream]);

    const stopAllStreams = () => {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
        }
        if (audioStream) {
            audioStream.getTracks().forEach(track => track.stop());
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => {});
        }
    };

    // 2. Diagnostics Run
    const runDiagnostics = async () => {
        setStep("diagnostics");
        
        // A. Browser compatibility
        const isWebRTCSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        setBrowserCompatible(isWebRTCSupported);

        // B. Internet connection
        setInternetConnected(navigator.onLine);
        
        // Proactively request camera/mic
        await requestCamera();
        await requestMicrophone();
    };

    // C. Request Camera Access
    const requestCamera = async () => {
        try {
            setCameraPassed(null);
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480, facingMode: "user" } 
            });
            setVideoStream(stream);
            setCameraPassed(true);
            
            // Set source of preview video element
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (err) {
            console.error("Camera access failed:", err);
            setCameraPassed(false);
        }
    };

    // D. Request Microphone Access and configure VU Meter
    const requestMicrophone = async () => {
        try {
            setMicrophonePassed(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setAudioStream(stream);
            setMicrophonePassed(true);

            // Hook up audio metering
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const audioCtx = new AudioContextClass();
            const analyser = audioCtx.createAnalyser();
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 256;
            
            audioContextRef.current = audioCtx;
            analyserRef.current = analyser;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateVolume = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArray);
                let values = 0;
                for (let i = 0; i < bufferLength; i++) {
                    values += dataArray[i];
                }
                const average = values / bufferLength;
                // Scale to percentage (0 - 100)
                setAudioLevel(Math.min(Math.round((average / 128) * 100), 100));
                animationFrameRef.current = requestAnimationFrame(updateVolume);
            };

            updateVolume();
        } catch (err) {
            console.error("Microphone access failed:", err);
            setMicrophonePassed(false);
        }
    };

    // E. Save results and proceed
    const handleProceedToInterview = async () => {
        if (!browserCompatible || !internetConnected || !cameraPassed || !microphonePassed) {
            return;
        }

        setIsSubmittingCheck(true);
        try {
            const response = await apiClient.post(`/interviews/public/round/${token}/system-check`, {
                cameraPassed: true,
                microphonePassed: true,
                browserCompatible: true,
                internetConnected: true
            });

            if (response.data?.success && response.data?.data?.meetingUrl) {
                setMeetingUrl(response.data.data.meetingUrl);
                setStep("completed");
                stopAllStreams();
            } else {
                alert("Failed to confirm diagnostics. Please contact system admin.");
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to record check results.");
        } finally {
            setIsSubmittingCheck(false);
        }
    };

    // Render components
    if (step === "loading") {
        return (
            <div className="min-h-screen bg-[#080b11] text-gray-100 flex flex-col items-center justify-center p-6 font-sans">
                <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4" />
                <p className="text-gray-400 text-sm font-semibold tracking-wider animate-pulse">
                    VALIDATING SECURE INTERVIEW TOKEN...
                </p>
            </div>
        );
    }

    if (step === "error" || !roundInfo) {
        return (
            <div className="min-h-screen bg-[#080b11] text-gray-100 flex flex-col items-center justify-center p-6 font-sans">
                <div className="max-w-md w-full bg-gray-900 border border-red-500/20 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
                    {/* Visual backdrop highlight */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-500/10 rounded-full blur-3xl" />
                    
                    <div className="relative">
                        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto text-red-400">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-xl font-bold tracking-tight text-white">Invalid or Expired Link</h2>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            {errorMessage || "The interview link is invalid, expired, or cancelled. Please reach out to your HR Coordinator."}
                        </p>
                    </div>

                    <div className="pt-2">
                        <div className="text-xs text-gray-550 border-t border-gray-800/80 pt-4 font-mono">
                            Security Reference: TOKEN_EXPIRED_OR_REVOKED
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080b11] text-gray-100 flex flex-col items-center justify-center p-4 md:p-6 selection:bg-blue-500 selection:text-white font-sans antialiased">
            {/* Header logo/brand */}
            <div className="absolute top-6 left-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/25">
                    H
                </div>
                <span className="font-black text-sm tracking-widest text-white">HRMS PORTAL</span>
            </div>

            {step === "welcome" && (
                <div className="max-w-2xl w-full bg-gray-900/60 backdrop-blur-xl border border-gray-800/80 rounded-3xl p-6 md:p-10 shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <Lock className="w-3.5 h-3.5" /> Secure Session Authenticated
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                            Welcome, {roundInfo.candidateName}
                        </h1>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            You have been invited to join an online interview for the position of <strong className="text-white font-bold">{roundInfo.jobTitle}</strong>. Please review the details and complete the system hardware diagnostics checklist before entering the meeting room.
                        </p>
                    </div>

                    {/* Interview Details Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-950/80 border border-gray-800/60 rounded-2xl p-5 text-sm">
                        <div className="space-y-1">
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Position / Role</span>
                            <span className="font-bold text-white text-base">{roundInfo.jobTitle}</span>
                            <span className="text-xs text-gray-400 block">{roundInfo.jobDepartment || "General Department"}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Round Details</span>
                            <span className="font-bold text-white text-base">{roundInfo.roundType} Round</span>
                            <span className="text-xs text-gray-400 block">{roundInfo.durationMinutes} Minutes Duration</span>
                        </div>
                    </div>

                    {/* Candidate Instructions */}
                    {roundInfo.notes && (
                        <div className="space-y-2 border-t border-gray-800/80 pt-6">
                            <h3 className="text-xs font-bold text-gray-450 uppercase tracking-widest">Interview Round Instructions</h3>
                            <div className="bg-gray-950/40 border border-gray-850 rounded-xl p-4 text-sm text-gray-300 leading-relaxed italic">
                                "{roundInfo.notes}"
                            </div>
                        </div>
                    )}

                    {/* Pre-check instruction list */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-gray-450 uppercase tracking-widest">Security & Compliance Guidelines</h3>
                        <ul className="text-xs text-gray-400 space-y-2 pl-4 list-disc leading-relaxed">
                            <li>By proceeding, you permit the portal to check and verify device microphone and camera compatibility.</li>
                            <li>The results of the browser check, network stability check, and audio/video check will be recorded to your application profile.</li>
                            <li>No AI evaluation, proctoring hooks, audio recording, or visual recordings are enabled.</li>
                        </ul>
                    </div>

                    <button
                        onClick={runDiagnostics}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.99]"
                    >
                        Start System Check <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {step === "diagnostics" && (
                <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-5 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Left 3 Columns: Diagnostics checks & previews */}
                    <div className="lg:col-span-3 bg-gray-900/60 backdrop-blur-xl border border-gray-800/80 rounded-3xl p-6 md:p-8 space-y-8 flex flex-col justify-between">
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-white">Device Diagnostics Wizard</h2>
                                <p className="text-xs text-gray-400 mt-1">
                                    Please enable camera and microphone access when requested by your browser.
                                </p>
                            </div>

                            {/* Live Video Preview container */}
                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-950 border border-gray-850 flex items-center justify-center group shadow-inner">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className={cn(
                                        "w-full h-full object-cover transition-opacity duration-300",
                                        cameraPassed ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                
                                {!cameraPassed && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 space-y-3">
                                        <div className="w-12 h-12 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center text-gray-500 animate-pulse">
                                            <Video className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-gray-400 block">Camera Feed Offline</span>
                                            <span className="text-[11px] text-gray-500 max-w-[200px] block mt-0.5">
                                                Grant camera permissions to enable diagnostics preview.
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* VU Audio Level Meter */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-semibold text-gray-400">Microphone Input Level</span>
                                    <span className={cn(
                                        "font-mono",
                                        microphonePassed ? "text-green-400" : "text-gray-500"
                                    )}>
                                        {microphonePassed ? `${audioLevel}%` : "Muted/Offline"}
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-gray-950 border border-gray-850 rounded-full overflow-hidden p-0.5 flex gap-0.5">
                                    <div 
                                        className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-green-500 rounded-full transition-all duration-75"
                                        style={{ width: `${microphonePassed ? audioLevel : 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pass status & Action */}
                        <div className="pt-6 border-t border-gray-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <span className="text-xs text-gray-500 font-bold block">Status Summary</span>
                                {browserCompatible && internetConnected && cameraPassed && microphonePassed ? (
                                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                                        <ShieldCheck className="w-4 h-4" /> All checks passed. You are ready to join.
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5 mt-0.5 animate-pulse">
                                        <AlertCircle className="w-4 h-4" /> System diagnostics incomplete.
                                    </span>
                                )}
                            </div>

                            <button
                                disabled={!(browserCompatible && internetConnected && cameraPassed && microphonePassed) || isSubmittingCheck}
                                onClick={handleProceedToInterview}
                                className={cn(
                                    "px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg duration-300",
                                    browserCompatible && internetConnected && cameraPassed && microphonePassed
                                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25 active:scale-[0.98]"
                                        : "bg-gray-800 text-gray-500 cursor-not-allowed shadow-none border border-gray-850"
                                )}
                            >
                                {isSubmittingCheck ? (
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>Join Interview <Play className="w-3.5 h-3.5 fill-current" /></>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right 2 Columns: System Checks List */}
                    <div className="lg:col-span-2 bg-gray-900/60 backdrop-blur-xl border border-gray-800/80 rounded-3xl p-6 md:p-8 space-y-6 flex flex-col justify-between">
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Diagnostics Checklist</h3>
                            
                            <div className="space-y-4">
                                {/* 1. Browser compatibility check */}
                                <div className="flex items-start justify-between p-3.5 bg-gray-950/40 border border-gray-850 rounded-2xl gap-3">
                                    <div className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 shrink-0">
                                        <Laptop className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs font-bold text-white block">Browser Compatibility</span>
                                        <span className="text-[11px] text-gray-500 block mt-0.5">
                                            Requires Chrome, Firefox, Edge, or Safari with WebRTC support.
                                        </span>
                                    </div>
                                    <div className="shrink-0 pt-1">
                                        {browserCompatible === true && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                                        {browserCompatible === false && <AlertCircle className="w-5 h-5 text-red-500" />}
                                        {browserCompatible === null && <div className="w-4 h-4 rounded-full border-2 border-gray-500 border-t-transparent animate-spin" />}
                                    </div>
                                </div>

                                {/* 2. Internet check */}
                                <div className="flex items-start justify-between p-3.5 bg-gray-950/40 border border-gray-850 rounded-2xl gap-3">
                                    <div className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 shrink-0">
                                        <Wifi className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs font-bold text-white block">Internet Connectivity</span>
                                        <span className="text-[11px] text-gray-500 block mt-0.5">
                                            Requires active network connection & low latency connection.
                                        </span>
                                    </div>
                                    <div className="shrink-0 pt-1">
                                        {internetConnected === true && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                                        {internetConnected === false && <AlertCircle className="w-5 h-5 text-red-500" />}
                                        {internetConnected === null && <div className="w-4 h-4 rounded-full border-2 border-gray-500 border-t-transparent animate-spin" />}
                                    </div>
                                </div>

                                {/* 3. Camera check */}
                                <div className="flex items-start justify-between p-3.5 bg-gray-950/40 border border-gray-850 rounded-2xl gap-3">
                                    <div className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 shrink-0">
                                        <Camera className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs font-bold text-white block">Camera Access</span>
                                        <span className="text-[11px] text-gray-500 block mt-0.5">
                                            Prompts browser access to capture diagnostic video feed.
                                        </span>
                                    </div>
                                    <div className="shrink-0 pt-1">
                                        {cameraPassed === true && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                                        {cameraPassed === false && (
                                            <button 
                                                onClick={requestCamera}
                                                className="text-[10px] text-blue-400 hover:text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-md hover:bg-blue-500/5 font-bold"
                                            >
                                                Retry
                                            </button>
                                        )}
                                        {cameraPassed === null && <div className="w-4 h-4 rounded-full border-2 border-gray-500 border-t-transparent animate-spin" />}
                                    </div>
                                </div>

                                {/* 4. Microphone check */}
                                <div className="flex items-start justify-between p-3.5 bg-gray-950/40 border border-gray-850 rounded-2xl gap-3">
                                    <div className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 shrink-0">
                                        <Mic className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs font-bold text-white block">Microphone Access</span>
                                        <span className="text-[11px] text-gray-500 block mt-0.5">
                                            Prompts browser access to capture diagnostic audio level.
                                        </span>
                                    </div>
                                    <div className="shrink-0 pt-1">
                                        {microphonePassed === true && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                                        {microphonePassed === false && (
                                            <button 
                                                onClick={requestMicrophone}
                                                className="text-[10px] text-blue-400 hover:text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-md hover:bg-blue-500/5 font-bold"
                                            >
                                                Retry
                                            </button>
                                        )}
                                        {microphonePassed === null && <div className="w-4 h-4 rounded-full border-2 border-gray-500 border-t-transparent animate-spin" />}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Troubleshooting details */}
                        <div className="bg-gray-950/60 border border-gray-850 rounded-2xl p-4 text-xs text-gray-400 leading-relaxed space-y-1">
                            <span className="font-bold text-white block">Need Help?</span>
                            <p>
                                If any tests fail, click "Retry" or verify your browser settings. You can click the lock icon in your browser address bar to reset permissions.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {step === "completed" && (
                <div className="max-w-md w-full bg-gray-900/60 backdrop-blur-xl border border-gray-800/80 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                    {/* Visual backdrop highlight */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
                    
                    <div className="relative">
                        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                    </div>

                    <div className="space-y-2 relative">
                        <h2 className="text-xl font-bold tracking-tight text-white">Diagnostics Verified</h2>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Your device compatibility has been successfully validated and recorded. You can now join the live meeting room.
                        </p>
                    </div>

                    <div className="pt-2">
                        <a
                            href={meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.99]"
                        >
                            Enter Live Meeting Room <Play className="w-4 h-4 fill-current" />
                        </a>
                    </div>

                    <div className="text-[10px] text-gray-500 font-mono border-t border-gray-800/60 pt-4">
                        Secure Token Link: Verified
                    </div>
                </div>
            )}
        </div>
    );
}
