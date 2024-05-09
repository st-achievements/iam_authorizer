import { StFirebaseApp } from '@st-api/firebase';

import { AppModule } from './app.module.js';
import { authorizerCallable } from './authorizer.callable.js';

const app = StFirebaseApp.create(AppModule, {}).addCallable(authorizerCallable);

export const iam_authorizer = {
  receiver: {
    http: app.getHttpHandler(),
    call: app.getCallableHandlers(),
  },
};
