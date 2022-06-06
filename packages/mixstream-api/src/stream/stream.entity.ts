import { Stream, StreamKind } from 'mixstream-shared';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProfileEntity } from '../profile/profile.entity';

@Entity()
export class StreamEntity implements Stream {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  appId: string;

  @Column()
  uid: number;

  @Column()
  token: string;

  @Column()
  kind: StreamKind;

  @Column()
  audio: boolean;

  @Column()
  video: boolean;

  @Column()
  createdAt: Date;

  @Column()
  expiredAt: Date;

  @ManyToOne((type) => ProfileEntity, (profile) => profile.streams)
  profile: ProfileEntity;
}
