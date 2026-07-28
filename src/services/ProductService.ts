import { BaseService } from './BaseService';
import { productRepository, productReviewRepository } from '../database/repositories/index';
import type { IProduct } from '../database/models/index';
import { getAdminClient } from '../database/supabase';

export class ProductService extends BaseService<IProduct> {
  constructor() {
    super(productRepository);
  }

  /**
   * Recalculate and update product rating based on approved reviews
   */
  async updateProductRating(productId: string): Promise<void> {
    const client = getAdminClient();

    // Fetch all approved reviews for this product
    const { data: reviews, error: reviewsError } = await client
      .from('product_reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('is_approved', true)
      .eq('is_deleted', false);

    if (reviewsError) {
      console.error(`[ProductService] Failed to fetch reviews for product ${productId}:`, reviewsError);
      return;
    }

    if (!reviews || reviews.length === 0) {
      // No approved reviews, set default rating
      const { error: updateError } = await client
        .from('products')
        .update({
          rating: {
            average: 0,
            count: 0,
            distribution: { one: 0, two: 0, three: 0, four: 0, five: 0 }
          }
        })
        .eq('id', productId);

      if (updateError) {
        console.error(`[ProductService] Failed to update rating for product ${productId}:`, updateError);
      }
      return;
    }

    // Calculate rating statistics
    const ratings = reviews.map((r: any) => r.rating);
    const sum = ratings.reduce((acc: number, r: number) => acc + r, 0);
    const average = Math.round((sum / ratings.length) * 10) / 10; // Round to 1 decimal place
    const count = ratings.length;

    // Calculate distribution
    const distribution = { one: 0, two: 0, three: 0, four: 0, five: 0 };
    ratings.forEach((rating: number) => {
      if (rating >= 1 && rating <= 5) {
        const key = ['one', 'two', 'three', 'four', 'five'][rating - 1] as keyof typeof distribution;
        distribution[key]++;
      }
    });

    // Update product rating
    const { error: updateError } = await client
      .from('products')
      .update({
        rating: {
          average,
          count,
          distribution
        }
      })
      .eq('id', productId);

    if (updateError) {
      console.error(`[ProductService] Failed to update rating for product ${productId}:`, updateError);
    }
  }
}

export const productService = new ProductService();
