const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  }
});

const users = {};

// const multer = require('multer')
// const upload = multer({ dest: 'upload/' })
// app.use('/images', express.static('images'))
// const fs = require('fs')

app.use(cors({ credentials: true }));
app.use(bodyParser.json());
// app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const jwt = require('jsonwebtoken');

const authRoutes = require("./Auth/authRoutes");
const userRoutes = require("./User/userRoutes");
const notifsRoutes = require("./Notifs/notifsRoutes");
const friendshipRoutes = require("./Friendship/friendshipRoutes");

const { loginUser, signinUser } = require("./Auth/authController");
const {
  getUserById,
  getUserByUsername,
  getAllUsers,
  getPublicProfileById,
  getUser,
  updateUser,
  setUserOnline,
  setUserOffline,
  addNext,
} = require("./User/userController");
const { createFriendship, updateFriendship, getFriendship, getFriendships, createMsg, getMessages, block, createHistoric, isHistoricViewed, getHistoricViewed, getAllLikes, getLikesUser } = require("./Friendship/friendshipController");
const { getAllNotifs, createNotif, deleteNotif, isThereNotif } = require("./Notifs/notifsController");

app.use("/login", authRoutes);
app.use("/signin", authRoutes);
// app.use("/upload", authRoutes);
app.use("/get_user_by_id", userRoutes);
app.use("/get_user", userRoutes);
app.use("/get_all_users_likes", userRoutes); 
app.use("/get_user_likes", userRoutes); 
app.use("/update_user", userRoutes);
app.use("/create_visit_historic/:userid/:profileid", friendshipRoutes);
app.use("/has_viewed_historic/:profileid/:userid", friendshipRoutes); 
app.use("/get_viewed_history/:userid", friendshipRoutes); 


app.use("/delete_notif/id", notifsRoutes);
app.use("/is_there_notif/:userid/:sourceid/:type", notifsRoutes);

// TO TEST
const authenticateJWT = (req, res, next) => {
  // Récupérer le jeton JWT depuis l'en-tête Authorization
  let authHeader
  if (Object.keys(req.body).length !== 0)
    authHeader = req.body.headers["Authorization"];
  else
    authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, "your_secret_key", (err, user) => {
    if (err) {
      // Le token n'est pas valide
      return res.sendStatus(403); // Forbidden
    }
    // Le token est valide, vous pouvez stocker les informations de l'utilisateur dans req.user
    req.user = user;
    next(); // Passer au middleware suivant
  });
};

app.get("/", (req, res) => {});

// PORTAL
app.post("/login", async (req, res) => {
  await loginUser(req, res);
  await setUserOnline(req.body.username)
});

app.post("/signin", (req, res) => {
  signinUser(req, res);
});

// Users
app.get("/get_user_likes/:userid", authenticateJWT, async (req, res) => {
  const userid = req.params.userid;
  const likes = await getLikesUser(userid)
  res.json(likes)
}); 

app.get("/get_all_users_likes", authenticateJWT, async (req, res) => {
  const user = await getAllLikes()
  res.json(user)
}); getLikesUser

app.get("/get_user_by_id/:id", authenticateJWT, async (req, res) => {
  const userid = req.params.id;
  const user = await getUserById(userid)
  res.json(user)
});

app.get("/get_user_by_username/:username", authenticateJWT, (req, res) => {
  const user = getUserByUsername(req.params.username);
  res.send(user.json());
});

app.get("/get_all_users", (req, res) => {
  getAllUsers(req, res);
});

app.post("/add_next/:userid/:profileid", (req, res) => {
  const userid = req.params.userid;
  const profileid = req.params.profileid;
  addNext(userid, profileid);
});

app.get("/get_public_profile_by_id/:id", async (req, res) => {
  const userid = req.params.id
  const user = await getPublicProfileById(userid);
  res.json(user)
});

app.get("/get_user", authenticateJWT, (req, res) => {
  getUser(req, res);
});

app.get("/get_friendship/:userid/:profileid", authenticateJWT, async (req, res) => {
  const fs = await getFriendship(req.params.userid, req.params.profileid)
  if (fs) 
    res.json(fs[0])
  else
    res.json([])
})

app.get("/get_messages/:userid/:targetid", authenticateJWT, async (req, res) => {
  const fs = await getMessages(req.params.userid, req.params.targetid)
  if (fs) 
    res.json(fs)
  else
    res.json([])
}) 

app.get("/get_friendships/:userid", authenticateJWT, async (req, res) => {
  const fs = await getFriendships(req.params.userid)
  if (fs) 
    res.json(fs)
  else
    res.json([])
})

app.post("/create_visit_historic/:userid/:profileid", authenticateJWT, (req, res) => {
  if (createHistoric(req.params.userid, req.params.profileid))
    res.json([])
})

app.get("/has_viewed_historic/:profileid/:userid", authenticateJWT, async (req, res) => {
  const historic = await isHistoricViewed(req.params.profileid, req.params.userid)
  if (historic)
    res.json(true)
  else
    res.json(false)
})

