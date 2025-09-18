# 💎 Beadsyde Order Form - Complete Solution

A professional jewelry order form with automatic Google Sheets logging and WhatsApp integration.

## 🎯 **What This Does**

✅ **Beautiful Order Form** - Clean, mobile-friendly design
✅ **Add to Cart System** - Intuitive product selection
✅ **WhatsApp Integration** - Orders sent directly to your WhatsApp
✅ **Google Sheets Logging** - Automatic order tracking
✅ **Professional Validation** - Prevents order errors

## 📁 **Files Included**

- `index.html` - Main order form (deploy this)
- `google-apps-script.js` - Google Sheets integration code
- `DEPLOYMENT_GUIDE.md` - Step-by-step setup instructions
- `images/` - Product photos folder

## 🚀 **Quick Start (10 minutes)**

### 1. Google Apps Script Setup
1. Go to [script.google.com](https://script.google.com)
2. Create new project
3. Paste code from `google-apps-script.js`
4. Deploy as web app
5. Copy the deployment URL

### 2. Deploy Website
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop `index.html`
3. Update the Google Apps Script URL in the code
4. Upload your product images

### 3. Test Everything
- Place a test order
- Check Google Sheets for new entry
- Verify WhatsApp message format

## 📱 **Features**

### For Customers:
- **Easy product selection** with quantity controls
- **Real-time cart updates** with live totals
- **Form validation** prevents ordering errors
- **Mobile-optimized** experience
- **WhatsApp ordering** - familiar and trusted

### For Business:
- **Automatic order logging** to Google Sheets
- **Clean WhatsApp messages** easy to read and process
- **Order tracking** with status updates
- **Customer data collection** for delivery
- **Professional appearance** builds trust

## 🛒 **Product Catalog**

- **Infinity Necklace** - ₹499 (Silver/Gold)
- **Infinity Bracelet** - ₹349 (Silver/Gold)
- **Shipping** - ₹100 (all orders)
- **Payment** - Online only, No COD

## 📊 **Google Sheets Tracking**

Each order creates a new row with:
- Order date and number
- Customer details (name, phone, address)
- Products ordered with quantities
- Pricing breakdown
- Special instructions
- Order status (for tracking)

## 📱 **WhatsApp Integration**

Orders are sent to: **9557705317**

Message format:
```
NEW ORDER - BEADSYDE

ORDER: BD123456
DATE: 18/9/2025, 11:51:31 pm

CUSTOMER:
Name: Customer Name
Phone: 9876543210
Address: Complete delivery address

ITEMS:
1. Infinity Necklace (Silver) x1 = Rs.499

TOTAL:
Items: Rs.499
Shipping: Rs.100
FINAL TOTAL: Rs.599

Delivery: 4-6 days | Online Payment Only
```

## 🔧 **Customization**

### Change WhatsApp Number
```javascript
const whatsappNumber = 'YOUR_NUMBER';
```

### Update Product Prices
```html
<div class="product-card" data-price="NEW_PRICE">
```

### Modify Shipping Cost
```javascript
let total = NEW_SHIPPING_COST;
```

## 📈 **Order Management**

1. **View Orders** - Check Google Sheets anytime
2. **Update Status** - Track order fulfillment
3. **Export Data** - For accounting and analysis
4. **Customer Communication** - All details captured

## 🎨 **Brand Guidelines**

- **Primary Blue**: #2E5BBA
- **Neutral Beige**: #F5F1E8
- **Clean Typography**: Inter font family
- **Professional Styling**: Consistent with jewelry brand
- **Mobile-First**: Responsive design

## 📞 **Support**

For setup help, check `DEPLOYMENT_GUIDE.md` for detailed instructions.

## 🎉 **Ready to Launch!**

Follow the deployment guide to get your order form live and start receiving orders within 10 minutes!

---

**Built for Beadsyde - Premium Jewelry Collection** ✨