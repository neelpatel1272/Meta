import React from "react";
import { Link } from "react-router-dom";

const WhatsAppInfo: React.FC = () => {
  return (
    <div className="page-content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <div>
                <h4 className="mb-sm-0">WhatsApp Account Info</h4>
                <p className="text-muted mb-0 mt-1">View your connected WhatsApp Business Account details</p>
              </div>
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item"><Link to="/dashboard">Home</Link></li>
                <li className="breadcrumb-item active">WhatsApp Info</li>
              </ol>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xl-8">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0"><i className="ri-whatsapp-line text-success me-2"></i>WhatsApp Business Account</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-borderless mb-0">
                    <tbody>
                      <tr>
                        <td className="fw-medium text-muted" style={{width:"200px"}}>Account Name</td>
                        <td>Nexus Retail WhatsApp</td>
                        <td><span className="badge bg-success">Connected</span></td>
                      </tr>
                      <tr>
                        <td className="fw-medium text-muted">WABA ID</td>
                        <td><code>109283746592817</code></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td className="fw-medium text-muted">Business ID</td>
                        <td><code>bm_882910482910</code></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td className="fw-medium text-muted">Phone Number</td>
                        <td>+91 98765 43210</td>
                        <td><span className="badge bg-success">Active</span></td>
                      </tr>
                      <tr>
                        <td className="fw-medium text-muted">Display Name</td>
                        <td>Nexus Retail Support</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td className="fw-medium text-muted">Quality Rating</td>
                        <td>
                          <span className="badge bg-success">GREEN</span>
                        </td>
                        <td></td>
                      </tr>
                      <tr>
                        <td className="fw-medium text-muted">Billing Mode</td>
                        <td>Direct-to-Meta (Client pays Meta)</td>
                        <td><span className="badge bg-info">Model 1</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Messaging Limits</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {[
                    {label:"Tier", value:"Tier 2 (10,000 msgs/day)", icon:"ri-bar-chart-line", color:"primary"},
                    {label:"Messages Today", value:"247", icon:"ri-send-plane-line", color:"success"},
                    {label:"Conversations Open", value:"18", icon:"ri-chat-3-line", color:"info"},
                    {label:"Account Status", value:"Active", icon:"ri-shield-check-line", color:"success"},
                  ].map((item, i) => (
                    <div className="col-md-3" key={i}>
                      <div className={`card border mb-0 border-${item.color}-subtle`}>
                        <div className="card-body text-center p-3">
                          <i className={`${item.icon} fs-24 text-${item.color} mb-2 d-block`}></i>
                          <h6 className="fs-13 text-muted mb-1">{item.label}</h6>
                          <p className="fw-bold mb-0 fs-14">{item.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-4">
            <div className="card">
              <div className="card-header"><h5 className="card-title mb-0">Quick Actions</h5></div>
              <div className="card-body d-grid gap-2">
                <Link to="/whatsapp-setup" className="btn btn-outline-success text-start">
                  <i className="ri-refresh-line me-2"></i> Reconnect / Update Account
                </Link>
                <Link to="/templates" className="btn btn-outline-primary text-start">
                  <i className="ri-file-text-line me-2"></i> View Templates
                </Link>
                <Link to="/inbox" className="btn btn-outline-info text-start">
                  <i className="ri-chat-3-line me-2"></i> Open Inbox
                </Link>
                <a href="https://business.facebook.com" target="_blank" rel="noreferrer" className="btn btn-outline-secondary text-start">
                  <i className="ri-external-link-line me-2"></i> Open Meta Business Manager
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default WhatsAppInfo;
