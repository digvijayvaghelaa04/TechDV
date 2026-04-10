import React, { lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import ProtectedRoute from '../components/ProtectedRoute';
import { PageTransition } from '../components/PageTransition';

// Lazy loading all pages for performance scaling
const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const VerifyOTP = lazy(() => import('../pages/VerifyOTP'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const Courses = lazy(() => import('../pages/Courses'));
const CourseDetails = lazy(() => import('../pages/CourseDetails'));
const Profile = lazy(() => import('../pages/Profile'));
const MyCourses = lazy(() => import('../pages/MyCourses'));
const CoursePlayer = lazy(() => import('../pages/CoursePlayer'));
const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const UserDashboard = lazy(() => import('../pages/Dashboard'));
const ManageCourses = lazy(() => import('../pages/admin/ManageCourses'));
const CourseBuilder = lazy(() => import('../pages/admin/CourseBuilder'));
const UserList = lazy(() => import('../pages/admin/UserList'));
const CreateUser = lazy(() => import('../pages/admin/CreateUser'));
const AdminUserDetail = lazy(() => import('../pages/admin/AdminUserDetail'));
const OrderList = lazy(() => import('../pages/admin/OrderList'));
const InstructorDashboard = lazy(() => import('../pages/instructor/Dashboard'));
const ApplyInstructor = lazy(() => import('../pages/instructor/Apply'));
const InstructorApplications = lazy(() => import('../pages/admin/InstructorApplications'));
const NotFound = lazy(() => import('../pages/NotFound'));
const ManageInstructors = lazy(() => import('../pages/admin/ManageInstructors'));
const PaymentPage = lazy(() => import('../pages/PaymentPage'));
const PaymentHistory = lazy(() => import('../pages/PaymentHistory'));
const AdminPayments = lazy(() => import('../pages/admin/AdminPayments'));
const Earnings = lazy(() => import('../pages/instructor/Earnings'));
const LiveRoom = lazy(() => import('../pages/LiveRoom'));

const { About, Careers, Contact, Blog, Mentors, Pricing, Live, Privacy } = {
    About: lazy(() => import('../pages/InfoPages').then(m => ({ default: m.About }))),
    Careers: lazy(() => import('../pages/InfoPages').then(m => ({ default: m.Careers }))),
    Contact: lazy(() => import('../pages/InfoPages').then(m => ({ default: m.Contact }))),
    Blog: lazy(() => import('../pages/InfoPages').then(m => ({ default: m.Blog }))),
    Mentors: lazy(() => import('../pages/InfoPages').then(m => ({ default: m.Mentors }))),
    Pricing: lazy(() => import('../pages/InfoPages').then(m => ({ default: m.Pricing }))),
    Live: lazy(() => import('../pages/InfoPages').then(m => ({ default: m.Live }))),
    Privacy: lazy(() => import('../pages/InfoPages').then(m => ({ default: m.Privacy }))),
};

export default function AppRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageTransition><Home /></PageTransition>} />
                <Route path="/home" element={<PageTransition><Home /></PageTransition>} />
                <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
                <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
                <Route path="/verify-otp" element={<PageTransition><VerifyOTP /></PageTransition>} />
                <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
                <Route path="/courses" element={<PageTransition><Courses /></PageTransition>} />
                <Route path="/course/:id" element={<PageTransition><CourseDetails /></PageTransition>} />

                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
                <Route path="/payment/history" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
                <Route path="/payment/:courseId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />

                <Route path="/course/:id/learn" element={<ProtectedRoute><CoursePlayer /></ProtectedRoute>} />

                <Route path="/instructor/dashboard" element={<ProtectedRoute allowedRoles={['instructor', 'admin', 'super_admin']}><InstructorDashboard /></ProtectedRoute>} />
                <Route path="/instructor/earnings" element={<ProtectedRoute allowedRoles={['instructor', 'admin', 'super_admin']}><Earnings /></ProtectedRoute>} />
                <Route path="/instructor/apply" element={<ProtectedRoute><ApplyInstructor /></ProtectedRoute>} />

                <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'super_admin', 'instructor']} />}>
                    <Route path="courses" element={<ManageCourses />} />
                    <Route path="create-course" element={<CourseBuilder />} />
                    <Route path="edit-course/:id" element={<CourseBuilder />} />
                </Route>

                <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']} />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="create-user" element={<CreateUser />} />
                    <Route path="users" element={<UserList />} />
                    <Route path="users/:id" element={<AdminUserDetail />} />
                    <Route path="orders" element={<OrderList />} />
                    <Route path="instructor-applications" element={<InstructorApplications />} />
                    <Route path="payments" element={<AdminPayments />} />
                    <Route path="instructors" element={<ManageInstructors />} />
                </Route>

                <Route path="/about" element={<About />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/mentors" element={<Mentors />} />
                <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
                <Route path="/live" element={<ProtectedRoute><PageTransition><Live /></PageTransition></ProtectedRoute>} />
                <Route path="/live/:channelName" element={<ProtectedRoute><LiveRoom /></ProtectedRoute>} />
                <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
                <Route path="/terms" element={<PageTransition><Privacy /></PageTransition>} />
                <Route path="/cookies" element={<PageTransition><Privacy /></PageTransition>} />
                <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
        </AnimatePresence>
    );
}
