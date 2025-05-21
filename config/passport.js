// filepath: gamehub-backend/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');



passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback',
  scope: ['profile', 'email']
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ google_id: profile.id });

    if (!user) {
      // Tạo người dùng mới khi đăng nhập qua Google
      user = await User.create({
        email: profile.emails[0].value,
        google_id: profile.id,
        role: 'user',
        profile: {
          username: profile.displayName,
          avatar_url: profile.photos[0].value
        }
      });
    }

    // Trả về user để xác thực trong session
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);  // Lưu ID của user vào session
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);  // Lấy thông tin user từ DB
  } catch (err) {
    done(err, null);
  }
});
module.exports = passport;
// Đoạn code này sử dụng passport-google-oauth20 để xác thực người dùng thông qua tài khoản Google.