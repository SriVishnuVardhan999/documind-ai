import { useNavigate } from "react-router-dom";
import { FileText, ArrowRight } from "lucide-react";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">

      <nav className="navbar">

        <div className="logo">
          <FileText size={30} />
          <h2>DocuMind AI</h2>
        </div>

        <button
          className="login-btn"
          onClick={() => navigate("/login")}
        >
          Login
        </button>

      </nav>

      <div className="hero">

        <h1>
          Intelligent Document Analysis
        </h1>

        <p>
          Upload PDFs, DOCX and TXT files.
          Search documents, ask AI questions,
          generate summaries and manage your knowledge
          with DocuMind AI.
        </p>

        <button
          className="start-btn"
          onClick={() => navigate("/dashboard")}
        >
          Get Started
          <ArrowRight size={20} />
        </button>

      </div>

    </div>
  );
}

export default Home;