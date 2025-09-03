<template>
  <v-app>
    <v-main>
      <v-container fluid class="fill-height">
        <v-row justify="center" align="center">
          <v-col cols="12" sm="8" md="6" lg="4">
            <v-card class="text-center pa-6">
              <v-card-title class="text-h4 mb-4">
                <v-icon size="large" color="primary" class="me-3"
                  >mdi-tools</v-icon
                >
                ArtaleTool
              </v-card-title>

              <v-card-text class="text-body-1 mb-6">
                請選擇要使用的功能
              </v-card-text>

              <v-row>
                <v-col cols="12" sm="6">
                  <v-card
                    variant="outlined"
                    class="pa-4 cursor-pointer"
                    @click="goToKeyboard"
                    hover
                  >
                    <v-icon size="x-large" color="teal" class="mb-3"
                      >mdi-keyboard</v-icon
                    >
                    <div class="text-h6 mb-2">鍵盤工具</div>
                    <div class="text-caption text-medium-emphasis">
                      鍵盤錄製、播放、定時按鍵
                    </div>
                  </v-card>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-card
                    variant="outlined"
                    class="pa-4 cursor-pointer"
                    @click="goToMouse"
                    hover
                  >
                    <v-icon size="x-large" color="purple" class="mb-3"
                      >mdi-mouse</v-icon
                    >
                    <div class="text-h6 mb-2">滑鼠工具</div>
                    <div class="text-caption text-medium-emphasis">
                      滑鼠錄製、播放、座標記錄
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goToKeyboard = () => {
  router.push("/keyboard");
};

const goToMouse = () => {
  router.push("/mouse");
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
