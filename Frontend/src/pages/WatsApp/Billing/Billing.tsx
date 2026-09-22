import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card, CardBody, Row, Col, Badge, Table,
  Modal, ModalHeader, ModalBody, ModalFooter, Button
} from "reactstrap";

// ── Sample data (replace with real API calls later) ───────────────────────────
const transactions = [
  { id: "TXN-001", date: "21 Sep 2026", description: "Marketing Conversations", messages: 450, cost: "₹225.00", category: "marketing" },
  { id: "TXN-002", date: "20 Sep 2026", description: "Utility Conversations",   messages: 120, cost: "₹36.00",  category: "utility" },
  { id: "TXN-003", date: "19 Sep 2026", description: "Authentication Conversations", messages: 80, cost: "₹40.00", category: "authentication" },
  { id: "TXN-004", date: "18 Sep 2026", description: "Marketing Conversations", messages: 320, cost: "₹160.00", category: "marketing" },
  { id: "TXN-005", date: "15 Sep 2026", description: "Utility Conversations",   messages: 200, cost: "₹60.00",  category: "utility" },
  { id: "TXN-006", date: "14 Sep 2026", description: "Service / Inbound",       messages: 95,  cost: "Free",    category: "service" },
];

const categoryColor: Record<string, string> = {
  marketing:      "primary",
  utility:        "info",
  authentication: "warning",
  service:        "success",
};

// ─────────────────────────────────────────────────────────────────────────────

