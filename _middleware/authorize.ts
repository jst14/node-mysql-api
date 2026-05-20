import { expressjwt } from 'express-jwt';
import db from '../_helpers/db';

export default function authorize(roles: any = []) {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return [
    // Read JWT_SECRET lazily inside the handler, not at module load time
    (req: any, res: any, next: any) => {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return res.status(500).json({ message: 'Server misconfiguration: JWT_SECRET not set' });
      }
      return expressjwt({ secret, algorithms: ['HS256'] })(req, res, next);
    },

    async (req: any, res: any, next: any) => {
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
    }
  ];
}