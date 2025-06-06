<!-- components/MudoCelebration.vue -->
<template>
  <transition name="fade" appear>
    <div v-if="visible" class="mudo-wrapper" @click.stop="hide">
      <!-- Boss image -->
      <img
        ref="mudoImg"
        class="mudo-img"
        src="@/img/mudo.png"
        alt="Boss Mudo"
      />

      <!-- Confetti -->
      <ConfettiExplosion
        :particleCount="120"
        :stageHeight="stageHeight"
        :stageWidth="stageWidth"
        v-if="visible"
      />
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import ConfettiExplosion from "vue-confetti-explosion";
import { gsap } from "gsap";

const props = defineProps({
  /** Whether to show the celebration */
  modelValue: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue"]);

const visible = ref(props.modelValue);
const stageWidth = ref(window.innerWidth);
const stageHeight = ref(window.innerHeight);
const mudoImg = ref(null);

watch(
  () => props.modelValue,
  (v) => (visible.value = v)
);
watch(visible, (v) => emit("update:modelValue", v));

const hide = () => (visible.value = false);

function playEntrance() {
  if (!mudoImg.value) return;
  gsap.fromTo(
    mudoImg.value,
    { scale: 0, rotation: -30, opacity: 0 },
    { scale: 1, rotation: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }
  );
}

onMounted(() => {
  window.addEventListener("resize", resize);
  if (visible.value) playEntrance();
});

onUnmounted(() => window.removeEventListener("resize", resize));

function resize() {
  stageWidth.value = window.innerWidth;
  stageHeight.value = window.innerHeight;
}

watch(visible, (v) => v && playEntrance());
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.mudo-wrapper {
  position: fixed;
  inset: 0;
  z-index: 9999; /* above everything */
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(3px); /* subtle focus */
}

.mudo-img {
  max-width: 50vw;
  max-height: 60vh;
  object-fit: contain;
  pointer-events: none;
}
</style>
