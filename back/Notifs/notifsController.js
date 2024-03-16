const {pool} = require("../db");

async function createNotif(senderid, receiverid, type) {
    try {
        const query = 'INSERT INTO notification (sourceuserid, type, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING notificationid';
        const values = [senderid, type];
        const { rows: notifsRows } = await pool.query(query, values);
        if (notifsRows.length === 0) {
            throw new Error('Erreur lors de l\'insertion de l\'amitié');
        }

        const notificationid = notifsRows[0].notificationid;
        const updateReceiverQuery = 'UPDATE "User" SET notifications = notifications || $1::jsonb WHERE userid = $2';
        const updateReceiverValues = [notificationid, receiverid];
        await pool.query(updateReceiverQuery, updateReceiverValues);

        return notifsRows
    } catch (e) {
        console.log(e);
    }
}

async function deleteNotif(notifid) {
    try {
        const query = `DELETE FROM notification WHERE notificationid = $1`;
        const { rows } = await pool.query(query, [notifid]);
        return true
    } catch (e) {
        return false
        console.log(e);
    }
}

async function getAllNotifs(userid) {
    try {
        if (userid === undefined) return ;
        const query1 = 'SELECT notifications FROM "User" WHERE userid = $1';
        const { rows: notifsIds } = await pool.query(query1, [userid]);
        if (notifsIds == []) {
            return ([]);
        }
        if (!notifsIds) return ;
        const query2 = 'SELECT * FROM notification WHERE notificationid = ANY($1)';
        const { rows: notifLines } = await pool.query(query2, [notifsIds[0].notifications]);

        return (notifLines);
        
      } catch (e) {
        console.log(e);
      }
}

async function isThereNotif(userid, sourceUserid, type) {
    if (userid !== 'undefined' && sourceUserid !== "null") {
        try {
            const query1 = 'SELECT notifications FROM "User" WHERE userid = $1';
            console.log('RIGHT FUCKING HERE => ', userid);
            console.log('RIGHT FUCKING HERE => ', typeof(userid));
            const { rows: notifsIds } = await pool.query(query1, [userid]);
            if (notifsIds.length === 0) {
                return ([]);
            }
            
            const query = 'SELECT * FROM notification WHERE notificationid = ANY($1) AND type = $2 AND sourceUserId = $3';
            const { rows: notifLines } = await pool.query(query, [notifsIds[0].notifications, type, sourceUserid]);
            if (notifLines) {
                return notifLines
            }
            return false
        } catch (e) {
            console.log(e);
            return false
        }
    }
}

module.exports = {
    createNotif,
    deleteNotif,
    getAllNotifs,
    isThereNotif
};
  