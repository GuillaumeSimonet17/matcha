// React
import React from 'react';
import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// others
import axios from "axios";
import Cookies from "js-cookie";
import io from "socket.io-client";

const UserContext = createContext({ 
  socket: null,
  user: {},
  tabActive: '',
  id: null,

  fetchContext: () => Promise,
});

export function useUserContext() {
  return useContext(UserContext);
}


const UserContextProvider = ({ children }) => {
  const navigate = useNavigate();
  // states
  const [tabActive, setTabActive] = useState("search");
  // users
  const [user, setUser] = useState({});
  const [id, setId] = useState();
  const [socket, setSocket] = useState(null);
  const [profileVisible, setProfileVisible] = useState(false);
  const [userSelected, setUserSelected] = useState({});


  // useEffects
  useEffect(() => {
    fetchContext()
    const newSocket = io("http://localhost:8080")
    if (newSocket) {
      setSocket(newSocket);
    }
    // eslint-disable-next-line no-unused-expressions
  }, []);

  useEffect(() => {
    if (socket) {
      socket.emit('setUserSocket', user.userid)
    }
    // eslint-disable-next-line no-unused-expressions
  }, [user, socket])

  // functions
  function fetchContext() {
    const jwtToken = Cookies.get("jwtToken");
    try {
      axios
        .get("http://localhost:8080/get_user", {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        })
        .then((response) => {
          setUser(response.data);
          setId(response.data.userid)
        })
        .catch((error) => {
          Cookies.remove('jwtToken')
          navigate("/")
          console.log('error : ', error);
        });

    } catch (e) {
      console.log(e);
    }
  }
  
  return (
    <UserContext.Provider value={{
      tabActive,
      setTabActive,
      fetchContext,
      user,
      id,
      socket,
      fetchContext,
      profileVisible, setProfileVisible,
      userSelected, setUserSelected,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserContextProvider };
