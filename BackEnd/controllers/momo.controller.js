import axios from 'axios';
import crypto from 'crypto';

export const createPayment = async (req, res) => {
    try {
        // MoMo API configuration
        var partnerCode = "MOMO";
        var accessKey = "F8BBA842ECF85";
        var secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
        var requestId = partnerCode + new Date().getTime();
        var orderId = requestId;
        var orderInfo = "Payment for MelodyHub";
        var redirectUrl = "http://localhost:3000/checkout/success"; // Frontend success page
        var ipnUrl = "http://localhost:5000/api/payment/momo/callback"; // Backend callback URL
        
        // Get amount from request body or use default
        var amount = req.body.amount || "50000";
        var requestType = "captureWallet";
        var extraData = ""; // pass empty value if your merchant does not have stores

        // Create signature
        var rawSignature = "accessKey=" + accessKey + 
                          "&amount=" + amount + 
                          "&extraData=" + extraData + 
                          "&ipnUrl=" + ipnUrl + 
                          "&orderId=" + orderId + 
                          "&orderInfo=" + orderInfo + 
                          "&partnerCode=" + partnerCode + 
                          "&redirectUrl=" + redirectUrl + 
                          "&requestId=" + requestId + 
                          "&requestType=" + requestType;
        
        // Generate HMAC SHA256 signature
        var signature = crypto.createHmac('sha256', secretkey)
            .update(rawSignature)
            .digest('hex');
        
        // Create request body for MoMo API
        const requestBody = {
            partnerCode: partnerCode,
            accessKey: accessKey,
            requestId: requestId,
            amount: amount,
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: redirectUrl,
            ipnUrl: ipnUrl,
            extraData: extraData,
            requestType: requestType,
            signature: signature,
            lang: 'en'
        };

        // Send request to MoMo API
        const response = await axios.post(
            'https://test-payment.momo.vn/v2/gateway/api/create', 
            requestBody, 
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        // Return payment URL to client
        return res.status(200).json({ 
            success: true, 
            payUrl: response.data.payUrl 
        });

    } catch (error) {
        console.error("MoMo payment error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Payment processing failed", 
            error: error.message 
        });
    }
};

// Callback function for MoMo to notify payment status
export const momoCallback = async (req, res) => {
    try {
        // Process the callback data from MoMo
        console.log("MoMo callback data:", req.body);
        
        // Here you should:
        // 1. Verify the signature from MoMo
        // 2. Update order status in your database
        // 3. Handle success/failure cases
        
        // For now, just acknowledge receipt
        res.status(200).json({ message: "Callback received" });
    } catch (error) {
        console.error("MoMo callback error:", error);
        res.status(500).json({ error: error.message });
    }
};

// Verify payment status
export const verifyPayment = async (req, res) => {
    try {
        const { orderId, resultCode } = req.body;
        
        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required"
            });
        }
        
        // In a production environment, you would:
        // 1. Query MoMo API to verify the payment status
        // 2. Check your database for the order status
        // 3. Update the order status in your database
        
        // For demo purposes, we'll just check the resultCode
        const isSuccess = resultCode === '0';
        
        return res.status(200).json({
            success: true,
            verified: isSuccess,
            message: isSuccess ? "Payment verified successfully" : "Payment verification failed"
        });
    } catch (error) {
        console.error("Payment verification error:", error);
        return res.status(500).json({
            success: false,
            message: "Payment verification failed",
            error: error.message
        });
    }
};







