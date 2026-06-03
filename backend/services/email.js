const nodemailer = require('nodemailer')

// SMTP 配置从环境变量读取，未配置时降级为 Console 模式
const smtpConfig = {
  host: process.env.SMTP_HOST || '',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE !== 'false',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
}

let transporter = null

function getTransporter() {
  if (transporter) return transporter
  if (smtpConfig.host && smtpConfig.auth.user) {
    transporter = nodemailer.createTransport(smtpConfig)
    console.log('邮件服务已配置:', smtpConfig.host)
  } else {
    console.log('⚠️  SMTP 未配置，验证码将输出到控制台（开发模式）')
  }
  return transporter
}

/**
 * 发送验证码邮件
 * @param {string} to - 收件人邮箱
 * @param {string} code - 6位验证码
 * @returns {Promise<{sent: boolean, preview?: string}>}
 */
async function sendVerificationCode(to, code) {
  const mailOptions = {
    from: process.env.SMTP_FROM || smtpConfig.auth.user || 'noreply@nutriguide.com',
    to,
    subject: 'NutriGuide 邮箱验证码',
    html: `
      <div style="max-width:480px;margin:0 auto;padding:32px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#FAF8F5;border-radius:12px">
        <div style="text-align:center;margin-bottom:24px">
          <h1 style="color:#1B2A4A;font-size:24px;margin:0">NutriGuide</h1>
          <p style="color:#1B2A4A;opacity:0.6;margin:8px 0 0">你的专属营养顾问</p>
        </div>
        <div style="background:white;padding:32px;border-radius:8px;text-align:center">
          <p style="color:#1B2A4A;margin:0 0 8px">你的验证码是</p>
          <div style="font-size:36px;font-weight:700;color:#2D9C6F;letter-spacing:8px;margin:16px 0">${code}</div>
          <p style="color:#1B2A4A;opacity:0.5;font-size:13px;margin:0">验证码 10 分钟内有效，请勿泄露给他人</p>
        </div>
        <p style="text-align:center;color:#1B2A4A;opacity:0.4;font-size:12px;margin-top:24px">
          如果你未注册 NutriGuide，请忽略此邮件。
        </p>
      </div>
    `,
  }

  const t = getTransporter()
  if (!t) {
    // 开发模式：打印验证码到控制台
    console.log(`\n📧 [DEV] 验证码发送至 ${to}: ${code}\n`)
    return { sent: true, preview: code }
  }

  try {
    await t.sendMail(mailOptions)
    console.log(`验证码已发送至 ${to}`)
    return { sent: true }
  } catch (err) {
    console.error('邮件发送失败:', err.message)
    // 即使发送失败，仍返回验证码供开发调试
    return { sent: false, preview: code, error: err.message }
  }
}

module.exports = { sendVerificationCode }
