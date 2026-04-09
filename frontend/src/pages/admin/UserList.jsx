import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import { useToast } from '../../context/ToastContext';

function UserList() {
    const { user, isLoading } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const { success, error } = useToast();

    const [errorMsg, setErrorMsg] = useState(null);

    const fetchUsers = async () => {
        try {
            setErrorMsg(null);
            const response = await api.get('/auth/users');
            setUsers(response.data.data);
            setLoadingUsers(false);
        } catch (err) {
            console.error(err);
            setErrorMsg("Failed to load users. Please login again.");
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
            navigate('/');
            return;
        }
        fetchUsers();
    }, [user, navigate]);

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await api.put(`/auth/users/${userId}/role`, { role: newRole });
            fetchUsers();
            success('✅ Role updated successfully');
        } catch (err) {
            error(err.response?.data?.error || 'Update failed');
        }
    };

    const handleUpdateStatus = async (userId, newStatus) => {
        try {
            await api.put(`/auth/users/${userId}/status`, { status: newStatus });
            fetchUsers();
            success('✅ Status updated successfully');
        } catch (err) {
            error(err.response?.data?.error || 'Update failed');
        }
    };

    const handleUpdatePermissions = async (userId, permissions) => {
        try {
            await api.put(`/auth/users/${userId}/permissions`, { permissions });
            fetchUsers();
            success('✅ Permissions updated successfully');
        } catch (err) {
            error(err.response?.data?.error || 'Update failed');
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Are you sure you want to completely delete this user? This action is irreversible.')) {
            setDeletingId(id);
            try {
                await api.delete(`/auth/users/${id}`);
                setUsers(prev => prev.filter(u => u._id !== id));
                success('✅ User deleted successfully');
            } catch (err) {
                error(err.response?.data?.error || 'Failed to delete user');
            } finally {
                setDeletingId(null);
            }
        }
    };

    if (isLoading || loadingUsers) return <Loader />;

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-4 md:px-10 relative">
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[140px]" />
            </div>
            <div className="max-w-7xl mx-auto relative z-10">
                <Link to="/admin/dashboard" className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 hover:text-foreground mb-4 block transition-colors">← Dashboard Protocol</Link>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                    <div>
                        <h1 className="text-4xl font-display font-black text-foreground uppercase italic tracking-tighter mb-2">User <span className="text-primary">Management</span></h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Total Active Users: {users.length}</p>
                    </div>
                    {user?.role === 'super_admin' && (
                        <Link to="/admin/create-user" className="bg-foreground text-background hover:bg-primary font-black px-8 py-4 rounded-[2rem] transition-all hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-primary/20 text-[10px] uppercase tracking-[0.3em] whitespace-nowrap">
                            Initialize User Entity
                        </Link>
                    )}
                </div>

                <div className="bg-card/40 backdrop-blur-xl rounded-[2rem] border border-border p-8 overflow-hidden shadow-2xl">
                    {errorMsg && (
                        <div className="p-4 bg-red-500/10 text-red-500 mb-4 mx-4 rounded-lg border border-red-500/20 text-center">
                            {errorMsg}
                        </div>
                    )}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans text-sm">
                            <thead>
                                <tr className="bg-card border-b border-border">
                                    <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest text-foreground/60">User Entity</th>
                                    <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest text-foreground/60">Authorization</th>
                                    {user.role === 'super_admin' && <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest text-foreground/60">Auth Key</th>}
                                    <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest text-foreground/60">Node Status</th>
                                    <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest text-foreground/60">Permissions Configuration</th>
                                    <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest text-foreground/60 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {users.map((u) => (
                                    <tr key={u._id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-border group-hover:border-primary/50 transition-colors flex items-center justify-center font-black text-primary uppercase text-sm">
                                                    {u.firstName?.charAt(0) || u.username?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <div className="text-foreground font-bold group-hover:text-primary transition-colors">{u.firstName} {u.lastName}</div>
                                                    <div className="text-[10px] font-medium text-foreground/50 tracking-wide">@{u.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 font-medium">
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                                                disabled={user.role !== 'super_admin'}
                                                className="bg-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:border-primary/50 text-xs font-bold text-foreground cursor-pointer appearance-none transition-all"
                                            >
                                                <option value="user" className="bg-card">Standard Unit</option>
                                                <option value="instructor" className="bg-card">Master Mentor</option>
                                                <option value="admin" className="bg-card">System Admin</option>
                                                <option value="super_admin" className="bg-card">Super Admin</option>
                                            </select>
                                        </td>
                                        {user.role === 'super_admin' && (
                                            <td className="px-6 py-6 font-mono text-[10px] font-black tracking-widest text-destructive">
                                                {u.visiblePassword || '—'}
                                            </td>
                                        )}
                                        <td className="px-6 py-6">
                                            <select
                                                value={u.status}
                                                onChange={(e) => handleUpdateStatus(u._id, e.target.value)}
                                                disabled={user.role !== 'super_admin'}
                                                className={`bg-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:border-primary/50 text-xs font-bold cursor-pointer appearance-none transition-all ${u.status === 'active' ? 'text-emerald-500' : 'text-destructive'}`}
                                            >
                                                <option value="active" className="bg-card">Online</option>
                                                <option value="suspended" className="bg-card">Suspended</option>
                                                <option value="blocked" className="bg-card">Offline / Blocked</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-6">
                                            {u.role === 'admin' ? (
                                                <div className="text-[10px] space-y-2 font-black uppercase tracking-widest text-foreground/60">
                                                    <label className="flex items-center gap-2 cursor-pointer group/label">
                                                        <input
                                                            type="checkbox"
                                                            checked={u.permissions?.canAddCourse}
                                                            disabled={user.role !== 'super_admin'}
                                                            className="rounded bg-background border-border text-primary focus:ring-primary/20 transition-all cursor-pointer"
                                                            onChange={(e) => handleUpdatePermissions(u._id, { ...u.permissions, canAddCourse: e.target.checked })}
                                                        /> <span className="group-hover/label:text-foreground transition-colors">Permit Creation</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer group/label">
                                                        <input
                                                            type="checkbox"
                                                            checked={u.permissions?.canUpdateCourse}
                                                            disabled={user.role !== 'super_admin'}
                                                            className="rounded bg-background border-border text-primary focus:ring-primary/20 transition-all cursor-pointer"
                                                            onChange={(e) => handleUpdatePermissions(u._id, { ...u.permissions, canUpdateCourse: e.target.checked })}
                                                        /> <span className="group-hover/label:text-foreground transition-colors">Permit Mutation</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer group/label">
                                                        <input
                                                            type="checkbox"
                                                            checked={u.permissions?.canDeleteCourse}
                                                            disabled={user.role !== 'super_admin'}
                                                            className="rounded bg-background border-border text-primary focus:ring-primary/20 transition-all cursor-pointer"
                                                            onChange={(e) => handleUpdatePermissions(u._id, { ...u.permissions, canDeleteCourse: e.target.checked })}
                                                        /> <span className="group-hover/label:text-foreground transition-colors">Permit Delete</span>
                                                    </label>
                                                </div>
                                            ) : (
                                                <span className="text-foreground/20 italic font-medium">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-6 text-right space-x-2">
                                            <Link
                                                to={`/admin/users/${u._id}`}
                                                className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-background font-black text-[10px] uppercase tracking-widest transition-all inline-block"
                                            >
                                                Inspect
                                            </Link>
                                            {user.role === 'super_admin' && (
                                                <button
                                                    onClick={() => handleDeleteUser(u._id)}
                                                    disabled={deletingId === u._id}
                                                    className="px-4 py-2 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive hover:text-white font-black text-[10px] uppercase tracking-widest transition-all inline-block disabled:opacity-50"
                                                >
                                                    {deletingId === u._id ? 'Deleting...' : 'Delete'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserList;
