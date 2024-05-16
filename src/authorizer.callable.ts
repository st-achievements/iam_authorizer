import { Drizzle, usr } from '@st-achievements/database';
import { safeAsync } from '@st-api/core';
import {
  createCallableHandler,
  FirebaseAdminAuth,
  inject,
  Logger,
} from '@st-api/firebase';
import { eq, InferSelectModel } from 'drizzle-orm';
import { z } from 'zod';

import { UNAUTHORIZED, USER_NOT_CREATED } from './exceptions.js';

const logger = Logger.create('AuthorizerCallable');
const cache = new Map<
  string,
  Pick<InferSelectModel<typeof usr.user>, 'id' | 'name' | 'externalId'>
>();

export const authorizerCallable = createCallableHandler({
  schema: () => ({
    request: z.object({
      token: z.string().trim().min(1).max(5000),
      // TODO define how paths must be validated, maybe in the database?
      path: z.string().trim().min(1).max(5000),
    }),
    response: z.object({
      userId: z.number(),
      externalId: z.string(),
      personaName: z.string(),
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
      // TODO better error handling, add a mapping of errors
      logger.info({
        error,
      });
      throw UNAUTHORIZED();
    }
    const user =
      cache.get(userFirebase.uid) ??
      (await drizzle.query.usrUser.findFirst({
        columns: {
          id: true,
          externalId: true,
          name: true,
        },
        where: eq(usr.user.externalId, userFirebase.uid),
      }));
    if (!user) {
      throw USER_NOT_CREATED();
    }
    cache.set(userFirebase.uid, user);
    return {
      userId: user.id,
      externalId: userFirebase.uid,
      personaName: user.name,
    };
  },
});
