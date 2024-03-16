import "./App.css";
import React from 'react';
// import UserContext from './Contexts/UserContext';
import Navbar from "./Component/Navbar/navbar";
import Search from "./Component/Search/search";
import Notifications from "./Component/Notifications/notifications";
import Profile from "./Component/Profile/profile";
import Settings from "./Component/Settings/settings";
import Portal from "./Component/Portal/portal";
import Chat from "./Component/Chat/chat";
import AuthGuard from "./Component/AuthGuard/AuthGuard";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Contexts } from "./Context/Contexts";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/portal" element={<Portal/>}></Route>
          <Route
            path="/"
            element={
              <AuthGuard>
                <Contexts>
                  <Chat />
                  <Navbar />
                  <Notifications />
                  <Search />
                  <Settings />
                  <Profile />
                </Contexts>
              </AuthGuard>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
