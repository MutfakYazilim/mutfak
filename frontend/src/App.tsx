import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthContext';
import { LanguageProvider } from '@/features/core/LanguageContext';
import { Toaster as SonnerToaster } from 'sonner';
import AppLayout from '@/layouts/AppLayout';

// Pages
import Index from '@/features/core/Index';
import Login from '@/features/auth/Login';
import Dashboard from '@/features/dashboard/Dashboard';
import UserFeedback from '@/features/feedback/UserFeedback';
import ReviewPlatforms from '@/features/restaurant/ReviewPlatforms';
import ComplaintForm from '@/features/feedback/ComplaintForm';
import ThankYou from '@/features/feedback/ThankYou';
import Settings from '@/features/core/Settings';
import Comments from '@/features/feedback/Comments';
import Analytics from '@/features/analytics/Analytics';
import AdminRestaurants from '@/features/restaurant/AdminRestaurants';
import RestaurantForm from '@/features/restaurant/RestaurantForm';
import NotFound from '@/features/core/NotFound';
import PrivacyPolicy from '@/pages/static/PrivacyPolicy';
import TermsOfService from '@/pages/static/TermsOfService';
import AdminWaitlist from '@/features/restaurant/AdminWaitlist';

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/user-feedback" element={<UserFeedback />} />
              <Route path="/review-platforms" element={<ReviewPlatforms />} />
              <Route path="/complaint-form" element={<ComplaintForm />} />
              <Route path="/thank-you" element={<ThankYou />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />

              {/* Protected routes - with AppLayout */}
              <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
              <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
              <Route path="/comments" element={<AppLayout><Comments /></AppLayout>} />
              <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
              
              {/* Admin routes - with AppLayout */}
              <Route path="/admin/restaurants" element={<AppLayout><AdminRestaurants /></AppLayout>} />
              <Route path="/admin/restaurants/new" element={<AppLayout><RestaurantForm /></AppLayout>} />
              <Route path="/admin/restaurants/:id" element={<AppLayout><RestaurantForm /></AppLayout>} />
              <Route path="/admin/waitlist" element={<AppLayout><AdminWaitlist /></AppLayout>} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <SonnerToaster
              position="top-center"
              toastOptions={{
                style: {
                  background: '#1f2937',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '16px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                },
                duration: 4000
              }}
            />
          </div>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
