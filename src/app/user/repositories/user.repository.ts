import { Provider } from '@nestjs/common';
import { DATA_SOURCE } from 'src/app/db/constants';
import { DataSource } from 'typeorm';
import { USER_REPOSITORY } from '../constants';
import { User } from '../entities';

export const userRepositoryProvider: Provider = {
  provide: USER_REPOSITORY,
  inject: [DATA_SOURCE],
  useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
};
