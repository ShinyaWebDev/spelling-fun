<template>
  <v-container class="text-center">
    <!-- Progress Indicator -->
    <v-row class="mb-4" justify="center" align="center">
      <v-col cols="12" sm="6">
        <v-progress-linear
          :model-value="progressPercent"
          height="10"
          color="pink accent-2"
          rounded
          striped
        ></v-progress-linear>
        <div class="text-caption mt-1 text-center">
          Word {{ sessionIndex + 1 }} of {{ sessionWords.length }}
        </div>
      </v-col>
    </v-row>

    <h2>
      Arrange the letters to spell:
      <div ref="hearBtnWrapper" class="speaker-container">
        <span class="wave wave1"></span>
        <span class="wave wave2"></span>
        <v-btn
          class="icon-sound-btn"
          icon
          size="x-large"
          color="white"
          @click="speakWord(currentSessionWord)"
        >
          <v-icon size="36">mdi-volume-high</v-icon>
        </v-btn>
      </div>
      <v-btn
        icon
        color="secondary"
        class="ma-2"
        @click="resetCurrentWord"
        :disabled="isCorrect || isCompleted"
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </h2>

    <v-row
      justify="center"
      class="mb-8 mt-4"
      no-gutters
      style="gap: 12px; flex-wrap: wrap"
    >
      <DropZone
        v-for="(slot, index) in dropZones"
        :key="index"
        :letter="slot"
        :index="index"
        @drop="onDrop"
        @tap="onDropTap"
        :disabled="result === 'Correct!'"
      />
    </v-row>

    <v-row justify="center" class="mb-8" no-gutters style="gap: 16px">
      <LetterTile
        v-for="(char, index) in shuffledLetters"
        :key="index"
        :letter="char"
        :draggable="
          !isTouchDevice &&
          !usedIndexes.includes(index) &&
          result !== 'Correct!'
        "
        :disabled="usedIndexes.includes(index) || result === 'Correct!'"
        :selected="selectedTileIndex === index"
        :isTouchDevice="isTouchDevice"
        @select="onTileSelect(index)"
        @dragstart="onDragStart(index)"
      />
    </v-row>

    <v-btn
      color="pink lighten-2"
      size="large"
      class="ma-2"
      prepend-icon="mdi-check-circle-outline"
      @click="checkAnswer"
      :disabled="
        dropZones.some((zone) => zone === null) || isCorrect || isCompleted
      "
    >
      Check Answer
    </v-btn>

    <v-btn
      class="next-word-btn"
      @click="goToNextWord"
      v-if="isCorrect && !isCompleted"
    >
      <v-icon start>mdi-arrow-right-bold-circle</v-icon>
      Next Word
    </v-btn>

    <p
      v-if="result"
      ref="resultEl"
      class="result-text"
      :class="{
        correct: result.includes('Correct'),
        completed: result.includes('completed'),
      }"
    >
      {{ result }}
    </p>
    <ConfettiExplosion v-if="showConfetti" />
  </v-container>
  <v-dialog v-model="setupDialog" persistent max-width="500">
    <v-card class="pa-4">
      <!-- Language Selection -->
      <div class="mb-4">
        <v-card-title class="text-h6">Choose Language</v-card-title>
        <v-btn-toggle v-model="selectedLanguageTemp" mandatory>
          <v-btn value="en">English</v-btn>
          <v-btn value="jp">Japanese</v-btn>
        </v-btn-toggle>
      </div>

      <!-- Question count (only show after language selected) -->
      <div v-if="selectedLanguageTemp" class="mb-4">
        <v-card-title class="text-h6">How many questions?</v-card-title>
        <v-slider
          v-model="questionCount"
          :min="1"
          :max="maxQuestions"
          :step="1"
          thumb-label
        ></v-slider>
        <div class="text-center">{{ questionCount }} questions</div>
      </div>

      <!-- Start button -->
      <v-card-actions class="justify-center">
        <v-btn
          :disabled="!selectedLanguageTemp"
          color="primary"
          @click="startSession"
        >
          Start Game
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <MudoCelebration v-model="showMudo" />

  <!-- <v-dialog v-model="languageDialog" persistent max-width="400">
    <v-card>
      <v-card-title class="text-h6">Choose Language</v-card-title>
      <v-card-actions>
        <v-btn color="primary" @click="chooseLanguage('en')">English</v-btn>
        <v-btn color="secondary" @click="chooseLanguage('jp')">Japanese</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="questionCountDialog" persistent max-width="400">
    <v-card>
      <v-card-title class="text-h6">How many questions?</v-card-title>
      <v-text-field
        v-model="questionCount"
        type="number"
        label="Questions"
        min="1"
        max="20"
      />
      <v-card-actions>
        <v-btn color="primary" @click="startSession">Start</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog> -->
