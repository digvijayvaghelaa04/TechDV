import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import screenfull from 'screenfull';
import api from '../../utils/api';
import { FaLock, FaPlay, FaExclamationTriangle } from 'react-icons/fa';

const SecureVideoPlayer = ({ lessonId, onComplete }) => {
    const [videoData, setVideoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const playerRef = useRef(null);
    const playerContainerRef = useRef(null);
    const progressInterval = useRef(null);

    // Fetch secure access URL
    useEffect(() => {
        const fetchVideoAccess = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await api.get(`/video/${lessonId}/access`);
                setVideoData(data.data);
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.error || 'Failed to load video');
            } finally {
                setLoading(false);
            }
        };

        if (lessonId) {
            fetchVideoAccess();
        }

        return () => {
            // Cleanup interval on unmount
            if (progressInterval.current) clearInterval(progressInterval.current);
        };
    }, [lessonId]);

    // Handle Progress Storage
    const handleProgress = (state) => {
        // We can either update on every progress tick (can be frequent) 
        // OR set an interval to send updates every 10-15 seconds
        // ReactPlayer's onProgress fires roughly every second.

        // Let's implement a 'heartbeat' approach by only saving to ref, 
        // and having an interval send it to network.
        if (playerRef.current) {
            playerRef.current.lastProgressState = state;
        }
    };

    // Setup Heartbeat
    useEffect(() => {
        if (!videoData) return;

        progressInterval.current = setInterval(async () => {
            if (playerRef.current && playerRef.current.lastProgressState) {
                const { playedSeconds, loadedSeconds } = playerRef.current.lastProgressState;
                const duration = playerRef.current.getDuration();

                // Only send if playing
                if (playedSeconds > 0) {
                    try {
                        await api.post(`/video/${lessonId}/progress`, {
                            position: playedSeconds,
                            duration
                        });
                    } catch (err) {
                        console.error("Failed to save progress", err);
                    }
                }
            }
        }, 10000); // Every 10 seconds

        return () => clearInterval(progressInterval.current);
    }, [videoData, lessonId]);


    const handleDuration = (duration) => {
        // Seek to last position if exists
        if (videoData?.startAt > 0 && playerRef.current) {
            playerRef.current.seekTo(videoData.startAt, 'seconds');
        }
    };

    const handleEnded = async () => {
        try {
            const duration = playerRef.current.getDuration();
            await api.post(`/video/${lessonId}/progress`, {
                position: duration,
                duration
            });
            if (onComplete) onComplete();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="w-full aspect-video bg-background flex items-center justify-center text-foreground">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
                <span className="ml-3">Verifying Access...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full aspect-video bg-gray-900 flex flex-col items-center justify-center text-foreground p-6 text-center">
                <div className="bg-red-500/10 p-4 rounded-full mb-4">
                    <FaLock className="text-4xl text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-red-400 mb-2">Access Denied</h3>
                <p className="text-muted-foreground max-w-md">{error}</p>
                {/* Optional: Add 'Buy Course' button if error is permission related */}
            </div>
        );
    }

    return (
        <div className="relative w-full aspect-video bg-background rounded-xl overflow-hidden shadow-2xl group" ref={playerContainerRef}>
            <ReactPlayer
                ref={playerRef}
                url={videoData?.url}
                width="100%"
                height="100%"
                controls={true}
                playing={true} // Auto-play if ready
                onProgress={handleProgress}
                onDuration={handleDuration}
                onEnded={handleEnded}
                config={{
                    youtube: {
                        playerVars: { showinfo: 0, modestbranding: 1, rel: 0 }
                    }
                }}
            />
            {/* Watermark overlay example */}
            <div className="absolute top-4 right-4 opacity-30 pointer-events-none text-xs text-foreground hidden group-hover:block">
                Protected Content via TechDV
            </div>
        </div>
    );
};

export default SecureVideoPlayer;
