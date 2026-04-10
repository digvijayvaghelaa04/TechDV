import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Get user from local storage
const user = JSON.parse(localStorage.getItem('user'));

const initialState = {
    user: user ? user : null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    isOtpSent: false,       // true after register, triggers redirect to /verify-otp
    tempEmail: null,        // stored for OTP page to know which email to verify/resend
    actualEmail: null,
    requireVerification: false,
    message: '',
};

// ─── Register ──────────────────────────────────────────────────────────────────
export const register = createAsyncThunk(
    'auth/register',
    async (userData, thunkAPI) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data; // { success, message, userId, maskedEmail, devOtp? }
        } catch (error) {
            const message = error.response?.data?.error || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// ─── Verify OTP ────────────────────────────────────────────────────────────────
// Sends { email, otp } — no JWT is returned on success (user must log in separately)
export const verifyOTP = createAsyncThunk(
    'auth/verifyOTP',
    async ({ email, otp }, thunkAPI) => {
        try {
            const response = await api.post('/auth/verify-otp', { email, otp });
            return response.data; // { success, message }
        } catch (error) {
            const message = error.response?.data?.error || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// ─── Resend OTP ────────────────────────────────────────────────────────────────
export const resendOTP = createAsyncThunk(
    'auth/resendOTP',
    async ({ email }, thunkAPI) => {
        try {
            const response = await api.post('/auth/resend-otp', { email });
            return response.data; // { success, message, maskedEmail }
        } catch (error) {
            const message = error.response?.data?.error || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
    try {
        const response = await api.post('/auth/login', userData);

        if (response.data.success) {
            const userData = { ...response.data.user, token: response.data.accessToken };
            localStorage.setItem('user', JSON.stringify(userData));
            return userData;
        }
        return thunkAPI.rejectWithValue('Login failed');
    } catch (error) {
        // Handle unverified account (403 from backend)
        if (error.response?.status === 403 && error.response?.data?.requireVerification) {
            return thunkAPI.rejectWithValue({
                message: error.response.data.error,
                email: error.response.data.email,
                maskedEmail: error.response.data.maskedEmail,
                unverified: true
            });
        }
        const message = error.response?.data?.error || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
    try {
        await api.get('/auth/logout');
    } catch (error) {
        console.error('Logout API error:', error);
    } finally {
        localStorage.removeItem('user');
    }
});

// ─── Slice ────────────────────────────────────────────────────────────────────
export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.isOtpSent = false;
            state.message = '';
            // Do NOT clear tempEmail here — VerifyOTP page still needs it after reset
        },
        resetError: (state) => {
            state.isError = false;
            state.message = '';
        },
        clearOtpState: (state) => {
            state.isOtpSent = false;
            state.tempEmail = null;
            state.message = '';
            state.isError = false;
        },
        logoutSync: (state) => {
            localStorage.removeItem('user');
            state.user = null;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
            localStorage.setItem('user', JSON.stringify(state.user));
        }
    },
    extraReducers: (builder) => {
        builder
            // ── Register ────────────────────────────────────────────────────
            .addCase(register.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.message = '';
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isOtpSent = true;
                state.tempEmail = action.payload.maskedEmail || null;
                // Store the actual email separately if available
                state.actualEmail = action.payload.email || null;
                state.message = action.payload.message || 'OTP sent!';
                state.isError = false;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = typeof action.payload === 'string' ? action.payload : 'Registration failed';
            })

            // ── Verify OTP ──────────────────────────────────────────────────
            // On success: mark verified, do NOT log user in — redirect to login
            .addCase(verifyOTP.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(verifyOTP.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isOtpSent = false;
                state.isError = false;
                state.message = action.payload.message || 'Email verified!';
                // No user stored — they must log in explicitly
            })
            .addCase(verifyOTP.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = typeof action.payload === 'string' ? action.payload : 'Verification failed';
            })

            // ── Resend OTP ──────────────────────────────────────────────────
            .addCase(resendOTP.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(resendOTP.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.message = action.payload.message || 'New OTP sent!';
            })
            .addCase(resendOTP.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = typeof action.payload === 'string' ? action.payload : 'Failed to resend OTP';
            })

            // ── Login ───────────────────────────────────────────────────────
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.message = '';
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload;
                state.isError = false;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;

                if (action.payload && action.payload.unverified) {
                    // Store email so user can be redirected to /verify-otp
                    state.tempEmail = action.payload.maskedEmail || null;
                    state.actualEmail = action.payload.email || null;
                    state.message = action.payload.message;
                    state.requireVerification = true;
                } else {
                    state.message = typeof action.payload === 'string' ? action.payload : 'Login failed';
                    state.requireVerification = false;
                }
            })

            // ── Logout ──────────────────────────────────────────────────────
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.tempEmail = null;
                state.actualEmail = null;
            });
    },
});

export const { reset, resetError, clearOtpState, logoutSync, updateUser } = authSlice.actions;
export default authSlice.reducer;
