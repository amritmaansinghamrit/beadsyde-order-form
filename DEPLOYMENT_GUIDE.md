# 🚀 Beadsyde Order Form - Complete Deployment Guide

## 📋 **What You'll Get**
- ✅ Live order form website
- ✅ Automatic Google Sheets logging
- ✅ WhatsApp integration
- ✅ Professional order management

---

## 🔧 **Step 1: Setup Google Apps Script (5 minutes)**

### 1. Create the Script
1. Go to [Google Apps Script](https://script.google.com/)
2. Click **"New Project"**
3. Delete the default code
4. Copy and paste the entire content from `google-apps-script.js`
5. Save the project as **"Beadsyde Order Manager"**

### 2. Deploy as Web App
1. Click **"Deploy"** → **"New deployment"**
2. Choose **"Web app"** as type
3. Set **Execute as**: "Me"
4. Set **Who has access**: "Anyone"
5. Click **"Deploy"**
6. **COPY THE WEB APP URL** (looks like: `https://script.google.com/macros/s/ABC123.../exec`)

### 3. Test the Setup
1. In Apps Script, click **"Run"** → **"testOrderLogging"**
2. Authorize the script when prompted
3. Check that a new Google Sheet called **"Beadsyde Orders"** was created
4. Note the spreadsheet URL for easy access

---

## 🌐 **Step 2: Deploy Website (2 minutes)**

### Option A: Netlify (Recommended - Free)
1. Go to [Netlify](https://netlify.com)
2. Sign up/login with Google
3. Drag and drop `index.html` from your `beadsyde-project` folder
4. **Your site is live instantly!** (Gets a random URL like `magical-unicorn-123.netlify.app`)

### Option B: Vercel (Alternative - Free)
1. Go to [Vercel](https://vercel.com)
2. Sign up/login with Google
3. Click **"Add New"** → **"Project"**
4. Upload `index.html`
5. Deploy

### Option C: GitHub Pages (Free)
1. Create GitHub account
2. Create new repository called `beadsyde-order-form`
3. Upload `index.html` and rename it to `index.html`
4. Go to Settings → Pages → Enable GitHub Pages
5. Your site will be at `username.github.io/beadsyde-order-form`

---

## 🔗 **Step 3: Connect Everything (1 minute)**

### Update the Order Form
1. Open your deployed website
2. Right-click → **"View Page Source"**
3. Find line with: `YOUR_GOOGLE_APPS_SCRIPT_URL`
4. In Netlify/Vercel: Click **"Site Settings"** → **"Environment Variables"**
5. OR manually edit the HTML and re-upload

**Replace this:**
```javascript
const response = await fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
```

**With this:**
```javascript
const response = await fetch('https://script.google.com/macros/s/YOUR_ACTUAL_URL/exec', {
```

---

## 📱 **Step 4: Add Your Product Images**

### Upload Images to Your Site
1. In Netlify: Go to **"Site Settings"** → **"Asset Optimization"** → **"Forms"**
2. Or create an `images` folder and upload:
   - `beadsyde logo.jpg`
   - `infinity necklace silver.jpg`
   - `infinity necklace gold.jpg`
   - `infinity bracelet silver.jpg`
   - `infinity bracelet gold.jpg`

---

## ✅ **Step 5: Test Complete Workflow**

### Test Order Flow
1. Go to your live website
2. Add products to cart
3. Fill customer details
4. Click **"Complete Order via WhatsApp"**
5. Check that:
   - WhatsApp opens with correct message
   - Google Sheet gets new row with order data
   - All information is accurate

---

## 📊 **Your Google Sheet Structure**

Your orders will be logged with these columns:
- **Order Date** - When order was placed
- **Order Number** - Unique BD number
- **Customer Name** - Full name
- **Phone Number** - Contact number
- **Full Address** - Complete delivery address
- **Products Ordered** - List of items with quantities
- **Total Items** - Number of pieces ordered
- **Items Cost** - Cost without shipping
- **Shipping Cost** - Rs.100 shipping
- **Final Total** - Complete order total
- **Special Notes** - Customer instructions
- **Order Status** - New Order/Processing/Shipped

---

## 🎯 **URLs You'll Need**

### Save These Important URLs:
1. **Your Website**: `https://your-site-name.netlify.app`
2. **Google Sheet**: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID`
3. **Apps Script**: `https://script.google.com/YOUR_PROJECT`

---

## 🔧 **Customization Options**

### Update WhatsApp Number
In your HTML, find and change:
```javascript
const whatsappNumber = '918104563011';
```

### Modify Product Prices
Update the `data-price` attributes in product cards:
```html
<div class="product-card" data-price="499">
```

### Change Shipping Cost
In JavaScript, modify:
```javascript
let total = 100; // Shipping cost
```

---

## 🆘 **Troubleshooting**

### Common Issues:

**WhatsApp Not Opening?**
- Check phone number format: `918104563011` (includes country code)
- Ensure URL is: `https://wa.me/918104563011`

**Google Sheets Not Working?**
1. Check Apps Script permissions
2. Verify Web App URL in HTML
3. Ensure deployment settings: "Execute as Me" + "Anyone can access"

**Images Not Loading?**
- Upload images to same folder as HTML
- Check image filenames match exactly
- Use relative paths: `images/filename.jpg`

**Form Not Submitting?**
- Check browser console for errors
- Verify all required fields are filled
- Test with simple data first

---

## 📈 **Order Management**

### View Orders
- Access your Google Sheet anytime
- Filter by date, status, or customer
- Export data for accounting
- Track order fulfillment

### Update Order Status
Use the Google Sheet to update order status:
- **New Order** → **Processing** → **Shipped** → **Delivered**

---

## 🎉 **You're Live!**

Your Beadsyde order form is now:
✅ **Live on the internet**
✅ **Collecting orders automatically**
✅ **Logging to Google Sheets**
✅ **Sending WhatsApp messages**
✅ **Ready for customers!**

### Share Your Order Form:
Send customers your website URL to start receiving orders immediately!

---

## 📞 **Support**

If you need help:
1. Check the troubleshooting section above
2. Test each step individually
3. Verify all URLs are correct
4. Check Google Apps Script logs for errors

**Your order form is ready to make sales! 🚀**