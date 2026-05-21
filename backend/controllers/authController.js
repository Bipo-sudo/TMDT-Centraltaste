require('dotenv').config();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { verifyGoogleToken } = require('../services/googleService');
const { sendWelcomeEmail, sendOTPEmail } = require('../services/emailService');

const otpCache = new Map();

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function createToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function googleLogin(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Google token is required' });
    }

    const payload = await verifyGoogleToken(token);

    if (!payload.email) {
      return res.status(400).json({ success: false, message: 'Google account email is missing' });
    }

    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [payload.email]);
    let user = rows[0];

    if (!user) {
      const [result] = await pool.execute(
        `
          INSERT INTO users (email, full_name, avatar_url, auth_provider, is_verified, role)
          VALUES (?, ?, ?, 'google', TRUE, 'customer')
        `,
        [payload.email, payload.name || '', payload.picture || '']
      );

      user = {
        id: result.insertId,
        email: payload.email,
        role: 'customer',
      };

      await sendWelcomeEmail(payload.email, payload.name || 'bạn');
    } else {
      user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    }

    const jwtToken = createToken(user);

    return res.status(200).json({
      success: true,
      message: 'Google login successful',
      data: {
        token: jwtToken,
        user,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Google login failed',
    });
  }
}

async function register(req, res) {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'email, password and full_name are required' });
    }

    const [existingUsers] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);

    if (existingUsers.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `
        INSERT INTO users (email, full_name, auth_provider, password_hash, is_verified, role)
        VALUES (?, ?, 'credentials', ?, FALSE, 'customer')
      `,
      [email, full_name, passwordHash]
    );

    const otp = generateOtp();
    otpCache.set(email, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    await sendOTPEmail(email, otp);

    return res.status(201).json({
      success: true,
      message: 'Registration successful. OTP sent to email.',
      data: {
        userId: result.insertId,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
}

async function verifyOTP(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'email and otp are required' });
    }

    const cachedOtp = otpCache.get(email);

    if (!cachedOtp) {
      return res.status(400).json({ success: false, message: 'OTP is invalid or expired' });
    }

    if (cachedOtp.expiresAt < Date.now()) {
      otpCache.delete(email);
      return res.status(400).json({ success: false, message: 'OTP is expired' });
    }

    if (cachedOtp.otp !== String(otp)) {
      return res.status(400).json({ success: false, message: 'OTP is incorrect' });
    }

    const [users] = await pool.execute('SELECT id, email, role FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];

    await pool.execute('UPDATE users SET is_verified = TRUE WHERE email = ?', [email]);
    otpCache.delete(email);

    const token = createToken(user);

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'OTP verification failed',
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' });
    }

    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];

    if (!user.is_verified) {
      return res.status(403).json({ success: false, message: 'Account is not verified' });
    }

    if (!user.password_hash) {
      return res.status(400).json({ success: false, message: 'Password login is not available for this account' });
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const userPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = createToken(userPayload);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userPayload,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
}

module.exports = {
  googleLogin,
  register,
  verifyOTP,
  login,
  otpCache,
};