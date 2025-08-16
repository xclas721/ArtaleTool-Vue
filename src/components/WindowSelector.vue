<template>
  <v-dialog v-model="dialog" max-width="800px" persistent>
    <v-card class="rounded-lg">
      <v-card-title class="d-flex justify-space-between align-center pa-4 pb-2">
        <div class="d-flex align-center">
          <v-icon start>mdi-window-maximize</v-icon>
          <span class="text-h6">選擇要鎖定的視窗</span>
          <v-chip color="primary" size="small" class="ml-2" variant="tonal">
            {{ windows.length }}
          </v-chip>
        </div>
        <v-btn icon @click="closeDialog" variant="text">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-4 pt-2">
        <v-alert type="info" variant="tonal" class="mb-4">
          <template v-slot:prepend>
            <v-icon>mdi-information</v-icon>
          </template>
          <div>
            <strong>重要提示：</strong
            >選擇的視窗將被鎖定並自動帶到前台，腳本只會在該視窗中執行。
            <div class="text-caption mt-1">
              建議選擇腳本錄製時的目標視窗，以確保操作準確性。
            </div>
          </div>
        </v-alert>

        <!-- 視窗列表 -->
        <div v-if="windows.length === 0" class="text-center py-8">
          <v-icon size="large" color="grey" class="mb-2"
            >mdi-window-close</v-icon
          >
          <div class="text-body-1 text-grey">沒有找到視窗</div>
          <div class="text-caption text-grey">請確保後端服務正在運行</div>
        </div>

        <v-table v-else density="compact" class="compact-window-table">
          <thead>
            <tr>
              <th class="text-caption" style="width: 80%">視窗標題</th>
              <th class="text-right text-caption" style="width: 20%">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="window in windows"
              :key="window.handle"
              @click="selectWindow(window)"
              class="cursor-pointer"
            >
              <td>
                <div class="d-flex align-center">
                  <v-icon
                    :color="window.isActive ? 'primary' : 'grey'"
                    size="small"
                    class="me-1"
                  >
                    {{
                      window.isActive
                        ? "mdi-window-maximize"
                        : "mdi-window-minimize"
                    }}
                  </v-icon>
                  <span
                    :class="{ 'font-weight-bold': window.isActive }"
                    class="text-caption text-truncate"
                    style="max-width: 300px"
                    :title="window.title"
                  >
                    {{ window.title }}
                  </span>
                </div>
              </td>
              <td class="text-right">
                <v-btn-group>
                  <v-btn
                    color="primary"
                    size="x-small"
                    @click.stop="selectWindow(window)"
                    prepend-icon="mdi-check"
                    class="font-weight-bold"
                  >
                    選擇
                  </v-btn>
                </v-btn-group>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>

      <v-card-actions class="pa-4 pt-2">
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          variant="text"
          @click="closeDialog"
          class="text-none"
        >
          取消
        </v-btn>
        <v-btn
          color="warning"
          variant="text"
          @click="playWithoutLock"
          prepend-icon="mdi-play-circle"
          class="text-none ms-2"
        >
          不鎖定視窗播放
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, inject } from "vue";
import axios from "axios";

const snackbar = inject("snackbar");

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits([
  "update:modelValue",
  "window-selected",
  "play-without-lock",
]);

// 響應式數據
const dialog = ref(false);
const windows = ref([]);
const loading = ref(false);

// 監聽 modelValue 變化
const updateDialog = (value) => {
  dialog.value = value;
  if (value) {
    refreshWindows();
  }
};

// 獲取視窗列表
const refreshWindows = async () => {
  loading.value = true;
  try {
    const response = await axios.get("http://localhost:8080/api/window/list");
    if (response.data && Array.isArray(response.data)) {
      windows.value = response.data;
    } else {
      windows.value = [];
    }
  } catch (error) {
    console.error("獲取視窗列表失敗:", error);
    windows.value = [];
    snackbar.value = {
      show: true,
      text: "獲取視窗列表失敗，請確保後端服務正在運行",
      color: "error",
    };
  } finally {
    loading.value = false;
  }
};

// 選擇視窗
const selectWindow = async (window) => {
  try {
    // 先鎖定視窗
    const lockResponse = await axios.post(
      "http://localhost:8080/api/window/lock",
      null,
      {
        params: { windowHandle: window.handle },
      },
    );

    if (lockResponse.status === 200) {
      // 再將視窗帶到前台
      const frontResponse = await axios.post(
        "http://localhost:8080/api/window/bring-to-front",
      );

      if (frontResponse.status === 200) {
        snackbar.value = {
          show: true,
          text: `已鎖定並將視窗帶到前台: ${window.title}`,
          color: "success",
        };
      } else {
        snackbar.value = {
          show: true,
          text: `已鎖定視窗: ${window.title}`,
          color: "success",
        };
      }

      emit("window-selected", window);
      closeDialog();
    }
  } catch (error) {
    console.error("鎖定視窗失敗:", error);
    snackbar.value = {
      show: true,
      text: error.response?.data || "鎖定視窗失敗",
      color: "error",
    };
  }
};

// 不鎖定視窗播放
const playWithoutLock = () => {
  emit("play-without-lock");
  closeDialog();
};

// 關閉對話框
const closeDialog = () => {
  dialog.value = false;
  emit("update:modelValue", false);
};

// 監聽 props 變化
import { watch } from "vue";
watch(() => props.modelValue, updateDialog);
</script>

<style scoped>
/* 視窗選擇器樣式 */
.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  background-color: rgba(var(--v-theme-primary), 0.02);
}

/* 緊湊視窗表格樣式 */
.compact-window-table {
  font-size: 0.8rem;
}

.compact-window-table :deep(.v-table th),
.compact-window-table :deep(.v-table td) {
  padding: 4px 6px !important;
}

/* 表格樣式優化 */
:deep(.v-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.v-table th) {
  background-color: rgba(var(--v-theme-primary), 0.05);
  font-weight: 600;
  color: var(--v-theme-primary);
}

:deep(.v-table td) {
  border-bottom: 1px solid rgba(var(--v-theme-border-color), 0.12);
}

:deep(.v-table tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.02);
}

/* 對話框樣式 */
:deep(.v-dialog) {
  border-radius: 12px !important;
}

:deep(.v-card) {
  border-radius: 12px !important;
}

:deep(.v-btn) {
  text-transform: none !important;
  letter-spacing: normal !important;
}

/* 按鈕組樣式 */
:deep(.v-btn-group) {
  display: inline-flex;
  gap: 1px;
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
</style>
