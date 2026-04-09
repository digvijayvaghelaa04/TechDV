import axios from 'axios';

// Create Axios Instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    withCredentials: true, // Important for HttpOnly Cookies (Refresh Tokens)
    headers: {
        'Content-Type': 'application/json',
    },
});

// REQUEST INTERCEPTOR: Attach Access Token
api.interceptors.request.use(
    (config) => {
        // We still store Access Token in memory/localStorage for easy access
        // Ideally, keep it in memory only, but for this refactor we keep localStorage compatibility
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR: Handle Token Refresh & Errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 0. Handle Single Device Login Enforcements
        if (error.response?.data?.code === 'SESSION_INVALIDATED') {
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login?invalidated=true';
            }
            return Promise.reject(error.response.data.error);
        }

        // 1. Handle 401 (Unauthorized) - Try Refresh
        // We prevent retry loops by checking _retry flag
        // We also avoid refreshing if the request was specifically for login or refresh
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes('/auth/login') &&
            !originalRequest.url.includes('/auth/refresh-token')
        ) {
            // Also, if the server explicitly tells us the user was not found/deleted, don't even try to refresh
            if (error.response?.data?.error?.toLowerCase().includes('user not found') || error.response?.data?.error?.toLowerCase().includes('no user found')) {
                localStorage.removeItem('user');
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login?deleted=true';
                }
                return Promise.reject(error.response.data.error);
            }

            originalRequest._retry = true;

            try {
                // Call backend to refresh (cookie-based)
                const { data } = await api.post('/auth/refresh-token');

                if (!data.accessToken) {
                    throw new Error("No access token provided in resync signal.");
                }



                // Update Local Storage with new Access Token
                const user = JSON.parse(localStorage.getItem('user'));
                if (user) {
                    user.token = data.accessToken;
                    localStorage.setItem('user', JSON.stringify(user));
                }

                // Update Header for the retried request and future requests
                api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                console.error("[API] Resynchronization failed. Terminating session.");
                // Refresh failed - Logout user
                localStorage.removeItem('user');
                // Avoid infinite redirect if we are already on login page
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login?expired=true';
                }
                return Promise.reject(refreshError);
            }
        }

        // 2. Format Error Message
        const errorMessage = error.response?.data?.error ||
            (error.response?.data?.errors ? error.response.data.errors.map(e => e.message).join('. ') : null) ||
            'Internal system error. Signal lost.';

        return Promise.reject(errorMessage);
    }
);

export default api;
