import db from "../db.mjs";
import ConfigDAO from "./dao-config.mjs";

const configDao = new ConfigDAO();

export default function ProposalDAO(){
    this.createProposal = (userId, description, budget) => {
        return new Promise((resolve, reject)=>{
            try{
            if(budget <= 0){
                reject(new Error("Budget must be greater than 0"));
            }
            const sql = "SELECT phase, budget FROM configs";
            db.get(sql, [], (err,row) => {
                if(err){
                    reject(err);
                }else if(row.phase !== 1){
                    reject(new Error("Proposals can only be created in phase 1"));
                }else if(budget > row.budget){
                    reject(new Error("Budget exceed the allowed limit"));
                }else{
                    const sql = "SELECT COUNT(*) AS count FROM proposals WHERE userId = ?"
                    db.get(sql, [userId], (err, row) => {
                        if (err){
                            reject(err);
                        }else if (row.count > 2){
                            reject(new Error("You cannot create more than 3 proposals"));
                        }else{
                            const sql = "INSERT INTO proposals (userId, description, budget) VALUES (?,?,?)";
                            db.run(sql, [userId, description, budget], (err) => {
                                if(err){
                                    reject(err)
                                }else{
                                    resolve({id: this.lastID, userId, description, budget});
                                }
                            });
                        }
                    });    
                }
            });
            }catch(error){
                reject(error)
            }
        });
    }

    this.getProposalsByUserId = (user) => {
        return new Promise((resolve, reject) => {
            try{    
                const sql = "SELECT * FROM proposals WHERE userId = ?";
                db.all(sql, [user.username], (err,rows) => {
                    if(err){
                        reject(err)
                    }else{
                        const proposals = rows.map(row => ({id: row.id, userId: row.userId, description: row.description, budget: row.budget}));                           
                        resolve(proposals);
                    }
                })
            }catch(error){
                reject(error);
            }
        })
    }
   
    this.getAllProposals = () => {
        return new Promise((resolve, reject) => {
            try{
                const sql = "SELECT phase FROM configs";
                db.get(sql, [], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        const phase = row.phase;
                        if (phase !== 2) {
                            reject(new Error("You are not authorized to see proposals during phase 1"));
                        } else{
                            const proposalSql = "SELECT * FROM proposals";
                            db.all(proposalSql, [], (err, rows) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    const proposals = rows.map(row => ({ id: row.id, userId: row.userId, description: row.description, budget: row.budget }));
                                    resolve(proposals);
                                }
                            });
                        }
                    }
                }); 
            }catch (error) {
                reject(error);
            }
        });
    };
    
    this.updateProposal = (user, id, description, budget) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT phase, budget FROM configs";
            db.get(sql, [], (err, row) => {
                if(err){
                    reject(err);
                } else {
                    const phase = row.phase;
                    const budgetLimit = row.budget; 
                    if(phase !== 1){
                        reject(new Error("Proposals can only be updated in phase 1"));
                    } else {
                        const sql = "SELECT userId, budget FROM proposals WHERE id = ?";
                        db.get(sql, [id], (err, row) => {
                            if(err){
                                reject(err);
                            } else if(!row || row.userId !== user.username){
                                reject(new Error("You are not authorized to update this proposal"));
                            } else {
                                const proposedBudget = parseFloat(budget);
                                if (proposedBudget > budgetLimit) {
                                    reject(new Error("Budget exceed the allowed limit"));
                                } else if(proposedBudget <= 0) {
                                    reject(new Error("Budget must be greater than 0"))
                                }else{
                                    const updateSql = "UPDATE proposals SET description = ?, budget = ? WHERE id = ?";
                                    db.run(updateSql, [description, proposedBudget, id], (err) => {
                                        if(err){
                                            reject(err);
                                        } else {
                                            resolve({ id, description, budget: proposedBudget });
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            });
        });
    };
    
    
    this.deleteProposal = (user, id) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT phase FROM configs";
            db.get(sql, [], (err, row) => {
                if(err){
                    reject(err);
                }else{
                    const phase = row.phase;
                    if(phase !== 1){
                        reject(new Error("Proposals can only be deleted in phase 1"));
                    }else{
                        const sql = "SELECT userId FROM proposals WHERE id = ?";
                        db.get(sql, [id], (err, row) => {
                            if(err){
                                reject(err);
                            }else if(!row || row.userId !== user.username){
                                reject(new Error("You are not authorized to delete this proposal"));
                            }else{
                                const deleteSql = "DELETE FROM proposals WHERE id = ?";
                                db.run(deleteSql, [id], (err) => {
                                    if(err){
                                        reject(err);
                                    }else{
                                        resolve(true);
                                    }
                                });
                            }
                        });
                    }
                }
            });
        });
    };
    
    this.resetProposal = (user) => {
        return new Promise((async(resolve, reject) => {
            if(user.role !== "Admin"){
                reject(new Error("You are not authorized to reset proposal"))
            }else{
                const phase = await configDao.getCurrentPhase();
            if(phase !== 3){
                reject(new Error("You are not authorized to reset proposal if you are not in phase 3"));
            }else{
                const sql = "DELETE FROM proposals";
                db.run(sql, [], (err) => {
                    if(err){
                        reject(err)
                    }else{
                        resolve(this.changes);
                    }
                });
                }
            }
        }));
    }
}