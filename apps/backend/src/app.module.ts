import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { AppConfigModule } from './config/config.module';
import { LinksModule } from './links/links.module';

@Module({
  imports: [AppConfigModule, CommonModule, AuthModule, LinksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
