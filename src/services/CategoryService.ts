import { BaseService } from './BaseService';
import { categoryRepository } from '../database/repositories/index';
import type { ICategory } from '../database/models/index';

export class CategoryService extends BaseService<ICategory> {
  constructor() {
    super(categoryRepository);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async ensureUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;
    
    while (await this.exists({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    return slug;
  }

  async create(data: Partial<ICategory>): Promise<ICategory> {
    const name = data.name || '';
    const baseSlug = this.generateSlug(name);
    const uniqueSlug = await this.ensureUniqueSlug(baseSlug);
    
    return super.create({
      ...data,
      slug: uniqueSlug,
    });
  }

  async updateById(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
    if (data.name && !data.slug) {
      const baseSlug = this.generateSlug(data.name);
      const existing = await this.getById(id);
      
      if (existing && existing.slug === baseSlug) {
        data.slug = existing.slug;
      } else {
        const uniqueSlug = await this.ensureUniqueSlug(baseSlug);
        data.slug = uniqueSlug;
      }
    }
    
    return super.updateById(id, data);
  }
}

export const categoryService = new CategoryService();
