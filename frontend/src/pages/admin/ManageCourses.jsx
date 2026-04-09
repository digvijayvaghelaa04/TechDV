import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { getCourses, reset } from '../../store/courseSlice';
import Loader from '../../components/Loader';
import { useToast } from '../../context/ToastContext';
import { getImgUrl } from '../../utils/utils';

function ManageCourses() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { courses, isLoading, isError, message } = useSelector((state) => state.courses);
    const { user } = useSelector((state) => state.auth);
    const { success, error } = useToast();
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {

        if (!user || user.role === 'user') {
            navigate('/');
            return;
        }
        dispatch(getCourses());
        return () => { dispatch(reset()); };
    }, [dispatch, navigate, user]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            setDeletingId(id);
            try {
                await api.delete(`/courses/${id}`);
                dispatch(getCourses()); // Refresh list
                success('✅ Course deleted successfully');
            } catch (err) {
                console.error('Delete error:', err);
                const msg = err.response?.data?.error || err.message || 'Delete failed';
                error(`Error: ${msg}`);
            } finally {
                setDeletingId(null);
            }
        }
    };

    if (isLoading) return <Loader />;

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-4 relative">
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[140px]" />
            </div>
            <div className="container mx-auto max-w-7xl relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                    <div>
                        <Link to="/admin/dashboard" className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 hover:text-foreground mb-4 block transition-colors">← Dashboard Protocol</Link>
                        <h1 className="text-4xl font-display font-black text-foreground uppercase italic tracking-tighter">Manage Courses</h1>
                    </div>
                    {/* Check permission logic on frontend purely for UI hiding - backend protects actual action */}
                    {(user.role === 'super_admin' || user.permissions?.canAddCourse) && (
                        <Link to="/admin/create-course" className="bg-foreground text-background hover:bg-primary font-black px-8 py-4 rounded-[2rem] transition-all hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-primary/20 text-[10px] uppercase tracking-[0.3em] whitespace-nowrap">
                            Initialize Course Unit
                        </Link>
                    )}
                </div>

                <div className="bg-card/40 backdrop-blur-xl rounded-[2rem] border border-border p-8 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-card">
                                    <th className="p-6 text-sm font-black text-muted-foreground uppercase tracking-widest">Course</th>
                                    <th className="p-6 text-sm font-black text-muted-foreground uppercase tracking-widest">Instructor</th>
                                    <th className="p-6 text-sm font-black text-muted-foreground uppercase tracking-widest">Category</th>
                                    <th className="p-6 text-sm font-black text-muted-foreground uppercase tracking-widest">Price</th>
                                    <th className="p-6 text-sm font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {courses.map((course) => (
                                    <tr key={course._id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-primary/10 border border-border group-hover:border-primary/50 transition-colors">
                                                    <img src={getImgUrl(course.thumbnail)} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <span className="font-bold text-foreground line-clamp-2 md:line-clamp-1">{course.title}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-foreground/70 font-medium">{course.instructor?.firstName || 'System'}</td>
                                        <td className="p-6">
                                            <span className="px-4 py-2 rounded-xl bg-card border border-border text-[10px] font-black uppercase tracking-widest text-foreground/60">
                                                {course.category}
                                            </span>
                                        </td>
                                        <td className="p-6 font-display font-black text-foreground italic text-lg">₹{course.price}</td>
                                        <td className="p-6 text-right space-x-3">
                                            {(user.role === 'super_admin' || user.permissions?.canUpdateCourse) && (
                                                <button
                                                    onClick={() => navigate(`/admin/edit-course/${course._id}`)}
                                                    className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                                                >
                                                    Modify
                                                </button>
                                            )}
                                            {(user.role === 'super_admin' || user.permissions?.canDeleteCourse) && (
                                                <button
                                                    onClick={() => handleDelete(course._id)}
                                                    disabled={deletingId === course._id}
                                                    className="px-4 py-2 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive hover:text-white font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                                                >
                                                    {deletingId === course._id ? 'Deleting...' : 'Delete'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {courses.length === 0 && (
                        <div className="p-16 text-center text-foreground/40 font-medium italic border border-dashed border-border rounded-2xl m-4">No course units detected.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ManageCourses;
