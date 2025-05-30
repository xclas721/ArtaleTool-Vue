<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <ControlPanel />
      </v-container>
    </v-main>
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="snackbar.show = false"
        >
          關閉
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, provide } from 'vue'
import ControlPanel from './components/ControlPanel.vue'

const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

provide('snackbar', snackbar)
</script>

<style>
.v-application {
  font-family: 'Microsoft JhengHei', sans-serif !important;
}

.v-main {
  background-color: #f5f5f5;
}
</style>
