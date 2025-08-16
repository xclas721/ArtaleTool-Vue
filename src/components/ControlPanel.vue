<template>
  <v-container>
    <!-- 控制面板 -->
    <v-card class="mb-4">
      <v-card-title class="text-h6">
        <v-icon start>mdi-cog</v-icon>
        控制面板
      </v-card-title>
      <v-card-text>
        <!-- 錄製控制卡片 -->
        <v-card variant="outlined" class="mb-4">
          <v-card-text>
            <div class="d-flex align-center mb-2">
              <v-icon start color="teal">mdi-record</v-icon>
              <span class="font-weight-bold">錄製控制</span>
            </div>
            <v-btn-group>
              <v-btn
                color="teal"
                :disabled="isRecording"
                @click="startRecording"
                prepend-icon="mdi-record"
                size="small"
                class="font-weight-bold"
              >
                開始錄製
              </v-btn>
              <v-btn
                color="error"
                :disabled="!isRecording"
                @click="stopRecording"
                prepend-icon="mdi-stop"
                size="small"
                class="font-weight-bold"
              >
                停止錄製
              </v-btn>
              <v-btn
                color="primary"
                :disabled="!recordedEvents.length"
                @click="saveCurrentScript"
                prepend-icon="mdi-content-save"
                size="small"
                class="font-weight-bold"
              >
                儲存腳本
              </v-btn>
            </v-btn-group>
          </v-card-text>
        </v-card>

        <!-- 播放控制和定時按鍵卡片 -->
        <v-card variant="outlined" class="mb-4">
          <v-card-text>
            <v-row>
              <!-- 播放控制 -->
              <v-col cols="4">
                <div class="d-flex align-center mb-2">
                  <v-icon start color="blue">mdi-play</v-icon>
                  <span class="font-weight-bold">播放控制</span>
                </div>
                <v-switch
                  v-model="isLooping"
                  label="循環播放"
                  :disabled="isPlaying"
                  color="primary"
                  hide-details
                  class="mb-2"
                  density="compact"
                ></v-switch>
                <v-text-field
                  v-if="isLooping"
                  v-model="loopCount"
                  label="循環次數 (0=無限)"
                  type="number"
                  min="0"
                  :disabled="isPlaying"
                  hide-details
                  class="mb-2"
                  density="compact"
                  variant="outlined"
                ></v-text-field>
                <v-btn-group>
                  <v-btn
                    color="teal"
                    :disabled="!loadedScript || isPlaying"
                    @click="playScript"
                    prepend-icon="mdi-play"
                    size="small"
                    class="font-weight-bold"
                  >
                    播放
                  </v-btn>
                  <v-btn
                    color="error"
                    :disabled="!isPlaying"
                    @click="stopPlayback"
                    prepend-icon="mdi-stop"
                    size="small"
                    class="font-weight-bold"
                  >
                    停止
                  </v-btn>
                </v-btn-group>
              </v-col>

              <!-- 定時按鍵控制 -->
              <v-col cols="8">
                <div class="d-flex align-center justify-space-between mb-2">
                  <div class="d-flex align-center">
                    <v-icon start color="orange">mdi-clock-outline</v-icon>
                    <span class="font-weight-bold">定時按鍵</span>
                  </div>
                  <v-btn
                    color="error"
                    @click="stopAllScheduledKeys"
                    prepend-icon="mdi-stop"
                    size="x-small"
                    class="font-weight-bold"
                    :disabled="!scheduledKeys.some((key) => key.isRunning)"
                  >
                    全結束
                  </v-btn>
                </div>
                <v-row>
                  <v-col v-for="i in 3" :key="i" cols="4">
                    <v-card variant="outlined" class="pa-1">
                      <v-card-text class="pa-1">
                        <div class="d-flex flex-column align-center">
                          <v-btn
                            :color="
                              activeKeyField === i - 1
                                ? 'teal'
                                : scheduledKeys[i - 1].key
                                  ? 'teal'
                                  : 'grey'
                            "
                            variant="outlined"
                            :disabled="scheduledKeys[i - 1].isRunning"
                            class="mb-1 font-weight-bold"
                            style="min-width: 60px"
                            size="x-small"
                            @click="startKeyListening(i - 1)"
                          >
                            <template v-if="activeKeyField === i - 1">
                              <v-icon class="me-1" color="teal" size="small"
                                >mdi-keyboard</v-icon
                              >
                              請按下按鍵
                            </template>
                            <template v-else>
                              {{ scheduledKeys[i - 1].key || "點擊輸入按鍵" }}
                            </template>
                          </v-btn>
                          <v-text-field
                            v-model="scheduledKeys[i - 1].interval"
                            min="1"
                            :disabled="scheduledKeys[i - 1].isRunning"
                            hide-details
                            class="mb-1"
                            style="max-width: 90px; width: 100%"
                            variant="outlined"
                            density="compact"
                            bg-color="surface"
                            color="primary"
                          ></v-text-field>
                          <div
                            v-if="scheduledKeys[i - 1].isRunning"
                            class="text-caption text-primary font-weight-medium mb-1"
                          >
                            下次按鍵: {{ scheduledKeys[i - 1].countdown }}秒
                          </div>
                          <div
                            v-else
                            class="text-caption text-medium-emphasis mb-1"
                          >
                            最小 1 秒
                          </div>
                          <v-btn
                            :color="
                              scheduledKeys[i - 1].isRunning ? 'error' : 'teal'
                            "
                            @click="toggleScheduledKey(i - 1)"
                            :prepend-icon="
                              scheduledKeys[i - 1].isRunning
                                ? 'mdi-stop'
                                : 'mdi-play'
                            "
                            class="font-weight-bold"
                            size="x-small"
                            style="min-width: 60px"
                          >
                            {{
                              scheduledKeys[i - 1].isRunning ? "停止" : "開始"
                            }}
                          </v-btn>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col v-for="i in 3" :key="i + 3" cols="4">
                    <v-card variant="outlined" class="pa-1">
                      <v-card-text class="pa-1">
                        <div class="d-flex flex-column align-center">
                          <v-btn
                            :color="
                              activeKeyField === i + 2
                                ? 'teal'
                                : scheduledKeys[i + 2].key
                                  ? 'teal'
                                  : 'grey'
                            "
                            variant="outlined"
                            :disabled="scheduledKeys[i + 2].isRunning"
                            class="mb-1 font-weight-bold"
                            style="min-width: 60px"
                            size="x-small"
                            @click="startKeyListening(i + 2)"
                          >
                            <template v-if="activeKeyField === i + 2">
                              <v-icon class="me-1" color="teal" size="small"
                                >mdi-keyboard</v-icon
                              >
                              請按下按鍵
                            </template>
                            <template v-else>
                              {{ scheduledKeys[i + 2].key || "點擊輸入按鍵" }}
                            </template>
                          </v-btn>
                          <v-text-field
                            v-model="scheduledKeys[i + 2].interval"
                            min="1"
                            :disabled="scheduledKeys[i + 2].isRunning"
                            hide-details
                            class="mb-1"
                            style="max-width: 90px; width: 100%"
                            variant="outlined"
                            density="compact"
                            bg-color="surface"
                            color="primary"
                          ></v-text-field>
                          <div
                            v-if="scheduledKeys[i + 2].isRunning"
                            class="text-caption text-primary font-weight-medium mb-1"
                          >
                            下次按鍵: {{ scheduledKeys[i + 2].countdown }}秒
                          </div>
                          <div
                            v-else
                            class="text-caption text-medium-emphasis mb-1"
                          >
                            最小 1 秒
                          </div>
                          <v-btn
                            :color="
                              scheduledKeys[i + 2].isRunning ? 'error' : 'teal'
                            "
                            @click="toggleScheduledKey(i + 2)"
                            :prepend-icon="
                              scheduledKeys[i + 2].isRunning
                                ? 'mdi-stop'
                                : 'mdi-play'
                            "
                            class="font-weight-bold"
                            size="x-small"
                            style="min-width: 60px"
                          >
                            {{
                              scheduledKeys[i + 2].isRunning ? "停止" : "開始"
                            }}
                          </v-btn>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 播放狀態顯示 -->
        <v-row v-if="isPlaying">
          <v-col cols="12">
            <v-alert color="info" variant="tonal" class="mb-0">
              正在播放: {{ loadedScript?.name }}
              <template v-if="isLooping">
                (第 {{ currentLoop }} 次 /
                {{ loopCount === 0 ? "無限" : loopCount }})
              </template>
              <div class="text-caption mt-1">
                <v-icon color="warning" class="me-1" size="small"
                  >mdi-keyboard-esc</v-icon
                >
                按下 ESC 鍵可結束播放
              </div>
            </v-alert>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 視窗選擇器對話框 -->
    <WindowSelector
      v-model="windowSelectorVisible"
      @window-selected="onWindowSelected"
      @play-without-lock="playWithoutLock"
    />

    <!-- 腳本列表 -->
    <v-card v-if="!isPlaying" class="mb-4">
      <v-card-title
        class="d-flex justify-space-between align-center cursor-pointer"
        @click="toggleScriptList"
      >
        <div class="d-flex align-center">
          <v-icon start>mdi-format-list-bulleted</v-icon>
          <span class="text-h6">腳本列表</span>
          <v-chip color="primary" size="small" class="ml-2" variant="tonal">
            {{ scriptList.length }}
          </v-chip>
        </div>
        <div class="d-flex align-center">
          <v-btn
            color="primary"
            @click.stop="refreshScriptList"
            prepend-icon="mdi-refresh"
            size="small"
            class="font-weight-bold me-2"
          >
            刷新列表
          </v-btn>
          <v-icon
            :icon="scriptListExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            size="small"
            class="transition-transform"
          ></v-icon>
        </div>
      </v-card-title>

      <v-expand-transition>
        <v-card-text v-show="scriptListExpanded">
          <div v-if="scriptList.length === 0" class="text-center py-8">
            <v-icon size="large" color="grey" class="mb-2"
              >mdi-file-document-outline</v-icon
            >
            <div class="text-body-1 text-grey">暫無腳本</div>
            <div class="text-caption text-grey">
              錄製並儲存腳本後將顯示在此處
            </div>
          </div>

          <v-table v-else density="compact">
            <thead>
              <tr>
                <th class="text-caption">腳本名稱</th>
                <th class="text-right text-caption">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="script in scriptList" :key="script.name">
                <td class="text-body-2">{{ script.name }}</td>
                <td class="text-right">
                  <v-btn-group>
                    <v-btn
                      color="primary"
                      size="x-small"
                      @click="loadScript(script.name)"
                      prepend-icon="mdi-upload"
                      class="font-weight-bold"
                    >
                      載入
                    </v-btn>
                    <v-btn
                      color="info"
                      size="x-small"
                      @click="renameScript(script.name)"
                      prepend-icon="mdi-pencil"
                      class="font-weight-bold"
                    >
                      改名
                    </v-btn>
                    <v-btn
                      color="error"
                      size="x-small"
                      @click="confirmDeleteScript(script.name)"
                      prepend-icon="mdi-delete"
                      class="font-weight-bold"
                    >
                      刪除
                    </v-btn>
                  </v-btn-group>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-expand-transition>
    </v-card>

    <!-- 腳本內容 -->
    <v-card v-if="loadedScript" class="mb-4">
      <v-card-title>
        <v-icon start>mdi-file-document</v-icon>
        腳本內容
      </v-card-title>
      <v-card-text>
        <!-- 當前播放按鍵顯示 -->
        <div v-if="isPlaying" class="current-key-display mb-4">
          <div class="text-h6 mb-2">當前播放按鍵</div>
          <div class="d-flex flex-wrap gap-2">
            <div
              v-for="(key, index) in currentPressedKeys"
              :key="index"
              class="key-preview"
              :class="{ 'key-pressed': true }"
            >
              <v-icon
                :icon="getKeyIcon(key)"
                size="24"
                class="key-icon"
              ></v-icon>
              <span class="key-text">{{ key }}</span>
            </div>
            <div
              v-if="currentPressedKeys.length === 0"
              class="text-body-1 text-grey"
            >
              等待中...
            </div>
          </div>
        </div>
        <v-timeline density="compact" align="start">
          <v-timeline-item
            v-for="(event, index) in loadedScript"
            :key="index"
            :dot-color="event.action === 'PRESS' ? 'primary' : 'grey'"
            size="small"
            :class="{ 'current-event': currentPlayingIndex === index }"
          >
            <div class="d-flex align-center">
              <span class="text-body-2 me-4">
                {{
                  formatRelativeTime(event.timestamp, loadedScript[0].timestamp)
                }}
              </span>
              <div
                class="key-preview me-4"
                :class="{ 'key-pressed': event.action === 'PRESS' }"
              >
                <v-icon
                  :icon="getKeyIcon(event.key)"
                  size="24"
                  class="key-icon"
                ></v-icon>
                <span class="key-text">{{ event.key }}</span>
              </div>
              <div
                class="action-badge"
                :class="{
                  press: event.action === 'PRESS',
                  release: event.action === 'RELEASE',
                }"
              >
                {{ event.action === "PRESS" ? "DOWN" : "UP" }}
              </div>
            </div>
          </v-timeline-item>
        </v-timeline>
      </v-card-text>
    </v-card>

    <!-- 刪除確認對話框 -->
    <v-dialog
      v-model="deleteDialogVisible"
      max-width="400"
      transition="dialog-bottom-transition"
    >
      <v-card class="rounded-lg">
        <v-card-title class="text-h5 font-weight-bold pa-4 pb-2">
          <v-icon color="error" class="me-2">mdi-alert-circle</v-icon>
          確認刪除
        </v-card-title>
        <v-card-text class="text-body-1 pa-4 pt-2">
          確定要刪除腳本 "{{ scriptToDelete }}" 嗎？
          <div class="text-caption text-medium-emphasis mt-2">
            此操作無法復原
          </div>
        </v-card-text>
        <v-card-actions class="pa-4 pt-2">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="tonal"
            @click="deleteDialogVisible = false"
            class="text-none"
          >
            取消
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="deleteScript"
            class="text-none ms-2"
          >
            確定刪除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 改名對話框 -->
    <v-dialog
      v-model="renameDialogVisible"
      max-width="400"
      transition="dialog-bottom-transition"
    >
      <v-card class="rounded-lg">
        <v-card-title class="text-h5 font-weight-bold pa-4 pb-2">
          <v-icon color="info" class="me-2">mdi-pencil</v-icon>
          改名腳本
        </v-card-title>
        <v-card-text class="pa-4 pt-2">
          <v-text-field
            v-model="newScriptName"
            label="新腳本名稱"
            :error-messages="renameError"
            @keyup.enter="confirmRename"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            class="mb-2"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="pa-4 pt-2">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="tonal"
            @click="renameDialogVisible = false"
            class="text-none"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="confirmRename"
            class="text-none ms-2"
          >
            確定
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 儲存腳本對話框 -->
    <v-dialog
      v-model="saveDialogVisible"
      max-width="400"
      transition="dialog-bottom-transition"
    >
      <v-card class="rounded-lg">
        <v-card-title class="text-h5 font-weight-bold pa-4 pb-2">
          <v-icon color="primary" class="me-2">mdi-content-save</v-icon>
          儲存腳本
        </v-card-title>
        <v-card-text class="pa-4 pt-2">
          <v-text-field
            v-model="saveScriptName"
            label="腳本名稱"
            :error-messages="saveError"
            @keyup.enter="confirmSave"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            class="mb-2"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="pa-4 pt-2">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="tonal"
            @click="saveDialogVisible = false"
            class="text-none"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="confirmSave"
            class="text-none ms-2"
          >
            確定
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 倒數計時對話框 -->
    <v-dialog
      v-model="countdownVisible"
      persistent
      max-width="300"
      transition="dialog-bottom-transition"
    >
      <v-card class="rounded-lg">
        <v-card-text class="text-center pa-6">
          <div class="text-h1 font-weight-bold text-primary">
            {{ countdown }}
          </div>
          <div class="text-body-1 text-medium-emphasis mt-2">準備開始播放</div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onUnmounted, onMounted, inject } from "vue";
