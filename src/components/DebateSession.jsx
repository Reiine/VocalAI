import React, { useState, useEffect, useRef } from "react";
import "./assets/css/DebateSession.css";
import { FaArrowLeft, FaMicrophone, FaPaperPlane } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../config/firebaseConfig";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import Cookies from "js-cookie";

const DebateSession = () => {
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const { title } = useParams();
  const [allUserReplies, setAllUserReplies] = useState([]);

  const [timerRunning, setTimerRunning] = useState(false);
  const [messages, setMessages] = useState([]);


  const timerRef = useRef(null);

  useEffect(() => {
    const fetchStartMessage = async () => {
      try {
        const res = await fetch("http://localhost:5000/start-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });

        const data = await res.json();

        setMessages([
          {
            sender: "ai",
            text: data.startMessage,
            time: "Now",
          },
        ]);

        speakText(data.startMessage);
      } catch (err) {
        console.error("Error fetching start message:", err);
      }
    };

    fetchStartMessage();
  }, [title]);

  // Speech recognition
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setInput(text);
      };

      recognition.onend = () => {
        setRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // TIMER FUNCTIONS
  const startTimer = () => {
    if (timerRunning) return; // Already running

    setTimerRunning(true);

    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    setTimerRunning(false);
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  // Text-to-Speech function
  const speakText = (text) => {
    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.cancel(); // stop previous speech
    window.speechSynthesis.speak(utterance);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // MIC CLICK
  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Browser does not support speech recognition.");
      return;
    }

    setRecording(true);
    startTimer();
    recognitionRef.current.start();
  };

  // SEND MESSAGE
  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user reply
    setAllUserReplies((prev) => [...prev, input]);

    // Add to UI
    setMessages((prev) => [...prev, { sender: "user", text: input }]);

    // Send to backend
    const res = await fetch("http://localhost:5000/debate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, topic: "Social Media" }),
    });

    const data = await res.json();

    // Add AI reply
    setMessages((prev) => [...prev, { sender: "ai", text: data.reply }]);

    // 🔊 Speak AI reply
    speakText(data.reply);

    setInput("");
  };

  const handleEndSession = async () => {
    try {
      const userCookie = Cookies.get("user");
      const user = userCookie ? JSON.parse(userCookie) : null;

      if (!user) {
        alert("User not found in cookies.");
        return;
      }

      // ----- SEND TO BACKEND FOR FEEDBACK -----
      const feedbackRes = await fetch("http://localhost:5000/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          replies: allUserReplies,
        }),
      });

      const feedbackResult = await feedbackRes.json();

      console.log("Backend raw:", feedbackResult);

      // ❗ FIX: Gemini JSON already parsed, use directly
      const feedback = feedbackResult.feedback;

      // ----- SAVE SESSION IN FIREBASE -----
      await addDoc(collection(db, "debateSessions"), {
        topic: title,
        duration: timer,
        userReplies: allUserReplies,
        feedback: feedback,
        user: {
          name: user.name,
          email: user.email,
        },
        timestamp: Timestamp.now(),
      });

      alert("Session saved!");
      navigate("/stats");
    } catch (error) {
      console.error("Error saving debate session:", error);
      alert("Failed to store session.");
    }
  };

  return (
    <div className="debate-session">
      {/* HEADER */}
      <div className="debate-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>

        <div className="debate-title">
          <h2>{title}</h2>
        </div>

        <div className="session-actions">
          <span className="timer">⏱ {formatTime(timer)}</span>
          <span className="speech-enabled">🔊</span>
          <button className="end-btn" onClick={handleEndSession}>
            End Session
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="debate-body">
        {/* LEFT SIDE CHAT */}
        <div className="debate-conversation">
          <h3>💬 Debate Conversation</h3>

          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.sender}`}>
              <p>{msg.text}</p>
              <span className="meta">{msg.time}</span>
            </div>
          ))}

          <div className="input-box">
            <FaMicrophone
              className={`mic-icon ${recording ? "recording" : ""}`}
              onClick={startListening}
            />

            <input
              type="text"
              placeholder="Type your argument..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <button className="send-btn" onClick={handleSend}>
              <FaPaperPlane />
            </button>
          </div>

          <p className="input-hint">
            Press <b>Ctrl+Enter</b> to send • Click mic to record voice
          </p>
        </div>

        {/* SIDEBAR */}
        <div className="debate-sidebar">
          <div className="info-card">
            <h3>Debate Info</h3>
            <p>
              <b>Topic:</b> {title}
            </p>
            <p>
              <b>Difficulty:</b>{" "}
              <span className="tag intermediate">Intermediate</span>
            </p>
            <p>
              <b>Duration:</b> {formatTime(timer)}
            </p>
            <p>
              <b>Exchanges:</b> {messages.length - 1}
            </p>
            <p>
              <b>Speech Status:</b> ✅ Enabled
            </p>
            <div className="tip-box">
              💡 Send your first message to save this debate to history
            </div>
          </div>

          <div className="voice-card">
            <h3>🎤 Voice Tips</h3>
            <ul>
              <li>Speak clearly and slowly</li>
              <li>Avoid long pauses</li>
              <li>Speak for a longer duration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebateSession;
