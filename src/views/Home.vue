<!-- src/views/Home.vue -->
<template>
  <v-container class="text-center py-10">
    <h1 class="text-h4 mb-6">🎉 Welcome to Spelling Fun!</h1>

    <v-btn
      to="/spelling"
      color="primary"
      class="ma-2"
      size="large"
      prepend-icon="mdi-pencil"
    >
      Start Spelling Game
    </v-btn>

    <v-btn
      to="/vocab"
      color="green"
      class="ma-2"
      size="large"
      prepend-icon="mdi-book-open-page-variant"
    >
      Vocabulary List
    </v-btn>
  </v-container>
</template>