import axios from "axios";

import WindowSelector from "./WindowSelector.vue";

const snackbar = inject("snackbar");
const isRecording = ref(false);
const recordedEvents = ref([]);
const scriptList = ref([]);
const loadedScript = ref(null);
const isPlaying = ref(false);
const countdownVisible = ref(false);
const countdown = ref(3);
const deleteDialogVisible = ref(false);
const scriptToDelete = ref("");
const isLooping = ref(true);
const loopCount = ref(0);
const currentLoop = ref(0);
const renameDialogVisible = ref(false);
const newScriptName = ref("");
const renameError = ref("");
const scriptToRename = ref("");
const currentPlayingKey = ref(null);
const currentPlayingIndex = ref(-1);
const currentPressedKeys = ref([]);
const saveDialogVisible = ref(false);
const saveScriptName = ref("");
const saveError = ref("");
const windowSelectorVisible = ref(false);
const scriptListExpanded = ref(false);
let keyPollingInterval = null;
let countdownInterval = null;
let statusInterval = null;
let statusCheckInterval = null;

// 定時按鍵相關
const scheduledKeys = ref([
  {
    key: "Insert",
    interval: 590,
    isRunning: false,
    taskId: "",
    lastPressTime: 0,
    countdown: 0,
  },
  {
    key: "Home",
    interval: 580,
    isRunning: false,
    taskId: "",
    lastPressTime: 0,
    countdown: 0,
  },
  {
    key: "PageUp",
    interval: 1750,
    isRunning: false,
    taskId: "",
    lastPressTime: 0,
    countdown: 0,
  },
  {
    key: "Delete",
    interval: 10,
    isRunning: false,
    taskId: "",
    lastPressTime: 0,
    countdown: 0,
  },
  {
    key: "End",
    interval: 999,
    isRunning: false,
    taskId: "",
    lastPressTime: 0,
    countdown: 0,
  },
  {
    key: "PageDown",
    interval: 999,
    isRunning: false,
    taskId: "",
    lastPressTime: 0,
    countdown: 0,
  },
]);

// 添加按鍵監聽相關
const activeKeyField = ref(null);

const toggleScriptList = () => {
  scriptListExpanded.value = !scriptListExpanded.value;
};

const handleKeyDown = (event, index) => {
  event.preventDefault();
  let key = event.key;

  // 特殊按鍵處理
  const keyMap = {
    Insert: "Insert",
    Shift: "Shift",
    Control: "Ctrl",
    Alt: "Alt",
    Meta: "Command",
    " ": "Space",
    Enter: "Enter",
    Escape: "Escape",
    Tab: "Tab",
    Backspace: "Backspace",
    Delete: "Delete",
    Home: "Home",
    End: "End",
    PageUp: "PageUp",
    PageDown: "PageDown",
    ArrowLeft: "Left",
    ArrowRight: "Right",
    ArrowUp: "Up",
    ArrowDown: "Down",
  };

  // 如果是特殊按鍵，使用映射
  if (keyMap[key]) {
    key = keyMap[key];
  } else if (key.length === 1) {
    // 如果是字母或數字，轉換為大寫
    key = key.toUpperCase();
  }

  scheduledKeys.value[index].key = key;
  activeKeyField.value = null;
};

const startKeyListening = (index) => {
  activeKeyField.value = index;
};

const startRecording = async () => {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/keyboard/start-recording",
    );
    if (response.status === 200) {
      isRecording.value = true;
      recordedEvents.value = [];
      snackbar.value = {
        show: true,
        text: "開始錄製",
        color: "success",
      };
    }
  } catch (error) {
    console.error("開始錄製失敗:", error);
    const errorMessage =
      error.response?.data || "開始錄製失敗，請確保應用程序有足夠的權限";
    snackbar.value = {
      show: true,
      text: errorMessage,
      color: "error",
    };
  }
};

