import React, { useState, useEffect } from "react";
import {
  Container, Row, Col, Card, Alert, CardBody,
  Button, Label, Input, FormFeedback, Form,
} from "reactstrap";

import * as Yup from "yup";
import { useFormik } from "formik";

import avatar from "../../assets/images/users/avatar-1.jpg";

const UserProfile = () => {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("1");
  const [userName, setUserName] = useState("");
  const [success, setSuccess] = useState(false);

  // Load from sessionStorage on mount (Laravel format: obj.user.name / obj.user.email)
  useEffect(() => {
    const stored = sessionStorage.getItem("authUser");
    if (stored) {
      try {
        const obj = JSON.parse(stored);
        if (obj?.user) {
          setUserName(obj.user.name || "");
          setEmail(obj.user.email || "");
          setUserId(String(obj.user.id || "1"));
        }
      } catch (_) {}
    }
  }, []);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: userName || "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Please enter your name"),
    }),
    onSubmit: (values) => {
      // Update sessionStorage locally
      const stored = sessionStorage.getItem("authUser");
      if (stored) {
        try {
          const obj = JSON.parse(stored);
          if (obj?.user) {
            obj.user.name = values.name;
            sessionStorage.setItem("authUser", JSON.stringify(obj));
            setUserName(values.name);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
          }
        } catch (_) {}
      }
    },
  });

  document.title = "Profile | WhatsApp SaaS";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row>
            <Col lg="12">
              {success && (
                <Alert color="success">Name updated to <strong>{userName}</strong> successfully!</Alert>
              )}

              <Card>
                <CardBody>
                  <div className="d-flex align-items-center">
                    <div className="mx-3">
                      <img
                        src={avatar}
                        alt="Avatar"
                        className="avatar-md rounded-circle img-thumbnail"
                      />
                    </div>
                    <div className="flex-grow-1 align-self-center">
                      <div className="text-muted">
                        <h5 className="mb-1">{userName || "—"}</h5>
                        <p className="mb-1">
                          <i className="ri-mail-line me-1"></i>{email || "—"}
                        </p>
                        <p className="mb-0 fs-12">
                          <i className="ri-user-line me-1"></i>User ID: #{userId}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <h4 className="card-title mb-4">Update Name</h4>

          <Card>
            <CardBody>
              <Form
                className="form-horizontal"
                onSubmit={(e) => {
                  e.preventDefault();
                  validation.handleSubmit();
                }}
              >
                <div className="form-group">
                  <Label className="form-label">Display Name</Label>
                  <Input
                    name="name"
                    className="form-control"
                    placeholder="Enter your name"
                    type="text"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.name || ""}
                    invalid={validation.touched.name && !!validation.errors.name}
                  />
                  {validation.touched.name && validation.errors.name && (
                    <FormFeedback type="invalid">{validation.errors.name}</FormFeedback>
                  )}
                </div>
                <div className="text-center mt-4">
                  <Button type="submit" color="primary">
                    Update Name
                  </Button>
                </div>
              </Form>
            </CardBody>
          </Card>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default UserProfile;
