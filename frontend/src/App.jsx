// import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import CallPage from './pages/CallPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';

import toast, { Toaster } from 'react-hot-toast';
import { useEffect,useState  } from 'react';
// import { useQuery } from '@tanstack/react-query';
import axios from "axios";
//import { axiosInstance } from './lib/axios.js';
import useAuthUser from "./hooks/useAuthUser.js";
import PageLoader from './components/PageLoader.jsx';
import Layout from './components/Layout.jsx';
import { useThemeStore } from './store/useThemeStore.js';

const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme, setTheme } = useThemeStore();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  // useEffect(() => {
  //   document.documentElement.setAttribute("data-theme", theme);
  // }, [theme]);

  if (isLoading) return <PageLoader />;

  
 
  return (
    <div className="min-h-screen bg-base-100 text-base-content" data-theme={theme}>
     {/* <button onClick={() => toast.success("Hello World!")}>Create A Toast</button> */}

      <Routes>
        <Route path="/" element= { isAuthenticated && isOnboarded ? (
          <Layout showSidebar={true}>
            <HomePage /> 
           </Layout>
           
           ): (
           <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
           )}/>

        <Route
          path="/signup"
          element={
            !isAuthenticated ? <SignupPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />
          }
        />

         <Route
          path="/login"
          element={
            !isAuthenticated ? <LoginPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />
          }
        />

        <Route path="/notifications" element={isAuthenticated ?<NotificationsPage /> : <Navigate to="/login" />} />
        <Route path="/call" element={isAuthenticated ?<CallPage /> : <Navigate to="/login" />} />
        <Route path="/chat" element={isAuthenticated ?<ChatPage /> : <Navigate to="/login" />} />
        {/* <Route path="/onboarding" element={isAuthenticated ? (<OnboardingPage />) : (<Navigate to="/login" />)} /> */}
       
        <Route
          path="/onboarding"
          element={
            isAuthenticated ? (
              !isOnboarded ? (
                <OnboardingPage />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        
      </Routes>

      <Toaster />
    
    </div>
  );
};

export default App;
