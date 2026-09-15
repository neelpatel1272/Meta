import React, { useState } from "react";
import whatsappApi from "../../../services/whatsappApi";

interface ImportResult {
    success: boolean;
    message: string;
    count: number;
    skipped?: number;
}

const ImportContact: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFile(e.target.files?.[0] || null);
        setResult(null);
        setError(null);
    };

const handleImport = async () => {
    if (!file) {
        alert("Please select a CSV file.");
        return;
    }

    setIsImporting(true);
    setError(null);
    setResult(null);

    try {
        const response = await whatsappApi.importContactsCsv(file);

        setResult(response.data);
        setFile(null);
    } catch (err: any) {
        setError(
            err?.response?.data?.message ||
            err?.message ||
            "Something went wrong during import."
        );
    } finally {
        setIsImporting(false);
    }
};

    return (
        <div className="page-content">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box">
                            <h4 className="mb-sm-0">Import Contact</h4>
                            <p className="text-muted mb-0 mt-1">
                                Import contacts from a CSV file
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h5 className="card-title mb-0">Import Contacts</h5>
                    </div>

                    <div className="card-body">
                        <div className="text-center py-5">
                            <div className="avatar-lg mx-auto mb-4">
                                <div className="avatar-title bg-success-subtle text-success rounded-circle fs-1">
                                    <i className="ri-upload-cloud-2-line"></i>
                                </div>
                            </div>

                            <h5>Upload Contact CSV</h5>

                            <p className="text-muted">
                                Upload a CSV file containing your contacts. Expected columns:
                                first_name, last_name, phone_number, email, group_name, tags.
                            </p>

                            <input
                                type="file"
                                className="form-control mx-auto mb-3"
                                style={{ maxWidth: "500px" }}
                                accept=".csv,text/csv"
                                onChange={handleFileChange}
                                disabled={isImporting}
                            />

                            {file && (
                                <p className="text-success">Selected: {file.name}</p>
                            )}

                            {error && (
                                <div className="alert alert-danger mx-auto" style={{ maxWidth: "500px" }}>
                                    {error}
                                </div>
                            )}

                            {result && (
                                <div className="alert alert-success mx-auto" style={{ maxWidth: "500px" }}>
                                    {result.message}
                                    {typeof result.skipped === "number" && result.skipped > 0 && (
                                        <> ({result.skipped} rows skipped — missing/invalid phone number)</>
                                    )}
                                </div>
                            )}

                            <button
                                className="btn btn-success"
                                onClick={handleImport}
                                disabled={isImporting || !file}
                            >
                                {isImporting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-1" role="status" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <i className="ri-upload-line me-1"></i>
                                        Import Contacts
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImportContact;