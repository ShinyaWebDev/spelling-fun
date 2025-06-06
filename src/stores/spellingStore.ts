import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";

const STORAGE_KEY = "spellingWordsMultiLang";

export const useSpellingStore = defineStore("spelling", () => {
  const defaultWords = {
    en: ["PLAY", "JUMP", "MOON"],
    jp: ["りんご", "さくらんぼ", "バナナ"],
  };

  const storedData =
    JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") || {};
  const words = ref(storedData.words || defaultWords);
  const selectedLanguage = ref(storedData.selectedLanguage || "en");

  const currentWordList = computed(() => words.value[selectedLanguage.value]);
  const currentIndex = ref(0);
  const currentWord = computed(() => currentWordList.value[currentIndex.value]);
  const isLastWord = computed(
    () => currentIndex.value >= currentWordList.value.length - 1
  );
  const sessionWords = ref<string[]>([]);
  const sessionIndex = ref(0);
  // const currentSessionWord = computed(
  //   () => sessionWords.value[sessionIndex.value]
  // );

  const currentSessionWord = computed(
    () => sessionWords.value[sessionIndex.value]
  );
  const isLastSessionWord = computed(
    () => sessionIndex.value >= sessionWords.value.length - 1
  );

  function nextWord() {
    if (!isLastWord.value) currentIndex.value++;
  }

  function resetProgress() {
    currentIndex.value = 0;
  }

  function setLanguage(lang) {
    selectedLanguage.value = lang;
    resetProgress(); // reset progress when changing language
  }

  function addWord(newWord) {
    if (newWord) {
      const upperWord =
        selectedLanguage.value === "en" ? newWord.toUpperCase() : newWord;
      if (!words.value[selectedLanguage.value].includes(upperWord)) {
        words.value[selectedLanguage.value].push(upperWord);
      }
    }
  }

  function removeWord(index) {
    words.value[selectedLanguage.value].splice(index, 1);
    if (currentIndex.value >= currentWordList.value.length) {
      resetProgress();
    }
  }

  function prepareSession(count) {
    const fullList = [...words.value[selectedLanguage.value]];
    const shuffled = fullList.sort(() => Math.random() - 0.5);
    sessionWords.value = shuffled.slice(0, count);
    sessionIndex.value = 0;
  }

  function nextSessionWord() {
    if (sessionIndex.value < sessionWords.value.length - 1) {
      sessionIndex.value++;
    }
  }

  watch(
    [words, selectedLanguage],
    () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          words: words.value,
          selectedLanguage: selectedLanguage.value,
        })
      );
    },
    { deep: true }
  );

  return {
    words,
    selectedLanguage,
    setLanguage,
    currentWordList,
    currentIndex,
    currentWord,
    isLastWord,
    nextWord,
    resetProgress,
    addWord,
    removeWord,
    sessionWords,
    sessionIndex,
    currentSessionWord,
    prepareSession,
    nextSessionWord,
    isLastSessionWord,
  };
});
