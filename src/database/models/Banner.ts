import { BannerLinkType, BannerPlatform } from '../enums/index';

export interface IBanner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  linkType: BannerLinkType;
  linkValue?: string | null;
  platform: BannerPlatform;
  position: string;
  sortOrder: number;
  startDate?: Date | null;
  endDate?: Date | null;
  isActive: boolean;
  clickCount: number;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
