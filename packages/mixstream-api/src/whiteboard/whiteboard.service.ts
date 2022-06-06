import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as dayjs from 'dayjs';
import { NetlessRole, RoleType } from 'mixstream-shared';
import { Repository } from 'typeorm';
import { WhiteboardEntity } from './whiteboard.entity';

@Injectable()
export class WhiteboardService {
  constructor(
    @Inject(ConfigService) private configService: ConfigService,
    @InjectRepository(WhiteboardEntity)
    private whiteboardRepository: Repository<WhiteboardEntity>,
  ) {}

  async createWhiteboard(
    uuid: string,
    expiredAt: Date,
    role: RoleType,
  ): Promise<WhiteboardEntity> {
    const whiteboardRole =
      role === RoleType.HOST ? NetlessRole.ADMIN : NetlessRole.WRITER;
    const now = new Date();
    const token = await this.retrieveNetlessRoomToken(
      uuid,
      dayjs(expiredAt).diff(now, 'millisecond'),
      whiteboardRole,
    );
    const whiteboard = this.whiteboardRepository.create({
      uuid,
      token,
      role: whiteboardRole,
      appIdentifier: this.configService.get('NETLESS_APP_IDENTIFIER'),

      sdkToken: this.configService.get('NETLESS_SDK_TOKEN'),

      createdAt: now,
      expiredAt: expiredAt,
    });
    return await this.whiteboardRepository.save(whiteboard);
  }

  async retrieveNetlessRoomUUID() {
    try {
      const {
        data: { uuid },
      } = await axios.post<{ uuid: string }>(
        'https://shunt-api.netless.link/v5/rooms',
        null,
        {
          headers: {
            token: this.configService.get('NETLESS_SDK_TOKEN'),
            region: this.configService.get('NETLESS_SDK_REGION'),
          },
        },
      );
      Logger.debug('netless room uuid: ', uuid);
      return uuid;
    } catch (error) {
      Logger.error('Failed to retrieve netless room uuid: ', error);
    }
  }

  private async retrieveNetlessRoomToken(
    roomUUID: string,
    lifespan: number,
    role: string,
  ): Promise<string> {
    try {
      const { data: roomToken } = await axios.post<string>(
        `https://shunt-api.netless.link/v5/tokens/rooms/${roomUUID}`,
        {
          lifespan,
          role,
        },
        {
          headers: { token: this.configService.get('NETLESS_SDK_TOKEN') },
        },
      );
      Logger.debug('netless room token: ', roomToken);
      return roomToken;
    } catch (error) {
      Logger.error('Failed to retrieve netless room token: ', error);
    }
  }
  async findSession(uuid: string): Promise<WhiteboardEntity | undefined> {
    return await this.whiteboardRepository.findOne({ where: { uuid } });
  }
}
