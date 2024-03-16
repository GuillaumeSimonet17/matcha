const express = require('express');
const router = express.Router();

// Importez vos contrôleurs d'authentification
const { getFriendship, getFriendships, createHistoric,  isHistoricViewed, getMessages, getHistoricViewed } = require('./friendshipController');

// Définissez vos routes
router.get('/get_friendship/:userid/:profileid', getFriendship);
router.post('/get_friendships/:userid', getFriendships);
router.post('/create_visit_historic/:userid/:profileid', createHistoric);
router.post('/has_viewed_historic/:profileid/:userid', isHistoricViewed); 
router.post('/get_viewed_history/:userid', getHistoricViewed); 
router.get("/get_messages/:userid/:targetid", getMessages);

module.exports = router;