import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/authSlice';
import courseReducer from '../store/courseSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        courses: courseReducer,
    },
});
