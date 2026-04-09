import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import { useToast } from '../../context/ToastContext';
import { getImgUrl, DEFAULT_AVATAR } from '../../utils/utils';
import { FaChalkboardTeacher, FaEnvelope, FaStar, FaTrash, FaBan, FaCheckCircle } from 'react-icons/fa';

function ManageInstructors() {
    const { user, isLoading } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [instructors, setInstructors] = useState([]);
    const [loadingInstructors, setLoadingInstructors] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const { success, error } = useToast();

    const fetchInstructors = async () => {
        try {
            const response = await api.get('/instructors');
            setInstructors(response.data.data);
            setLoadingInstructors(false);
        } catch (err) {
            console.error(err);
            error("Failed to load instructors.");
            setLoadingInstructors(false);
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'super_admin') {
            navigate('/');
            return;
        }
        fetchInstructors();
    }, [user, navigate]);

    const handleUpdateStatus = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this instructor?`)) return;
        try {
            await api.put(`/instructors/${id}/status`, { status });
            fetchInstructors();
            success(`Instructor ${status} successfully`);
        } catch (err) {
            error(err.response?.data?.error || 'Update failed');
        }
    };

    const handleDeleteInstructor = async (id) => {
        if (!window.confirm("Are you sure you want to delete this instructor? This action cannot be undone.")) return;
        setDeletingId(id);
        try {
            await api.delete(`/auth/users/${id}`); 
            setInstructors(prev => prev.filter(i => i.user._id !== id));
            success('Instructor deleted successfully');
        } catch (err) {
            error(err.response?.data?.error || 'Delete failed');
        } finally {
            setDeletingId(null);
        }
    };

    if (isLoading || loadingInstructors) return <Loader />;

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-4 md:px-10 relative">
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[140px]" />
            </div>
            <div className="max-w-7xl mx-auto relative z-10">
                <Link to="/admin/dashboard" className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 hover:text-foreground mb-4 block transition-colors">← Dashboard Protocol</Link>

                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-display font-black text-foreground uppercase italic tracking-tighter mb-2">Mentor <span className="text-primary">Management</span></h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Total Active Mentors: {instructors.length}</p>
                    </div>
                </div>

                <div className="bg-card/40 backdrop-blur-xl rounded-[2rem] border border-border p-8 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans text-sm">
                            <thead>
                                <tr className="bg-card border-b border-border">
                                    <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest text-foreground/60">Mentor Identity</th>
                                    <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest text-foreground/60 text-center">Sequences</th>
                                    <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest text-foreground/60 text-center">Units Trained</th>
                                    <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest text-foreground/60 text-center">Yield</th>
                                    <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest text-foreground/60 text-center">Evaluation</th>
                                    <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest text-foreground/60">Authorization</th>
                                    <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest text-foreground/60 text-right">Terminal Commands</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {instructors.map((inst) => (
                                    <tr key={inst._id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-6 border-transparent">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-border group-hover:border-primary/50 transition-colors flex items-center justify-center font-black text-primary uppercase text-sm object-cover overflow-hidden">
                                                    <img
                                                        src={getImgUrl(inst.user.avatar, true)}
                                                        className="w-full h-full object-cover"
                                                        alt=""
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = DEFAULT_AVATAR;
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="text-foreground font-bold group-hover:text-primary transition-colors">{inst.user.firstName} {inst.user.lastName}</div>
                                                    <div className="text-[10px] font-medium text-foreground/50 tracking-wide flex items-center gap-1 mt-1">
                                                        <FaEnvelope className="text-[8px] text-foreground/40" /> {inst.user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center border-transparent">
                                            <div className="flex flex-col items-center">
                                                <span className="text-foreground font-black text-lg">{inst.metrics?.totalCourses || 0}</span>
                                                <span className="text-[8px] font-black text-foreground/40 uppercase tracking-widest">Sequences</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center border-transparent">
                                            <div className="flex flex-col items-center">
                                                <span className="text-foreground font-black text-lg">{inst.metrics?.totalStudents || 0}</span>
                                                <span className="text-[8px] font-black text-foreground/40 uppercase tracking-widest">Units</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center border-transparent">
                                            <div className="flex flex-col items-center">
                                                <span className="text-emerald-500 font-black text-lg group-hover:text-emerald-400 transition-colors">₹{(inst.lifetimeEarnings || 0).toLocaleString()}</span>
                                                <span className="text-[8px] font-black text-foreground/40 uppercase tracking-widest">Lifetime Yield</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center border-transparent">
                                            <div className="flex items-center justify-center gap-2 bg-card border border-border px-3 py-1.5 rounded-xl w-fit mx-auto">
                                                <span className="text-amber-500 font-black">{inst.metrics?.averageRating || 0}</span>
                                                <FaStar className="text-amber-500 text-[10px]" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 border-transparent">
                                            <span className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] border ${inst.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' :
                                                inst.status === 'suspended' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]' :
                                                    'bg-destructive/10 text-destructive border-destructive/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                                                }`}>
                                                {inst.status === 'approved' ? 'Active' : inst.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-right border-transparent">
                                            <div className="flex justify-end gap-2">
                                                {inst.status === 'approved' ? (
                                                    <button
                                                        onClick={() => handleUpdateStatus(inst._id, 'suspended')}
                                                        className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                                                        title="Suspend Mentor Authorization"
                                                    >
                                                        <FaBan className="inline mr-1" /> Suspend
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleUpdateStatus(inst._id, 'approved')}
                                                        className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                                                        title="Enable Mentor Authorization"
                                                    >
                                                        <FaCheckCircle className="inline mr-1" /> Authorize
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteInstructor(inst.user._id)}
                                                    disabled={deletingId === inst.user._id}
                                                    className="px-4 py-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                                                    title="Delete Account Data"
                                                >
                                                    <FaTrash className="inline mr-1" /> {deletingId === inst.user._id ? 'Deleting...' : 'Delete'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {instructors.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-20 text-center text-foreground/40 font-medium italic border border-dashed border-border rounded-xl mt-4 mb-4">
                                            <FaChalkboardTeacher className="mx-auto text-4xl mb-4 opacity-20" />
                                            <p>No mentor nodes established in the system.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ManageInstructors;
