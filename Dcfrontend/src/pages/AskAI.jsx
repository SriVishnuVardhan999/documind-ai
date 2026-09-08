import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

import {
  FileText,
  Sparkles,
  ArrowLeft,
  Send,
  RotateCcw,
  User,
  Copy,
  Check,
  ChevronDown,
  Loader2,
  AlertCircle,
} from "lucide-react";

import "./AskAI.css";

function AskAI() {
  const navigate = useNavigate();

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [extractionLoading, setExtractionLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // =====================================================
  // LOAD DOCUMENTS
  // =====================================================

  useEffect(() => {
    fetchDocuments();
  }, []);

  // =====================================================
  // AUTO SCROLL CHAT
  // =====================================================

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // =====================================================
  // TEXTAREA HEIGHT
  // =====================================================

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";

      textareaRef.current.style.height =
        Math.min(
          textareaRef.current.scrollHeight,
          120
        ) + "px";
    }
  }, [question]);

  // =====================================================
  // GET DOCUMENTS
  // =====================================================

  const fetchDocuments = async () => {
    try {
      setError("");

      const response = await API.get(
        "/documents/"
      );

      setDocuments(response.data || []);
    } catch (err) {
      console.error(
        "Document loading error:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to load documents."
      );
    }
  };

  // =====================================================
  // SELECTED DOCUMENT
  // =====================================================

  const selectedDoc = documents.find(
    (doc) =>
      String(doc.id) ===
      String(selectedDocument)
  );

  // =====================================================
  // EXTRACT TEXT
  // =====================================================

  const extractText = async (documentId) => {
    if (!documentId) {
      setExtractedText("");
      return;
    }

    try {
      setExtractionLoading(true);
      setExtractedText("");
      setError("");

      const response = await API.post(
        `/documents/extract-text/${documentId}`
      );

      setExtractedText(
        response.data?.text || ""
      );
    } catch (err) {
      console.error(
        "Text extraction error:",
        err
      );

      setExtractedText("");

      setError(
        err?.response?.data?.detail ||
          "Unable to extract text from this PDF."
      );
    } finally {
      setExtractionLoading(false);
    }
  };

  // =====================================================
  // DOCUMENT CHANGE
  // =====================================================

  const handleDocumentChange = (event) => {
    const documentId =
      event.target.value;

    setSelectedDocument(documentId);
    setMessages([]);
    setQuestion("");
    setError("");
    setExtractedText("");

    if (documentId) {
      extractText(documentId);
    }
  };

  // =====================================================
  // ASK AI
  // =====================================================

  const askQuestion = async () => {
    const trimmedQuestion =
      question.trim();

    setError("");

    if (!selectedDocument) {
      setError(
        "Please select a document first."
      );
      return;
    }

    if (!trimmedQuestion || loading) {
      return;
    }

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: trimmedQuestion,
      },
    ]);

    setQuestion("");

    try {
      setLoading(true);

      const response = await API.post(
        "/ask-ai",
        {
          document_id:
            Number(selectedDocument),

          question:
            trimmedQuestion,
        }
      );

      if (response.data?.error) {
        setError(response.data.error);
        return;
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            response.data?.answer ||
            "I couldn't generate an answer.",
        },
      ]);
    } catch (err) {
      console.error(
        "Ask AI error:",
        err
      );

      const errorMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        "Unable to get AI response.";

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            `Sorry, I couldn't answer that. ${errorMessage}`,
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // KEYBOARD
  // =====================================================

  const handleQuestionKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      if (!loading) {
        askQuestion();
      }
    }
  };

  // =====================================================
  // CLEAR CHAT
  // =====================================================

  const clearChat = () => {
    if (loading) {
      return;
    }

    setMessages([]);
    setQuestion("");
    setError("");
  };

  // =====================================================
  // COPY ANSWER
  // =====================================================

  const copyAnswer = async (
    content,
    index
  ) => {
    try {
      await navigator.clipboard.writeText(
        content
      );

      setCopiedIndex(index);

      setTimeout(() => {
        setCopiedIndex(null);
      }, 1500);
    } catch (err) {
      console.error(
        "Copy error:",
        err
      );
    }
  };

  // =====================================================
  // OPEN PDF
  // =====================================================

  const openDocument = () => {
    if (!selectedDoc?.file_name) {
      return;
    }

    const url =
      `http://localhost:8000/uploads/${encodeURIComponent(
        selectedDoc.file_name
      )}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="ask-page">

      {/* BACKGROUND */}

      <div className="ask-background-glow ask-glow-one" />
      <div className="ask-background-glow ask-glow-two" />

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="ask-header">

        <div className="ask-header-left">

          <button
            className="ask-back-button"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />

            <span>
              Back
            </span>
          </button>

          <div className="ask-title-row">

            <div className="ask-title-icon">
              <Sparkles size={20} />
            </div>

            <div>
              <h1>
                Ask DocuMind AI
              </h1>

              <p>
                Understand your documents
                with intelligent answers.
              </p>
            </div>

          </div>

        </div>

        <div className="ask-header-actions">

          {selectedDoc && (
            <button
              className="ask-preview-button"
              onClick={openDocument}
            >
              <FileText size={16} />
              Preview PDF
            </button>
          )}

          {messages.length > 0 && (
            <button
              className="ask-clear-button"
              onClick={clearChat}
              disabled={loading}
            >
              <RotateCcw size={15} />
              Clear Chat
            </button>
          )}

        </div>

      </header>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="ask-error">

          <AlertCircle size={17} />

          <span>
            {error}
          </span>

          <button
            onClick={() => setError("")}
          >
            <Check size={15} />
          </button>

        </div>
      )}

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="ask-layout">

        {/* =================================================
            DOCUMENT PANEL
        ================================================= */}

        <section className="ask-panel ask-document-panel">

          <div className="ask-panel-header">

            <div>

              <span className="ask-eyebrow">
                DOCUMENT
              </span>

              <h2>
                <FileText size={20} />
                Document Content
              </h2>

            </div>

            {selectedDoc && (
              <span className="ask-ready-badge">
                <span />
                Ready
              </span>
            )}

          </div>

          {/* SELECT DOCUMENT */}

          <div className="ask-selector-wrap">

            <label htmlFor="document-select">
              Select a document
            </label>

            <div className="ask-select-container">

              <select
                id="document-select"
                value={selectedDocument}
                onChange={
                  handleDocumentChange
                }
              >

                <option value="">
                  Choose a document
                </option>

                {documents.map((doc) => (
                  <option
                    key={doc.id}
                    value={doc.id}
                  >
                    {doc.file_name}
                  </option>
                ))}

              </select>

              <ChevronDown size={17} />

            </div>

          </div>

          {/* SELECTED DOCUMENT */}

          {selectedDoc && (
            <div className="ask-selected-document">

              <div className="ask-pdf-icon">

                <FileText size={20} />

                <span>
                  PDF
                </span>

              </div>

              <div className="ask-selected-info">

                <strong
                  title={
                    selectedDoc.file_name
                  }
                >
                  {selectedDoc.file_name}
                </strong>

                <span>
                  {selectedDoc.file_type ||
                    "PDF Document"}
                </span>

              </div>

              <button
                onClick={openDocument}
              >
                View
              </button>

            </div>
          )}

          {/* TEXT LABEL */}

          <div className="ask-content-label">

            <span>
              Extracted Text
            </span>

            {extractedText && (
              <span className="ask-character-count">
                {extractedText.length.toLocaleString()}
                {" "}
                characters
              </span>
            )}

          </div>

          {/* TEXT VIEWER */}

          <div className="ask-text-viewer">

            {extractionLoading ? (

              <div className="ask-loading-state">

                <div className="ask-loader-icon">
                  <Loader2 size={28} />
                </div>

                <strong>
                  Extracting document text
                </strong>

                <span>
                  Reading and processing
                  your PDF...
                </span>

              </div>

            ) : extractedText ? (

              <div className="ask-extracted-text">
                {extractedText}
              </div>

            ) : (

              <div className="ask-empty-text">

                <div className="ask-empty-icon">
                  <FileText size={27} />
                </div>

                <strong>
                  No document selected
                </strong>

                <span>
                  Select a PDF to extract
                  and view its content.
                </span>

              </div>

            )}

          </div>

        </section>

        {/* =================================================
            AI CHAT PANEL
        ================================================= */}

        <section className="ask-panel ask-chat-panel">

          {/* CHAT HEADER */}

          <div className="ask-chat-header">

            <div className="ask-ai-profile">

              <div className="ask-ai-avatar">
                <Sparkles size={19} />
              </div>

              <div>

                <strong>
                  DocuMind AI
                </strong>

                <span>
                  <i />
                  AI document assistant
                </span>

              </div>

            </div>

            <div className="ask-ai-status">
              Online
            </div>

          </div>

          {/* CHAT BODY */}

          <div className="ask-chat-body">

            {messages.length === 0 &&
            !loading ? (

              <div className="ask-welcome">

                <div className="ask-welcome-icon">
                  <Sparkles size={31} />
                </div>

                <h3>
                  Ask anything about
                  your document
                </h3>

                <p>
                  Select a document and
                  ask a question. DocuMind
                  AI will generate an answer
                  from your document.
                </p>

                <div className="ask-suggestions">

                  <button
                    onClick={() =>
                      setQuestion(
                        "What is this document about?"
                      )
                    }
                    disabled={!selectedDocument}
                  >
                    What is this document about?
                  </button>

                  <button
                    onClick={() =>
                      setQuestion(
                        "Summarize the main points."
                      )
                    }
                    disabled={!selectedDocument}
                  >
                    Summarize the main points
                  </button>

                </div>

              </div>

            ) : (

              <div className="ask-messages">

                {messages.map(
                  (message, index) => {

                    const isUser =
                      message.role ===
                      "user";

                    return (
                      <div
                        className={`ask-message-row ${
                          isUser
                            ? "ask-user-row"
                            : "ask-ai-row"
                        }`}
                        key={index}
                      >

                        <div
                          className={`ask-message-avatar ${
                            isUser
                              ? "ask-user-avatar"
                              : "ask-ai-message-avatar"
                          }`}
                        >

                          {isUser ? (
                            <User size={16} />
                          ) : (
                            <Sparkles size={16} />
                          )}

                        </div>

                        <div
                          className={`ask-message-content ${
                            isUser
                              ? "ask-user-message"
                              : "ask-ai-message"
                          } ${
                            message.isError
                              ? "ask-error-message"
                              : ""
                          }`}
                        >

                          <div className="ask-message-role">
                            {isUser
                              ? "You"
                              : "DocuMind AI"}
                          </div>

                          <div className="ask-message-text">
                            {message.content}
                          </div>

                          {!isUser &&
                          !message.isError && (
                            <button
                              className="ask-copy-button"
                              onClick={() =>
                                copyAnswer(
                                  message.content,
                                  index
                                )
                              }
                            >

                              {copiedIndex ===
                              index ? (
                                <>
                                  <Check size={13} />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy size={13} />
                                  Copy
                                </>
                              )}

                            </button>
                          )}

                        </div>

                      </div>
                    );
                  }
                )}

                {/* AI THINKING */}

                {loading && (
                  <div className="ask-message-row ask-ai-row">

                    <div className="ask-message-avatar ask-ai-message-avatar">
                      <Sparkles size={16} />
                    </div>

                    <div className="ask-message-content ask-ai-message">

                      <div className="ask-message-role">
                        DocuMind AI
                      </div>

                      <div className="ask-thinking">

                        <span />
                        <span />
                        <span />

                        <em>
                          Thinking...
                        </em>

                      </div>

                    </div>

                  </div>
                )}

                <div ref={chatEndRef} />

              </div>
            )}

          </div>

          {/* =================================================
              INPUT
          ================================================= */}

          <div className="ask-composer">

            <div className="ask-composer-box">

              <textarea
                ref={textareaRef}
                value={question}
                onChange={(event) =>
                  setQuestion(
                    event.target.value
                  )
                }
                onKeyDown={
                  handleQuestionKeyDown
                }
                placeholder={
                  selectedDoc
                    ? "Ask something about your document..."
                    : "Select a document first..."
                }
                disabled={
                  loading ||
                  !selectedDocument
                }
                rows={1}
              />

              <button
                className="ask-send-button"
                onClick={askQuestion}
                disabled={
                  loading ||
                  !selectedDocument ||
                  !question.trim()
                }
              >

                {loading ? (
                  <Loader2
                    size={18}
                    className="ask-send-loader"
                  />
                ) : (
                  <Send size={18} />
                )}

              </button>

            </div>

            <div className="ask-composer-help">

              <span>
                Enter to send
              </span>

              <span>
                •
              </span>

              <span>
                Shift + Enter for new line
              </span>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AskAI;