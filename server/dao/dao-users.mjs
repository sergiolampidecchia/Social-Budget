import db from "../db.mjs";
import crypto from "crypto";

export default function UserDao(){
    this.getUserByCredentials = (username, password) => {
        return new Promise((resolve,reject) => {
            try{
                const sql = "SELECT * FROM users WHERE username = ?";
                db.get(sql, [username], (err,row) => {
                    if(err){
                        reject(err);
                    } 
                    if(!row || !row.salt){
                        resolve({error: "Wrong username"});
                    }else{
                        const user = { id: row.id, username: row.username, role: row.role, name: row.name, surname: row.surname, address: row.address, birthday: row.birthday };
                        crypto.scrypt(password, row.salt, 64, function (err, hashedPassword) { 
                            if (err) reject(err);
                            if (!crypto.timingSafeEqual(Buffer.from(row.hash, 'hex'), hashedPassword) || password === undefined){
                                resolve({error: "Wrong password"});
                            }
                            else{
                                resolve(user);
                            }
                        });
                    }
                });
            }catch(error){
                reject(error);
            }
        });
    };

    this.getUserById = (id)=> {
        return new Promise((resolve, reject) => {
            try {
               const sql = "SELECT * FROM users WHERE id = ?";
               db.get(sql, [id], (err,row)=>{
                if(err){
                    reject(err)
                }else{
                    resolve(row)
                }
               })
            }catch (error) {
                throw new Error('Database error');
            }
        });
    }

    this.updateUser = (user, username, name, surname, address, birthday) => {
        return new Promise((resolve, reject) => {
          if (user.username != username) {
            reject(new Error("You are not authorized to update this user"));
            return;
          }
          try {
            const sql = "UPDATE users SET name = ?, surname = ?, address = ?, birthday = ? WHERE username = ?";
            db.run(sql, [name, surname, address, birthday, username], function(err) {
              if (err) {
                reject(err);
                return;
              } else {
                const sql = "SELECT * FROM users WHERE username = ?";
                db.get(sql, [username], (err, row) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(row);
                  }
                });
              }
            });
          } catch (error) {
            reject(error);
          }
        });
      }
      
      
    this.deleteUser = (user) => {
        return new Promise((resolve, reject) => {
            try{
                const sql = "DELETE FROM users WHERE username = ?";
                db.run(sql, [user.username], (err) =>{
                    if(err){                            
                        reject(err);
                        return;
                    }else{
                        resolve(true);                            
                    }
                });
            }catch(error){
                reject(error);
            }
        });
    }

    this.getUserRole = (user) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT role FROM users WHERE id = ?";
            db.run(sql, [user.id], (err,row) => {
                if(err){
                    reject(err);
                }else{
                    resolve(row);
                }
            });
        });
    }
}