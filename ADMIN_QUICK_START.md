# Admin Panel - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ installed
- MongoDB running locally or connection string ready
- Modern browser (Chrome, Firefox, Safari, Edge)
- Mobile device or scanner for barcode testing

### Installation

#### 1. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/Manisara World
JWT_SECRET=your-super-secret-key-here-min-32-chars
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
COMPANY_NAME=Manisara World Pvt Ltd
COMPANY_ADDRESS=123 Fashion Street, Mumbai
INVOICE_FOOTER=Thank you for shopping with Manisara World!
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

#### 3. Start Development

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Browser opens at `http://localhost:3000`

---

## 🔐 Admin Login

1. Navigate to `/admin/login` or click "Admin Login"
2. Use admin credentials (created via `backend/scripts/createAdmin.js`)
3. Access admin panel at `/admin/panel`

### Create Admin User (One-time setup)
```bash
cd backend
node scripts/createAdmin.js
# Follow prompts to create admin account
```

---

## 📊 Dashboard Guide

### Viewing Statistics
- **Total Revenue**: All paid orders combined
- **Recent Revenue**: Last 30 days
- **Order Metrics**: Pending, Shipped, Delivered counts
- **Fulfillment Rate**: Percentage of delivered orders
- **Revenue Trend**: Last 7 days chart

### Quick Actions
- View Orders: Navigate to orders list
- Scan Package: Go to scanner
- Export Report: Download data

---

## 📦 Orders Management

### Viewing Orders
1. Click "📦 Orders" tab
2. Filter by status if needed
3. Click "Manage" to view order details

### Order Details Include
- Customer information
- Shipping address
- Order items with pricing
- Payment status
- Courier tracking info
- Invoice and label generation
- Complete scan history

### Quick Actions
- **Download Invoice**: Get PDF for records/email
- **Print Label**: Generate shipping label
- **View Invoice**: Modal view with all details
- **Update Courier**: Add tracking information
- **View Tracking**: See all scans and status updates

---

## 📱 Barcode Scanner

### Setup
1. Click "📱 Scanner" tab
2. Click "Start Camera" to enable camera access
3. Grant camera permission when prompted

### Scanning Orders

**Method 1: Camera Scan**
1. Select scan action (Packed, Shipped, etc.)
2. Point phone/laptop camera at barcode
3. Wait for automatic recognition
4. Status updates in real-time

**Method 2: Manual Entry**
1. Paste or type barcode/tracking code
2. Press Enter or click "Scan"
3. Order status updated instantly

### Supported Codes
- Order Number: `MW1234567890`
- Invoice Number: `INV-MW1234567890`
- Package ID: `PKG-MW1234567890`
- Tracking ID: `1Z999AA10123456784`
- AWB Number: `DHL2024001234`
- QR Code: Any QR encoding above codes

### Scan Actions
- **Packed**: Package ready for shipping
- **Shipped**: Handed to courier
- **Out for Delivery**: With delivery agent
- **Delivered**: Successfully delivered

### Features
- Scan counter shows total scans
- Recent scans history (10 latest)
- Sound feedback for success/error
- Real-time order updates
- Clear history option

---

## 🎫 Invoice Management

### Download Invoice
1. Open order details
2. Click "Download Invoice" button
3. PDF saved to downloads folder
4. Share with customer via email

### View Invoice Details
1. Click "View Invoice" button
2. Modal opens with full invoice
3. Copy invoice number to clipboard
4. Print directly from preview
5. Check payment status

### Invoice Includes
✓ Company logo and details
✓ Invoice number and date
✓ Customer information
✓ Complete item list with prices
✓ GST calculation (18%)
✓ Delivery charges
✓ Total amount
✓ Barcode for tracking
✓ QR code for verification
✓ Company footer message

---

## 🚚 Shipping Labels

### Print Shipping Label
1. Scroll to "Shipping Label" section
2. Click "Print" button
3. Print preview opens
4. Send to thermal printer

### Download Shipping Label
1. Click "Download" button
2. PDF saved to computer
3. Print or upload to courier portal

### Update Courier Details
1. Click "Update Courier" button
2. Fill courier information:
   - Provider (DHL, Fedex, UPS)
   - Tracking ID
   - AWB Number
   - Service type
3. Click "Save Changes"
4. Details saved and displayed

