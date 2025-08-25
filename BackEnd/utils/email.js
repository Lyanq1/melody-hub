// utils/email.js
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '..', '.env') })

// Kiểm tra cấu hình email (chỉ khi cần thiết)
const checkEmailConfig = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Email configuration missing! Please set EMAIL_USER and EMAIL_PASS in .env file')
    console.error('❌ EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Missing')
    console.error('❌ EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing')
    return false
  }
  return true
}
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

const sendVerificationEmail = async (email, displayName) => {
  if (!checkEmailConfig()) {
    throw new Error('Email configuration missing')
  }
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'MelodyHub - Xác nhận tài khoản khách hàng',
    html: `
      <h2>Chào mừng bạn đến với MelodyHub, ${displayName}!</h2>
      <p>Tài khoản của bạn đã được kích hoạt thành công.</p>
      <p>Hãy thực hiện đăng nhập tại https://melodyhub1.vercel.app/login và bắt đầu trải nghiệm mua hàng.</p>

    `
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Verification email sent to:', email)
  } catch (error) {
    console.error('Error sending email:', error.message)
    throw new Error('Failed to send verification email')
  }
}

const sendPasswordResetEmail = async (email, displayName, resetToken) => {
  if (!checkEmailConfig()) {
    throw new Error('Email configuration missing')
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'MelodyHub - Khôi phục mật khẩu',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Khôi phục mật khẩu MelodyHub</h2>
        <p>Xin chào <strong>${displayName}</strong>,</p>
        <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn.</p>
        <p>Mã xác thực của bạn là:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${resetToken}</h1>
        </div>
        <p><strong>Lưu ý:</strong></p>
        <ul>
          <li>Mã xác thực này có hiệu lực trong 15 phút</li>
          <li>Không chia sẻ mã này với bất kỳ ai</li>
          <li>Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này</li>
        </ul>
        <p>Trân trọng,<br>Đội ngũ MelodyHub</p>
      </div>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Password reset email sent to:', email)
  } catch (error) {
    console.error('Error sending password reset email:', error.message)
    throw new Error('Failed to send password reset email')
  }
}

// Test email configuration
const testEmailConfig = async () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email configuration missing')
    }

    await transporter.verify()
    console.log('✅ Email configuration is valid')
    return true
  } catch (error) {
    console.error('❌ Email configuration error:', error.message)
    return false
  }
}

export { sendVerificationEmail, sendPasswordResetEmail, testEmailConfig }
export default sendVerificationEmail // Export mặc định
