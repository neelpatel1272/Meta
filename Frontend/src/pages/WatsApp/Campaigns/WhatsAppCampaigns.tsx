import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import whatsappApi, { Campaign, Template, WhatsAppAccount } from "../../../services/whatsappApi";

const WhatsAppCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    whats_app_phone_number_id: "",
    template_id: "",
    group_name: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const campRes = await whatsappApi.getCampaigns();
      setCampaigns(campRes.data.data?.data || campRes.data.data || []);

      const tplRes = await whatsappApi.getTemplates();
      setTemplates(tplRes.data.data || []);

      const accRes = await whatsappApi.getAccounts();
      const accList = accRes.data.data || [];
      setAccounts(accList);
      if (accList.length > 0 && accList[0].phone_numbers?.length) {
        setFormData((prev) => ({
          ...prev,
          whats_app_phone_number_id: String(accList[0].phone_numbers![0].id),
        }));
      }
    } catch (err) {
      console.error("Failed to load campaigns", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await whatsappApi.createCampaign({
        name: formData.name,
        whats_app_phone_number_id: Number(formData.whats_app_phone_number_id),
        template_id: Number(formData.template_id),
        group_name: formData.group_name || undefined,
      });
      setShowModal(false);
      setFormData({ name: "", whats_app_phone_number_id: "", template_id: "", group_name: "" });
      loadData();
    } catch (err) {
      console.error("Failed to create campaign", err);
    }
  };

  const handleSendCampaign = async (id: number) => {
    try {
      setSendingId(id);
      await whatsappApi.sendCampaign(id);
      loadData();
    } catch (err) {
      console.error("Failed to dispatch campaign", err);
    } finally {
      setSendingId(null);
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
                <h4 className="mb-sm-0">WhatsApp Broadcast Campaigns</h4>
                <p className="text-muted mb-0 mt-1">Bulk marketing and utility announcements delivered directly via Meta</p>
              </div>
              <div className="page-title-right">
                <button
                  className="btn btn-success"
                  onClick={() => setShowModal(true)}
                >
                  <i className="ri-megaphone-line me-1"></i> New Broadcast
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign List */}
        <div className="card">
          <div className="card-header border-bottom">
            <h5 className="card-title mb-0">Active & Past Broadcasts</h5>
          </div>

          <div className="card-body">
            <div className="table-responsive">
              <table className="table align-middle table-nowrap mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Campaign Name</th>
                    <th>Template</th>
                    <th>Recipients</th>
                    <th>Delivery Status</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted">Loading campaigns...</td>
                    </tr>
                  ) : campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted">No campaigns created yet.</td>
                    </tr>
                  ) : (
                    campaigns.map((camp) => (
                      <tr key={camp.id}>
                        <td>
                          <h6 className="mb-0 fs-14">{camp.name}</h6>
                        </td>
                        <td>
                          <span className="badge bg-light text-primary border">
                            {camp.template?.name || "Template #" + camp.id}
                          </span>
                        </td>
                        <td>
                          <strong>{camp.total_recipients}</strong> contacts
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-success-subtle text-success">
                              Sent: {camp.sent_count}
                            </span>
                            <span className="badge bg-info-subtle text-info">
                              Delivered: {camp.delivered_count}
                            </span>
                            <span className="badge bg-primary-subtle text-primary">
                              Read: {camp.read_count}
                            </span>
                            {camp.failed_count > 0 && (
                              <span className="badge bg-danger-subtle text-danger">
                                Failed: {camp.failed_count}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              camp.status === "completed"
                                ? "bg-success"
                                : camp.status === "processing"
                                ? "bg-info"
                                : "bg-warning"
                            }`}
                          >
                            {camp.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          {camp.status === "draft" && (
                            <button
                              className="btn btn-sm btn-success"
                              disabled={sendingId === camp.id}
                              onClick={() => handleSendCampaign(camp.id)}
                            >
                              <i className="ri-send-plane-line me-1"></i>
                              {sendingId === camp.id ? "Sending..." : "Dispatch"}
                            </button>
                          )}
                          {camp.status === "completed" && (
                            <span className="text-muted fs-12">
                              <i className="ri-check-line text-success me-1"></i> Dispatched
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal: New Broadcast */}
        {showModal && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Launch WhatsApp Broadcast</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleCreateCampaign}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Broadcast Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Weekend Flash Sale"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">WhatsApp Sender Number</label>
                      <select
                        className="form-select"
                        required
                        value={formData.whats_app_phone_number_id}
                        onChange={(e) => setFormData({ ...formData, whats_app_phone_number_id: e.target.value })}
                      >
                        <option value="">Select Phone Number</option>
                        {accounts.flatMap((a) => a.phone_numbers || []).map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.display_name} ({p.phone_number})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Pre-Approved Template</label>
                      <select
                        className="form-select"
                        required
                        value={formData.template_id}
                        onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
                      >
                        <option value="">Select Message Template</option>
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.category})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Target Audience Group (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. VIP Customers (leave blank for all active)"
                        value={formData.group_name}
                        onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                      />
                      <small className="text-muted">Direct Meta Cloud API: Client pays Meta directly per conversation.</small>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-success">
                      Create Broadcast
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

export default WhatsAppCampaigns;
