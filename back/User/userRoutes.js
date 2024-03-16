const express = require('express');
const router = express.Router();

// Importez vos contrôleurs d'authentification
const { getUser, getAllUsers, getUserById, getUserByUsername, updateUser, getPublicProfileById, addNext } = require('./userController');
const { getAllLikes } = require('../Friendship/friendshipController');

// Définissez vos routes
router.get('/get_user', getUser); // private
router.get('/get_all_users', getAllUsers); // public  
router.get('/get_all_users_likes', getAllLikes); // public
router.post('/add_next/:userid/:profileid', addNext); // public
router.get('/get_user_by_id/:id', getUserById); // private
router.get('/get_user_likes/:userid', getUserById); // private
router.get('/get_public_profile_by_id/:id', getPublicProfileById); // private

router.get('/get_user_by_username/:username', getUserByUsername); // private

router.post('/update_user', updateUser);

module.exports = router;