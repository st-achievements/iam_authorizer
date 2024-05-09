import { Module } from '@nestjs/common';
import { CoreModule } from '@st-api/core';
import { FirebaseAdminModule, FirebaseModule } from '@st-api/firebase';
import { AppController } from './app.controller.js';

@Module({
  imports: [
    CoreModule.forRoot(),
    FirebaseModule.forRoot(),
    FirebaseAdminModule.forRoot(),
  ],
  controllers: [AppController],
})
export class AppModule {}
