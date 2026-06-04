/**
 * SMS 短信服务 — 阿里云短信（国内）
 * 
 * 配置要求：
 *   SMS_PROVIDER=aliyun
 *   SMS_ACCESS_KEY_ID=your-aliyun-access-key
 *   SMS_ACCESS_KEY_SECRET=your-aliyun-secret
 *   SMS_SIGN_NAME=NutriGuide（需阿里云审核通过）
 *   SMS_TEMPLATE_CODE=SMS_xxxxx（需阿里云审核通过）
 * 
 * 未配置 SMS 时，降级为 Console 模式（验证码打印到日志）
 */

const crypto = require('crypto')

// 阿里云 SMS 签名算法
function hmacSHA1(key, str) {
  return crypto.createHmac('sha1', key).update(str, 'utf8').digest('base64')
}

function sha256(str) {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex')
}

async function sendAliyunSMS(phone, code) {
  const accessKeyId = process.env.SMS_ACCESS_KEY_ID
  const accessSecret = process.env.SMS_ACCESS_KEY_SECRET
  const signName = process.env.SMS_SIGN_NAME || 'NutriGuide'
  const templateCode = process.env.SMS_TEMPLATE_CODE || 'SMS_0000000'

  if (!accessKeyId || !accessSecret) {
    throw new Error('SMS 未配置: SMS_ACCESS_KEY_ID / SMS_ACCESS_KEY_SECRET')
  }

  // 阿里云 SMS SendSms API v2017-05-25
  const params = {
    AccessKeyId: accessKeyId,
    Action: 'SendSms',
    Format: 'JSON',
    PhoneNumbers: phone,
    SignName: signName,
    TemplateCode: templateCode,
    TemplateParam: JSON.stringify({ code }),
    SignatureMethod: 'HMAC-SHA1',
    SignatureVersion: '1.0',
    SignatureNonce: Date.now() + Math.random().toString(36).substring(2),
    Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    Version: '2017-05-25',
  }

  // 构建签名字符串
  const sortedKeys = Object.keys(params).sort()
  const canonicalizedQuery = sortedKeys
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&')
  const stringToSign = `POST&${encodeURIComponent('/')}&${encodeURIComponent(canonicalizedQuery)}`
  const signature = hmacSHA1(accessSecret + '&', stringToSign)
  params.Signature = signature

  const queryString = sortedKeys
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&')

  const res = await fetch(`https://dysmsapi.aliyuncs.com/?${queryString}`)
  const data = await res.json()

  if (data.Code !== 'OK') {
    throw new Error(`SMS 发送失败: ${data.Message || data.Code}`)
  }

  return { sent: true, provider: 'aliyun' }
}

/**
 * 发送短信验证码（根据配置选择供应商，未配置则 Console 模式）
 * @param {string} phone - 手机号
 * @param {string} code - 验证码
 */
async function sendSMS(phone, code) {
  // 阿里云 SMS
  if (process.env.SMS_PROVIDER === 'aliyun' || process.env.SMS_ACCESS_KEY_ID) {
    try {
      return await sendAliyunSMS(phone, code)
    } catch (e) {
      console.error('阿里云 SMS 发送失败:', e.message)
    }
  }

  // 降级：打印到控制台
  console.log(`\n📱 [DEV SMS] 验证码发送至 ${phone}: ${code}\n`)
  return { sent: true, preview: code, provider: 'console' }
}

module.exports = { sendSMS }
