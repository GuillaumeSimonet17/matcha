const {pool} = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

async function getUser(req, res) {
  const userid = req.user.userid;
  if (!userid) res.json([])
  try {
    const query = 'SELECT * FROM "User" WHERE userid = $1;';
    const { rows } = await pool.query(query, [userid]);
    if (rows.length === 0) {
      return false;
    }

    res.json(rows[0]);
  } catch (e) {
    console.log("Erreur lors de la récupération de l'utilisateur:", e);
    res
      .status(500)
      .json({
        message:
          "Une erreur s'est produite lors de la récupération de l'utilisateur.",
      });
  }
}

async function getUserById(senderId) {
  try {
    const query = 'SELECT * FROM "User" WHERE userid = $1;';
    const { rows } = await pool.query(query, [senderId]);
    if (rows.length === 0) {
      return Error('user not found')
    }
    return (rows[0]);
  } catch (e) {
    console.log("Erreur lors de la récupération de l'utilisateur:", e);
    return Error('probleme dans back: 500')
  }
}

async function getUserByUsername(username) {
  const query = 'SELECT * FROM "User" WHERE username = $1;';
  const { rows } = await pool.query(query, [username]);
  if (rows.length === 0) return false;
  return rows[0];
}

async function getAllUsers(req, res) {
  try {
    const query = 'SELECT userid, firstname, lastname, age, genre, bio, online, tags, sexual_pref FROM "User";';
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (e) {
    console.log(e);
  }
}

async function getPublicProfileById(profileid) {
  try {
    const query = 'SELECT userid, firstname, lastname, age, genre, bio, online, tags, sexual_pref FROM "User" WHERE userid = $1;';
    const { rows } = await pool.query(query, [profileid]);
    return rows[0];
  } catch (e) {
    console.log(e);
  }
}

async function updateUser(req, res) {
  try {
    const user = await getUserByUsername(req.body.credits.username)
    const username = user.username

    let hashedPwd;
    let new_pwd;
    if (req.body.credits.oldPwd) {
      hashedPwd = await bcrypt.hash(req.body.credits.oldPwd, user.salt);
      if (hashedPwd !== user.pwd_hashed)
        return res.status(401).json({ error: 'L\'ancien mot de passe ne correspond pas avec le votre' });
      new_pwd = await bcrypt.hash(req.body.credits.newPwd, user.salt);
    }

    const { firstname, lastname, email, age, genre, sexual_pref, bio, tags, filtertag,
            age_gap, filter_fame_rate, online } = req.body.credits

    const updates = [];

    // Add pics if changes
    
    if (online) updates.push(`online = '${online}'`);
    if (firstname) updates.push(`firstname = '${firstname}'`);
    if (lastname) updates.push(`lastname = '${lastname}'`);
    if (email) updates.push(`email = '${email}'`);
    if (age) updates.push(`age = '${age}'`);
    if (genre) updates.push(`genre = '${genre}'`);
    if (bio) updates.push(`bio = '${bio}'`);
    if (new_pwd) updates.push(`pwd_hashed = '${new_pwd}'`);
    if (filter_fame_rate) updates.push(`filter_fame_rate = '${filter_fame_rate}'`);
    if (age_gap) { const ageGapString = `{${age_gap.join(',')}}`; updates.push(`age_gap = '${ageGapString}'`)};

    if (tags && tags.length === 0) { const tagsString = JSON.stringify([]); updates.push(`tags = '${tagsString}'`); }
    if (tags && tags.length > 0){ const tagsString = JSON.stringify(tags); updates.push(`tags = '${tagsString}'`); }
    if (filtertag && filtertag.length === 0) { const filtertagString = JSON.stringify(filtertag); updates.push(`filtertag = '${filtertagString}'`); }
    if (filtertag && filtertag.length > 0) { const filtertagstring = JSON.stringify(filtertag); updates.push(`filtertag = '${filtertagstring}'`)};

    if (sexual_pref) updates.push(`sexual_pref = '${sexual_pref}'`);

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour.' });
    }
    const setClause = updates.join(', ');

    const query = `
      UPDATE "User"
      SET ${setClause}
      WHERE username = '${username}';
    `;
    const { rows } = await pool.query(query);

    res.json(rows[0])
    
  } catch (e) {
    console.log(e);
  }
}

async function setUserOnline(username) {
  try {
    const user = await getUserByUsername(username)
    if (!user) return ;
    const query = `UPDATE "User" SET online = true WHERE userid = ${user.userid};`;
    const result = await pool.query(query);
    return result.rows[0];
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    throw error;
  }
}

async function setUserOffline(body) {
  try {
    const now = new Date().toISOString(); 
    const updates = [];
    updates.push(`online = false`);
    updates.push(`last_connection = '${now}'`);
    const setClause = updates.join(', ');

    const query = `UPDATE "User" SET ${setClause} WHERE userid = ${body.userid};`;
    const result = await pool.query(query);
    return result.rows[0];
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    throw error;
  }
}

async function getUserByEmail(email) {
  try {
    if (!email) return ;
    const query = `SELECT * FROM "User" WHERE email = ${email};`;
    const result = await pool.query(query);
    return result.rows[0];
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    throw error;
  }
}

async function addNext(userid, profileid) {
  try {
    if (!userid || !profileid) return ;
    const query = `UPDATE "User" SET nexted = ARRAY_APPEND(nexted, ${profileid}) WHERE userid = ${userid};`;
    const result = await pool.query(query);
    return result.rows[0];
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    throw error;
  }
}

module.exports = {
  getUser,
  getUserById,
  getAllUsers,
  getUserByEmail,
  getPublicProfileById,
  getUserByUsername,
  updateUser,
  setUserOnline,
  setUserOffline,
  addNext,
};
