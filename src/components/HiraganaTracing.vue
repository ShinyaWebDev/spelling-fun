<template>
  <v-card
    class="pa-6 mb-6"
    elevation="3"
    rounded="xl"
    style="background: linear-gradient(135deg, #e8f5e8, #f0fff0)"
  >
    <h3 class="text-h5 mb-4 text-center">
      ✏️ Trace the Hiragana: {{ character }}
    </h3>
    <div class="text-center mb-2 text-body-2">
      Strokes: {{ userStrokes.length }} /
      {{ hiraganaData[character]?.strokes || 1 }}
    </div>

    <div class="tracing-container">
      <svg
        ref="tracingSvg"
        width="250"
        height="250"
        viewBox="0 0 250 250"
        class="tracing-svg"
        @touchstart="startTracing"
        @touchmove="continueTracing"
        @touchend="endTracing"
        @mousedown="startTracing"
        @mousemove="continueTracing"
        @mouseup="endTracing"
      >
        <!-- Faded character as guide -->
        <text
          x="125"
          y="210"
          text-anchor="middle"
          font-size="210"
          font-family="serif"
          fill="#ddd"
          stroke="#ccc"
          stroke-width="1"
        >
          {{ character }}
        </text>

        <!-- User's completed strokes -->
        <path
          v-for="(stroke, index) in userStrokes"
          :key="index"
          :d="stroke"
          stroke="#2196F3"
          stroke-width="8"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Current stroke being drawn -->
        <path
          v-if="currentStroke"
          :d="currentStroke"
          stroke="#2196F3"
          stroke-width="8"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <div class="text-center mt-4">
      <v-btn color="secondary" @click="clearTracing" class="mr-2">
        <v-icon start>mdi-eraser</v-icon>
        Clear
      </v-btn>
      <v-btn
        color="success"
        @click="completeTracing"
        :disabled="userStrokes.length < (hiraganaData[character]?.strokes || 1)"
      >
        <v-icon start>mdi-check</v-icon>
        Done
      </v-btn>
    </div>

    <!-- <div v-if="accuracy > 0" class="text-center mt-3">
            <v-alert :type="accuracy > 70 ? 'success' : accuracy > 40 ? 'warning' : 'error'" variant="tonal">
                <div v-if="accuracy > 70">Excellent! 🎉 Accuracy: {{ Math.round(accuracy) }}%</div>
                <div v-else-if="accuracy > 40">Good try! 👍 Accuracy: {{ Math.round(accuracy) }}% - Try again?</div>
                <div v-else>Keep practicing! 💪 Accuracy: {{ Math.round(accuracy) }}%</div>
            </v-alert>
        </div> -->

    <div v-if="showEncouragement" class="text-center mt-3">
      <v-alert type="success" variant="tonal">
        Great job! 🎉 Now let's practice words with {{ character }}
      </v-alert>
    </div>
  </v-card>
</template>

<script setup>
// import opentype from "opentype.js";

import { ref, defineEmits, watch, onMounted } from "vue";

