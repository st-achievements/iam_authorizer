import { Module } from '@nestjs/common';
import { DrizzleOrmModule } from '@st-achievements/database';
import { CoreModule } from '@st-api/core';
import { AchievementsCoreModule } from '@st-achievements/core';

@Module({
  imports: [
    CoreModule.forRoot(),
    AchievementsCoreModule.forRoot({
      authentication: false,
      throttling: false,
    }),
    DrizzleOrmModule,
  ],
})
export class AppModule {}
