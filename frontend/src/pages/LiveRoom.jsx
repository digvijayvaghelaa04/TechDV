import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { io } from 'socket.io-client';
import api from '../utils/api';
import { 
    Video, Mic, MicOff, VideoOff, MessageSquare, 
    XCircle, Users, Send, AlertCircle 
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { PageTransition } from '../components/PageTransition';

export default function LiveRoom() {
    const { channelName } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);
    const { error, success } = useToast();

    // WebRTC State
    const [client, setClient] = useState(null);
    const [localTracks, setLocalTracks] = useState([]);
    const [isJoined, setIsJoined] = useState(false);
    const [remoteUsers, setRemoteUsers] = useState([]);
    
    // Media States
    const [audioMuted, setAudioMuted] = useState(false);
    const [videoMuted, setVideoMuted] = useState(false);

    // Chat State
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    
    const isInstructor = user?.role === 'instructor' || user?.role === 'super_admin';

    // Socket.io initialization
    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_API_URL.replace('/api/v1', ''), {
            transports: ['websocket']
        });
        
        newSocket.on('connect', () => {
            newSocket.emit('join_live', channelName);
        });

        newSocket.on('live_chat_message', (data) => {
            setMessages(prev => [...prev, data]);
        });

        setSocket(newSocket);

        return () => {
            newSocket.emit('leave_live', channelName);
            newSocket.disconnect();
        };
    }, [channelName]);

    // Agora Initialization
    const initAgora = async () => {
        const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        setClient(agoraClient);

        // Fetch Token from Backend
        try {
            const { data } = await api.get(`/live/token/${channelName}`);
            const { token, appId, uid } = data.data;

            agoraClient.on("user-published", async (user, mediaType) => {
                await agoraClient.subscribe(user, mediaType);
                if (mediaType === "video") {
                    setRemoteUsers(prev => [...prev, user]);
                }
                if (mediaType === "audio") {
                    user.audioTrack.play();
                }
            });

            agoraClient.on("user-unpublished", (user, mediaType) => {
                if (mediaType === "video") {
                    setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
                }
            });

            agoraClient.on("user-left", (user) => {
                setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
            });

            await agoraClient.join(appId, channelName, token, user._id || uid);
            setIsJoined(true);

            // Only Instructors publish media immediately in this setup
            if (isInstructor) {
                const tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
                setLocalTracks(tracks);
                await agoraClient.publish(tracks);
            }
            
            success("Joined Live Room successfully!");
        } catch (err) {
            console.error("Agora Init Error:", err);
            error("Failed to connect to the stream.");
        }
    };

    useEffect(() => {
        initAgora();

        return () => {
            localTracks.forEach(track => {
                track.stop();
                track.close();
            });
            if (client) {
                client.leave();
            }
        };
    }, []);

    const toggleAudio = async () => {
        if (localTracks[0]) {
            await localTracks[0].setMuted(!audioMuted);
            setAudioMuted(!audioMuted);
        }
    };

    const toggleVideo = async () => {
        if (localTracks[1]) {
            await localTracks[1].setMuted(!videoMuted);
            setVideoMuted(!videoMuted);
        }
    };

    const handleLeave = async () => {
        if (isInstructor) {
            // Optional: Call API to mark broadcast as ended
            await api.put(`/live/${channelName}`, { status: 'ended' }).catch(()=>null);
        }
        navigate('/live');
    };

    const sendChatMessage = (e) => {
        e.preventDefault();
        if (!chatInput.trim() || !socket) return;
        
        socket.emit('live_chat_message', {
            channel: channelName,
            user: { name: user?.name || 'Anonymous', role: user?.role },
            message: chatInput
        });
        setChatInput('');
    };

    return (
        <PageTransition>
            <div className="h-screen pt-20 bg-[#050505] flex flex-col md:flex-row overflow-hidden">
                {/* Main Video Area */}
                <div className="flex-1 relative flex flex-col border-r border-border/20">
                    <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
                        <div className="px-3 py-1 bg-rose-500/20 border border-rose-500/50 rounded-full flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase text-rose-500 tracking-widest leading-none">LIVE</span>
                        </div>
                        <span className="text-foreground/50 text-[10px] uppercase font-bold tracking-widest px-3 py-1 bg-black/40 rounded-full backdrop-blur-md">
                            Channel: {channelName}
                        </span>
                    </div>

                    <div className="flex-1 relative bg-black flex items-center justify-center p-4">
                        {!isJoined ? (
                            <div className="text-center animate-pulse">
                                <AlertCircle className="h-10 w-10 text-primary mx-auto mb-4" />
                                <p className="text-foreground/50 font-black uppercase tracking-widest text-xs">Connecting to Secure Signal...</p>
                            </div>
                        ) : (
                            <div className="w-full h-full relative grid gap-4 grid-cols-1">
                                {isInstructor && localTracks[1] && !videoMuted && (
                                    <div className="w-full h-full rounded-2xl overflow-hidden border border-border/20 relative shadow-[0_0_50px_rgba(var(--primary),0.1)]">
                                        <div className="absolute top-4 right-4 z-10 px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[10px] text-white uppercase font-black">You (Instructor)</div>
                                        <div id="local-player" className="w-full h-full" ref={(node) => {
                                            if (node && localTracks[1]) {
                                                localTracks[1].play(node);
                                            }
                                        }} />
                                    </div>
                                )}
                                
                                {remoteUsers.map(user => (
                                    <div key={user.uid} className="w-full h-full rounded-2xl overflow-hidden border border-border/20 relative">
                                        <div className="absolute top-4 right-4 z-10 px-2 py-1 bg-primary/80 backdrop-blur-md rounded text-[10px] text-white uppercase font-black">Stream</div>
                                        <div className="w-full h-full" id={`remote-player-${user.uid}`} ref={(node) => {
                                            if (node && user.videoTrack) {
                                                user.videoTrack.play(node);
                                            }
                                        }} />
                                    </div>
                                ))}

                                {(!isInstructor && remoteUsers.length === 0) && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                        <div className="h-20 w-20 rounded-full bg-muted/20 flex items-center justify-center mb-6">
                                            <VideoOff className="h-8 w-8 text-foreground/30" />
                                        </div>
                                        <p className="text-foreground/50 font-bold tracking-widest uppercase text-sm">Instructor hasn't started the broadcast</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Toolbar */}
                    <div className="p-6 bg-background/80 backdrop-blur-xl border-t border-border flex items-center justify-center gap-4">
                        {isInstructor && (
                            <>
                                <button onClick={toggleAudio} className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all ${audioMuted ? 'bg-rose-500/20 text-rose-500 border border-rose-500/50' : 'bg-muted hover:bg-muted/80 text-foreground'}`}>
                                    {audioMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                                </button>
                                <button onClick={toggleVideo} className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all ${videoMuted ? 'bg-rose-500/20 text-rose-500 border border-rose-500/50' : 'bg-muted hover:bg-muted/80 text-foreground'}`}>
                                    {videoMuted ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                                </button>
                            </>
                        )}
                        <button onClick={handleLeave} className="px-8 h-14 bg-rose-500 hover:bg-rose-600 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all">
                            <XCircle className="h-5 w-5" /> Leave Room
                        </button>
                    </div>
                </div>

                {/* Chat Sidebar */}
                <div className="w-full md:w-96 bg-card/50 backdrop-blur-2xl flex flex-col h-[50dvh] md:h-full">
                    <div className="p-6 border-b border-border/50 flex items-center justify-between">
                        <h3 className="font-display font-black text-xl italic drop-shadow-md flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /> Live Chat</h3>
                        <div className="flex items-center gap-2 text-foreground/50">
                            <Users className="h-4 w-4" /> <span className="text-xs font-bold">{remoteUsers.length + 1}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                        {messages.length === 0 ? (
                            <p className="text-center text-foreground/30 text-[10px] font-black uppercase tracking-widest mt-10">Start the conversation</p>
                        ) : (
                            messages.map((msg, idx) => (
                                <div key={idx} className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${msg.user.role === 'instructor' ? 'text-primary' : 'text-foreground/50'}`}>{msg.user.name}</span>
                                        {msg.user.role === 'instructor' && <span className="px-1.5 py-0.5 bg-primary/10 border border-primary/30 rounded text-[8px] text-primary">HOST</span>}
                                    </div>
                                    <div className="px-4 py-3 bg-muted/30 rounded-2xl rounded-tl-sm text-sm border border-border/30">
                                        {msg.message}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <form onSubmit={sendChatMessage} className="p-4 border-t border-border/50 bg-background/50">
                        <div className="relative">
                            <input 
                                type="text" 
                                value={chatInput}
                                onChange={(e)=>setChatInput(e.target.value)}
                                placeholder="Transmit message..."
                                className="w-full bg-muted border border-border rounded-xl pl-4 pr-12 py-4 text-sm font-medium focus:outline-none focus:border-primary transition-colors"
                            />
                            <button type="submit" disabled={!chatInput.trim()} className="absolute right-2 top-2 h-10 w-10 bg-primary disabled:opacity-50 text-foreground rounded-lg flex items-center justify-center hover:scale-105 transition-all">
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </PageTransition>
    );
}
