import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export type QuickReplyHeaderType = "NONE" | "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT";
export type QuickReplyButtonMode = "NONE" | "REPLY_BUTTON" | "CTA_BUTTON";
export type QuickReplyButtonKind = "QUICK_REPLY" | "URL";

export interface QuickReplyButton {
  type: QuickReplyButtonKind;
  text: string;
  url?: string;
}

export interface QuickReply {
  id: number;
  whats_app_account_id?: number;
  name: string;
  reply_text: string;
  footer_text?: string;
  header_type: QuickReplyHeaderType;
  header_content?: string;
  button_type: QuickReplyButtonMode;
  buttons?: QuickReplyButton[];
  created_at?: string;
  updated_at?: string;
}

export const quickReplyApi = {
  getQuickReplies: (params?: any) => api.get<{ success: boolean; data: QuickReply[] }>("/quick-replies", { params }),
  getQuickReply: (id: number) => api.get<{ success: boolean; data: QuickReply }>(`/quick-replies/${id}`),
  createQuickReply: (data: any) => api.post<{ success: boolean; data: QuickReply }>("/quick-replies", data),
  updateQuickReply: (id: number, data: any) => api.put<{ success: boolean; data: QuickReply }>(`/quick-replies/${id}`, data),
  deleteQuickReply: (id: number) => api.delete(`/quick-replies/${id}`),
  uploadMedia: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<{ success: boolean; data?: { url: string }; url?: string }>(
      "/quick-replies/upload-media",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  },
};

export default quickReplyApi;