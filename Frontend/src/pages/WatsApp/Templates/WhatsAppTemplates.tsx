import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import whatsappApi, { Template, WhatsAppAccount } from "../../../services/whatsappApi";

const WhatsAppTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [account, setAccount] = useState<WhatsAppAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "MARKETING",
    language: "en_US",
    header_content: "",
    body_text: "",
    footer_text: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const accRes = await whatsappApi.getAccounts();
      const firstAcc = accRes.data.data?.[0];
      setAccount(firstAcc || null);

      const tplRes = await whatsappApi.getTemplates({ category: categoryFilter || undefined });
      setTemplates(tplRes.data.data || []);
    } catch (err) {
      console.error("Failed to load templates", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter]);

  const handleSync = async () => {
    if (!account) return;
    try {
      setSyncing(true);
      await whatsappApi.syncTemplates(account.id);
      loadData();
    } catch (err) {
      console.error("Failed to sync templates", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await whatsappApi.createTemplate({
        ...formData,
        whats_app_account_id: account?.id,
      });
      setShowCreateModal(false);
      setFormData({
        name: "",
        category: "MARKETING",
        language: "en_US",
        header_content: "",
        body_text: "",
        footer_text: "",
      });
      loadData();
    } catch (err) {
      console.error("Failed to create template", err);
    }
  };

  return (
    <div className="page-content">
      <div className="container-fluid">
        {/* Title */}
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <div>
                <h4 className="mb-sm-0">WhatsApp Message Templates</h4>
                <p className="text-muted mb-0 mt-1">Pre-approved Meta templates for Outbound Notifications & Broadcasts</p>
              </div>
              <div className="page-title-right d-flex gap-2">
                <button
                  className="btn btn-outline-success"
                  onClick={handleSync}
                  disabled={syncing || !account}
                >
                  <i className={`ri-refresh-line me-1 ${syncing ? "spin" : ""}`}></i>
                  {syncing ? "Syncing..." : "Sync from Meta"}
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => setShowCreateModal(true)}
                >
                  <i className="ri-add-line me-1"></i> New Template
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="row mb-3">
          <div className="col-md-6 d-flex gap-2">
            <button
              className={`btn btn-sm ${categoryFilter === "" ? "btn-primary" : "btn-light"}`}
              onClick={() => setCategoryFilter("")}
            >
              All Categories
            </button>
            <button
              className={`btn btn-sm ${categoryFilter === "MARKETING" ? "btn-primary" : "btn-light"}`}
              onClick={() => setCategoryFilter("MARKETING")}
            >
              Marketing
            </button>
            <button
              className={`btn btn-sm ${categoryFilter === "UTILITY" ? "btn-primary" : "btn-light"}`}
              onClick={() => setCategoryFilter("UTILITY")}
            >
              Utility
            </button>
            <button
              className={`btn btn-sm ${categoryFilter === "AUTHENTICATION" ? "btn-primary" : "btn-light"}`}
              onClick={() => setCategoryFilter("AUTHENTICATION")}
            >
              Authentication
            </button>
          </div>
        </div>

        {/* Template Cards Grid */}
        <div className="row">
          {loading ? (
            <div className="col-12 text-center py-5 text-muted">Loading templates...</div>
          ) : templates.length === 0 ? (
            <div className="col-12 text-center py-5 text-muted">No message templates found. Click "Sync from Meta" to import.</div>
          ) : (
            templates.map((tpl) => (
              <div className="col-xl-4 col-md-6 mb-4" key={tpl.id}>
                <div className="card h-100 shadow-sm border">
                  <div className="card-header bg-light d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="card-title mb-0 fs-14 fw-bold">{tpl.name}</h6>
                      <small className="text-muted">{tpl.language} • {tpl.category}</small>
                    </div>
                    <span
                      className={`badge ${
                        tpl.status === "APPROVED"
                          ? "bg-success"
                          : tpl.status === "PENDING"
                          ? "bg-warning"
                          : "bg-danger"
                      }`}
                    >
                      {tpl.status}
                    </span>
                  </div>
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      {tpl.header_content && (
                        <div className="fw-bold fs-13 mb-2 text-dark">{tpl.header_content}</div>
                      )}
                      <p className="fs-13 text-secondary mb-3" style={{ whiteSpace: "pre-wrap" }}>
                        {tpl.body_text}
                      </p>
                      {tpl.footer_text && (
                        <small className="text-muted d-block mb-3">{tpl.footer_text}</small>
                      )}
                    </div>
                    {tpl.buttons && tpl.buttons.length > 0 && (
                      <div className="border-top pt-2 d-flex flex-wrap gap-1">
                        {tpl.buttons.map((b: any, i: number) => (
                          <span key={i} className="badge bg-light text-primary border">
                            <i className="ri-share-forward-line me-1"></i> {b.text || "Quick Reply"}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal: Create Template */}
        {showCreateModal && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Create WhatsApp Template</h5>
                  <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
                </div>
                <form onSubmit={handleCreateTemplate}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Template Name (Lowercase & Underscores)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. spring_special_discount"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                      />
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Category</label>
                        <select
                          className="form-select"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        >
                          <option value="MARKETING">Marketing</option>
                          <option value="UTILITY">Utility</option>
                          <option value="AUTHENTICATION">Authentication</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Language</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.language}
                          onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Header (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Special Announcement"
                        value={formData.header_content}
                        onChange={(e) => setFormData({ ...formData, header_content: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Body Text (Use {"{{1}}"}, {"{{2}}"} for placeholders)</label>
                      <textarea
                        className="form-control"
                        rows={4}
                        required
                        placeholder="Hi {{1}}, here is your offer..."
                        value={formData.body_text}
                        onChange={(e) => setFormData({ ...formData, body_text: e.target.value })}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Footer Text (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Reply STOP to unsubscribe"
                        value={formData.footer_text}
                        onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-light" onClick={() => setShowCreateModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-success">
                      Save Template
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppTemplates;