const stopRecording = async () => {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/keyboard/stop-recording",
    );
    if (response.status === 200) {
      isRecording.value = false;
      recordedEvents.value = response.data;
      snackbar.value = {
        show: true,
        text: `停止錄製，共錄製 ${recordedEvents.value.length} 個事件`,
        color: "success",
      };
    }
  } catch (error) {
    console.error("停止錄製失敗:", error);
    const errorMessage = error.response?.data || "停止錄製失敗";
    snackbar.value = {
      show: true,
      text: errorMessage,
      color: "error",
    };
  }
};

const refreshScriptList = async () => {
  try {
    const response = await axios.get(
      "http://localhost:8080/api/keyboard/list-scripts",
    );
    scriptList.value = response.data.map((name) => ({ name }));
    snackbar.value = {
      show: true,
      text: "腳本列表已更新",
      color: "success",
    };
  } catch (error) {
    console.error("載入腳本列表失敗:", error);
    snackbar.value = {
      show: true,
      text: "載入腳本列表失敗",
      color: "error",
    };
  }
};

const loadScript = async (scriptName) => {
  try {
    const response = await axios.get(
      `http://localhost:8080/api/keyboard/load-script?name=${scriptName}`,
    );
    if (response.status === 200) {
      loadedScript.value = response.data;
      // 載入完成後自動折疊腳本列表
      scriptListExpanded.value = false;
      snackbar.value = {
        show: true,
        text: `已載入腳本: ${scriptName}`,
        color: "success",
      };
    }
  } catch (error) {
    console.error("載入腳本失敗:", error);
    snackbar.value = {
      show: true,
      text: "載入腳本失敗",
      color: "error",
    };
  }
};

