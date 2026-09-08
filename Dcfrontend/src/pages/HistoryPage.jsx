import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";

import {
  History,
  FileText,
  User,
  Bot,
  Trash2,
  RefreshCw,
  Sparkles,
  Clock,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

import "./HistoryPage.css";


function HistoryPage() {

  const navigate = useNavigate();

  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState(null);


  // =====================================================
  // LOAD HISTORY
  // =====================================================

  useEffect(() => {

    fetchHistory();

  }, []);


  // =====================================================
  // FETCH HISTORY
  // =====================================================

  const fetchHistory = async () => {

    try {

      setRefreshing(true);

      setError("");

      const response =
        await API.get("/history/");

      const data =
        response.data || [];


      // Newest history first

      data.sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      );


      setHistory(data);

    } catch (error) {

      console.error(
        "History loading error:",
        error
      );


      setError(
        error?.response?.data?.detail ||
        "Unable to load history."
      );

    } finally {

      setLoading(false);

      setRefreshing(false);

    }

  };


  // =====================================================
  // DELETE SINGLE HISTORY
  // =====================================================

  const deleteHistory = async (id) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this conversation?"
      );


    if (!confirmDelete) {

      return;

    }


    try {

      setDeletingId(id);


      await API.delete(
        `/history/${id}`
      );


      setHistory(
        previous =>
          previous.filter(
            item =>
              item.id !== id
          )
      );


    } catch (error) {

      console.error(
        "Delete history error:",
        error
      );


      alert(
        error?.response?.data?.detail ||
        "Could not delete conversation."
      );


    } finally {

      setDeletingId(null);

    }

  };


  // =====================================================
  // DELETE ALL HISTORY
  // =====================================================

  const deleteAllHistory =
    async () => {

      if (
        history.length === 0
      ) {

        return;

      }


      const confirmDelete =
        window.confirm(
          "Are you sure you want to delete all history?"
        );


      if (!confirmDelete) {

        return;

      }


      try {

        setRefreshing(true);


        await API.delete(
          "/history/"
        );


        setHistory([]);


      } catch (error) {

        console.error(
          "Delete all history error:",
          error
        );


        alert(
          error?.response?.data?.detail ||
          "Could not delete history."
        );


      } finally {

        setRefreshing(false);

      }

    };


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (
    date
  ) => {

    if (!date) {

      return "Unknown Date";

    }


    return new Date(
      date
    ).toLocaleDateString(
      undefined,
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );

  };


  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (
    date
  ) => {

    if (!date) {

      return "";

    }


    return new Date(
      date
    ).toLocaleTimeString(
      undefined,
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  };


  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {

    return (

      <div className="history-page">

        <div className="history-loading">


          <div className="history-loading-icon">

            <History
              size={28}
            />

          </div>


          <h2>

            Loading History

          </h2>


          <p>

            Fetching your conversations...

          </p>


          <div className="history-loading-bar">

            <span />

          </div>


        </div>

      </div>

    );

  }


  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (

    <div className="history-page">


      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div
        className="
          history-bg-glow
          history-bg-one
        "
      />

      <div
        className="
          history-bg-glow
          history-bg-two
        "
      />


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="history-header">


        <div className="history-header-left">


          {/* BACK BUTTON */}

          <button
            className="history-back-button"
            onClick={() =>
              navigate("/dashboard")
            }
            title="Back to Dashboard"
          >

            <ArrowLeft
              size={16}
            />

            <span>
              Back
            </span>

          </button>


          {/* PAGE TITLE */}

          <div className="history-heading">


            <div className="history-title-icon">

              <History
                size={21}
              />

            </div>


            <div>


              <span className="history-eyebrow">

                AI ACTIVITY

              </span>


              <h1>

                Conversation History

              </h1>


              <p>

                Review your previous document
                questions and AI answers.

              </p>


            </div>


          </div>


        </div>


        {/* =================================================
            ACTION BUTTONS
        ================================================= */}

        <div className="history-actions">


          {/* REFRESH */}

          <button
            className="history-refresh"
            onClick={
              fetchHistory
            }
            disabled={
              refreshing
            }
          >

            <RefreshCw
              size={15}
              className={
                refreshing
                  ? "history-spin"
                  : ""
              }
            />

            Refresh

          </button>


          {/* CLEAR ALL */}

          {history.length > 0 && (

            <button
              className="history-clear"
              onClick={
                deleteAllHistory
              }
              disabled={
                refreshing
              }
            >

              <Trash2
                size={15}
              />

              Clear All

            </button>

          )}


        </div>


      </header>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="history-error">

          <AlertCircle
            size={16}
          />

          <span>

            {error}

          </span>

        </div>

      )}


      {/* =================================================
          EMPTY HISTORY
      ================================================= */}

      {history.length === 0 &&
        !error && (

        <div className="history-empty">


          <div className="history-empty-icon">

            <History
              size={34}
            />

          </div>


          <h2>

            No History Yet

          </h2>


          <p>

            Your document questions and AI
            answers will appear here.

          </p>


        </div>

      )}


      {/* =================================================
          HISTORY LIST
      ================================================= */}

      {history.length > 0 && (

        <div className="history-list-container">


          {history.map(
            (
              item,
              index
            ) => (


              <article
                key={item.id}
                className="history-card"
                style={{
                  animationDelay:
                    `${index * 0.05}s`,
                }}
              >


                {/* =======================================
                    DATE + TIME
                ======================================= */}

                <div className="history-date-time">


                  <div className="history-date">

                    <Clock
                      size={13}
                    />

                    <span>

                      {formatDate(
                        item.created_at
                      )}

                    </span>

                  </div>


                  <span className="history-time">

                    {formatTime(
                      item.created_at
                    )}

                  </span>


                </div>


                {/* =======================================
                    DOCUMENT
                ======================================= */}

                <div className="history-card-header">


                  <div className="history-document">


                    <div className="history-file-icon">

                      <FileText
                        size={18}
                      />

                    </div>


                    <div>


                      <span>

                        DOCUMENT

                      </span>


                      <h3
                        title={
                          item.document_name
                        }
                      >

                        {
                          item.document_name ||
                          "Unknown Document"
                        }

                      </h3>


                    </div>


                  </div>


                  {/* DELETE */}

                  <button
                    className="history-delete"
                    onClick={() =>
                      deleteHistory(
                        item.id
                      )
                    }
                    disabled={
                      deletingId ===
                      item.id
                    }
                    title="Delete conversation"
                  >


                    {deletingId ===
                    item.id ? (

                      <RefreshCw
                        size={15}
                        className="
                          history-spin
                        "
                      />

                    ) : (

                      <Trash2
                        size={15}
                      />

                    )}


                  </button>


                </div>


                {/* =======================================
                    USER QUESTION
                ======================================= */}

                <div className="history-message">


                  <div className="history-message-label">


                    <div className="history-user-icon">

                      <User
                        size={14}
                      />

                    </div>


                    <strong>

                      You

                    </strong>


                  </div>


                  <div className="history-question">

                    {item.question}

                  </div>


                </div>


                {/* =======================================
                    AI ANSWER
                ======================================= */}

                <div className="history-message">


                  <div className="history-message-label">


                    <div className="history-ai-icon">

                      <Bot
                        size={14}
                      />

                    </div>


                    <strong>

                      DocuMind AI

                    </strong>


                    <span className="history-ai-badge">

                      <Sparkles
                        size={8}
                      />

                      AI

                    </span>


                  </div>


                  <div className="history-answer">

                    {item.answer}

                  </div>


                </div>


              </article>


            )
          )}


        </div>

      )}


    </div>

  );

}


export default HistoryPage;