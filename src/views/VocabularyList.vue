<template>
  <v-container
    class="py-10"
    style="height: 100vh; display: flex; flex-direction: column"
  >
    <!-- Top Fixed Section -->
    <div style="flex: 0 0 auto">
      <!-- Language Switcher -->
      <v-card class="pa-4 mb-4" elevation="2" rounded="lg">
        <v-btn-toggle v-model="selectedLanguage" mandatory>
          <v-btn value="en">English</v-btn>
          <v-btn value="jp">Japanese</v-btn>
        </v-btn-toggle>
      </v-card>

      <!-- Add new word -->
      <v-card class="pa-4 mb-4" elevation="2" rounded="lg">
        <v-text-field
          v-model="newWord"
          :label="addWordLabel"
          prepend-inner-icon="mdi-alphabetical"
          variant="outlined"
          density="comfortable"
        />
        <v-btn
          color="indigo lighten-2"
          class="mt-2 add-btn"
          @click="addNewWord"
        >
          <v-icon start>mdi-plus</v-icon>
          Add Word
        </v-btn>
      </v-card>
    </div>

    <!-- Scrollable Word List -->
    <div style="flex: 1 1 auto; overflow-y: auto; padding-bottom: 2rem">
      <div v-if="currentWordList.length > 0">
        <v-slide-y-transition group>
          <v-card
            v-for="(word, index) in currentWordList"
            :key="word + index"
            class="d-flex justify-between align-center px-4 py-3 mb-2 word-card"
            elevation="1"
            rounded="lg"
          >
            <span class="word-text">{{ word }}</span>
            <v-btn icon color="red" @click="remove(index)" variant="tonal">
              <v-icon>mdi-trash-can</v-icon>
            </v-btn>
          </v-card>
        </v-slide-y-transition>
      </div>

      <div v-else class="text-center mt-10 text-grey">
        <v-icon size="40">mdi-book-alert-outline</v-icon>
        <p class="mt-2">
          ✨ No words yet! Add your first word to start the magic!
        </p>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useSpellingStore } from "@/stores/spellingStore";
import { storeToRefs } from "pinia";

const spelling = useSpellingStore();
const { selectedLanguage, currentWordList } = storeToRefs(spelling);

const newWord = ref("");

// Dynamically update placeholder based on language
const addWordLabel = computed(() => {
  return selectedLanguage.value === "jp" ? "新しい単語を追加" : "Add new word";
});

function addNewWord() {
  if (newWord.value.trim()) {
    spelling.addWord(newWord.value);
    newWord.value = "";
  }
}

function remove(index) {
  spelling.removeWord(index);
}
</script>

<style scoped>
.add-btn {
  font-weight: bold;
  border-radius: 999px;
  transition: transform 0.2s ease;
}
.add-btn:hover {
  transform: scale(1.05);
}

.word-card {
  background-color: #fffbea;
  font-family: "Fredoka", sans-serif;
}
.word-text {
  font-size: 1.25rem;
  font-weight: 600;
}
</style>
