import { Profile, RoleType } from 'mixstream-shared';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SessionEntity } from '../session/session.entity';
import { SignalEntity } from '../signal/signal.entity';
import { StreamEntity } from '../stream/stream.entity';
import { WhiteboardEntity } from '../whiteboard/whiteboard.entity';

@Entity()
export class ProfileEntity implements Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  role: RoleType;

  @Column({ type: 'float' })
  aspectRatio: number;

  @Column()
  markable: boolean;

  @Column()
  lastSeen: Date;

  @Column()
  createdAt: Date;

  @Column()
  expiredAt: Date;

  @ManyToOne((type) => SessionEntity, (session) => session.profiles)
  session: SessionEntity;

  @OneToMany((type) => StreamEntity, (stream) => stream.profile, {
    cascade: true,
  })
  streams: StreamEntity[];

  @OneToMany((type) => SignalEntity, (signal) => signal.profile, {
    cascade: true,
  })
  signals: SignalEntity[];

  @OneToOne((type) => WhiteboardEntity, {
    cascade: true,
  })
  @JoinColumn()
  whiteboard: WhiteboardEntity;
}
