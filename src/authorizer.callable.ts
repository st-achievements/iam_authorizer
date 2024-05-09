import {
  createCallableHandler,
  FirebaseAdminAuth,
  FirebaseAuth,
  inject,
  Logger,
} from '@st-api/firebase';
import { z } from 'zod';
import { safeAsync } from '@st-api/core';
import { signInWithCustomToken } from 'firebase/auth';
import { UNAUTHORIZED } from './exceptions.js';

const logger = Logger.create('AuthorizerCallable');

export const authorizerCallable = createCallableHandler({
  schema: () => ({
    request: z.object({
      token: z.string().trim().min(1).max(5000),
      path: z.string().trim().min(1).max(5000),
    }),
    response: z.object({}),
  }),
  name: 'authorize',
  handle: async (request) => {
    logger.info('request', {
      request: {
        data: request.data,
        auth: request.auth ?? null,
      },
    });
    const firebaseAdminAuth = inject(FirebaseAdminAuth);
    const firebaseAuth = inject(FirebaseAuth);
    const [errorCustomToken, credential] = await safeAsync(() =>
      signInWithCustomToken(firebaseAuth, request.data.token),
    );
    if (errorCustomToken) {
      logger.info({
        errorCustomToken,
        a: JSON.stringify({
          error: errorCustomToken,
          errorString: String(errorCustomToken),
        }),
      });
      throw UNAUTHORIZED();
    }
    logger.info({ credential });
    const token = await credential.user.getIdToken();
    logger.info({ token });
    const [error, user] = await safeAsync(() =>
      firebaseAdminAuth.verifyIdToken(token),
    );
    if (error) {
      logger.info({
        error,
      });
      throw UNAUTHORIZED();
    }
    logger.info({ user });
    return {};
  },
});
