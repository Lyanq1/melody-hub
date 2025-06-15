// utils/email.js
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

const sendVerificationEmail = async (email, displayName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'MelodyHub - Xác nhận tài khoản khách hàng',
    html: `
      <h2>Chào mừng bạn đến với MelodyHub, ${displayName}!</h2>
      <p>Tài khoản của bạn đã được kích hoạt thành công.</p>
      <p>Hãy vào https://melodyhub1.vercel.app/login để thực hiện thanh toán.</p>
      <p>Dev vào https://680f-14-169-250-93.ngrok-free.app để thực hiện thanh toán.</p>

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

export default sendVerificationEmail // Export mặc định
