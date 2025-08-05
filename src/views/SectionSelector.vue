<template>
    <v-container class="py-6 text-center" style="height: 100vh; display: flex; flex-direction: column">
        <h1 class="text-h3 mb-8" style="color: #ad1457; font-family: 'Fredoka', sans-serif">Choose Your Hiragana!</h1>

        <div class="row-grid">
            <v-card
                v-for="row in rows"
                :key="row"
                class="row-card"
                elevation="4"
                rounded="xl"
                @click="navigateToRow(row)">
                <div class="row-character">{{ row.char }}</div>
                <div class="row-label">{{ getRowLabel(row) }}</div>
            </v-card>
        </div>
    </v-container>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const rows = [
    { char: "あ", label: "A-I-U-E-O" },
    { char: "か", label: "KA-KI-KU-KE-KO" },
    { char: "さ", label: "SA-SHI-SU-SE-SO" },
    { char: "た", label: "TA-CHI-TSU-TE-TO" },
    { char: "な", label: "NA-NI-NU-NE-NO" },
    { char: "は", label: "HA-HI-FU-HE-HO" },
    { char: "ま", label: "MA-MI-MU-ME-MO" },
    { char: "や", label: "YA-YU-YO" },
    { char: "ら", label: "RA-RI-RU-RE-RO" },
    { char: "わ", label: "WA-WO-N" },
];

function navigateToRow(row) {
    router.push(`/sections/${row.char}`);
}

function getRowLabel(row) {
    return row.label;
}
</script>

<style scoped>
.row-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1.5rem;
    max-width: 800px;
    margin: 0 auto;
    padding: 0 1rem;
}

.row-card {
    background: linear-gradient(135deg, #fce4ec, #f8bbd9);
    padding: 2rem 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.row-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(173, 20, 87, 0.3);
}

.row-card:active {
    transform: translateY(-2px);
}

.row-character {
    font-size: 3rem;
    font-weight: bold;
    color: #ad1457;
    margin-bottom: 0.5rem;
    font-family: serif;
}

.row-label {
    font-size: 0.9rem;
    color: #880e4f;
    font-weight: 500;
    text-align: center;
}

@media (max-width: 600px) {
    .row-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }

    .row-character {
        font-size: 2.5rem;
    }

    .row-label {
        font-size: 0.8rem;
    }
}
</style>
