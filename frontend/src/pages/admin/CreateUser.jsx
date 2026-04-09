import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/Loader';

function CreateUser() {
    const { user, isLoading } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const { success, error } = useToast();

    // Check super admin 
    if (!isLoading && user?.role !== 'super_admin') {
        navigate('/admin/dashboard');
        return null;
    }

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        mobileNumber: '',
        password: '',
        role: 'user'
    });
    const [submitting, setSubmitting] = useState(false);

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/auth/users', formData);
            success('🎉 User Entity Initialized Successfully!');
            navigate('/admin/users');
        } catch (err) {
            error(err.response?.data?.error || 'Failed to initialize user');
        }
        setSubmitting(false);
    };

    if (isLoading) return <Loader />;

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-4 relative">
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[140px]" />
            </div>
            <div className="container mx-auto max-w-3xl relative z-10">
                <Link to="/admin/users" className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 hover:text-foreground mb-8 block transition-colors">← Cancel Operation</Link>

                <div className="bg-card/40 backdrop-blur-xl p-12 rounded-[3rem] border border-border shadow-2xl">
                    <h1 className="text-4xl font-display font-black text-foreground mb-10 italic uppercase tracking-tighter">Initialize <span className="text-primary">User Entity</span></h1>

                    <form onSubmit={onSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-3">First Name Segment</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={onChange}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-4 text-foreground focus:outline-none focus:border-primary/50 transition-all font-bold placeholder:text-foreground/20"
                                    placeholder="Enter first name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-3">Last Name Segment</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={onChange}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-4 text-foreground focus:outline-none focus:border-primary/50 transition-all font-bold placeholder:text-foreground/20"
                                    placeholder="Enter last name"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-3">Unique Identifier (Username)</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={onChange}
                                className="w-full bg-background border border-border rounded-xl px-4 py-4 text-foreground focus:outline-none focus:border-primary/50 transition-all font-bold placeholder:text-foreground/20"
                                placeholder="e.g. jdoe99"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-3">Email Transmission Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={onChange}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-4 text-foreground focus:outline-none focus:border-primary/50 transition-all font-bold placeholder:text-foreground/20"
                                    placeholder="name@domain.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-3">Mobile Frequency</label>
                                <input
                                    type="text"
                                    name="mobileNumber"
                                    value={formData.mobileNumber}
                                    onChange={onChange}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-4 text-foreground focus:outline-none focus:border-primary/50 transition-all font-bold placeholder:text-foreground/20"
                                    placeholder="+91..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-3">Authorization Key (Password)</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={onChange}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-4 text-foreground focus:outline-none focus:border-primary/50 transition-all font-bold placeholder:text-foreground/20"
                                    placeholder="Minimum 6 characters"
                                    required
                                    minLength="6"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-3">Node Authority Level (Role)</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={onChange}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-4 text-foreground focus:outline-none focus:border-primary/50 transition-all font-bold cursor-pointer appearance-none"
                                >
                                    <option value="user" className="bg-card">Standard Unit</option>
                                    <option value="instructor" className="bg-card">Master Mentor</option>
                                    <option value="admin" className="bg-card">System Admin</option>
                                    <option value="super_admin" className="bg-card">Super Admin</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-5 bg-foreground text-background hover:bg-primary rounded-xl font-black transition-all hover:scale-[1.02] shadow-xl hover:shadow-primary/20 mt-8 disabled:opacity-50 text-[10px] uppercase tracking-[0.3em]"
                        >
                            {submitting ? 'Executing...' : 'Deploy User Entity'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateUser;
