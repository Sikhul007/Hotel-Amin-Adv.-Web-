import { Module, forwardRef } from '@nestjs/common';
import { ConfirmationController } from './confirmation.controller';
import { ConfirmationService } from './confirmation.service';
import { BookingModule } from '../booking/booking.module';
import { UserModule } from '../user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { Twilio } from 'twilio';

@Module({
  imports: [ConfigModule,
    CacheModule.register({ isGlobal: true }),
    forwardRef(() => BookingModule), UserModule],
  controllers: [ConfirmationController],
  providers: [
    ConfirmationService,
    {
      provide: 'TWILIO_CLIENT',
      useFactory: (configService: ConfigService) => {
        const accountSid = configService.get<string>('TWILIO_ACCOUNT_SID');
        const authToken = configService.get<string>('TWILIO_AUTH_TOKEN');
        return new Twilio(accountSid, authToken);
      },
      inject: [ConfigService],
    },
    ConfirmationService],

  exports: [ConfirmationService],
})
export class ConfirmationModule {}
