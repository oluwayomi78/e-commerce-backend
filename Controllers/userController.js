const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const generateAccessToken = require("../utills/generateToken");
const nodemailer = require('nodemailer');

const saltRounds = 10;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please enter all fields" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please enter a valid email" })
    }
    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" })
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    if (user) {
        try {
            const mailOptions = {
                from: `"LuxeMart" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: `Welcome to LuxeMart, ${user.name}!`,
                html: `<h1>Hi ${user.name},</h1><p>Welcome to LuxeMart! We're excited to have you.</p>`,
            };

            await transporter.sendMail(mailOptions);

        } catch (emailError) {
            console.error("Failed to send welcome email:", emailError);
        }

        res.status(201).json({
            message: "User created successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
            },
            token: generateAccessToken(user._id),
        });
    } else {
        res.status(400).json({ message: "Invalid user data" });
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Please enter all fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return res.status(400).json({ message: "Invalid password" });
    }

    if (user && passwordMatch) {
        try {
            const mailOptions = {
                from: `"LuxeMart Security" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'New Login to Your LuxeMart Account',
                html: `<h1>Hi ${user.name},</h1><p>We detected a new login to your account. If this was you, you can safely ignore this email.</p><p>If this was not you, please change your password immediately.</p>`,
            };

            await transporter.sendMail(mailOptions);

        } catch (emailError) {
            console.error("Failed to send login email:", emailError);
        }

        res.status(200).json({
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
            },
            token: generateAccessToken(user._id),
        });
    } else {
        res.status(400).json({ message: "Invalid email or password" });
    }
});

const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}, "-password");
    res.status(200).json(users);
});


const googleLogin = asyncHandler(async (req, res) => {
    const { name, email, googleId } = req.body;

    try {
        let user = await User.findOne({ email: email });

        if (user) {
            res.status(200).json({
                message: "Login successful",
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                },
                token: generateAccessToken(user._id),
            });
        } else {
            const hashedPassword = await bcrypt.hash(googleId, saltRounds);

            user = await User.create({
                name,
                email,
                password: hashedPassword,
            });

            if (user) {
                try {
                    const mailOptions = {
                        from: `"LuxeMart" <${process.env.EMAIL_USER}>`,
                        to: user.email,
                        subject: `Welcome to LuxeMart, ${user.name}!`,
                        html: `<h1>Hi ${user.name},</h1><p>Welcome to LuxeMart! We're excited to have you.</p>`,
                    };

                    await transporter.sendMail(mailOptions);

                } catch (emailError) {
                    console.error("Failed to send welcome email:", emailError);
                }

                res.status(201).json({
                    message: "User created successfully",
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        isAdmin: user.isAdmin,
                    },
                    token: generateAccessToken(user._id),
                });
            } else {
                res.status(400).json({ message: "Invalid user data" });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error during Google login' });
    }
});


const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.isAdmin = req.body.isAdmin;

        const updatedUser = await user.save();
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});
module.exports = {
    registerUser,
    loginUser,
    getUsers,
    googleLogin,
    updateUser,
    getUserById,
};