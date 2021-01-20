const userService = require("../services/user.service");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const hashPassword = (password, saltRound) => {
    return new Promise((resolve,reject) => {
        bcrypt.hash(password, saltRound, (err, hash) => {
            if (err) reject(err);
            resolve(hash);
        });
    });
};

module.exports.register = async (req, res, next) => {
    try {
        const {body} = req;
        const saltRound = 10;
        body.password = await hashPassword(body.password, saltRound);
        const user = await userService.createUser(body); // BSON data will come form mongoDB
        const userObj = JSON.parse(JSON.stringify(user)); // BSON data convert into JSON then JSON turn into JS object
        delete userObj.password;

        const token = await jwt.sign(
            {
                data: userObj,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h",
            }
        );

        return res
            .status(200)
            .json({
                error: false,
                data: null,
                token: token,
                message: "registration completed"
            });

    } catch (e) {
        console.error(e);
        return res
            .status(500)
            .json({
                error: e,
                data: null,
                token: null,
                message: "something went wrong"
                     
            })
    }
}