import { Session } from 'mixstream-shared';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { ProfileEntity } from '../profile/profile.entity';
import { SignalEntity } from '../signal/signal.entity';

@Entity()
export class SessionEntity implements Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  channel: string;

  @Column()
  wUUID: string;

  @Column({ type: 'timestamp' })
  expiredAt: Date;

  @Column({ type: 'timestamp' })
  createdAt: Date;

  @OneToMany((type) => ProfileEntity, (profile) => profile.session)
  profiles: ProfileEntity[];

  @OneToOne((type) => SignalEntity, {
    cascade: true,
  })
  @JoinColumn()
  robot: SignalEntity;

  @RelationId((session: SessionEntity) => session.robot)
  robotId: string;
}
