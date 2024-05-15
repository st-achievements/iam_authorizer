import { Drizzle, usr } from '@st-achievements/database';
import { safeAsync } from '@st-api/core';
import {
  createCallableHandler,
  FirebaseAdminAuth,
  inject,
  Logger,
} from '@st-api/firebase';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { UNAUTHORIZED } from './exceptions.js';

const logger = Logger.create('AuthorizerCallable');

export const authorizerCallable = createCallableHandler({
  schema: () => ({
    request: z.object({
      token: z.string().trim().min(1).max(5000),
      path: z.string().trim().min(1).max(5000),
    }),
    response: z.object({
      userId: z.number(),
      externalId: z.string(),
    }),
  }),
  name: 'id',
  handle: async (request) => {
    logger.info('request', {
      request: {
        data: request.data,
        auth: request.auth ?? null,
      },
    });
    const firebaseAdminAuth = inject(FirebaseAdminAuth);
    const drizzle = inject(Drizzle);
    const [error, userFirebase] = await safeAsync(() =>
      firebaseAdminAuth.verifyIdToken(request.data.token),
    );
    if (error) {
      logger.info({
        error,
      });
      throw UNAUTHORIZED();
    }
    // TODO use cache to find userId
    const user = await drizzle.query.usrUser.findFirst({
      columns: {
        id: true,
        externalId: true,
      },
      where: eq(usr.user.externalId, userFirebase.uid),
    });
    if (!user) {
      throw new Error('user not found');
    }
    return {
      userId: user.id,
      externalId: userFirebase.uid,
    };
  },
});
