<template>
  <v-container class="py-10">
    <v-card class="pa-4 mb-6" elevation="2" rounded="lg">
      <v-text-field
        v-model="newWord"
        label="Add new word"
        prepend-inner-icon="mdi-alphabetical"
        variant="outlined"
        density="comfortable"
      />
      <v-btn color="indigo lighten-2" class="mt-2 add-btn" @click="addNewWord">
        <v-icon start>mdi-plus</v-icon>
        Add Word
      </v-btn>
    </v-card>

    <div v-if="words.length > 0">
      <v-slide-y-transition group>
        <v-card
          v-for="(word, index) in words"
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
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import { useSpellingStore } from "@/stores/spellingStore";
import { storeToRefs } from "pinia";

const spelling = useSpellingStore();
const { words } = storeToRefs(spelling);

const newWord = ref("");

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
