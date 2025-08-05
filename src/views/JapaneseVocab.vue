<template>
    <v-container class="py-10 text-center" style="height: 100vh; display: flex; flex-direction: column">
        <!-- <h1 class="text-h4 mb-6">ひらがな</h1> -->

        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center">
            <!-- Camera Video -->
            <!-- <div class="camera-container mb-4">
                <video ref="videoElement" autoplay muted playsinline class="camera-video"></video>
                <v-btn @click="toggleCamera" :color="cameraActive ? 'red' : 'green'" size="small" class="camera-toggle">
                    <v-icon>{{ cameraActive ? "mdi-camera-off" : "mdi-camera" }}</v-icon>
                </v-btn>
            </div> -->

            <!-- Hiragana Tracing -->
            <HiraganaTracing v-if="showTracing" :character="tracingCharacter" @complete="completeTracing" />

            <!-- Vocabulary Practice -->
            <v-card
                v-else
                class="pa-8 mb-6"
                elevation="3"
                rounded="xl"
                style="background: linear-gradient(135deg, #fff3e0, #ffe0b2)">
                <div class="text-h2 mb-4" :style="{ fontSize: '5rem', color: currentColor }">
                    {{ currentVocab.word }}
                </div>
                <!-- <div class="text-h5 mb-6" style="color: #bf360c">
                    {{ currentVocab.meaning }}
                </div> -->

                <!-- Hint Button -->
                <div v-if="currentVocab.image" class="mb-4">
                    <v-btn @click="showHint = !showHint" color="orange" variant="tonal" size="small" class="mb-3">
                        <v-icon start>mdi-lightbulb</v-icon>
                        {{ showHint ? "Hide Hint" : "Show Hint" }}
                    </v-btn>
                </div>

                <!-- Image display (toggleable with animation) -->
                <transition name="hint-fade" appear>
                    <div v-if="currentVocab.image && showHint" class="mb-4 hint-container">
                        <img :src="getImageUrl(currentVocab.image)" :alt="currentVocab.meaning" class="hint-image" />
                    </div>
                </transition>

                <!-- Celebration animation -->
                <div v-if="showCelebration" class="celebration-overlay">
                    <div class="celebration-content">
                        <div class="celebration-emoji">🎉✨🎊</div>
                        <div class="celebration-text">Perfect!</div>
                        <img
                            :src="getImageUrl(currentVocab.image)"
                            :alt="currentVocab.meaning"
                            style="
                                max-width: 200px;
                                max-height: 200px;
                                border-radius: 12px;
                                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                            " />
                    </div>
                </div>

                <v-btn
                    :color="isListening ? 'pink lighten-2' : 'light-blue lighten-3'"
                    size="x-large"
                    :icon="isListening ? 'mdi-stop' : 'mdi-microphone'"
                    class="mb-4"
                    @click="toggleListening"
                    :disabled="!speechSupported" />

                <div class="text-body-1 mb-4">
                    {{ isListening ? "🎤 Listening..." : "" }}
                </div>

                <div v-if="feedback" class="mb-4">
                    <v-alert :type="feedback.type" variant="tonal">
                        {{ feedback.message }}
                    </v-alert>
                </div>
            </v-card>

            <!-- <div v-if="!showTracing" class="d-flex justify-center gap-4">
                <v-btn color="secondary" @click="previousWord" :disabled="currentIndex === 0">
                    <v-icon start>mdi-chevron-left</v-icon>
                    Previous
                </v-btn>
                <v-btn color="primary" @click="nextWord" :disabled="currentIndex === vocabulary.length - 1">
                    Next
                    <v-icon end>mdi-chevron-right</v-icon>
                </v-btn>
            </div> -->
        </div>
    </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import HiraganaTracing from "@/components/HiraganaTracing.vue";

const getImageUrl = (filename) => {
    return new URL(`../img/${filename}`, import.meta.url).href;
};

const wordColors = ["#e65100", "#8e24aa", "#3f51b5", "#29b6f6", "#9ccc65"];
const currentColor = ref(wordColors[Math.floor(Math.random() * wordColors.length)]);

const vocabulary = [
    { word: "あひる", meaning: "Duck", acceptable: ["あひる", "アヒル", "鴨"], image: "ahiru.png" },
    { word: "あし", meaning: "Foot/Leg", acceptable: ["あし", "アシ", "足"], image: "ashi.png" },
    { word: "あめ", meaning: "Rain", acceptable: ["あめ", "アメ", "雨"], image: "ame.png" },
    { word: "あり", meaning: "Ant", acceptable: ["あり", "アリ", "蟻"], image: "ari.png" },
    { word: "いす", meaning: "Chair", acceptable: ["いす", "イス", "椅子"], image: "isu.png" },
    { word: "いぬ", meaning: "Dog", acceptable: ["いぬ", "いいね", "イヌ", "犬"], image: "inu.png" },
    { word: "いえ", meaning: "House", acceptable: ["いえ", "いいえ", "イエ", "家"], image: "ie.png" },
    { word: "いちご", meaning: "Strawberry", acceptable: ["いちご", "イチゴ", "苺"], image: "ichigo.png" },
    { word: "うし", meaning: "Cow", acceptable: ["うし", "ウシ", "牛"], image: "ushi.png" },
    { word: "うさぎ", meaning: "Rabbit", acceptable: ["うさぎ", "ウサギ", "兎"], image: "usagi.png" },
    { word: "うま", meaning: "Horse", acceptable: ["うま", "ウマ", "馬"], image: "uma.png" },
    { word: "うみ", meaning: "Sea", acceptable: ["うみ", "ウミ", "海"], image: "umi.png" },
    { word: "えび", meaning: "Shrimp", acceptable: ["えび", "エビ", "海老"], image: "ebi.png" },
    { word: "え", meaning: "Picture", acceptable: ["え", "エ", "絵"], image: "e.png" },
    { word: "えんとつ", meaning: "Chimney", acceptable: ["えんとつ", "エントツ", "煙突"], image: "entotsu.png" },
    { word: "えんぴつ", meaning: "Pencil", acceptable: ["えんぴつ", "エンピツ", "鉛筆"], image: "enpitsu.png" },
    { word: "おかし", meaning: "Sweets", acceptable: ["おかし", "オカシ", "お菓子"], image: "okashi.png" },
    { word: "おにぎり", meaning: "Rice Ball", acceptable: ["おにぎり", "オニギリ", "おむすび"], image: "onigiri.png" },
    { word: "おりがみ", meaning: "Origami", acceptable: ["おりがみ", "オリガミ", "折り紙"], image: "origami.png" },
    { word: "おに", meaning: "Demon", acceptable: ["おに", "オニ", "鬼"], image: "oni.png" },
];

const currentIndex = ref(0);
const currentVocab = ref(vocabulary[0]);
const isListening = ref(false);
const speechSupported = ref(false);
const feedback = ref(null);
const showCelebration = ref(false);
const showHint = ref(false);
const showTracing = ref(true);
const tracingCharacter = ref("あ");
const videoElement = ref(null);
const cameraActive = ref(false);
let mediaStream = null;

const vowelGroups = {
    あ: [0, 1, 2, 3],
    い: [4, 5, 6, 7],
    う: [8, 9, 10, 11],
    え: [12, 13, 14, 15],
    お: [16, 17, 18, 19],
};

const currentVowel = computed(() => {
    for (const [vowel, indices] of Object.entries(vowelGroups)) {
        if (indices.includes(currentIndex.value)) return vowel;
    }
    return "あ";
});

let recognition = null;

onMounted(async () => {
    // Initialize camera
    // await initCamera();

    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        speechSupported.value = true;
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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
            feedback.value = { type: "error", message: "Speech recognition error. Please try again." };
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
        feedback.value = { type: "success", message: `Perfect! You said: "${currentVocab.value.word}"` };
        showCelebration.value = true;
        setTimeout(() => {
            showCelebration.value = false;
            nextWord();
        }, 2500);
    } else {
        const bestMatch = acceptable.find((word) => calculateSimilarity(transcript, word) > 0.6);

        feedback.value = { type: "warning", message: `Close! You said: "${transcript}". Try again!` };
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
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
            }
        }
    }
    return matrix[str2.length][str1.length];
}

function nextWord() {
    if (currentIndex.value < vocabulary.length - 1) {
        const nextIndex = currentIndex.value + 1;
        const nextVowel = getVowelForIndex(nextIndex);
        const currentVowelChar = currentVowel.value;

        if (nextVowel !== currentVowelChar) {
            tracingCharacter.value = nextVowel;
            showTracing.value = true;
        } else {
            currentIndex.value = nextIndex;
            currentVocab.value = vocabulary[currentIndex.value];
            feedback.value = null;
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
    // Only increment if not starting with あ (index 0)
    if (currentIndex.value > 0) {
        currentIndex.value++;
    }
    currentVocab.value = vocabulary[currentIndex.value];
    feedback.value = null;
}

function previousWord() {
    if (currentIndex.value > 0) {
        currentIndex.value--;
        currentVocab.value = vocabulary[currentIndex.value];
        feedback.value = null;
    }
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

// function toggleCamera() {
//     if (cameraActive.value) {
//         if (mediaStream) {
//             mediaStream.getTracks().forEach((track) => track.stop());
//             videoElement.value.srcObject = null;
//         }
//         cameraActive.value = false;
//     } else {
//         initCamera();
//     }
// }
</script>

<style scoped>
.v-card {
    font-family: "Fredoka", sans-serif;
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

/* Camera styles */
.camera-container {
    position: relative;
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
}

.camera-video {
    width: 220px;
    height: 180px;
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
</style>
