import React, { useEffect, useState } from "react";
import {
  Row, Col, CardBody, Card, Alert, Container,
  Input, Label, Form, FormFeedback, Button, Spinner
} from "reactstrap";

import * as Yup from "yup";
import { useFormik } from "formik";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { registerUser, resetRegisterFlag } from "../../slices/thunks";

import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import logoLight from "../../assets/images/logo-light.png";
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
import { createSelector } from "reselect";

const Register = () => {
  const [loader, setLoader] = useState<boolean>(false);
  const history = useNavigate();
  const dispatch: any = useDispatch();

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: "",
      first_name: "",
      password: "",
      confirm_password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Please enter a valid email").required("Please enter your email"),
      first_name: Yup.string().required("Please enter your username"),
      password: Yup.string().min(8, "Password must be at least 8 characters").required("Please enter your password"),
      confirm_password: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords do not match")
        .required("Please confirm your password"),
    }),
    onSubmit: (values) => {
      setLoader(true);
      dispatch(registerUser(values));
    },
  });

  const registerdatatype = createSelector(
    (state: any) => state.Account,
    (account) => ({
      success: account.success,
      error: account.error,
      registrationError: account.registrationError,
    })
  );

  const { error, success, registrationError } = useSelector(registerdatatype);

  useEffect(() => {
    if (success) {
      setLoader(false);
      setTimeout(() => history("/login"), 3000);
    }
    if (error) {
      setLoader(false);
    }
    setTimeout(() => {
      dispatch(resetRegisterFlag());
    }, 3000);
  }, [dispatch, success, error, history]);

  document.title = "Register | WhatsApp SaaS";

  return (
    <React.Fragment>
      <ParticlesAuth>
        <div className="auth-page-content mt-lg-5">
          <Container>
            <Row>
              <Col lg={12}>
                <div className="text-center mt-sm-5 mb-4 text-white-50">
                  <div>
                    <Link to="/" className="d-inline-block auth-logo">
                      <img src={logoLight} alt="" height="20" />
                    </Link>
                  </div>
                  <p className="mt-3 fs-15 fw-medium">WhatsApp Business API Platform</p>
                </div>
              </Col>
            </Row>

            <Row className="justify-content-center">
              <Col md={8} lg={6} xl={5}>
                <Card className="mt-4">
                  <CardBody className="p-4">
                    <div className="text-center mt-2">
                      <h5 className="text-primary">Create New Account</h5>
                      <p className="text-muted">Get started — it's free</p>
                    </div>
                    <div className="p-2 mt-4">
                      <Form
                        onSubmit={(e) => {
                          e.preventDefault();
                          validation.handleSubmit();
                        }}
                        className="needs-validation"
                      >
                        {success && (
                          <>
                            {toast("Registration successful! Redirecting to login...", {
                              position: "top-right",
                              hideProgressBar: false,
                              className: "bg-success text-white",
                              toastId: "register-success",
                            })}
                            <ToastContainer autoClose={2000} limit={1} />
                            <Alert color="success">
                              Account created successfully! Redirecting to login...
                            </Alert>
                          </>
                        )}

                        {error && (
                          <Alert color="danger">
                            {typeof registrationError === "string"
                              ? registrationError
                              : "This email is already registered. Please use a different email."}
                          </Alert>
                        )}

                        {/* Email */}
                        <div className="mb-3">
                          <Label htmlFor="useremail" className="form-label">
                            Email <span className="text-danger">*</span>
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            className="form-control"
                            placeholder="Enter email address"
                            type="email"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.email || ""}
                            invalid={validation.touched.email && !!validation.errors.email}
                          />
                          {validation.touched.email && validation.errors.email && (
                            <FormFeedback type="invalid">
                              {validation.errors.email}
                            </FormFeedback>
                          )}
                        </div>

                        {/* Username */}
                        <div className="mb-3">
                          <Label htmlFor="username" className="form-label">
                            Username <span className="text-danger">*</span>
                          </Label>
                          <Input
                            name="first_name"
                            type="text"
                            placeholder="Enter username"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.first_name || ""}
                            invalid={validation.touched.first_name && !!validation.errors.first_name}
                          />
                          {validation.touched.first_name && validation.errors.first_name && (
                            <FormFeedback type="invalid">
                              {validation.errors.first_name}
                            </FormFeedback>
                          )}
                        </div>

                        {/* Password */}
                        <div className="mb-3">
                          <Label htmlFor="userpassword" className="form-label">
                            Password <span className="text-danger">*</span>
                          </Label>
                          <Input
                            name="password"
                            type="password"
                            placeholder="Enter password (min 8 chars)"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.password || ""}
                            invalid={validation.touched.password && !!validation.errors.password}
                          />
                          {validation.touched.password && validation.errors.password && (
                            <FormFeedback type="invalid">
                              {validation.errors.password}
                            </FormFeedback>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div className="mb-2">
                          <Label htmlFor="confirmPassword" className="form-label">
                            Confirm Password <span className="text-danger">*</span>
                          </Label>
                          <Input
                            name="confirm_password"
                            type="password"
                            placeholder="Re-enter password"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.confirm_password || ""}
                            invalid={validation.touched.confirm_password && !!validation.errors.confirm_password}
                          />
                          {validation.touched.confirm_password && validation.errors.confirm_password && (
                            <FormFeedback type="invalid">
                              {validation.errors.confirm_password}
                            </FormFeedback>
                          )}
                        </div>

                        <div className="mb-4">
                          <p className="mb-0 fs-12 text-muted fst-italic">
                            By registering you agree to our{" "}
                            <Link to="#" className="text-primary text-decoration-underline fst-normal fw-medium">
                              Terms of Use
                            </Link>
                          </p>
                        </div>

                        <div className="mt-4">
                          <Button
                            color="success"
                            className="w-100"
                            type="submit"
                            disabled={loader}
                          >
                            {loader && <Spinner size="sm" className="me-2" />}
                            {loader ? "Creating Account..." : "Sign Up"}
                          </Button>
                        </div>
                      </Form>
                    </div>
                  </CardBody>
                </Card>

                <div className="mt-4 text-center">
                  <p className="mb-0">
                    Already have an account?{" "}
                    <Link to="/login" className="fw-semibold text-primary text-decoration-underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </ParticlesAuth>
    </React.Fragment>
  );
};

export default Register;
