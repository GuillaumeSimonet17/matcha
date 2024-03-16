const { createNotif } = require("../Notifs/notifsController");
const { getUserById } = require("../User/userController");
const { pool } = require("../db");

async function createFriendship(senderid, receiverid, status) {
	try {
		const query = 'INSERT INTO friendship (sourceuserid, targetuserid, status, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING friendshipid';
		const values = [senderid, receiverid, status];
		const { rows: friendshipRows } = await pool.query(query, values);
		if (friendshipRows.length === 0) {
			throw new Error('Erreur lors de l\'insertion de l\'amitié');
		}
		const friendshipid = friendshipRows[0].friendshipid;
		const updateSenderQuery = 'UPDATE "User" SET friendship = friendship || $1::jsonb WHERE userid = $2';
		const updateReceiverQuery = 'UPDATE "User" SET friendship = friendship || $1::jsonb WHERE userid = $2';

		const updateSenderValues = [friendshipid, senderid];
		const updateReceiverValues = [friendshipid, receiverid];

		await pool.query(updateSenderQuery, updateSenderValues);
		await pool.query(updateReceiverQuery, updateReceiverValues);

	} catch (e) {
		console.log(e);
	}
}

async function updateFriendship(senderid, receiverid, status) {
	try {
		const friendship = await getFriendship(senderid, receiverid)
		if (!friendship) return
		if (status === 'l' && friendship[0].status === 'l')
			status = 'c'
		const query = `UPDATE friendship SET sourceuserid = $1, targetuserid = $2, status = $3, created_at = CURRENT_TIMESTAMP WHERE friendshipid = $4 RETURNING *`;
		const values = [senderid, receiverid, status, friendship[0].friendshipid];
		const { rows: friendshipRows } = await pool.query(query, values);
		return friendshipRows
	} catch (e) {
		console.log(e);
	}
}

async function getFriendship(userid, profileid) {
	try {
		if (!userid || !profileid) return;
		const query1 = 'SELECT * FROM friendship WHERE sourceuserid = $1 AND targetuserid = $2';
		const { rows: rows1 } = await pool.query(query1, [userid, profileid]);
		if (rows1.length !== 0)
			return (rows1);
		const query2 = 'SELECT * FROM friendship WHERE sourceuserid = $2 AND targetuserid = $1';
		const { rows: rows2 } = await pool.query(query2, [userid, profileid]);
		('rows 2 => ', rows2);
		if (rows2.length !== 0)
			return (rows2);
		else
			return ([])
	} catch (e) {
		console.log(e);
	}
}

async function getLikesUser(userid) {
	try {
		if (!userid) return;
		const query1 = 'SELECT * FROM friendship WHERE (targetuserid = $1 AND status = $2) OR (status = $3 AND (targetuserid = $1 OR sourceuserid = $1))';
		const { rows: rows1 } = await pool.query(query1, [userid, 'l', 'c']);
		return (rows1);
	} catch (e) {
		return []
		console.log(e);
	}
} 

async function getAllLikes() {
	try {
		const query1 = 'SELECT * FROM friendship WHERE (status = $1 OR status = $2)';
		const { rows: rows1 } = await pool.query(query1, ['l', 'c']);
		return (rows1);
	} catch (e) {
		return []
		console.log(e);
	}
}

async function getFriendships(userid) {
	try {
		if (!userid) return;
		const query1 = 'SELECT * FROM friendship WHERE sourceuserid = $1 OR targetuserid = $1';
		const { rows: rows1 } = await pool.query(query1, [userid]);
		return (rows1);
	} catch (e) {
		return false
	}
}

async function createHistoric(sourceid, targetid) {
	if (await isHistoricViewed(sourceid, targetid)) {
		return;
	}
	try {
		if (!targetid) return;

		const query = 'INSERT INTO VisitHistory (sourceuserid, targetuserid, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING VisitHistory';
		const values = [sourceid, targetid];
		const { rows: rows1 } = await pool.query(query, values);
		createNotif(sourceid, targetid, 'v')

		if (rows1)
			return true
		return false
	} catch (e) {
		console.log(e);
	}
}

async function isHistoricViewed(sourceuserid, targetuserid) {
	try {
		const query = 'SELECT * FROM VisitHistory WHERE sourceuserid = $1 AND targetuserid = $2';
		const { rows: rows1 } = await pool.query(query, [sourceuserid, targetuserid]);
		try {
			console.log(rows1[0].visitId); // util
			return true
		} catch (e) {
			return false
		}
	} catch (e) {
		console.log(e);
		return false
	}
}

async function getHistoricViewed(userid) {
	try {
		const query = 'SELECT * FROM VisitHistory WHERE sourceuserid = $1';
		const { rows: rows1 } = await pool.query(query, [userid]);
		return rows1
	} catch (e) {
		console.log(e);
		return false
	}
}

async function block(userid, blockedid) {
	try {
		const query = `UPDATE "User" SET blocked = ARRAY_APPEND(blocked, $1) WHERE userid = $2 RETURNING *`;
		const { rows: blocked } = await pool.query(query, [blockedid, userid]);
		return true
	} catch (e) {
		return false
		console.log(e);
	}
}

async function createMsg(sourceid, targetid, content) {
	try {
		const query = 'INSERT INTO Message (sourceUserId, targetUserId, content, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING Message';
		const { rows: msg } = await pool.query(query, [sourceid, targetid, content]);
		return msg
	} catch (e) {
		return false
		console.log(e);
	}
}

async function getMessages(sourceid, targetid) {
	try {
		if (sourceid === undefined || targetid === undefined) return ;
		const query = 'SELECT * FROM Message WHERE (sourceuserid = $1 AND targetuserid = $2) OR (sourceuserid = $2 AND targetuserid = $1) ORDER BY created_at ASC;';
		const { rows: msg } = await pool.query(query, [sourceid, targetid]);

		return msg
	} catch (e) {
		return false
	}
}

module.exports = {
	createFriendship,
	updateFriendship,
	getFriendship,
	getFriendships,
	getLikesUser,
	getAllLikes,
	createHistoric,
	isHistoricViewed,
	getHistoricViewed,
	block,
	createMsg,
	getMessages
};
