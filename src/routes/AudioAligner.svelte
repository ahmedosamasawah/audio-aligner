<script>
  import {
    AlertCircle,
    AlignVerticalJustifyCenter,
    AudioWaveform,
    CheckCircle,
    Clock,
    Copy,
    Hash,
    Link,
    Loader2,
    Music,
    Upload,
  } from "@lucide/svelte";
  import { hover_action } from "components/src/Tooltip.svelte";
  import { apply_repls, ar_nums } from "components/src/util.js";
  import { onDestroy } from "svelte";
  import Dropzone from "svelte-file-dropzone";

  import ManualAligner from "../lib/components/ManualAligner.svelte";
  import { Textarea } from "../lib/components/ui/textarea/index.js";
  import { Button } from "../lib/components/ui/button/index.js";
  import { Input } from "../lib/components/ui/input/index.js";
  import { Label } from "../lib/components/ui/label/index.js";

  // eslint-disable-next-line no-unused-vars
  const arabic_strings = {
    page_title: "محاذاة الصوت | أدوات نصية",
    audio_alignment: "محاذاة الصوت",
    alignment_description: "محاذاة النص مع الصوت للحصول على طوابع زمنية دقيقة",
    upload_file: "تحميل ملف",
    use_link: "استخدام رابط",
    auto_alignment: "محاذاة تلقائية",
    manual_timing: "إدخال التوقيت يدويًا",
    audio_file: "ملف الصوت",
    audio_link: "رابط الصوت",
    choose_audio_file: "اختر ملف صوتي",
    drag_drop_audio: "اسحب وأفلت ملفات الصوت هنا",
    click_to_select: "أو انقر لاختيار الملفات",
    supported_formats: "الصيغ المقبولة: .mp3، .wav، .ogg، .flac",
    direct_audio_link: "يرجى إدخال رابط مباشر لملف صوتي",
    spoken_text: "النص المنطوق",
    text_placeholder: "أدخل النص لمحاذاته مع الصوت...",
    upload_and_start: "تحميل وبدء المحاذاة",
    process_link_and_start: "معالجة الرابط وبدء المحاذاة",
    task_id: "معرف المهمة",
    alignment_result: "نتيجة المحاذاة",
    copy: "نسخ",
    audio_load_error: "خطأ في تحميل الملف الصوتي",
    time_label: "الوقت",
    sentence_label: "الجملة",
    word_label: "الكلمة",
    synced_text: "النص المتزامن مع الصوت",
    waiting_for_results: "في انتظار نتائج المحاذاة...",
  };

  const english_strings = {
    page_title: "Audio Alignment | Text Tools",
    audio_alignment: "Audio Alignment",
    alignment_description: "Align text with audio to get precise timestamps",
    upload_file: "Upload File",
    use_link: "Use Link",
    auto_alignment: "Auto Alignment",
    manual_timing: "Manual Timing Input",
    audio_file: "Audio File",
    audio_link: "Audio Link",
    choose_audio_file: "Choose audio file",
    drag_drop_audio: "Drag and drop audio files here",
    click_to_select: "or click to select files",
    supported_formats: "Supported formats: .mp3, .wav, .ogg, .flac",
    direct_audio_link: "Please enter a direct link to an audio file",
    spoken_text: "Spoken Text",
    text_placeholder: "Enter text to align with audio...",
    upload_and_start: "Upload and Start Alignment",
    process_link_and_start: "Process Link and Start Alignment",
    task_id: "Task ID",
    alignment_result: "Alignment Result",
    copy: "Copy",
    audio_load_error: "Error loading audio file",
    time_label: "Time",
    sentence_label: "Sentence",
    word_label: "Word",
    synced_text: "Text Synced with Audio",
    waiting_for_results: "Waiting for alignment results...",
  };
  const cur_strings = english_strings;

  /** @type {File | null | string} */

  let audio_file = $state(null);
  let audio_url = $state("");
  let audio_input_mode = $state("url");
  let text_content = $state("");
  let aligner_status = $state("");
  let aligner_task_id = $state("");
  let aligner_result = $state("");
  /** @type {number | null} */
  let aligner_polling_interval = $state(null);

  /** @type {HTMLAudioElement | null} */
  let audio_element = $state(null);
  let audio_file_url = $state("");
  let current_time = $state(0);
  let current_sentence_index = $state(0);
  let current_word_index = $state(0);
  let sentences = $state([]);
  let times = $state([]);
  let last_sentence_index = $state(-1);
  let show_debug = $state(false);
  let audio_error = $state("");

  let time_input_mode = $state("manual");
  let manual_timing_text = $state("");

  const API_KEY = import.meta.env.VITE_API_KEY;
  let has_utils_key = $state(true);

  function split_string(str, delimiter, limit) {
    const parts = str.split(delimiter);
    if (limit && parts.length > limit) {
      return [
        ...parts.slice(0, limit - 1),
        parts.slice(limit - 1).join(delimiter),
      ];
    }
    return parts;
  }

  function prepare_sentences(s) {
    return apply_repls(s, [
      [/\n+/g, " "],
      [".", "|"],
      [/[^\p{sc=Arabic}\p{N} |]/gu, ""],
    ])
      .split("|")
      .map((s) => s.split(" "));
  }

  function get_word_timing_text(sentence_i, word_i) {
    if (
      times[sentence_i] &&
      times[sentence_i][2] &&
      times[sentence_i][2][word_i]
    ) {
      const start = times[sentence_i][2][word_i][0] || 0;
      const end = times[sentence_i][2][word_i][1] || 0;
      return `${start.toFixed(2)}s - ${end.toFixed(2)}s`;
    }
    return "";
  }

  // prettier-ignore
  const status_translations = {
  'Please provide both audio file and text.':          'يرجى تقديم ملف صوتي ونص.',
  'Uploading files...':                                'جاري تحميل الملفات...',
  'Task completed successfully.':                      'تم إكمال المهمة بنجاح.',
  'Task failed.':                                      'فشلت المهمة.',
  'Task has started and is in progress...':            'بدأت المهمة وهي قيد التنفيذ...',
  'Task is pending...':                                'المهمة في انتظار المعالجة...',
  'Failed to fetch task status.':                      'فشل في الحصول على حالة المهمة.',
  'API key is required. Please set an API key.':       'مفتاح API مطلوب. يرجى تعيين مفتاح API.',
  'Please provide both audio URL and text.':           'يرجى تقديم رابط الصوت والنص.',
  'Processing audio URL...':                           'جاري معالجة رابط الصوت...',
  'Manual timing processed successfully.':             'تم معالجة التوقيت اليدوي بنجاح.',
}

  // prettier-ignore
  /** @type {Array<[RegExp, (string) => any]>} */
  const dynamic_patterns_en = [
    [/^Files uploaded successfully.*Task ID: (.+)$/, id => `Files uploaded successfully. Task ID: ${id}`],
    [/Invalid file type/, () => 'Invalid file type. Please upload supported audio files.'],
    [/Error fetching task status: (.+)$/, err => `Error fetching task status: ${err}`],
    [/Error uploading files: (.+)$/, err => `Error uploading files: ${err}`],
    [/Upload failed: (.+)$/, err => `Upload failed: ${err}`],
    [/^Audio URL processed successfully.*Task ID: (.+)$/, id => `Audio URL processed successfully. Task ID: ${id}`],
    [/URL processing failed: (.+)$/, err => `URL processing failed: ${err}`],
    [/Error processing audio URL: (.+)$/, err => `Error processing audio URL: ${err}`],
]

  // prettier-ignore
  // eslint-disable-next-line no-unused-vars
  const dynamic_patterns_ar = [
    [/^Files uploaded successfully.*Task ID: (.+)$/, id => `تم تحميل الملفات بنجاح. معرف المهمة: ${id}`],
    [/Invalid file type/, () => 'نوع ملف غير صالح. يرجى تحميل ملفات صوتية مدعومة.'],
    [/Error fetching task status: (.+)$/, err => `خطأ في جلب حالة المهمة: ${err}`],
    [/Error uploading files: (.+)$/, err => `خطأ في تحميل الملفات: ${err}`],
    [/Upload failed: (.+)$/, err => `فشل التحميل: ${err}`],
    [/^Audio URL processed successfully.*Task ID: (.+)$/, id => `عُولج رابط الصوت بنجاح. معرف المهمة: ${id}`],
    [/URL processing failed: (.+)$/, err => `فشلت معالجة الرابط: ${err}`],
    [/Error processing audio URL: (.+)$/, err => `خطأ في معالجة رابط الصوت: ${err}`],
]
  const dynamic_patterns = dynamic_patterns_en;

  function translate_aligner_status(status) {
    if (status in status_translations) {
      // eslint-disable-next-line no-constant-condition
      return "en" ? status : status_translations[status];
    }

    for (const [test, translate] of dynamic_patterns) {
      const match = status.match(test);
      if (match) return translate(...match.slice(1));
    }

    return status;
  }

  function handle_audio_file_change(e) {
    audio_file = e.target?.files?.[0] || "";
  }

  /**
   * @param {{ detail: { accepted_files: any; file_rejections: any; }; }} e
   */
  function handle_files_select(e) {
    const { accepted_files, file_rejections } = e.detail;
    if (accepted_files?.length) {
      const input = document.getElementById("audio-upload");
      const data_transfer = new DataTransfer();
      data_transfer.items.add(accepted_files[0]);
      input.files = data_transfer.files;
      audio_file = accepted_files[0];
      handle_audio_file_change({ target: input });
    } else if (file_rejections?.length) {
      aligner_status =
        "Invalid file type. Please upload supported audio files.";
    }
  }

  /**
   * @param {SubmitEvent & { currentTarget: EventTarget & HTMLFormElement; }} e
   */
  async function upload_aligner_files(e) {
    e.preventDefault();

    if (!audio_file || !text_content.trim()) {
      aligner_status = "Please provide both audio file and text.";
      return;
    }

    aligner_status = "Uploading files...";

    const form_data = new FormData();
    form_data.append("file", audio_file);
    form_data.append("text", text_content);

    const response = await fetch(
      `${window.CONFIG.UTILS_API_URL}/aligner/align_audio?api_key=${API_KEY}`,
      {
        method: "POST",
        body: form_data,
      }
    );

    if (!response.ok) {
      let error_text = "Unknown error";
      try {
        error_text = await response.text();
      } catch {
        error_text = `HTTP Status: ${response.status}`;
      }
      aligner_status = `Upload failed: ${error_text}`;
      return;
    }
    aligner_task_id = (await response.json()).id;
    aligner_status = `Files uploaded successfully. Task ID: ${aligner_task_id}`;
    start_aligner_polling();
  }

  /**
   * @param {SubmitEvent & { currentTarget: EventTarget & HTMLFormElement; }} e
   */
  async function process_audio_url(e) {
    e.preventDefault();

    if (!audio_url || !text_content.trim()) {
      aligner_status = "Please provide both audio URL and text.";
      return;
    }

    aligner_status = "Processing audio URL...";

    try {
      const urlWithParams = `${window.CONFIG.UTILS_API_URL}/aligner/align_audio?url=${encodeURIComponent(audio_url)}&api_key=${API_KEY}`;

      const formData = new FormData();
      formData.append("text", text_content);

      const response = await fetch(urlWithParams, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        aligner_task_id = data.id;
        aligner_status = `Audio URL processed successfully. Task ID: ${aligner_task_id}`;
        start_aligner_polling();
      } else {
        let error_text = "Unknown error";
        try {
          error_text = await response.text();
        } catch {
          error_text = `HTTP Status: ${response.status}`;
        }
        aligner_status = `URL processing failed: ${error_text}`;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      aligner_status = `Error processing audio URL: ${errorMessage}`;
    }
  }

  function start_aligner_polling() {
    check_aligner_task_status();
    aligner_polling_interval = setInterval(check_aligner_task_status, 5000);
  }

  function process_aligner_result() {
    if (!aligner_result || !text_content) return;

    sentences = prepare_sentences(text_content);
    times = [];

    const timestamp_lines = aligner_result
      .split("\n")
      .filter((line) => line.trim() !== "");
    timestamp_lines.forEach((line) => {
      const parts = split_string(line, ",", 6).slice(3);
      if (parts.length >= 3) {
        const startTime = +parts[0] / 1000;
        const endTime = +parts[1] / 1000;
        const wordTimings = parts[2].split(",").map((wordData) => {
          const timeParts = wordData.split(":").slice(1);
          return timeParts.map((t) => +t / 1000);
        });
        times.push([startTime, endTime, wordTimings]);
      } else {
        times.push([0, 0, []]);
      }
    });

    console.log("times", times);

    URL.revokeObjectURL(audio_file_url);
    if (audio_file instanceof File)
      audio_file_url = URL.createObjectURL(audio_file);
  }

  function handle_time_update() {
    if (!times.length || !sentences.length) return;

    current_sentence_index = 0;
    while (
      current_sentence_index < times.length &&
      times[current_sentence_index] &&
      times[current_sentence_index][1] < current_time
    ) {
      current_sentence_index++;
    }

    if (current_sentence_index !== last_sentence_index) {
      const sentenceElement = document.querySelector(
        `[data-sentence-id="${current_sentence_index + 1}"]`
      );
      sentenceElement?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      last_sentence_index = current_sentence_index;
    }

    current_word_index = 0;
    if (times[current_sentence_index] && times[current_sentence_index][2]) {
      while (
        current_word_index < times[current_sentence_index][2].length &&
        times[current_sentence_index][2][current_word_index] &&
        times[current_sentence_index][2][current_word_index][1] < current_time
      ) {
        current_word_index++;
      }
    }
  }

  function handle_text_click(e) {
    const wordElement = e.target.closest("[data-word-id]");
    if (!wordElement) return;

    const wordId = wordElement.dataset.wordId;
    const [sentenceId, wordId2] = wordId.split("-").map((n) => +n - 1);

    if (
      times[sentenceId] &&
      times[sentenceId][2] &&
      times[sentenceId][2][wordId2]
    ) {
      const startTime = times[sentenceId][2][wordId2][0];
      if (audio_element && !isNaN(startTime)) {
        audio_element.currentTime = startTime;
        audio_element.play();
      }
    }
  }

  async function check_aligner_task_status() {
    if (!aligner_task_id) return;

    const url = `${window.CONFIG.UTILS_API_URL}/aligner/align_audio/${aligner_task_id}?api_key=${API_KEY}`;
    const data = await (await fetch(url)).json();

    if (data.is_complete) {
      if (data.is_successful) {
        aligner_result = data.result;
        aligner_status = "Task completed successfully.";
        process_aligner_result();
      } else {
        aligner_status = "Task failed.";
      }
      clearInterval(aligner_polling_interval);
    } else
      aligner_status = data.is_started
        ? "Task has started and is in progress..."
        : "Task is pending...";
  }

  onDestroy(() => {
    URL.revokeObjectURL(audio_file_url);
    clearInterval(aligner_polling_interval);
  });
</script>

<svelte:head>
  <title>{cur_strings.page_title}</title>
</svelte:head>

<div
  style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"
>
  <h1
    class="text-2xl leading-none font-semibold tracking-tight"
    style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem;"
  >
    <AudioWaveform
      class="text-primary me-2 inline h-5 w-5"
      style="color: #3b82f6; margin-right: 0.5rem; display: inline; height: 1.25rem; width: 1.25rem;"
    />{cur_strings.audio_alignment}
  </h1>
  <p
    class="text-muted-foreground text-sm"
    style="color: #6b7280; font-size: 0.875rem; margin-bottom: 2rem;"
  >
    {cur_strings.alignment_description}
  </p>

  {#if has_utils_key}
    <div
      class="bg-muted text-muted-foreground mx-auto my-4 w-fit rounded-md border p-1"
      style="background: #f3f4f6; color: #6b7280; margin: 1rem auto; width: fit-content; border-radius: 6px; border: 1px solid #d1d5db; padding: 0.25rem;"
    >
      <button
        type="button"
        class={[
          "hover:bg-background/50 rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
          audio_input_mode === "file" && "bg-background text-foreground",
        ]}
        style="border-radius: 4px; padding: 0.375rem 0.75rem; font-size: 0.875rem; font-weight: 500; transition: all 0.2s;"
        onclick={() => (audio_input_mode = "file")}
      >
        <div
          class="flex items-center gap-2"
          style="display: flex; align-items: center; gap: 0.5rem;"
        >
          <Upload class="h-4 w-4" style="height: 1rem; width: 1rem;" />
          <span>{cur_strings.upload_file}</span>
        </div>
      </button>
      <button
        type="button"
        class={[
          "hover:bg-background/50 rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
          audio_input_mode === "url" && "bg-background text-foreground",
        ]}
        style="border-radius: 4px; padding: 0.375rem 0.75rem; font-size: 0.875rem; font-weight: 500; transition: all 0.2s;"
        onclick={() => (audio_input_mode = "url")}
      >
        <div
          class="flex items-center gap-2"
          style="display: flex; align-items: center; gap: 0.5rem;"
        >
          <Link class="h-4 w-4" style="height: 1rem; width: 1rem;" />
          <span>{cur_strings.use_link}</span>
        </div>
      </button>
    </div>

    <div
      class="bg-muted text-muted-foreground mx-auto my-4 w-fit rounded-md border p-1"
      style="background: #f3f4f6; color: #6b7280; margin: 1rem auto; width: fit-content; border-radius: 6px; border: 1px solid #d1d5db; padding: 0.25rem;"
    >
      <button
        type="button"
        class={[
          "hover:bg-background/50 rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
          time_input_mode === "auto" && "bg-background text-foreground",
        ]}
        style="border-radius: 4px; padding: 0.375rem 0.75rem; font-size: 0.875rem; font-weight: 500; transition: all 0.2s;"
        onclick={() => (time_input_mode = "auto")}
      >
        <div
          class="flex items-center gap-2"
          style="display: flex; align-items: center; gap: 0.5rem;"
        >
          <AlignVerticalJustifyCenter
            class="h-4 w-4"
            style="height: 1rem; width: 1rem;"
          />
          <span>{cur_strings.auto_alignment}</span>
        </div>
      </button>
      <button
        type="button"
        class={[
          "hover:bg-background/50 rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
          time_input_mode === "manual" && "bg-background text-foreground",
        ]}
        style="border-radius: 4px; padding: 0.375rem 0.75rem; font-size: 0.875rem; font-weight: 500; transition: all 0.2s;"
        onclick={() => (time_input_mode = "manual")}
      >
        <div
          class="flex items-center gap-2"
          style="display: flex; align-items: center; gap: 0.5rem;"
        >
          <Clock class="h-4 w-4" style="height: 1rem; width: 1rem;" />
          <span>{cur_strings.manual_timing}</span>
        </div>
      </button>
    </div>

    {#if time_input_mode === "auto"}
      <form
        class="space-y-4"
        onsubmit={(e) => {
          e.preventDefault();
          if (audio_input_mode === "file") {
            upload_aligner_files(e);
          } else {
            process_audio_url(e);
          }
        }}
      >
        <div class="space-y-2">
          <Label
            for={audio_input_mode === "file" ? "audio-upload" : "audio-url"}
            class="text-sm font-medium"
          >
            {audio_input_mode === "file"
              ? cur_strings.audio_file
              : cur_strings.audio_link}
          </Label>

          {#if audio_input_mode === "file"}
            <div class="flex flex-col gap-2">
              <Dropzone
                on:drop={handle_files_select}
                accept=".mp3,.wav,.ogg,.flac"
                disableDefaultStyles={true}
              >
                <div
                  class="group relative flex cursor-pointer flex-col items-center justify-center rounded-md border p-4"
                  onclick={() =>
                    document.getElementById("audio-upload")?.click()}
                  onkeypress={(e) => {
                    if (e.key === "Enter") e.currentTarget.click();
                  }}
                  role="button"
                  tabindex="0"
                  aria-label={cur_strings.choose_audio_file}
                >
                  <Upload class="h-8 w-8 text-gray-400" />
                  <p class="mt-2 text-gray-500">
                    {cur_strings.drag_drop_audio}
                  </p>
                  <p class="text-sm text-gray-400">
                    {cur_strings.click_to_select}
                  </p>
                  <p class="mt-1 text-xs text-gray-400">
                    {cur_strings.supported_formats}
                  </p>
                  {#if audio_file?.name}
                    <div
                      class="bg-muted/30 flex items-center gap-2 rounded-md p-2 text-sm"
                    >
                      <Music class="text-primary h-4 w-4" />
                      <span>{audio_file.name}</span>
                    </div>
                  {/if}
                </div>
              </Dropzone>
              <Input
                id="audio-upload"
                type="file"
                accept=".mp3,.wav,.ogg,.flac"
                onchange={handle_audio_file_change}
                required={audio_input_mode === "file"}
                hidden
              />
            </div>
          {:else}
            <div class="flex flex-col gap-2">
              <Input
                id="audio-url"
                type="url"
                placeholder="https://example.com/audio.mp3"
                bind:value={audio_url}
                required={audio_input_mode === "url"}
              />
              <p class="text-xs text-gray-400">
                {cur_strings.direct_audio_link}
              </p>
            </div>
          {/if}
        </div>

        <div class="space-y-2">
          <Label for="text-content" class="text-sm font-medium"
            >{cur_strings.spoken_text}</Label
          >
          <Textarea
            id="text-content"
            class="max-h-48 min-h-[120px] resize-y"
            placeholder={cur_strings.text_placeholder}
            bind:value={text_content}
            required
          />
        </div>

        <Button
          type="submit"
          class="w-full justify-center gap-2"
          disabled={audio_input_mode === "file" ? !audio_file : !audio_url}
        >
          <AlignVerticalJustifyCenter class="h-4 w-4" />
          <span>
            {audio_input_mode === "file"
              ? cur_strings.upload_and_start
              : cur_strings.process_link_and_start}
          </span>
        </Button>
      </form>
    {:else}
      <form
        class="space-y-4"
        onsubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div class="space-y-2">
          <Label
            for={audio_input_mode === "file" ? "audio-upload" : "audio-url"}
            class="text-sm font-medium"
          >
            {audio_input_mode === "file"
              ? cur_strings.audio_file
              : cur_strings.audio_link}
          </Label>

          {#if audio_input_mode === "file"}
            <div class="flex flex-col gap-2">
              <Dropzone
                on:drop={handle_files_select}
                accept=".mp3,.wav,.ogg,.flac"
                disableDefaultStyles={true}
              >
                <div
                  class="group relative flex cursor-pointer flex-col items-center justify-center rounded-md p-4"
                  onclick={() =>
                    document.getElementById("audio-upload")?.click()}
                  onkeypress={(e) => {
                    if (e.key === "Enter") e.currentTarget.click();
                  }}
                  role="button"
                  tabindex="0"
                  aria-label={cur_strings.choose_audio_file}
                >
                  <span
                    class="ease absolute top-0 left-0 h-0 w-0 border-t-2 border-dashed border-green-800 transition-all duration-300 group-hover:w-full"
                  ></span>
                  <span
                    class="ease absolute top-0 right-0 h-0 w-0 border-r-2 border-dashed border-green-800 transition-all duration-300 group-hover:h-full"
                  ></span>
                  <span
                    class="ease absolute right-0 bottom-0 h-0 w-0 border-b-2 border-dashed border-green-800 transition-all duration-300 group-hover:w-full"
                  ></span>
                  <span
                    class="ease absolute bottom-0 left-0 h-0 w-0 border-l-2 border-dashed border-green-800 transition-all duration-300 group-hover:h-full"
                  ></span>
                  <Upload class="h-8 w-8 text-gray-400" />
                  <p class="mt-2 text-gray-500">
                    {cur_strings.drag_drop_audio}
                  </p>
                  <p class="text-sm text-gray-400">
                    {cur_strings.click_to_select}
                  </p>
                  <p class="mt-1 text-xs text-gray-400">
                    {cur_strings.supported_formats}
                  </p>
                  {#if audio_file && typeof audio_file !== "string"}
                    <div
                      class="bg-muted/30 flex items-center gap-2 rounded-md p-2 text-sm"
                    >
                      <Music class="text-primary h-4 w-4" />
                      <span>{audio_file.name}</span>
                    </div>
                  {/if}
                </div>
              </Dropzone>
              <Input
                id="audio-upload"
                type="file"
                accept=".mp3,.wav,.ogg,.flac"
                onchange={handle_audio_file_change}
                required={audio_input_mode === "file"}
                hidden
              />
            </div>
          {:else}
            <div class="flex flex-col gap-2">
              <Input
                id="audio-url"
                type="url"
                placeholder="https://example.com/audio.mp3"
                bind:value={audio_url}
                required={audio_input_mode === "url"}
              />
              <p class="text-xs text-gray-400">
                {cur_strings.direct_audio_link}
              </p>
            </div>
          {/if}
        </div>

        <div class="space-y-2">
          <Label for="text-content" class="text-sm font-medium"
            >{cur_strings.spoken_text}</Label
          >
          <Textarea
            id="text-content"
            class="max-h-48 min-h-[120px] resize-y"
            placeholder={cur_strings.text_placeholder}
            bind:value={text_content}
            required
          />
        </div>

        <ManualAligner
          {text_content}
          bind:manual_timing_text
          onsuccess={(args) => {
            const { result_text } = args;
            aligner_result = result_text;
            aligner_status = "Manual timing processed successfully.";
            process_aligner_result();
          }}
        />
      </form>
    {/if}

    {#if aligner_status}
      <div class="bg-muted flex items-start gap-2 rounded-md p-3">
        {#if aligner_status.includes("successfully") || aligner_status.includes("بنجاح")}
          <CheckCircle class="h-5 w-5 text-green-500" />
        {:else if aligner_status.includes("failed") || aligner_status.includes("فشل") || aligner_status.includes("خطأ") || aligner_status.includes("Error")}
          <AlertCircle class="text-destructive h-5 w-5" />
        {:else}
          <Loader2 class="text-primary h-5 w-5 animate-spin" />
        {/if}
        <p class="text-sm">{translate_aligner_status(aligner_status)}</p>
      </div>
    {/if}

    {#if aligner_task_id}
      <div class="bg-muted/50 flex items-center gap-2 rounded-md p-2 text-xs">
        <Hash class="text-muted-foreground h-3.5 w-3.5" />
        <span class="text-muted-foreground font-mono"
          >{cur_strings.task_id}: {aligner_task_id}</span
        >
      </div>
    {/if}
  {/if}

  {#if aligner_result}
    <div class="flex flex-col gap-4 pt-4">
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="flex items-center gap-2 text-sm font-medium">
            <AlignVerticalJustifyCenter class="text-primary h-4 w-4" />
            {cur_strings.alignment_result}
          </h3>
          <Button
            variant="outline"
            size="sm"
            class="h-8 gap-1.5"
            onclick={() => {
              navigator.clipboard.writeText(aligner_result);
            }}
          >
            <Copy class="h-3.5 w-3.5" />
            <span>{cur_strings.copy}</span>
          </Button>
        </div>

        <div
          class="bg-muted/30 max-h-[200px] max-w-[950px] overflow-auto rounded-md border p-3"
        >
          <pre class="text-xs" dir="ltr">{aligner_result}</pre>
        </div>
      </div>

      <div class="mb-4 w-[700px] rounded-lg border bg-gray-50 p-4">
        <audio
          bind:this={audio_element}
          bind:currentTime={current_time}
          ontimeupdate={handle_time_update}
          class="w-full"
          controls
          crossorigin="anonymous"
          src={audio_input_mode === "url" ? audio_url : audio_file_url}
          onerror={() => (audio_error = cur_strings.audio_load_error)}
          onloadstart={() => (audio_error = "")}
        ></audio>

        {#if audio_error}
          <p class="text-destructive mt-1 text-xs">{audio_error}</p>
        {/if}
      </div>

      {#if show_debug}
        <div class="mb-4 rounded bg-gray-100 p-2 font-mono text-sm">
          {cur_strings.time_label}: {current_time.toFixed(2)}s | {cur_strings.sentence_label}:
          {current_sentence_index + 1} | {cur_strings.word_label}:
          {current_word_index + 1}
        </div>
      {/if}

      <div class="mt-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="flex items-center gap-2 text-sm font-medium">
            <AudioWaveform class="text-primary h-4 w-4" />
            {cur_strings.synced_text}
          </h3>
        </div>

        <div
          class="text-content max-h-96 overflow-auto rounded-lg border bg-white p-6 leading-relaxed"
          dir="rtl"
          onclick={handle_text_click}
          onkeydown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handle_text_click(e);
            }
          }}
          role="button"
          tabindex="0"
        >
          {#each sentences as words, sentence_i}
            <div class="sentence mb-4">
              <span class="text-sm font-medium text-gray-500"
                >{ar_nums(sentence_i + 1)}.
              </span>
              <span
                class="sentence-content"
                data-sentence-id={sentence_i + 1}
                class:current-sentence={sentence_i === current_sentence_index}
              >
                {#each words as word, word_i}
                  <span
                    class="word inline-block cursor-pointer rounded transition-colors hover:bg-yellow-100"
                    data-word-id="{sentence_i + 1}-{word_i + 1}"
                    class:current-word={sentence_i === current_sentence_index &&
                      word_i === current_word_index}
                    use:hover_action={{ show_arrow: false }}
                    title={get_word_timing_text(sentence_i, word_i)}
                  >
                    {word}
                  </span>
                  {#if word_i < words.length - 1}
                    <span> </span>
                  {/if}
                {/each}
              </span>
            </div>
          {:else}
            <div class="p-8 text-center text-gray-500">
              <p>{cur_strings.waiting_for_results}</p>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .current-sentence {
    color: #8b4513;
    font-weight: bold;
  }

  .current-word {
    background-color: #ffe4b5 !important;
    font-weight: bold;
    border-radius: 3px;
    box-shadow: 0 0 3px rgba(255, 165, 0, 0.5);
  }

  .sentence {
    line-height: 1.8;
  }

  .text-content {
    font-family: "Kitab", "Arial Unicode MS", sans-serif;
    font-size: 1.2rem;
  }

  @media (max-width: 768px) {
    .text-content {
      font-size: 1rem;
    }
  }
</style>
