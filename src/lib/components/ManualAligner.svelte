<script>
  import { AlertCircle, Clock } from "@lucide/svelte";

  import { Textarea } from "~/lib/components/ui/textarea/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Label } from "$lib/components/ui/label/index.js";

  // eslint-disable-next-line no-unused-vars
  const arabic_strings = {
    wordTimingsManual: "توقيتات الكلمات (يدوي)",
    placeholder:
      "أدخل توقيت كل كلمة بالتنسيق التالي:\n1,0,42,260,7429,1:160:761.0,2:761.0:2032.0,3:2032.0:2343,4:2423:3114.0,5:3114.0:4595.0,\n\nأو بالتنسيق التقليدي:\n1,كلمة,00:01.20,00:01.50,أخرى,00:01.55,00:01.90",
    extendedFormat: "التنسيق الموسع:",
    extendedFormatDesc:
      "رقم_السطر,بداية_الآية,نهاية_الآية,بداية_الوقت,نهاية_الوقت,1:وقت_بداية1:وقت_نهاية1,...",
    simpleFormat: "التنسيق البسيط:",
    simpleFormatDesc:
      "رقم_السطر,كلمة1,وقت_البداية1,وقت_النهاية1,كلمة2,وقت_البداية2,وقت_النهاية2,...",
    processButton: "معالجة التوقيتات اليدوية",
    errorMissingData: "يرجى تقديم كل من نص التوقيت والنص المنطوق.",
    errorNoValidData: "لا توجد بيانات توقيت صالحة.",
    errorUnknownFormat:
      "تنسيق التوقيت غير معروف. يرجى استخدام التنسيق الموسع أو البسيط.",
    errorProcessing: "خطأ في معالجة بيانات التوقيت: ",
  };

  const english_strings = {
    wordTimingsManual: "Word Timings (Manual)",
    placeholder:
      "Enter timing for each word in the following format:\n1,0,42,260,7429,1:160:761.0,2:761.0:2032.0,3:2032.0:2343,4:2423:3114.0,5:3114.0:4595.0,\n\nOr in traditional format:\n1,word,00:01.20,00:01.50,another,00:01.55,00:01.90",
    extendedFormat: "Extended format:",
    extendedFormatDesc:
      "line_number,verse_start,verse_end,time_start,time_end,1:start_time1:end_time1,...",
    simpleFormat: "Simple format:",
    simpleFormatDesc:
      "line_number,word1,start_time1,end_time1,word2,start_time2,end_time2,...",
    processButton: "Process Manual Timings",
    errorMissingData: "Please provide both timing text and spoken text.",
    errorNoValidData: "No valid timing data found.",
    errorUnknownFormat:
      "Unknown timing format. Please use extended or simple format.",
    errorProcessing: "Error processing timing data: ",
  };

  let {
    text_content = "",
    manual_timing_text = $bindable(""),
    onsuccess = () => {},
  } = $props();

  let error_message = $state("");

  function apply_replacements(str, replacements) {
    return replacements.reduce((result, [search, replace]) => {
      if (typeof search === "string") {
        return result.replaceAll(search, replace);
      }
      return result.replace(search, replace);
    }, str);
  }

  function prepare_sentences(text) {
    const cleaned = apply_replacements(text, [
      [/\n+/g, " "],
      [".", "|"],
      [/[^\p{sc=Arabic}\p{N} |]/gu, ""],
    ]);

    return cleaned
      .split("|")
      .filter((s) => s.trim())
      .map((s) =>
        s
          .trim()
          .split(" ")
          .filter((w) => w.trim())
      );
  }

  /**
   * @param {string} time_string
   * @returns {number}
   */
  function parse_time_string(time_string) {
    if (!time_string) return 0;

    if (!isNaN(parseFloat(time_string))) {
      return parseFloat(time_string) / 1000;
    }

    const parts = time_string.trim().split(":");
    if (parts.length !== 2) return 0;

    const minutes = parseInt(parts[0], 10);
    const seconds_parts = parts[1].split(".");
    const seconds = parseInt(seconds_parts[0], 10);
    const milliseconds =
      seconds_parts.length > 1 ? parseInt(seconds_parts[1], 10) / 100 : 0;

    if (isNaN(minutes) || isNaN(seconds) || isNaN(milliseconds)) return 0;

    return minutes * 60 + seconds + milliseconds;
  }

  /**
   * @param {string} line
   * @returns {'standard' | 'extended' | 'unknown'}
   */
  function detect_timing_format(line) {
    if (!line || !line.trim()) return "unknown";

    const parts = line.split(",");

    if (
      parts.length >= 6 &&
      !isNaN(parseInt(parts[0])) &&
      parts[5] &&
      parts[5].includes(":")
    ) {
      return "extended";
    }

    if (parts.length >= 4 && !isNaN(parseInt(parts[0]))) {
      return "standard";
    }

    return "unknown";
  }

  function process_timing() {
    if (!manual_timing_text || !text_content) {
      error_message = english_strings.errorMissingData;
      return;
    }

    try {
      const processed_sentences = prepare_sentences(text_content);
      const manual_lines = manual_timing_text
        .split("\n")
        .filter((line) => line.trim() !== "");

      if (manual_lines.length === 0) {
        error_message = english_strings.errorNoValidData;
        return;
      }

      const format = detect_timing_format(manual_lines[0]);

      if (format === "unknown") {
        error_message = english_strings.errorUnknownFormat;
        return;
      }

      const times = [];

      let result_text = "";
      manual_lines.forEach((line) => {
        if (format === "extended") {
          process_extended_format_line(line, processed_sentences, times);
        } else if (format === "standard") {
          process_standard_format_line(line, processed_sentences, times);
        }

        if (format === "extended") {
          result_text += line + "\n";
        }
      });

      onsuccess({
        processed_sentences,
        times,
        format,
        result_text: result_text.trim(),
      });

      error_message = "";
    } catch (error) {
      error_message = english_strings.errorProcessing + error.message;
    }
  }

  /**
   * @param {string} line
   * @param {string[][]} processed_sentences
   * @param {Array} times
   */
  function process_extended_format_line(line, processed_sentences, times) {
    const parts = line.split(",");
    if (parts.length < 6) return;

    const lineIndex = parseInt(parts[0]) - 1;
    if (
      isNaN(lineIndex) ||
      lineIndex < 0 ||
      lineIndex >= processed_sentences.length
    )
      return;

    const wordDetailedTimestamps = new Array(
      processed_sentences[lineIndex].length
    ).fill(null);
    const wordTimings = [];

    for (let i = 5; i < parts.length; i++) {
      const wordTiming = parts[i];
      if (!wordTiming || !wordTiming.includes(":")) continue;

      const timeParts = wordTiming.split(":");
      if (timeParts.length < 3) continue;

      const wordIdx = parseInt(timeParts[0]) - 1;
      if (
        isNaN(wordIdx) ||
        wordIdx < 0 ||
        wordIdx >= processed_sentences[lineIndex].length
      )
        continue;

      const startTime = parse_time_string(timeParts[1]);
      const endTime = parse_time_string(timeParts[2]);

      if (startTime >= endTime) continue;

      wordDetailedTimestamps[wordIdx] = {
        start: startTime,
        end: endTime,
      };

      wordTimings[wordIdx] = [startTime, endTime];
    }

    const validTimings = wordTimings.filter((t) => t);
    if (validTimings.length) {
      const sentenceStart = Math.min(...validTimings.map((t) => t[0]));
      const sentenceEnd = Math.max(...validTimings.map((t) => t[1]));
      times[lineIndex] = [sentenceStart, sentenceEnd, wordTimings];
    } else {
      times[lineIndex] = [0, 0, []];
    }
  }

  /**
   * @param {string} line
   * @param {string[][]} processed_sentences
   * @param {Array} times
   */
  function process_standard_format_line(line, processed_sentences, times) {
    const parts = line.split(",");
    if (parts.length < 4) return;

    const lineIndex = parseInt(parts[0]) - 1;
    if (
      isNaN(lineIndex) ||
      lineIndex < 0 ||
      lineIndex >= processed_sentences.length
    )
      return;

    const wordDetailedTimestamps = new Array(
      processed_sentences[lineIndex].length
    ).fill(null);
    const wordTimings = [];

    for (let i = 1; i < parts.length; i += 3) {
      if (i + 2 >= parts.length) break;

      const word = parts[i];
      const start_time_str = parts[i + 1];
      const end_time_str = parts[i + 2];

      const start_time = parse_time_string(start_time_str);
      const end_time = parse_time_string(end_time_str);

      if (start_time >= end_time) continue;

      const word_index = processed_sentences[lineIndex].findIndex(
        (w) => w === word
      );
      if (word_index === -1) continue;

      wordDetailedTimestamps[word_index] = {
        start: start_time,
        end: end_time,
      };

      wordTimings[word_index] = [start_time, end_time];
    }

    const validTimings = wordTimings.filter((t) => t);
    if (validTimings.length > 0) {
      const sentenceStart = Math.min(...validTimings.map((t) => t[0]));
      const sentenceEnd = Math.max(...validTimings.map((t) => t[1]));
      times[lineIndex] = [sentenceStart, sentenceEnd, wordTimings];
    } else {
      times[lineIndex] = [0, 0, []];
    }
  }
</script>

<div class="space-y-4">
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <Label for="manual-timing" class="text-sm font-medium"
        >{english_strings.wordTimingsManual}</Label
      >
    </div>
    <Textarea
      id="manual-timing"
      class="max-h-48 min-h-[180px] resize-y font-mono"
      placeholder={english_strings.placeholder}
      bind:value={manual_timing_text}
      required
    />
    <p class="text-xs text-gray-500">
      {english_strings.extendedFormat}
      {english_strings.extendedFormatDesc}
    </p>
    <p class="text-xs text-gray-500">
      {english_strings.simpleFormat}
      {english_strings.simpleFormatDesc}
    </p>
  </div>

  <Button
    type="button"
    class="w-full justify-center gap-2"
    disabled={!manual_timing_text || !text_content}
    onclick={process_timing}
  >
    <Clock class="h-4 w-4" />
    <span>{english_strings.processButton}</span>
  </Button>

  {#if error_message}
    <div class="rounded-md border border-red-200 bg-red-50 p-3">
      <div class="flex items-start gap-2">
        <AlertCircle class="h-5 w-5 text-red-500" />
        <p class="text-sm text-red-700">{error_message}</p>
      </div>
    </div>
  {/if}
</div>
