import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap";
import whatsappApi, { Template, WhatsAppAccount } from "../../../services/whatsappApi";

const WhatsAppTemplates: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [account, setAccount] = useState<WhatsAppAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "danger"; message: string } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);

      const accRes = await whatsappApi.getAccounts();
      const firstAcc = accRes.data.data?.[0];
      setAccount(firstAcc || null);

      const tplRes = await whatsappApi.getTemplates({
        category: categoryFilter || undefined,
      });

      setTemplates(tplRes.data.data || []);
    } catch (err) {
      console.error("Failed to load templates", err);
      setAlert({
        type: "danger",
        message: "Failed to load templates.",
      });
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

      await loadData();

      setAlert({
        type: "success",
        message: "Templates synced successfully.",
      });
    } catch (err) {
      console.error("Failed to sync templates", err);

      setAlert({
        type: "danger",
        message: "Failed to sync templates from Meta.",
      });
    } finally {
      setSyncing(false);
    }
  };

  const openDeleteModal = (template: Template) => {
    setSelectedTemplate(template);
    setDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (!deleting) {
      setDeleteModal(false);
      setSelectedTemplate(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;

    try {
      setDeleting(true);

      await whatsappApi.deleteTemplate(selectedTemplate.id);

      setTemplates((prev) =>
        prev.filter((item) => item.id !== selectedTemplate.id)
      );

      setDeleteModal(false);
      setSelectedTemplate(null);

      setAlert({
        type: "success",
        message: "Template deleted successfully.",
      });
    } catch (err) {
      console.error("Failed to delete template", err);

      setAlert({
        type: "danger",
        message: "Failed to delete template.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <div>
                <h4 className="mb-sm-0">WhatsApp Message Templates</h4>
                <p className="text-muted mb-0 mt-1">
                  Pre-approved Meta templates for Outbound Notifications & Broadcasts
                </p>
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
                  onClick={() => navigate("/whatsapp/templates/new")}
                >
                  <i className="ri-add-line me-1"></i>
                  New Template
                </button>
              </div>
            </div>
          </div>
        </div>

        {alert && (
          <div className="row">
            <div className="col-12">
              <Alert
                color={alert.type}
                toggle={() => setAlert(null)}
              >
                {alert.message}
              </Alert>
            </div>
          </div>
        )}

        <div className="row mb-3">
          <div className="col-md-6 d-flex gap-2">
            <button
              className={`btn btn-sm ${
                categoryFilter === "" ? "btn-primary" : "btn-light"
              }`}
              onClick={() => setCategoryFilter("")}
            >
              All Categories
            </button>

            <button
              className={`btn btn-sm ${
                categoryFilter === "MARKETING" ? "btn-primary" : "btn-light"
              }`}
              onClick={() => setCategoryFilter("MARKETING")}
            >
              Marketing
            </button>

            <button
              className={`btn btn-sm ${
                categoryFilter === "UTILITY" ? "btn-primary" : "btn-light"
              }`}
              onClick={() => setCategoryFilter("UTILITY")}
            >
              Utility
            </button>

            <button
              className={`btn btn-sm ${
                categoryFilter === "AUTHENTICATION" ? "btn-primary" : "btn-light"
              }`}
              onClick={() => setCategoryFilter("AUTHENTICATION")}
            >
              Authentication
            </button>
          </div>
        </div>

        <div className="row">
          {loading ? (
            <div className="col-12 text-center py-5 text-muted">
              Loading templates...
            </div>
          ) : templates.length === 0 ? (
            <div className="col-12 text-center py-5 text-muted">
              No message templates found. Click "Sync from Meta" to import.
            </div>
          ) : (
            templates.map((tpl) => (
              <div className="col-xl-4 col-md-6 mb-4" key={tpl.id}>
                <div className="card h-100 shadow-sm border">
                  <div className="card-header bg-light d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="card-title mb-0 fs-14 fw-bold">
                        {tpl.name}
                      </h6>

                      <small className="text-muted">
                        {tpl.language} • {tpl.category}
                      </small>
                    </div>

                    <div className="d-flex align-items-center gap-2">
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

                      <button
                        type="button"
                        className="btn btn-sm btn-subtle-danger"
                        onClick={() => openDeleteModal(tpl)}
                        title="Delete Template"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </div>

                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      {tpl.header_type === "TEXT" && tpl.header_content && (
                        <div className="fw-bold fs-13 mb-2 text-dark">
                          {tpl.header_content}
                        </div>
                      )}

                      {tpl.header_type === "IMAGE" && tpl.header_content && (
                        <img
                          src={tpl.header_content}
                          alt={tpl.name}
                          className="w-100 rounded mb-2"
                          style={{
                            maxHeight: 140,
                            objectFit: "cover",
                          }}
                        />
                      )}

                      {tpl.header_type === "VIDEO" && tpl.header_content && (
                        <video
                          src={tpl.header_content}
                          controls
                          className="w-100 rounded mb-2"
                          style={{ maxHeight: 140 }}
                        />
                      )}

                      {tpl.header_type === "PDF" && tpl.header_content && (
                        <a
                          href={tpl.header_content}
                          target="_blank"
                          rel="noreferrer"
                          className="d-flex align-items-center gap-2 border rounded p-2 mb-2 text-decoration-none"
                        >
                          <i className="ri-file-pdf-line fs-20 text-danger"></i>
                          <small className="text-truncate">
                            View attached PDF
                          </small>
                        </a>
                      )}

                      {!tpl.header_type && tpl.header_content && (
                        <div className="fw-bold fs-13 mb-2 text-dark">
                          {tpl.header_content}
                        </div>
                      )}

                      <p
                        className="fs-13 text-secondary mb-3"
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        {tpl.body_text}
                      </p>

                      {tpl.footer_text && (
                        <small className="text-muted d-block mb-3">
                          {tpl.footer_text}
                        </small>
                      )}
                    </div>

                    {tpl.buttons && tpl.buttons.length > 0 && (
                      <div className="border-top pt-2 d-flex flex-wrap gap-1">
                        {tpl.buttons.map((b: any, i: number) => (
                          <span
                            key={i}
                            className="badge bg-light text-primary border"
                          >
                            <i className="ri-share-forward-line me-1"></i>
                            {b.text || "Quick Reply"}
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
      </div>

      <Modal
        isOpen={deleteModal}
        toggle={closeDeleteModal}
        centered
      >
        <ModalHeader toggle={closeDeleteModal}>
          Delete Template
        </ModalHeader>

        <ModalBody>
          <div className="text-center">
            <div className="avatar-md mx-auto mb-3">
              <div className="avatar-title bg-danger-subtle text-danger rounded-circle fs-24">
                <i className="ri-delete-bin-line"></i>
              </div>
            </div>

            <h5 className="mb-2">Are you sure?</h5>

            <p className="text-muted mb-0">
              Do you really want to delete{" "}
              <strong>{selectedTemplate?.name}</strong>?
            </p>

            <p className="text-muted mt-1 mb-0">
              This action cannot be undone.
            </p>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            color="light"
            onClick={closeDeleteModal}
            disabled={deleting}
          >
            Cancel
          </Button>

          <Button
            color="danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Spinner size="sm" className="me-1" />
                Deleting...
              </>
            ) : (
              <>
                <i className="ri-delete-bin-line me-1"></i>
                Delete
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default WhatsAppTemplates;