import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AiRepository {
  constructor(private readonly prisma: PrismaService) {}

  createAdCreative(data: Prisma.AdCreativeCreateArgs) {
    return this.prisma.adCreative.create(data);
  }
}
