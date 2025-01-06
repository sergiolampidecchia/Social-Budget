import db from "../db.mjs";
import ConfigDAO from "./dao-config.mjs";

const configDao = new ConfigDAO();
export default function PreferencesDAO(){

    this.addPreference = (user, proposalId, score) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT phase FROM configs";
            db.get(sql, [], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                const phase = row.phase;
                if (phase !== 2) {
                    reject(new Error("Preferences can only be added in phase 2"));
                    return;
                }
                const sql = "SELECT userId FROM proposals WHERE id = ?";
                    db.get(sql, [proposalId], (err, row) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        if (row.userId === user.id) {
                            reject(new Error("You cannot add a preference for your own proposal"));
                            return;
                        }
                    const sql = "SELECT COUNT(*) AS count FROM preferences WHERE userId = ? AND proposalId = ?";
                    db.get(sql, [user.id, proposalId], (err, row) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        const count = row.count;
                        if (count > 0) {
                            reject(new Error("You have already added a preference for this proposal"));
                            return;
                        }
                        const sql = "INSERT INTO preferences (userId, proposalId, score) VALUES (?, ?, ?)";
                        db.run(sql, [user.id, proposalId, score], function(err) {
                            if (err) {
                                reject(err);
                                return;
                            }
                            resolve({ id: this.lastID, userId: user.id, proposalId, score });
                        });
                    });
                });
            });
        });
    };
    
    
    this.getAllPreferences = () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT phase,budget FROM configs";
            db.get(sql, [], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                const phase = row.phase;
                const totbudget = row.budget;
                if (phase !== 3) {
                    reject(new Error("You are not authorized to see preferences during this phase"));
                    return;
                } else {
                    const sql = `
                        SELECT p.id, p.userId, p.description, p.budget, COALESCE(SUM(preferences.score), 0) AS totalScore
                        FROM proposals p
                        LEFT JOIN preferences ON p.id = preferences.proposalId
                        GROUP BY p.id
                        ORDER BY totalScore DESC, p.budget ASC`;
                    db.all(sql, [], (err, rows) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        const approvedProposals = [];
                        const unapprovedProposals = [];
                        let cumulativeBudget = 0;
                        rows.forEach(row => {
                            if (cumulativeBudget + row.budget <= totbudget) {
                                approvedProposals.push({
                                    id: row.id,
                                    userId: row.userId,
                                    description: row.description,
                                    budget: row.budget,
                                    score: row.totalScore
                                });
                                cumulativeBudget += row.budget;
                            } else {
                                unapprovedProposals.push({
                                    id: row.id,
                                    description: row.description,
                                    budget: row.budget,
                                    score: row.totalScore
                                });
                            }
                        });
                        resolve({ approvedProposals: approvedProposals, unapprovedProposals: unapprovedProposals });
                    });
                }
            });
        });
    };
    

    this.getPreferencesByUserId = (id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const sql = "SELECT * FROM preferences WHERE userId = ?";
                db.all(sql, [id], (err, rows) => {
                    if (err) {
                        reject(err); 
                    } else {
                        const preferences = rows.map(row => ({
                            id: row.id,
                            userId: row.userId,
                            proposalId: row.proposalId,
                            score: row.score
                        }));
                        resolve(preferences); 
                    }
                });
            } catch (err) {
                reject(err); 
            }
        });
    };
    

    this.deletePreference = (user,proposalId) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT phase FROM configs";
            db.get(sql, [], (err,row) => {
                if(err){
                    reject(err)
                }else if(row.phase !== 2){
                    reject(new Error("Preferences can be deleted only in phase 2"));
                }else{
                    const sql = "DELETE FROM preferences WHERE userId = ? AND proposalId = ?";
                    db.run(sql, [user.id, proposalId], (err) => {
                        if(err){
                            reject(err);
                        }else{
                            resolve(true);
                        }
                    });
                }
            });
        });
    };

    this.resetPreference = (user) => {
        return new Promise(async(resolve, reject) => {
            if(user.role !== "Admin"){
                reject(new Error("You are not authorized to reset preferences"))
            }
            const phase = await configDao.getCurrentPhase();
            if(phase !== 3){
                reject(new Error("You are not authorized to reset preferences if you are not in phase 3"));
            }else{
                const sql = "DELETE FROM preferences";
                db.run(sql, [], (err) => {
                    if(err){
                        reject(err)
                    }else{
                        resolve(this.changes);
                    }
                });
            }
        });
    }
}