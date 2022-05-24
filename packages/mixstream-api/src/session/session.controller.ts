import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { Profile, Session } from 'mixstream-shared';
import { SessionService } from './session.service';

@Controller('session')
export class SessionController {
  constructor(
    @Inject(SessionService)
    private services: SessionService,
  ) {}

  @Post('/')
  createSession(
    @Body() body: Pick<Session, 'channel'> & Pick<Profile, 'role'>,
  ) {
    Logger.debug(`SessionController.createSession: ${JSON.stringify(body)}`);
    return this.services.createSession(body.channel, body.role);
  }

  @Get('/:id')
  findSession(@Param('id') id: string) {
    Logger.debug(`SessionController.findSession: ${id}`);
    return this.services.findSession(id);
  }
}
