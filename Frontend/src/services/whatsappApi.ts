import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export interface WhatsAppAccount {
  id: number;
  user_id: number;
  name: string;
  business_id?: string;
  waba_id: string;
  status: "pending" | "connected" | "disconnected";
  phone_numbers?: WhatsAppPhoneNumber[];
  created_at?: string;
}

export interface WhatsAppPhoneNumber {
  id: number;
  whats_app_account_id: number;
  phone_number_id: string;
  phone_number: string;
  display_name?: string;
  verified_name?: string;
  quality_rating: string;
  status: string;
}

export interface Contact {
  id: number;
  whats_app_account_id: number;
  first_name?: string;
  last_name?: string;
  phone_number: string;
  email?: string;
  group_name?: string;
  tags?: string[];
  status: string;
  custom_fields?: Record<string, string>;
}

export interface Message {
  id: number;
  conversation_id: number;
  direction: "inbound" | "outbound";
  type: string;
  content: string;
  status: "queued" | "sent" | "delivered" | "read" | "failed";
  created_at: string;
}

export interface Conversation {
  id: number;
  whats_app_account_id: number;
  contact_id: number;
  status: "open" | "resolved" | "pending";
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  contact: Contact;
  phone_number?: WhatsAppPhoneNumber;
  messages?: Message[];
}

export type TemplateHeaderType = "NONE" | "TEXT" | "IMAGE" | "VIDEO" | "PDF" | "CAROUSEL";

export type TemplateButtonType = "QUICK_REPLY" | "URL" | "PHONE_NUMBER" | "COPY_CODE" | "FLOW";

export interface TemplateButton {
  type: TemplateButtonType;
  text: string;
  url?: string;
  phone_number?: string;
  example?: string;
}

export interface CarouselCard {
  header_content?: string;
  body_text: string;
  buttons?: TemplateButton[];
}

export interface Template {
  id: number;
  name: string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  language: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  header_type?: TemplateHeaderType;
  header_content?: string;
  body_text: string;
  footer_text?: string;
  buttons?: TemplateButton[];
  carousel_cards?: CarouselCard[];
  sample_variables?: string[];
}

export interface Campaign {
  id: number;
  name: string;
  status: "draft" | "scheduled" | "processing" | "completed" | "failed";
  scheduled_at?: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  template?: Template;
  phone_number?: WhatsAppPhoneNumber;
}

export const whatsappApi = {
  // Accounts
  getAccounts: () => api.get<{ success: boolean; data: WhatsAppAccount[] }>("/whatsapp/accounts"),
  connectAccount: (data: any) => api.post("/whatsapp/accounts", data),
  disconnectAccount: (id: number) => api.delete(`/whatsapp/accounts/${id}`),

  // Phone numbers
  getPhoneNumbers: (accountId: number) => api.get(`/whatsapp/accounts/${accountId}/phone-numbers`),
  syncPhoneNumbers: (accountId: number) => api.post(`/whatsapp/accounts/${accountId}/phone-numbers/sync`),

  // Contacts
  getContacts: (params?: any) => api.get("/contacts", { params }),
  createContact: (data: any) => api.post("/contacts", data),
  importContacts: (contacts: any[]) => api.post("/contacts/import", { contacts }),
  importContactsCsv: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post("/contacts/import-csv", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  deleteContact: (id: number) => api.delete(`/contacts/${id}`),

  // Conversations & Inbox
  getConversations: (params?: any) => api.get("/conversations", { params }),
  getConversation: (id: number) => api.get(`/conversations/${id}`),
  updateConversationStatus: (id: number, status: string) => api.put(`/conversations/${id}/status`, { status }),
  getMessages: (convId: number) => api.get(`/conversations/${convId}/messages`),
  sendReply: (conversationId: number, content: string) => api.post("/messages/reply", { conversation_id: conversationId, content }),
  singleSend: (data: { phone_number: string; content?: string; template_id?: number; variables?: any[] }) => api.post("/messages/single-send", data),

  // Templates
  getTemplates: (params?: any) => api.get("/templates", { params }),
  getTemplate: (id: number) => api.get(`/templates/${id}`),
  createTemplate: (data: any) => api.post("/templates", data),
  updateTemplate: (id: number, data: any) => api.put(`/templates/${id}`, data),
  deleteTemplate: (id: number) => api.delete(`/templates/${id}`),
  syncTemplates: (accountId: number) => api.post(`/templates/sync/${accountId}`),
  uploadTemplateMedia: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post<{ success: boolean; data?: { url: string }; url?: string }>(
      "/templates/upload-media",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  // Campaigns
  getCampaigns: () => api.get("/campaigns"),
  createCampaign: (data: any) => api.post("/campaigns", data),
  sendCampaign: (id: number) => api.post(`/campaigns/${id}/send`),

  //cutomfields For the Conatcts
  getCustomFields: () => api.get("/custom-fields"),
createCustomField: (data: { name: string; type: string }) => api.post("/custom-fields", data),
deleteCustomField: (id: number) => api.delete(`/custom-fields/${id}`),

  // Analytics
  getAnalyticsOverview: () => api.get("/analytics/overview"),
};

export default whatsappApi;