/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, Inject, Logger, Param } from '@nestjs/common';
import { WhiteboardService } from './whiteboard.service';

@Controller('whiteboard')
export class WhiteboardController {
  constructor(
    @Inject(WhiteboardService)
    private services: WhiteboardService,
  ) {}

  @Get('/:uuid')
  findWhiteboard(@Param('uuid') uuid: string) {
    Logger.debug(`WhiteboardController.findWhiteboard: ${uuid}`);
    return this.services.findSession(uuid);
  }
}
