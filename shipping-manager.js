// Beadsyde Shiprocket Integration & Shipping Management System
// Handles automated order creation, tracking, and customer notifications

class BeadsydeShippingManager {
    constructor() {
        this.shiprocketConfig = {
            baseURL: 'https://apiv2.shiprocket.in/v1/external',
            email: 'your-shiprocket-email@example.com', // Replace with actual
            password: 'your-shiprocket-password', // Replace with actual
            token: null,
            tokenExpiry: null
        };

        this.indiaPostConfig = {
            baseURL: 'https://speedpost-tracking-api-for-india-post.p.rapidapi.com',
            apiKey: 'a991f7753fmsh09bbc3104956af7p1900c2jsn4a0b948c5457',
            host: 'speedpost-tracking-api-for-india-post.p.rapidapi.com'
        };

        this.whatsappConfig = {
            businessNumber: '918104563011',
            apiEndpoint: 'https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages', // Replace
            accessToken: 'YOUR_WHATSAPP_BUSINESS_ACCESS_TOKEN' // Replace
        };

        this.database = window.firebaseDB;
        this.init();
    }

    async init() {
        console.log('🚢 Initializing Beadsyde Shipping Manager...');

        // Set up order processing listener
        this.setupOrderListener();

        // Set up periodic status updates
        this.setupStatusUpdateScheduler();

        console.log('✅ Shipping Manager initialized');
    }

    // ==========================================
    // SHIPROCKET AUTHENTICATION
    // ==========================================

