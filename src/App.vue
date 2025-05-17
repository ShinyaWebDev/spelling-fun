<!-- App.vue -->
<template>
  <v-app>
    <router-view />

    <v-bottom-navigation app height="64" class="bottom-nav">
      <v-btn to="/" icon>
        <v-icon>mdi-home</v-icon>
      </v-btn>
      <v-btn to="/spelling" icon>
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn to="/vocab" icon>
        <v-icon>mdi-book</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: rgb(243, 102, 163);
  border-top: 1px solid #ddd;
  z-index: 10;
}

.bottom-nav .v-icon {
  color: white !important;
}

.v-application {
  background: linear-gradient(to bottom, #fdf6e3, #fef3e2);
  font-family: "Fredoka", sans-serif;
}

/* body {
  background-color: rgb(240, 128, 240) !important;
} */
/* .v-app {
  background-color: #f5f5f5;
} */
</style>

<style>
/* Apply Fredoka globally */
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
.v-application {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.v-container {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px; /* add spacing for fixed footer */
}
</style>
