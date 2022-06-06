import { NetlessRole, Whiteboard } from 'mixstream-shared';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class WhiteboardEntity implements Whiteboard {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  uuid: string;
  @Column()
  token: string;
  @Column()
  appIdentifier: string;
  @Column()
  role: NetlessRole;
  @Column()
  sdkToken: string;
  @Column()
  createdAt: Date;
  @Column()
  expiredAt: Date;
}
