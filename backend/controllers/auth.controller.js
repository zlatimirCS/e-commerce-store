import User from '../models/user.model.js';
import { getLocale, t } from '../utils/i18n.js';

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

    res.status(201).json({ success: true, user, message: 'User added' });
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
