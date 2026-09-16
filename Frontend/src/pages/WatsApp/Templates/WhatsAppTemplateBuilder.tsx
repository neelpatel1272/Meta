import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import whatsappApi from "../../../services/whatsappApi";

/**
 * Meta-style template builder: three columns —
 * "Template basics" | "Form" | "Template Preview".
 * Mirrors the layout Meta uses in Business Manager.
 */

type HeaderType = "NONE" | "TEXT" | "IMAGE" | "VIDEO" | "PDF" | "CAROUSEL";

type CtaType = "URL" | "PHONE_NUMBER" | "COPY_CODE" | "FLOW";

interface QuickReplyButton {
  id: string;
  text: string;
}

interface CtaButton {
  id: string;
  type: CtaType;
  text: string;
  value: string; // url / phone number / offer code
}

interface CarouselCard {
  id: string;
  mediaFile: File | null;
  mediaPreviewUrl: string;
  body: string;
  buttons: CtaButton[];
}

const uid = () => Math.random().toString(36).slice(2, 10);

const CTA_LIMITS: Record<CtaType, number> = {
  URL: 2,
  PHONE_NUMBER: 1,
  COPY_CODE: 1,
  FLOW: 1,
};

const CTA_LABELS: Record<CtaType, string> = {
  URL: "Visit website",
  PHONE_NUMBER: "Call phone number",
  COPY_CODE: "Copy offer code",
  FLOW: "Add form",
};

