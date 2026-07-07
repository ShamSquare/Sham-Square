export interface IProductReview {
  id: string;
  productId: string;
  userId: string;
  orderId?: string | null;
  variantId?: string | null;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  isHidden: boolean;
  helpfulCount: number;
  adminResponse?: {
    message: string;
    respondedBy: string;
    respondedAt: Date;
  };
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
