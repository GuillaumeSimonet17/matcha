import "./settings.css";
// React
import React from 'react';
import { useEffect, useState, useContext } from "react";
// others
import Cookies from "js-cookie";
import axios from "axios";
// Contexts
import { UserContext, useUserContext } from "../../Context/userContext";
// Components
import BtnLogout from "../BtnLogout/btnLogout";

function Settings() {
  // states
  const [visible, setVisible] = useState(false);
  const { tabActive } = useContext(UserContext);
  const [errorMessage, setErrorMessage] = useState("");
  // users
  const { user, fetchContext } = useUserContext();
  // -- public
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [tags, setTags] = useState([]);
  // -- private
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [genre, setGenre] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  // -- filters
  const [filter_fame_rate, setFilter_fame_rate] = useState(0);
  const [filtertag, setFiltertag] = useState([]);
  const [sexual_pref, setSexual_pref] = useState("M");
  const [age_gap_min, setAge_gap_min] = useState([]);
  const [age_gap_max, setAge_gap_max] = useState([]);

  // useEffects
  useEffect(() => {
    if (tabActive === "settings") {
      fetchContext();
      setVisible(true);
    } else {
      setVisible(false);
    }
    // eslint-disable-next-line
  }, [tabActive]);

  useEffect(() => {
    if (user.tags) setTags(user.tags);
    if (user.filtertag) setFiltertag(user.filtertag);
    if (user.age_gap) {
      setAge_gap_min(user.age_gap[0]);
      setAge_gap_max(user.age_gap[1]);
    }
    if (user.filter_fame_rate) setFilter_fame_rate(user.filter_fame_rate);
    if (user.sexual_pref) setSexual_pref(user.sexual_pref);
  }, [
    user.tags,
    user.filtertag,
    user.age_gap,
    user.filter_fame_rate,
    user.sexual_pref,
  ]);

  // functions
  const handleTagsChange = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      setTags([...tags, value]);
    } else {
      setTags(tags.filter((tag) => tag !== value));
    }
  };

  const handleFiltersTagsChange = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      setFiltertag([...filtertag, value]);
    } else {
      setFiltertag(filtertag.filter((tag) => tag !== value));
    }
  };

  const SaveInfos = (e) => {
    e.preventDefault();
    if (age_gap_max < age_gap_min)
      return errorMessage("age min doit etre inferieur a age max");
    const age_gap = [age_gap_min, age_gap_max];
    const credits = {
      password: user.password,
      username: user.username,
      oldPwd: oldPwd,
      newPwd: newPwd,
      confirmPwd: confirmPwd,
      email: email,
      lastname: lastname,
      firstname: firstname,
      genre: genre,
      bio: bio,
      tags: tags,
      sexual_pref: sexual_pref,
      filtertag: filtertag,
      age_gap: age_gap,
      filter_fame_rate: filter_fame_rate,
    };

    if (
      oldPwd === "" &&
      newPwd === "" &&
      confirmPwd === "" &&
      email === "" &&
      lastname === "" &&
      firstname === "" &&
      genre === "" &&
      bio === "" &&
      sexual_pref === "" &&
      tags === undefined &&
      filtertag.length === 0
    ) {
      return;
    }

    if (oldPwd !== "" || newPwd !== "" || confirmPwd !== "") {
      if (oldPwd === "" || newPwd === "" || confirmPwd === "")
        return setErrorMessage("please full fill your passwords");
      if (newPwd !== confirmPwd)
        return setErrorMessage(
          "new password doesn't match with confirm password"
        );
    }
    const jwtToken = Cookies.get("jwtToken");
    axios
      .post("http://localhost:8080/update_user", {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
        credits,
      })
      .then((response) => {
      })
      .catch((response) => {
        if (response.response.status === 401)
          setErrorMessage(
            "L'ancien mot de passe ne correspond pas avec le votre"
          );
      });
  };

  return (
    <div className={`settings ${visible === true ? "active" : ""}`}>
      <BtnLogout />
      {user ? (
        <>
          {errorMessage && (
            <div
              style={{ color: "red", marginTop: "5px", marginBottom: "10px" }}
            >
              {errorMessage}
            </div>
          )}
          <form onSubmit={(e) => SaveInfos(e)}>
            <h1>Filter Research:</h1>
            <div className="age_gap_container">
              <input
                className="age_gap min"
                type="number"
                min="18"
                step="1"
                max="99"
                placeholder="age gap min"
                value={age_gap_min ? age_gap_min : 18}
                onChange={(e) => setAge_gap_min(parseInt(e.target.value))}
              />
              <input
                className="age_gap max"
                type="number"
                min="19"
                step="1"
                max="100"
                placeholder="age gap max"
                value={age_gap_max ? age_gap_max : 100}
                onChange={(e) => setAge_gap_max(parseInt(e.target.value))}
              />
            </div>
            <div className="fame_rate_container">
              <input
                className="fame_rate"
                type="number"
                min="0"
                step="1"
                max="99"
                value={filter_fame_rate ? filter_fame_rate : ""}
                onChange={(e) => setFilter_fame_rate(parseInt(e.target.value))}
                placeholder="Minimum fame rate"
              ></input>
            </div>
            <div>
              {/* filter suggestions by location */}
            </div>
            <select
              className="sexualpref"
              name="sexualpref"
              placeholder={user.sex_pref}
              value={sexual_pref ? sexual_pref : ""}
              onChange={(e) => setSexual_pref(e.target.value)}
            >
              <option value="M">Man</option>
              <option value="W">Woman</option>
              <option value="B">Both</option>
            </select>
            <div className="tags">
              <label
                className={
                  filtertag && filtertag.includes("travel")
                    ? "tag checked"
                    : "tag"
                }
              >
                <input
                  type="checkbox"
                  value="travel"
                  checked={filtertag && filtertag.includes("travel")}
                  onChange={handleFiltersTagsChange}
                />
                travel
              </label>
              <br />
              <label
                className={
                  filtertag && filtertag.includes("chill")
                    ? "tag checked"
                    : "tag"
                }
              >
                <input
                  type="checkbox"
                  value="chill"
                  checked={filtertag && filtertag.includes("chill")}
                  onChange={handleFiltersTagsChange}
                />
                chill
              </label>
              <label
                className={
                  filtertag && filtertag.includes("cinema")
                    ? "tag checked"
                    : "tag"
                }
              >
                <input
                  type="checkbox"
                  value="cinema"
                  checked={filtertag && filtertag.includes("cinema")}
                  onChange={handleFiltersTagsChange}
                />
                cinema
              </label>
              <label
                className={
                  filtertag && filtertag.includes("music")
                    ? "tag checked"
                    : "tag"
                }
              >
                <input
                  type="checkbox"
                  value="music"
                  checked={filtertag && filtertag.includes("music")}
                  onChange={handleFiltersTagsChange}
                />
                music
              </label>
              <label
                className={
                  filtertag && filtertag.includes("food")
                    ? "tag checked"
                    : "tag"
                }
              >
                <input
                  type="checkbox"
                  value="food"
                  checked={filtertag && filtertag.includes("food")}
                  onChange={handleFiltersTagsChange}
                />
                food
              </label>
            </div>

            <h1>Infos</h1>
            <input
              type="text"
              placeholder={user?.firstname}
              value={firstname ? firstname : ""}
              onChange={(e) => setFirstname(e.target.value)}
            ></input>
            <input
              type="text"
              placeholder={user?.lastname}
              value={lastname ? lastname : ""}
              onChange={(e) => setLastname(e.target.value)}
            ></input>
            <input
              type="email"
              placeholder={user?.email}
              value={email ? email : ""}
              onChange={(e) => setEmail(e.target.value)}
            ></input>
            <input
              type="password"
              placeholder="old password"
              value={oldPwd ? oldPwd : ""}
              onChange={(e) => setOldPwd(e.target.value)}
            ></input>
            <input
              type="password"
              placeholder="new passowrd"
              value={newPwd ? newPwd : ""}
              onChange={(e) => setNewPwd(e.target.value)}
            ></input>
            <input
              type="password"
              placeholder="confirm passowrd"
              value={confirmPwd ? confirmPwd : ""}
              onChange={(e) => setConfirmPwd(e.target.value)}
            ></input>
            <select
              className="genre"
              name="genre"
              placeholder={user?.genre}
              value={genre ? genre : ""}
              onChange={(e) => setGenre(e.target.value)}
            >
              <option value="M">M</option>
              <option value="W">W</option>
            </select>
            {user?.bio && (
              <input
                type="text"
                value={bio ? bio : user?.bio}
                onChange={(e) => setBio(e.target.value)}
              ></input>
            )}
            <div className="tags">
              <>
                <label
                  className={tags.includes("travel") ? "tag checked" : "tag"}
                >
                  <input
                    type="checkbox"
                    value="travel"
                    checked={tags?.includes("travel")}
                    onChange={handleTagsChange}
                  />
                  travel
                </label>
                <br />
                <label
                  className={tags?.includes("chill") ? "tag checked" : "tag"}
                >
                  <input
                    type="checkbox"
                    value="chill"
                    checked={tags.includes("chill")}
                    onChange={handleTagsChange}
                  />
                  chill
                </label>
                <label
                  className={tags?.includes("cinema") ? "tag checked" : "tag"}
                >
                  <input
                    type="checkbox"
                    value="cinema"
                    checked={tags?.includes("cinema")}
                    onChange={handleTagsChange}
                  />
                  cinema
                </label>
                <label
                  className={tags?.includes("music") ? "tag checked" : "tag"}
                >
                  <input
                    type="checkbox"
                    value="music"
                    checked={tags?.includes("music")}
                    onChange={handleTagsChange}
                  />
                  music
                </label>
                <label
                  className={tags?.includes("food") ? "tag checked" : "tag"}
                >
                  <input
                    type="checkbox"
                    value="food"
                    checked={tags?.includes("food")}
                    onChange={handleTagsChange}
                  />
                  food
                </label>
              </>
            </div>
            {/* Change pics here */}
            <li>?pics?</li>
            <div className="save">
              <button type="submit">Save Infos</button>
            </div>
          </form>
        </>
      ) : null}
    </div>
  );
}

export default Settings;
