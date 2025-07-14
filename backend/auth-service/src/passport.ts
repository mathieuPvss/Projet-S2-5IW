import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import bcrypt from "bcryptjs";
import { findUserByEmail, findUserById } from "./services/user.service";

export function configurePassport() {
  // Stratégie locale pour la connexion
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await findUserByEmail(email);
          if (!user)
            return done(null, false, { message: "Utilisateur non trouvé" });
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch)
            return done(null, false, { message: "Mot de passe incorrect" });
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Stratégie JWT pour la protection des routes
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET!,
      },
      async (payload, done) => {
        try {
          const user = await findUserById(payload.sub);
          if (!user) return done(null, false);
          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );
}
