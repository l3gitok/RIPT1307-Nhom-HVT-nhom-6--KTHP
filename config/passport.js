const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user.model');

// =============================================================================
// JWT STRATEGY (cho API authentication)
// =============================================================================
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  jsonWebTokenOptions: {
    maxAge: process.env.JWT_EXPIRES_IN || '1h'
  }
};

passport.use('jwt', new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
  try {
    console.log('JWT Payload:', jwt_payload); // Debug log
    
    const user = await User.findById(jwt_payload.id)
      .select('-hashed_password -refresh_token -otp -otp_expiration');
    
    if (user) {
      // Optional: Check if user is verified
      if (!user.is_verified) {
        return done(null, false, { message: 'Tài khoản chưa được xác minh' });
      }
      
      // Optional: Check if user is active
      if (user.status === 'blocked') {
        return done(null, false, { message: 'Tài khoản đã bị khóa' });
      }
      
      return done(null, user);
    } else {
      return done(null, false, { message: 'User không tồn tại' });
    }
  } catch (error) {
    console.error('JWT Strategy Error:', error);
    return done(error, false);
  }
}));

// =============================================================================
// GOOGLE OAUTH STRATEGY (cho Google login)
// =============================================================================
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use('google', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google Profile:', profile); // Debug log
      
      // Tìm user theo Google ID
      let user = await User.findOne({ google_id: profile.id });

      if (user) {
        // User đã tồn tại, cập nhật thông tin nếu cần
        if (!user.profile.avatar_url && profile.photos && profile.photos[0]) {
          user.profile.avatar_url = profile.photos[0].value;
          await user.save();
        }
        return done(null, user);
      }

      // Kiểm tra email đã tồn tại chưa
      const existingEmailUser = await User.findOne({ 
        email: profile.emails[0].value 
      });

      if (existingEmailUser) {
        // Nếu email đã tồn tại, liên kết Google ID
        existingEmailUser.google_id = profile.id;
        existingEmailUser.is_verified = true; // Google user tự động verified
        if (!existingEmailUser.profile.avatar_url && profile.photos && profile.photos[0]) {
          existingEmailUser.profile.avatar_url = profile.photos[0].value;
        }
        await existingEmailUser.save();
        return done(null, existingEmailUser);
      }

      // Tạo user mới
      const newUser = await User.create({
        email: profile.emails[0].value,
        google_id: profile.id,
        role: 'user',
        is_verified: true, // Google user tự động verified
        profile: {
          username: profile.displayName || `user_${Date.now()}`,
          avatar_url: profile.photos && profile.photos[0] ? profile.photos[0].value : null
        }
      });

      return done(null, newUser);
    } catch (error) {
      console.error('Google Strategy Error:', error);
      return done(error, null);
    }
  }));
} else {
  console.warn('⚠️  Google OAuth credentials not found. Google login will be disabled.');
}

// =============================================================================
// SESSION SERIALIZATION (cho Google OAuth)
// =============================================================================
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
      .select('-hashed_password -refresh_token -otp -otp_expiration');
    done(null, user);
  } catch (error) {
    console.error('Deserialize User Error:', error);
    done(error, null);
  }
});

console.log('✅ Passport strategies configured successfully');

module.exports = passport;