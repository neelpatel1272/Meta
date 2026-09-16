import React, { useEffect, useState } from "react";
import whatsappApi, { Contact } from "../../../services/whatsappApi";
interface CustomField {
  id: number;
  name: string;
  type: "text" | "number" | "date";
}
const WhatsAppContacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    group_name: "",
  });
  const [customFieldValues, setCustomFieldValues] = useState<
    Record<number, string>
  >({});
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await whatsappApi.getContacts({ search });
      setContacts(res.data.data?.data || res.data.data || []);
    } catch (err) {
      console.error("Failed to load contacts", err);
    } finally {
      setLoading(false);
    }
  };
  const fetchCustomFields = async () => {
    try {
      const res = await whatsappApi.getCustomFields();
      setCustomFields(res.data.data || []);
    } catch (err) {
      console.error("Failed to load custom fields", err);
    }
  };
  useEffect(() => {
    fetchContacts();
  }, [search]);
  useEffect(() => {
    fetchCustomFields();
  }, []);
  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanedCustomFields = Object.fromEntries(
        Object.entries(customFieldValues).filter(([, value]) => value !== ""),
      );
      await whatsappApi.createContact({
        ...formData,
        custom_fields: cleanedCustomFields,
      });
      setShowAddModal(false);
      setFormData({
        first_name: "",
        last_name: "",
        phone_number: "",
        email: "",
        group_name: "",
      });
      setCustomFieldValues({});
      fetchContacts();
    } catch (err) {
      console.error("Failed to save contact", err);
    }
  };
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) {
      return;
    }
    try {
      await whatsappApi.deleteContact(id);
      fetchContacts();
    } catch (err) {
      console.error("Failed to delete contact", err);
    }
  };
  const handleCustomFieldChange = (fieldId: number, value: string) => {
    setCustomFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  };
  return (
    <div className="page-content">
      {" "}
      <div className="container-fluid">
        {" "}
        <div className="row">
          {" "}
          <div className="col-12">
            {" "}
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              {" "}
              <div>
                {" "}
                <h4 className="mb-sm-0"> WhatsApp Contacts </h4>{" "}
                <p className="text-muted mb-0 mt-1">
                  {" "}
                  Manage audience, segments, and recipient directories{" "}
                </p>{" "}
              </div>{" "}
              <div className="page-title-right">
                {" "}
                <button
                  className="btn btn-success"
                  onClick={() => setShowAddModal(true)}
                >
                  {" "}
                  <i className="ri-add-line me-1"></i> Add Contact{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="card">
          {" "}
          <div className="card-header border-bottom d-flex align-items-center justify-content-between">
            {" "}
            <div
              className="search-box position-relative"
              style={{ width: "300px" }}
            >
              {" "}
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, phone or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />{" "}
              <i className="ri-search-line search-icon position-absolute top-50 translate-middle-y end-0 me-3 text-muted"></i>{" "}
            </div>{" "}
            <span className="badge bg-light text-muted fs-12">
              {" "}
              Total: {contacts.length} Contacts{" "}
            </span>{" "}
          </div>{" "}
          <div className="card-body">
            {" "}
            <div className="table-responsive">
              {" "}
              <table className="table align-middle table-nowrap mb-0">
                {" "}
                <thead className="table-light">
                  {" "}
                  <tr>
                    {" "}
                    <th>Contact</th> <th>WhatsApp Number</th> <th>Email</th>{" "}
                    <th>Group / Segment</th> <th>Status</th>{" "}
                    <th>Action</th>{" "}
                  </tr>{" "}
                </thead>{" "}
                <tbody>
                  {" "}
                  {loading ? (
                    <tr>
                      {" "}
                      <td colSpan={6} className="text-center py-4 text-muted">
                        {" "}
                        Loading contacts...{" "}
                      </td>{" "}
                    </tr>
                  ) : contacts.length === 0 ? (
                    <tr>
                      {" "}
                      <td colSpan={6} className="text-center py-4 text-muted">
                        {" "}
                        No contacts found.{" "}
                      </td>{" "}
                    </tr>
                  ) : (
                    contacts.map((c) => (
                      <tr key={c.id}>
                        {" "}
                        <td>
                          {" "}
                          <div className="d-flex align-items-center gap-2">
                            {" "}
                            <div className="avatar-xs rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center fw-bold">
                              {" "}
                              {(c.first_name || c.phone_number)
                                .charAt(0)
                                .toUpperCase()}{" "}
                            </div>{" "}
                            <div>
                              {" "}
                              <h6 className="mb-0 fs-14">
                                {" "}
                                {c.first_name || ""} {c.last_name || ""}{" "}
                              </h6>{" "}
                            </div>{" "}
                          </div>{" "}
                        </td>{" "}
                        <td>
                          {" "}
                          <span className="badge bg-success-subtle text-success">
                            {" "}
                            <i className="ri-whatsapp-line me-1"></i> +
                            {c.phone_number}{" "}
                          </span>{" "}
                        </td>{" "}
                        <td> {c.email || "—"} </td>{" "}
                        <td>
                          {" "}
                          {c.group_name ? (
                            <span className="badge bg-info-subtle text-info">
                              {" "}
                              {c.group_name}{" "}
                            </span>
                          ) : (
                            "—"
                          )}{" "}
                        </td>{" "}
                        <td>
                          {" "}
                          <span className="badge bg-success">
                            {" "}
                            {c.status || "Active"}{" "}
                          </span>{" "}
                        </td>{" "}
                        <td>
                          {" "}
                          <button
                            className="btn btn-sm btn-subtle-danger"
                            onClick={() => handleDelete(c.id)}
                            title="Delete Contact"
                          >
                            {" "}
                            <i className="ri-delete-bin-line"></i>{" "}
                          </button>{" "}
                        </td>{" "}
                      </tr>
                    ))
                  )}{" "}
                </tbody>{" "}
              </table>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {showAddModal && (
          <div
            className="modal show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            {" "}
            <div className="modal-dialog modal-dialog-centered modal-lg">
              {" "}
              <div className="modal-content">
                {" "}
                <div className="modal-header">
                  {" "}
                  <h5 className="modal-title">
                    {" "}
                    Add New WhatsApp Contact{" "}
                  </h5>{" "}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddModal(false)}
                  ></button>{" "}
                </div>{" "}
                <form onSubmit={handleCreateContact}>
                  {" "}
                  <div className="modal-body">
                    {" "}
                    <div className="mb-3">
                      {" "}
                      <label className="form-label">
                        {" "}
                        Phone Number (with Country Code){" "}
                      </label>{" "}
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 919876543210"
                        required
                        value={formData.phone_number}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            phone_number: e.target.value,
                          })
                        }
                      />{" "}
                    </div>{" "}
                    <div className="row">
                      {" "}
                      <div className="col-md-6 mb-3">
                        {" "}
                        <label className="form-label"> First Name </label>{" "}
                        <input
                          type="text"
                          className="form-control"
                          placeholder="First Name"
                          value={formData.first_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              first_name: e.target.value,
                            })
                          }
                        />{" "}
                      </div>{" "}
                      <div className="col-md-6 mb-3">
                        {" "}
                        <label className="form-label"> Last Name </label>{" "}
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Last Name"
                          value={formData.last_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              last_name: e.target.value,
                            })
                          }
                        />{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="mb-3">
                      {" "}
                      <label className="form-label"> Email Address </label>{" "}
                      <input
                        type="email"
                        className="form-control"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />{" "}
                    </div>{" "}
                    <div className="mb-3">
                      {" "}
                      <label className="form-label">
                        {" "}
                        Group / Segment{" "}
                      </label>{" "}
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. VIP Customers, Leads"
                        value={formData.group_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            group_name: e.target.value,
                          })
                        }
                      />{" "}
                    </div>{" "}
                    {customFields.length > 0 && (
                      <>
                        {" "}
                        <hr className="my-4" />{" "}
                        <h6 className="mb-3"> Custom Fields </h6>{" "}
                        <div className="row">
                          {" "}
                          {customFields.map((field) => (
                            <div className="col-md-6 mb-3" key={field.id}>
                              {" "}
                              <label className="form-label">
                                {" "}
                                {field.name}{" "}
                                <span className="text-muted ms-1">
                                  {" "}
                                  (Optional){" "}
                                </span>{" "}
                              </label>{" "}
                              <input
                                type={field.type}
                                className="form-control"
                                placeholder={`Enter ${field.name}`}
                                value={customFieldValues[field.id] || ""}
                                onChange={(e) =>
                                  handleCustomFieldChange(
                                    field.id,
                                    e.target.value,
                                  )
                                }
                              />{" "}
                            </div>
                          ))}{" "}
                        </div>{" "}
                      </>
                    )}{" "}
                  </div>{" "}
                  <div className="modal-footer">
                    {" "}
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => setShowAddModal(false)}
                    >
                      {" "}
                      Cancel{" "}
                    </button>{" "}
                    <button type="submit" className="btn btn-success">
                      {" "}
                      Save Contact{" "}
                    </button>{" "}
                  </div>{" "}
                </form>{" "}
              </div>{" "}
            </div>{" "}
          </div>
        )}{" "}
      </div>{" "}
    </div>
  );
};
export default WhatsAppContacts;