const props = defineProps({
  character: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["complete"]);

const tracingSvg = ref(null);
const userStrokes = ref([]);
const currentStroke = ref("");
const isTracing = ref(false);
const showEncouragement = ref(false);
const userPoints = ref([]);
const accuracy = ref(0);

const hiraganaData = {
  あ: {
    strokes: 3,
    keyPoints: [
      [100, 80],
      [80, 120],
      [120, 120],
      [100, 160],
    ],
  },
  い: {
    strokes: 2,
    keyPoints: [
      [90, 80],
      [90, 160],
      [110, 100],
      [110, 140],
    ],
  },
  う: {
    strokes: 2,
    keyPoints: [
      [80, 100],
      [120, 100],
      [100, 80],
      [100, 160],
    ],
  },
  え: {
    strokes: 2,
    keyPoints: [
      [70, 90],
      [130, 90],
      [100, 120],
      [100, 160],
    ],
  },
  お: {
    strokes: 3,
    keyPoints: [
      [80, 80],
      [120, 80],
      [100, 120],
      [80, 160],
      [120, 160],
    ],
  },
  か: {
    strokes: 3,
    keyPoints: [
      [100, 80],
      [80, 120],
      [120, 120],
      [100, 160],
    ],
  },
  き: {
    strokes: 4,
    keyPoints: [
      [100, 80],
      [80, 120],
      [120, 120],
      [100, 160],
    ],
  },
  く: {
    strokes: 1,
    keyPoints: [
      [80, 100],
      [120, 100],
      [100, 80],
      [100, 160],
    ],
  },
  け: {
    strokes: 3,
    keyPoints: [
      [70, 90],
      [130, 90],
      [100, 120],
      [100, 160],
    ],
  },
  こ: {
    strokes: 2,
    keyPoints: [
      [80, 80],
      [120, 80],
      [100, 120],
      [80, 160],
      [120, 160],
    ],
  },
};

function startTracing(event) {
  isTracing.value = true;
  const point = getPoint(event);
  currentStroke.value = `M ${point.x} ${point.y}`;
}

function continueTracing(event) {
  if (!isTracing.value) return;
  event.preventDefault();
  const point = getPoint(event);
  currentStroke.value += ` L ${point.x} ${point.y}`;
  userPoints.value.push(point);
}

function endTracing() {
  isTracing.value = false;
  if (currentStroke.value) {
    userStrokes.value.push(currentStroke.value);
    currentStroke.value = "";

    const expectedStrokes = hiraganaData[props.character]?.strokes || 1;
    if (userStrokes.value.length >= expectedStrokes) {
      calculateAccuracy();
    }
  }
}

function getPoint(event) {
  const svg = tracingSvg.value;
  const rect = svg.getBoundingClientRect();
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;

  return {
    x: ((clientX - rect.left) / rect.width) * 250,
    y: ((clientY - rect.top) / rect.height) * 250,
  };
}

function clearTracing() {
  userStrokes.value = [];
  currentStroke.value = "";
  userPoints.value = [];
  accuracy.value = 0;
  showEncouragement.value = false;
}

function calculateAccuracy() {
  const data = hiraganaData[props.character];
  if (!data || userPoints.value.length === 0) {
    accuracy.value = 0;
    return;
  }

  let totalDistance = 0;
  let matchedPoints = 0;

  data.keyPoints.forEach((keyPoint) => {
    const closestUserPoint = userPoints.value.reduce(
      (closest, userPoint) => {
        const distance = Math.sqrt(
          Math.pow(keyPoint[0] - userPoint.x, 2) +
            Math.pow(keyPoint[1] - userPoint.y, 2)
        );
        return distance < closest.distance
          ? { point: userPoint, distance }
          : closest;
      },
      { distance: Infinity }
    );

    if (closestUserPoint.distance < 30) {
      matchedPoints++;
      totalDistance += closestUserPoint.distance;
    }
  });

  accuracy.value =
    matchedPoints > 0 ? Math.max(0, 100 - totalDistance / matchedPoints) : 0;
}

function completeTracing() {
  if (userPoints.value.length === 0) {
    calculateAccuracy();
  }
  showEncouragement.value = true;
  setTimeout(() => {
    emit("complete");
  }, 1500);
}
</script>

<style scoped>
.tracing-container {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.tracing-svg {
  border: 2px dashed #ccc;
  border-radius: 12px;
  background: white !important;
  cursor: crosshair;
  touch-action: none;
  outline: none !important;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.tracing-svg:hover {
  border-color: #2196f3;
  background: white !important;
}

.tracing-svg:focus {
  outline: none !important;
  background: white !important;
  box-shadow: none !important;
}

.tracing-svg:active {
  background: white !important;
  outline: none !important;
}
</style>
