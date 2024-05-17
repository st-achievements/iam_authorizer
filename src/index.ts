import { DATABASE_CONNECTION_STRING } from '@st-achievements/database';
import { StFirebaseApp } from '@st-api/firebase';

import { AppModule } from './app.module.js';
import { idAuthorizerCallable } from './id-authorizer.callable.js';

const app = StFirebaseApp.create(AppModule, {
  secrets: [DATABASE_CONNECTION_STRING],
}).addCallable(idAuthorizerCallable);

export const iam_authorizer = {
  http: app.getHttpHandler(),
  call: app.getCallableHandlers(),
};
