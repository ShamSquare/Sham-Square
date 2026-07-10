/**
 * # Users
 * @openapi
 * /api/v1/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *   post:
 *     tags: [Users]
 *     summary: Create a new user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserDto'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 * /api/v1/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID primary key
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *   put:
 *     tags: [Users]
 *     summary: Update user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserDto'
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 *   delete:
 *     tags: [Users]
 *     summary: Delete user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User deleted (no content)
 *       404:
 *         description: User not found
 *
 * # Roles
 * @openapi
 * /api/v1/roles:
 *   get:
 *     tags: [Roles]
 *     summary: Get all roles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Role'
 *   post:
 *     tags: [Roles]
 *     summary: Create a new role
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoleDto'
 *     responses:
 *       201:
 *         description: Role created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       400:
 *         description: Validation error
 * /api/v1/roles/{id}:
 *   get:
 *     tags: [Roles]
 *     summary: Get role by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       404:
 *         description: Role not found
 *   put:
 *     tags: [Roles]
 *     summary: Update role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoleDto'
 *     responses:
 *       200:
 *         description: Role updated
 *       404:
 *         description: Role not found
 *   delete:
 *     tags: [Roles]
 *     summary: Delete role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Role deleted
 *       404:
 *         description: Role not found
 *
 * # Categories
 * @openapi
 * /api/v1/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *   post:
 *     tags: [Categories]
 *     summary: Create a new category
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryDto'
 *     responses:
 *       201:
 *         description: Category created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *       400:
 *         description: Validation error
 * /api/v1/categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category found
 *       404:
 *         description: Category not found
 *   put:
 *     tags: [Categories]
 *     summary: Update category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryDto'
 *     responses:
 *       200:
 *         description: Category updated
 *       404:
 *         description: Category not found
 *   delete:
 *     tags: [Categories]
 *     summary: Delete category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Category deleted
 *       404:
 *         description: Category not found
 *
 * # SubCategories
 * @openapi
 * /api/v1/subcategories:
 *   get:
 *     tags: [SubCategories]
 *     summary: Get all subcategories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of subcategories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SubCategory'
 *   post:
 *     tags: [SubCategories]
 *     summary: Create a new subcategory
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubCategoryDto'
 *     responses:
 *       201:
 *         description: SubCategory created
 *       400:
 *         description: Validation error
 * /api/v1/subcategories/{id}:
 *   get:
 *     tags: [SubCategories]
 *     summary: Get subcategory by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: SubCategory found
 *       404:
 *         description: SubCategory not found
 *   put:
 *     tags: [SubCategories]
 *     summary: Update subcategory
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubCategoryDto'
 *     responses:
 *       200:
 *         description: SubCategory updated
 *       404:
 *         description: SubCategory not found
 *   delete:
 *     tags: [SubCategories]
 *     summary: Delete subcategory
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: SubCategory deleted
 *       404:
 *         description: SubCategory not found
 *
 * # Products
 * @openapi
 * /api/v1/products:
 *   get:
 *     tags: [Products]
 *     summary: Get all products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *   post:
 *     tags: [Products]
 *     summary: Create a new product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductDto'
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 * /api/v1/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 *   put:
 *     tags: [Products]
 *     summary: Update product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductDto'
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 *   delete:
 *     tags: [Products]
 *     summary: Delete product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 *
 * # ProductVariants
 * @openapi
 * /api/v1/product-variants:
 *   get:
 *     tags: [ProductVariants]
 *     summary: Get all product variants
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of variants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductVariant'
 *   post:
 *     tags: [ProductVariants]
 *     summary: Create a new variant
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductVariantDto'
 *     responses:
 *       201:
 *         description: Variant created
 *       400:
 *         description: Validation error
 * /api/v1/product-variants/{id}:
 *   get:
 *     tags: [ProductVariants]
 *     summary: Get variant by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Variant found
 *       404:
 *         description: Variant not found
 *   put:
 *     tags: [ProductVariants]
 *     summary: Update variant
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductVariantDto'
 *     responses:
 *       200:
 *         description: Variant updated
 *       404:
 *         description: Variant not found
 *   delete:
 *     tags: [ProductVariants]
 *     summary: Delete variant
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Variant deleted
 *       404:
 *         description: Variant not found
 *
 * # ProductReviews
 * @openapi
 * /api/v1/product-reviews:
 *   get:
 *     tags: [ProductReviews]
 *     summary: Get all product reviews
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductReview'
 *   post:
 *     tags: [ProductReviews]
 *     summary: Create a new review
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductReviewDto'
 *     responses:
 *       201:
 *         description: Review created
 *       400:
 *         description: Validation error
 * /api/v1/product-reviews/{id}:
 *   get:
 *     tags: [ProductReviews]
 *     summary: Get review by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review found
 *       404:
 *         description: Review not found
 *   put:
 *     tags: [ProductReviews]
 *     summary: Update review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductReviewDto'
 *     responses:
 *       200:
 *         description: Review updated
 *       404:
 *         description: Review not found
 *   delete:
 *     tags: [ProductReviews]
 *     summary: Delete review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Review deleted
 *       404:
 *         description: Review not found
 *
 * # Carts
 * @openapi
 * /api/v1/carts:
 *   get:
 *     tags: [Carts]
 *     summary: Get all carts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of carts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Cart'
 *   post:
 *     tags: [Carts]
 *     summary: Create a new cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Cart created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 * /api/v1/carts/{id}:
 *   get:
 *     tags: [Carts]
 *     summary: Get cart by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cart found
 *       404:
 *         description: Cart not found
 *   put:
 *     tags: [Carts]
 *     summary: Update cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cart updated
 *       404:
 *         description: Cart not found
 *   delete:
 *     tags: [Carts]
 *     summary: Delete cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Cart deleted
 *       404:
 *         description: Cart not found
 *
 * # CartItems
 * @openapi
 * /api/v1/cart-items:
 *   get:
 *     tags: [CartItems]
 *     summary: Get all cart items
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of cart items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CartItem'
 *   post:
 *     tags: [CartItems]
 *     summary: Add item to cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCartItemDto'
 *     responses:
 *       201:
 *         description: Cart item created
 *       400:
 *         description: Validation error
 * /api/v1/cart-items/{id}:
 *   get:
 *     tags: [CartItems]
 *     summary: Get cart item by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cart item found
 *       404:
 *         description: Cart item not found
 *   put:
 *     tags: [CartItems]
 *     summary: Update cart item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCartItemDto'
 *     responses:
 *       200:
 *         description: Cart item updated
 *       404:
 *         description: Cart item not found
 *   delete:
 *     tags: [CartItems]
 *     summary: Remove cart item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Cart item deleted
 *       404:
 *         description: Cart item not found
 *
 * # Wishlists
 * @openapi
 * /api/v1/wishlists:
 *   get:
 *     tags: [Wishlists]
 *     summary: Get all wishlists
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of wishlists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Wishlist'
 *   post:
 *     tags: [Wishlists]
 *     summary: Create a new wishlist
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWishlistDto'
 *     responses:
 *       201:
 *         description: Wishlist created
 *       400:
 *         description: Validation error
 * /api/v1/wishlists/{id}:
 *   get:
 *     tags: [Wishlists]
 *     summary: Get wishlist by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Wishlist found
 *       404:
 *         description: Wishlist not found
 *   put:
 *     tags: [Wishlists]
 *     summary: Update wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWishlistDto'
 *     responses:
 *       200:
 *         description: Wishlist updated
 *       404:
 *         description: Wishlist not found
 *   delete:
 *     tags: [Wishlists]
 *     summary: Delete wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Wishlist deleted
 *       404:
 *         description: Wishlist not found
 *
 * # Orders
 * @openapi
 * /api/v1/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get all orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *   post:
 *     tags: [Orders]
 *     summary: Create a new order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderDto'
 *     responses:
 *       201:
 *         description: Order created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error
 * /api/v1/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order found
 *       404:
 *         description: Order not found
 *   put:
 *     tags: [Orders]
 *     summary: Update order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderDto'
 *     responses:
 *       200:
 *         description: Order updated
 *       404:
 *         description: Order not found
 *   delete:
 *     tags: [Orders]
 *     summary: Delete order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Order deleted
 *       404:
 *         description: Order not found
 *
 * # OrderItems
 * @openapi
 * /api/v1/order-items:
 *   get:
 *     tags: [OrderItems]
 *     summary: Get all order items
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of order items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderItem'
 *   post:
 *     tags: [OrderItems]
 *     summary: Create order item
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order item created
 *       400:
 *         description: Validation error
 * /api/v1/order-items/{id}:
 *   get:
 *     tags: [OrderItems]
 *     summary: Get order item by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order item found
 *       404:
 *         description: Order item not found
 *   put:
 *     tags: [OrderItems]
 *     summary: Update order item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order item updated
 *       404:
 *         description: Order item not found
 *   delete:
 *     tags: [OrderItems]
 *     summary: Delete order item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Order item deleted
 *       404:
 *         description: Order item not found
 *
 * # OrderTracking
 * @openapi
 * /api/v1/order-tracking:
 *   get:
 *     tags: [OrderTracking]
 *     summary: Get all tracking events
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tracking events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderTracking'
 *   post:
 *     tags: [OrderTracking]
 *     summary: Create tracking event
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Tracking event created
 *       400:
 *         description: Validation error
 * /api/v1/order-tracking/{id}:
 *   get:
 *     tags: [OrderTracking]
 *     summary: Get tracking event by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tracking event found
 *       404:
 *         description: Tracking event not found
 *   put:
 *     tags: [OrderTracking]
 *     summary: Update tracking event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tracking event updated
 *       404:
 *         description: Tracking event not found
 *   delete:
 *     tags: [OrderTracking]
 *     summary: Delete tracking event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Tracking event deleted
 *       404:
 *         description: Tracking event not found
 *
 * # Notifications
 * @openapi
 * /api/v1/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get all notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *   post:
 *     tags: [Notifications]
 *     summary: Create notification
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Notification created
 *       400:
 *         description: Validation error
 * /api/v1/notifications/{id}:
 *   get:
 *     tags: [Notifications]
 *     summary: Get notification by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification found
 *       404:
 *         description: Notification not found
 *   put:
 *     tags: [Notifications]
 *     summary: Update notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification updated
 *       404:
 *         description: Notification not found
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Notification deleted
 *       404:
 *         description: Notification not found
 *
 * # Coupons
 * @openapi
 * /api/v1/coupons:
 *   get:
 *     tags: [Coupons]
 *     summary: Get all coupons
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of coupons
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Coupon'
 *   post:
 *     tags: [Coupons]
 *     summary: Create a new coupon
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCouponDto'
 *     responses:
 *       201:
 *         description: Coupon created
 *       400:
 *         description: Validation error
 * /api/v1/coupons/{id}:
 *   get:
 *     tags: [Coupons]
 *     summary: Get coupon by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coupon found
 *       404:
 *         description: Coupon not found
 *   put:
 *     tags: [Coupons]
 *     summary: Update coupon
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCouponDto'
 *     responses:
 *       200:
 *         description: Coupon updated
 *       404:
 *         description: Coupon not found
 *   delete:
 *     tags: [Coupons]
 *     summary: Delete coupon
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Coupon deleted
 *       404:
 *         description: Coupon not found
 *
 * # Banners
 * @openapi
 * /api/v1/banners:
 *   get:
 *     tags: [Banners]
 *     summary: Get all banners
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of banners
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Banner'
 *   post:
 *     tags: [Banners]
 *     summary: Create a new banner
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBannerDto'
 *     responses:
 *       201:
 *         description: Banner created
 *       400:
 *         description: Validation error
 * /api/v1/banners/{id}:
 *   get:
 *     tags: [Banners]
 *     summary: Get banner by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Banner found
 *       404:
 *         description: Banner not found
 *   put:
 *     tags: [Banners]
 *     summary: Update banner
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBannerDto'
 *     responses:
 *       200:
 *         description: Banner updated
 *       404:
 *         description: Banner not found
 *   delete:
 *     tags: [Banners]
 *     summary: Delete banner
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Banner deleted
 *       404:
 *         description: Banner not found
 *
 * # Addresses
 * @openapi
 * /api/v1/addresses:
 *   get:
 *     tags: [Addresses]
 *     summary: Get all addresses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of addresses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Address'
 *   post:
 *     tags: [Addresses]
 *     summary: Create a new address
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAddressDto'
 *     responses:
 *       201:
 *         description: Address created
 *       400:
 *         description: Validation error
 * /api/v1/addresses/{id}:
 *   get:
 *     tags: [Addresses]
 *     summary: Get address by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Address found
 *       404:
 *         description: Address not found
 *   put:
 *     tags: [Addresses]
 *     summary: Update address
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAddressDto'
 *     responses:
 *       200:
 *         description: Address updated
 *       404:
 *         description: Address not found
 *   delete:
 *     tags: [Addresses]
 *     summary: Delete address
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Address deleted
 *       404:
 *         description: Address not found
 *
 * # SupportTickets
 * @openapi
 * /api/v1/support-tickets:
 *   get:
 *     tags: [SupportTickets]
 *     summary: Get all support tickets
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SupportTicket'
 *   post:
 *     tags: [SupportTickets]
 *     summary: Create a new support ticket
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSupportTicketDto'
 *     responses:
 *       201:
 *         description: Ticket created
 *       400:
 *         description: Validation error
 * /api/v1/support-tickets/{id}:
 *   get:
 *     tags: [SupportTickets]
 *     summary: Get ticket by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket found
 *       404:
 *         description: Ticket not found
 *   put:
 *     tags: [SupportTickets]
 *     summary: Update ticket
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSupportTicketDto'
 *     responses:
 *       200:
 *         description: Ticket updated
 *       404:
 *         description: Ticket not found
 *   delete:
 *     tags: [SupportTickets]
 *     summary: Delete ticket
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Ticket deleted
 *       404:
 *         description: Ticket not found
 *
 * # AuditLogs
 * @openapi
 * /api/v1/audit-logs:
 *   get:
 *     tags: [AuditLogs]
 *     summary: Get all audit logs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of audit logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuditLog'
 *   post:
 *     tags: [AuditLogs]
 *     summary: Create audit log
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Audit log created
 *       400:
 *         description: Validation error
 * /api/v1/audit-logs/{id}:
 *   get:
 *     tags: [AuditLogs]
 *     summary: Get audit log by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit log found
 *       404:
 *         description: Audit log not found
 *   put:
 *     tags: [AuditLogs]
 *     summary: Update audit log
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit log updated
 *       404:
 *         description: Audit log not found
 *   delete:
 *     tags: [AuditLogs]
 *     summary: Delete audit log
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Audit log deleted
 *       404:
 *         description: Audit log not found
 *
 * # Settings
 * @openapi
 * /api/v1/settings:
 *   get:
 *     tags: [Settings]
 *     summary: Get all settings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Setting'
 *   post:
 *     tags: [Settings]
 *     summary: Create a new setting
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSettingDto'
 *     responses:
 *       201:
 *         description: Setting created
 *       400:
 *         description: Validation error
 * /api/v1/settings/{id}:
 *   get:
 *     tags: [Settings]
 *     summary: Get setting by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Setting found
 *       404:
 *         description: Setting not found
 *   put:
 *     tags: [Settings]
 *     summary: Update setting
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSettingDto'
 *     responses:
 *       200:
 *         description: Setting updated
 *       404:
 *         description: Setting not found
 *   delete:
 *     tags: [Settings]
 *     summary: Delete setting
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *        schema:
 *          type: string
 *      responses:
 *        204:
 *          description: Setting deleted
 *        404:
 *          description: Setting not found
 *
 * # WebAuthentication
 * @openapi
 * /api/v1/web-auth/register:
 *   post:
 *     tags: [WebAuthentication]
 *     summary: Register a new web user  
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: password123
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               phone:
 *                 type: string
 *                 example: +963987654321
 *         required:
 *           - email
 *           - password
 *           - firstName
 *           - lastName
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebAuthResponse'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *
 * # WebAuthentication
 * @openapi
 * /api/v1/web-auth/login:
 *   post:
 *     tags: [WebAuthentication]
 *     summary: Login web user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *         required:
 *           - email
 *           - password
 *     responses:
 *       200:
  *         description: Login successful
  *         content:
  *           application/json:
  *             schema:
  *               $ref: '#/components/schemas/WebAuthResponse'
  *       400:
  *         description: Invalid credentials
  *         content:
  *           application/json:
  *             schema:
  *               $ref: '#/components/schemas/ApiErrorResponse'
  *       404:
  *         description: User not found
  *         content:
  *           application/json:
  *             schema:
  *               $ref: '#/components/schemas/ApiErrorResponse'
  *       500:
  *         description: Server error
  *         content:
  *           application/json:
  *             schema:
  *               $ref: '#/components/schemas/ApiErrorResponse'
  *
  * # WebAuthentication
  * @openapi
  * /api/v1/web-auth/me:
  *   get:
  *     tags: [WebAuthentication]
  *     summary: Get current authenticated web user
  *     security:
  *       - bearerAuth: []
  *     responses:
  *       200:
  *         description: User profile retrieved successfully
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 success:
  *                   type: boolean
  *                   example: true
  *                 data:
  *                   $ref: '#/components/schemas/WebUserProfile'
  *       401:
  *         description: Unauthorized
  *         content:
  *           application/json:
  *             schema:
  *               $ref: '#/components/schemas/ApiErrorResponse'
  *       404:
  *         description: User not found
  *         content:
  *           application/json:
  *             schema:
  *               $ref: '#/components/schemas/ApiErrorResponse'
  *       500:
  *         description: Server error
  *         content:
  *           application/json:
  *             schema:
  *               $ref: '#/components/schemas/ApiErrorResponse'
  *
  * # WebAuthentication
  * @openapi
  * /api/v1/web-auth/logout:
  *   post:
  *     tags: [WebAuthentication]
  *     summary: Logout web user
  *     security:
  *       - bearerAuth: []
  *     responses:
  *       200:
  *         description: Logout successful
  *         content:
  *           application/json:
  *             schema:
  *               $ref: '#/components/schemas/AuthMessageResponse'
  *       401:
  *         description: Unauthorized
  *         content:
  *           application/json:
  *             schema:
  *               $ref: '#/components/schemas/ApiErrorResponse'
  *       500:
  *         description: Server error
  *         content:
  *           application/json:
  *             schema:
  *               $ref: '#/components/schemas/ApiErrorResponse'
  */

export {};
