import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";

const STORAGE_KEY = "spellingWords";

export const useSpellingStore = defineStore("spelling", () => {
  const defaultWords = ["PLAY", "JUMP", "MOON"];
  const storedWords =
    JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultWords;

  const words = ref(storedWords);
  const currentIndex = ref(0);

  const currentWord = computed(() => words.value[currentIndex.value]);
  const isLastWord = computed(
    () => currentIndex.value >= words.value.length - 1
  );

  function nextWord() {
    if (!isLastWord.value) currentIndex.value++;
  }

  function resetProgress() {
    console.log("Resetting progress");

    currentIndex.value = 0;
  }

  function addWord(newWord) {
    if (newWord && !words.value.includes(newWord.toUpperCase())) {
      words.value.push(newWord.toUpperCase());
    }
  }

  function removeWord(index) {
    words.value.splice(index, 1);
    if (currentIndex.value >= words.value.length) {
      resetProgress();
    }
  }

  // Persist words in localStorage on any change
  watch(
    words,
    (newWords) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newWords));
    },
    { deep: true }
  );

  return {
    words,
    currentIndex,
    currentWord,
    isLastWord,
    nextWord,
    resetProgress,
    addWord,
    removeWord,
  };
});