const confirmDeleteScript = (scriptName) => {
  scriptToDelete.value = scriptName;
  deleteDialogVisible.value = true;
};

const deleteScript = async () => {
  try {
    const response = await axios.delete(
      `http://localhost:8080/api/keyboard/delete-script?name=${scriptToDelete.value}`,
    );
    if (response.status === 200) {
      snackbar.value = {
        show: true,
        text: "腳本刪除成功",
        color: "success",
      };
      deleteDialogVisible.value = false;
      refreshScriptList();
      if (
        loadedScript.value &&
        loadedScript.value.name === scriptToDelete.value
      ) {
        loadedScript.value = null;
      }
    }
  } catch (error) {
    console.error("刪除腳本失敗:", error);
    snackbar.value = {
      show: true,
      text: "刪除腳本失敗",
      color: "error",
    };
  }
};

const saveCurrentScript = () => {
  saveScriptName.value = "";
  saveError.value = "";
  saveDialogVisible.value = true;
};

const confirmSave = async () => {
  if (!saveScriptName.value.trim()) {
    saveError.value = "腳本名稱不能為空";
    return;
  }

  try {
    const response = await axios.post(
      `http://localhost:8080/api/keyboard/save-script?name=${encodeURIComponent(saveScriptName.value)}`,
      recordedEvents.value,
    );
    if (response.status === 200) {
      snackbar.value = {
        show: true,
        text: "腳本儲存成功",
        color: "success",
      };
      saveDialogVisible.value = false;
      await refreshScriptList();
    }
  } catch (error) {
    console.error("儲存腳本失敗:", error);
    saveError.value = error.response?.data || "儲存腳本失敗";
  }
};

const playScript = async () => {
  if (!loadedScript.value) {
    snackbar.value = {
      show: true,
      text: "請先載入要播放的腳本",
      color: "error",
    };
    return;
  }

  // 顯示視窗選擇器
  windowSelectorVisible.value = true;
};

// 視窗選擇後開始播放
const onWindowSelected = async (window) => {
  await startPlayback();
};

// 不鎖定視窗播放
const playWithoutLock = async () => {
  await startPlayback();
};

// 實際開始播放的函數
const startPlayback = async () => {
  try {
    countdownVisible.value = true;
    countdown.value = 3;

    countdownInterval = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(countdownInterval);
        countdownVisible.value = false;
      }
    }, 1000);

    const response = await axios.post(
      "http://localhost:8080/api/keyboard/play-script",
      loadedScript.value,
      {
        params: {
          loop: isLooping.value,
          count: loopCount.value,
        },
      },
    );

    if (response.status === 200) {
      isPlaying.value = true;
      startStatusCheck();
      snackbar.value = {
        show: true,
        text: "開始播放腳本",
        color: "success",
      };
    }
  } catch (error) {
    console.error("播放腳本失敗:", error);
    snackbar.value = {
      show: true,
      text: "播放腳本失敗",
      color: "error",
    };
    isPlaying.value = false;
    countdownVisible.value = false;
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
  }
};

