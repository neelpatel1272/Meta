import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import quickReplyApi, {
  QuickReplyButtonMode,
  QuickReplyHeaderType,
} from "../../../services/Quickreplyapi";

const QuickReplyForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [name, setName] = useState("");
  const [replyText, setReplyText] = useState("");
  const [footerText, setFooterText] = useState("");

  const [headerType, setHeaderType] = useState<QuickReplyHeaderType>("NONE");
  const [headerTypeOpen, setHeaderTypeOpen] = useState(false);
  const [headerText, setHeaderText] = useState("");
  const [headerFile, setHeaderFile] = useState<File | null>(null);
  const [existingHeaderUrl, setExistingHeaderUrl] = useState<string>("");

  // Only ONE button is ever supported: a plain reply button, or a single CTA link.
  const [buttonType, setButtonType] = useState<QuickReplyButtonMode>("NONE");
  const [buttonTypeOpen, setButtonTypeOpen] = useState(false);
  const [buttonName, setButtonName] = useState("");
  const [buttonLink, setButtonLink] = useState("");

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await quickReplyApi.getQuickReply(Number(id));
        const qr = res.data.data;
        setName(qr.name);
        setReplyText(qr.reply_text);
        setFooterText(qr.footer_text || "");
        setHeaderType(qr.header_type || "NONE");
        if (qr.header_type === "TEXT") {
          setHeaderText(qr.header_content || "");
        } else {
          setExistingHeaderUrl(qr.header_content || "");
        }
        setButtonType(qr.button_type || "NONE");
        const existingButton = (qr.buttons || [])[0];
        if (existingButton) {
          setButtonName(existingButton.text || "");
          setButtonLink(existingButton.url || "");
        }
      } catch (err) {
        console.error("Failed to load quick reply", err);
        setError("Could not load this quick reply.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const headerTypeLabel = (t: QuickReplyHeaderType) =>
    t === "NONE" ? "None" : t.charAt(0) + t.slice(1).toLowerCase();
  const buttonTypeLabel = (t: QuickReplyButtonMode) =>
    t === "NONE" ? "None" : t === "REPLY_BUTTON" ? "Reply Button" : "CTA Button";

  const handleHeaderTypeSelect = (t: QuickReplyHeaderType) => {
    setHeaderType(t);
    setHeaderTypeOpen(false);
    setHeaderFile(null);
    setHeaderText("");
    setExistingHeaderUrl("");
  };

  const handleButtonTypeSelect = (t: QuickReplyButtonMode) => {
    setButtonType(t);
    setButtonTypeOpen(false);
    setButtonName("");
    setButtonLink("");
  };

  const resolveHeaderContent = async (): Promise<string> => {
    if (headerType === "NONE") return "";
    if (headerType === "TEXT") return headerText;
    if (headerFile) {
      const res = await quickReplyApi.uploadMedia(headerFile);
      return res.data.data?.url || res.data.url || "";
    }
    return existingHeaderUrl; // unchanged media on edit
  };

  const buildButtonsPayload = () => {
    // "None" is a fully valid, error-free choice — just send an empty button list.
    if (buttonType === "NONE") return [];
    if (buttonType === "REPLY_BUTTON") {
      return buttonName.trim() ? [{ type: "QUICK_REPLY", text: buttonName.trim() }] : [];
    }
    // CTA_BUTTON
    return buttonName.trim() && buttonLink.trim()
      ? [{ type: "URL", text: buttonName.trim(), url: buttonLink.trim() }]
      : [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Quick Reply Name is required.");
      return;
    }
    if (!replyText.trim()) {
      setError("Reply Text is required.");
      return;
    }

    try {
      setSaving(true);
      const header_content = await resolveHeaderContent();

      const payload = {
        name: name.trim(),
        reply_text: replyText,
        footer_text: footerText || undefined,
        header_type: headerType,
        header_content: header_content || undefined,
        button_type: buttonType,
        buttons: buildButtonsPayload(),
      };

      if (isEdit && id) {
        await quickReplyApi.updateQuickReply(Number(id), payload);
      } else {
        await quickReplyApi.createQuickReply(payload);
      }
      navigate("/quick-replies");
    } catch (err: any) {
      console.error("Failed to save quick reply", err);
      setError(err?.response?.data?.message || "Failed to save. Please check the form and try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="container-fluid text-center py-5 text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-lg-7">
            <div className="card">
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h4 className="mb-0">{isEdit ? "Edit Quick Reply" : "Create Quick Reply"}</h4>
                  <button type="button" className="btn btn-primary" onClick={() => navigate("/quick-replies")}>
                    Back
                  </button>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Quick Reply Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Reply Text</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                  </div>

                  {/* Header type */}
                  <div className="mb-3 position-relative">
                    <label className="form-label d-flex align-items-center gap-2">
                      Header Type <span className="badge bg-light text-muted border">Optional</span>
                    </label>
                    <button
                      type="button"
                      className="form-select text-start"
                      onClick={() => {
                        setHeaderTypeOpen((o) => !o);
                        setButtonTypeOpen(false);
                      }}
                    >
                      {headerTypeLabel(headerType)}
                    </button>
                    {headerTypeOpen && (
                      <div className="list-group position-absolute w-100 shadow" style={{ zIndex: 10 }}>
                        {(["NONE", "TEXT", "IMAGE", "VIDEO", "DOCUMENT"] as QuickReplyHeaderType[]).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            className={`list-group-item list-group-item-action ${headerType === opt ? "active" : ""}`}
                            onClick={() => handleHeaderTypeSelect(opt)}
                          >
                            {headerTypeLabel(opt)}
                          </button>
                        ))}
                      </div>
                    )}

                    {headerType === "TEXT" && (
                      <input
                        type="text"
                        className="form-control mt-2"
                        placeholder="Header text"
                        maxLength={60}
                        value={headerText}
                        onChange={(e) => setHeaderText(e.target.value)}
                      />
                    )}

                    {(headerType === "IMAGE" || headerType === "VIDEO" || headerType === "DOCUMENT") && (
                      <div className="mt-2">
                        <input
                          type="file"
                          className="form-control"
                          accept={
                            headerType === "IMAGE" ? "image/*" : headerType === "VIDEO" ? "video/*" : ".pdf,.doc,.docx"
                          }
                          onChange={(e) => setHeaderFile(e.target.files?.[0] || null)}
                        />
                        {headerFile && <div className="form-text">{headerFile.name}</div>}
                        {!headerFile && existingHeaderUrl && (
                          <div className="form-text">Current file: {existingHeaderUrl}</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Button type — at most one button: Reply Button OR CTA Button. */}
                  <div className="mb-3 position-relative">
                    <label className="form-label d-flex align-items-center gap-2">
                      Select Button Type <span className="badge bg-light text-muted border">Optional</span>
                    </label>
                    <button
                      type="button"
                      className="form-select text-start"
                      onClick={() => {
                        setButtonTypeOpen((o) => !o);
                        setHeaderTypeOpen(false);
                      }}
                    >
                      {buttonTypeLabel(buttonType)}
                    </button>
                    {buttonTypeOpen && (
                      <div className="list-group position-absolute w-100 shadow" style={{ zIndex: 10 }}>
                        {(["NONE", "REPLY_BUTTON", "CTA_BUTTON"] as QuickReplyButtonMode[]).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            className={`list-group-item list-group-item-action ${buttonType === opt ? "active" : ""}`}
                            onClick={() => handleButtonTypeSelect(opt)}
                          >
                            {buttonTypeLabel(opt)}
                          </button>
                        ))}
                      </div>
                    )}

                    {buttonType === "REPLY_BUTTON" && (
                      <div className="mt-2">
                        <label className="form-label">Button Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter Button Name"
                          maxLength={25}
                          value={buttonName}
                          onChange={(e) => setButtonName(e.target.value)}
                        />
                      </div>
                    )}

                    {buttonType === "CTA_BUTTON" && (
                      <div className="row mt-2 g-2">
                        <div className="col-md-6">
                          <label className="form-label">Button Name</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Button Name"
                            maxLength={25}
                            value={buttonName}
                            onChange={(e) => setButtonName(e.target.value)}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Button Link</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Button URL"
                            value={buttonLink}
                            onChange={(e) => setButtonLink(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mb-4">
                    <label className="form-label d-flex align-items-center gap-2">
                      Footer <span className="badge bg-light text-muted border">Optional</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Footer"
                      maxLength={60}
                      value={footerText}
                      onChange={(e) => setFooterText(e.target.value)}
                    />
                  </div>

                  <div className="text-end">
                    <button type="submit" className="btn btn-success" disabled={saving}>
                      {saving ? "Saving..." : "Submit"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickReplyForm;