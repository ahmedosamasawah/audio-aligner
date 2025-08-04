import * as kv from "idb-keyval";
import { get, writable } from "svelte/store";

/** @type {Record<string, string>} */
const default_prompts = {
  format_text: `قم بتنسيق هذا النص العربي وفقاً لمعايير الكتابة الصحيحة:
    ١. تصحيح المسافات حول علامات الترقيم
    ٢. استخدام علامات الترقيم العربية بشكل صحيح
    ٣. تنسيق الفقرات بشكل مناسب
    ٤. إزالة المسافات والأسطر الزائدة
    ٥. تطبيق اتجاه النص بشكل متناسق
    
    أعد النص المنسق فقط، بدون أي شروحات أو نصوص إضافية.`,
  add_diacritics: `قم بإضافة التشكيل الكامل للنص العربي مع مراعاة:
    ١. الفتحة والضمة والكسرة
    ٢. علامات التنوين
    ٣. السكون والشدة حيث يلزم
    ٤. الضبط الصحيح لأواخر الكلمات
    
    أعد النص مع التشكيل فقط، بدون أي شروحات أو نصوص إضافية.`,
  enhance_ocr: `هذا نص مستخرج من مستند عربي باستخدام OCR. قم بتصحيح الأخطاء وإعادة التنسيق:
    ١. تصحيح الأحرف التي تم التعرف عليها بشكل خاطئ
    ٢. تصحيح المسافات بين الكلمات
    ٣. إعادة ضبط علامات الترقيم
    ٤. تنسيق هيكل الفقرات
    ٥. الحفاظ على المعنى والأسلوب الأصلي للنص
    
    أعد النص المصحح فقط، بدون أي شروحات أو نصوص إضافية.`,
  summarize_text: `قم بتلخيص النص التالي بشكل موجز وفعال، مع الحفاظ على النقاط الرئيسية والمعلومات المهمة:
    
    أعد النص الملخص فقط، بدون أي مقدمات أو تعليقات إضافية.`,
  clean_text: `Improve structure and format this transcription without changing too much of the original text. Only reply with the cleaned transcription. DO NOT ADD ANYTHING ELSE.`,
  translate_text: `قم بترجمة النص التالي من TARGET_SOURCE_LANGUAGE إلى TARGET_LANGUAGE مع الحفاظ على المعنى والسياق:
    
    أعد النص المترجم فقط، بدون أي مقدمات أو تعليقات إضافية.`,
  create_task_list: `قم باستخراج المهام والإجراءات من النص التالي وتنظيمها في قائمة واضحة ومرتبة:
    
    - استخرج جميع المهام والإجراءات التي يجب اتخاذها
    - قم بترتيب المهام حسب الأولوية إذا كان ذلك ممكنًا
    - استخدم صيغة واضحة وموجزة لكل مهمة
    
    أعد قائمة المهام فقط، بدون أي مقدمات أو تعليقات إضافية.`,
};

export const custom_prompts = writable(default_prompts);

export async function load_custom_prompts() {
  const saved_prompts = await kv.get("custom_ai_prompts");
  if (saved_prompts)
    custom_prompts.set({ ...default_prompts, ...saved_prompts });
}

/**
 * Save a custom prompt for a specific type
 * @param {string} prompt_type - The type of prompt to save
 * @param {string} prompt_text - The text of the prompt
 * @returns {Promise<boolean>} - True if the prompt was saved successfully, false otherwise
 */
export async function save_custom_prompt(prompt_type, prompt_text) {
  const current_prompts = get(custom_prompts);
  const updated_prompts = { ...current_prompts, [prompt_type]: prompt_text };

  await kv.set("custom_ai_prompts", updated_prompts);
  custom_prompts.set(updated_prompts);

  return true;
}

/**
 * Reset a prompt to its default value
 * @param {string} prompt_type - The type of prompt to reset
 * @returns {Promise<boolean>} - True if the prompt was reset successfully, false otherwise
 */
export async function reset_prompt(prompt_type) {
  const current_prompts = get(custom_prompts);
  const updated_prompts = {
    ...current_prompts,
    [prompt_type]: default_prompts[prompt_type],
  };

  await kv.set("custom_ai_prompts", updated_prompts);
  custom_prompts.set(updated_prompts);

  return true;
}

export async function reset_all_prompts() {
  await kv.set("custom_ai_prompts", default_prompts);
  custom_prompts.set(default_prompts);

  return true;
}

/**
 * Get the default prompt for a specific type
 * @param {string} prompt_type - The type of prompt to get
 * @returns {string} - The default prompt for the given type
 */
export function get_default_prompt(prompt_type) {
  return default_prompts[prompt_type] || "";
}

load_custom_prompts();
