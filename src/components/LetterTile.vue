<template>
  <div ref="tileRef">
    <v-sheet
      class="letter-tile"
      elevation="6"
      color="yellow lighten-2"
      rounded
      :style="{
        opacity: disabled ? 0.3 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        border: selected ? '3px solid #4caf50' : 'none',
      }"
      draggable="true"
      @dragstart="$emit('dragstart')"
      @click="$emit('select')"
    >
      <span class="letter">{{ letter }}</span>
    </v-sheet>
  </div>
</template>

<script setup>
import { watch, ref, onMounted } from "vue";
import { gsap } from "gsap";

const props = defineProps({
  letter: String,
  disabled: Boolean,
  selected: Boolean,
});

const tileRef = ref(null);
const isTouchDevice = ref(false);

onMounted(() => {
  isTouchDevice.value =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;
});
// Watch for re-enable (disabled going from true → false)
watch(
  () => props.disabled,
  (val, oldVal) => {
    if (oldVal === true && val === false && tileRef.value) {
      // Bounce in!
      gsap.fromTo(
        tileRef.value,
        { scale: 0.5, opacity: 0.3 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          ease: "back.out(1.7)",
        }
      );
    }
  }
);
</script>

<style scoped>
.letter-tile {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  transition: transform 0.2s;
}

.letter-tile:hover {
  transform: scale(1.05);
}

.letter {
  font-size: 2.2rem;
  font-weight: bold;
  color: #2d2d2d;
}
</style>
