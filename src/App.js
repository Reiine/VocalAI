import "./App.css";
import WelcomeScreen from "./components/WelcomeScreen";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import DebateSession from "./components/DebateSession";
import Stats from "./components/Stats";
import StatsDetails from "./components/StatsDetails";
import Compare from "./components/Compare";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  

  useEffect(() => {
    const temp = Cookies.get("user");
    if (temp) {
      try {
        const parsedUser = JSON.parse(temp);
        setUser(parsedUser);
        setIsLoggedIn(Cookies.get("isLoggedIn"));
        console.log("User from cookie:", parsedUser);
      } catch (error) {
        console.error("Error parsing cookie:", error);
      }
    } else {
      setUser(null);
    }
  }, [isLoggedIn]);

  return (
    <Router>
      {isLoggedIn ? (
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/debate/:title" element={<DebateSession />} />
          <Route path="/stats/" element={<Stats/>}/>
          <Route path="/stats/:id" element={<StatsDetails/>}/>
          <Route path="/compare/:id" element={<Compare/>}/>
        </Routes>
      ) : (
        <Routes>
          <Route
            path="/"
            element={<WelcomeScreen setIsLoggedIn={setIsLoggedIn} />}
          />
        </Routes>
      )}
    </Router>
  );
}

export default App;
