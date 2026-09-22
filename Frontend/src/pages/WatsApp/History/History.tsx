import React from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, Table, Badge, Row, Col } from "reactstrap";

const sampleMessages = [
  { id: 1, to: "+91 98765 43210", name: "Ravi Kumar", type: "Template", template: "order_confirmation", status: "delivered", time: "Today, 10:32 AM" },
  { id: 2, to: "+91 87654 32109", name: "Priya Sharma", type: "Text", template: "—", status: "read", time: "Today, 09:15 AM" },
  { id: 3, to: "+91 76543 21098", name: "Arjun Singh", type: "Template", template: "shipping_update", status: "sent", time: "Yesterday, 5:44 PM" },
  { id: 4, to: "+91 65432 10987", name: "Meena Patel", type: "Template", template: "welcome_message", status: "failed", time: "Yesterday, 3:20 PM" },
  { id: 5, to: "+91 54321 09876", name: "Kiran Reddy", type: "Text", template: "—", status: "delivered", time: "21 Sep, 11:00 AM" },
  { id: 6, to: "+91 43210 98765", name: "Sunita Joshi", type: "Template", template: "payment_reminder", status: "read", time: "21 Sep, 08:30 AM" },
  { id: 7, to: "+91 32109 87654", name: "Deepak Verma", type: "Media", template: "—", status: "delivered", time: "20 Sep, 4:10 PM" },
  { id: 8, to: "+91 21098 76543", name: "Anjali Nair", type: "Template", template: "order_confirmation", status: "sent", time: "20 Sep, 2:05 PM" },
];

const statusColor: Record<string, string> = {
  delivered: "success",
  read: "info",
  sent: "warning",
  failed: "danger",
};

const History: React.FC = () => {
  return (
    <div className="page-content">
      <div className="container-fluid">
        {/* Header */}
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <div>
                <h4 className="mb-sm-0">Message History</h4>
                <p className="text-muted mb-0 mt-1">View all outbound messages sent from your WhatsApp number</p>
              </div>
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item"><Link to="/dashboard">Home</Link></li>
                <li className="breadcrumb-item active">History</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Stats */}
        <Row className="mb-4">
          {[
            { label: "Total Sent", value: "1,284", icon: "ri-send-plane-line", color: "primary" },
            { label: "Delivered", value: "1,198", icon: "ri-check-double-line", color: "success" },
            { label: "Read", value: "943", icon: "ri-eye-line", color: "info" },
            { label: "Failed", value: "86", icon: "ri-close-circle-line", color: "danger" },
          ].map((s, i) => (
            <Col md={3} key={i}>
              <Card className="card-animate">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="fw-medium text-muted mb-0">{s.label}</p>
                      <h2 className="mt-4 ff-secondary fw-semibold">{s.value}</h2>
                    </div>
                    <div className={`avatar-sm flex-shrink-0`}>
                      <span className={`avatar-title bg-${s.color}-subtle rounded fs-3 text-${s.color}`}>
                        <i className={s.icon}></i>
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Filters */}
        <Card>
          <CardBody>
            <Row className="g-3 align-items-end">
              <Col md={3}>
                <label className="form-label">Search Contact</label>
                <input className="form-control" placeholder="Name or phone number..." />
              </Col>
              <Col md={2}>
                <label className="form-label">Status</label>
                <select className="form-select">
                  <option value="">All</option>
                  <option>sent</option>
                  <option>delivered</option>
                  <option>read</option>
                  <option>failed</option>
                </select>
              </Col>
              <Col md={2}>
                <label className="form-label">Type</label>
                <select className="form-select">
                  <option value="">All</option>
                  <option>Template</option>
                  <option>Text</option>
                  <option>Media</option>
                </select>
              </Col>
              <Col md={3}>
                <label className="form-label">Date Range</label>
                <input className="form-control" type="date" />
              </Col>
              <Col md={2}>
                <button className="btn btn-primary w-100">
                  <i className="ri-filter-line me-1"></i> Filter
                </button>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Table */}
        <Card>
          <CardBody>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title mb-0">Sent Messages</h5>
              <button className="btn btn-sm btn-outline-success">
                <i className="ri-download-2-line me-1"></i> Export CSV
              </button>
            </div>
            <div className="table-responsive">
              <Table className="table-hover table-borderless align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Contact</th>
                    <th>Phone</th>
                    <th>Type</th>
                    <th>Template</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleMessages.map((msg) => (
                    <tr key={msg.id}>
                      <td className="text-muted fs-13">{msg.id}</td>
                      <td className="fw-medium">{msg.name}</td>
                      <td className="text-muted">{msg.to}</td>
                      <td>
                        <span className={`badge bg-${msg.type === "Template" ? "primary" : msg.type === "Media" ? "warning" : "secondary"}-subtle text-${msg.type === "Template" ? "primary" : msg.type === "Media" ? "warning" : "secondary"}`}>
                          {msg.type}
                        </span>
                      </td>
                      <td className="text-muted fs-13">{msg.template}</td>
                      <td>
                        <Badge color={statusColor[msg.status]} className="text-capitalize">
                          {msg.status}
                        </Badge>
                      </td>
                      <td className="text-muted fs-13">{msg.time}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            {/* Pagination */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <p className="text-muted mb-0">Showing 1–8 of 1,284 messages</p>
              <ul className="pagination pagination-sm mb-0">
                <li className="page-item disabled"><button className="page-link">Previous</button></li>
                <li className="page-item active"><button className="page-link">1</button></li>
                <li className="page-item"><button className="page-link">2</button></li>
                <li className="page-item"><button className="page-link">3</button></li>
                <li className="page-item"><button className="page-link">Next</button></li>
              </ul>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default History;
