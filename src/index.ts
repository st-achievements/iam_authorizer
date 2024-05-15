import { INestApplicationContext } from '@nestjs/common';
import {
  DATABASE_CONNECTION_STRING,
  Drizzle,
  usr,
} from '@st-achievements/database';
import { StFirebaseApp } from '@st-api/firebase';
import { CloudFunction } from 'firebase-functions';
import { user, UserRecord } from 'firebase-functions/v1/auth';

import { AppModule } from './app.module.js';
import { authorizerCallable } from './authorizer.callable.js';

const app = StFirebaseApp.create(AppModule, {
  secrets: [DATABASE_CONNECTION_STRING],
}).addCallable(authorizerCallable);

export const iam_authorizer = {
  receiver: {
    http: app.getHttpHandler(),
    call: app.getCallableHandlers(),
  },
};

const u = user();
// TODO move this to a new lambda and send event when user is created
export const userCreated: CloudFunction<UserRecord> = u.onCreate(
  async (userRecord) => {
    const a: INestApplicationContext = await (app as any).getAppContext();
    const drizzle = await a.resolve(Drizzle);
    await drizzle.insert(usr.user).values({
      externalId: userRecord.uid,
      name:
        userRecord.displayName ??
        userRecord.email?.split('@').at(0) ??
        userRecord.phoneNumber ??
        'unknown',
    });
  },
);
