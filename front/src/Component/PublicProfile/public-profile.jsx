import "./public-profile.css";
// React
import React from 'react';
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


function PublicProfile(userSelected) {
  const navigate = useNavigate();
  // states
  const [visible, setVisible] = useState(false);
  const [hasbeenViewed, setHasbeenViewed] = useState(false);
  const [ famerate, setFamerate ] = useState([]) 
  const { tabActive, fetchContext, user } = useContext(UserContext);
  // interactions
  const { sendLogout, likes, liked, sendLike, sendUnlike, matches, blocked, sendBlock, fetchFriendship, unlikes, unliked } = useInteractionsContext();

  // useEffects
  useEffect(() => {
    if (tabActive === "publicprofile") {
      fetchContext();
      fetchFriendship()
      saveVisitHist(userSelected.userid)
      hasViewed(userSelected.userid)
      setVisible(true);
    } else {
      setVisible(false);    
    }
    // eslint-disable-next-line
  }, [tabActive]);

  useEffect(() => {
    fetchContext();
    fetchFriendship()
    fame_rate_calcul(userSelected.userid)
    // eslint-disable-next-line
  }, [visible])

  // functions 
  function hasViewed(profileid) {
    try {
      const jwtToken = Cookies.get("jwtToken");
      const userid = user.userid;
      if (userid) {
        axios
          .get(`http://localhost:8080/has_viewed_historic/${profileid}/${userid}`, {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          })
          .then((response) => {
            if (response.data) {
              setHasbeenViewed(true)
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
      console.log("coucou je suis une erreur : ", e);
    }

  }

  function saveVisitHist(profileid) {
    try {
      const jwtToken = Cookies.get("jwtToken");
      const userid = user.userid;
      if (userid) {
        axios
          .post(`http://localhost:8080/create_visit_historic/${userid}/${profileid}`, {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          })
          .then((response) => {
            if (response.data) {

            } else {

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
      console.log("coucou je suis une erreur : ", e);
    }
  }

  async function fame_rate_calcul(userSelectedid) {
    try {
      const jwtToken = Cookies.get("jwtToken");
      let nbuserlikes;

      axios
        .get(`http://localhost:8080/get_user_likes/${userSelectedid}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        })
        .then((response) => {
          if (response.data) {
            nbuserlikes = response.data.length
          }
        })
        .catch((error) => {
          Cookies.remove('jwtToken')
          navigate("/portal")
          console.log('error : ', error);
        });

      axios
        .get(`http://localhost:8080/get_all_users_likes/`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        })
        .then((response) => {
          if (response.data) {
            const allLikes = response.data
            const nballLikes = allLikes.length
            setFamerate((nbuserlikes) / (nballLikes*2))
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

  const like = async (profileSelec) => {
    // fetchContext()
    // fetchFriendship()
    sendLike(profileSelec.userid);
  };
  const unlike = async (profileSelec) => {
    fetchContext()
    sendUnlike(profileSelec.userid);
  };
  const block = (profileSelec) => {
    sendBlock(profileSelec);
  };

  return (
    <>
      {userSelected && (
        <div className={`publicprofile ${visible === true ? "active" : ""}`}>
          <BtnLogout />
          {/* Display user's pics */}
          <div className="pics">
            <div className="image">
              <img src={require("../../assets/pngwing.com.png")} alt="" />
            </div>
            <div className="image">
              <img src={require("../../assets/pngwing.com.png")} alt="" />
            </div>
            <div className="image">
              <img src={require("../../assets/pngwing.com.png")} alt="" />
            </div>
          </div>
          <div className="infos">
            <p>{userSelected.online === true ? "connecté" : ""}</p>
            <p>{userSelected.firstname}</p>
            <p>{userSelected.age} ans</p>
            <p>{userSelected.genre === 'M' ? 'Man' : 'Woman'}</p>
            <p>{userSelected.bio}</p>
            {famerate > 0 &&
              <p>{famerate}</p>
            }
            <p>La lune</p>
          </div>

          <div className="actions">
            {
              (unlikes?.includes(userSelected.userid) || !blocked?.includes(userSelected.userid)) &&
                <>
                  {hasbeenViewed && <div>a vu votre profile</div>}
                  {likes?.includes(userSelected.userid) && <div>a liker votre profile</div>}

                  {liked && matches && !liked?.includes(userSelected.userid) && !matches?.includes(userSelected.userid) &&
                    <button onClick={() => like(userSelected)}>
                      like
                    </button>
                  } 
                  {!unliked?.includes(userSelected.userid) && (liked?.includes(userSelected.userid) || matches?.includes(userSelected.userid)) &&
                    <button onClick={() => unlike(userSelected)}>
                      unlike
                    </button>
                  }
                  {matches && matches?.includes(userSelected.userid) &&
                    <div>It's a MATCH !</div> 
                  }
                  <button style={{background: 'grey'}} onClick={() => block(userSelected.userid)}>
                    block
                  </button>
                </>
            }

            <p>signaler fake account</p>
          </div>
        </div>
      )}
    </>
  );
}

export default PublicProfile;
