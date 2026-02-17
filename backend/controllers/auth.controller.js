import User from '../models/user.model.js';
import { getLocale, t } from '../utils/i18n.js';
import jwt from 'jsonwebtoken';
import { redis } from '../utils/redis.js';

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    'EX',
    7 * 24 * 60 * 60,
  );
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true, // prevent XSS attacks
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, // prevent XSS attacks
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const signup = async (req, res) => {
  const locale = getLocale(req);
  // console.log("req body 123", req);
  if (!req.body) {
    return res
      .status(400)
      .json({ success: false, message: t('error.fill_all_fields', locale) });
  }
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res
      .status(400)
      .json({ success: false, message: t('error.fill_all_fields', locale) });
  }

  try {
    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({ message: t('error.user_exists', locale) });
    }
    const user = await User.create({ email, name, password, phone });

    // authenticate user
    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: 'User added',
    });
  } catch (error) {
    // console.log('error on signup', error);
    if (error?.name === 'ValidationError') {
      const [firstError] = Object.values(error.errors || {});
      if (firstError?.message) {
        const message = t(firstError.message, locale, {
          value: firstError.value,
        });
        return res.status(400).json({ success: false, message });
      }
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  console.log('login');
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      const { accessToken, refreshToken } = generateTokens(user._id);

      await storeRefreshToken(user._id, refreshToken);
      setCookies(res, accessToken, refreshToken);

      res.status(200).json({
        success: true,
        user: {
          _id: user._id,
          email: user.email,
        },
        message: 'Logged in successfully',
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.log('error', error);
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      await redis.del(`refresh_token:${decoded.userId}`);
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ success: true, message: 'Logout successfully' });
  } catch (error) {
    console.log('error', error);
  }
};

// this will be used to refresh the access token
export const refreshToken = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const decoded = jwt.verify(oldRefreshToken, process.env.JWT_SECRET);
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
    if (storedToken !== oldRefreshToken) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' },
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true, // prevent XSS attacks
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ success: true, message: 'Token refreshed' });
  } catch (error) {
    console.log('error', error);
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

// export const getProfile = async (req, res) => {
//   try {
//   } catch (error) {
//     console.log('error', error);
//   }
// };
