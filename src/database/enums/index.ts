/**
 * Central enum definitions for AshityShop.
 */

export enum RoleName {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  DELIVERY = 'DELIVERY',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export enum DevicePlatform {
  ANDROID = 'ANDROID',
  IOS = 'IOS',
  WEB = 'WEB',
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
  REFUNDED = 'REFUNDED',
}

export enum OrderItemStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PICKED = 'PICKED',
  PACKED = 'PACKED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
}

export enum PaymentMethod {
  COD = 'COD',
  // Future gateways — schema-ready, not active yet
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  RAZORPAY = 'RAZORPAY',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export enum CartStatus {
  ACTIVE = 'ACTIVE',
  ABANDONED = 'ABANDONED',
  CONVERTED = 'CONVERTED',
  EXPIRED = 'EXPIRED',
}

export enum CouponType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
  FREE_SHIPPING = 'FREE_SHIPPING',
}

export enum CouponApplicability {
  ALL = 'ALL',
  CATEGORIES = 'CATEGORIES',
  PRODUCTS = 'PRODUCTS',
}

export enum NotificationType {
  ORDER = 'ORDER',
  DELIVERY = 'DELIVERY',
  PROMOTION = 'PROMOTION',
  SYSTEM = 'SYSTEM',
  SUPPORT = 'SUPPORT',
  PAYMENT = 'PAYMENT',
}

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  PUSH = 'PUSH',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export enum NotificationDeliveryStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  READ = 'READ',
}

export enum BannerLinkType {
  NONE = 'NONE',
  PRODUCT = 'PRODUCT',
  CATEGORY = 'CATEGORY',
  SUBCATEGORY = 'SUBCATEGORY',
  EXTERNAL = 'EXTERNAL',
  COUPON = 'COUPON',
}

export enum BannerPlatform {
  ALL = 'ALL',
  WEB = 'WEB',
  ANDROID = 'ANDROID',
  IOS = 'IOS',
}

export enum SupportTicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_ON_CUSTOMER = 'WAITING_ON_CUSTOMER',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum SupportTicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum SupportTicketCategory {
  ORDER = 'ORDER',
  PAYMENT = 'PAYMENT',
  DELIVERY = 'DELIVERY',
  PRODUCT = 'PRODUCT',
  ACCOUNT = 'ACCOUNT',
  OTHER = 'OTHER',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  SOFT_DELETE = 'SOFT_DELETE',
  RESTORE = 'RESTORE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  STATUS_CHANGE = 'STATUS_CHANGE',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
}

export enum AddressLabel {
  HOME = 'HOME',
  WORK = 'WORK',
  OTHER = 'OTHER',
}

export enum SettingGroup {
  GENERAL = 'GENERAL',
  PAYMENT = 'PAYMENT',
  SHIPPING = 'SHIPPING',
  NOTIFICATION = 'NOTIFICATION',
  MOBILE = 'MOBILE',
  ANALYTICS = 'ANALYTICS',
  VENDOR = 'VENDOR',
  WAREHOUSE = 'WAREHOUSE',
}

export enum TrackingEventSource {
  SYSTEM = 'SYSTEM',
  ADMIN = 'ADMIN',
  DELIVERY = 'DELIVERY',
  CUSTOMER = 'CUSTOMER',
}

export enum CategoryType {
  ANIME = 'anime',
  CROCHET = 'crochet',
  HANDMADE = 'handmade',
  LIBRARY_AL_DOHA = 'library_al_doha',
}

// Keep Category enum for backward compatibility during migration
export enum Category {
  AL_DUHA_LIBRARY = 'AL_DUHA_LIBRARY',
  CROCHET = 'CROCHET',
  ANIME = 'ANIME',
  HANDMADE = 'HANDMADE',
}

export enum SubCategory {
  LIBRARY_PRODUCTS = 'LIBRARY_PRODUCTS',
  PRINTING_SERVICES = 'PRINTING_SERVICES',
  NO_SUB = 'NO_SUB',
}

/** Enum arrays derived from TypeScript enums */
export const ROLE_NAME_VALUES = Object.values(RoleName);
export const USER_STATUS_VALUES = Object.values(UserStatus);
export const DEVICE_PLATFORM_VALUES = Object.values(DevicePlatform);
export const PRODUCT_STATUS_VALUES = Object.values(ProductStatus);
export const ORDER_STATUS_VALUES = Object.values(OrderStatus);
export const ORDER_ITEM_STATUS_VALUES = Object.values(OrderItemStatus);
export const PAYMENT_METHOD_VALUES = Object.values(PaymentMethod);
export const PAYMENT_STATUS_VALUES = Object.values(PaymentStatus);
export const CART_STATUS_VALUES = Object.values(CartStatus);
export const COUPON_TYPE_VALUES = Object.values(CouponType);
export const COUPON_APPLICABILITY_VALUES = Object.values(CouponApplicability);
export const NOTIFICATION_TYPE_VALUES = Object.values(NotificationType);
export const NOTIFICATION_CHANNEL_VALUES = Object.values(NotificationChannel);
export const NOTIFICATION_DELIVERY_STATUS_VALUES = Object.values(NotificationDeliveryStatus);
export const BANNER_LINK_TYPE_VALUES = Object.values(BannerLinkType);
export const BANNER_PLATFORM_VALUES = Object.values(BannerPlatform);
export const SUPPORT_TICKET_STATUS_VALUES = Object.values(SupportTicketStatus);
export const SUPPORT_TICKET_PRIORITY_VALUES = Object.values(SupportTicketPriority);
export const SUPPORT_TICKET_CATEGORY_VALUES = Object.values(SupportTicketCategory);
export const AUDIT_ACTION_VALUES = Object.values(AuditAction);
export const ADDRESS_LABEL_VALUES = Object.values(AddressLabel);
export const SETTING_GROUP_VALUES = Object.values(SettingGroup);
export const TRACKING_EVENT_SOURCE_VALUES = Object.values(TrackingEventSource);
export const CATEGORY_VALUES = Object.values(Category);
export const SUB_CATEGORY_VALUES = Object.values(SubCategory);
export const CATEGORY_TYPE_VALUES = Object.values(CategoryType);