</template>

<script setup>
import { ref, watch, nextTick } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import { storeToRefs } from "pinia";
import { useSpellingStore } from "@/stores/spellingStore";
import { gsap } from "gsap";
import ConfettiExplosion from "vue-confetti-explosion";
import MudoCelebration from "@/components/MudoCelebration.vue";

const showMudo = ref(false);

const spelling = useSpellingStore();
const {
  currentSessionWord,
  sessionWords,
  sessionIndex,
  words,
  selectedLanguage,
  prepareSession,
  setLanguage,
} = storeToRefs(spelling);

const setupDialog = ref(true);
const selectedLanguageTemp = ref(null);
const showConfetti = ref(false);

const result = ref("");
const resultEl = ref(null);
const hearBtnWrapper = ref(null);
const usedIndexes = ref([]);
const selectedTileIndex = ref(null);
const isTouchDevice = ref(
  "ontouchstart" in window || navigator.maxTouchPoints > 0
);
const isCorrect = ref(false);
const isCompleted = ref(false);

const shuffledLetters = ref([]);
const dropZones = ref([]);
const questionCountDialog = ref(true);
const questionCount = ref(1);

watch(selectedLanguageTemp, (lang) => {
  if (!lang) return;
  const langWords = words.value?.[lang];
  questionCount.value = langWords ? langWords.length : 1;
});

const startSession = () => {
  spelling.setLanguage(selectedLanguageTemp.value);
  spelling.prepareSession(questionCount.value);
  setupDialog.value = false;
};
const progressPercent = computed(() =>
  Math.round(((sessionIndex.value + 1) / sessionWords.value.length) * 100)
);

const maxQuestions = computed(() => {
  if (!selectedLanguageTemp.value) return 1;
  const langWords = words.value?.[selectedLanguageTemp.value];
  return langWords ? langWords.length : 1;
});

// function startSession() {
//   spelling.setLanguage(selectedLanguageTemp.value);
//   spelling.prepareSession(questionCount.value);
//   setupDialog.value = false;
// }

const triggerConfetti = async () => {
  showConfetti.value = false;
  showMudo.value = false;
  await nextTick();

  // old confetti
  showConfetti.value = true;

  // epic boss
  showMudo.value = true;
};
const languageDialog = ref(true); // show dialog initially

const chooseLanguage = (lang) => {
  spelling.setLanguage(lang);
  languageDialog.value = false;
};

watch(
  currentSessionWord,
  (word) => {
    if (!word) return;
    shuffledLetters.value = word.split("").sort(() => Math.random() - 0.5);
    dropZones.value = new Array(word.length).fill(null);
    usedIndexes.value = [];
    selectedTileIndex.value = null;
    result.value = "";
  },
  { immediate: true }
);

watch(result, async (val) => {
  if (val) {
    await nextTick();
    if (resultEl.value) {
      gsap.fromTo(
        resultEl.value,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
      );
    }
  }
});

function onDragStart(index) {
  event.dataTransfer.setData("letter-index", index.toString());
}

function onDrop(slotIndex, letterIndex) {
  if (result.value === "Correct!") return; // prevent changing after correct

  if (letterIndex === null) {
    const removed = dropZones.value[slotIndex];
    if (removed) {
      usedIndexes.value = usedIndexes.value.filter((i) => i !== removed.index);
    }
    dropZones.value[slotIndex] = null;
    return;
  }

  const index = parseInt(letterIndex, 10);
  const letter = shuffledLetters.value[index];

  if (dropZones.value[slotIndex] || usedIndexes.value.includes(index)) return;

  dropZones.value[slotIndex] = { letter, index };
  usedIndexes.value.push(index);
}

function onTileSelect(index) {
  if (usedIndexes.value.includes(index) || result.value === "Correct!") return;
  selectedTileIndex.value = selectedTileIndex.value === index ? null : index;
}

function onDropTap(slotIndex) {
  if (result.value === "Correct!") return;
  const selectedIndex = selectedTileIndex.value;
  if (
    selectedIndex === null ||
    dropZones.value[slotIndex] ||
    usedIndexes.value.includes(selectedIndex)
  )
    return;

  const letter = shuffledLetters.value[selectedIndex];
  dropZones.value[slotIndex] = { letter, index: selectedIndex };
  usedIndexes.value.push(selectedIndex);
  selectedTileIndex.value = null;
}

function resetCurrentWord() {
  dropZones.value = new Array(currentSessionWord.value.length).fill(null);
  usedIndexes.value = [];
  selectedTileIndex.value = null;
  result.value = "";
  // optional reshuffle
  shuffledLetters.value = currentSessionWord.value
    .split("")
    .sort(() => Math.random() - 0.5);
}

function checkAnswer() {
  const formedWord = dropZones.value
    .map((entry) => entry?.letter || "")
    .join("");
  const correct = formedWord === currentSessionWord.value;
  result.value = correct ? "🎉 Correct!" : "❌ Try Again!";
  isCorrect.value = correct;
  selectedTileIndex.value = null;
}

function goToNextWord() {
  if (sessionIndex.value < sessionWords.value.length - 1) {
    spelling.nextSessionWord();

    isCorrect.value = false;
  } else {
    result.value = "🌟 You've completed!";
    isCompleted.value = true;
    triggerConfetti();
  }
}

function speakWord(word) {
  const utterance = new SpeechSynthesisUtterance(word);
  if (selectedLanguage.value === "jp") {
    utterance.lang = "ja-JP";
  } else {
    utterance.lang = "en-US";
  }
  utterance.rate = 0.8;
  speechSynthesis.speak(utterance);

  gsap.fromTo(
    hearBtnWrapper.value,
    { scale: 1 },
    { scale: 1.2, yoyo: true, repeat: 1, duration: 0.2, ease: "back.out(1.7)" }
  );

  const waves = hearBtnWrapper.value.querySelectorAll(".wave");
  waves.forEach((wave, i) => {
    gsap.fromTo(
      wave,
      { scale: 0, opacity: 0.5 },
      {
        scale: 2.5,
        opacity: 0,
        duration: 0.6,
        ease: "power1.out",
        delay: i * 0.1,
      }
    );
  });
}
// watch(
//   currentWord,
//   (word) => {
//     shuffledLetters.value = word.split("").sort(() => Math.random() - 0.5);
//     dropZones.value = new Array(word.length).fill(null);
//     usedIndexes.value = [];
//     selectedTileIndex.value = null;
//     result.value = "";
//     isCorrect.value = false;
//     isCompleted.value = false;
//   },
//   { immediate: true }
// );

onBeforeRouteLeave(() => {
  if (isCompleted.value) {
    spelling.resetProgress();
  }
});
</script>

<style scoped>
.drop-zone-container {
  display: flex;
  margin-bottom: 2rem;
}
.letter-pool {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.instruction-text {
  font-size: 1.5rem;
  font-weight: 500;
  color: white;
  margin-bottom: 0.5rem;
}

.target-word {
  font-size: 3rem;
  font-weight: bold;
  letter-spacing: 0.25em;
  color: white;
  margin-bottom: 1.5rem;
}

.next-word-btn {
  background-color: #4caf50;
  color: white;
  font-weight: bold;
  font-size: 1rem;
  /* padding: 12px 24px; */
  border-radius: 9999px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, background-color 0.3s;
}

.next-word-btn:hover {
  transform: scale(1.05);
  background-color: #66bb6a;
}

.next-word-btn .v-icon {
  margin-right: 8px;
  font-size: 24px;
}

.result-text {
  font-size: 2rem;
  font-weight: bold;
  color: white;
  margin-top: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(222, 76, 76);
  text-align: center;
  text-shadow: 1px 1px 1px rgba(255, 255, 255, 0.5);
}

/* .result-text::before {
  content: "❌ ";
  color: red;
  margin-right: 0.5rem;
  font-size: 2rem;
}

.result-text.correct::before {
  content: "🎉 ";
  color: gold;
}

.result-text.completed::before {
  content: "🌟 ";
  color: #ffca28;
} */
.icon-sound-btn {
  background-color: #ffeb3b; /* playful yellow */
  border-radius: 50%;
  transition: transform 0.2s ease;
}

.icon-sound-btn:hover {
  transform: scale(1.1);
  background-color: #fff176;
}
/* .icon-wrapper {
  display: inline-block;
} */
.speaker-container {
  position: relative;
  display: inline-block;
}

.wave {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 64px;
  height: 64px;
  border: 2px solid white;
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  pointer-events: none;
}

.wave1 {
  border-color: #ffffffaa;
}

.wave2 {
  border-color: #ffffff77;
}

.v-progress-linear {
  background-color: #e1bee7 !important;
}
</style>