const stopPlayback = async () => {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/keyboard/stop-playback",
    );
    if (response.status === 200) {
      isPlaying.value = false;
      snackbar.value = {
        show: true,
        text: "停止播放",
        color: "success",
      };
    }
  } catch (error) {
    console.error("停止播放失敗:", error);
    snackbar.value = {
      show: true,
      text: "停止播放失敗",
      color: "error",
    };
  }
};

const startKeyPolling = () => {
  keyPollingInterval = setInterval(updateCurrentKeys, 100);
};

const stopKeyPolling = () => {
  if (keyPollingInterval) {
    clearInterval(keyPollingInterval);
    keyPollingInterval = null;
  }
};

const formatRelativeTime = (timestamp, startTime) => {
  const diff = timestamp - startTime;
  const seconds = Math.floor(diff / 1000);
  const milliseconds = diff % 1000;
  return `${seconds}.${milliseconds.toString().padStart(3, "0")}秒`;
};

const checkPlayStatus = async () => {
  try {
    const response = await axios.get(
      "http://localhost:8080/api/keyboard/playback-status",
    );
    if (response.status === 200) {
      const status = response.data;
      isPlaying.value = status.isPlaying;
      currentLoop.value = status.currentLoop;

      // 更新當前播放的按鍵
      if (isPlaying.value) {
        currentPlayingKey.value = status.currentEvent;
        currentPlayingIndex.value = status.currentIndex;

        // 更新當前按下的按鍵列表
        if (status.currentEvent) {
          console.log("Current event:", status.currentEvent);
          if (status.currentEvent.action === "PRESS") {
            if (!currentPressedKeys.value.includes(status.currentEvent.key)) {
              currentPressedKeys.value = [
                ...currentPressedKeys.value,
                status.currentEvent.key,
              ];
              console.log("Added key:", status.currentEvent.key);
            }
          } else if (status.currentEvent.action === "RELEASE") {
            currentPressedKeys.value = currentPressedKeys.value.filter(
              (key) => key !== status.currentEvent.key,
            );
            console.log("Removed key:", status.currentEvent.key);
          }
        }
      } else {
        currentPlayingKey.value = null;
        currentPlayingIndex.value = -1;
        currentPressedKeys.value = [];
      }

      if (!isPlaying.value) {
        stopStatusCheck();
        snackbar.value = {
          show: true,
          text: "腳本播放完成",
          color: "success",
        };
      }
    }
  } catch (error) {
    console.error("檢查播放狀態失敗:", error);
    stopStatusCheck();
    isPlaying.value = false;
    currentPlayingKey.value = null;
    currentPlayingIndex.value = -1;
    currentPressedKeys.value = [];
  }
};

const startStatusCheck = () => {
  stopStatusCheck();
  statusCheckInterval = setInterval(checkPlayStatus, 100);
};

const stopStatusCheck = () => {
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval);
    statusCheckInterval = null;
  }
};

const toggleScheduledKey = async (index) => {
  const key = scheduledKeys.value[index];
  if (key.isRunning) {
    try {
      await axios.post(
        `http://localhost:8080/api/keyboard/scheduled-key/stop?taskId=task_${index}`,
      );
      key.isRunning = false;
      key.taskId = "";
      key.countdown = 0;
      snackbar.value = {
        show: true,
        text: "定時按鍵已停止",
        color: "success",
      };
    } catch (error) {
      console.error("停止定時按鍵失敗:", error);
      snackbar.value = {
        show: true,
        text: "停止定時按鍵失敗",
        color: "error",
      };
    }
  } else {
    if (!key.key || !key.interval) {
      snackbar.value = {
        show: true,
        text: "請輸入按鍵和間隔時間",
        color: "error",
      };
      return;
    }
    try {
      const taskId = `task_${index}`;
      await axios.post(
        `http://localhost:8080/api/keyboard/scheduled-key/start`,
        null,
        {
          params: {
            taskId,
            key: key.key,
            intervalSeconds: parseInt(key.interval),
          },
        },
      );
      key.isRunning = true;
      key.taskId = taskId;
      key.lastPressTime = Date.now();
      key.countdown = parseInt(key.interval);
      startCountdown(index);
      snackbar.value = {
        show: true,
        text: "定時按鍵已啟動",
        color: "success",
      };
    } catch (error) {
      console.error("啟動定時按鍵失敗:", error);
      snackbar.value = {
        show: true,
        text: "啟動定時按鍵失敗",
        color: "error",
      };
    }
  }
};

const startCountdown = (index) => {
  const key = scheduledKeys.value[index];
  if (!key.isRunning) return;

  const updateCountdown = () => {
    if (!key.isRunning) return;

    const now = Date.now();
    const elapsed = Math.floor((now - key.lastPressTime) / 1000);
    const remaining = Math.max(0, parseInt(key.interval) - elapsed);

    key.countdown = remaining;

    if (remaining > 0) {
      requestAnimationFrame(updateCountdown);
    } else {
      key.lastPressTime = now;
      key.countdown = parseInt(key.interval);
      requestAnimationFrame(updateCountdown);
    }
  };

  updateCountdown();
};

