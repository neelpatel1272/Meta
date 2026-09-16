import React, { useState } from "react";

const ContactGroups: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [groupName, setGroupName] = useState("");

    const groups = [
        { id: 1, name: "Customers", count: 120 },
        { id: 2, name: "Leads", count: 45 },
        { id: 3, name: "VIP Customers", count: 20 },
    ];

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!groupName.trim()) return;

        console.log("Create group:", groupName);
        setGroupName("");
        setShowModal(false);
    };

    return (
        <div className="page-content">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                            <div>
                                <h4 className="mb-sm-0">Contact Groups</h4>
                                <p className="text-muted mb-0 mt-1">
                                    Organize contacts into groups and segments
                                </p>
                            </div>

                            <button
                                className="btn btn-success"
                                onClick={() => setShowModal(true)}
                            >
                                <i className="ri-add-line me-1"></i>
                                Create Group
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h5 className="card-title mb-0">Groups</h5>
                    </div>

                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table align-middle table-nowrap mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Group Name</th>
                                        <th>Contacts</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {groups.map((group) => (
                                        <tr key={group.id}>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="avatar-xs rounded-circle bg-info-subtle text-info d-flex align-items-center justify-content-center">
                                                        <i className="ri-group-line"></i>
                                                    </div>
                                                    <strong>{group.name}</strong>
                                                </div>
                                            </td>

                                            <td>
                                                <span className="badge bg-secondary-subtle text-body border border-secondary-subtle">
                                                    {group.count} Contacts
                                                </span>
                                            </td>

                                            <td>
                                                <span className="badge bg-success">
                                                    Active
                                                </span>
                                            </td>

                                            <td>
                                                <button className="btn btn-sm btn-light me-1">
                                                    <i className="ri-edit-line"></i>
                                                </button>

                                                <button className="btn btn-sm btn-subtle-danger">
                                                    <i className="ri-delete-bin-line"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {showModal && (
                    <div
                        className="modal show d-block"
                        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    >
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        Create Contact Group
                                    </h5>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                    ></button>
                                </div>

                                <form onSubmit={handleCreate}>
                                    <div className="modal-body">
                                        <label className="form-label">
                                            Group Name
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. VIP Customers"
                                            value={groupName}
                                            onChange={(e) =>
                                                setGroupName(e.target.value)
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-light"
                                            onClick={() => setShowModal(false)}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="btn btn-success"
                                        >
                                            Create Group
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactGroups;