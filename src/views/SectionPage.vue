<template>
  <v-container
    class="py-10 text-center"
    style="height: 100vh; display: flex; flex-direction: column"
  >
    <div
      style="
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      "
    >
      <!-- Camera Video -->
      <!-- <div v-if="!showTracing" class="camera-container mb-4">
                <video ref="videoElement" autoplay muted playsinline class="camera-video"></video>
                <v-btn @click="toggleCamera" :color="cameraActive ? 'red' : 'green'" size="small" class="camera-toggle">
                    <v-icon>{{ cameraActive ? "mdi-camera-off" : "mdi-camera" }}</v-icon>
                </v-btn>
            </div> -->

      <!-- Hiragana Tracing -->
      <HiraganaTracing
        v-if="showTracing"
        :character="tracingCharacter"
        @complete="completeTracing"
      />

      <!-- Vocabulary Practice -->
      <v-card
        v-else
        class="pa-8 mb-6"
        elevation="3"
        rounded="xl"
        style="background: linear-gradient(135deg, #fce4ec, #f8bbd9)"
      >
        <div class="text-h2 mb-4" style="font-size: 4rem; color: #ad1457">
          {{ currentVocab.word }}
        </div>

        <div v-if="currentVocab.image" class="mb-4">
          <v-btn
            @click="showHint = !showHint"
            color="pink"
            variant="tonal"
            size="small"
            class="mb-3"
          >
            <v-icon start>mdi-lightbulb</v-icon>
            {{ showHint ? "Hide Hint" : "Show Hint" }}
          </v-btn>
        </div>

        <transition name="hint-fade" appear>
          <div
            v-if="currentVocab.image && showHint"
            class="mb-4 hint-container"
          >
            <img
              :src="getImageUrl(currentVocab.image)"
              :alt="currentVocab.meaning"
              class="hint-image"
            />
          </div>
        </transition>

        <!-- Celebration animation -->
        <div v-if="showCelebration" class="celebration-overlay">
          <div class="celebration-content">
            <div class="celebration-emoji">🎉✨🎊</div>
            <div class="celebration-text">Perfect!</div>
            <img
              v-if="currentVocab.image"
              :src="getImageUrl(currentVocab.image)"
              :alt="currentVocab.meaning"
              class="celebration-image"
            />
          </div>
        </div>

        <v-btn
          :color="isListening ? 'deep-orange' : 'pink'"
          size="x-large"
          :icon="isListening ? 'mdi-stop' : 'mdi-microphone'"
          class="mb-4"
          @click="toggleListening"
          :disabled="!speechSupported"
        />

        <div class="text-body-1 mb-4">
          {{ isListening ? "🎤 Listening..." : "" }}
        </div>

        <div v-if="feedback" class="mb-4">
          <v-alert :type="feedback.type" variant="tonal">
            {{ feedback.message }}
          </v-alert>
        </div>
      </v-card>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import HiraganaTracing from "@/components/HiraganaTracing.vue";

const props = defineProps({
  row: {
    type: String,
    required: true,
  },
});

const getImageUrl = (filename) => {
  return new URL(`../img/${filename}`, import.meta.url).href;
};

// Vocabulary data organized by rows
const vocabularyData = {
  あ: [
    {
      word: "あひる",
      meaning: "Duck",
      acceptable: ["あひる", "アヒル", "鴨"],
      image: "ahiru.png",
    },
    {
      word: "あし",
      meaning: "Foot/Leg",
      acceptable: ["あし", "アシ", "足"],
      image: "ashi.png",
    },
    {
      word: "あめ",
      meaning: "Rain",
      acceptable: ["あめ", "アメ", "雨"],
      image: "ame.png",
    },
    {
      word: "あり",
      meaning: "Ant",
      acceptable: ["あり", "アリ", "蟻"],
      image: "ari.png",
    },
    {
      word: "いす",
      meaning: "Chair",
      acceptable: ["いす", "イス", "椅子"],
      image: "isu.png",
    },
    {
      word: "いぬ",
      meaning: "Dog",
      acceptable: ["いぬ", "イヌ", "犬"],
      image: "inu.png",
    },
    {
      word: "いえ",
      meaning: "House",
      acceptable: ["いえ", "イエ", "家"],
      image: "ie.png",
    },
    {
      word: "いちご",
      meaning: "Strawberry",
      acceptable: ["いちご", "イチゴ", "苺"],
      image: "ichigo.png",
    },
    {
      word: "うし",
      meaning: "Cow",
      acceptable: ["うし", "ウシ", "牛"],
      image: "ushi.png",
    },
    {
      word: "うさぎ",
      meaning: "Rabbit",
      acceptable: ["うさぎ", "ウサギ", "兎"],
      image: "usagi.png",
    },
    {
      word: "うま",
      meaning: "Horse",
      acceptable: ["うま", "ウマ", "馬"],
      image: "uma.png",
    },
    {
      word: "うみ",
      meaning: "Sea",
      acceptable: ["うみ", "ウミ", "海"],
      image: "umi.png",
    },
    {
      word: "えび",
      meaning: "Shrimp",
      acceptable: ["えび", "エビ", "海老"],
      image: "ebi.png",
    },
    {
      word: "え",
      meaning: "Picture",
      acceptable: ["え", "エ", "絵"],
      image: "e.png",
    },
    {
      word: "えんとつ",
      meaning: "Chimney",
      acceptable: ["えんとつ", "エントツ", "煙突"],
      image: "entotsu.png",
    },
    {
      word: "えんぴつ",
      meaning: "Pencil",
      acceptable: ["えんぴつ", "エンピツ", "鉛筆"],
      image: "enpitsu.png",
    },
    {
      word: "おかし",
      meaning: "Sweets",
      acceptable: ["おかし", "オカシ", "お菓子"],
      image: "okashi.png",
    },
    {
      word: "おにぎり",
      meaning: "Rice Ball",
      acceptable: ["おにぎり", "オニギリ", "おむすび"],
      image: "onigiri.png",
    },
    {
      word: "おりがみ",
      meaning: "Origami",
      acceptable: ["おりがみ", "オリガミ", "折り紙"],
      image: "origami.png",
    },
    {
      word: "おに",
      meaning: "Demon",
      acceptable: ["おに", "オニ", "鬼"],
      image: "oni.png",
    },
  ],
  // Add more rows as needed
  か: [
    {
      word: "かえる",
      meaning: "Frog",
      acceptable: ["かえる", "カエル", "蛙"],
      image: "kaeru.png",
    },
    {
      word: "かさ",
      meaning: "Umbrella",
      acceptable: ["かさ", "カサ", "傘"],
      image: "kasa.png",
    },
    {
      word: "かい",
      meaning: "Bag",
      acceptable: ["かい", "カイ", "貝"],
      image: "kai.png",
    },
    {
      word: "からす",
      meaning: "Crow",
      acceptable: ["からす", "カラス", "烏"],
      image: "karasu.png",
    },
    {
      word: "き",
      meaning: "Tree",
      acceptable: ["き", "キ", "木"],
      image: "ki.png",
    },
    {
      word: "きつね",
      meaning: "Fox",
      acceptable: ["きつね", "キツネ", "狐"],
      image: "kitsune.png",
    },
    {
      word: "きのこ",
      meaning: "Mushroom",
      acceptable: ["きのこ", "キノコ", "茸"],
      image: "kinoko.png",
    },
    {
      word: "きんぎょ",
      meaning: "Goldfish",
      acceptable: ["きんぎょ", "キンギョ", "金魚"],
      image: "kingyo.png",
    },
    {
      word: "くつ",
      meaning: "Shoes",
      acceptable: ["くつ", "クツ", "靴"],
      image: "kutsu.png",
    },
    {
      word: "くま",
      meaning: "Bear",
      acceptable: ["くま", "クマ", "熊"],
      image: "kuma.png",
    },
    {
      word: "くも",
      meaning: "Cloud",
      acceptable: ["くも", "クモ", "雲"],
      image: "kumo.png",
    },
    {
      word: "くり",
      meaning: "Chestnut",
      acceptable: ["くり", "クリ", "栗"],
      image: "kuri.png",
    },
    {
      word: "けむし",
      meaning: "Caterpillar",
      acceptable: ["けむし", "ケムシ", "毛虫"],
      image: "kemushi.png",
    },
    {
      word: "けいと",
      meaning: "Wool",
      acceptable: ["けいと", "ケイト", "毛糸"],
      image: "keito.png",
    },
    {
      word: "けんだま",
      meaning: "Kendama",
      acceptable: ["けんだま", "ケンダマ", "けん玉"],
      image: "kendama.png",
    },
    {
      word: "けしごむ",
      meaning: "Eraser",
      acceptable: ["けしごむ", "消しゴム"],
      image: "keshigomu.png",
    },
    {
      word: "こま",
      meaning: "Top (Toy)",
      acceptable: ["こま", "コマ", "独楽"],
      image: "koma.png",
    },
    {
      word: "こども",
      meaning: "Child",
      acceptable: ["こども", "子供"],
      image: "kodomo.png",
    },
    {
      word: "ことり",
      meaning: "Small Bird",
      acceptable: ["ことり", "小鳥"],
      image: "kotori.png",
    },
    {
      word: "こいのぼり",
      meaning: "Carp Streamer",
      acceptable: ["こいのぼり", "鯉のぼり"],
      image: "koinobori.png",
    },
  ],
  さ: [],
  た: [],
  な: [],
  は: [],
  ま: [],
  や: [],
  ら: [],
  わ: [],
};

const vocabulary = computed(() => vocabularyData[props.row] || []);
const currentIndex = ref(0);
const currentVocab = computed(() => vocabulary.value[currentIndex.value] || {});
const isListening = ref(false);
const speechSupported = ref(false);
const feedback = ref(null);
const showCelebration = ref(false);
const showHint = ref(false);
const showTracing = ref(true);
const tracingCharacter = ref(props.row);
const videoElement = ref(null);
const cameraActive = ref(false);
let mediaStream = null;

// Set vowelGroups based on props.row
let vowelGroups;
if (props.row === "あ") {
  vowelGroups = {
    あ: [0, 1, 2, 3],
    い: [4, 5, 6, 7],
    う: [8, 9, 10, 11],
    え: [12, 13, 14, 15],
    お: [16, 17, 18, 19],
  };
} else if (props.row === "か") {
  vowelGroups = {
    か: [0, 1, 2, 3],
    き: [4, 5, 6, 7],
    く: [8, 9, 10, 11],
    け: [12, 13, 14, 15],
    こ: [16, 17, 18, 19],
  };
} else if (props.row === "さ") {
  vowelGroups = {
    さ: [0, 1, 2, 3],
    し: [4, 5, 6, 7],
    す: [8, 9, 10, 11],
    せ: [12, 13, 14, 15],
    そ: [16, 17, 18, 19],
  };
} else if (props.row === "た") {
  vowelGroups = {
    た: [0, 1, 2, 3],
    ち: [4, 5, 6, 7],
    つ: [8, 9, 10, 11],
    て: [12, 13, 14, 15],
    と: [16, 17, 18, 19],
  };
} else if (props.row === "な") {
  vowelGroups = {
    な: [0, 1, 2, 3],
    に: [4, 5, 6, 7],
    ぬ: [8, 9, 10, 11],
    ね: [12, 13, 14, 15],
    の: [16, 17, 18, 19],
  };
} else if (props.row === "は") {
  vowelGroups = {
    は: [0, 1, 2, 3],
    ひ: [4, 5, 6, 7],
    ふ: [8, 9, 10, 11],
    へ: [12, 13, 14, 15],
    ホ: [16, 17, 18, 19],
  };
} else if (props.row === "ま") {
  vowelGroups = {
    ま: [0, 1, 2, 3],
    み: [4, 5, 6, 7],
    む: [8, 9, 10, 11],
    め: [12, 13, 14, 15],
    も: [16, 17, 18, 19],
  };
} else if (props.row === "や") {
  vowelGroups = {
    や: [0, 1, 2, 3],
    ゆ: [4, 5, 6, 7],
    よ: [8, 9, 10, 11],
  };
} else if (props.row === "ら") {
  vowelGroups = {
    ら: [0, 1, 2, 3],
    り: [4, 5, 6, 7],
    る: [8, 9, 10, 11],
    れ: [12, 13, 14, 15],
    ろ: [16, 17, 18, 19],
  };
} else if (props.row === "わ") {
  vowelGroups = {
    わ: [0, 1, 2, 3],
    を: [4, 5, 6, 7],
    ん: [8, 9, 10, 11],
  };
}

const currentVowel = computed(() => {
  for (const [vowel, indices] of Object.entries(vowelGroups)) {
    if (indices.includes(currentIndex.value)) return vowel;
  }
  return "あ";
});

let recognition = null;

onMounted(async () => {
  // await initCamera();

  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    speechSupported.value = true;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = "ja-JP";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      checkPronunciation(transcript);
    };

    recognition.onerror = () => {
      isListening.value = false;
      feedback.value = {
        type: "error",
        message: "Speech recognition error. Please try again.",
      };
    };

    recognition.onend = () => {
      isListening.value = false;
    };
  }
});

onUnmounted(() => {
  if (recognition) {
    recognition.stop();
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
  }
});

function toggleListening() {
  if (!recognition) return;

  if (isListening.value) {
    recognition.stop();
    isListening.value = false;
  } else {
    feedback.value = null;
    recognition.start();
    isListening.value = true;
  }
}

function checkPronunciation(transcript) {
  const acceptable = currentVocab.value.acceptable;
  const isCorrect = acceptable.includes(transcript);

  if (isCorrect) {
    feedback.value = {
      type: "success",
      message: `Perfect! You said: "${currentVocab.value.word}"`,
    };
    showCelebration.value = true;
    setTimeout(() => {
      showCelebration.value = false;
      nextWord();
    }, 2500);
  } else {
    const bestMatch = acceptable.find(
      (word) => calculateSimilarity(transcript, word) > 0.6
    );
    if (bestMatch) {
      feedback.value = {
        type: "warning",
        message: `Close! You said: "${transcript}". Try again!`,
      };
    } else {
      feedback.value = {
        type: "error",
        message: `You said: "${transcript}". Try: ${acceptable.join(", ")}`,
      };
    }
  }
}

function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  if (longer.length === 0) return 1.0;
  return (longer.length - editDistance(longer, shorter)) / longer.length;
}

function editDistance(str1, str2) {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
}

function nextWord() {
  if (currentIndex.value < vocabulary.value.length - 1) {
    const nextIndex = currentIndex.value + 1;
    const nextVowel = getVowelForIndex(nextIndex);
    const currentVowelChar = currentVowel.value;

    if (nextVowel !== currentVowelChar) {
      tracingCharacter.value = nextVowel;
      showTracing.value = true;
    } else {
      currentIndex.value = nextIndex;
      feedback.value = null;
      showHint.value = false;
    }
  }
}

function getVowelForIndex(index) {
  for (const [vowel, indices] of Object.entries(vowelGroups)) {
    if (indices.includes(index)) return vowel;
  }
  return "あ";
}

function completeTracing() {
  showTracing.value = false;
  if (currentIndex.value > 0) {
    currentIndex.value++;
  }
  feedback.value = null;
}

async function initCamera() {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 320, height: 240 },
      audio: false,
    });
    if (videoElement.value) {
      videoElement.value.srcObject = mediaStream;
      cameraActive.value = true;
    }
  } catch (error) {
    console.log("Camera access denied:", error);
  }
}

function toggleCamera() {
  if (cameraActive.value) {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      videoElement.value.srcObject = null;
    }
    cameraActive.value = false;
  } else {
    initCamera();
  }
}
</script>

<style scoped>
.v-card {
  font-family: "Fredoka", sans-serif;
}

/* Camera styles */
.camera-container {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.camera-video {
  width: 320px;
  height: 240px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  background: #f0f0f0;
}

.camera-toggle {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

/* Hint animation */
.hint-fade-enter-active {
  transition: all 0.6s ease-out;
}

.hint-fade-leave-active {
  transition: all 0.3s ease-in;
}

.hint-fade-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-20px);
}

.hint-fade-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}

.hint-container {
  animation: bounceIn 0.6s ease-out;
}

.hint-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.hint-image:hover {
  transform: scale(1.05);
}

.celebration-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-in;
}

.celebration-content {
  text-align: center;
  animation: bounceIn 0.6s ease-out;
}

.celebration-emoji {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: pulse 1s infinite;
}

.celebration-text {
  font-size: 2rem;
  font-weight: bold;
  color: #4caf50;
  margin-bottom: 1rem;
}

.celebration-image {
  max-width: 300px;
  max-height: 300px;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: zoomIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes bounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes zoomIn {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
