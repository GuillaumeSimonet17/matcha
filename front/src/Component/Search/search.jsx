import "./search.css";
// React
import React from 'react'
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
// others
import axios from "axios";
import Cookies from "js-cookie";
// Contexts
import { UserContext, useUserContext } from "../../Context/userContext";
import { useInteractionsContext } from "../../Context/interactionsContext";
// Components
import BtnLogout from "../BtnLogout/btnLogout";


function Search() {
  const navigate = useNavigate();
  // states
  const [visible, setVisible] = useState(false);
  const { tabActive, setTabActive, profileVisible, setProfileVisible, setUserSelected, user, id, fetchContext } = useContext(UserContext);
  // users
  const [allUsers, setAllUsers] = useState([]);
  // const { user, fetchContext } = useUserContext();

  const { fetchFriendship, sendLogout, blocked, unliked, unlikes, matches } = useInteractionsContext();

    // useEffects
    useEffect(() => {
      if (tabActive === "search") {
        setVisible(true)
        fetchFriendship()
        GetAllUsers()
      } else {
        setVisible(false);    
      }
      // eslint-disable-next-line
    }, [tabActive]);

  useEffect(() => {
    fetchContext()
  }, [])

  useEffect(() => {
    if (id !== undefined) {
      fetchFriendship()
      GetAllUsers()
    }
  }, [id])

  async function GetAllUsers() {
    const jwtToken = Cookies.get("jwtToken");
    try {
      axios
        .get("http://localhost:8080/get_all_users", {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        })
        .then((response) => {
          algoSuggestion(response.data)
        })
        .catch((error) => {
          sendLogout(user.userid)
          Cookies.remove('jwtToken')
          navigate("/portal")
          console.log('error : ', error);
        });
    } catch (e) {
      console.log('coucou je suis une erreur : ', e);
    }
  }

  function commonTags(user, profile) {
    const userTagsSet = new Set(user.tags);
    const profileTagsSet = new Set(profile.tags);

    let commonTagsCount = 0;
    userTagsSet.forEach(tag => {
      if (profileTagsSet.has(tag)) {
        commonTagsCount++;
      }
    });
    return commonTagsCount >= 2;
  }

  async function fame_rate_calcul(userSelectedid) {
    try {
      const jwtToken = Cookies.get("jwtToken");
      let nbuserlikes = 0;

      await axios
        .get(`http://localhost:8080/get_user_likes/${userSelectedid}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        })
        .then((response) => {
          if (response.data) {
            nbuserlikes = response.data.length;
          }
        })
        .catch((error) => {
          Cookies.remove('jwtToken')
          navigate("/portal")
          console.log('error : ', error);
        });

      if (nbuserlikes === 0)
        return 0;

      const allLikesResponse = await axios.get(`http://localhost:8080/get_all_users_likes/`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      const allLikes = allLikesResponse.data;
      const nballLikes = allLikes.length;

      if (nballLikes === 0)
        return 0;

      return (nbuserlikes) / (nballLikes * 2);
    } catch (error) {
      Cookies.remove('jwtToken')
      navigate("/portal")
      console.log('error : ', error);
      return 0;
    }
  }

  async function algoSuggestion(response) {
    if (response === undefined || response.length === 0) return ;
    const filteredUser = response.filter(async profile => {
      const fameRate = await fame_rate_calcul(profile.userid);
      return (fameRate === 0 || fameRate >= user.filter_fame_rate) // fameRate === 0 temporary
    });
    setAllUsers(filteredUser)
    setVisible(true);
  }

  const setprofile = (profile) => {
    setUserSelected(profile)
    setProfileVisible(true);
    setTabActive("publicprofile");
  };

  const next = (profileSelec) => {
    setAllUsers(allUsers.filter(profile => profile.userid !== profileSelec))
    try {
      const jwtToken = Cookies.get("jwtToken");
      axios
        .post(`http://localhost:8080/add_next/${user.userid}/${profileSelec}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        })
        .then((response) => {
        })
        .catch((error) => {
          sendLogout(user.userid)
          Cookies.remove('jwtToken')
          navigate("/portal")
          console.log('error : ', error);
        });
    } catch (e) {
      console.log('coucou je suis une erreur : ', e);
    }
  }

  return (
    <>
      <BtnLogout />
      {visible && !profileVisible && (
        <div className={`search ${visible === true ? "active" : ""}`}>
          {allUsers?.length > 0 &&
            <ul className="cardsContainer">
              {allUsers.filter(
                profile =>
                !blocked?.includes(profile.userid)
                  // && profile.genre === user.sexual_pref
                  && !matches?.includes(profile.userid)
                  && !unlikes?.includes(profile.userid)
                  && !unliked?.includes(profile.userid)
                  && !user.nexted?.includes(profile.userid)
                  // && (user.genre === profile.sexual_pref || profile.sexual_pref === 'B')
                  && (profile.age >= user.age_gap[0] && profile.age <= user.age_gap[1])
                // && (commonTags(user, profile) || (user.tags?.length === 0 && profile.tags?.length === 0))
                // Filter suggestion by settings's location 
              )
                .map((profile, index) => {
                  if (profile.userid !== user.userid) {
                    return (
                      <li key={index} className="card">
                        <div
                          className="infosProfile"
                          onClick={() => {
                            setprofile(profile);
                          }}
                        >
                          <div className="images">
                            <img src={require("../../assets/pngwing.com.png")} alt='' />
                          </div>

                          <div className="infos">
                            <h3>{profile.firstname}, {profile.age} ans</h3>
                            <p>{profile.genre === 'M' ? 'Man' : 'Woman'}</p>
                            <p>My bio: {profile.bio}</p>
                            {
                              profile.tags.map((tag, index) => {
                                return (
                                  <div key={index} className="tags">
                                    <span>{tag.name}</span>
                                  </div>
                                )
                              })
                            }
                          </div>
                        </div>
                        <div className="actions">
                          <button onClick={() => next(profile.userid)}>next</button>
                        </div>
                      </li>
                    );
                  } else {
                    return null;
                  }
                })
              }
            </ul>
          }
        </div>
      )}
    </>
  );
}

export default Search;
