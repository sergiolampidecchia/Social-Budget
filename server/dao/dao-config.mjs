import db from "../db.mjs";
import PreferencesDAO from "./dao-preferences.mjs";
import ProposalDAO from "./dao-proposals.mjs";

const proposalDAO = new ProposalDAO();
const preferenceDAO = new PreferencesDAO();
const configDAO = new ConfigDAO();

export default function ConfigDAO(){

    this.changePhase = (user) => {
        return new Promise((resolve, reject) => {
           if(user.role !== "Admin"){
            reject(new Error("Only Admin can change the phase"));
           }
           const sql = "SELECT phase, budget FROM configs";
           db.get(sql, [], (err,row) => {
                if(err){
                    reject(err);
                }else{
                    let phase = row.phase;
                    let budget = row.budget;
                    if(phase === 0 && budget === null){
                        reject(new Error("You have to insert the budget!"))
                    }else{
                        let newphase = phase + 1;
                        if(newphase > 3){
                            newphase = 0;
                            const sql = "DELETE FROM preferences";
                            db.run(sql, [], (err) => {
                                if(err){
                                    reject(err);
                                }
                                const sql = "DELETE FROM proposals";
                                db.run(sql, [], (err) => {
                                    if(err){
                                        reject(err);
                                    }
                                    const sql = "UPDATE configs SET budget = ?";
                                    db.run(sql, [0], (err,row) => {
                                        if(err){
                                            reject(err);
                                        }else{
                                            resolve("New 0 phase")
                                        }
                                    })
                                })
                            })
                        }
                        const sql = "UPDATE configs SET phase = ?";
                        db.run(sql, [newphase], (err) => {
                            if(err){
                                reject(err);
                            }else{
                                resolve(newphase);
                            }
                        });
                    }
                }
            });
        });
    }

    this.setBudget = (user, newBudget) => {
        return new Promise((resolve, reject) => {
            if(newBudget <= 0){
                reject(new Error("Budget must be greater than 0"));
            }
            if(user.role !== "Admin"){
                reject(new Error("Only Admin can set the budget"));
            }
            const sql = "SELECT phase FROM configs";
            db.get(sql, [], (err,row) => {
                if(err){
                    reject(err);
                }else{
                    const phase = row.phase;
                    if(phase !== 0){
                        reject(new Error("Budget can only bet set in phase 0"));
                    }else{
                        const sql = "UPDATE configs SET phase = ?, budget = ?";
                        db.run(sql, [1, newBudget], (err) => {
                            if(err){
                                reject(err);
                            }else{
                                resolve(newBudget);
                            }
                        });
                    }
                }
            });
        });
    }

    this.getCurrentPhase = () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT phase FROM configs";
            db.get(sql, [], (err,row) => {
                if(err){
                    reject(err);
                }else{
                    resolve(row.phase)
                }
            })
        })
    }

    this.getBudget = () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT budget FROM configs";
            db.get(sql, [], (err,row) => {
                if(err){
                    reject(err);
                }else{
                    resolve(row.budget);
                }
            })
        })
    }

    this.reset = (user) => {
        return new Promise(async (resolve, reject) => {
            console.log(user)
            if(user.role !== "Admin"){
                reject(new Error("You are not authorized to reset the database"));
            }
            let phase = await configDAO.getCurrentPhase();
            if(phase !== 3){
                reject(new Error("You are not authorized to reset if you are not in phase 3"))
            }else{
                phase = 0;
                await proposalDAO.resetProposal(user);
                await preferenceDAO.resetPreference(user);
                const sql = "UPDATE configs SET phase = ?, budget = null";
                db.run(sql, [phase], (err,row) => {
                    if(err){
                        reject(err);
                    }else{
                        resolve(row);
                    }
                })
            }
        })
    }
}