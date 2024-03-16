import './profile.css';
// React
import React from 'react';
import { useEffect, useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
// others
import axios from "axios";
import Cookies from "js-cookie";
// Context
import { UserContext, useUserContext } from '../../Context/userContext';
import { useInteractionsContext } from "../../Context/interactionsContext";
// Components
import BtnLogout from "../BtnLogout/btnLogout";

function Profile() {
  const navigate = useNavigate();
  // states
  const [ visible, setVisible ] = useState(false)
  const [ viewed, setViewed ] = useState([]) 
  const [ famerate, setFamerate ] = useState([]) 
  const [firstnames, setFirstnames] = useState({});
  const { tabActive } = useContext(UserContext);
  // users
  const { user, fetchContext } = useUserContext();
  const { sendLogout, likes, matches } = useInteractionsContext();

  // useEffects
  useEffect(() => {
    if (tabActive === 'profile') {
      fetchContext()
      setVisible(true)
      getViewsHistory()
    }
    else {
      setVisible(false)    
    }
    // eslint-disable-next-line
  }, [tabActive])

  useEffect(() => {
    displayViewed()
  }, [firstnames])

  useEffect(() => {
    fame_rate_calcul()
  }, [user])

  useEffect(() => {
    Object.values(viewed).forEach((view, index) => {
      getFirstname(view.targetuserid)
        .then((firstname) => {
          setFirstnames((prevUsernames) => ({
            ...prevUsernames,
            [index]: firstname,
          }));

        })
        .catch((error) => console.log('Error fetching username:', error));
    });
    // eslint-disable-next-line
  }, [viewed]);


  function getViewsHistory() {
    try {
      const jwtToken = Cookies.get("jwtToken");
      const userid = user.userid;
      if (userid) {
        axios
          .get(`http://localhost:8080/get_viewed_history/${userid}`, {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          })
          .then((response) => {
            if (response.data)
              setViewed(response.data)
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
          navigate('/portal');
          reject(error);
        });
    });
  }

  async function fame_rate_calcul() {
    const nbuserlikes = likes.length + matches.length
    try {
      const jwtToken = Cookies.get("jwtToken");

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
            if (nballLikes === 0)
              setFamerate(0)
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

  function displayViewed() {
    return (
      <ul className='viewed'>
        {Object.values(firstnames).map((firstname, index) => (
          <li key={index} className='view'><p>{firstname}</p></li>
        ))}
      </ul>
    );
  }

  
  return (
    <div className={`profile ${visible === true ? 'active' : ''}`}>
    <BtnLogout/>
    { user ? ( <>
    {/* Display user's pics */}
      <div className='pics'>
        <div className="image"><img src={require("../../assets/pngwing.com.png")}  alt=''/></div>
        <div className="image"><img src={require("../../assets/pngwing.com.png")}  alt=''/></div>
        <div className="image"><img src={require("../../assets/pngwing.com.png")}  alt=''/></div>
      </div>
      <div className='infos'>
        <p>{user.firstname}, {user.age} ans</p>
        <p>location: {user.location}</p>
        <p>bio: {user.bio}</p>
        {famerate > 0 &&
          <p>fame_rate: {famerate}</p>
        }
        {user.tags &&
          <ul className='tags'>
          {Object.values(user.tags).map((tag, index) => (
            <li key={index} className='tag'>{tag}</li>
          ))}
        </ul>}
      </div>
      <div className='viewedhistory'>
        <h3>Viewed History:</h3>
        {viewed && displayViewed()}
      </div>
    </>) : null}
    </div> 
  )
}

export default Profile;
