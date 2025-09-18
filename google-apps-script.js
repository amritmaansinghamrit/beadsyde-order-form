// Google Apps Script for Beadsyde Order Management
// Deploy this as a web app to automatically log orders to Google Sheets

function doPost(e) {
  try {
    // Parse the incoming order data
    const orderData = JSON.parse(e.postData.contents);

    // Get or create the spreadsheet
    const spreadsheet = getOrCreateOrderSheet();
    const sheet = spreadsheet.getActiveSheet();

    // Log the order
    logOrderToSheet(sheet, orderData);

    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Order logged successfully',
        orderNumber: orderData.orderNumber
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error processing order:', error);

    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateOrderSheet() {
  const spreadsheetName = 'Beadsyde Orders';

  // Try to find existing spreadsheet
  const files = DriveApp.getFilesByName(spreadsheetName);

  if (files.hasNext()) {
    const file = files.next();
    return SpreadsheetApp.openById(file.getId());
  } else {
    // Create new spreadsheet
    const spreadsheet = SpreadsheetApp.create(spreadsheetName);
    const sheet = spreadsheet.getActiveSheet();

    // Set up headers
    const headers = [
      'Order Date',
      'Order Number',
      'Customer Name',
      'Phone Number',
      'Full Address',
      'Products Ordered',
      'Total Items',
      'Items Cost',
      'Shipping Cost',
      'Final Total',
      'Special Notes',
      'Order Status'
    ];

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Format headers
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#2E5BBA');
    headerRange.setFontColor('white');
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(12);

    // Set column widths for better readability
    sheet.setColumnWidth(1, 150); // Order Date
    sheet.setColumnWidth(2, 120); // Order Number
    sheet.setColumnWidth(3, 180); // Customer Name
    sheet.setColumnWidth(4, 140); // Phone Number
    sheet.setColumnWidth(5, 300); // Full Address
    sheet.setColumnWidth(6, 250); // Products Ordered
    sheet.setColumnWidth(7, 100); // Total Items
    sheet.setColumnWidth(8, 120); // Items Cost
    sheet.setColumnWidth(9, 120); // Shipping Cost
    sheet.setColumnWidth(10, 120); // Final Total
    sheet.setColumnWidth(11, 200); // Special Notes
    sheet.setColumnWidth(12, 120); // Order Status

    // Freeze header row
    sheet.setFrozenRows(1);

    return spreadsheet;
  }
}

function logOrderToSheet(sheet, orderData) {
  // Format products for easy reading
  let productsText = '';
  let totalItems = 0;

  orderData.products.forEach((product, index) => {
    if (index > 0) productsText += '\n';
    productsText += `${product.name} (${product.variant}) x${product.quantity} = Rs.${product.total}`;
    totalItems += product.quantity;
  });

  // Prepare row data
  const rowData = [
    orderData.orderDate,                           // Order Date
    orderData.orderNumber,                         // Order Number
    orderData.customer.name,                       // Customer Name
    orderData.customer.phone,                      // Phone Number
    orderData.customer.fullAddress,                // Full Address
    productsText,                                  // Products Ordered
    totalItems,                                    // Total Items
    `Rs.${orderData.total - orderData.shipping}`, // Items Cost
    `Rs.${orderData.shipping}`,                    // Shipping Cost
    `Rs.${orderData.total}`,                       // Final Total
    orderData.customer.specialNotes || 'None',    // Special Notes
    'New Order'                                    // Order Status
  ];

  // Find the next empty row
  const lastRow = sheet.getLastRow();
  const nextRow = lastRow + 1;

  // Insert the data
  sheet.getRange(nextRow, 1, 1, rowData.length).setValues([rowData]);

  // Format the new row
  const newRowRange = sheet.getRange(nextRow, 1, 1, rowData.length);
  newRowRange.setBorder(true, true, true, true, false, false);
  newRowRange.setVerticalAlignment('top');
  newRowRange.setWrap(true);

  // Alternate row colors for better readability
  if (nextRow % 2 === 0) {
    newRowRange.setBackground('#f8f9fa');
  }

  // Highlight new orders in light blue
  sheet.getRange(nextRow, 12).setBackground('#e3f2fd'); // Order Status column

  console.log(`✅ Order ${orderData.orderNumber} logged successfully for ${orderData.customer.name}`);
}

// Test function - you can run this to test the setup
function testOrderLogging() {
  const testOrder = {
    orderNumber: 'BD123456',
    orderDate: new Date().toLocaleString('en-IN'),
    customer: {
      name: 'Test Customer',
      phone: '9876543210',
      fullAddress: '123 Test Street, Test City, Test State - 123456',
      specialNotes: 'Test order for setup'
    },
    products: [
      {
        name: 'Infinity Necklace',
        variant: 'Silver',
        quantity: 1,
        total: 499
      }
    ],
    shipping: 100,
    total: 599
  };

  const spreadsheet = getOrCreateOrderSheet();
  const sheet = spreadsheet.getActiveSheet();
  logOrderToSheet(sheet, testOrder);

  console.log('✅ Test order logged successfully!');
  console.log('📋 Spreadsheet URL:', spreadsheet.getUrl());
}

// Utility function to get spreadsheet URL
function getSpreadsheetUrl() {
  const spreadsheet = getOrCreateOrderSheet();
  return spreadsheet.getUrl();
}

// Function to update order status (useful for order management)
function updateOrderStatus(orderNumber, newStatus) {
  const spreadsheet = getOrCreateOrderSheet();
  const sheet = spreadsheet.getActiveSheet();

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) { // Skip header row
    if (data[i][1] === orderNumber) { // Order Number column
      sheet.getRange(i + 1, 12).setValue(newStatus); // Order Status column
      sheet.getRange(i + 1, 12).setNote(`Status updated on ${new Date().toLocaleString('en-IN')}`);
      console.log(`✅ Order ${orderNumber} status updated to: ${newStatus}`);
      return true;
    }
  }

  console.log(`❌ Order ${orderNumber} not found`);
  return false;
}

// Function to get order statistics
function getOrderStats() {
  const spreadsheet = getOrCreateOrderSheet();
  const sheet = spreadsheet.getActiveSheet();

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0
    };
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();

  let totalOrders = data.length;
  let totalRevenue = 0;

  data.forEach(row => {
    const finalTotal = row[9]; // Final Total column
    if (typeof finalTotal === 'string' && finalTotal.startsWith('Rs.')) {
      totalRevenue += parseInt(finalTotal.replace('Rs.', '').replace(',', ''));
    }
  });

  return {
    totalOrders: totalOrders,
    totalRevenue: totalRevenue,
    averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
  };
}