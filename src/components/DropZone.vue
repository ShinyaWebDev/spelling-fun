<template>
  <div ref="slotRef">
    <v-sheet
      class="drop-slot"
      elevation="3"
      :color="letter ? 'blue-grey lighten-5' : 'grey lighten-4'"
      rounded
      @dragover.prevent
      @drop="handleDrop"
      @click="handleTap"
    >
      <span class="letter">{{ letter?.letter || "?" }}</span>
    </v-sheet>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { gsap } from "gsap";

const props = defineProps({
  letter: {
    type: Object,
    default: () => null,
  },
  index: Number,
});

const emit = defineEmits(["drop", "removeUsed"]);

const slotRef = ref(null);

function handleDrop(event) {
  const index = parseInt(event.dataTransfer.getData("letter-index"), 10);
  emit("drop", props.index, index);
}

function handleTap() {
  if (props.letter) {
    // already filled → clear
    // emit("drop", props.index, null);
    clearSlot();
  } else {
    // empty → try placing selected letter
    emit("tap", props.index);
  }
}

function clearSlot() {
  if (props.letter && slotRef.value) {
    // Animate shrinking out
    gsap.to(slotRef.value, {
      scale: 0,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        emit("drop", props.index, null); // then clear the slot
        // reset scale
        gsap.set(slotRef.value, { scale: 1 });
      },
    });
  }
}

watch(
  () => props.letter,
  (newVal) => {
    if (newVal && slotRef.value) {
      // tiny delay to ensure it's rendered
      setTimeout(() => {
        gsap.fromTo(
          slotRef.value,
          { scale: 1.2 },
          { scale: 1, duration: 0.3, ease: "bounce.out" }
        );
      }, 10);
    }
  }
);
</script>

<style scoped>
.drop-slot {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px dashed #bbb;
  transition: background-color 0.3s;
}

.letter {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}
</style>
