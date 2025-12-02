# Cal.com Theme Setup - Match Beadsyde Colors

The permanent bracelet booking page now has Cal.com theming configured in the code, but for **full color matching**, you need to update your Cal.com dashboard settings.

## 🎨 Update Cal.com Brand Colors (Dashboard):

### Step 1: Login to Cal.com
1. Go to [cal.com](https://cal.com) and login
2. Navigate to your account settings

### Step 2: Update Brand Settings
1. Go to **Settings** → **Appearance** (or **Branding**)
2. Set **Brand Color** to: `#2E5BBA` (Beadsyde Blue)
3. Choose **Light Theme**
4. Save changes

### Step 3: Update Event Type Settings
1. Go to your **Event Types**
2. Select "Permanent Bracelet Appointment"
3. Go to **Advanced** or **Appearance** tab
4. If available, set custom colors:
   - **Primary Color**: `#2E5BBA`
   - **Theme**: Light
5. Save event type

## ✅ Already Configured in Code:

The `permanent-bracelet.html` file already has:
- ✅ Brand color set to `#2E5BBA`
- ✅ Light theme enabled
- ✅ India timezone (Asia/Kolkata)
- ✅ Event details hidden
- ✅ Subtle blue background tint on container

## 🎯 Beadsyde Color Palette:

For reference, here are the Beadsyde colors:

- **Primary Blue**: `#2E5BBA`
- **Light Blue**: `#667eea`
- **Neutral Beige**: `#F5F1E8`
- **Pure White**: `#FFFFFF`
- **Text Dark**: `#1a1a1a`
- **Text Medium**: `#4a4a4a`
- **Text Light**: `#888888`

## 📝 Note:

Cal.com's embed has limited styling capabilities from the embed side due to iframe security restrictions. The main way to fully customize colors is through the Cal.com dashboard settings. Once you update the brand color in your Cal.com account, it will automatically reflect in all embeds.

## 🔍 Verify Theme:

After updating Cal.com dashboard:
1. Refresh your permanent bracelet booking page
2. The calendar should now show Beadsyde blue for:
   - Selected dates
   - Time slot buttons
   - Book button
   - Active states

If colors still don't match, clear your browser cache and reload!
