import { Module } from '@nestjs/common';
import { DrizzleOrmModule } from '@st-achievements/database';
import { CoreModule } from '@st-api/core';
import { FirebaseAdminModule, FirebaseModule } from '@st-api/firebase';

@Module({
  imports: [
    CoreModule.forRoot(),
    FirebaseModule.forRoot(),
    FirebaseAdminModule.forRoot(),
    DrizzleOrmModule,
  ],
})
export class AppModule {}
