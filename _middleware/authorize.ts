import { expressjwt } from 'express-jwt';
import db from '../_helpers/db';

function authorize(roles: any = []) {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  // Return a single middleware instead of an array
  return async (req: any, res: any, next: any) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'Server misconfiguration: JWT_SECRET not set' });
    }

    // Step 1: Validate JWT
    expressjwt({ secret, algorithms: ['HS256'] })(req, res, async (err: any) => {
      if (err) return next(err);

      // Step 2: Check role + attach account info
      try {
        const account = await db.Account.findByPk(req.auth.id);

        if (!account || (roles.length && !roles.includes(account.role))) {
          return res.status(401).json({ message: 'Unauthorized' });
        }

        req.auth.role = account.role;
        const refreshTokens = await account.getRefreshTokens();
        req.auth.ownsToken = (token: any) => !!refreshTokens.find((x: any) => x.token === token);
        next();
      } catch (err: any) {
        next(err);
      }
    });
  };
}

// Use module.exports to avoid TypeScript default export issues on Vercel
module.exports = authorize;
module.exports.default = authorize;