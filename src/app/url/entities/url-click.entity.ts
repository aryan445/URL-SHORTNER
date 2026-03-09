import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Url } from './url.entity';

@Entity('url_clicks')
export class UrlClick {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  urlId: string;

  @Column({ type: 'timestamp' })
  clickedAt: Date;

  @ManyToOne(() => Url, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'urlId' })
  url: Url;
}
