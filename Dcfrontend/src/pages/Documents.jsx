import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";

import {
  FileText,
  Eye,
  Pencil,
  Trash2,
  Check,
  X,
  ArrowLeft,
  Search,
  RefreshCw,
  Upload,
  Clock3,
  MoreVertical,
  AlertCircle,
} from "lucide-react";

import "./Documents.css";


function Documents() {

  const navigate = useNavigate();


  // =====================================================
  // STATE
  // =====================================================

  const [documents, setDocuments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [editName, setEditName] =
    useState("");

  const [loadingId, setLoadingId] =
    useState(null);

  const [deletingId, setDeletingId] =
    useState(null);

  const [menuId, setMenuId] =
    useState(null);


  // =====================================================
  // FETCH DOCUMENTS
  // =====================================================

  useEffect(() => {

    fetchDocuments();

  }, []);


  const fetchDocuments = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await API.get("/documents/");


      console.log(
        "Documents:",
        response.data
      );


      setDocuments(
        response.data || []
      );


    } catch (error) {

      console.error(
        "Document fetch error:",
        error
      );


      setError(
        error.response?.data?.detail ||
        "Failed to load documents."
      );


    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // FORMAT FILE SIZE
  // =====================================================

  const formatFileSize = (bytes) => {

    if (!bytes || bytes === 0) {

      return "0 KB";

    }


    const sizes = [
      "Bytes",
      "KB",
      "MB",
      "GB",
    ];


    const i =
      Math.floor(
        Math.log(bytes) /
        Math.log(1024)
      );


    return (
      parseFloat(
        (
          bytes /
          Math.pow(
            1024,
            i
          )
        ).toFixed(2)
      ) +
      " " +
      sizes[i]
    );

  };


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {

    if (!date) {

      return "Recently";

    }


    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (date) => {

    if (!date) {

      return "";

    }


    return new Date(
      date
    ).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );

  };


  // =====================================================
  // SEARCH DOCUMENTS
  // =====================================================

  const filteredDocuments = useMemo(() => {

    const search =
      searchTerm
        .trim()
        .toLowerCase();


    if (!search) {

      return documents;

    }


    return documents.filter(
      (doc) =>
        doc.file_name
          ?.toLowerCase()
          .includes(search)
    );

  }, [
    documents,
    searchTerm,
  ]);


  // =====================================================
  // VIEW DOCUMENT
  // =====================================================

  const openDocument = (fileName) => {

    if (!fileName) {

      alert(
        "File name not available."
      );

      return;

    }


    const pdfUrl =
      `http://localhost:8000/uploads/${encodeURIComponent(
        fileName
      )}`;


    window.open(
      pdfUrl,
      "_blank",
      "noopener,noreferrer"
    );

  };


  // =====================================================
  // START EDIT
  // =====================================================

  const startEdit = (doc) => {

    setEditingId(
      doc.id
    );


    setEditName(
      doc.file_name
    );


    setMenuId(null);

  };


  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const cancelEdit = () => {

    setEditingId(null);

    setEditName("");

  };


  // =====================================================
  // RENAME DOCUMENT
  // =====================================================

  const renameDocument = async (id) => {

    const newName =
      editName.trim();


    if (!newName) {

      alert(
        "Please enter a document name."
      );

      return;

    }


    let finalName =
      newName;


    /*
     * Add .pdf if user removes
     * the extension.
     */

    if (
      !finalName
        .toLowerCase()
        .endsWith(".pdf")
    ) {

      finalName += ".pdf";

    }


    try {

      setLoadingId(id);


      await API.put(
        `/documents/${id}`,
        {
          file_name:
            finalName,
        }
      );


      setDocuments(
        (previous) =>
          previous.map(
            (doc) =>
              doc.id === id
                ? {
                    ...doc,
                    file_name:
                      finalName,
                  }
                : doc
          )
      );


      setEditingId(null);

      setEditName("");


    } catch (error) {

      console.error(
        "Rename error:",
        error
      );


      alert(
        error.response
          ?.data
          ?.detail ||
        "Failed to rename document."
      );


    } finally {

      setLoadingId(null);

    }

  };


  // =====================================================
  // DELETE DOCUMENT
  // =====================================================

  const deleteDocument = async (id) => {

    const document =
      documents.find(
        (doc) =>
          doc.id === id
      );


    const confirmed =
      window.confirm(
        `Are you sure you want to permanently delete "${document?.file_name || "this document"}"?`
      );


    if (!confirmed) {

      return;

    }


    try {

      setDeletingId(id);

      setLoadingId(id);

      setMenuId(null);


      await API.delete(
        `/documents/${id}`
      );


      /*
       * Remove document from
       * frontend immediately
       * after successful API.
       */

      setDocuments(
        (previous) =>
          previous.filter(
            (doc) =>
              doc.id !== id
          )
      );


    } catch (error) {

      console.error(
        "Delete error:",
        error
      );


      alert(
        error.response
          ?.data
          ?.detail ||
        "Failed to delete document."
      );


    } finally {

      setLoadingId(null);

      setDeletingId(null);

    }

  };


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="documents-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="documents-header">


        <div className="documents-header-left">


          <button
            className="documents-back-button"
            onClick={() =>
              navigate(-1)
            }
            title="Go back"
          >

            <ArrowLeft
              size={18}
            />

          </button>


          <div>

            <div className="documents-title-row">

              <FileText
                size={20}
              />

              <h1>
                My Documents
              </h1>

            </div>


            <p>
              Manage, preview and organize
              your uploaded documents.
            </p>

          </div>

        </div>


        <button
          className="documents-upload-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >

          <Upload
            size={17}
          />

          Upload Document

        </button>


      </header>


      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && (

        <div className="documents-error">

          <div>

            <AlertCircle
              size={18}
            />

            <span>
              {error}
            </span>

          </div>


          <button
            onClick={
              fetchDocuments
            }
          >

            <RefreshCw
              size={15}
            />

            Retry

          </button>

        </div>

      )}


      {/* =================================================
          SEARCH TOOLBAR
      ================================================= */}

      <section className="documents-toolbar">


        <div className="documents-search">

          <Search
            size={18}
          />


          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />


          {searchTerm && (

            <button
              className="clear-search"
              onClick={() =>
                setSearchTerm("")
              }
            >

              <X
                size={15}
              />

            </button>

          )}

        </div>


        <div className="document-result-count">

          {searchTerm
            ? `${filteredDocuments.length} result${
                filteredDocuments.length !== 1
                  ? "s"
                  : ""
              }`
            : `${documents.length} document${
                documents.length !== 1
                  ? "s"
                  : ""
              }`
          }

        </div>


      </section>


      {/* =================================================
          DOCUMENT CONTAINER
      ================================================= */}

      <section className="documents-container">


        {/* SECTION HEADER */}

        <div className="documents-section-header">


          <div>

            <h2>
              All Documents
            </h2>

            <p>
              View and manage your uploaded
              documents.
            </p>

          </div>


          <button
            className="refresh-button"
            onClick={
              fetchDocuments
            }
            disabled={loading}
          >

            <RefreshCw
              size={16}
              className={
                loading
                  ? "refresh-spin"
                  : ""
              }
            />

            Refresh

          </button>


        </div>


        {/* =================================================
            LOADING SKELETON
        ================================================= */}

        {loading ? (

          <div className="documents-list">

            {[1, 2, 3, 4].map(
              (item) => (

                <div
                  className="document-skeleton"
                  key={item}
                >

                  <div className="skeleton-icon"></div>


                  <div className="skeleton-info">

                    <div className="skeleton-title"></div>

                    <div className="skeleton-small"></div>

                    <div className="skeleton-small short"></div>

                  </div>


                  <div className="skeleton-buttons">

                    <div></div>

                    <div></div>

                    <div></div>

                  </div>

                </div>

              )
            )}

          </div>


        ) : filteredDocuments.length === 0 ? (

          /* =================================================
             EMPTY STATE
          ================================================= */

          <div className="documents-empty">


            <div className="empty-document-icon">

              {searchTerm ? (

                <Search
                  size={32}
                />

              ) : (

                <FileText
                  size={32}
                />

              )}

            </div>


            <h2>

              {searchTerm
                ? "No matching documents"
                : "No documents uploaded"
              }

            </h2>


            <p>

              {searchTerm
                ? "Try another document name."
                : "Upload your first document to start using DocuMind AI."
              }

            </p>


            {searchTerm ? (

              <button
                className="empty-button"
                onClick={() =>
                  setSearchTerm("")
                }
              >

                Clear Search

              </button>

            ) : (

              <button
                className="empty-button"
                onClick={() =>
                  navigate("/dashboard")
                }
              >

                <Upload
                  size={16}
                />

                Upload Document

              </button>

            )}

          </div>


        ) : (

          /* =================================================
             DOCUMENT LIST
          ================================================= */

          <div className="documents-list">


            {filteredDocuments.map(
              (doc, index) => (

                <article
                  className={`document-card ${
                    deletingId === doc.id
                      ? "document-deleting"
                      : ""
                  }`}
                  key={doc.id}
                  style={{
                    animationDelay:
                      `${index * 0.06}s`,
                  }}
                >


                  {/* FILE ICON */}

                  <div className="document-file-icon">

                    <FileText
                      size={25}
                    />

                    <span>
                      PDF
                    </span>

                  </div>


                  {/* DOCUMENT INFORMATION */}

                  <div className="document-info">


                    {editingId === doc.id ? (

                      <div className="document-edit-box">


                        <input
                          type="text"
                          value={
                            editName
                          }
                          onChange={(event) =>
                            setEditName(
                              event.target.value
                            )
                          }
                          onKeyDown={(event) => {

                            if (
                              event.key ===
                              "Enter"
                            ) {

                              renameDocument(
                                doc.id
                              );

                            }


                            if (
                              event.key ===
                              "Escape"
                            ) {

                              cancelEdit();

                            }

                          }}
                          autoFocus
                        />


                        <button
                          className="save-edit"
                          onClick={() =>
                            renameDocument(
                              doc.id
                            )
                          }
                          disabled={
                            loadingId ===
                            doc.id
                          }
                        >

                          <Check
                            size={16}
                          />

                        </button>


                        <button
                          className="cancel-edit"
                          onClick={
                            cancelEdit
                          }
                          disabled={
                            loadingId ===
                            doc.id
                          }
                        >

                          <X
                            size={16}
                          />

                        </button>


                      </div>


                    ) : (

                      <h3
                        title={
                          doc.file_name
                        }
                      >

                        {doc.file_name}

                      </h3>

                    )}


                    <div className="document-meta">


                      <span>
                        {doc.file_type ||
                          "PDF"}
                      </span>


                      <i>
                        •
                      </i>


                      <span>
                        {formatFileSize(
                          doc.file_size
                        )}
                      </span>


                      <i>
                        •
                      </i>


                      <span>
                        {formatDate(
                          doc.uploaded_at
                        )}
                      </span>


                    </div>


                    <div className="document-time">

                      <Clock3
                        size={12}
                      />

                      Uploaded at{" "}

                      {formatTime(
                        doc.uploaded_at
                      )}

                    </div>


                  </div>


                  {/* =================================================
                      READY STATUS REMOVED
                      
                      The old .document-status block
                      has been completely removed.
                  ================================================= */}


                  {/* ACTION BUTTONS */}

                  <div className="document-actions">


                    {/* VIEW */}

                    <button
                      className="view-button"
                      onClick={() =>
                        openDocument(
                          doc.file_name
                        )
                      }
                      title="View PDF"
                    >

                      <Eye
                        size={16}
                      />

                      View

                    </button>


                    {/* EDIT */}

                    <button
                      className="edit-button"
                      onClick={() =>
                        startEdit(
                          doc
                        )
                      }
                      disabled={
                        loadingId ===
                        doc.id
                      }
                      title="Rename document"
                    >

                      <Pencil
                        size={16}
                      />

                      Edit

                    </button>


                    {/* DELETE */}

                    <button
                      className="delete-button"
                      onClick={() =>
                        deleteDocument(
                          doc.id
                        )
                      }
                      disabled={
                        loadingId ===
                        doc.id
                      }
                      title="Delete document"
                    >

                      {loadingId === doc.id ? (

                        <RefreshCw
                          size={16}
                          className="refresh-spin"
                        />

                      ) : (

                        <Trash2
                          size={16}
                        />

                      )}


                      {loadingId === doc.id
                        ? "Deleting..."
                        : "Delete"
                      }

                    </button>


                    {/* MOBILE MENU */}

                    <button
                      className="more-button"
                      onClick={() =>
                        setMenuId(
                          menuId ===
                          doc.id
                            ? null
                            : doc.id
                        )
                      }
                    >

                      <MoreVertical
                        size={18}
                      />

                    </button>


                    {menuId === doc.id && (

                      <div className="document-menu">


                        <button
                          onClick={() => {

                            openDocument(
                              doc.file_name
                            );

                            setMenuId(
                              null
                            );

                          }}
                        >

                          <Eye
                            size={15}
                          />

                          View

                        </button>


                        <button
                          onClick={() =>
                            startEdit(
                              doc
                            )
                          }
                        >

                          <Pencil
                            size={15}
                          />

                          Edit

                        </button>


                        <button
                          className="menu-delete"
                          onClick={() =>
                            deleteDocument(
                              doc.id
                            )
                          }
                        >

                          <Trash2
                            size={15}
                          />

                          Delete

                        </button>


                      </div>

                    )}


                  </div>


                </article>

              )
            )}


          </div>

        )}


      </section>


    </div>

  );

}


export default Documents;