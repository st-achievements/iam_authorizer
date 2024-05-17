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

const logger = Logger.create('IdAuthorizerCallable');
const cache = new Map<
  string,
  Pick<InferSelectModel<typeof usr.user>, 'id' | 'name' | 'externalId'>
>();

export const idAuthorizerCallable = createCallableHandler({
  name: 'id',
  schema: () => ({
    request: z.object({
      token: z.string().trim().min(1).max(5000),
    }),
    response: z.object({
      userId: z.number(),
      externalId: z.string(),
      personaName: z.string(),
    }),
  }),
  handle: async (request) => {
    const firebaseAdminAuth = inject(FirebaseAdminAuth);
    const drizzle = inject(Drizzle);
    const [error, userFirebase] = await safeAsync(() =>
      firebaseAdminAuth.verifyIdToken(request.data.token),
    );
    if (error) {
      logger.info('Response from firebase admin', { error });
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
      logger.info(
        'The user already exists on firebase, but it does not exists in the database',
      );
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
