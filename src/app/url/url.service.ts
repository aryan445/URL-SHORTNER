import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as crypto from 'crypto';
import { DATA_SOURCE } from '../db/constants';
import { URL_CLICK_REPOSITORY, URL_REPOSITORY } from './constants';
import { Url, UrlClick } from './entities';
import { CustomExceptionFactory } from '../exceptions/custom-exception.factory';
import { ErrorCode } from '../exceptions/error-codes';

export interface RedirectResult {
  url: string;
  statusCode: number;
}

@Injectable()
export class UrlService {
  constructor(
    @Inject(URL_REPOSITORY)
    readonly urlRepository: Repository<Url>,
    @Inject(URL_CLICK_REPOSITORY)
    readonly urlClickRepository: Repository<UrlClick>,
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
  ) {}

  async create(urlBody: Url): Promise<Url> {
    if (!urlBody.originalUrl) {
      throw new Error('originalUrl is required but was not provided');
    }
    
    const shortKey = urlBody.shortKey
      ? await this.resolveCustomShortKey(urlBody.shortKey)
      : await this.generateShortKey(urlBody.originalUrl);

    const url = this.urlRepository.create({
      originalUrl: urlBody.originalUrl,
      shortKey,
      expiresAt: urlBody.expiresAt,
      redirectPermanent: urlBody.redirectPermanent ?? false,
      userId: urlBody.userId ?? null,
    });

    return this.urlRepository.save(url);
  }

  private async resolveCustomShortKey(shortKey: string): Promise<string> {
    const existing = await this.urlRepository.findOne({ where: { shortKey } });
    if (existing) {
      throw CustomExceptionFactory.create(ErrorCode.SHORT_KEY_ALREADY_EXISTS);
    }
    return shortKey;
  }

  async getOriginalUrl(shortKey: string): Promise<RedirectResult | null> {
    const url = await this.urlRepository.findOne({
      where: { shortKey },
    });

    if (!url) {
      return null;
    }

    if (url.expiresAt && url.expiresAt < new Date()) {
      throw CustomExceptionFactory.create(ErrorCode.LINK_EXPIRED);
    }

    const now = new Date();
    url.clicks += 1;
    url.lastClickedAt = now;
    await this.urlRepository.save(url);

    await this.urlClickRepository.insert({
      urlId: url.id,
      clickedAt: now,
    });

    return {
      url: url.originalUrl,
      statusCode: url.redirectPermanent ? 301 : 302,
    };
  }

  async getUrlInfo(shortKey: string) {
    const url = await this.urlRepository.findOne({ where: { shortKey } });
    if (!url) {
      throw new NotFoundException('Short URL not found');
    }
    return {
      originalUrl: url.originalUrl,
      shortKey: url.shortKey,
      clicks: url.clicks,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt,
      lastClickedAt: url.lastClickedAt,
      redirectPermanent: url.redirectPermanent,
    };
  }

  async getClickHistory(
    shortKey: string,
    userId: string | null,
    limit = 50,
    offset = 0,
  ) {
    const url = await this.urlRepository.findOne({ where: { shortKey } });
    if (!url) return null;
    if (userId != null && url.userId !== userId) return null;

    const [data, total] = await this.urlClickRepository.findAndCount({
      where: { urlId: url.id },
      order: { clickedAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      data: data.map((c) => ({ clickedAt: c.clickedAt })),
      total,
    };
  }

  async findMyLinks(userId: string, limit = 20, offset = 0) {
    const [data, total] = await this.urlRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      data: data.map((u) => ({
        id: u.id,
        shortUrlKey: u.shortKey,
        originalUrl: u.originalUrl,
        clicks: u.clicks,
        createdAt: u.createdAt,
        expiresAt: u.expiresAt,
      })),
      total,
    };
  }

  private async generateShortKey(originalUrl: string): Promise<string> {
    const existingUrl = await this.urlRepository.findOne({
      where: { originalUrl },
    });
    if (existingUrl) {
      return existingUrl.shortKey;
    }
    let shortKey: string;
    let exists: boolean;

    do {
      shortKey = crypto.randomBytes(4).toString('hex');
      exists = !!(await this.urlRepository.findOne({ where: { shortKey } }));
    } while (exists);

    return shortKey;
  }
}
