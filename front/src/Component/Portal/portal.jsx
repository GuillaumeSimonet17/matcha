import "./portal.css";
// React
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// others
import axios from "axios";
// utils
import { RedirectToHome } from "../../utils/RedirectToHome";

function Portal() {
  const navigate = useNavigate();
  // components' states
  const [register, setRegister] = useState(true);
  const [login, setLogin] = useState(false);
  // user
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState(0);
  const [genre, setGenre] = useState("");
  const [sexPref, setSexPref] = useState("");
  const [bio, setBio] = useState("");
  const [pics, setPics] = useState();
  const [tags, setTags] = useState([]);
  // message
  const [errorMessage, setErrorMessage] = useState();
  const [emailSentMessage, setEmailSentMessage] = useState();


  // functions
  const changeSignLog = (tab) => {
    setErrorMessage("");
    setPassword("");
    setConfirmPassword("");
    if (tab === "Login") {
      setLogin(true);
    } else {
      setLogin(false);
    }
    if (tab === "Register") {
      setRegister(true);
    } else {
      setRegister(false);
    }
  };

  const handleSubmitRegister = (e) => {
    e.preventDefault();
    OnRegister();
  };

  async function OnRegister() {
    const credits = {
      username: username,
      password: password,
      email: email,
      lastname: lastname,
      firstname: firstname,
      genre: genre,
      age: age,
      online: true,
      bio: bio,
      sexual_pref: sexPref,
      tags: tags,
      filtertag: [],
      filter_fame_rate: 0,
      age_gap: [0, 100]
    };

    if (
      username !== "" &&
      password !== "" &&
      confirmPassword !== "" &&
      email !== "" &&
      lastname !== "" &&
      firstname !== "" &&
      genre !== "" &&
      sexPref !== "" &&
      bio !== "" &&
      age !== 0 &&
      tags.length !== 0
    ) {
      if (firstname.length > 15 || username.length > 15) 
        return setErrorMessage("Le firstname ou username dépasse 15 caractères");
      // if (age < 18 || age > 100)
      //   return setErrorMessage("L'age doit etre un nombre entre 18 et 100");
      if (password === confirmPassword) {
        setErrorMessage("");
        try {
          const response = await axios.post(
            "http://localhost:8080/signin",
            credits
          );
          if (response.status === 200) {
            // setEmailSentMessage("Un email de confirmation vous a été envoyé")
            RedirectToHome(navigate, response)
          }
        } catch (error) {
          setErrorMessage("Ce username existe deja");
        }
      } else {
        setErrorMessage("passwords are not corresponding");
      }
    } else {
      setErrorMessage("Please, fill all fields");
    }
  }

  const handleTagsChange = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      setTags([...tags, value]);
    } else {
      setTags(tags.filter(tag => tag !== value));
    }
  };

  const handleSubmitLogin = (e) => {
    e.preventDefault();
    OnConnect();
  };

  function OnConnect() {
    const credits = {
      username: username,
      password: password,
      online: true,
    };
    if (username !== "" && password !== "") {
      setErrorMessage("");
      try {
        axios
          .post("http://localhost:8080/login", credits)
          .then((response) => {
            RedirectToHome(navigate, response);
          })
          .catch((error) => {
            if (error.response.data === "Utilisateur non trouvé")
              setErrorMessage("Utilisateur non trouvé");
            else if (error.response.data === "Wrong password")
              setErrorMessage("Wrong password");
          });
      } catch (error) {
        console.log("Erreur lors de la connexion:", error);
      }
    } else setErrorMessage("Please, fill all fields");
  }

  function resetPassword() {
    if (email === "") 
      return setErrorMessage("Fill email to reset password");
    else
      setErrorMessage("")
    // sendMail
  }

  return (
    <>
        <div className="portal">

          <div className="nav">
            <li
              onClick={() => {
                changeSignLog("Register");
              }}
            >
              <p
                style={{
                  borderTop: register
                    ? "1px solid white"
                    : "1px solid transparent",
                }}
              >
                register
              </p>
            </li>
            <li
              onClick={() => {
                changeSignLog("Login");
              }}
            >
              <p
                style={{
                  borderBottom: login
                    ? "1px solid white"
                    : "1px solid transparent",
                }}
              >
                login
              </p>
            </li>
          </div>
          
          {emailSentMessage}

          {register && (
            <div className="register">
              <h4>Register</h4>
              {errorMessage && (
                <div style={{ color: "red", marginTop: "5px" }}>
                  {errorMessage}
                </div>
              )}
              <form onSubmit={handleSubmitRegister}>
                <div className="field">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                    }}
                  />
                </div>
                <div className="field">
                  <input
                    type="text"
                    id="firstname"
                    name="firstname"
                    placeholder="firstname"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                  />
                </div>
                <div className="field">
                  <input
                    type="text"
                    id="lastname"
                    name="lastname"
                    placeholder="lastname"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                  />
                </div>
                <div className="field">
                  <input
                    type="text"
                    id="email"
                    name="email"
                    placeholder="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="field">
                  <select
                    name="genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                  >
                    <option>--Please choose an option--</option>
                    <option value="M">Man</option>
                    <option value="W">Woman</option>
                  </select>
                </div>
                <div className="field tags">
                  <label className={tags.includes("travel") ? "tag checked" : "tag"}>
                    <input
                      type="checkbox"
                      value="travel"
                      checked={tags.includes("travel")}
                      onChange={handleTagsChange}
                    />
                    travel
                  </label>
                  <br />
                  <label className={tags.includes("chill") ? "tag checked" : "tag"}>
                    <input
                      type="checkbox"
                      value="chill"
                      checked={tags.includes("chill")}
                      onChange={handleTagsChange}
                    />
                    chill
                  </label>
                  <label className={tags.includes("cinema") ? "tag checked" : "tag"}>
                    <input
                      type="checkbox"
                      value="cinema"
                      checked={tags.includes("cinema")}
                      onChange={handleTagsChange}
                    />
                    cinema
                  </label>
                  <label className={tags.includes("music") ? "tag checked" : "tag"}>
                    <input
                      type="checkbox"
                      value="music"
                      checked={tags.includes("music")}
                      onChange={handleTagsChange}
                    />
                    music
                  </label>
                  <label className={tags.includes("food") ? "tag checked" : "tag"}>
                    <input
                      type="checkbox"
                      value="food"
                      checked={tags.includes("food")}
                      onChange={handleTagsChange}
                    />
                    food
                  </label>
                  <label className={tags.includes("sport") ? "tag checked" : "tag"}>
                    <input
                      type="checkbox"
                      value="sport"
                      checked={tags.includes("sport")}
                      onChange={handleTagsChange}
                    />
                    sport
                  </label>
                </div>
                <div className="field">
                  <select
                    name="sexPref"
                    value={sexPref}
                    onChange={(e) => setSexPref(e.target.value)}
                  >
                    <option>--Please choose an option--</option>
                    <option value="M">Man</option>
                    <option value="W">Woman</option>
                    <option value="B">Both</option>
                  </select>
                </div>
                <div className="uploadPics"> 
                {/* Upload 5 pics no more no less */}
                  <input
                    filename={pics}
                    type="file"
                    id="pics"
                    name="pics"
                    onChange={(e) => setPics(e.target.files[0])}
                  />
                </div>
                <div className="field">
                  <input
                    type="text"
                    id="bio"
                    name="bio"
                    placeholder="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
                <div className="field">
                  <input
                    type="number"
                    id="age"
                    name="age"
                    placeholder="age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
                <div className="field">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="field">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="btn">
                  <button type="submit">Connexion</button>
                </div>
              </form>
            </div>
          )}

          {login && (
            <div className="login">
              <h4>Login</h4>
              {errorMessage && (
                <div style={{ color: "red", marginTop: "5px" }}>
                  {errorMessage}
                </div>
              )}
              <form onSubmit={handleSubmitLogin}>
                <div className="field">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="field">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="btn">
                  <button type="submit">Connexion</button>
                </div>
                <p onClick={() => resetPassword()} style={{fontSize: '0.8em', cursor: 'pointer'}}>Mot de passe oublié ?</p>
              </form>
            </div>
          )}

        </div>
    </>
  );
}

export default Portal;
