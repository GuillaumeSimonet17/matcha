const express = require('express');
const router = express.Router();

// Importez vos contrôleurs d'authentification
const { createNotif, deleteNotif, isThereNotif } = require('./notifsController');

// Définissez vos routes
router.post('/create_notif', createNotif);
router.delete('/delete_notif/:id', deleteNotif);
router.get("/is_there_notif/:userid/:sourceid/:type", isThereNotif);

module.exports = router;