### Label Includes
✓ Customer shipping address
✓ Order number and package ID
✓ Courier information
✓ Tracking barcode
✓ QR code for package verification
✓ Thermal printer optimized format

---

## 📍 Order Tracking

### Status Timeline
- Visual representation of order status
- Shows completed, current, and pending steps
- Automated progression:
  1. Pending (initial)
  2. Confirmed
  3. Processing
  4. Packed
  5. Shipped
  6. Out for Delivery
  7. Delivered

### Scan History
- Every scan recorded with timestamp
- Shows action performed (packed, shipped, etc.)
- Displays admin who scanned
- Shows scan code used
- Notes from scanners
- Real-time updates

### History Actions
- Refresh to get latest scans
- View complete history
- Track delivery progression

---

## 💡 Pro Tips

### Efficiency
- Use keyboard shortcuts:
  - **Enter** to scan manual input
  - **Tab** to switch between fields
  - **Ctrl/Cmd + P** to print

### Bulk Operations
- Filter orders by status
- Use browser's multi-select for bulk actions
- Schedule batch scans during off-peak hours

### Troubleshooting
- **Camera not working?** Use manual entry
- **Barcode not scanning?** Check lighting/angle
- **Order not found?** Verify barcode value
- **Payment showing pending?** Refresh page
- **PDF not opening?** Check popup blocker

### Best Practices
- Scan packages in order received
- Add notes during unusual situations
- Update courier info immediately after handoff
- Print labels before handing to courier
- Keep scan history for 30+ days minimum
- Monitor dashboard daily for metrics

---

## 🔍 Common Tasks

### Process New Order
1. Navigate to Orders
2. Find order with status "pending"
3. Verify customer details
4. Print shipping label
5. Scan barcode with "Packed" action
6. Update courier information
7. Scan with "Shipped" action
8. Monitor delivery status

### Handle Order Inquiry
1. Search order by number/customer
2. Click order to open details
3. View complete timeline
4. Check scan history for status
5. Show customer invoice/label as needed

### Track Delivery Progress
1. Open order details
2. View tracking timeline
3. Check scan history
4. Note current status
5. Provide status to customer

### Manage Returns
1. Find original order
2. Create return entry (if system supports)
3. Update status to "returned"
4. Print return label
5. Track return shipment
6. Update payment status (refunded)

---

## 📱 Mobile Optimization

The admin panel is fully mobile responsive:
- Tablet: Full feature access
- Phone: Optimized layouts
- Landscape: Enhanced view

### Mobile-First Actions
1. **Barcode Scanning**: Use phone camera
2. **Quick View**: Tap order for summary
3. **Notifications**: Toast alerts for actions
4. **Offline Support**: Planned feature

---

## 🔒 Security

### Access Control
- Admin-only access to all features
- JWT token protection
- Automatic logout after inactivity
- No customer sees invoices/labels

### Best Practices
- Use strong passwords
- Log out after use
- Clear browser cache periodically
- Don't share admin credentials
- Use HTTPS in production
- Enable two-factor authentication (when available)

---

## 📞 Need Help?

### Common Issues

**Q: Camera not working?**
A: Check browser permissions, use manual entry instead

**Q: Order not showing?**
A: Refresh page, check filters, verify order exists

**Q: Invoice not downloading?**
A: Check popup blocker, try different browser

**Q: Scan not registering?**
A: Verify barcode format, check code value, use manual entry

**Q: Slow performance?**
A: Clear browser cache, close other tabs, try refresh

---

## 📈 Analytics & Reporting

### Daily Dashboard Review
- Check revenue metrics
- Review order statuses
- Monitor fulfillment rate
- Track pending orders

### Weekly Tasks
- Generate revenue report
- Review order trends
- Check fulfillment rates
- Analyze common issues

### Monthly Reviews
- Export detailed data
- Analyze revenue patterns
- Plan for peak seasons
- Review operational efficiency

---

## 🎯 Next Steps

1. **Complete Setup**: Install and run locally
2. **Create Admin**: Run createAdmin.js
3. **Test Orders**: Create test orders to scan
4. **Configure**: Update company details in env
5. **Deploy**: Set up production environment
6. **Integrate Courier**: Connect courier APIs
7. **Train Team**: Show staff how to use system

---

**Version**: 1.0.0
**Last Updated**: May 2024
**Status**: Production Ready ✅
