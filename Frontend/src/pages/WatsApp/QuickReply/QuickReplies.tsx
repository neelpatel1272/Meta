import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Card, CardBody, CardHeader, Col, Container, Input, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner } from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import quickReplyApi, { QuickReply } from "../../../services/Quickreplyapi";

const QuickReplies: React.FC = () => {
  const navigate = useNavigate();
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [alert, setAlert] = useState<{ type: "success" | "danger"; message: string } | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedReply, setSelectedReply] = useState<QuickReply | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadQuickReplies = async () => {
    try {
      setLoading(true);
      const res = await quickReplyApi.getQuickReplies(
        search.trim() ? { search: search.trim() } : undefined
      );
      setQuickReplies(res.data.data || []);
    } catch (error) {
      console.error("Failed to load quick replies", error);
      setAlert({
        type: "danger",
        message: "Failed to load quick replies.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadQuickReplies();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const openDeleteModal = (reply: QuickReply) => {
    setSelectedReply(reply);
    setDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (!deleting) {
      setDeleteModal(false);
      setSelectedReply(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedReply) return;

    try {
      setDeleting(true);

      await quickReplyApi.deleteQuickReply(selectedReply.id);

      setQuickReplies((prev) =>
        prev.filter((item) => item.id !== selectedReply.id)
      );

      setDeleteModal(false);
      setSelectedReply(null);

      setAlert({
        type: "success",
        message: "Quick reply deleted successfully.",
      });
    } catch (error) {
      console.error("Failed to delete quick reply", error);
      setAlert({
        type: "danger",
        message: "Failed to delete quick reply.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const getHeaderText = (reply: QuickReply) => {
    if (!reply.header_type || reply.header_type === "NONE") {
      return "None";
    }

    if (reply.header_type === "TEXT") {
      return reply.header_content || "Text";
    }

    return reply.header_type;
  };

  const getButtonText = (reply: QuickReply) => {
    if (!reply.button_type || reply.button_type === "NONE") {
      return "None";
    }

    if (reply.buttons && reply.buttons.length > 0) {
      return reply.buttons.map((button) => button.text).join(", ");
    }

    return reply.button_type;
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Quick Replies" pageTitle="WhatsApp" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="border-bottom">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div>
                    <h5 className="card-title mb-1">Quick Replies</h5>
                    <p className="text-muted mb-0">
                      Manage your saved WhatsApp quick replies
                    </p>
                  </div>

                  <Button
                    color="success"
                    onClick={() => navigate("/quick-replies/create")}
                  >
                    <i className="ri-add-line me-1"></i>
                    Add Quick Reply
                  </Button>
                </div>
              </CardHeader>

              <CardBody>
                {alert && (
                  <Alert
                    color={alert.type}
                    toggle={() => setAlert(null)}
                    className="mb-3"
                  >
                    {alert.message}
                  </Alert>
                )}

                <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                  <div
                    className="search-box position-relative"
                    style={{ width: "300px" }}
                  >
                    <Input
                      type="text"
                      placeholder="Search quick replies..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="form-control"
                    />
                    <i className="ri-search-line search-icon position-absolute top-50 translate-middle-y end-0 me-3 text-muted"></i>
                  </div>

                  <span className="badge bg-light text-muted fs-12">
                    Total: {quickReplies.length} Quick Replies
                  </span>
                </div>

                <div className="table-responsive">
                  <table className="table align-middle table-nowrap mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Quick Reply</th>
                        {/* <th>Reply Text</th> */}
                        {/* <th>Header</th> */}
                        <th>Button Type</th>
                        {/* <th>Footer</th> */}
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="text-center py-5">
                            <Spinner size="sm" color="primary" className="me-2" />
                            <span className="text-muted">
                              Loading quick replies...
                            </span>
                          </td>
                        </tr>
                      ) : quickReplies.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-5">
                            <div className="avatar-md mx-auto mb-3">
                              <div className="avatar-title bg-primary-subtle text-primary rounded-circle fs-24">
                                <i className="ri-message-3-line"></i>
                              </div>
                            </div>
                            <h5 className="mb-1">No Quick Replies Found</h5>
                            <p className="text-muted mb-3">
                              Create your first quick reply to get started.
                            </p>
                            <Button
                              color="success"
                              onClick={() =>
                                navigate("/quick-replies/create")
                              }
                            >
                              <i className="ri-add-line me-1"></i>
                              Add Quick Reply
                            </Button>
                          </td>
                        </tr>
                      ) : (
                        quickReplies.map((reply, index) => (
                          <tr key={reply.id}>
                            <td>{index + 1}</td>

                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div className="avatar-xs rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center fw-bold">
                                  <i className="ri-message-3-line"></i>
                                </div>

                                <div>
                                  <h6 className="mb-0 fs-14">
                                    {reply.name}
                                  </h6>
                                </div>
                              </div>
                            </td>

                            {/* <td>
                              <div
                                className="text-muted"
                                style={{
                                  maxWidth: "300px",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                                title={reply.reply_text}
                              >
                                {reply.reply_text}
                              </div>
                            </td> */}

                           {/* <td>
                            {reply.header_type === "NONE" || !reply.header_type ? (
                                <span className="text-muted">—</span>
                            ) : reply.header_type === "IMAGE" && reply.header_content ? (
                                <img
                                src={reply.header_content}
                                alt="Header"
                                style={{
                                    width: "50px",
                                    height: "50px",
                                    objectFit: "cover",
                                    borderRadius: "6px",
                                }}
                                />
                            ) : (
                                <span className="badge bg-info-subtle text-info">
                                {getHeaderText(reply)}
                                </span>
                            )}
                        </td> */}

                        
                            <td>
                              {reply.button_type === "NONE" ||
                              !reply.button_type ? (
                                <span className="text-muted">—</span>
                              ) : (
                                <span className="badge bg-primary-subtle text-primary">
                                  {getButtonText(reply)}
                                </span>
                              )}
                            </td>

                            {/* <td>
                              {reply.footer_text ? (
                                <span className="text-muted">
                                  {reply.footer_text}
                                </span>
                              ) : (
                                "—"
                              )}
                            </td> */}

                            <td>
                              <div className="d-flex gap-2">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-subtle-primary"
                                  onClick={() =>
                                    navigate(
                                      `/quick-replies/edit/${reply.id}`
                                    )
                                  }
                                  title="Edit Quick Reply"
                                >
                                  <i className="ri-edit-line"></i>
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-sm btn-subtle-danger"
                                  onClick={() => openDeleteModal(reply)}
                                  title="Delete Quick Reply"
                                >
                                  <i className="ri-delete-bin-line"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal
        isOpen={deleteModal}
        toggle={closeDeleteModal}
        centered
      >
        <ModalHeader toggle={closeDeleteModal}>
          Delete Quick Reply
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
              <strong>{selectedReply?.name}</strong>?
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

export default QuickReplies;