const Billing: React.FC = () => {
  const [payModal, setPayModal] = useState(false);

  // These numbers would come from your backend / Meta API in production
  const usedThisMonth = 521.00;
  const totalMessages = 1265;

  const handleGoToMeta = () => {
    window.open("https://business.facebook.com/billing", "_blank", "noopener,noreferrer");
    setPayModal(false);
  };

  return (
    <div className="page-content">
      <div className="container-fluid">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <div>
                <h4 className="mb-sm-0">Billing & Usage</h4>
                <p className="text-muted mb-0 mt-1">
                  Your WhatsApp messaging costs are billed directly by Meta to your account.
                </p>
              </div>
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item"><Link to="/dashboard">Home</Link></li>
                <li className="breadcrumb-item active">Billing</li>
              </ol>
            </div>
          </div>
        </div>

        {/* ── Top Cards ────────────────────────────────────────────────────── */}
        <Row className="mb-4">

          {/* Usage This Month */}
          <Col xl={4} md={6}>
            <Card className="card-animate border-0 shadow-sm">
              <CardBody>
                <div className="d-flex align-items-start justify-content-between">
                  <div>
                    <p className="text-uppercase fw-medium text-muted mb-1 fs-12">Estimated Cost This Month</p>
                    <h2 className="mt-2 ff-secondary fw-bold">₹{usedThisMonth.toFixed(2)}</h2>
                    <p className="text-muted mb-0 fs-13">
                      <i className="ri-message-3-line text-primary me-1"></i>
                      {totalMessages.toLocaleString()} conversations billed
                    </p>
                  </div>
                  <div className="avatar-sm flex-shrink-0">
                    <span className="avatar-title bg-primary-subtle rounded fs-2 text-primary">
                      <i className="ri-bar-chart-grouped-line"></i>
                    </span>
                  </div>
                </div>
                <div className="alert alert-warning p-2 fs-12 mb-0 mt-3">
                  <i className="ri-information-line me-1"></i>
                  This is an <strong>estimate</strong>. Actual charges appear on your Meta Business account.
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* Pay via Meta */}
          <Col xl={4} md={6}>
            <Card className="card-animate border-0 shadow-sm">
              <CardBody>
                <div className="d-flex align-items-start justify-content-between">
                  <div>
                    <p className="text-uppercase fw-medium text-muted mb-1 fs-12">Payment</p>
                    <h5 className="mt-2 fw-semibold">Pay directly to Meta</h5>
                    <p className="text-muted mb-0 fs-13">
                      All WhatsApp charges are billed by Meta to your Business account.
                      Click below to view your bill or add funds.
                    </p>
                  </div>
                  <div className="avatar-sm flex-shrink-0">
                    <span className="avatar-title bg-info-subtle rounded fs-2 text-info">
                      <i className="ri-secure-payment-line"></i>
                    </span>
                  </div>
                </div>
                <button
                  className="btn btn-primary w-100 mt-3"
                  onClick={() => setPayModal(true)}
                >
                  <i className="ri-external-link-line me-1"></i>
                  Go to Meta Billing
                </button>
              </CardBody>
            </Card>
          </Col>

          {/* Billing Mode */}
          <Col xl={4} md={12}>
            <Card className="card-animate border-0 shadow-sm h-100">
              <CardBody>
                <h6 className="fw-semibold mb-3">
                  <i className="ri-price-tag-3-line me-1 text-primary"></i>
                  Meta Conversation Pricing (INR)
                </h6>
                <div className="table-responsive">
                  <table className="table table-sm table-borderless mb-0 fs-13">
                    <tbody>
                      <tr>
                        <td className="text-muted ps-0">
                          <span className="badge bg-primary-subtle text-primary me-1">Marketing</span>
                        </td>
                        <td className="fw-medium text-end">₹0.50 / conversation</td>
                      </tr>
                      <tr>
                        <td className="text-muted ps-0">
                          <span className="badge bg-info-subtle text-info me-1">Utility</span>
                        </td>
                        <td className="fw-medium text-end">₹0.30 / conversation</td>
                      </tr>
                      <tr>
                        <td className="text-muted ps-0">
                          <span className="badge bg-warning-subtle text-warning me-1">Authentication</span>
                        </td>
                        <td className="fw-medium text-end">₹0.50 / conversation</td>
                      </tr>
                      <tr>
                        <td className="text-muted ps-0">
                          <span className="badge bg-success-subtle text-success me-1">Service (inbound)</span>
                        </td>
                        <td className="fw-medium text-end text-success fw-bold">Free</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <a
                  href="https://developers.facebook.com/docs/whatsapp/pricing"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-outline-secondary w-100 mt-2"
                >
                  <i className="ri-external-link-line me-1"></i>
                  View Official Meta Rates
                </a>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* ── Usage Breakdown ───────────────────────────────────────────────── */}
        <Row className="mb-4">
          {[
            { label: "Marketing",      count: 770,  cost: "₹385.00", color: "primary" },
            { label: "Utility",        count: 320,  cost: "₹96.00",  color: "info" },
            { label: "Authentication", count: 80,   cost: "₹40.00",  color: "warning" },
            { label: "Service / Free", count: 95,   cost: "₹0.00",   color: "success" },
          ].map((item, i) => (
            <Col md={3} key={i}>
              <Card className="border mb-0">
                <CardBody className="p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 fs-13">{item.label}</p>
                      <h5 className="mb-0 fw-bold">{item.count.toLocaleString()}</h5>
                      <small className="text-muted">conversations</small>
                    </div>
                    <div>
                      <h6 className={`text-${item.color} mb-0 fw-bold`}>{item.cost}</h6>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>

        {/* ── Usage History Table ───────────────────────────────────────────── */}
        <Card>
          <CardBody>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title mb-0">
                <i className="ri-history-line me-1 text-primary"></i>
                Usage History
              </h5>
              <button className="btn btn-sm btn-outline-success">
                <i className="ri-download-2-line me-1"></i> Export CSV
              </button>
            </div>
            <div className="table-responsive">
              <Table className="table-hover table-borderless align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Ref</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Conversations</th>
                    <th>Estimated Cost</th>
                    <th>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td><code className="fs-12">{t.id}</code></td>
                      <td className="text-muted fs-13">{t.date}</td>
                      <td>{t.description}</td>
                      <td className="text-muted">{t.messages}</td>
                      <td className={`fw-medium ${t.cost === "Free" ? "text-success" : ""}`}>{t.cost}</td>
                      <td>
                        <Badge color={categoryColor[t.category]} className="text-capitalize">
                          {t.category}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div className="border-top pt-3 mt-3 d-flex justify-content-between align-items-center">
              <p className="text-muted mb-0 fs-13">
                <i className="ri-information-line me-1"></i>
                Costs shown are estimates based on Meta's standard rates. Actual charges may differ.
              </p>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => setPayModal(true)}
              >
                <i className="ri-external-link-line me-1"></i>
                Pay via Meta
              </button>
            </div>
          </CardBody>
        </Card>

        {/* ── Meta Redirect Modal ───────────────────────────────────────────── */}
        <Modal isOpen={payModal} toggle={() => setPayModal(false)} centered>
          <ModalHeader toggle={() => setPayModal(false)}>
            <i className="ri-secure-payment-line me-2 text-primary"></i>
            Pay via Meta Business Manager
          </ModalHeader>
          <ModalBody>
            <div className="text-center mb-4">
              <div className="avatar-lg mx-auto mb-3">
                <div className="avatar-title bg-primary-subtle rounded-circle fs-1 text-primary">
                  <i className="ri-external-link-line"></i>
                </div>
              </div>
              <h5>You're being redirected to Meta</h5>
              <p className="text-muted mb-0">
                WhatsApp Business API charges are billed <strong>directly by Meta</strong> to your
                Business account. You'll be taken to Meta Business Manager where you can:
              </p>
            </div>

            <ul className="list-unstyled mb-3">
              <li className="mb-2">
                <i className="ri-check-line text-success me-2 fs-15"></i>
                View your current bill and payment history
              </li>
              <li className="mb-2">
                <i className="ri-check-line text-success me-2 fs-15"></i>
                Add or update your payment method
              </li>
              <li className="mb-2">
                <i className="ri-check-line text-success me-2 fs-15"></i>
                Add prepaid credits to your Meta account
              </li>
              <li className="mb-2">
                <i className="ri-check-line text-success me-2 fs-15"></i>
                Download invoices
              </li>
            </ul>

            <div className="alert alert-info p-2 fs-12 mb-0">
              <i className="ri-information-line me-1"></i>
              Make sure you're logged into the <strong>correct Facebook/Meta account</strong> that owns your WhatsApp Business Account (WABA).
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="light" onClick={() => setPayModal(false)}>Cancel</Button>
            <Button color="primary" onClick={handleGoToMeta}>
              <i className="ri-external-link-line me-1"></i>
              Open Meta Business Manager
            </Button>
          </ModalFooter>
        </Modal>

      </div>
    </div>
  );
};

export default Billing;
