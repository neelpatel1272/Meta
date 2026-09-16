import React from "react";
import { Navigate } from "react-router-dom";

// Dashboard
import DashboardEcommerce from "../pages/DashboardEcommerce";

// Error Pages
import Basic404 from '../pages/AuthenticationInner/Errors/Basic404';
import Cover404 from '../pages/AuthenticationInner/Errors/Cover404';
import Alt404 from '../pages/AuthenticationInner/Errors/Alt404';
import Error500 from '../pages/AuthenticationInner/Errors/Error500';
import Offlinepage from "../pages/AuthenticationInner/Errors/Offlinepage";

// Auth
import Login from "../pages/Authentication/Login";
import ForgetPasswordPage from "../pages/Authentication/ForgetPassword";
import Logout from "../pages/Authentication/Logout";
import Register from "../pages/Authentication/Register";

// User Profile
import UserProfile from "../pages/Authentication/user-profile";

// WhatsApp SaaS Pages
import WhatsAppSetup from "../pages/WatsApp/Setup/WhatsAppSetup";
import WhatsAppInbox from "../pages/WatsApp/Inbox/WhatsAppInbox";
import WhatsAppContacts from "../pages/WatsApp/Contacts/WhatsAppContacts";
import WhatsAppTemplates from "../pages/WatsApp/Templates/WhatsAppTemplates";
import WhatsAppCampaigns from "../pages/WatsApp/Campaigns/WhatsAppCampaigns";
import WhatsAppSingleSend from "../pages/WatsApp/SingleSend/WhatsAppSingleSend";
import ContactGroups from "../pages/WatsApp/Contacts/ContactGroups";
import CustomFields from "../pages/WatsApp/Contacts/CustomFields";
import ImportContact from "../pages/WatsApp/Contacts/ImportContact";

import WhatsAppTemplateBuilder from "../pages/WatsApp/Templates/WhatsAppTemplateBuilder";
import QuickReplyForm from "../pages/WatsApp/QuickReply/Quickreplyform";
import QuickReplies from "../pages/WatsApp/QuickReply/QuickReplies";

const authProtectedRoutes = [
  { path: "/dashboard", component: <DashboardEcommerce /> },
  { path: "/index", component: <DashboardEcommerce /> },
  { path: "/profile", component: <UserProfile /> },

  // WhatsApp SaaS Modules
  { path: "/whatsapp-setup", component: <WhatsAppSetup /> },
  { path: "/inbox", component: <WhatsAppInbox /> },

  { path: "/contacts", component: <WhatsAppContacts /> },
  { path: "/contact-groups", component: <ContactGroups /> },
  { path: "/import-contact", component: <ImportContact /> },
  { path: "/custom-fields", component: <CustomFields /> },
  
  { path: "/templates", component: <WhatsAppTemplates /> },
  { path: "/campaigns", component: <WhatsAppCampaigns /> },
  { path: "/single-send", component: <WhatsAppSingleSend /> },

  { path: "/quick-replies/create", component: <QuickReplyForm /> },
  { path: "/quick-replies", component: <QuickReplies /> },
  { path: "/quick-replies/edit/:id", component: <QuickReplyForm /> },

  { path: "/whatsapp/templates/new", component: <WhatsAppTemplateBuilder /> },

  // Wildcard & Redirect routes (MUST BE AT THE END)
  {
    path: "/",
    exact: true,
    component: <Navigate to="/dashboard" />,
  },
  { path: "*", component: <Navigate to="/dashboard" /> },
];

const publicRoutes: any = [
  { path: "/logout", component: <Logout /> },
  { path: "/login", component: <Login /> },
  { path: "/forgot-password", component: <ForgetPasswordPage /> },
  { path: "/register", component: <Register /> },
  { path: "/auth-404-basic", component: <Basic404 /> },
  { path: "/auth-404-cover", component: <Cover404 /> },
  { path: "/auth-404-alt", component: <Alt404 /> },
  { path: "/auth-500", component: <Error500 /> },
  { path: "/auth-offline", component: <Offlinepage /> },
];

export { authProtectedRoutes, publicRoutes };