import { getAdminClient } from '../database/supabase';
import { AppError } from './app-error.util';

interface StockItem {
  productId: string;
  quantity: number;
}

/**
 * Validate stock availability for all items in one pass.
 * Throws AppError if any product has insufficient stock.
 */
export async function validateStock(items: StockItem[]): Promise<void> {
  if (!items.length) return;

  const client = getAdminClient();

  for (const item of items) {
    const { data: product, error } = await client
      .from('products')
      .select('id, name, stock')
      .eq('id', item.productId)
      .single();

    if (error || !product) {
      throw new AppError(`Product ${item.productId} not found`, 404, 'PRODUCT_NOT_FOUND');
    }

    if (product.stock < item.quantity) {
      throw new AppError(
        `Insufficient stock for "${product.name || item.productId}": available ${product.stock}, requested ${item.quantity}`,
        400,
        'INSUFFICIENT_STOCK'
      );
    }
  }
}

/**
 * Deduct stock and increment total_sold for each item.
 * Uses the adjust_stock RPC for atomic per-product updates.
 * Must only be called after validateStock has passed.
 */
export async function deductStock(items: StockItem[]): Promise<void> {
  if (!items.length) return;

  const client = getAdminClient();

  for (const item of items) {
    const { error } = await client.rpc('adjust_stock', {
      p_product_id: item.productId,
      p_quantity: item.quantity,
    });

    if (error) {
      console.error(`[StockUtil] Failed to adjust stock for product ${item.productId}:`, error);
      throw new AppError(
        `Failed to update stock for product ${item.productId}`,
        500,
        'STOCK_UPDATE_FAILED'
      );
    }
  }
}
