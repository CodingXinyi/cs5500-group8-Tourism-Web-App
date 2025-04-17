import express from "express";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const router = express.Router();
const prisma = new PrismaClient();

// 配置邮件发送服务
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  // 添加安全选项
  secure: true,
  tls: {
    rejectUnauthorized: false
  }
});

// 发送验证码
router.post("/send-verification", async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ error: "email and code are required" });
    }

    // 检查邮箱是否已存在
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingEmail) {
      return res.status(400).json({ error: "email already exists" });
    }

    // 发送邮件
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #5271ff;">Your Verification Code</h2>
          <p>Thank you for registering our tourism website! Here is your verification code:</p>
          <div style="background-color: #f5f5f5; padding: 10px; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; letter-spacing: 5px;">${code}</div>
          <p>Please enter this verification code to complete your registration. The verification code is valid for 10 minutes.</p>
          <p>If this is not your action, please ignore this email.</p>
          <p>Have a great journey!</p>
        </div>
      `
    };

    console.log(`Attempting to send email to: ${email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId}`);
    
    res.json({ success: true, message: "verification code sent" });
  } catch (error) {
    console.error("Email sending error:", error);
    // 返回更详细的错误信息
    res.status(500).json({ 
      error: "failed to send verification code", 
      details: error.message 
    });
  }
});

// Create a user
router.post("/", async (req, res) => {
  try {
    const { email, name, username, password } = req.body;
    
    // check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    });
    if (existingUsername) {
      return res.status(400).json({ error: "username already exists" });
    }

    // check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });
    if (existingEmail) {
      return res.status(400).json({ error: "email already exists" });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        username,
        password, // note: should encrypt password in actual use
      },
    });
    
    // exclude password when returning user information
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "failed to create user" });
  }
});

// get user information
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id)
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        posts: true,
        ratings: true,
        comments: true,
        // do not return password field
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "failed to get user information" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // find user
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(404).json({ error: "user does not exist" });
    }

    // verify password
    if (user.password !== password) { // note: should use encryption to compare in actual use
      return res.status(400).json({ error: "password is incorrect" });
    }

    // exclude password when returning user information
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "login failed" });  
  }
});

export default router;
