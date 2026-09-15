import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import whatsappApi, { Conversation, Message } from "../../../services/whatsappApi";

const WhatsAppInbox: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");

  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await whatsappApi.getConversations({ search });
      const list = res.data.data?.data || res.data.data || [];
      setConversations(list);
      if (!selectedConv && list.length > 0) {
        selectConversation(list[0]);
      }
    } catch (err) {
      console.error("Failed to load conversations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [search]);

  const selectConversation = async (conv: Conversation) => {
    setSelectedConv(conv);
    try {
      const res = await whatsappApi.getConversation(conv.id);
      const fullConv = res.data.data;
      setSelectedConv(fullConv);
      setMessages(fullConv.messages || []);
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv || !replyText.trim() || sending) return;

    try {
      setSending(true);
      const res = await whatsappApi.sendReply(selectedConv.id, replyText);
      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
        setReplyText("");
        // Refresh conversation list to update last message
        const listRes = await whatsappApi.getConversations();
        setConversations(listRes.data.data?.data || listRes.data.data || []);
      }
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedConv) return;
    const newStatus = selectedConv.status === "resolved" ? "open" : "resolved";
    await whatsappApi.updateConversationStatus(selectedConv.id, newStatus);
    setSelectedConv({ ...selectedConv, status: newStatus });
  };

  return (
    <div className="page-content">
      <div className="container-fluid">
        {/* Title */}
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <div>
                <h4 className="mb-sm-0">WhatsApp Shared Live Inbox</h4>
                <p className="text-muted mb-0 mt-1">Direct-to-Meta (Model 1) 2-Way Chat Management</p>
              </div>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                  <li className="breadcrumb-item active">Inbox</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface Container */}
        <div className="card">
          <div className="card-body p-0">
            <div className="row g-0">
              {/* LEFT COLUMN: Conversation List */}
              <div className="col-xl-4 col-lg-5 border-end" style={{ minHeight: "75vh" }}>
                <div className="p-3 border-bottom">
                  <div className="search-box position-relative">
                    <input
                      type="text"
                      className="form-control bg-light border-light"
                      placeholder="Search chats or phone numbers..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <i className="ri-search-line search-icon position-absolute top-50 translate-middle-y end-0 me-3 text-muted"></i>
                  </div>
                </div>

                <div className="chat-room-list" style={{ maxHeight: "calc(75vh - 75px)", overflowY: "auto" }}>
                  {loading && conversations.length === 0 ? (
                    <div className="text-center p-4 text-muted">Loading chats...</div>
                  ) : conversations.length === 0 ? (
                    <div className="text-center p-4 text-muted">No conversations found.</div>
                  ) : (
                    conversations.map((conv) => {
                      const isSelected = selectedConv?.id === conv.id;
                      const contactName = conv.contact
                        ? `${conv.contact.first_name || ""} ${conv.contact.last_name || ""}`.trim() || conv.contact.phone_number
                        : "WhatsApp Contact";

                      return (
                        <div
                          key={conv.id}
                          className={`p-3 border-bottom d-flex align-items-center gap-3 cursor-pointer ${
                            isSelected ? "bg-light" : ""
                          }`}
                          style={{ cursor: "pointer" }}
                          onClick={() => selectConversation(conv)}
                        >
                          <div className="avatar-sm rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center flex-shrink-0 fw-bold">
                            {contactName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-grow-1 overflow-hidden">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <h6 className="fs-14 mb-0 text-truncate">{contactName}</h6>
                              <small className="text-muted fs-11">
                                {conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                              </small>
                            </div>
                            <div className="d-flex align-items-center justify-content-between">
                              <p className="text-muted text-truncate mb-0 fs-12" style={{ maxWidth: "200px" }}>
                                {conv.last_message || "No message yet"}
                              </p>
                              {conv.unread_count > 0 && (
                                <span className="badge bg-danger rounded-pill fs-10">{conv.unread_count}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Chat Area */}
              <div className="col-xl-8 col-lg-7 d-flex flex-column" style={{ minHeight: "75vh" }}>
                {selectedConv ? (
                  <>
                    {/* Header */}
                    <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light-subtle">
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar-sm rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold">
                          <i className="ri-whatsapp-line fs-18"></i>
                        </div>
                        <div>
                          <h5 className="fs-15 mb-0">
                            {selectedConv.contact
                              ? `${selectedConv.contact.first_name || ""} ${selectedConv.contact.last_name || ""}`.trim() || selectedConv.contact.phone_number
                              : "WhatsApp Chat"}
                          </h5>
                          <small className="text-muted">
                            +{selectedConv.contact?.phone_number} • Direct Meta Cloud
                          </small>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          className={`btn btn-sm ${selectedConv.status === "resolved" ? "btn-outline-success" : "btn-outline-secondary"}`}
                          onClick={handleResolve}
                        >
                          <i className="ri-check-double-line me-1"></i>
                          {selectedConv.status === "resolved" ? "Re-open Chat" : "Mark Resolved"}
                        </button>
                      </div>
                    </div>

                    {/* Messages Body */}
                    <div
                      className="p-4 flex-grow-1"
                      style={{ maxHeight: "calc(75vh - 150px)", overflowY: "auto", backgroundColor: "#efeae2" }}
                    >
                      {messages.map((msg) => {
                        const isOutbound = msg.direction === "outbound";
                        return (
                          <div
                            key={msg.id}
                            className={`d-flex mb-3 ${isOutbound ? "justify-content-end" : "justify-content-start"}`}
                          >
                            <div
                              className="p-3 rounded shadow-sm"
                              style={{
                                maxWidth: "70%",
                                backgroundColor: isOutbound ? "#d9fdd3" : "#ffffff",
                                color: "#111b21",
                                borderTopRightRadius: isOutbound ? "0" : "8px",
                                borderTopLeftRadius: isOutbound ? "8px" : "0",
                              }}
                            >
                              <div className="fs-13">{msg.content}</div>
                              <div className="text-end mt-1 d-flex align-items-center justify-content-end gap-1">
                                <small className="text-muted" style={{ fontSize: "10px" }}>
                                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </small>
                                {isOutbound && (
                                  <i
                                    className={`ri-check-double-line ${
                                      msg.status === "read" ? "text-primary" : "text-muted"
                                    }`}
                                    style={{ fontSize: "12px" }}
                                  ></i>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Input Footer */}
                    <form onSubmit={handleSendReply} className="p-3 border-top bg-white d-flex align-items-center gap-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Type a WhatsApp message to reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        disabled={sending}
                      />
                      <button type="submit" className="btn btn-success flex-shrink-0" disabled={sending || !replyText.trim()}>
                        <i className="ri-send-plane-fill me-1"></i> Send
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="m-auto text-center text-muted p-5">
                    <i className="ri-chat-smile-2-line fs-48 mb-3 d-block text-success"></i>
                    <h5>Select a conversation to start chatting</h5>
                    <p>Replies are transmitted directly via WhatsApp Cloud API.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppInbox;
