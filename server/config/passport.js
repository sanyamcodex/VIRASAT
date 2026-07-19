import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

// Google OAuth is for User login only (not artisan/admin). The strategy is
// only registered when credentials are present, so the app runs without them.
export const configurePassport = () => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('Google OAuth not configured — skipping strategy setup');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          let user = await User.findOne({
            $or: [{ googleId: profile.id }, { email }],
          });
          if (!user) {
            user = await User.create({
              googleId: profile.id,
              email,
              name: profile.displayName,
              role: 'user',
            });
          } else if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );
};
