import "./chat.css";
// React
import React from 'react'
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
// others
import axios from "axios";
import Cookies from "js-cookie";
// Contexts
import { useUserContext } from "../../Context/userContext";
import { UserContext } from "../../Context/userContext";
// Components
import BtnLogout from "../BtnLogout/btnLogout";
import { useInteractionsContext } from "../../Context/interactionsContext";
import PublicProfile from "../PublicProfile/public-profile";


function Chat() {
  const navigate = useNavigate();
  // states
  const { tabActive, user, setProfileVisible , profileVisible, userSelected, setUserSelected } = useContext(UserContext);
  const [visible, setVisible] = useState(false);
  const [navVisible, setNavVisible] = useState(false);
  const [convOpen, setConvOpen] = useState(false);
  
  // interactions
  const [msgContent, setMsgContent] = useState('');
  const [convSelected, setConvSelected] = useState([]);
  const { sendLogout, sendMsg, matches, blocked, recvmsg, setRecvmsg, fetchFriendship, messages, setMessages, getMessages, allNotifsMsg, deleteNotif, setAllNotifsMsg, setWitchConvUser, witchConvUser } = useInteractionsContext();
	const { setTabActive } = useUserContext();
  const [allUsers, setAllUsers] = useState([]);


  // useEffects
  useEffect(() => {
    if (tabActive === "chat") {
      fetchFriendship()
      setVisible(true);
    } else {
      setVisible(false);
    }
    setNavVisible(false);
  }, [tabActive]);

  useEffect(() => {
    fetchFriendship();
  }, [visible])

  useEffect(() => {
    getMatchesUsers();
    const allUsersfiltered = allUsers.filter(user => !user.blocked?.includes(user.userid))
    setAllUsers(allUsersfiltered)
  }, [matches, blocked])

  useEffect(() => {
    getMessages(witchConvUser);
    setRecvmsg(false)
  }, [recvmsg])


  // functions
  const navbarVisible = () => {
    fetchFriendship()
    getMatchesUsers();
    setNavVisible(!navVisible);
  };

  async function getMatchesUsers() {
    try {
      const usersPromises = matches
      .filter(match => !user.blocked?.includes(match) )
      .map((match) => {
        return getUser(match);
      });
  
      const users = await Promise.all(usersPromises);
      const allusers = users.filter(profile => !user.blocked?.includes(profile.userid) )

      setAllUsers(allusers);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs des matchs :', error);
    }
  }

  function getUser(userid) {
    const jwtToken = Cookies.get('jwtToken');
    if (user.blocked.includes(userid)) return;
    return new Promise((resolve, reject) => {
      axios
        .get(`http://localhost:8080/get_user_by_id/${userid}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          sendLogout(user.userid)
          Cookies.remove('jwtToken');
          navigate('/portal');
          reject(error);
        });
    });
  }

  const openConversation = (user) => {
    setAllNotifsMsg(prevNotifs => prevNotifs.filter(id => id !== user.userid));
    setWitchConvUser(user.userid)
    setNavVisible(!navVisible);
    getMessages(user.userid)
    setConvSelected(user)
    setConvOpen(true)
    deleteNotif(user.userid)
  }

  const sendMessage = (event) => {
    event.preventDefault(); 
    if (msgContent !== '') {
      sendMsg(convSelected.userid, msgContent)
      setMsgContent('')
      setAllNotifsMsg(prevNotifs => prevNotifs.filter(id => id !== convSelected.userid))
      deleteNotif(convSelected.userid)
      setMessages([...messages, {content:msgContent, sourceuserid: user.userid, targetuserid: convSelected.userid}])
    }
  };

  async function openProfile(profileid) {
    const jwtToken = Cookies.get('jwtToken');

    axios
      .get(`http://localhost:8080/get_public_profile_by_id/${profileid}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      })
      .then((response) => {
        setWitchConvUser(null)
        setConvOpen(false)
        setUserSelected(response.data)
        setProfileVisible(true);
        setTabActive("publicprofile")
      })
      .catch((error) => {
        sendLogout(user.userid)
        Cookies.remove('jwtToken');
        navigate('portal');
      });
  }

  return (
    <>
    <div className={`chat ${visible === true ? "active" : ""}`}>
      <BtnLogout />
      <div className={`${navVisible === true ? "navVisible" : "navChat"}`}>
        <div className="navBarChat">

          {allUsers.map((user, index) => (
            <div key={index} className="conversation" >
            {allNotifsMsg.length > 0 && allNotifsMsg.includes(user.userid) &&
              <div style={{right: '5px', display: 'flex', justifyContent: 'center', width: '35px', height: '35px', position: 'absolute', background: 'red', color: 'white', borderRadius: '50px'}}>
                <img src={require("../../assets/visibility.png")} alt=""/>
              </div>
            }
              <img src={require("../../assets/pngwing.com.png")} alt="" onClick={() => openProfile(user.userid)}/>
              <div className="user" onClick={() => openConversation(user)}>
                <p>{user.firstname}</p>
              </div>
            </div>
          ))}

          <button
            className="btnNav"
            onClick={() => {
              navbarVisible();
            }}
          >
            |||
          </button>
        </div>
      </div>

      <div className="currentConv">
        {convOpen && convSelected && witchConvUser ? (
          <div className="currentConvContainer">
            <div className="content">
              {messages && 
                messages?.map((message, index) => (
                  <div key={index} className={message.sourceuserid === user.userid ? "messagecontainer mymsg" : "messagecontainer hismsg"}>
                    <p key={message.messageid} className="message" >{message.sourceuserid === convSelected.userid ? convSelected.firstname : user.firstname}: {message.content}</p>
                  </div>
                ))
              }
            </div>
            <form onSubmit={sendMessage} className="inputMsg">
              <input
                autoFocus
                type="msgContent"
                id="msgContent"
                name="msgContent"
                value={msgContent}
                onChange={(e) => setMsgContent(e.target.value)}
              />
              <button type="submit">Send</button>
            </form>
          </div>
        ) : (
          <h2>Aucune Conversation selectionnee</h2>
        )}
      </div>
    </div>
      {profileVisible && <PublicProfile {...userSelected} />}
      </>
  );
}

export default Chat;
