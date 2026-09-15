import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import whatsappApi, { Template, WhatsAppAccount } from "../../../services/whatsappApi";

const WhatsAppSingleSend: React.FC = () => {
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [sendType, setSendType] = useState<"text" | "template">("text");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [content, setContent] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    whatsappApi.getAccounts().then((res) => {
      setAccounts(res.data.data || []);
    });
    whatsappApi.getTemplates().then((res) => {
      setTemplates(res.data.data || []);
    });
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const payload: any = {
        phone_number: phoneNumber,
      };

      if (sendType === "template") {
        payload.template_id = Number(selectedTemplateId);
      } else {
        payload.content = content;
      }

      const res = await whatsappApi.singleSend(payload);
      setResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to send message");
    } finally {
      setLoading(false);
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
                <h4 className="mb-sm-0">Single Send</h4>
                <p className="text-muted mb-0 mt-1">Direct instant message dispatch to any WhatsApp number</p>
              </div>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                  <li className="breadcrumb-item active">Single Send</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h5 className="card-title mb-0">Direct WhatsApp Dispatch</h5>
              </div>
              <div className="card-body p-4">
                {error && (
                  <div className="alert alert-danger d-flex align-items-center mb-3">
                    <i className="ri-error-warning-line me-2 fs-18"></i>
                    <div>{error}</div>
                  </div>
                )}

                {result && (
                  <div className="alert alert-success d-flex align-items-center mb-3">
                    <i className="ri-checkbox-circle-line me-2 fs-18"></i>
                    <div>
                      <strong>Success!</strong> WhatsApp message sent (ID: {result.data?.message_id}).
                    </div>
                  </div>
                )}

                <form onSubmit={handleSend}>
                  <div className="mb-3">
                    <label className="form-label">Recipient Phone Number (with Country Code)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 919876543210"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <small className="text-muted">Do not include +, spaces, or dashes.</small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Message Mode</label>
                    <div className="d-flex gap-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="sendType"
                          id="typeText"
                          checked={sendType === "text"}
                          onChange={() => setSendType("text")}
                        />
                        <label className="form-check-label" htmlFor="typeText">
                          Direct Text Message
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="sendType"
                          id="typeTemplate"
                          checked={sendType === "template"}
                          onChange={() => setSendType("template")}
                        />
                        <label className="form-check-label" htmlFor="typeTemplate">
                          Approved Template Message
                        </label>
                      </div>
                    </div>
                  </div>

                  {sendType === "text" ? (
                    <div className="mb-4">
                      <label className="form-label">Message Text</label>
                      <textarea
                        className="form-control"
                        rows={4}
                        placeholder="Type your WhatsApp message..."
                        required
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      ></textarea>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <label className="form-label">Select Template</label>
                      <select
                        className="form-select"
                        required
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                      >
                        <option value="">Choose a template...</option>
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.category})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-success w-100 py-2 fs-15"
                    disabled={loading}
                  >
                    <i className="ri-whatsapp-line me-2"></i>
                    {loading ? "Transmitting to WhatsApp..." : "Send WhatsApp Message"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppSingleSend;