const stopAllScheduledKeys = async () => {
  try {
    await axios.post(
      "http://localhost:8080/api/keyboard/scheduled-key/stop-all",
    );
    scheduledKeys.value.forEach((key) => {
      key.isRunning = false;
      key.taskId = "";
    });
    snackbar.value = {
      show: true,
      text: "所有定時按鍵已停止",
      color: "success",
    };
  } catch (error) {
    console.error("停止所有定時按鍵失敗:", error);
    snackbar.value = {
      show: true,
      text: "停止所有定時按鍵失敗",
      color: "error",
    };
  }
};

const getKeyIcon = (key) => {
  const keyIconMap = {
    Space: "mdi-keyboard-space",
    Enter: "mdi-keyboard-return",
    Escape: "mdi-keyboard-esc",
    Tab: "mdi-keyboard-tab",
    Backspace: "mdi-keyboard-backspace",
    Delete: "mdi-keyboard-delete",
    Insert: "mdi-keyboard-insert",
    Home: "mdi-keyboard-home",
    End: "mdi-keyboard-end",
    PageUp: "mdi-keyboard-page-up",
    PageDown: "mdi-keyboard-page-down",
    Left: "mdi-arrow-left-bold",
    Right: "mdi-arrow-right-bold",
    Up: "mdi-arrow-up-bold",
    Down: "mdi-arrow-down-bold",
    Shift: "mdi-keyboard-shift",
    Ctrl: "mdi-keyboard-control",
    Alt: "mdi-keyboard-alt",
    Windows: "mdi-microsoft-windows",
    Command: "mdi-apple-keyboard-command",
    NumLock: "mdi-keyboard-num-lock",
    ScrollLock: "mdi-keyboard-scroll-lock",
    CapsLock: "mdi-keyboard-caps-lock",
    PrintScreen: "mdi-printer",
    Pause: "mdi-pause",
    ContextMenu: "mdi-menu",
    NumPad0: "mdi-numeric-0",
    NumPad1: "mdi-numeric-1",
    NumPad2: "mdi-numeric-2",
    NumPad3: "mdi-numeric-3",
    NumPad4: "mdi-numeric-4",
    NumPad5: "mdi-numeric-5",
    NumPad6: "mdi-numeric-6",
    NumPad7: "mdi-numeric-7",
    NumPad8: "mdi-numeric-8",
    NumPad9: "mdi-numeric-9",
    NumPadAdd: "mdi-plus",
    NumPadSubtract: "mdi-minus",
    NumPadMultiply: "mdi-multiplication",
    NumPadDivide: "mdi-division",
    NumPadDecimal: "mdi-decimal",
    NumPadEnter: "mdi-keyboard-return",
  };

  // 如果是字母鍵，使用字母圖示
  if (/^[A-Z]$/.test(key)) {
    return "mdi-alpha-" + key.toLowerCase() + "-box";
  }
  // 如果是數字鍵，使用數字圖示
  if (/^[0-9]$/.test(key)) {
    return "mdi-numeric-" + key + "-box";
  }
  // 如果是功能鍵，使用功能鍵圖示
  if (/^F[0-9]+$/.test(key)) {
    return "mdi-function";
  }

  return keyIconMap[key] || "mdi-keyboard";
};

const renameScript = (oldName) => {
  scriptToRename.value = oldName;
  newScriptName.value = oldName;
  renameError.value = "";
  renameDialogVisible.value = true;
};

const confirmRename = async () => {
  if (!newScriptName.value.trim()) {
    renameError.value = "腳本名稱不能為空";
    return;
  }

  if (newScriptName.value === scriptToRename.value) {
    renameDialogVisible.value = false;
    return;
  }

  try {
    const response = await axios.post(
      `http://localhost:8080/api/keyboard/rename-script`,
      null,
      {
        params: {
          oldName: scriptToRename.value,
          newName: newScriptName.value,
        },
      },
    );

    if (response.status === 200) {
      snackbar.value = {
        show: true,
        text: "腳本改名成功",
        color: "success",
      };
      renameDialogVisible.value = false;
      await refreshScriptList();

      // 如果當前載入的是被改名的腳本，更新載入的腳本名稱
      if (
        loadedScript.value &&
        loadedScript.value.name === scriptToRename.value
      ) {
        loadedScript.value.name = newScriptName.value;
      }
    }
  } catch (error) {
    console.error("改名腳本失敗:", error);
    renameError.value = error.response?.data || "改名腳本失敗";
  }
};

onMounted(() => {
  refreshScriptList();
  window.addEventListener("keydown", (event) => {
    if (activeKeyField.value !== null) {
      handleKeyDown(event, activeKeyField.value);
    }
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isPlaying.value) {
      stopPlayback();
    }
  });
});

