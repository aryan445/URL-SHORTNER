import { Provider } from '@nestjs/common';
import { DATA_SOURCE } from 'src/app/db/constants';
import { DataSource } from 'typeorm';
import { URL_CLICK_REPOSITORY } from '../constants';
import { UrlClick } from '../entities';

export const urlClickRepositoryProvider: Provider = {
  provide: URL_CLICK_REPOSITORY,
  inject: [DATA_SOURCE],
  useFactory: (dataSource: DataSource) => dataSource.getRepository(UrlClick),
};