app.get("/get_viewed_history/:userid", authenticateJWT, async (req, res) => {
  const historic = await getHistoricViewed(req.params.userid)
  if (historic)
    res.json(historic)
  else
    res.json([])
})

app.post('/update_user', authenticateJWT, (req, res) => {
  updateUser(req, res);
});

app.get("/get_all_notifs/:id", authenticateJWT, async (req, res) => {
  const userid = req.params.id;
  const notifs = await getAllNotifs(userid);
  res.json(notifs)
});

app.delete("/delete_notif/:id", authenticateJWT, async (req, res) => {
  const notifid = req.params.id;
  const isDeleted = await deleteNotif(notifid)
  if (isDeleted)
    res.json(true)
  else
    res.json(false)
})

app.get("/is_there_notif/:userid/:sourceid/:type", authenticateJWT, async (req, res) => {
  const user = req.params.userid;
  const source = req.params.sourceid;
  const type = req.params.type;
  const isnotif = await isThereNotif(user, source, type)
  if (isnotif) {
    res.json(isnotif)
  }
  else
    res.json(false)
})

app.patch("/block/:userid/:blockedid", authenticateJWT, async (req, res) => {
  const userid = req.params.userid;
  const blockedid = req.params.blockedid;
  const isBlocked = await block(userid, blockedid)
  if (isBlocked)
    res.json(true)
  else
    res.json(false)
})

// Sockets
io.on("connection", (socket) => {
  console.log("Uer connected: ", socket.id);

 socket.on('setUserSocket', (userid) => {
   users[userid] = socket.id;
  });


  socket.on("error", (error) => {
    console.error("Erreur WebSocket : ", error);
  });
  socket.on("disconnect", () => {
    console.log("Uer disconnected: ", socket.id);
  });

  // LIKE
  socket.on('like', async (body) => {
    const sender = await getUserById(body.senderId);
    const receiver = await getUserById(body.receiverId);
    if (!sender) return;
    if (!receiver) return;
    const senderid = sender.userid
    const receiverid = receiver.userid

    if (sender.unlikes?.includes(receiverid) || receiver.blocked?.includes(senderid))
      return;

    const isfriendship = await getFriendship(senderid, receiverid)
    if (isfriendship.length !== 0) {
      const updatedFriendship = await updateFriendship(senderid, receiverid, 'l');
      if (updatedFriendship[0].status === 'c') {
        const clientSocket = users[receiverid];
        createNotif(senderid, receiverid, 'c')
        io.to(clientSocket).emit('like', {
          sender: senderid,
          receiver: receiverid,
          status: 'c'
        });
        return
      }
      else  {
        createNotif(senderid, receiverid, 'l')
      }
    }
    else {
      createFriendship(senderid, receiverid, 'l');
      createNotif(senderid, receiverid, 'l')
    }
    const clientSocket = users[receiverid];
    io.to(clientSocket).emit('like', {
      sender: senderid,
      receiver: receiverid,
      status: 'l'
    });
  });

  // UNLIKE
  socket.on('unlike', async (body) => {
    const sender = await getUserById(body.senderId);
    const receiver = await getUserById(body.receiverId);
    if (!sender) return;
    if (!receiver) return;
    await updateFriendship(body.senderId, body.receiverId, 'u')
    createNotif(body.senderId, body.receiverId, 'u')

    const clientSocket = users[body.receiverId];
    io.to(clientSocket).emit('unlike', {
      sender: body.senderId,
      receiver: body.receiverId,
    });
  });

  // BLOCK
  socket.on('block', async (body) => {
    const sender = await getUserById(body.senderId);
    const receiver = await getUserById(body.receiverId);
    if (!sender) return;
    if (!receiver) return;
    await block(body.senderId, body.receiverId)

    const clientSocket = users[body.receiverId];
    io.to(clientSocket).emit('block', {
      sender: body.senderId,
      receiver: body.receiverId,
    });
  });

  // MSG
  socket.on('msg', async (body) => {
    const sender = await getUserById(body.senderId);
    const receiver = await getUserById(body.receiverId);
    if (!sender) return;
    if (!receiver) return;
    const senderid = sender.userid
    const receiverid = receiver.userid
        
    if (receiver.blocked.includes(senderid))
      return;

    await createMsg(senderid, receiverid, body.content)

    const isnotif = await isThereNotif(receiverid, senderid, 'm')
    if (isnotif.length === 0) {
      await createNotif(senderid, receiverid, 'm')
    }

    const clientSocket = users[body.receiverId];
    io.to(clientSocket).emit('msg', {
      sender: senderid,
      receiver: receiverid,
      content: body.content
    });
  });

  socket.on('logout', async (userid) => {
    const body = { userid:userid, online:false }
    await setUserOffline(body);
  })

});

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`⚡️[bootup]: Server is running at port: ${PORT}`));
