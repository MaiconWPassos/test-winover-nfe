import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { NfeModule } from './nfe/nfe.module';
import { UsersModule } from './users/users.module';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        serializers: {
          req: (req: { id?: string; method?: string; url?: string }) => ({
            id: req.id,
            method: req.method,
            url: req.url,
          }),
          res: (res: { statusCode?: number }) => ({
            statusCode: res.statusCode,
          }),
        },
      },
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('DATABASE_URL');
        const sync =
          config.get<string>('TYPEORM_SYNC', 'true').toLowerCase() !== 'false';
        if (url) {
          return {
            type: 'postgres' as const,
            url,
            autoLoadEntities: true,
            synchronize: sync,
          };
        }
        return {
          type: 'postgres' as const,
          host: config.get<string>('DATABASE_HOST', 'localhost'),
          port: Number(config.get('DATABASE_PORT', 5432)),
          username: config.get<string>('DATABASE_USER', 'nfe'),
          password: config.get<string>('DATABASE_PASSWORD', 'nfe'),
          database: config.get<string>('DATABASE_NAME', 'nfe'),
          autoLoadEntities: true,
          synchronize: sync,
        };
      },
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    NfeModule,
    WebhookModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
