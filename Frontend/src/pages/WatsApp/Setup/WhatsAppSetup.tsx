import React from "react";

interface SetupStep {
  number: number;
  title: string;
  description: string;
  icon: string;
}

const WhatsAppSetup: React.FC = () => {
  const steps: SetupStep[] = [
    {
      number: 1,
      title: "Prepare Meta Business Account",
      description:
        "Ensure you have a verified Meta Business Manager account with admin access.",
      icon: "ri-building-line",
    },
    {
      number: 2,
      title: "Gather Business Details",
      description:
        "Have your legal business name, address, website, and a fresh phone number ready.",
      icon: "ri-shield-check-line",
    },
    {
      number: 3,
      title: "Complete Embedded Signup",
      description:
        "Click Connect WhatsApp. Meta will guide you through linking your WhatsApp Business Account.",
      icon: "ri-whatsapp-line",
    },
    {
      number: 4,
      title: "Verify Phone Number",
      description:
        "Enter the SMS or call verification code sent to your chosen phone number.",
      icon: "ri-smartphone-line",
    },
    {
      number: 5,
      title: "You're All Set!",
      description:
        "Your WhatsApp Business API is active. Build automations and start messaging.",
      icon: "ri-rocket-line",
    },
  ];

  const handleConnectWhatsApp = () => {
    console.log("Connect WhatsApp clicked");

    // We will implement Meta Embedded Signup here later.
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <div className="container-fluid">
          {/* Page Title */}
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                <div>
                  <h4 className="mb-sm-0">WhatsApp Business API</h4>

                  <p className="text-muted mb-0 mt-1">
                    Connect your number to Meta WhatsApp Business API
                  </p>
                </div>

                <div className="page-title-right">
                  <ol className="breadcrumb m-0">
                    <li className="breadcrumb-item">Settings</li>

                    <li className="breadcrumb-item active">WhatsApp Setup</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Main Row */}
          <div className="row">
            {/* LEFT COLUMN */}
            <div className="col-xl-8">
              {/* Connection Card */}
              <div className="card">
                <div className="card-body">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    {/* Account */}
                    <div className="d-flex align-items-center gap-3">
                      <div className="avatar-lg">
                        <div className="avatar-title rounded-circle bg-success-subtle text-success fs-2">
                          <i className="ri-whatsapp-line"></i>
                        </div>
                      </div>

                      <div>
                        <h5 className="fs-15 mb-1">
                          WhatsApp Business Account
                        </h5>

                        <p className="text-muted mb-0">Meta Embedded Signup</p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="d-flex align-items-center gap-3">
                      <span className="text-muted">
                        <i className="ri-checkbox-blank-circle-fill text-secondary fs-10 me-2"></i>
                        Not Connected
                      </span>

                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={handleConnectWhatsApp}
                      >
                        <i className="ri-whatsapp-line me-2"></i>
                        Connect WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tutorial Videos */}
              <div className="card">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between">
                    <h5 className="card-title mb-0">Tutorial Videos</h5>

                    <span className="badge bg-light text-muted">2 Videos</span>
                  </div>
                </div>

                <div className="card-body">
                  <div className="row g-3">
                    {[1, 2].map((video) => (
                      <div className="col-md-6" key={video}>
                        <div className="card border mb-0">
                          {/* Video Area */}
                          <div
                            className="position-relative bg-success"
                            style={{
                              height: "210px",
                              borderRadius: "5px 5px 0 0",
                            }}
                          >
                            {/* Play Button */}
                            <div className="position-absolute top-50 start-50 translate-middle">
                              <button
                                type="button"
                                className="btn btn-light rounded-circle"
                                style={{
                                  width: "56px",
                                  height: "56px",
                                }}
                              >
                                <i className="ri-play-fill fs-4"></i>
                              </button>
                            </div>

                            {/* Language */}
                            <span className="badge bg-primary position-absolute top-0 start-0 m-3">
                              {video === 1 ? "English" : "Hindi"}
                            </span>
                          </div>

                          {/* Video Content */}
                          <div className="card-body">
                            <h6 className="mb-2">
                              Complete WhatsApp Business API Setup Step by Step
                            </h6>

                            <p className="text-muted mb-0">
                              Learn how to set up your WhatsApp Business API and
                              connect your business number.
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="col-xl-4">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Setup Instructions</h5>
                </div>

                <div className="card-body">
                  {/* Steps */}
                  {steps.map((step, index) => (
                    <div
                      className="d-flex gap-3 position-relative"
                      key={step.number}
                    >
                      {/* Connecting Line */}
                      {index !== steps.length - 1 && (
                        <div
                          className="position-absolute"
                          style={{
                            left: "15px",
                            top: "36px",
                            bottom: "-10px",
                            borderLeft: "1px dashed var(--vz-border-color)",
                          }}
                        />
                      )}

                      {/* Step Number */}
                      <div
                        className={`avatar-sm flex-shrink-0 rounded-circle ${
                          step.number === 3
                            ? "bg-success-subtle text-success"
                            : "bg-light text-muted"
                        }`}
                      >
                        <div className="avatar-title rounded-circle bg-transparent">
                          {step.number}
                        </div>
                      </div>
                      {/* Step Content */}
                      <div className="pb-4">
                        <h6 className="mb-1">{step.title}</h6>

                        <p className="text-muted small mb-0">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Success Alert */}
                  <div className="alert alert-success mb-0">
                    <div className="d-flex gap-2">
                      <i className="ri-checkbox-circle-line fs-18"></i>

                      <div>
                        <strong>You're All Set!</strong>

                        <div className="small mt-1">
                          Your WhatsApp Business API is ready for messaging and
                          automation.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default WhatsAppSetup;
