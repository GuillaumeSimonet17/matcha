// React
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// others
import Cookies from 'js-cookie';
import axios from "axios";
// Context
import { useUserContext } from "./userContext";


const InteractionsContext = createContext({
  blocked: [],

  sendLike: (to) => { void to },
  sendUnlike: (to) => { void to },
  sendMsg: (to) => { void to },
  sendBlock: (to) => { void to },

  sendLogout: (userid) => { void userid },

  fetchFriendship: () => Promise,
  getMessages: () => Promise,
  getNotifsMsg: () => Promise,
  getNotifs: () => Promise,
});

export function useInteractionsContext() {
  return useContext(InteractionsContext);
}


const InteractionsContextProvider = ({ children }) => {
  const navigate = useNavigate();
	// users
	const { socket } = useUserContext();
  // const [isNotifs, setIsNotifs] = useState(false)
  const [user, setUser] = useState(false)

  const [blocked, setBlocked] = useState([])
  const [likes, setLikes] = useState([])
  const [liked, setLiked] = useState([])
  const [unlikes, setUnlikes] = useState([])
  const [unliked, setUnliked] = useState([])
  const [matches, setMatches] = useState([])
  const [messages, setMessages] = useState([]);
  const [allNotifsMsg, setAllNotifsMsg] = useState([]);
  const [allNotifsFriendship, setAllNotifsFriendship] = useState([]);
  const [witchConvUser, setWitchConvUser] = useState(null);
  const [recvmsg, setRecvmsg] = useState(false);


  // function
  async function getUser() {
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

  async function fetchFriendship() {
    const jwtToken = Cookies.get("jwtToken");
   
    await getUser();
    if (!user.userid) return ;
    setBlocked(user.blocked)
    try {
      axios
        .get(`http://localhost:8080/get_friendships/${user.userid}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        })
        .then((response) => {
          if (response.data.length !== 0) {

            if (!Array.isArray(response.data))
            response.data = [response.data]
          
            const fs1 = response.data
            fs1
            .filter(friendship => friendship.status === 'l')
            .forEach(friendship => {
              if (friendship.sourceuserid === user.userid) {
                setLiked([...liked, friendship.targetuserid]);
                setUnliked(unliked.filter(unlike => unlike !== friendship.targetuserid));
              }
              if (friendship.targetuserid === user.userid) {
                setLikes([...likes, friendship.sourceuserid]);
                setUnlikes(unliked.filter(unlike => unlike !== friendship.sourceuserid));
              }
            });

            const fs3 = response.data
            fs3
            .filter(friendship => friendship.status === 'u')
            .forEach(friendship => {
              if (friendship.sourceuserid === user.userid) {
                setUnliked([...unliked, friendship.targetuserid]);
                setLiked(liked.filter(like => like !== friendship.targetuserid));
              }
              if (friendship.targetuserid === user.userid) {
                setUnlikes([...unlikes, friendship.sourceuserid]);
                setLikes(likes.filter(like => like !== friendship.sourceuserid));
              }
            });
            

            const fs2 = response.data
            fs2
            .filter(friendship => friendship.status === 'c')
            .forEach(friendship => {
              if (friendship.sourceuserid === user.userid) {
                if (!matches.includes(friendship.targetuserid)) {
                  setMatches([...matches, friendship.targetuserid]);
                  setLikes(likes.filter(like => like !== friendship.targetuserid));
                  setLiked(liked.filter(like => like !== friendship.targetuserid));
                }
              }
              else if (friendship.sourceuserid !== user.userid) {
                if (!matches.includes(friendship.sourceuserid)) {
                  setMatches([...matches, friendship.sourceuserid]);
                  setLikes(likes.filter(like => like !== friendship.sourceuserid));
                  setLiked(liked.filter(like => like !== friendship.sourceuserid));
                }
                }
            });
          }
        })
        .catch((error) => {
          Cookies.remove('jwtToken')
          navigate("/portal")
          console.log('error : ', error);
        });
    } catch (e) {
      console.log(e);
    }
  }

  function getMessages(targetid) {
    const jwtToken = Cookies.get("jwtToken");
    if (!user) return ;
    const userid = user.userid
    try {
      axios
        .get(`http://localhost:8080/get_messages/${userid}/${targetid}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        })
        .then((response) => {
          if (response.data) {
            if (!Array.isArray(response.data))
              response.data = [response.data]
            const allmessages = response.data
            allmessages.filter(msg => !user.blocked?.includes(msg.sourceUserId) )
            setMessages(allmessages);
          }
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

  async function getNotifsMsg() {
    try {
      const jwtToken = Cookies.get("jwtToken");
      const userid = user.userid;
      if (userid) {
        axios
          .get(`http://localhost:8080/get_all_notifs/${userid}`, {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          })
          .then((response) => {
            if (response.data) {
              const allnotif = response.data.filter(notif => !user.blocked?.includes(notif.sourceuserid) )
              const filteredNotifs = allnotif.filter(notif => notif.type === 'm');
              const ids = filteredNotifs.map(notif => notif.sourceuserid);
              setAllNotifsMsg(ids);
            }
          })
          .catch((error) => {
            sendLogout(user.userid)
            Cookies.remove("jwtToken");
            navigate("/portal");
            console.log("error : ", error);
          });
      }
    } catch (e) {
      console.log(e);
    }
  }

  function getNotifs() {
    try {
      const jwtToken = Cookies.get("jwtToken");
      const userid = user.userid;
      if (userid) {
        axios
          .get(`http://localhost:8080/get_all_notifs/${userid}`, {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          })
          .then((response) => {
            const allnotif = response.data.filter(notif => !user.blocked?.includes(notif.sourceuserid) )

            // const filteredNotifs = allnotif.filter(notif => notif.type === 'l' || notif.type === 'c' || notif.type === 'v'  || notif.type === 'u');
            // const ids = filteredNotifs.map(notif => notif.sourceuserid);
            // setAllNotifsFriendship(ids);

            const uniqueNotifsOfTypeV = Array.from(new Set(allnotif.filter(notif => notif.type === 'v').map(notif => notif.sourceuserid))).map(sourceuserid => {
              return allnotif.find(notif => notif.sourceuserid === sourceuserid && notif.type === 'v');
            });

            const otherNotifs = allnotif.filter(notif => notif.type !== 'v' && notif.type !== 'm');
            const filteredNotifs = [...uniqueNotifsOfTypeV, ...otherNotifs];
            const ids = filteredNotifs.map(notif => notif.sourceuserid);
            setAllNotifsFriendship(ids);
          })
          .catch((error) => {
            sendLogout(user.userid)
            Cookies.remove("jwtToken");
            navigate("/portal");
            console.log("error : ", error);
          });
      }
    } catch (e) {
      console.log(e);
    }
  }

	// useEffects
  useEffect(() => {
    // eslint-disable-next-line no-unused-expressions
    socket?.on('like', onReceiveLike);
    // eslint-disable-next-line no-unused-expressions 
    socket?.on('unlike', onReceiveUnlike);
    // eslint-disable-next-line no-unused-expressions
    socket?.on('msg', onReceiveMsg);
    // eslint-disable-next-line no-unused-expressions
    
		return () => {
      // eslint-disable-next-line no-unused-expressions
      socket?.off('like', onReceiveLike);
      // eslint-disable-next-line no-unused-expressions
      socket?.off('unlike', onReceiveUnlike);
      // eslint-disable-next-line no-unused-expressions
      socket?.off('msg', onReceiveMsg);
      // eslint-disable-next-line no-unused-expressions
    };
    // eslint-disable-next-line
  }, [socket]);

	// -- Event emissions ------------------------------------------------
	function sendLike(to) {
    // eslint-disable-next-line no-unused-expressions
    socket?.emit('like', {senderId: user.userid, receiverId: to})
    if (likes.includes(to)) {
      setMatches([...matches, to])
    }
    else {
      setLiked([...liked, to])
      setUnliked(unliked.filter(unlike => unlike !== to))
    }
    // eslint-disable-next-line no-unused-expressions
	}
	function sendUnlike(to) {
    // eslint-disable-next-line no-unused-expressions
    socket?.emit('unlike', {senderId: user.userid, receiverId: to})
    setUnliked([...unliked, to])
    setLiked(liked.filter(liked => liked !== to))
    setMatches(matches.filter(match => match !== to))
    // eslint-disable-next-line no-unused-expressions
	}
  function sendBlock(to) {
    // eslint-disable-next-line no-unused-expressions
    socket?.emit('block', {senderId: user.userid, receiverId: to})
    setBlocked([...blocked, to])
    // eslint-disable-next-line no-unused-expressions
	}
	function sendMsg(to, content) {
    // eslint-disable-next-line no-unused-expressions
    socket?.emit('msg', {senderId: user.userid, receiverId: to, content: content})
    // eslint-disable-next-line no-unused-expressions
	}
  function sendLogout(userid) {
    socket?.emit('logout', userid)
  }

	// -- Event receptions ------------------------------------------------
  async function onReceiveLike(msg) {
    await fetchFriendship()
    if (unliked?.includes(msg.sender) || blocked?.includes(msg.sender))
      return;
    if (msg.status === 'c') {
      if (!matches.includes(msg.sender))
        setMatches([...matches, msg.sender])
      setLikes(likes.filter(likes => likes !== msg.sender))
    }
    else {
      setUnlikes(unlikes.filter(unlike => unlike !== msg.sender))
      setLikes([...likes, msg.sender])
    }
    setAllNotifsFriendship([...allNotifsFriendship, msg.sender])
    // setIsNotifs(true)
  }
  function onReceiveUnlike(msg) {
    if (blocked?.includes(msg.sender))
      return;
    setUnlikes([...unlikes, msg.sender])
    setLikes(likes.filter(likes => likes !== msg.sender))
    setMatches(matches.filter(match => match !== msg.sender))
  }
  async function isThereNotif(userid) {
    if (!userid) return ;
    console.log('ici boyyy => ', userid);
    const jwtToken = Cookies.get('jwtToken');
    try {
      const response = await axios.get(`http://localhost:8080/is_there_notif/${user.userid}/${userid}/${'m'}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      if (response.data.length > 0) {
        return [response.data[0]];
      }
      return false;
    } catch (error) {
      sendLogout(user.userid);
      Cookies.remove('jwtToken');
      navigate('portal');
      console.error('Erreur lors de la récupération des utilisateurs des matchs :', error);
    }
  }
  async function deleteNotif(userid) {
    const notif = await isThereNotif(userid);
    if (!notif) return;
    const notifid = notif[0].notificationid
    const jwtToken = Cookies.get('jwtToken');
    axios
      .delete(`http://localhost:8080/delete_notif/${notifid}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      })
      .then((response) => {
        // if (response.data)
          // getNotifs()
      })
      .catch((error) => {
        sendLogout(user.userid)
        Cookies.remove('jwtToken');
        navigate('portal');
      });
  }
  function onReceiveMsg(msg) {
    if (unlikes?.includes(msg.sender) || blocked?.includes(msg.sender))
      return;

    setMessages([...messages, msg])
    if (witchConvUser !== msg.sender) {
      setAllNotifsMsg([...allNotifsMsg, msg.sender])
    } else if (witchConvUser === msg.sender) {
      deleteNotif(msg.sender)
      setAllNotifsMsg(allNotifsMsg.filter(ntfmsg => ntfmsg !== msg.sender))
    }
    setRecvmsg(true)
  }

  return (
    <InteractionsContext.Provider value={{
			sendLike,
      sendUnlike,
      sendBlock,
      sendMsg, 
      sendLogout,

      recvmsg, setRecvmsg,

      allNotifsMsg, setAllNotifsMsg,
      getNotifsMsg,
      allNotifsFriendship, setAllNotifsFriendship,
      getNotifs, deleteNotif, 
      isThereNotif,

      witchConvUser, setWitchConvUser,

      likes, liked,
      unlikes, unliked,
      blocked,
      matches,
      messages, setMessages,

      getMessages,

    
      fetchFriendship
		}}>
      {children}
    </InteractionsContext.Provider>
  );
};

export { InteractionsContext, InteractionsContextProvider };
