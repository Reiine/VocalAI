import React from "react";
import "./assets/css/WelcomeScreen.css";
import logo from "./assets/images/hero-pic.jpg";
import { Link } from "react-router-dom";
import { auth, provider } from "../config/firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

function WelcomeScreen({ setIsLoggedIn }) {
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userData = {
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
      };
      Cookies.set("user", JSON.stringify(userData), { expires: 7 });
      Cookies.set("isLoggedIn",true);
      setIsLoggedIn(true);
      navigate("/");
    } catch (error) {
      console.log("Error signing in: ", error);
    }
  };

  return (
    <div className="welcome-container">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">
          <span className="logo-icon">🗨️</span>
          <span className="logo-text">DebateMaster</span>
        </div>
        <button onClick={handleSignIn} className="get-started-btn">
          Get Started →
        </button>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <p className="subtitle">✨ Master English Through AI Debates</p>
          <h1>
            Debate Your Way to <span className="highlight">Fluency</span>
          </h1>
          <p className="description">
            Practice spoken English through engaging debates with AI. Get
            instant feedback on grammar, confidence, vocabulary, and speaking
            clarity.
          </p>
          <div className="hero-buttons">
            <button className="primary-btn" onClick={handleSignIn}>
              Start Practicing Now
            </button>
            <a href="#features" className="secondary-btn">
              Features
            </a>
          </div>
        </div>
        <div className="hero-image">
          <img src={logo} alt="AI Analysis Example" />
          <div className="live-analysis">
            <span className="dot"></span> Live AI Analysis – Real-time feedback
            on your speaking performance
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <h2>How DebateMaster Works</h2>
        <p className="features-subtitle">
          Our AI-powered platform provides personalized English learning through
          interactive debates
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="icon">💬</div>
            <h3>AI-Powered Debates</h3>
            <p>
              Engage in real conversations on diverse topics with our
              intelligent AI tutor.
            </p>
          </div>
          <div className="feature-card">
            <div className="icon">📊</div>
            <h3>Detailed Analysis</h3>
            <p>
              Get comprehensive feedback on grammar, vocabulary, confidence, and
              clarity.
            </p>
          </div>
          <div className="feature-card">
            <div className="icon">👥</div>
            <h3>Progress Tracking</h3>
            <p>
              Monitor your improvement over time with detailed statistics and
              insights.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta">
        <div className="cta-text">
          <h2>Transform Your English Speaking Skills</h2>
          <ul>
            <li>✅ Improve speaking confidence through practice</li>
            <li>✅ Learn proper grammar and vocabulary usage</li>
            <li>✅ Develop critical thinking and argumentation skills</li>
            <li>✅ Track your progress with detailed analytics</li>
          </ul>
        </div>
        <div className="cta-box">
          <h3>Ready to Begin?</h3>
          <p>
            Join thousands of learners improving their English through
            AI-powered debates.
          </p>
          <button onClick={handleSignIn} className="cta-box-button primary-btn">
            Start Your First Debate →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <span className="logo-text">DebateMaster</span>
        <p>Powered by advanced AI • Built for English learners worldwide</p>
      </footer>
    </div>
  );
}

export default WelcomeScreen;
// Image by <a href="https://pixabay.com/users/kirill_makes_pics-5203613/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=2539844">kirill_makes_pics</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=2539844">Pixabay</a>
