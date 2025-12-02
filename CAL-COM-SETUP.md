# Cal.com Setup Guide for Permanent Bracelet Booking

## Step 1: Create Your Cal.com Account

1. Go to [cal.com](https://cal.com)
2. Sign up for a free account
3. Choose your username (e.g., "beadsyde")

## Step 2: Create an Event Type

1. After logging in, go to "Event Types"
2. Click "New Event Type"
3. Set up your permanent bracelet appointment:
   - **Event Name**: Permanent Bracelet Appointment
   - **Event URL**: permanent-bracelet
   - **Duration**: 15 minutes (or however long appointments take)
   - **Location**: In-person at your store address

## Step 3: Configure Availability

1. Go to "Availability" in Cal.com
2. Set your store hours:
   - Example: Monday-Saturday, 10:00 AM - 6:00 PM
   - Block out any days you're closed
3. Set buffer time between appointments if needed

## Step 4: Customize Booking Questions

1. In your "permanent-bracelet" event type, scroll to "Additional Inputs"
2. Add these custom questions to match your requirements:
   - **Full Name** (already included by default)
   - **Phone Number** (already included - enable it)
   - **Number of People Coming** (Short Text or Number field)
   - **Special Requests** (Long Text - optional)

Example setup:
```
Question: "How many people will be coming?"
Type: Number
Required: Yes
Placeholder: "Enter number of people"

Question: "Any special requests or questions?"
Type: Long Text
Required: No
Placeholder: "Tell us anything we should know..."
```

## Step 5: Update Your Website

1. After creating your Cal.com account and event type, update the `permanent-bracelet.html` file
2. Find this line (around line 637):
   ```javascript
   calLink: "beadsyde/permanent-bracelet",
   ```
3. Replace "beadsyde" with your actual Cal.com username

## Step 6: Enable Notifications

In Cal.com settings, you can:
- Get email notifications for new bookings
- Send automatic confirmation emails to customers
- Send reminder emails before appointments
- Set up SMS notifications (paid feature)

## Step 7: Connect Your Calendar (Optional but Recommended)

1. Go to "Apps" in Cal.com
2. Connect your Google Calendar, Outlook, or Apple Calendar
3. This prevents double bookings and keeps your schedule synced

## Testing Your Integration

1. Open your `permanent-bracelet.html` page in a browser
2. The Cal.com calendar should appear in the booking section
3. Try booking a test appointment to see how it works
4. You'll receive a confirmation email at your Cal.com account email

## Pricing Information

Cal.com offers:
- **Free Plan**: Unlimited bookings, basic features
- **Paid Plans**: Starting at $12/month for team features, payment integration, etc.

The free plan should work perfectly for your permanent bracelet bookings!

## Troubleshooting

**If the calendar doesn't show up:**
1. Make sure you've updated the username in the code
2. Check that your event type URL is exactly "permanent-bracelet"
3. Make sure your Cal.com event is published (not in draft mode)
4. Check browser console (F12) for any error messages

**To test locally:**
- Cal.com embeds work best when the page is hosted online
- For local testing, you may need to use a local server
- Or simply upload to Vercel/Netlify to test the live version

## Alternative: Use Cal.com Link Instead

If you prefer, you can simply create a button that links directly to your Cal.com page:
```html
<a href="https://cal.com/beadsyde/permanent-bracelet" target="_blank">
    Book Appointment
</a>
```

This will open Cal.com in a new tab rather than embedding it.

---

## Need Help?

- Cal.com Documentation: https://cal.com/docs
- Cal.com Support: https://cal.com/support
- Beadsyde Project: Check your main index.html for the banner link

Once set up, customers can:
1. See your real-time availability
2. Book appointments instantly
3. Receive automatic confirmations
4. Get reminder emails
5. Cancel/reschedule if needed (you can enable this)

Everything syncs with your calendar automatically!
