import React, { useState } from "react";

interface CustomField {
    id: number;
    name: string;
    type: string;
}

const CustomFields: React.FC = () => {
    const [fields, setFields] = useState<CustomField[]>([
        { id: 1, name: "Company", type: "Text" },
        { id: 2, name: "Birthday", type: "Date" },
        { id: 3, name: "Customer ID", type: "Text" },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState("");
    const [type, setType] = useState("text");

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) return;

        setFields([
            ...fields,
            {
                id: Date.now(),
                name,
                type: type === "text" ? "Text" : type === "number" ? "Number" : "Date",
            },
        ]);

        setName("");
        setType("text");
        setShowModal(false);
    };

    const handleDelete = (id: number) => {
        setFields(fields.filter((field) => field.id !== id));
    };

    return (
        <div className="page-content">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                            <div>
                                <h4 className="mb-sm-0">Custom Fields</h4>
                                <p className="text-muted mb-0 mt-1">
                                    Manage additional contact information
                                </p>
                            </div>

                            <button
                                className="btn btn-success"
                                onClick={() => setShowModal(true)}
                            >
                                <i className="ri-add-line me-1"></i>
                                Add Custom Field
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h5 className="card-title mb-0">
                            Contact Custom Fields
                        </h5>
                    </div>

                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table align-middle table-nowrap mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Field Name</th>
                                        <th>Field Type</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {fields.map((field) => (
                                        <tr key={field.id}>
                                            <td>
                                                <strong>{field.name}</strong>
                                            </td>

                                            <td>
                                                <span className="badge bg-info-subtle text-info">
                                                    {field.type}
                                                </span>
                                            </td>

                                            <td>
                                                <button className="btn btn-sm btn-light me-1">
                                                    <i className="ri-edit-line"></i>
                                                </button>

                                                <button
                                                    className="btn btn-sm btn-subtle-danger"
                                                    onClick={() =>
                                                        handleDelete(field.id)
                                                    }
                                                >
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
                                        Add Custom Field
                                    </h5>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                    ></button>
                                </div>

                                <form onSubmit={handleCreate}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Field Name
                                            </label>

                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. Company"
                                                value={name}
                                                onChange={(e) =>
                                                    setName(e.target.value)
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Field Type
                                            </label>

                                            <select
                                                className="form-select"
                                                value={type}
                                                onChange={(e) =>
                                                    setType(e.target.value)
                                                }
                                            >
                                                <option value="text">
                                                    Text
                                                </option>
                                                <option value="number">
                                                    Number
                                                </option>
                                                <option value="date">
                                                    Date
                                                </option>
                                            </select>
                                        </div>
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
                                            Save Field
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

export default CustomFields;