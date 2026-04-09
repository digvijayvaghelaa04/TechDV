import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { FaPlus, FaTrash, FaChevronUp, FaChevronDown, FaVideo, FaFileAlt, FaFilePdf, FaQuestionCircle } from 'react-icons/fa';
import Loader from '../../components/Loader';

function CourseBuilder() {
    const { id } = useParams(); // If present, implies Edit mode
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const { success, error } = useToast();

    const [isFetching, setIsFetching] = useState(!!id);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingThumb, setIsUploadingThumb] = useState(false);
    const [uploadingLessons, setUploadingLessons] = useState({}); // Tracking loading state for individual lessons: { "mIdx-lIdx": true }
    const [expandedModules, setExpandedModules] = useState({});

    // Unified State Tree
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        level: 'All Levels',
        category: 'Development',
        thumbnail: 'https://placehold.co/600x400/purple/white?text=New+Course',
        promoVideo: '',
        modules: []
    });

    useEffect(() => {
        if (id) {
            fetchCourse();
        }
    }, [id]);

    const fetchCourse = async () => {
        try {
            const res = await api.get(`/courses/${id}`);
            const course = res.data.data;
            setFormData({
                title: course.title || '',
                description: course.description || '',
                price: course.price || '',
                level: course.level || 'All Levels',
                category: course.category || 'Development',
                thumbnail: course.thumbnail || '',
                promoVideo: course.promoVideo || '',
                modules: course.modules || []
            });
            
            // Expand all modules by default on edit
            const exp = {};
            (course.modules || []).forEach((_, idx) => exp[idx] = true);
            setExpandedModules(exp);
        } catch (err) {
            error('Failed to load course details');
        } finally {
            setIsFetching(false);
        }
    };

    // --- Media Handlers ---
    const handleThumbnailUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploadingThumb(true);
        const data = new FormData();
        data.append('image', file);
        try {
            const res = await api.post('/upload/image', data, { headers: { 'Content-Type': 'multipart/form-data' }});
            setFormData(prev => ({ ...prev, thumbnail: res.data.data.url }));
            success('Thumbnail uploaded');
        } catch (err) {
            error('Upload failed');
        } finally {
            setIsUploadingThumb(false);
        }
    };

    const handleLessonVideoUpload = async (e, mIndex, lIndex) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const trackKey = `${mIndex}-${lIndex}`;
        setUploadingLessons(prev => ({ ...prev, [trackKey]: true }));
        
        const data = new FormData();
        data.append('video', file);
        
        try {
            const res = await api.post('/upload/video', data, { headers: { 'Content-Type': 'multipart/form-data' }});
            updateLesson(mIndex, lIndex, 'videoUrl', res.data.data.url);
            success('Lesson video uploaded successfully!');
        } catch (err) {
            error(err.response?.data?.error || 'Failed to upload video');
        } finally {
            setUploadingLessons(prev => ({ ...prev, [trackKey]: false }));
        }
    };

    const handleLessonDocumentUpload = async (e, mIndex, lIndex) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const trackKey = `doc-${mIndex}-${lIndex}`;
        setUploadingLessons(prev => ({ ...prev, [trackKey]: true }));
        
        const data = new FormData();
        data.append('document', file);
        
        try {
            const res = await api.post('/upload/document', data, { headers: { 'Content-Type': 'multipart/form-data' }});
            updateLesson(mIndex, lIndex, 'videoUrl', res.data.data.url);
            success('Lesson document uploaded successfully!');
        } catch (err) {
            error(err.response?.data?.error || 'Failed to upload document');
        } finally {
            setUploadingLessons(prev => ({ ...prev, [trackKey]: false }));
        }
    };

    // --- Curriculum Builders ---
    const addModule = () => {
        const newModules = [...formData.modules, { title: 'New Module', lessons: [] }];
        setFormData(prev => ({ ...prev, modules: newModules }));
        setExpandedModules(prev => ({ ...prev, [newModules.length - 1]: true }));
    };

    const updateModuleTitle = (mIndex, val) => {
        const updated = [...formData.modules];
        updated[mIndex].title = val;
        setFormData(prev => ({ ...prev, modules: updated }));
    };

    const deleteModule = (mIndex) => {
        if (!window.confirm("Remove this module and all enclosed lessons?")) return;
        const updated = formData.modules.filter((_, idx) => idx !== mIndex);
        setFormData(prev => ({ ...prev, modules: updated }));
    };

    const moveModule = (mIndex, direction) => {
        if ((mIndex === 0 && direction === -1) || (mIndex === formData.modules.length - 1 && direction === 1)) return;
        const updated = [...formData.modules];
        const swapIndex = mIndex + direction;
        const temp = updated[mIndex];
        updated[mIndex] = updated[swapIndex];
        updated[swapIndex] = temp;
        setFormData(prev => ({ ...prev, modules: updated }));
    };

    const addLesson = (mIndex, type = 'video') => {
        const updated = [...formData.modules];
        updated[mIndex].lessons.push({
            title: 'New Lesson',
            type,
            videoUrl: '',
            videoDuration: 0,
            content: '',
            isFreePreview: false
        });
        setFormData(prev => ({ ...prev, modules: updated }));
    };

    const updateLesson = (mIndex, lIndex, field, value) => {
        const updated = [...formData.modules];
        updated[mIndex].lessons[lIndex][field] = value;
        setFormData(prev => ({ ...prev, modules: updated }));
    };

    const deleteLesson = (mIndex, lIndex) => {
        const updated = [...formData.modules];
        updated[mIndex].lessons = updated[mIndex].lessons.filter((_, idx) => idx !== lIndex);
        setFormData(prev => ({ ...prev, modules: updated }));
    };

    const moveLesson = (mIndex, lIndex, direction) => {
        const updated = [...formData.modules];
        const lessons = updated[mIndex].lessons;
        if ((lIndex === 0 && direction === -1) || (lIndex === lessons.length - 1 && direction === 1)) return;
        const swapIndex = lIndex + direction;
        const temp = lessons[lIndex];
        lessons[lIndex] = lessons[swapIndex];
        lessons[swapIndex] = temp;
        setFormData(prev => ({ ...prev, modules: updated }));
    };

    const toggleModule = (mIndex) => {
        setExpandedModules(prev => ({ ...prev, [mIndex]: !prev[mIndex] }));
    };

    // --- Save Payload ---
    const onSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (id) {
                await api.put(`/courses/${id}`, formData);
                success('🎉 Course Updated Successfully!');
            } else {
                await api.post('/courses', formData);
                success('🎉 Course Created Successfully!');
            }
            navigate('/admin/courses');
        } catch (err) {
            error(err.response?.data?.error || 'Failed to sync course');
        } finally {
            setIsSaving(false);
        }
    };

    if (isFetching) return <Loader />;

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-4 md:px-10 relative">
            <div className="max-w-[1400px] mx-auto relative z-10 flex flex-col xl:flex-row gap-8">
                
                {/* LEFT: Metadata Configurator */}
                <div className="w-full xl:w-1/3 flex flex-col gap-6">
                    <Link to="/admin/courses" className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 hover:text-foreground transition-colors inline-block w-fit">← Back to Directory</Link>
                    
                    <div className="bg-card/40 backdrop-blur-xl p-8 rounded-[3rem] border border-border bg-opacity-50">
                        <h2 className="text-2xl font-display font-black text-foreground mb-8 italic uppercase tracking-tighter">
                            {id ? 'Modify Metadata' : 'Course Metadata'}
                        </h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-2">Title</label>
                                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground font-bold" required />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-2">Description</label>
                                <textarea rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground font-medium resize-none custom-scrollbar" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-2">Price (₹)</label>
                                    <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground font-bold" required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-2">Level</label>
                                    <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground font-bold cursor-pointer">
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                        <option value="All Levels">All Levels</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-2">Category</label>
                                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground font-bold cursor-pointer">
                                    <option value="Development">Development</option>
                                    <option value="Design">Design</option>
                                    <option value="Business">Business</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="AI">AI</option>
                                    <option value="SaaS">SaaS</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-2">Thumbnail Link / Upload</label>
                                <div className="flex gap-2 mb-2">
                                    <input type="text" value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary/50 text-foreground font-bold" placeholder="Image URL..." />
                                </div>
                                <input type="file" onChange={handleThumbnailUpload} className="w-full text-foreground/50 text-[10px] font-black uppercase file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-primary/10 file:text-primary file:cursor-pointer" />
                                {isUploadingThumb && <div className="text-[10px] text-primary mt-1 animate-pulse font-bold">Uploading...</div>}
                                {formData.thumbnail && (
                                    <img src={formData.thumbnail} alt="Preview" className="w-full h-32 object-cover rounded-xl mt-4 border border-border" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Curriculum Builder */}
                <div className="w-full xl:w-2/3 flex flex-col gap-6">
                    <div className="flex justify-between items-end">
                        <h2 className="text-4xl font-display font-black text-foreground italic uppercase tracking-tighter">Curriculum <span className="text-primary">Builder</span></h2>
                        <button onClick={onSubmit} disabled={isSaving} className="bg-foreground text-background hover:bg-primary font-black px-8 py-4 rounded-[2rem] transition-all hover:scale-105 shadow-xl hover:-translate-y-1 text-[10px] uppercase tracking-[0.3em] disabled:opacity-50 object-right">
                            {isSaving ? 'Syncing...' : (id ? 'Update Architecture' : 'Deploy Course')}
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.modules.length === 0 && (
                            <div className="border border-dashed border-border p-12 text-center rounded-[2rem] text-foreground/40 font-bold uppercase tracking-widest text-xs">
                                No modules created yet. Start building your curriculum below.
                            </div>
                        )}

                        {formData.modules.map((module, mIdx) => (
                            <div key={mIdx} className="bg-card border border-border rounded-[2rem] overflow-hidden drop-shadow-sm transition-all">
                                {/* Module Header */}
                                <div className="bg-muted/30 p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                                        <div className="flex flex-col gap-1">
                                            <button onClick={() => moveModule(mIdx, -1)} className="text-foreground/30 hover:text-primary transition-colors"><FaChevronUp size={12} /></button>
                                            <button onClick={() => moveModule(mIdx, 1)} className="text-foreground/30 hover:text-primary transition-colors"><FaChevronDown size={12} /></button>
                                        </div>
                                        <div className="font-bold text-primary font-mono text-sm leading-none pt-1">M{mIdx+1}</div>
                                        <input 
                                            type="text" 
                                            value={module.title}
                                            onChange={(e) => updateModuleTitle(mIdx, e.target.value)}
                                            className="bg-transparent border-none text-lg font-black text-foreground focus:outline-none focus:ring-0 flex-1 min-w-0"
                                            placeholder="Module Title..."
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 justify-end">
                                        <button onClick={() => deleteModule(mIdx)} className="text-destructive/50 hover:text-destructive p-2 rounded-full hover:bg-destructive/10 transition-colors"><FaTrash size={12} /></button>
                                        <button onClick={() => toggleModule(mIdx)} className="text-foreground/50 hover:text-foreground p-2 rounded-full hover:bg-foreground/5 transition-colors">
                                            {expandedModules[mIdx] ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Lessons Body */}
                                {expandedModules[mIdx] && (
                                    <div className="p-4 bg-background/50 space-y-4">
                                        {module.lessons.map((lesson, lIdx) => (
                                            <div key={lIdx} className="bg-card border border-border p-3 sm:p-4 rounded-xl flex flex-col gap-4">
                                                <div className="flex justify-between items-start sm:items-center gap-2">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
                                                        <div className="flex flex-row sm:flex-col gap-2 sm:gap-1 mr-1">
                                                            <button onClick={() => moveLesson(mIdx, lIdx, -1)} className="text-foreground/20 hover:text-primary transition-colors"><FaChevronUp size={12} /></button>
                                                            <button onClick={() => moveLesson(mIdx, lIdx, 1)} className="text-foreground/20 hover:text-primary transition-colors"><FaChevronDown size={12} /></button>
                                                        </div>
                                                        <select value={lesson.type} onChange={(e) => updateLesson(mIdx, lIdx, 'type', e.target.value)} className="bg-muted border border-border rounded-lg px-2 py-1.5 text-xs font-bold text-foreground cursor-pointer focus:outline-none min-w-[90px]">
                                                            <option value="video">Video</option>
                                                            <option value="article">Notes</option>
                                                            <option value="pdf">PDF File</option>
                                                        </select>
                                                        <input 
                                                            type="text" 
                                                            value={lesson.title}
                                                            onChange={(e) => updateLesson(mIdx, lIdx, 'title', e.target.value)}
                                                            className="flex-1 bg-transparent border-b border-border focus:border-primary text-sm font-bold text-foreground focus:outline-none px-2 py-1 min-w-0 w-full mt-2 sm:mt-0"
                                                            placeholder="Lesson Title..."
                                                        />
                                                    </div>
                                                    <button onClick={() => deleteLesson(mIdx, lIdx)} className="text-destructive/40 hover:text-destructive sm:ml-4 mt-2 sm:mt-0 p-1"><FaTrash size={14} /></button>
                                                </div>

                                                <div className="sm:pl-10 grid grid-cols-1 gap-3">
                                                    {(lesson.type === 'video') && (
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex flex-col xl:flex-row gap-2">
                                                                <input 
                                                                    type="text" 
                                                                    value={lesson.videoUrl} 
                                                                    onChange={(e) => updateLesson(mIdx, lIdx, 'videoUrl', e.target.value)}
                                                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-medium focus:border-primary focus:outline-none"
                                                                    placeholder="Paste Video URL or upload file..."
                                                                />
                                                                <input 
                                                                    type="file" 
                                                                    accept="video/*"
                                                                    onChange={(e) => handleLessonVideoUpload(e, mIdx, lIdx)}
                                                                    className="w-full xl:w-auto text-foreground/50 text-[10px] font-black uppercase file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer file:transition-colors"
                                                                />
                                                            </div>
                                                            {uploadingLessons[`${mIdx}-${lIdx}`] && <div className="text-[10px] text-primary mt-1 animate-pulse font-bold">Uploading Video Sequence...</div>}
                                                        </div>
                                                    )}
                                                    
                                                    {(lesson.type === 'pdf') && (
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex flex-col xl:flex-row gap-2">
                                                                <input 
                                                                    type="text" 
                                                                    value={lesson.videoUrl} 
                                                                    onChange={(e) => updateLesson(mIdx, lIdx, 'videoUrl', e.target.value)}
                                                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-medium focus:border-primary focus:outline-none"
                                                                    placeholder="Paste PDF Resource URL or upload file..."
                                                                />
                                                                <input 
                                                                    type="file" 
                                                                    accept="application/pdf"
                                                                    onChange={(e) => handleLessonDocumentUpload(e, mIdx, lIdx)}
                                                                    className="w-full xl:w-auto text-foreground/50 text-[10px] font-black uppercase file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer file:transition-colors"
                                                                />
                                                            </div>
                                                            {uploadingLessons[`doc-${mIdx}-${lIdx}`] && <div className="text-[10px] text-primary mt-1 animate-pulse font-bold">Transmitting Document to Server...</div>}
                                                        </div>
                                                    )}
                                                    
                                                    {lesson.type === 'video' && (
                                                        <div className="flex flex-wrap gap-4 items-center bg-background p-2 rounded-lg border border-border">
                                                            <div className="flex items-center gap-2">
                                                                <label className="text-[9px] font-black uppercase text-foreground/50 tracking-widest">Duration (sec)</label>
                                                                <input 
                                                                    type="number" 
                                                                    value={lesson.videoDuration}
                                                                    onChange={(e) => updateLesson(mIdx, lIdx, 'videoDuration', e.target.value)}
                                                                    className="w-20 bg-card border border-border rounded-lg px-2 py-1 text-xs text-center font-bold"
                                                                />
                                                            </div>
                                                            <label className="flex items-center gap-2 cursor-pointer border-l border-border pl-4">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={lesson.isFreePreview} 
                                                                    onChange={(e) => updateLesson(mIdx, lIdx, 'isFreePreview', e.target.checked)}
                                                                    className="rounded text-primary focus:ring-primary/20 bg-background border-border w-4 h-4 cursor-pointer" 
                                                                />
                                                                <span className="text-[9px] font-black uppercase text-foreground/50 tracking-widest mt-0.5">Preview Mode</span>
                                                            </label>
                                                        </div>
                                                    )}

                                                    {lesson.type === 'article' && (
                                                        <textarea 
                                                            value={lesson.content}
                                                            onChange={(e) => updateLesson(mIdx, lIdx, 'content', e.target.value)}
                                                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono resize-y min-h-[80px]"
                                                            placeholder="Markdown instruction set..."
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        <div className="pt-2 flex gap-2 pl-2">
                                            <button onClick={() => addLesson(mIdx, 'video')} className="text-[9px] px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white font-black uppercase tracking-widest transition-colors flex items-center gap-1"><FaVideo size={10} /> Video</button>
                                            <button onClick={() => addLesson(mIdx, 'article')} className="text-[9px] px-3 py-1.5 rounded-lg bg-foreground/5 text-foreground/60 hover:bg-foreground hover:text-background font-black uppercase tracking-widest transition-colors flex items-center gap-1"><FaFileAlt size={10} /> Notes</button>
                                            <button onClick={() => addLesson(mIdx, 'pdf')} className="text-[9px] px-3 py-1.5 rounded-lg bg-foreground/5 text-foreground/60 hover:bg-foreground hover:text-background font-black uppercase tracking-widest transition-colors flex items-center gap-1"><FaFilePdf size={10} /> PDF</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        <button 
                            onClick={addModule}
                            className="w-full py-4 border-2 border-dashed border-primary/30 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white hover:border-transparent transition-all flex items-center justify-center gap-2"
                        >
                            <FaPlus /> Scaffold Module Structure
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CourseBuilder;
