const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabaseClient'); // عدّل المسار حسب مشروعك

router.post('/coupons/validate', async (req : any, res: any) => {
  try {
    const { code, orderAmount, userId } = req.body;

    if (!code || typeof orderAmount !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'كود الكوبون وقيمة الطلب مطلوبين',
      });
    }

    // 1. جلب الكوبون بالكود (case-insensitive)
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .ilike('code', code.trim())
      .eq('is_deleted', false)
      .single();

    if (error || !coupon) {
      return res.status(404).json({
        success: false,
        message: 'الكوبون غير موجود',
      });
    }

    // 2. التحقق من الحالة والصلاحية
    const now = new Date();
    const startDate = coupon.start_date ? new Date(coupon.start_date) : null;
    const endDate = coupon.end_date ? new Date(coupon.end_date) : null;

    if (!coupon.is_active) {
      return res.status(400).json({ success: false, message: 'هذا الكوبون غير مفعّل' });
    }
    if (startDate && now < startDate) {
      return res.status(400).json({ success: false, message: 'هذا الكوبون لم يبدأ بعد' });
    }
    if (endDate && now > endDate) {
      return res.status(400).json({ success: false, message: 'هذا الكوبون منتهي الصلاحية' });
    }

    // 3. الحد الأدنى للطلب
    const minOrder = parseFloat(coupon.min_order_amount || 0);
    if (orderAmount < minOrder) {
      return res.status(400).json({
        success: false,
        message: `الحد الأدنى للطلب لاستخدام هذا الكوبون هو ${minOrder}`,
      });
    }

    // 4. حد الاستخدام الكلي
    if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
      return res.status(400).json({ success: false, message: 'تم استنفاد عدد مرات استخدام هذا الكوبون' });
    }

    // 5. حد الاستخدام لكل مستخدم (لو عندك جدول تتبع استخدام، إلا رح نتخطاها هلق)
    if (userId && coupon.per_user_limit) {
      const { count, error: usageError } = await supabase
        .from('coupon_usages') // 👈 لازم يكون عندك هالجدول، لو مش موجود شيل هالجزء
        .select('*', { count: 'exact', head: true })
        .eq('coupon_id', coupon.id)
        .eq('user_id', userId);

      if (!usageError && count >= coupon.per_user_limit) {
        return res.status(400).json({ success: false, message: 'لقد استخدمت هذا الكوبون من قبل' });
      }
    }

    // 6. حساب قيمة الخصم
    const value = parseFloat(coupon.value);
    let discountAmount = 0;

    if (coupon.type === 'PERCENTAGE') {
      discountAmount = (orderAmount * value) / 100;
      if (coupon.max_discount) {
        discountAmount = Math.min(discountAmount, parseFloat(coupon.max_discount));
      }
    } else if (coupon.type === 'FIXED') {
      discountAmount = value;
    }

    // ما تخلي الخصم أكبر من قيمة الطلب
    discountAmount = Math.min(discountAmount, orderAmount);
    discountAmount = Math.round(discountAmount * 100) / 100;

    return res.json({
      success: true,
      data: {
        valid: true,
        couponId: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value,
        discountAmount,
        finalAmount: Math.round((orderAmount - discountAmount) * 100) / 100,
      },
    });
  } catch (err) {
    console.error('[coupons.validate] error:', err);
    return res.status(500).json({ success: false, message: 'حدث خطأ أثناء التحقق من الكوبون' });
  }
});

module.exports = router;