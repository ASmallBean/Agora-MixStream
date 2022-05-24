import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { RoleType, SignalKind } from 'mixstream-shared';
import { MoreThanOrEqual, Repository, UpdateResult } from 'typeorm';
import { SignalService } from '../signal/signal.service';
import { WhiteboardService } from '../whiteboard/whiteboard.service';
import { SessionEntity } from './session.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(SessionEntity)
    private repository: Repository<SessionEntity>,
    @Inject(ConfigService)
    private config: ConfigService,
    @Inject(SignalService)
    private signalService: SignalService,
    @Inject(WhiteboardService)
    private whiteboardService: WhiteboardService,
  ) {}

  async createSession(
    channel: string,
    role: RoleType,
  ): Promise<Omit<SessionEntity, 'robotId' | 'wUUID'>> {
    const [sessions, count] = await this.repository.findAndCount({
      where: { channel, expiredAt: MoreThanOrEqual(new Date()) },
      select: ['id', 'channel', 'expiredAt', 'createdAt'],
    });
    if (count === 1) {
      if (sessions[0].hostCheckIn && role === RoleType.HOST) {
        throw new Error('There have been the host account to log in');
      }
      return sessions[0];
    }
    const expired = Number(
      this.config.get<string | undefined>('EXPIRED_DURATION') || 60 * 60 * 24,
    );
    const now = new Date();
    const expiredAt = dayjs(now).add(expired, 'second').toDate();
    const robot = await this.signalService.createSignal(
      channel,
      SignalKind.ROBOT,
      expiredAt,
    );

    const uuid = await this.whiteboardService.retrieveNetlessRoomUUID();

    const { robotId, wUUID, ...reset } = await this.repository.save(
      this.repository.create({
        channel,
        expiredAt,
        createdAt: now,
        robot,
        wUUID: uuid,
      }),
    );
    return { ...reset };
  }

  async findSession(id: string): Promise<SessionEntity | undefined> {
    const session = await this.repository.findOne({ where: { id } });
    if (!session) {
      throw new Error('Session not found');
    }
    return session;
  }

  async hostCheckIn(id: string, isIn: boolean): Promise<UpdateResult> {
    if (isIn) {
      const isCheckIn = await this.isHostCheckIn(id);
      if (isCheckIn) {
        throw new Error('There have been the host account to log in');
      }
    }
    return await this.repository.update(id, {
      hostCheckIn: isIn,
    });
  }

  async isHostCheckIn(id: string): Promise<boolean> {
    const session = await this.repository.findOne({ where: { id } });
    if (!session) {
      throw new Error('Session not found');
    }
    return session.hostCheckIn;
  }

  async getRobotId(id: string): Promise<string> {
    const session = await this.repository.findOne({
      where: { id },
    });
    if (!session) {
      throw new Error('Session not found');
    }
    return session.robotId;
  }
}
