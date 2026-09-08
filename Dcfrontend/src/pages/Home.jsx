import { useNavigate } from "react-router-dom";
import {
  FileText,
  ArrowRight,
  Upload,
  Search,
  Bot,
  FileCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import Prism from "../components/Prism";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  // Scroll to section
  const scrollToSection = (sectionId) => {
    document
      .getElementById(sectionId)
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  return (
    <div className="home">

      {/* =====================================================
          PRISM BACKGROUND
      ====================================================== */}

      <div className="prism-background">
        <Prism
          animationType="rotate"
          timeScale={0.5}
          scale={3.6}
          noise={0}
          glow={1}
          height={3.5}
          baseWidth={5.5}
          hueShift={0}
          colorFrequency={1}
        />
      </div>

      {/* Background Overlay */}
      <div className="home-overlay"></div>


      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav className="navbar">

        {/* Logo */}
        <div
          className="logo"
          onClick={() => navigate("/")}
        >
          <div className="logo-icon">
            <FileText size={27} />
          </div>

          <h2>DocuMind AI</h2>
        </div>


        {/* Navigation */}
        <div className="nav-right">

          {/* About */}
          <button
            className="nav-link"
            onClick={() => scrollToSection("about")}
          >
            About
          </button>


          {/* Features */}
          <button
            className="nav-link"
            onClick={() => scrollToSection("features")}
          >
            Features
          </button>


          {/* Login */}
          <button
            className="nav-login"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

        </div>

      </nav>


      {/* =====================================================
          HERO SECTION
      ====================================================== */}

      <main className="hero">

        <div className="hero-content">

          {/* Badge */}
         

          {/* Heading */}
          <h1>
            Intelligent
            <span> Document Analysis</span>
          </h1>


          {/* Description */}
          <p>
            Transform your documents into knowledge.
            Upload PDFs, DOCX and TXT files, search
            content, ask AI questions and generate
            intelligent summaries — all in one secure
            workspace.
          </p>


          {/* Hero Button */}
          <div className="hero-buttons">

            <button
              className="start-btn"
              onClick={() => navigate("/dashboard")}
            >
              Get Started

              <ArrowRight size={20} />

            </button>

          </div>


          {/* Small Features */}
          <div className="hero-features">

            <div className="feature">

              <span>
                <Upload size={20} />
              </span>

              <p>Upload Documents</p>

            </div>


            <div className="feature">

              <span>
                <Search size={20} />
              </span>

              <p>Semantic Search</p>

            </div>


            <div className="feature">

              <span>
                <Bot size={20} />
              </span>

              <p>Ask AI</p>

            </div>


            <div className="feature">

              <span>
                <FileCheck size={20} />
              </span>

              <p>AI Summaries</p>

            </div>

          </div>

        </div>

      </main>


      {/* =====================================================
          ABOUT SECTION
      ====================================================== */}

      <section
        id="about"
        className="about-section"
      >

        <div className="section-content">

          <div className="section-badge">
            About DocuMind AI
          </div>

          <h2>
            Turn Documents Into
            <span> Knowledge</span>
          </h2>

          <p className="section-description">

            DocuMind AI is an intelligent document analysis
            platform designed to help users understand,
            search and interact with their documents using
            Artificial Intelligence.

          </p>


          <div className="about-grid">

            {/* About Card 1 */}
            <div className="about-card">

              <div className="about-icon">
                <FileText size={28} />
              </div>

              <h3>
                Smart Document Processing
              </h3>

              <p>
                Upload PDF, DOCX and TXT documents.
                DocuMind AI extracts and processes
                the content so it can be searched
                and analyzed.
              </p>

            </div>


            {/* About Card 2 */}
            <div className="about-card">

              <div className="about-icon">
                <Bot size={28} />
              </div>

              <h3>
                AI-Powered Understanding
              </h3>

              <p>
                Ask questions about your documents
                and receive intelligent answers based
                on the information contained in them.
              </p>

            </div>


            {/* About Card 3 */}
            <div className="about-card">

              <div className="about-icon">
                <ShieldCheck size={28} />
              </div>

              <h3>
                Private Workspace
              </h3>

              <p>
                Keep your documents organized in a
                dedicated workspace while interacting
                with your document knowledge.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FEATURES SECTION
      ====================================================== */}

      <section
        id="features"
        className="features-section"
      >

        <div className="section-content">

          <div className="section-badge">
            Powerful Features
          </div>

          <h2>
            Everything You Need For
            <span> Smarter Documents</span>
          </h2>

          <p className="section-description">

            DocuMind AI combines document processing,
            semantic search and AI capabilities into
            one simple platform.

          </p>


          <div className="features-grid">

            {/* Feature 1 */}
            <div className="feature-card">

              <div className="feature-card-icon">
                <Upload size={30} />
              </div>

              <h3>
                Document Upload
              </h3>

              <p>
                Upload PDF, DOCX and TXT files
                and prepare them for intelligent
                analysis.
              </p>

            </div>


            {/* Feature 2 */}
            <div className="feature-card">

              <div className="feature-card-icon">
                <Search size={30} />
              </div>

              <h3>
                Semantic Search
              </h3>

              <p>
                Search documents based on meaning
                instead of relying only on exact
                keyword matches.
              </p>

            </div>


            {/* Feature 3 */}
            <div className="feature-card">

              <div className="feature-card-icon">
                <Bot size={30} />
              </div>

              <h3>
                Ask AI
              </h3>

              <p>
                Ask natural-language questions and
                receive AI-generated answers from
                your document content.
              </p>

            </div>


            {/* Feature 4 */}
            <div className="feature-card">

              <div className="feature-card-icon">
                <FileCheck size={30} />
              </div>

              <h3>
                AI Summaries
              </h3>

              <p>
                Generate concise summaries to
                understand large documents faster.
              </p>

            </div>


            {/* Feature 5 */}
            <div className="feature-card">

              <div className="feature-card-icon">
                <ShieldCheck size={30} />
              </div>

              <h3>
                Secure Workspace
              </h3>

              <p>
                Organize your documents inside a
                dedicated workspace for easier
                management.
              </p>

            </div>


            {/* Feature 6 */}
            <div className="feature-card">

              <div className="feature-card-icon">
                <Sparkles size={30} />
              </div>

              <h3>
                AI-Powered Insights
              </h3>

              <p>
                Get meaningful insights from your
                documents without manually reading
                every page.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          CALL TO ACTION
      ====================================================== */}

      <section className="cta-section">

        <div className="cta-content">

          <h2>
            Ready to Explore Your Documents?
          </h2>

          <p>
            Start using DocuMind AI to upload,
            search and understand your documents.
          </p>

          <button
            className="start-btn cta-button"
            onClick={() => navigate("/dashboard")}
          >
            Get Started

            <ArrowRight size={20} />

          </button>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="home-footer">

        <div className="footer-logo">

          <div className="logo-icon">
            <FileText size={21} />
          </div>

          <strong>
            DocuMind AI
          </strong>

        </div>


        <div className="footer-text">

          <span>Private</span>

          <span>•</span>

          <span>Secure</span>

          <span>•</span>

          <span>AI Powered</span>

        </div>

      </footer>

    </div>
  );
}

export default Home;