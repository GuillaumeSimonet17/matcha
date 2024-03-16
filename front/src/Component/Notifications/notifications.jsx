import "./notifications.css";
// React
import React from 'react'
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
// others
import axios from "axios";
import Cookies from "js-cookie";
// Contexts
import { UserContext } from "../../Context/userContext";
import { useInteractionsContext } from "../../Context/interactionsContext";
// Components
import BtnLogout from "../BtnLogout/btnLogout";

function Notifications() {
  const navigate = useNavigate();
  // states
  const [visible, setVisible] = useState(false);
  const { tabActive, user, setTabActive, setProfileVisible, setUserSelected } = useContext(UserContext);
  const [notifs, setNotifs] = useState([]);
  const { sendLogout } = useInteractionsContext()
  // profile
  const [firstname, setFirstnames] = useState({});


  // useEffects
  useEffect(() => {
    if (tabActive === "notifs") {
      setUserSelected()
      getNotifs();
      setVisible(true);
    } else {
      setVisible(false);
    }
    // eslint-disable-next-line
  }, [tabActive]);

  useEffect(() => {
    displayNotifs()
  }, [notifs])

  useEffect(() => {
    Object.values(notifs).forEach((notif, index) => {
      getFirstname(notif.sourceuserid)
        .then((firstname) => {
          setFirstnames((prevUsernames) => ({
            ...prevUsernames,
            [index]: firstname,
          }));

        })
        .catch((error) => console.log('Error fetching username:', error));
    });
    // eslint-disable-next-line
  }, [notifs]);

  // functions
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
            if (response.data) {
              const allnotif = response.data.filter(notif => !user.blocked?.includes(notif.sourceuserid))

              const uniqueNotifsOfTypeV = Array.from(new Set(allnotif.filter(notif => notif.type === 'v').map(notif => notif.sourceuserid))).map(sourceuserid => {
                return allnotif.find(notif => notif.sourceuserid === sourceuserid && notif.type === 'v');
              });
              const otherNotifs = allnotif.filter(notif => notif.type !== 'v');
              const uniqueNotifs = [...uniqueNotifsOfTypeV, ...otherNotifs];
              setNotifs(uniqueNotifs);
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

  function getNotificationLabel(type) {
    switch (type) {
      case 'l':
        return 'like';
      case 'u':
        return 'unlike';
      case 'c':
        return 'match';
      case 'v':
        return 'viewed';
      case 'u':
        return 'unlike';
    }
  }
  
  function displayNotifs() {
    return (
      <ul>
        {Object.values(notifs)
          .filter(notif => notif.type !== 'm')
          .map((notif, index) => (
            <li onClick={() => clickOnNotif(notif)} key={index}>
              {notif.type === 'v' ?
                (
                  <>{firstname[index]} a vu votre profile {" "}</>
                ) : (
                  <>
                    {firstname[index]} vous a envoyé un {" "}
                    {getNotificationLabel(notif.type)}
                  </>
                )
              }
            </li>
          ))}
      </ul>
    );
  }

  function getFirstname(userid) {
    const jwtToken = Cookies.get('jwtToken');
    return new Promise((resolve, reject) => {
      axios
        .get(`http://localhost:8080/get_user_by_id/${userid}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        })
        .then((response) => {
          resolve(response.data.firstname);
        })
        .catch((error) => {
          sendLogout(user.userid)
          Cookies.remove('jwtToken');
          navigate('portal');
          reject(error);
        });
    });
  }

  function clickOnNotif(notif) {
    const notifid = notif.notificationid
    openProfile(notif.sourceuserid)
    const jwtToken = Cookies.get('jwtToken');
    axios
      .delete(`http://localhost:8080/delete_notif/${notifid}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      })
      .then((response) => {
        if (response.data)
          getNotifs()
      })
      .catch((error) => {
        sendLogout(user.userid)
        Cookies.remove('jwtToken');
        navigate('portal');
      });
  }

  async function openProfile(profileid) {
    const jwtToken = Cookies.get('jwtToken');
    axios
      .get(`http://localhost:8080/get_public_profile_by_id/${profileid}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      })
      .then((response) => {
        setUserSelected(response.data)
        setTabActive("publicprofile")
        setProfileVisible(true);
      })
      .catch((error) => {
        sendLogout(user.userid)
        Cookies.remove('jwtToken');
        navigate('portal');
      });
  }



  return (
    <>
      <div className={`notifications ${visible === true ? "active" : ""}`}>
        <BtnLogout />
        <h1>Notification</h1>
        <div className="notifcontainer">
          <div className="messages notiftab">
            {notifs && (
              displayNotifs()
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Notifications;