const WhatsAppTemplateBuilder: React.FC = () => {
  const navigate = useNavigate();
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // --- Template basics ---
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"MARKETING" | "UTILITY" | "AUTHENTICATION">("MARKETING");
  const [language, setLanguage] = useState("en_US");

  // --- Header ---
  const [headerType, setHeaderType] = useState<HeaderType>("NONE");
  const [headerText, setHeaderText] = useState("");
  const [headerFile, setHeaderFile] = useState<File | null>(null);
  const [headerPreviewUrl, setHeaderPreviewUrl] = useState<string>("");
  const [headerTypeOpen, setHeaderTypeOpen] = useState(false);

  // --- Body / footer ---
  const [bodyText, setBodyText] = useState("");
  const [footerText, setFooterText] = useState("");

  // --- Buttons ---
  const [quickReplies, setQuickReplies] = useState<QuickReplyButton[]>([]);
  const [ctaButtons, setCtaButtons] = useState<CtaButton[]>([]);

  // --- Carousel ---
  const [carouselCards, setCarouselCards] = useState<CarouselCard[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const variableCount = useMemo(() => {
    const matches = bodyText.match(/\{\{\d+\}\}/g);
    return matches ? matches.length : 0;
  }, [bodyText]);

  // ---------- Body formatting helpers ----------
  const wrapSelection = (marker: string) => {
    const el = bodyRef.current;
    if (!el) return;
    const { selectionStart, selectionEnd, value } = el;
    const selected = value.slice(selectionStart, selectionEnd) || "text";
    const next = value.slice(0, selectionStart) + marker + selected + marker + value.slice(selectionEnd);
    setBodyText(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(selectionStart + marker.length, selectionStart + marker.length + selected.length);
    });
  };

  const insertVariable = () => {
    const el = bodyRef.current;
    const nextIndex = variableCount + 1;
    const token = `{{${nextIndex}}}`;
    if (!el) {
      setBodyText((prev) => `${prev}${token}`);
      return;
    }
    const { selectionStart, selectionEnd, value } = el;
    const next = value.slice(0, selectionStart) + token + value.slice(selectionEnd);
    setBodyText(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = selectionStart + token.length;
      el.setSelectionRange(pos, pos);
    });
  };

  // ---------- Header media ----------
  const handleHeaderFileChange = (file: File | null) => {
    setHeaderFile(file);
    if (headerPreviewUrl) URL.revokeObjectURL(headerPreviewUrl);
    setHeaderPreviewUrl(file ? URL.createObjectURL(file) : "");
  };

  // ---------- Quick reply buttons ----------
  const addQuickReply = () => {
    if (quickReplies.length >= 10) return;
    setQuickReplies((prev) => [...prev, { id: uid(), text: "" }]);
  };
  const updateQuickReply = (id: string, text: string) => {
    setQuickReplies((prev) => prev.map((q) => (q.id === id ? { ...q, text } : q)));
  };
  const removeQuickReply = (id: string) => {
    setQuickReplies((prev) => prev.filter((q) => q.id !== id));
  };

  // ---------- CTA buttons ----------
  const ctaCountByType = (type: CtaType) => ctaButtons.filter((b) => b.type === type).length;

  const addCta = (type: CtaType) => {
    if (ctaCountByType(type) >= CTA_LIMITS[type]) return;
    setCtaButtons((prev) => [...prev, { id: uid(), type, text: "", value: "" }]);
  };
  const updateCta = (id: string, patch: Partial<CtaButton>) => {
    setCtaButtons((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };
  const removeCta = (id: string) => {
    setCtaButtons((prev) => prev.filter((b) => b.id !== id));
  };

  // ---------- Carousel cards ----------
  const addCarouselCard = () => {
    if (carouselCards.length >= 10) return;
    setCarouselCards((prev) => [
      ...prev,
      { id: uid(), mediaFile: null, mediaPreviewUrl: "", body: "", buttons: [] },
    ]);
  };
  const updateCarouselCard = (id: string, patch: Partial<CarouselCard>) => {
    setCarouselCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };
  const removeCarouselCard = (id: string) => {
    setCarouselCards((prev) => prev.filter((c) => c.id !== id));
  };
  const setCarouselCardMedia = (id: string, file: File | null) => {
    const card = carouselCards.find((c) => c.id === id);
    if (card?.mediaPreviewUrl) URL.revokeObjectURL(card.mediaPreviewUrl);
    updateCarouselCard(id, { mediaFile: file, mediaPreviewUrl: file ? URL.createObjectURL(file) : "" });
  };

  // ---------- Save ----------
  const buildButtonsPayload = () => [
    ...quickReplies.filter((q) => q.text.trim()).map((q) => ({ type: "QUICK_REPLY", text: q.text.trim() })),
    ...ctaButtons
      .filter((b) => b.text.trim())
      .map((b) => {
        if (b.type === "URL") return { type: "URL", text: b.text.trim(), url: b.value.trim() };
        if (b.type === "PHONE_NUMBER") return { type: "PHONE_NUMBER", text: b.text.trim(), phone_number: b.value.trim() };
        if (b.type === "COPY_CODE") return { type: "COPY_CODE", text: b.text.trim(), example: b.value.trim() };
        return { type: "FLOW", text: b.text.trim() };
      }),
  ];

  const uploadHeaderMediaIfNeeded = async (): Promise<string> => {
    if (headerType === "TEXT" || headerType === "NONE" || headerType === "CAROUSEL") return headerText;
    if (!headerFile) return "";
    const res = await whatsappApi.uploadTemplateMedia(headerFile);
    return res.data.data?.url || res.data.url || "";
  };

  const uploadCarouselMedia = async () => {
    const cards = [];
    for (const card of carouselCards) {
      let mediaUrl = "";
      if (card.mediaFile) {
        const res = await whatsappApi.uploadTemplateMedia(card.mediaFile);
        mediaUrl = res.data.data?.url || res.data.url || "";
      }
      cards.push({
        header_content: mediaUrl,
        body_text: card.body,
        buttons: card.buttons
          .filter((b) => b.text.trim())
          .map((b) =>
            b.type === "URL"
              ? { type: "URL", text: b.text, url: b.value }
              : b.type === "PHONE_NUMBER"
              ? { type: "PHONE_NUMBER", text: b.text, phone_number: b.value }
              : { type: "QUICK_REPLY", text: b.text }
          ),
      });
    }
    return cards;
  };

  const handleSave = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Template name is required.");
      return;
    }
    if (!bodyText.trim() && headerType !== "CAROUSEL") {
      setError("Body text is required.");
      return;
    }

    try {
      setSaving(true);

      const headerContent =
        headerType === "TEXT" ? headerText : await uploadHeaderMediaIfNeeded();

      const payload: any = {
        name: name.trim(),
        category,
        language,
        header_type: headerType,
        header_content: headerContent || undefined,
        body_text: bodyText,
        footer_text: footerText || undefined,
        buttons: buildButtonsPayload(),
      };

      if (headerType === "CAROUSEL") {
        payload.carousel_cards = await uploadCarouselMedia();
      }

      await whatsappApi.createTemplate(payload);
      navigate("/templates");
    } catch (err: any) {
      console.error("Failed to save template", err);
      setError(err?.response?.data?.message || "Failed to save template. Please check the form and try again.");
    } finally {
      setSaving(false);
    }
  };

  // ---------- Preview helpers ----------
  const renderPreviewBody = (text: string) => {
    // Render simple WhatsApp markup (*bold*, _italic_, ```code```) for the preview only.
    const escaped = text || "Your message body will appear here.";
    return escaped;
  };

  return (
    <div className="page-content">
      <div className="container-fluid">
        <div className="row mb-3">
          <div className="col-12 d-flex align-items-center justify-content-between">
            <h4 className="mb-0">Create WhatsApp Template</h4>
            <div className="d-flex gap-2">
              <button className="btn btn-light" onClick={() => navigate("/templates")}>
                Cancel
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="row g-3">

          <div className="col-lg-3">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="mb-3">Template basics</h5>

                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                  >
                    <option value="MARKETING">Marketing</option>
                    <option value="UTILITY">Utility</option>
                    <option value="AUTHENTICATION">Authentication</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Language</label>
                  <select className="form-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="en_US">English (US)</option>
                    <option value="en_GB">English (UK)</option>
                    <option value="es_ES">Spanish</option>
                    <option value="pt_BR">Portuguese (BR)</option>
                    <option value="hi_IN">Hindi</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- Column 2: Form ---------------- */}
          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="mb-3">Form</h5>

                {/* Header type */}
                <div className="mb-4 position-relative">
                  <label className="form-label d-flex align-items-center gap-2">
                    Header type <span className="badge bg-light text-muted border">Optional</span>
                  </label>
                  <div className="form-text mb-2">Add a title or choose which type of media you will use for this header.</div>
                  <button
                    type="button"
                    className="form-select text-start"
                    onClick={() => setHeaderTypeOpen((o) => !o)}
                  >
                    {headerType === "NONE" ? "None" : headerType.charAt(0) + headerType.slice(1).toLowerCase()}
                  </button>
                  {headerTypeOpen && (
                    <div className="list-group position-absolute w-100 shadow" style={{ zIndex: 10 }}>
                      {(["NONE", "TEXT", "IMAGE", "VIDEO", "PDF", "CAROUSEL"] as HeaderType[]).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          className={`list-group-item list-group-item-action ${headerType === opt ? "active" : ""}`}
                          onClick={() => {
                            setHeaderType(opt);
                            setHeaderTypeOpen(false);
                          }}
                        >
                          {opt === "NONE" ? "None" : opt.charAt(0) + opt.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  )}

                  {headerType === "TEXT" && (
                    <input
                      type="text"
                      className="form-control mt-2"
                      placeholder="e.g. Special Announcement"
                      maxLength={60}
                      value={headerText}
                      onChange={(e) => setHeaderText(e.target.value)}
                    />
                  )}

                  {(headerType === "IMAGE" || headerType === "VIDEO" || headerType === "PDF") && (
                    <div className="mt-2">
                      <input
                        type="file"
                        className="form-control"
                        accept={headerType === "IMAGE" ? "image/*" : headerType === "VIDEO" ? "video/*" : "application/pdf"}
                        onChange={(e) => handleHeaderFileChange(e.target.files?.[0] || null)}
                      />
                      {headerFile && <div className="form-text">{headerFile.name}</div>}
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="mb-3">
                  <label className="form-label">Body</label>
                  <textarea
                    ref={bodyRef}
                    className="form-control"
                    rows={6}
                    placeholder="Hi {{1}}, here is your offer..."
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                  />
                  <div className="d-flex align-items-center justify-content-between mt-2">
                    <div className="btn-group">
                      <button type="button" className="btn btn-sm btn-light fw-bold" onClick={() => wrapSelection("*")}>
                        B
                      </button>
                      <button type="button" className="btn btn-sm btn-light fst-italic" onClick={() => wrapSelection("_")}>
                        I
                      </button>
                      <button type="button" className="btn btn-sm btn-light" onClick={() => wrapSelection("```")}>
                        {"<>"}
                      </button>
                    </div>
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={insertVariable}>
                      Add variable
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="mb-4">
                  <label className="form-label d-flex align-items-center gap-2">
                    Footer <span className="badge bg-light text-muted border">Optional</span>
                  </label>
                  <div className="form-text mb-2">Enter the text for your footer in the language you have selected.</div>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Footer"
                    maxLength={60}
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                  />
                </div>

                <hr />

                {/* Quick reply buttons */}
                <div className="mb-4">
                  <label className="form-label d-flex align-items-center gap-2">
                    Quick Reply Buttons <span className="badge bg-light text-muted border">Optional</span>
                  </label>
                  <div className="form-text mb-2">Create buttons that let customers respond to your message.</div>
                  {quickReplies.map((qr) => (
                    <div className="input-group mb-2" key={qr.id}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Button text"
                        maxLength={25}
                        value={qr.text}
                        onChange={(e) => updateQuickReply(qr.id, e.target.value)}
                      />
                      <button className="btn btn-outline-danger" type="button" onClick={() => removeQuickReply(qr.id)}>
                        <i className="ri-close-line"></i>
                      </button>
                    </div>
                  ))}
                  <div className="text-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={addQuickReply}
                      disabled={quickReplies.length >= 10}
                    >
                      Add Quick Reply
                    </button>
                  </div>
                </div>

                {/* Call to action buttons */}
                <div>
                  <label className="form-label d-flex align-items-center gap-2">
                    Call to Action Buttons <span className="badge bg-light text-muted border">Optional</span>
                  </label>
                  <div className="form-text mb-2">Create buttons that let customers take action.</div>

                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => addCta("FLOW")}
                      disabled={ctaCountByType("FLOW") >= CTA_LIMITS.FLOW}
                    >
                      Add form
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => addCta("URL")}
                      disabled={ctaCountByType("URL") >= CTA_LIMITS.URL}
                    >
                      Visit website {ctaCountByType("URL") > 0 && `- x${ctaCountByType("URL")}`}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => addCta("PHONE_NUMBER")}
                      disabled={ctaCountByType("PHONE_NUMBER") >= CTA_LIMITS.PHONE_NUMBER}
                    >
                      Call phone number
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => addCta("COPY_CODE")}
                      disabled={ctaCountByType("COPY_CODE") >= CTA_LIMITS.COPY_CODE}
                    >
                      Copy offer code
                    </button>
                  </div>

                  {ctaButtons.map((btn) => (
                    <div className="border rounded p-2 mb-2" key={btn.id}>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <small className="text-muted fw-semibold">{CTA_LABELS[btn.type]}</small>
                        <button className="btn btn-sm btn-link text-danger p-0" type="button" onClick={() => removeCta(btn.id)}>
                          Remove
                        </button>
                      </div>
                      <input
                        type="text"
                        className="form-control form-control-sm mb-2"
                        placeholder="Button text"
                        maxLength={25}
                        value={btn.text}
                        onChange={(e) => updateCta(btn.id, { text: e.target.value })}
                      />
                      {btn.type === "URL" && (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="https://example.com"
                          value={btn.value}
                          onChange={(e) => updateCta(btn.id, { value: e.target.value })}
                        />
                      )}
                      {btn.type === "PHONE_NUMBER" && (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="+1 555 000 0000"
                          value={btn.value}
                          onChange={(e) => updateCta(btn.id, { value: e.target.value })}
                        />
                      )}
                      {btn.type === "COPY_CODE" && (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Sample offer code, e.g. SAVE20"
                          value={btn.value}
                          onChange={(e) => updateCta(btn.id, { value: e.target.value })}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Carousel cards */}
                {headerType === "CAROUSEL" && (
                  <div className="mt-4">
                    <label className="form-label">Carousel Cards</label>
                    {carouselCards.map((card, idx) => (
                      <div className="border rounded p-3 mb-2" key={card.id}>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <strong className="fs-13">Card {idx + 1}</strong>
                          <button className="btn btn-sm btn-link text-danger p-0" type="button" onClick={() => removeCarouselCard(card.id)}>
                            Remove
                          </button>
                        </div>
                        <input
                          type="file"
                          className="form-control form-control-sm mb-2"
                          accept="image/*,video/*"
                          onChange={(e) => setCarouselCardMedia(card.id, e.target.files?.[0] || null)}
                        />
                        <textarea
                          className="form-control form-control-sm"
                          rows={3}
                          placeholder="Card body text"
                          value={card.body}
                          onChange={(e) => updateCarouselCard(card.id, { body: e.target.value })}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={addCarouselCard}
                      disabled={carouselCards.length >= 10}
                    >
                      Add Card
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ---------------- Column 3: Preview ---------------- */}
          <div className="col-lg-3">
            <div className="card h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="mb-3">Template Preview</h5>

                <div className="border rounded p-3 mb-3 bg-light flex-grow-1" style={{ minHeight: 260 }}>
                  <div className="bg-white rounded shadow-sm p-2" style={{ maxWidth: 260 }}>
                    {headerType === "TEXT" && headerText && <div className="fw-bold fs-13 mb-1">{headerText}</div>}
                    {(headerType === "IMAGE" || headerType === "VIDEO" || headerType === "PDF") && (
                      <div
                        className="bg-light border rounded mb-2 d-flex align-items-center justify-content-center"
                        style={{ height: 120, overflow: "hidden" }}
                      >
                        {headerType === "IMAGE" && headerPreviewUrl ? (
                          <img src={headerPreviewUrl} alt="header" style={{ maxHeight: "100%", maxWidth: "100%" }} />
                        ) : (
                          <i className={`ri-${headerType === "VIDEO" ? "video" : "file-pdf"}-line fs-24 text-muted`}></i>
                        )}
                      </div>
                    )}
                    <p className="fs-13 mb-1" style={{ whiteSpace: "pre-wrap" }}>
                      {renderPreviewBody(bodyText)}
                    </p>
                    {footerText && <small className="text-muted d-block mb-2">{footerText}</small>}

                    {(quickReplies.length > 0 || ctaButtons.length > 0) && (
                      <div className="border-top pt-2 d-flex flex-column gap-1">
                        {ctaButtons.map((b) => (
                          <div key={b.id} className="text-center text-primary fs-13 border rounded py-1">
                            {b.text || CTA_LABELS[b.type]}
                          </div>
                        ))}
                        {quickReplies.map((q) => (
                          <div key={q.id} className="text-center text-primary fs-13 border rounded py-1">
                            {q.text || "Quick Reply"}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button className="btn btn-primary w-100" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Template"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppTemplateBuilder;