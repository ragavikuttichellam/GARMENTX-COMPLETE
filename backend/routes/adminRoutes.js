const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { getInvoice, getBarcode } = require('../controllers/invoiceController');
const { getShippingLabel } = require('../controllers/adminOrderController');
const {
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

router.use(protect, adminOnly);

const DASHBOARD_TIMEZONE = 'Asia/Kolkata';
const IST_OFFSET = '+05:30';

const formatDateKey = (date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: DASHBOARD_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};

const formatMonthKey = (date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: DASHBOARD_TIMEZONE,
    year: 'numeric',
    month: '2-digit'
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}`;
};

const dateFromIstKey = (key) => new Date(`${key}T00:00:00${IST_OFFSET}`);
const addDaysToIstKey = (dateKey, days) => {
  const date = dateFromIstKey(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDateKey(date);
};
const addMonthsToIstKey = (monthKey, months) => {
  const date = dateFromIstKey(`${monthKey}-01`);
  date.setUTCMonth(date.getUTCMonth() + months);
  return formatMonthKey(date);
};
const formatIstLabel = (key, options) => dateFromIstKey(key).toLocaleDateString('en-IN', {
  ...options,
  timeZone: DASHBOARD_TIMEZONE
});

const getIstWeekStartKey = (date) => {
  const todayKey = formatDateKey(date);
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: DASHBOARD_TIMEZONE,
    weekday: 'short'
  }).format(date);
  const weekdayIndex = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[weekday];
  const daysSinceMonday = (weekdayIndex + 6) % 7;
  return addDaysToIstKey(todayKey, -daysSinceMonday);
};

async function getDashboardStats() {
  const now = new Date();
  const revenueQuery = { isPaid: true, status: { $ne: 'cancelled' } };
  const todayKey = formatDateKey(now);
  const currentWeekStartKey = getIstWeekStartKey(now);
  const currentMonthKey = formatMonthKey(now);
  const monthStart = dateFromIstKey(`${currentMonthKey}-01`);

  const [
    totalProducts,
    totalOrders,
    totalCustomers,
    revenueStats,
    orderStatusCounts,
    lowStockProducts,
    recentProducts,
    topSellingProducts,
    newCustomers,
    repeatCustomersAgg,
    customerGrowthAgg
  ] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    User.countDocuments({ role: 'user' }),
    // Revenue and sales charts stay inside MongoDB so large order collections are not loaded into memory.
    Order.aggregate([
      { $match: revenueQuery },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$totalPrice' },
                todaysRevenue: {
                  $sum: {
                    $cond: [
                      { $eq: [{ $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: DASHBOARD_TIMEZONE } }, todayKey] },
                      '$totalPrice',
                      0
                    ]
                  }
                },
                monthlyRevenue: {
                  $sum: {
                    $cond: [
                      { $eq: [{ $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: DASHBOARD_TIMEZONE } }, currentMonthKey] },
                      '$totalPrice',
                      0
                    ]
                  }
                },
                weeklyRevenue: {
                  $sum: {
                    $cond: [
                      {
                        $gte: [
                          { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: DASHBOARD_TIMEZONE } },
                          currentWeekStartKey
                        ]
                      },
                      '$totalPrice',
                      0
                    ]
                  }
                }
              }
            }
          ],
          dailySales: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: DASHBOARD_TIMEZONE } },
                revenue: { $sum: '$totalPrice' },
                orders: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ],
          monthlySales: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: DASHBOARD_TIMEZONE } },
                revenue: { $sum: '$totalPrice' },
                orders: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Product.find({ stock: { $lte: 10 } }).sort({ stock: 1, createdAt: -1 }).limit(8).select('name stock price images category'),
    Product.find({}).sort({ createdAt: -1 }).limit(8).select('name stock price images category createdAt'),
    Order.aggregate([
      { $match: revenueQuery },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          name: { $first: '$orderItems.name' },
          image: { $first: '$orderItems.image' },
          quantitySold: { $sum: '$orderItems.quantity' },
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
        }
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 8 }
    ]),
    User.countDocuments({ role: 'user', createdAt: { $gte: monthStart } }),
    Order.aggregate([
      { $match: revenueQuery },
      { $group: { _id: '$user', orderCount: { $sum: 1 } } },
      { $match: { orderCount: { $gt: 1 } } },
      { $count: 'count' }
    ]),
    User.aggregate([
      { $match: { role: 'user' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: DASHBOARD_TIMEZONE } },
          customers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  const statusCounts = orderStatusCounts.reduce((acc, item) => {
    acc[item._id || 'pending'] = item.count;
    return acc;
  }, {});

  const revenueFacet = revenueStats[0] || {};
  const summary = revenueFacet.summary?.[0] || {};
  const dailySalesByKey = new Map((revenueFacet.dailySales || []).map((item) => [item._id, item]));
  const monthlySalesByKey = new Map((revenueFacet.monthlySales || []).map((item) => [item._id, item]));
  const dailySalesMap = new Map();
  for (let i = 6; i >= 0; i -= 1) {
    const key = addDaysToIstKey(todayKey, -i);
    const sales = dailySalesByKey.get(key) || {};
    dailySalesMap.set(key, {
      date: key,
      label: formatIstLabel(key, { weekday: 'short' }),
      revenue: Number(sales.revenue || 0),
      orders: sales.orders || 0
    });
  }

  const monthlySalesMap = new Map();
  for (let i = 11; i >= 0; i -= 1) {
    const key = addMonthsToIstKey(currentMonthKey, -i);
    const sales = monthlySalesByKey.get(key) || {};
    monthlySalesMap.set(key, {
      month: key,
      label: formatIstLabel(`${key}-01`, { month: 'short' }),
      revenue: Number(sales.revenue || 0),
      orders: sales.orders || 0
    });
  }

  const dashboardStats = {
    overview: {
      totalProducts,
      totalOrders,
      totalCustomers,
      totalUsers: totalCustomers,
      paidOrders: summary.totalOrders || 0,
      totalRevenue: Number((summary.totalRevenue || 0).toFixed(2)),
      todaysRevenue: Number((summary.todaysRevenue || 0).toFixed(2)),
      monthlyRevenue: Number((summary.monthlyRevenue || 0).toFixed(2)),
      weeklyRevenue: Number((summary.weeklyRevenue || 0).toFixed(2)),
      averageOrderValue: summary.totalOrders ? Number(((summary.totalRevenue || 0) / summary.totalOrders).toFixed(2)) : 0
    },
    orders: {
      pending: statusCounts.pending || 0,
      processing: (statusCounts.processing || 0) + (statusCounts.confirmed || 0),
      shipped: statusCounts.shipped || 0,
      delivered: statusCounts.delivered || 0,
      cancelled: statusCounts.cancelled || 0
    },
    analytics: {
      dailySales: Array.from(dailySalesMap.values()),
      weeklySales: Array.from(dailySalesMap.values()).filter((item) => item.date >= currentWeekStartKey),
      monthlySales: Array.from(monthlySalesMap.values()),
      revenueTrend: Array.from(dailySalesMap.values()).map((item) => ({ ...item }))
    },
    products: {
      topSelling: topSellingProducts,
      lowStock: lowStockProducts,
      recentlyAdded: recentProducts
    },
    customers: {
      newCustomers,
      repeatCustomers: repeatCustomersAgg[0]?.count || 0,
      growth: monthlySalesMap.size ? Array.from(monthlySalesMap.values()).map((month) => {
        const found = customerGrowthAgg.find((item) => item._id === month.month);
        return { month: month.month, label: month.label, customers: found?.customers || 0 };
      }) : []
    }
  };

  return {
    ...dashboardStats,
    totalProducts: dashboardStats.overview.totalProducts,
    totalOrders: dashboardStats.overview.totalOrders,
    totalUsers: dashboardStats.overview.totalUsers,
    totalCustomers: dashboardStats.overview.totalCustomers,
    totalRevenue: dashboardStats.overview.totalRevenue,
    todaysRevenue: dashboardStats.overview.todaysRevenue,
    weeklyRevenue: dashboardStats.overview.weeklyRevenue,
    monthlyRevenue: dashboardStats.overview.monthlyRevenue,
    averageOrderValue: dashboardStats.overview.averageOrderValue,
    dailySales: dashboardStats.analytics.dailySales,
    weeklySales: dashboardStats.analytics.weeklySales,
    monthlySales: dashboardStats.analytics.monthlySales,
    revenueTrend: dashboardStats.analytics.revenueTrend,
    pendingOrders: dashboardStats.orders.pending,
    processingOrders: dashboardStats.orders.processing,
    shippedOrders: dashboardStats.orders.shipped,
    deliveredOrders: dashboardStats.orders.delivered,
    cancelledOrders: dashboardStats.orders.cancelled
  };
}

router.get(['/stats', '/dashboard'], async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate('user', 'name email phone')
      .populate('orderItems.product', 'name images image price');
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/orders/:id/invoice', getInvoice);
router.get('/orders/:id/barcode', getBarcode);
router.get('/orders/:id/shipping-label', getShippingLabel);

module.exports = router;
