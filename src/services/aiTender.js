import { getGenerativeModel } from 'firebase/ai'
import { ai } from './firebase'

const model = getGenerativeModel(ai, {
  model: 'gemini-3.1-flash-lite',
  generationConfig: {
    responseMimeType: 'application/json',
  },
})

/**
 * يولّد اقتراح مناقصة كامل (عنوان، وصف، نطاق ميزانية، موعد نهائي مقترح)
 * بناءً على وصف مختصر يكتبه المستخدم + التصنيف المختار.
 *
 * @param {{ idea: string, categoryName: string }} input
 * @returns {Promise<{ title: string, description: string, budgetMin: number, budgetMax: number, suggestedDays: number }>}
 */
export async function generateTenderSuggestion({ idea, categoryName }) {
  const prompt = `أنت مساعد متخصص بصياغة مناقصات على منصة "ركيز" لربط الشركات الناشئة بالموردين في سوريا.

المستخدم (شركة ناشئة) يريد نشر مناقصة ضمن تصنيف "${categoryName}"، وقدّم هذه الفكرة المختصرة:
"${idea}"

بناءً على هذه الفكرة، اقترح تفاصيل مناقصة احترافية وواقعية. أجب حصراً بكائن JSON بالمفاتيح التالية، بدون أي نص إضافي قبله أو بعده:

{
  "title": "عنوان جذاب واحترافي للمناقصة، لا يتجاوز 12 كلمة",
  "description": "وصف تفصيلي واضح للمطلوب، من 3 إلى 5 جمل، بالعربية الفصحى",
  "budgetMin": رقم صحيح يمثل الحد الأدنى للميزانية بالليرة السورية (بدون فواصل أو رموز),
  "budgetMax": رقم صحيح يمثل الحد الأعلى للميزانية بالليرة السورية (أكبر من الحد الأدنى بنسبة معقولة),
  "suggestedDays": رقم صحيح يمثل عدد الأيام المقترحة كمهلة لاستقبال العروض (بين 3 و30)
}`

  let result
  try {
    result = await model.generateContent(prompt)
  } catch (error) {
    const raw = error?.message || ''
    const isQuotaError = raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED')

    if (isQuotaError) {
      const isDailyQuota = raw.includes('PerDay')
      const quotaError = new Error(
        isDailyQuota
          ? 'انتهت الحصة اليومية المجانية لتوليد المناقصات بالذكاء الاصطناعي (نموذج تجريبي محدود). الحصة تتجدد صباحاً تقريباً بتوقيت سوريا؛ جرب مرة أخرى لاحقاً أو غداً.'
          : 'تجاوزت الحد المسموح من الطلبات خلال دقيقة، انتظر قليلاً وحاول مرة أخرى.',
      )
      quotaError.isRateLimit = true
      quotaError.isDailyQuota = isDailyQuota
      throw quotaError
    }
    throw error
  }

  const text = result.response.text()

  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    // احتياطي: لو النموذج أضاف ```json``` حول الكائن رغم التعليمات
    try {
      const cleaned = text.replace(/```json|```/g, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      const formatError = new Error('لم يتمكن النموذج من إرجاع رد منظّم، حاول إعادة الصياغة.')
      throw formatError
    }
  }

  return {
    title: String(parsed.title || '').trim(),
    description: String(parsed.description || '').trim(),
    budgetMin: Number(parsed.budgetMin) || 0,
    budgetMax: Number(parsed.budgetMax) || 0,
    suggestedDays: Number(parsed.suggestedDays) || 7,
  }
}