onUnmounted(() => {
  stopKeyPolling();
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  if (statusInterval) {
    clearInterval(statusInterval);
  }
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval);
  }
  stopAllScheduledKeys();
  // 停止所有倒數計時
  scheduledKeys.value.forEach((key) => {
    key.isRunning = false;
    key.countdown = 0;
  });
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keydown", (event) => {
    if (event.key === "Escape" && isPlaying.value) {
      stopPlayback();
    }
  });
});
</script>

<style scoped>
.v-card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.v-btn-group {
  display: inline-flex;
  gap: 1px;
}

.v-timeline-item {
  min-height: 40px;
}

:deep(.v-btn) {
  border-radius: 2px !important;
}

:deep(.v-btn-group .v-btn) {
  border-radius: 2px !important;
}

:deep(.v-btn-group .v-btn:first-child) {
  border-top-left-radius: 2px !important;
  border-bottom-left-radius: 2px !important;
}

:deep(.v-btn-group .v-btn:last-child) {
  border-top-right-radius: 2px !important;
  border-bottom-right-radius: 2px !important;
}

:deep(.v-btn.v-btn--variant-outlined) {
  border-width: 2px !important;
}

.key-preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  height: 40px;
  padding: 0 12px;
  background: #f5f5f5;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.key-preview.key-pressed {
  background: #e3f2fd;
  border-color: #2196f3;
  transform: translateY(2px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.key-text {
  font-size: 14px;
  font-weight: 500;
  color: #424242;
}

.action-chip {
  font-size: 12px;
  font-weight: 500;
  min-width: 60px;
  justify-content: center;
}

.v-timeline-item {
  min-height: 60px;
  padding: 8px 0;
}

:deep(.v-timeline-item__body) {
  padding: 0 16px;
}

:deep(.v-timeline-item__dot) {
  width: 16px;
  height: 16px;
}

.current-key-display {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  min-height: 120px;
  display: flex;
  flex-direction: column;
}

.current-key-display .text-h6 {
  margin-bottom: 16px;
}

.current-key-display .d-flex {
  flex: 1;
  align-items: center;
  justify-content: center;
}

.current-key-display .text-grey {
  font-size: 1.1rem;
  opacity: 0.7;
}

.current-event {
  background: rgba(33, 150, 243, 0.1);
  border-radius: 4px;
}

.current-event .key-preview {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

.gap-2 {
  gap: 8px;
}

/* 對話框相關樣式 */
:deep(.v-dialog) {
  border-radius: 12px !important;
}

:deep(.v-card) {
  border-radius: 12px !important;
}

:deep(.v-card-title) {
  font-size: 1.25rem !important;
  line-height: 1.5 !important;
}

:deep(.v-card-text) {
  font-size: 1rem !important;
  line-height: 1.5 !important;
}

:deep(.v-btn) {
  text-transform: none !important;
  letter-spacing: normal !important;
}

:deep(.v-text-field .v-field__input) {
  padding-top: 12px !important;
  padding-bottom: 12px !important;
}

:deep(.v-text-field .v-field__outline) {
  border-radius: 8px !important;
}

:deep(.v-dialog .v-card-actions) {
  padding: 16px !important;
}

:deep(.v-dialog .v-btn) {
  min-width: 100px !important;
}

/* 定時按鍵輸入框樣式 */
:deep(.v-text-field .v-field__input) {
  text-align: center !important;
  font-size: 1.1rem !important;
  font-weight: 500 !important;
}

:deep(.v-text-field .v-field__prefix),
:deep(.v-text-field .v-field__suffix) {
  font-size: 0.9rem !important;
  color: rgba(var(--v-theme-on-surface), 0.6) !important;
}

:deep(.v-text-field .v-field__outline) {
  border-width: 2px !important;
}

:deep(.v-text-field .v-field--disabled) {
  opacity: 0.7 !important;
}

:deep(.v-text-field .v-field--focused .v-field__outline) {
  border-width: 2px !important;
}

:deep(.v-text-field .v-field__hint) {
  font-size: 0.75rem !important;
  opacity: 0.7 !important;
  transition: all 0.3s ease !important;
}

:deep(.v-text-field .v-field__hint.running) {
  color: var(--v-theme-primary) !important;
  font-weight: 500 !important;
}

/* 按鍵選擇按鈕動畫 */
:deep(.v-btn) {
  transition: all 0.3s ease !important;
}

:deep(.v-btn:not(.v-btn--disabled):hover) {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}

:deep(.v-btn--active) {
  animation: pulse 1.5s infinite !important;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 150, 136, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 150, 136, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 150, 136, 0);
  }
}

/* 腳本列表折疊相關樣式 */
.cursor-pointer {
  cursor: pointer;
}

.transition-transform {
  transition: transform 0.3s ease;
}

:deep(.v-expand-transition-enter-active),
:deep(.v-expand-transition-leave-active) {
  transition: all 0.3s ease;
}

:deep(.v-expand-transition-enter-from),
:deep(.v-expand-transition-leave-to) {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
