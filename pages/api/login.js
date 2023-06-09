import { resolve } from "styled-jsx/css";
import db from "../../database"
import { createHash } from 'crypto'

var cookie = require('cookie')

const secret_key = process.env.RECAPTCHA_SECRET_KEY;
const recaptcha_uri = process.env.RECAPTCHA_URI;

async function reCaptchaValidation(token){
    const url = `${recaptcha_uri}?secret=${secret_key}&response=${token}`;
    const response = await fetch(url, {
        method: 'POST',
    })
    const data = await response.json();
    console.log(data)

    if(data.success === false || data.score < 0.5){
        return false;
    }else{
        return true;
    }
}


async function validation(username, password) {
    return new Promise((resolve, reject) => {
        const hash_password = createHash('sha256').update(password).digest('hex');
        const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
        const params = [username, hash_password];
        db.get(sql, params, (err, row) => {
            // reject(500);
            if (err) {
                reject(500);
            } else if (row === undefined) {
                resolve(404);
            } else {
                resolve(200);
            }
        });
    })
}

export default async function handler(req, res) {
    if(req.method === 'POST'){
        try{
            const { username, password, token} = req.body;
            const reCaptcha_validation_response = await reCaptchaValidation(token);
            if(reCaptcha_validation_response === false){
                res.status(403).json({ message: 'reCaptcha validation failed, Please reload the website' });
                return;
            }

            const login_response = await validation(username, password);
            if(login_response === 200){
                res.setHeader('Set-Cookie', cookie.serialize('session', JSON.stringify({ isLoggedIn: true, username: username }), {
                    maxAge: 7 * 24 * 60 * 60, // Expires in 30 days
                    // httpOnly: true, // Can only be accessed via HTTP(S)
                    // secure: process.env.NODE_ENV === 'production', // Only works in production
                    sameSite: 'strict', // Cookie is only sent to the same site as the one that originated it
                    path: '/', // Path of the cookie
                }))
                res.status(200).json({ message: 'ok' });
            }else if(login_response === 404){
                res.status(404).json({ message: 'username or password incorrect' });
            }else{
                res.status(500).json({ message: 'Internal Server Error' });
            }
        }catch(err){
            console.log(err.message)
            res.status(500).json({ message: 'Internal Server Error' })
        }
    }else{
        res.status(405).json({ error: 'only POST method allowed' });
    }
}

// export default async function handler(req, res) {
//     return new Promise((resolve, reject)=>{
//         if (req.method === 'POST') {
//             console.log(req.body) 
//             const { username, password, token } = req.body;
//             await reCaptchaValidation(token);
//             validation(username, password).then((code) => {
//                 if(code === 200){
//                     // TODO: should store and generate the session key
//                     // Set the user session cookie
//                     res.setHeader('Set-Cookie', cookie.serialize('session', JSON.stringify({ isLoggedIn: true, username: username }), {
//                         maxAge: 7 * 24 * 60 * 60, // Expires in 30 days
//                         // httpOnly: true, // Can only be accessed via HTTP(S)
//                         // secure: process.env.NODE_ENV === 'production', // Only works in production
//                         sameSite: 'strict', // Cookie is only sent to the same site as the one that originated it
//                         path: '/', // Path of the cookie
//                     }))
//   
// 
//                     res.status(200).json({ message: 'ok' });
//                 }else if(code === 404){
//                     res.status(404).json({ message: 'username or password incorrect' });
//                 }else{
//                     res.status(500).json({ message: 'Internal Server Error' })
//                 }
//                 resolve();
//             }).catch((code, err) =>{
//                 res.status(code).json({ message: 'Internal Server Error' });
//                 resolve();
//             })
//         } else {
//             // Handle any other HTTP method
//             res.status(405).json({ error: 'only POST method allowed' });
//         }
//         return;
//     })
//     
// }
