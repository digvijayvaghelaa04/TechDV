import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { FaChalkboardTeacher, FaCheck, FaLinkedin, FaTwitter, FaGlobe, FaYoutube } from 'react-icons/fa';

const ApplyInstructor = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        bio: '',
        expertise: '', // comma separated string for input
        socialLinks: {
            linkedin: '',
            twitter: '',
            website: '',
            youtube: ''
        },
        paymentDetails: {
            paypalEmail: '',
            bankAccount: {
                accountNumber: '',
                bankName: '',
                holderName: ''
            }
        }
    });

    const { success: toastSuccess, error: toastError } = useToast();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const parts = name.split('.');
            if (parts.length === 3) {
                // Nested deeper (paymentDetails.bankAccount.accountNumber)
                const [p, c, g] = parts;
                setFormData(prev => ({
                    ...prev,
                    [p]: {
                        ...prev[p],
                        [c]: {
                            ...prev[p][c],
                            [g]: value
                        }
                    }
                }));
            } else if (parts.length === 2) {
                const [parent, child] = parts;
                setFormData(prev => ({
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: value
                    }
                }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleNext = () => {
        if (step === 1) {
            if (!formData.bio.trim()) {
                toast.error('Please enter your Professional Bio.');
                return;
            }
            if (!formData.expertise.trim()) {
                toast.error('Please enter your Areas of Expertise.');
                return;
            }
            setStep(2);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Process expertise string to array
            const payload = {
                ...formData,
                expertise: formData.expertise.split(',').map(s => s.trim()).filter(s => s)
            };

            const response = await api.post('/instructors/apply', payload);
            toastSuccess(response.data.message || 'Application submitted successfully');
            setStep(3); // Success Step
        } catch (err) {
            console.error(err);
            toastError(err.response?.data?.error || 'Failed to submit application. Please check your details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[140px]" />
            </div>
            <div className="max-w-3xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <div className="mx-auto h-20 w-20 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <FaChalkboardTeacher className="text-4xl text-primary relative z-10 drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                    </div>
                    <h1 className="text-4xl font-display font-black text-foreground uppercase italic tracking-tighter mb-2">Initiate <span className="text-primary">Mentorship</span> Protocol</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Contribute to the collective intelligence database</p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-between mb-12 max-w-md mx-auto relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border/50 -z-10"></div>
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm border shadow-lg transition-all ${step >= s ? 'bg-primary border-primary/50 text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)] scale-110' : 'bg-card border-border/50 text-foreground/40'}`}>
                            {step > s ? <FaCheck /> : s}
                        </div>
                    ))}
                </div>

                {step === 3 ? (
                    <div className="bg-card/40 backdrop-blur-xl rounded-[2.5rem] border border-border/50 p-12 text-center animate-in fade-in zoom-in duration-500 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none" />
                        <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8 relative z-10">
                            <FaCheck className="text-5xl text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                        </div>
                        <h2 className="text-3xl font-display font-black text-foreground italic mb-4 relative z-10">Transmission <span className="text-emerald-500">Successful</span></h2>
                        <p className="text-sm font-medium text-foreground/60 mb-10 max-w-lg mx-auto relative z-10 leading-relaxed">
                            Your profile vector and payout coordinates have been securely logged. The moderation node will verify your credentials. Await signal via your primary comms pathway.
                        </p>
                        <button
                            onClick={() => navigate('/instructor/dashboard')}
                            className="bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.2em] py-4 px-10 rounded-xl hover:bg-primary/90 transition-all shadow-lg relative z-10"
                        >
                            Return to Grid Outline
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-card/40 backdrop-blur-xl rounded-[2.5rem] border border-border/50 p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />
                        {step === 1 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                                <h2 className="text-xl font-black text-foreground border-b border-border/50 pb-4 uppercase tracking-[0.2em]">Identity Node Specifications</h2>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-2">Professional Directive (Bio)</label>
                                    <textarea
                                        name="bio"
                                        required
                                        rows="4"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        className="w-full bg-background/50 border border-border/50 rounded-xl p-4 text-foreground font-medium outline-none focus:border-primary/50 text-sm transition-colors resize-none"
                                        placeholder="Record your operational history and technical achievements..."
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-2">Skill Matrix Vectors (Comma Separated)</label>
                                    <input
                                        type="text"
                                        name="expertise"
                                        required
                                        value={formData.expertise}
                                        onChange={handleChange}
                                        className="w-full bg-background/50 border border-border/50 rounded-xl p-4 text-foreground font-mono text-sm outline-none focus:border-primary/50 transition-colors"
                                        placeholder="e.g. React, Node.js, System Design, Python"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                                    <h3 className="md:col-span-2 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 mb-2">External Connections</h3>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-2 flex items-center relative"><FaLinkedin className="mr-2 text-blue-500 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]" /> LinkedIn Uplink</label>
                                        <input
                                            type="url"
                                            name="socialLinks.linkedin"
                                            value={formData.socialLinks.linkedin}
                                            onChange={handleChange}
                                            className="w-full bg-background/50 border border-border/50 rounded-xl p-3 text-foreground font-mono text-xs outline-none focus:border-blue-500/50 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-2 flex items-center relative"><FaTwitter className="mr-2 text-sky-400 drop-shadow-[0_0_5px_rgba(56,189,248,0.5)]" /> Twitter Uplink</label>
                                        <input
                                            type="url"
                                            name="socialLinks.twitter"
                                            value={formData.socialLinks.twitter}
                                            onChange={handleChange}
                                            className="w-full bg-background/50 border border-border/50 rounded-xl p-3 text-foreground font-mono text-xs outline-none focus:border-sky-400/50 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-2 flex items-center relative"><FaGlobe className="mr-2 text-primary opacity-80" /> Personal Domain</label>
                                        <input
                                            type="url"
                                            name="socialLinks.website"
                                            value={formData.socialLinks.website}
                                            onChange={handleChange}
                                            className="w-full bg-background/50 border border-border/50 rounded-xl p-3 text-foreground font-mono text-xs outline-none focus:border-primary/50 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-2 flex items-center relative"><FaYoutube className="mr-2 text-destructive drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" /> Broadcast Channel</label>
                                        <input
                                            type="url"
                                            name="socialLinks.youtube"
                                            value={formData.socialLinks.youtube}
                                            onChange={handleChange}
                                            className="w-full bg-background/50 border border-border/50 rounded-xl p-3 text-foreground font-mono text-xs outline-none focus:border-destructive/50 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-8">
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest py-4 px-10 rounded-xl hover:bg-primary/90 transition-all shadow-lg flex items-center gap-3"
                                    >
                                        Forward Coordinates <span className="text-[14px]">&rarr;</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                                <h2 className="text-xl font-black text-foreground border-b border-border/50 pb-4 uppercase tracking-[0.2em]">Transaction Endpoint Config</h2>
                                <p className="text-[10px] uppercase font-black tracking-widest text-primary bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Endpoints map revenue flow. Vectors can be retargeted post-authorization.
                                </p>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-2">PayPal Routing Identity</label>
                                    <input
                                        type="email"
                                        name="paymentDetails.paypalEmail"
                                        value={formData.paymentDetails.paypalEmail}
                                        onChange={handleChange}
                                        className="w-full bg-background/50 border border-border/50 rounded-xl p-4 text-foreground font-mono text-sm outline-none focus:border-primary/50 transition-colors"
                                        placeholder="node@cluster.com"
                                    />
                                </div>

                                <div className="relative my-8">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-border/50"></div>
                                    </div>
                                    <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]">
                                        <span className="px-4 bg-card text-foreground/40">OR Direct Wire Protocol</span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-2">Institution Designator</label>
                                        <input
                                            type="text"
                                            name="paymentDetails.bankAccount.bankName"
                                            value={formData.paymentDetails.bankAccount.bankName}
                                            onChange={handleChange}
                                            className="w-full bg-background/50 border border-border/50 rounded-xl p-4 text-foreground font-medium text-sm outline-none focus:border-primary/50 transition-colors"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-2">Entity Registration</label>
                                            <input
                                                type="text"
                                                name="paymentDetails.bankAccount.holderName"
                                                value={formData.paymentDetails.bankAccount.holderName}
                                                onChange={handleChange}
                                                className="w-full bg-background/50 border border-border/50 rounded-xl p-4 text-foreground font-medium text-sm outline-none focus:border-primary/50 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-2">Vector ID (Account # / IBAN)</label>
                                            <input
                                                type="text"
                                                name="paymentDetails.bankAccount.accountNumber"
                                                value={formData.paymentDetails.bankAccount.accountNumber}
                                                onChange={handleChange}
                                                className="w-full bg-background/50 border border-border/50 rounded-xl p-4 text-foreground font-mono text-xs outline-none focus:border-primary/50 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-8 border-t border-border/50">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-[10px] font-black text-foreground/50 hover:text-foreground uppercase tracking-widest px-4 py-2 transition-colors flex items-center gap-2"
                                    >
                                        <span className="text-[14px]">&larr;</span> Retract
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-emerald-500 text-black font-black text-[10px] uppercase tracking-widest py-4 px-10 rounded-xl hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <><span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" /> Processing...</>
                                        ) : 'Commit Authorization Request'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
};

export default ApplyInstructor;