    async authenticateShiprocket() {
        try {
            // Check if token is still valid
            if (this.shiprocketConfig.token && this.shiprocketConfig.tokenExpiry > Date.now()) {
                return this.shiprocketConfig.token;
            }

            const response = await fetch(`${this.shiprocketConfig.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: this.shiprocketConfig.email,
                    password: this.shiprocketConfig.password
                })
            });

            const data = await response.json();

            if (response.ok && data.token) {
                this.shiprocketConfig.token = data.token;
                this.shiprocketConfig.tokenExpiry = Date.now() + (23 * 60 * 60 * 1000); // 23 hours

                // Store token in localStorage for persistence
                localStorage.setItem('shiprocket_token', data.token);
                localStorage.setItem('shiprocket_token_expiry', this.shiprocketConfig.tokenExpiry);

                console.log('🔐 Shiprocket authenticated successfully');
                return data.token;
            } else {
                throw new Error(data.message || 'Authentication failed');
            }
        } catch (error) {
            console.error('❌ Shiprocket authentication failed:', error);
            return null;
        }
    }

    // ==========================================
    // ORDER PROCESSING
    // ==========================================

    setupOrderListener() {
        // Listen for new orders from Firebase
        if (this.database) {
            const { ref, onValue } = window.firebaseImports || {};
            if (ref && onValue) {
                const ordersRef = ref(this.database, 'orders');
                onValue(ordersRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const orders = snapshot.val();
                        this.processNewOrders(orders);
                    }
                });
            }
        }

        // Also check localStorage orders
        setInterval(() => {
            this.processLocalStorageOrders();
        }, 30000); // Check every 30 seconds
    }

    async processNewOrders(firebaseOrders) {
        const processedOrders = JSON.parse(localStorage.getItem('beadsyde_processed_orders') || '[]');
        const processedOrderIds = new Set(processedOrders.map(o => o.orderId));

        for (const [key, order] of Object.entries(firebaseOrders)) {
            if (!processedOrderIds.has(order.orderId)) {
                console.log('🆕 Processing new order:', order.orderId);
                await this.createShiprocketOrder(order);

                // Mark as processed
                processedOrders.push({
                    orderId: order.orderId,
                    processedAt: Date.now(),
                    shiprocketStatus: 'created'
                });
                localStorage.setItem('beadsyde_processed_orders', JSON.stringify(processedOrders));
            }
        }
    }

    async processLocalStorageOrders() {
        const localOrders = JSON.parse(localStorage.getItem('beadsyde_orders') || '[]');
        const processedOrders = JSON.parse(localStorage.getItem('beadsyde_processed_orders') || '[]');
        const processedOrderIds = new Set(processedOrders.map(o => o.orderId));

        for (const order of localOrders) {
            if (!processedOrderIds.has(order.orderId)) {
                console.log('🆕 Processing local order:', order.orderId);
                await this.createShiprocketOrder(order);

                processedOrders.push({
                    orderId: order.orderId,
                    processedAt: Date.now(),
                    shiprocketStatus: 'created'
                });
                localStorage.setItem('beadsyde_processed_orders', JSON.stringify(processedOrders));
            }
        }
    }

    async createShiprocketOrder(orderData) {
        try {
            const token = await this.authenticateShiprocket();
            if (!token) {
                console.error('❌ Cannot create Shiprocket order: Authentication failed');
                return null;
            }

            // Check for repeat customer and merge info
            const customerInfo = await this.getCustomerInfo(orderData.customerPhone);

            const shiprocketOrder = this.formatOrderForShiprocket(orderData, customerInfo);

            const response = await fetch(`${this.shiprocketConfig.baseURL}/orders/create/adhoc`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(shiprocketOrder)
            });

            const result = await response.json();

            if (response.ok && result.order_id) {
                console.log('✅ Shiprocket order created:', result.order_id);

                // Save shipping info
                await this.saveShippingInfo({
                    beadsydeOrderId: orderData.orderId,
                    shiprocketOrderId: result.order_id,
                    shipmentId: result.shipment_id,
                    status: 'created',
                    createdAt: Date.now(),
                    customerPhone: orderData.customerPhone
                });

                return result;
            } else {
                console.error('❌ Shiprocket order creation failed:', result);
                return null;
            }
        } catch (error) {
            console.error('❌ Error creating Shiprocket order:', error);
            return null;
        }
    }

    formatOrderForShiprocket(orderData, customerInfo = {}) {
        // Use existing customer info for repeat customers
        const mergedCustomer = {
            name: orderData.customerName || customerInfo.name || '',
            phone: orderData.customerPhone || customerInfo.phone || '',
            email: customerInfo.email || `${orderData.customerPhone}@beadsyde.com`,
            address: orderData.address || customerInfo.lastAddress || '',
            city: orderData.customer?.address?.city || customerInfo.city || '',
            state: orderData.customer?.address?.state || customerInfo.state || '',
            pincode: orderData.customer?.address?.pincode || customerInfo.pincode || '',
            country: 'India'
        };

        const orderItems = orderData.items.map((item, index) => ({
            name: item.name || `Infinity ${item.variant || 'Jewelry'}`,
            sku: `BEADS-${item.variant || 'ITEM'}-${index + 1}`,
            units: item.quantity || 1,
            selling_price: item.price || 0,
            discount: 0,
            tax: Math.round((item.price || 0) * 0.03), // 3% tax
            hsn: '71171980' // HSN code for imitation jewelry
        }));

        return {
            order_id: orderData.orderId,
            order_date: new Date(orderData.timestamp || Date.now()).toISOString().split('T')[0],
            pickup_location: "Beadsyde Warehouse", // Configure in Shiprocket
            comment: orderData.customer?.specialNotes || "Beadsyde Infinity Jewelry Order",
            billing_customer_name: mergedCustomer.name,
            billing_last_name: "",
            billing_address: mergedCustomer.address,
            billing_address_2: orderData.customer?.address?.landmark || "",
            billing_city: mergedCustomer.city,
            billing_pincode: mergedCustomer.pincode,
            billing_state: mergedCustomer.state,
            billing_country: mergedCustomer.country,
            billing_email: mergedCustomer.email,
            billing_phone: mergedCustomer.phone,
            shipping_is_billing: true,
            shipping_customer_name: mergedCustomer.name,
            shipping_last_name: "",
            shipping_address: mergedCustomer.address,
            shipping_address_2: orderData.customer?.address?.landmark || "",
            shipping_city: mergedCustomer.city,
            shipping_pincode: mergedCustomer.pincode,
            shipping_country: mergedCustomer.country,
            shipping_state: mergedCustomer.state,
            shipping_email: mergedCustomer.email,
            shipping_phone: mergedCustomer.phone,
            order_items: orderItems,
            payment_method: "COD", // Default to COD, can be modified
            shipping_charges: orderData.shipping || 0,
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: 0,
            sub_total: orderData.total - (orderData.shipping || 0),
            length: 15, // Default package dimensions
            breadth: 10,
            height: 5,
            weight: 0.5, // Default weight in kg
            invoice_number: `INV-${orderData.orderId}`,
            order_type: "COD"
        };
    }

    async getCustomerInfo(phoneNumber) {
        try {
            // Check Firebase for customer history
            if (this.database) {
                const { ref, query, orderByChild, equalTo, get } = window.firebaseImports || {};
                if (ref && query && orderByChild && equalTo && get) {
                    const ordersRef = ref(this.database, 'orders');
                    const customerQuery = query(ordersRef, orderByChild('customerPhone'), equalTo(phoneNumber));
                    const snapshot = await get(customerQuery);

                    if (snapshot.exists()) {
                        const orders = Object.values(snapshot.val());
                        const latestOrder = orders.sort((a, b) => b.timestamp - a.timestamp)[0];

                        return {
                            name: latestOrder.customerName,
                            phone: latestOrder.customerPhone,
                            email: latestOrder.customer?.email,
                            lastAddress: latestOrder.address,
                            city: latestOrder.customer?.address?.city,
                            state: latestOrder.customer?.address?.state,
                            pincode: latestOrder.customer?.address?.pincode,
                            orderCount: orders.length,
                            lastOrderDate: latestOrder.timestamp
                        };
                    }
                }
            }

            // Check localStorage as fallback
            const localOrders = JSON.parse(localStorage.getItem('beadsyde_orders') || '[]');
            const customerOrders = localOrders.filter(order => order.customerPhone === phoneNumber);

            if (customerOrders.length > 0) {
                const latestOrder = customerOrders.sort((a, b) => b.timestamp - a.timestamp)[0];
                return {
                    name: latestOrder.customerName,
                    phone: latestOrder.customerPhone,
                    lastAddress: latestOrder.address,
                    orderCount: customerOrders.length,
                    lastOrderDate: latestOrder.timestamp
                };
            }

            return {}; // New customer
        } catch (error) {
            console.error('❌ Error getting customer info:', error);
            return {};
        }
    }

    async saveShippingInfo(shippingData) {
        try {
            // Save to Firebase
            if (this.database) {
                const { ref, push } = window.firebaseImports || {};
                if (ref && push) {
                    const shippingRef = ref(this.database, 'shipments');
                    await push(shippingRef, shippingData);
                }
            }

            // Save to localStorage as backup
            const shipments = JSON.parse(localStorage.getItem('beadsyde_shipments') || '[]');
            shipments.push(shippingData);
            localStorage.setItem('beadsyde_shipments', JSON.stringify(shipments));

            console.log('💾 Shipping info saved:', shippingData.beadsydeOrderId);
        } catch (error) {
            console.error('❌ Error saving shipping info:', error);
        }
    }

    // ==========================================
    // TRACKING & STATUS UPDATES
    // ==========================================

    setupStatusUpdateScheduler() {
        // Update shipment statuses every 4 hours
        setInterval(() => {
            this.updateAllShipmentStatuses();
        }, 4 * 60 * 60 * 1000);

        // Initial update
        setTimeout(() => {
            this.updateAllShipmentStatuses();
        }, 60000); // 1 minute after init
    }

    async updateAllShipmentStatuses() {
        try {
            console.log('🔄 Updating shipment statuses...');

            const shipments = JSON.parse(localStorage.getItem('beadsyde_shipments') || '[]');
            const activeShipments = shipments.filter(s =>
                !['delivered', 'cancelled', 'returned'].includes(s.status?.toLowerCase())
            );

            for (const shipment of activeShipments) {
                if (shipment.shiprocketOrderId) {
                    await this.updateShiprocketStatus(shipment);
                } else if (shipment.indiaPostTrackingId) {
                    await this.updateIndiaPostStatus(shipment);
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            console.log(`✅ Updated ${activeShipments.length} shipment statuses`);
        } catch (error) {
            console.error('❌ Error updating shipment statuses:', error);
        }
    }

    async updateShiprocketStatus(shipment) {
        try {
            const token = await this.authenticateShiprocket();
            if (!token) return;

            const response = await fetch(
                `${this.shiprocketConfig.baseURL}/courier/track/shipment/${shipment.shipmentId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok && data.tracking_data) {
                const latestStatus = data.tracking_data.track_status;
                const awbCode = data.tracking_data.awb_code;

                if (latestStatus !== shipment.status) {
                    await this.updateShipmentStatus(shipment, {
                        status: latestStatus,
                        awbCode: awbCode,
                        lastUpdated: Date.now(),
                        trackingData: data.tracking_data
                    });

                    // Send WhatsApp notification for important status changes
                    if (['shipped', 'out_for_delivery', 'delivered'].includes(latestStatus)) {
                        await this.sendDeliveryNotification(shipment, latestStatus, awbCode);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error updating Shiprocket status:', error);
        }
    }

    async updateIndiaPostStatus(shipment) {
        try {
            // India Post Speed Post tracking API call via RapidAPI
            const formData = new URLSearchParams();
            formData.append('consignment_number', shipment.indiaPostTrackingId);
            formData.append('include_pincode_info', 'false');

            const response = await fetch(
                `${this.indiaPostConfig.baseURL}/track/consignment`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'x-rapidapi-host': this.indiaPostConfig.host,
                        'x-rapidapi-key': this.indiaPostConfig.apiKey
                    },
                    body: formData
                }
            );

            const data = await response.json();

            if (response.ok && data.success && data.data.consignment) {
                const consignment = data.data.consignment;
                const currentStatus = this.mapIndiaPostStatus(consignment.delivery_status);
                const readableStatus = consignment.current_status;

                if (currentStatus !== shipment.status) {
                    await this.updateShipmentStatus(shipment, {
                        status: currentStatus,
                        readableStatus: readableStatus,
                        trackingId: shipment.indiaPostTrackingId,
                        lastUpdated: Date.now(),
                        trackingData: {
                            consignment: consignment,
                            trackingEvents: data.data.tracking_events,
                            deliveryStatus: consignment.delivery_status,
                            transitDuration: consignment.transit_duration,
                            bookedOn: consignment.booked_on,
                            deliveredAt: consignment.delivered_at,
                            currentLocation: this.getCurrentLocation(data.data.tracking_events)
                        }
                    });

                    // Send WhatsApp notification for important status changes
                    if (['shipped', 'out_for_delivery', 'delivered'].includes(currentStatus)) {
                        await this.sendDeliveryNotification(shipment, currentStatus, shipment.indiaPostTrackingId, {
                            readableStatus: readableStatus,
                            transitDuration: consignment.transit_duration,
                            currentLocation: this.getCurrentLocation(data.data.tracking_events)
                        });
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error updating India Post status:', error);
        }
    }

    mapIndiaPostStatus(deliveryStatus) {
        // Map India Post statuses to our standard status codes
        const statusMap = {
            'ItemBooked': 'shipped',
            'ItemDispatched': 'shipped',
            'ItemBagged': 'shipped',
            'ItemReceived': 'in_transit',
            'OutForDelivery': 'out_for_delivery',
            'ItemDelivered': 'delivered',
            'ItemReturnedToSender': 'returned',
            'ItemReturned': 'returned',
            'DispatchedToBO': 'out_for_delivery'
        };

        return statusMap[deliveryStatus] || 'in_transit';
    }

    getCurrentLocation(trackingEvents) {
        if (!trackingEvents || trackingEvents.length === 0) return 'Unknown';

        // Get the most recent event
        const latestEvent = trackingEvents[0]; // Events are likely in reverse chronological order
        return latestEvent.office || 'Unknown';
    }

    async updateShipmentStatus(shipment, statusUpdate) {
        try {
            // Update in Firebase
            if (this.database) {
                const { ref, query, orderByChild, equalTo, get, update } = window.firebaseImports || {};
                if (ref && query && orderByChild && equalTo && get && update) {
                    const shipmentsRef = ref(this.database, 'shipments');
                    const shipmentQuery = query(shipmentsRef, orderByChild('beadsydeOrderId'), equalTo(shipment.beadsydeOrderId));
                    const snapshot = await get(shipmentQuery);

                    if (snapshot.exists()) {
                        const shipmentKey = Object.keys(snapshot.val())[0];
                        const shipmentRef = ref(this.database, `shipments/${shipmentKey}`);
                        await update(shipmentRef, statusUpdate);
                    }
                }
            }

            // Update in localStorage
            const shipments = JSON.parse(localStorage.getItem('beadsyde_shipments') || '[]');
            const shipmentIndex = shipments.findIndex(s => s.beadsydeOrderId === shipment.beadsydeOrderId);

            if (shipmentIndex !== -1) {
                shipments[shipmentIndex] = { ...shipments[shipmentIndex], ...statusUpdate };
                localStorage.setItem('beadsyde_shipments', JSON.stringify(shipments));
            }

            console.log(`📦 Status updated for ${shipment.beadsydeOrderId}: ${statusUpdate.status}`);
        } catch (error) {
            console.error('❌ Error updating shipment status:', error);
        }
    }

    // ==========================================
    // WHATSAPP NOTIFICATIONS
    // ==========================================

    async sendDeliveryNotification(shipment, status, trackingId, extraData = {}) {
        try {
            const locationInfo = extraData.currentLocation ? `\n📍 Current Location: ${extraData.currentLocation}` : '';
            const transitInfo = extraData.transitDuration ? `\n⏱️ Transit Duration: ${extraData.transitDuration}` : '';
            const statusInfo = extraData.readableStatus ? `\n📦 Status: ${extraData.readableStatus}` : '';

            const messages = {
                shipped: `🚚 Great news! Your Beadsyde order ${shipment.beadsydeOrderId} has been shipped!\n\n📋 Tracking ID: ${trackingId}${locationInfo}${statusInfo}\n\nYour beautiful infinity jewelry is on its way! 💎\n\nTrack your order: https://www.indiapost.gov.in/VAS/Pages/IndiaPostHome.aspx`,

                out_for_delivery: `🚛 Your Beadsyde order ${shipment.beadsydeOrderId} is out for delivery!\n\n📋 Tracking: ${trackingId}${locationInfo}${statusInfo}\n\nGet ready to receive your stunning jewelry today! ✨\n\nOur delivery partner will contact you soon.`,

                delivered: `🎉 Delivered! Your Beadsyde order ${shipment.beadsydeOrderId} has been successfully delivered!\n\n💎 We hope you love your new infinity jewelry!${transitInfo}\n\n⭐ Please share your experience with us!\n\n📸 Tag us @beadsyde in your photos!`,

                returned: `📮 Update: Your Beadsyde order ${shipment.beadsydeOrderId} is being returned to sender.\n\n📋 Tracking: ${trackingId}${statusInfo}\n\nPlease contact us to resolve any delivery issues.\n\n📞 WhatsApp: 918104563011`,

                in_transit: `🚛 Your Beadsyde order ${shipment.beadsydeOrderId} is in transit.\n\n📋 Tracking: ${trackingId}${locationInfo}${statusInfo}\n\nYour jewelry is moving closer to you! 💎`
            };

            const defaultMessage = `📦 Update: Your Beadsyde order ${shipment.beadsydeOrderId}\n\n📋 Tracking: ${trackingId}${statusInfo}${locationInfo}\n\nStatus: ${status}`;
            const message = messages[status] || defaultMessage;

            // Create WhatsApp link for manual sending
            const whatsappUrl = `https://api.whatsapp.com/send/?phone=${shipment.customerPhone}&text=${encodeURIComponent(message)}`;

            // Log for admin action
            console.log(`📱 WhatsApp notification ready for ${shipment.customerPhone}:`);
            console.log(message);
            console.log(`🔗 WhatsApp URL: ${whatsappUrl}`);

            // Store notification for admin dashboard
            await this.saveNotification({
                orderId: shipment.beadsydeOrderId,
                customerPhone: shipment.customerPhone,
                status: status,
                message: message,
                whatsappUrl: whatsappUrl,
                trackingId: trackingId,
                provider: shipment.indiaPostTrackingId ? 'India Post' : 'Shiprocket',
                extraData: extraData,
                timestamp: Date.now(),
                sent: false
            });

            return whatsappUrl;
        } catch (error) {
            console.error('❌ Error creating delivery notification:', error);
        }
    }

    async saveNotification(notification) {
        try {
            // Save to Firebase
            if (this.database) {
                const { ref, push } = window.firebaseImports || {};
                if (ref && push) {
                    const notificationsRef = ref(this.database, 'notifications');
                    await push(notificationsRef, notification);
                }
            }

            // Save to localStorage
            const notifications = JSON.parse(localStorage.getItem('beadsyde_notifications') || '[]');
            notifications.push(notification);
            localStorage.setItem('beadsyde_notifications', JSON.stringify(notifications));

            console.log('📨 Notification saved for admin action');
        } catch (error) {
            console.error('❌ Error saving notification:', error);
        }
    }

    // ==========================================
    // ADMIN FUNCTIONS
    // ==========================================

    async getPendingNotifications() {
        try {
            const notifications = JSON.parse(localStorage.getItem('beadsyde_notifications') || '[]');
            return notifications.filter(n => !n.sent);
        } catch (error) {
            console.error('❌ Error getting pending notifications:', error);
            return [];
        }
    }

    async markNotificationSent(notificationId) {
        try {
            const notifications = JSON.parse(localStorage.getItem('beadsyde_notifications') || '[]');
            const notification = notifications.find(n => n.timestamp === notificationId);

            if (notification) {
                notification.sent = true;
                notification.sentAt = Date.now();
                localStorage.setItem('beadsyde_notifications', JSON.stringify(notifications));
            }
        } catch (error) {
            console.error('❌ Error marking notification as sent:', error);
        }
    }

    async getShipmentsByStatus(status = null) {
        try {
            const shipments = JSON.parse(localStorage.getItem('beadsyde_shipments') || '[]');
            return status ? shipments.filter(s => s.status === status) : shipments;
        } catch (error) {
            console.error('❌ Error getting shipments:', error);
            return [];
        }
    }

    // ==========================================
    // MANUAL OPERATIONS
    // ==========================================

    async addIndiaPostTracking(orderId, trackingId) {
        try {
            const shipments = JSON.parse(localStorage.getItem('beadsyde_shipments') || '[]');
            let shipment = shipments.find(s => s.beadsydeOrderId === orderId);

            if (!shipment) {
                // Create new shipment record if it doesn't exist
                const orders = JSON.parse(localStorage.getItem('beadsyde_orders') || '[]');
                const order = orders.find(o => o.orderId === orderId);

                if (order) {
                    shipment = {
                        beadsydeOrderId: orderId,
                        customerPhone: order.customerPhone,
                        createdAt: Date.now()
                    };
                    shipments.push(shipment);
                } else {
                    return false;
                }
            }

            shipment.indiaPostTrackingId = trackingId;
            shipment.provider = 'indiapost';
            shipment.status = 'shipped';
            shipment.lastUpdated = Date.now();

            localStorage.setItem('beadsyde_shipments', JSON.stringify(shipments));

            // Immediately fetch tracking status
            await this.updateIndiaPostStatus(shipment);

            console.log(`📮 India Post tracking added for order ${orderId}: ${trackingId}`);
            return true;
        } catch (error) {
            console.error('❌ Error adding India Post tracking:', error);
            return false;
        }
    }

    async testIndiaPostAPI(trackingId) {
        try {
            const formData = new URLSearchParams();
            formData.append('consignment_number', trackingId);
            formData.append('include_pincode_info', 'true');

            const response = await fetch(
                `${this.indiaPostConfig.baseURL}/track/consignment`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'x-rapidapi-host': this.indiaPostConfig.host,
                        'x-rapidapi-key': this.indiaPostConfig.apiKey
                    },
                    body: formData
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                console.log('✅ India Post API test successful:', data);
                return {
                    success: true,
                    data: data.data,
                    message: 'API connection successful'
                };
            } else {
                console.error('❌ India Post API test failed:', data);
                return {
                    success: false,
                    error: data.message || 'Unknown error',
                    message: 'API connection failed'
                };
            }
        } catch (error) {
            console.error('❌ India Post API test error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Network or API error'
            };
        }
    }

    async getDetailedTrackingInfo(trackingId, isIndiaPost = true) {
        try {
            if (isIndiaPost) {
                const result = await this.testIndiaPostAPI(trackingId);
                if (result.success) {
                    return {
                        success: true,
                        provider: 'India Post',
                        trackingId: trackingId,
                        currentStatus: result.data.consignment.current_status,
                        deliveryStatus: result.data.consignment.delivery_status,
                        transitDuration: result.data.consignment.transit_duration,
                        bookedOn: result.data.consignment.booked_on,
                        deliveredAt: result.data.consignment.delivered_at,
                        currentLocation: this.getCurrentLocation(result.data.tracking_events),
                        origin: result.data.consignment.origin_pincode,
                        destination: result.data.consignment.destination_pincode,
                        trackingEvents: result.data.tracking_events,
                        consignmentDetails: result.data.consignment
                    };
                }
            }
            return { success: false, message: 'Tracking information not found' };
        } catch (error) {
            console.error('❌ Error getting detailed tracking info:', error);
            return { success: false, error: error.message };
        }
    }
}

// Initialize when DOM is loaded
if (typeof window !== 'undefined') {
    window.BeadsydeShippingManager = BeadsydeShippingManager;

    // Auto-initialize if Firebase is available
    document.addEventListener('DOMContentLoaded', () => {
        if (window.firebaseDB) {
            window.shippingManager = new BeadsydeShippingManager();
        } else {
            // Wait for Firebase initialization
            setTimeout(() => {
                if (window.firebaseDB) {
                    window.shippingManager = new BeadsydeShippingManager();
                }
            }, 2000);
        }
    });
}

export default BeadsydeShippingManager;