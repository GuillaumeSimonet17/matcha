import "./btnLogout.css";
// React
import React, { useContext } from 'react';
import { useNavigate } from "react-router-dom";
// others
import Cookies from 'js-cookie';
// contexts
import { UserContext } from "../../Context/userContext";
import { useInteractionsContext } from "../../Context/interactionsContext";


function BtnLogout() {
  const navigate = useNavigate();

  const { user } = useContext(UserContext);
  const { sendLogout } = useInteractionsContext();

  // functions
  const logout = () => {
    sendLogout(user.userid)
    Cookies.remove('jwtToken');
    navigate('/portal')
  };

  return (
      <div className="header">
        <p>MATCHA</p>
    <div className="btn-logout">
        <button onClick={() => logout()}>
          <svg
            fill="#000000"
            height="30px"
            width="30px"
            version="1.1"
            id="Capa_1"
            viewBox="0 0 384.971 384.971"
          >
            <path
              d="M180.455,360.91H24.061V24.061h156.394c6.641,0,12.03-5.39,12.03-12.03s-5.39-12.03-12.03-12.03H12.03
        C5.39,0.001,0,5.39,0,12.031V372.94c0,6.641,5.39,12.03,12.03,12.03h168.424c6.641,0,12.03-5.39,12.03-12.03
        C192.485,366.299,187.095,360.91,180.455,360.91z"
            />
            <path
              d="M381.481,184.088l-83.009-84.2c-4.704-4.752-12.319-4.74-17.011,0c-4.704,4.74-4.704,12.439,0,17.179l62.558,63.46H96.279
        c-6.641,0-12.03,5.438-12.03,12.151c0,6.713,5.39,12.151,12.03,12.151h247.74l-62.558,63.46c-4.704,4.752-4.704,12.439,0,17.179
        c4.704,4.752,12.319,4.752,17.011,0l82.997-84.2C386.113,196.588,386.161,188.756,381.481,184.088z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default BtnLogout;
