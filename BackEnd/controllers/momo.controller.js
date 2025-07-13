import axios from 'axios';
import crypto from 'crypto';
import https from 'https';

export const createPayment = async (req, res) => {
    try {
        var accessKey = 'F8BBA842ECF85';
        var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
        var orderInfo = 'pay with MoMo';
        var partnerCode = 'MOMO';
        var redirectUrl = 'http://localhost:3000/checkout/success';
        var ipnUrl = 'http://localhost:5000/api/payment/momo/callback';
        var requestType = "payWithMethod";
        // Get amount from request body or use default
        var amount = req.body.amount || '50000';
        var orderId = partnerCode + new Date().getTime();
        var requestId = orderId;
        var extraData ='';
        var paymentCode = 'T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==';
        var orderGroupId ='';
        var autoCapture =true;
        var lang = 'vi';
        
        //before sign HMAC SHA256 with format
        //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
        var rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType;
        //puts raw signature
        console.log("--------------------RAW SIGNATURE----------------")
        console.log(rawSignature)
        //signature
        var signature = crypto.createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');
        console.log("--------------------SIGNATURE----------------")
        console.log(signature)
        
        //json object send to MoMo endpoint
        const requestBody = JSON.stringify({
            partnerCode : partnerCode,
            partnerName : "Test",
            storeId : "MomoTestStore",
            requestId : requestId,
            amount : amount,
            orderId : orderId,
            orderInfo : orderInfo,
            redirectUrl : redirectUrl,
            ipnUrl : ipnUrl,
            lang : lang,
            requestType: requestType,
            autoCapture: autoCapture,
            extraData : extraData,
            orderGroupId: orderGroupId,
            signature : signature
        });
        //Create the HTTPS objects

        const options = {
            hostname: 'test-payment.momo.vn',
            port: 443,
            path: '/v2/gateway/api/create',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestBody)
            }
        }
        //Send the request and get the response
        const req1 = https.request(options, res1 => {
            console.log(`Status: ${res1.statusCode}`);
            console.log(`Headers: ${JSON.stringify(res1.headers)}`);
            res1.setEncoding('utf8');
            // res1.on('data', (body) => {
            //     console.log('Body: ');
            //     console.log(body);
            //     console.log('resultCode: ');
            //     console.log(JSON.parse(body).resultCode);
            // });
            res1.on('data',(body) => {
                const response = JSON.parse(body);
                res.status(201).json({
                    data: response,
                    message: "payment successfully", 
                    success: true
                });
            })
            res1.on('end', () => {
                console.log('No more data in response.');
            });
        })
        
        req1.on('error', (e) => {
            console.log(`problem with request: ${e.message}`);
            return res.status(500).json({ 
                success: false, 
                message: "Payment processing failed", 
                error: e.message 
            });
        });
        // write data to request body
        console.log("Sending....")
        req1.write(requestBody);
        req1.end();

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







