import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import whatsappApi from "../../services/whatsappApi";

interface AnalyticsKpis {
  total_sent: number;
  total_delivered: number;
  total_read: number;
  delivery_rate: number;
  read_rate: number;
  total_contacts: number;
  active_conversations: number;
  total_campaigns: number;
}

interface AnalyticsTrend {
  date: string;
  sent: number;
  received: number;
}

interface AnalyticsData {
  kpis: AnalyticsKpis;
  trend: AnalyticsTrend[];
}

const DashboardEcommerce: React.FC = () => {
  document.title = "WhatsApp SaaS Dashboard | Direct-to-Meta";

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    whatsappApi
      .getAnalyticsOverview()
      .then((res: any) => {
        setAnalytics(res.data.data);
      })
      .catch((err: any) => {
        console.error("Failed to load analytics", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const kpis: AnalyticsKpis = analytics?.kpis || {
    total_sent: 0,
    total_delivered: 0,
    total_read: 0,
    delivery_rate: 100,
    read_rate: 0,
    total_contacts: 0,
    active_conversations: 0,
    total_campaigns: 0,
  };

  return (
    <div className="page-content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <div>
                <h4 className="mb-sm-0">WhatsApp Business Dashboard</h4>
              </div>
              <div className="page-title-right d-flex gap-2">
                <Link to="/whatsapp-setup" className="btn btn-outline-success btn-sm">
                  <i className="ri-settings-line me-1"></i>
                  WhatsApp Setup
                </Link>
                <Link to="/inbox" className="btn btn-success btn-sm">
                  <i className="ri-chat-1-line me-1"></i>
                  Open Inbox
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="alert alert-info alert-dismissible fade show border-0 mb-4" role="alert">
          <div className="d-flex align-items-center">
            <div className="fs-24 me-3">
              <i className="ri-shield-check-line text-info"></i>
            </div>
            <div>
              <h5 className="alert-heading fs-14 mb-1">
                Tech Provider Architecture (Model 1) Active
              </h5>
              <p className="mb-0 text-muted fs-12">
                All WhatsApp conversation and per-message costs are billed directly to the client's Meta Business Account. No wallet recharge or credit prepayment is required.
              </p>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-3 col-md-6">
            <div className="card card-animate">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1 overflow-hidden">
                    <p className="text-uppercase fw-medium text-muted text-truncate mb-0 fs-12">
                      Total Outbound Sent
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="avatar-sm rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center">
                      <i className="ri-send-plane-fill fs-18"></i>
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-end justify-content-between mt-3">
                  <div>
                    <h4 className="fs-22 fw-semibold ff-secondary mb-1">
                      {loading ? "..." : kpis.total_sent}
                    </h4>
                    <span className="text-muted fs-12">Total transmitted messages</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card card-animate">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1 overflow-hidden">
                    <p className="text-uppercase fw-medium text-muted text-truncate mb-0 fs-12">
                      Delivered ({kpis.delivery_rate}%)
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="avatar-sm rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center">
                      <i className="ri-checkbox-circle-line fs-18"></i>
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-end justify-content-between mt-3">
                  <div>
                    <h4 className="fs-22 fw-semibold ff-secondary mb-1 text-success">
                      {loading ? "..." : kpis.total_delivered}
                    </h4>
                    <span className="text-muted fs-12">Confirmed WhatsApp delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card card-animate">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1 overflow-hidden">
                    <p className="text-uppercase fw-medium text-muted text-truncate mb-0 fs-12">
                      Read Rate ({kpis.read_rate}%)
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="avatar-sm rounded-circle bg-info-subtle text-info d-flex align-items-center justify-content-center">
                      <i className="ri-check-double-line fs-18"></i>
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-end justify-content-between mt-3">
                  <div>
                    <h4 className="fs-22 fw-semibold ff-secondary mb-1 text-info">
                      {loading ? "..." : kpis.total_read}
                    </h4>
                    <span className="text-muted fs-12">Read receipts received</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card card-animate">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1 overflow-hidden">
                    <p className="text-uppercase fw-medium text-muted text-truncate mb-0 fs-12">
                      Contacts Directory
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="avatar-sm rounded-circle bg-warning-subtle text-warning d-flex align-items-center justify-content-center">
                      <i className="ri-contacts-book-line fs-18"></i>
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-end justify-content-between mt-3">
                  <div>
                    <h4 className="fs-22 fw-semibold ff-secondary mb-1">
                      {loading ? "..." : kpis.total_contacts}
                    </h4>
                    <span className="text-muted fs-12">Registered audience members</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-8">
            <div className="card">
              <div className="card-header border-bottom d-flex align-items-center justify-content-between">
                <h5 className="card-title mb-0">7-Day Messaging Volume</h5>
                <span className="badge bg-light text-muted">Sent vs Inbound</span>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover table-nowrap align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Outbound Sent</th>
                        <th>Inbound Received</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics?.trend?.map((t: AnalyticsTrend, idx: number) => (
                        <tr key={idx}>
                          <td>{t.date}</td>
                          <td>
                            <span className="badge bg-primary-subtle text-primary">
                              {t.sent} sent
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-success-subtle text-success">
                              {t.received} incoming
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-light text-success">
                              <i className="ri-checkbox-circle-line me-1"></i>
                              Synced
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-4">
            <div className="card">
              <div className="card-header border-bottom">
                <h5 className="card-title mb-0">Quick Modules</h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <Link to="/inbox" className="btn btn-outline-success text-start p-3">
                    <i className="ri-chat-3-line fs-18 me-2 align-middle"></i>
                    <strong>Live Inbox</strong>
                    <div className="small text-muted mt-1">
                      Reply to real-time incoming messages
                    </div>
                  </Link>

                  <Link to="/single-send" className="btn btn-outline-primary text-start p-3">
                    <i className="ri-flashlight-line fs-18 me-2 align-middle"></i>
                    <strong>Single Send</strong>
                    <div className="small text-muted mt-1">
                      Dispatch one-off messages or test templates
                    </div>
                  </Link>

                  <Link to="/campaigns" className="btn btn-outline-warning text-start p-3">
                    <i className="ri-megaphone-line fs-18 me-2 align-middle"></i>
                    <strong>Broadcast Campaigns</strong>
                    <div className="small text-muted mt-1">
                      Launch marketing and utility broadcasts
                    </div>
                  </Link>

                  <Link to="/templates" className="btn btn-outline-info text-start p-3">
                    <i className="ri-file-text-line fs-18 me-2 align-middle"></i>
                    <strong>Template Gallery</strong>
                    <div className="small text-muted mt-1">
                      View and sync Meta pre-approved templates
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardEcommerce;
