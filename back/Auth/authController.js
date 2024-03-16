const { pool } = require("../db");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const bcrypt = require("bcrypt");

const { getUserByUsername } = require("../User/userController");

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: '',
    pass: ''
  },
});

async function loginUser(req, res) {
  const { username, password } = req.body;
  try {
    const user = await getUserByUsername(username);
    if (user !== false) {
      let hashedPwd = await bcrypt.hash(password, user.salt);
      if (hashedPwd === user.pwd_hashed) {
        let userid = user.userid;
        const payload = {
          username,
          userid,
        };
        const secretKey = "your_secret_key"; // todo : mettre dans ENV
        const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });
        res.json({ "access-token": token });
      } else res.status(401).send("Wrong password");
    } else res.status(404).send("Utilisateur non trouvé");
  } catch (e) {
    res.status(404).send("Utilisateur non trouvé");
  }
}

async function signinUser(req, res) {
  // if (!/^((?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[!@#+=`'";:?*.,<>~\-\\]).{8,50})$/.test(req.password))
  //   throw new BadRequestException('Password must contain between 8 and 50 characters, 1 uppercase, 1 lowercase, 1 number and 1 special character');
  // if (!/[a-zA-Z0-9\-_+.]{1,11}/.test(req.username))
  //   throw new BadRequestException('Username must contain between 1 and 11 characters, only letters, numbers and -_+. are allowed');

  try {
    const {
      username,
      firstname,
      lastname,
      email,
      age,
      genre,
      sexual_pref,
      bio,
      tags,
      filtertag,
      filter_fame_rate,
      age_gap,
    } = req.body;

    const salt = await bcrypt.genSalt();
    const pwd_hashed = await bcrypt.hash(req.body.password, salt);
    const online = true;
    
    const tagsJSON = JSON.stringify(tags);
    const filtertagsJSON = JSON.stringify(filtertag);
    const friendshipJSON = JSON.stringify([]);
    const notificationsJSON = JSON.stringify([]);
    const blocked = [];
    const nexted = [];

    // Add location to the query
    // Add pics to the query

    const query =
      `INSERT INTO "User" 
        (username, firstname, lastname, email, age, genre, sexual_pref, pwd_hashed, salt, online, bio, tags, filtertag, filter_fame_rate, age_gap, friendship, notifications, blocked, nexted) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) 
        RETURNING *`;
    const values = [ username, firstname, lastname, email, age, genre, sexual_pref, pwd_hashed, salt, online, bio, tagsJSON, filtertagsJSON, filter_fame_rate, age_gap, friendshipJSON , notificationsJSON, blocked, nexted];
    const { rows } = await pool.query(query, values);
    const userid = rows[0].userid
    const secretKey = "your_secret_key";
    payload = {
      userid: userid,
      username: username,
    };

    const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });
    
    // // POST TOKEN ON USER
    // const queryToken = 'UPDATE "User" SET token = $1 WHERE userid = $2';
    // const valuesToken = [token, userid];
    // await pool.query(queryToken, valuesToken);

    // console.log(token);
    // console.log('token has been saved');

    // const mailOptions = {
    //   from: 'guillaume.simonet.info@gmail.com',
    //   to: email,
    //   subject: 'Confirmation d\'inscription',
    //   html: `
    //       <p>Merci de vous être inscrit sur notre site.</p>
    //       <p>Veuillez cliquer sur le lien suivant pour confirmer votre adresse e-mail :</p>
    //       <a href="http://localhost:8080/confirm?token=${token}">Confirmez votre adresse e-mail</a>
    //   `
    // };

    // await transporter.sendMail(mailOptions);
    // console.log('mail has been sent');
    // res.send('Un e-mail de confirmation a été envoyé à votre adresse e-mail.');
    res.json({ "access-token": token });

  } catch (e) {
    console.log(e);
    res.status(404).json({ error: 'Ressource non trouvée' });
  }
}

async function confirmRegister(req, res){
  console.log('entry in /confirm');
  const confirmationToken = req.query.token;

  const utilisateur = await findUserByConfirmationToken(confirmationToken);

  if (utilisateur) {
      res.redirect('/portal');
  } else {
      res.status(400).send('Le token de confirmation est invalide.');
  }
};


async function findUserByConfirmationToken(confirmationToken) {
  try {
      console.log('recuperation du user via token ');
      const query = 'SELECT * FROM "User" WHERE token = $1';
      const values = [confirmationToken];
      const user = await pool.query(query, values);
      return user;
  } catch (error) {
      console.error("Error finding user by confirmation token:", error);
      throw error;
  }
}

async function resetPassword(email, newpassword) {
  const user = await getUserByEmail(email)
  if (!user) return ;

  try {
    const newpwd_hashed = await bcrypt.hash(newpassword, user.salt);

    const query = `UPDATE "User" SET pwd_hashed = ${newpwd_hashed} WHERE userid = ${user.userid};`;
    const result = await pool.query(query);
    return result.rows[0];
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    throw error;
  }
}

module.exports = { loginUser, signinUser, confirmRegister, resetPassword };
