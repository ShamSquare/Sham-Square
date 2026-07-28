/**
 * Migration script to convert old department-based products to new CategoryType enum system
 * 
 * This script:
 * 1. Maps old department IDs to new CategoryType values
 * 2. Updates all products to use the new category_type field
 * 3. Removes department_id references from products
 */

import { getAdminClient } from '../supabase';
import { CategoryType } from '../enums';

// Mapping of old department IDs/names to new CategoryType values
// Adjust these mappings based on your actual department data
const DEPARTMENT_TO_CATEGORY_MAP: Record<string, CategoryType> = {
  // Map by department ID (if you know the IDs)
  // 'department-uuid-here': CategoryType.ANIME,
  
  // Map by department name (case-insensitive)
  'anime': CategoryType.ANIME,
  'crochet': CategoryType.CROCHET,
  'handmade': CategoryType.HANDMADE,
  'library': CategoryType.LIBRARY_AL_DOHA,
  'library al doha': CategoryType.LIBRARY_AL_DOHA,
  'al-duha library': CategoryType.LIBRARY_AL_DOHA,
  'al duha library': CategoryType.LIBRARY_AL_DOHA,
};

interface Product {
  id: string;
  department_id?: string;
  category?: string;
  sub_category?: string;
}

interface Department {
  id: string;
  name: string;
  nameAr: string;
}

async function migrateDepartmentsToCategories(): Promise<void> {
  console.log('🔄 Starting migration: Departments → Categories');
  
  const client = getAdminClient();
  
  try {
    // Step 1: Fetch all departments to build mapping
    console.log('📊 Fetching departments...');
    const { data: departments, error: deptError } = await client
      .from('departments')
      .select('id, name, nameAr')
      .eq('is_deleted', false);

    if (deptError) {
      console.error('❌ Error fetching departments:', deptError);
      throw deptError;
    }

    console.log(`✅ Found ${departments?.length || 0} departments`);

    // Build department ID to CategoryType mapping
    const deptIdToCategoryMap = new Map<string, CategoryType>();
    
    if (departments) {
      for (const dept of departments as Department[]) {
        const deptName = dept.name.toLowerCase();
        const deptNameAr = dept.nameAr.toLowerCase();
        
        // Find matching category
        let categoryType: CategoryType | undefined;
        
        // Try to match by name
        for (const [key, value] of Object.entries(DEPARTMENT_TO_CATEGORY_MAP)) {
          if (deptName.includes(key) || deptNameAr.includes(key)) {
            categoryType = value;
            break;
          }
        }
        
        if (categoryType) {
          deptIdToCategoryMap.set(dept.id, categoryType);
          console.log(`  ✓ Mapped department "${dept.name}" (${dept.id}) → ${categoryType}`);
        } else {
          console.warn(`  ⚠️  No mapping found for department "${dept.name}" (${dept.id})`);
        }
      }
    }

    // Step 2: Fetch all products with department_id
    console.log('\n📦 Fetching products...');
    const { data: products, error: prodError } = await client
      .from('products')
      .select('id, department_id, category, sub_category')
      .eq('is_deleted', false);

    if (prodError) {
      console.error('❌ Error fetching products:', prodError);
      throw prodError;
    }

    console.log(`✅ Found ${products?.length || 0} products`);

    if (!products || products.length === 0) {
      console.log('✅ No products to migrate');
      return;
    }

    // Step 3: Update each product
    console.log('\n🔄 Migrating products...');
    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const product of products as Product[]) {
      try {
        // Skip if already has category_type (new format)
        if (product.category && Object.values(CategoryType).includes(product.category as CategoryType)) {
          console.log(`  ⏭️  Product ${product.id} already has category_type: ${product.category}`);
          skipped++;
          continue;
        }

        // Determine new category
        let newCategory: CategoryType | undefined;
        
        // Try to get from department_id mapping
        if (product.department_id) {
          newCategory = deptIdToCategoryMap.get(product.department_id);
        }
        
        // If no mapping found, try to use existing category as fallback
        if (!newCategory && product.category) {
          const oldCategory = product.category.toUpperCase();
          if (oldCategory === 'AL_DUHA_LIBRARY') {
            newCategory = CategoryType.LIBRARY_AL_DOHA;
          } else if (oldCategory === 'CROCHET') {
            newCategory = CategoryType.CROCHET;
          } else if (oldCategory === 'ANIME') {
            newCategory = CategoryType.ANIME;
          } else if (oldCategory === 'HANDMADE') {
            newCategory = CategoryType.HANDMADE;
          }
        }

        if (!newCategory) {
          console.warn(`  ⚠️  Could not determine category for product ${product.id}`);
          errors++;
          continue;
        }

        // Update product
        const { error: updateError } = await client
          .from('products')
          .update({
            category: newCategory,
            // Clear department_id if it exists
            ...(product.department_id && { department_id: null }),
          })
          .eq('id', product.id);

        if (updateError) {
          console.error(`  ❌ Error updating product ${product.id}:`, updateError);
          errors++;
        } else {
          console.log(`  ✅ Migrated product ${product.id}: ${newCategory}`);
          migrated++;
        }
      } catch (error) {
        console.error(`  ❌ Error processing product ${product.id}:`, error);
        errors++;
      }
    }

    // Step 4: Summary
    console.log('\n📊 Migration Summary:');
    console.log(`  ✅ Migrated: ${migrated}`);
    console.log(`  ⏭️  Skipped: ${skipped}`);
    console.log(`  ❌ Errors: ${errors}`);
    console.log(`  📦 Total: ${products.length}`);

    if (errors > 0) {
      console.warn('\n⚠️  Some products had errors. Please review the logs above.');
    } else {
      console.log('\n✅ Migration completed successfully!');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateDepartmentsToCategories()
    .then(() => {
      console.log('\n✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateDepartmentsToCategories };