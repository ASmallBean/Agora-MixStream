import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignalEntity } from '../signal/signal.entity';
import { SignalModule } from '../signal/signal.module';
import { WhiteboardModule } from '../whiteboard/whiteboard.module';
import { SessionController } from './session.controller';
import { SessionEntity } from './session.entity';
import { SessionService } from './session.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SessionEntity, SignalEntity]),
    SignalModule,
    WhiteboardModule,
  ],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
