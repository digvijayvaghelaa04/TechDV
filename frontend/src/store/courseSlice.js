import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

const initialState = {
    courses: [],
    course: {},
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

// Get courses
export const getCourses = createAsyncThunk(
    'courses/getAll',
    async (params, thunkAPI) => {
        try {
            let queryString = '';
            if (params) {
                const { search, category } = params;
                const queryParts = [];
                if (search) queryParts.push(`search=${encodeURIComponent(search)}`);
                if (category && category !== 'All') queryParts.push(`category=${encodeURIComponent(category)}`);
                if (queryParts.length > 0) queryString = `?${queryParts.join('&')}`;
            }

            const response = await api.get(`/courses${queryString}`);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.error || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Get single course
export const getCourse = createAsyncThunk(
    'courses/getOne',
    async (id, thunkAPI) => {
        try {
            const response = await api.get(`/courses/${id}`);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.error || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const courseSlice = createSlice({
    name: 'course',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCourses.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getCourses.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.courses = action.payload;
            })
            .addCase(getCourses.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getCourse.pending, (state) => {
                state.isLoading = true;
                state.course = {}; // Clear previous course
            })
            .addCase(getCourse.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.course = action.payload;
            })
            .addCase(getCourse.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset } = courseSlice.actions;
export default courseSlice.reducer;

