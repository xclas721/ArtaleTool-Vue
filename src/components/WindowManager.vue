<template>
  <v-container>
    <div class="d-flex justify-end">
      <v-btn
        color="secondary"
        @click.stop="goHome"
        prepend-icon="mdi-home"
        size="small"
        class="font-weight-bold me-2 mb-2"
      >
        返回首頁
      </v-btn>
    </div>
    <v-card class="mb-4">
      <v-card-title
        class="d-flex justify-space-between align-center cursor-pointer"
        @click="toggleExpanded"
      >
        <div class="d-flex align-center">
          <v-icon start>mdi-window-maximize</v-icon>
          <span class="text-h6">視窗管理</span>
          <v-chip color="primary" size="small" class="ml-2" variant="tonal">
            {{ windows.length }}
          </v-chip>
        </div>
        <div class="d-flex align-center">
          <v-btn
            color="primary"
            @click.stop="refreshWindows"
            prepend-icon="mdi-refresh"
            size="small"
            :loading="loading"
            class="font-weight-bold me-2"
          >
            重新整理
          </v-btn>
          <v-icon
            :icon="isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            size="small"
            class="transition-transform"
          ></v-icon>
        </div>
      </v-card-title>

      <v-expand-transition>
        <v-card-text v-show="isExpanded">
          <!-- 視窗鎖定狀態 -->
          <v-alert
            v-if="windowStatus.isLocked"
            type="info"
            variant="tonal"
            class="mb-4"
          >
            <template v-slot:prepend>
              <v-icon>mdi-lock</v-icon>
            </template>
            <div>
              <strong>已鎖定視窗：</strong>{{ windowStatus.lockedWindowTitle }}
              <div class="text-caption mt-1">
                狀態：{{
                  windowStatus.isLockedWindowActive ? "活動中" : "非活動"
                }}
              </div>
            </div>
            <template v-slot:append>
              <v-btn
                color="error"
                variant="text"
                size="small"
                @click="unlockWindow"
                prepend-icon="mdi-lock-open"
              >
                解鎖
              </v-btn>
            </template>
          </v-alert>

          <!-- 視窗大小位置鎖定狀態 -->
          <v-alert
            v-if="windowStatus.isWindowSizePositionLocked"
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            <template v-slot:prepend>
              <v-icon>mdi-lock-outline</v-icon>
            </template>
            <div>
              <strong>已鎖定大小位置：</strong>{{ windowStatus.lockedSizePositionWindowTitle }}
              <div class="text-caption mt-1">
                視窗大小和位置已被鎖定，無法移動或調整大小
              </div>
            </div>
            <template v-slot:append>
              <v-btn
                color="error"
                variant="text"
                size="small"
                @click="unlockSizePosition"
                prepend-icon="mdi-lock-open"
              >
                解鎖
              </v-btn>
            </template>
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
                <th class="text-caption" style="width: 35%">視窗標題</th>
                <th class="text-caption" style="width: 20%">位置</th>
                <th class="text-caption" style="width: 20%">大小</th>
                <th class="text-right text-caption" style="width: 25%">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="window in windows" :key="window.handle">
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
                      style="max-width: 100px"
                      :title="window.title"
                    >
                      {{ window.title }}
                    </span>
                  </div>
                </td>
                <td class="text-caption text-grey">
                  {{ window.x }}, {{ window.y }}
                </td>
                <td class="text-caption text-grey">
                  {{ window.width }}×{{ window.height }}
                </td>
                <td class="text-right">
                  <v-btn-group>
                    <v-btn
                      color="secondary"
                      size="x-small"
                      @click="bringToFront(window)"
                      prepend-icon="mdi-window-maximize"
                      class="font-weight-bold"
                    >
                      前台
                    </v-btn>
                    <v-btn
                      color="info"
                      size="x-small"
                      @click="openWindowEditor(window)"
                      prepend-icon="mdi-cog"
                      class="font-weight-bold"
                    >
                      編輯
                    </v-btn>
                    <v-btn
                      :color="window.isSizePositionLocked ? 'error' : 'success'"
                      size="x-small"
                      @click="toggleSizePositionLock(window)"
                      :prepend-icon="window.isSizePositionLocked ? 'mdi-lock' : 'mdi-lock-open'"
                      class="font-weight-bold"
                    >
                      {{ window.isSizePositionLocked ? '解鎖' : '鎖定' }}
                    </v-btn>
                  </v-btn-group>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-expand-transition>
    </v-card>

    <!-- 視窗編輯對話框 -->
    <v-dialog v-model="windowEditorVisible" max-width="400px" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="d-flex align-center">
            <v-icon start>mdi-cog</v-icon>
            <span class="text-h6">編輯視窗</span>
          </div>
          <v-btn icon @click="closeWindowEditor" variant="text">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-alert type="info" variant="tonal" class="mb-4">
            <template v-slot:prepend>
              <v-icon>mdi-information</v-icon>
            </template>
            <div>
              <strong>視窗資訊：</strong>{{ selectedWindow?.title }}
              <div class="text-caption mt-1">
                類別：{{ selectedWindow?.className }}
              </div>
            </div>
          </v-alert>

          <v-row dense>
            <v-col cols="6">
              <v-text-field
                v-model="windowEditor.x"
                label="X"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                :rules="[(v) => v >= 0 || '座標不能為負數']"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="windowEditor.y"
                label="Y"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                :rules="[(v) => v >= 0 || '座標不能為負數']"
              />
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="6">
              <v-text-field
                v-model="windowEditor.width"
                label="寬"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                :rules="[(v) => v > 0 || '寬度必須大於 0']"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="windowEditor.height"
                label="高"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                :rules="[(v) => v > 0 || '高度必須大於 0']"
              />
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="12">
              <v-btn
                color="warning"
                variant="text"
                size="small"
                @click="resetWindowPosition"
                prepend-icon="mdi-refresh"
                block
              >
                重置位置
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-3">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            size="small"
            @click="closeWindowEditor"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            size="small"
            @click="saveWindowChanges"
            prepend-icon="mdi-content-save"
          >
            儲存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const snackbar = inject("snackbar");
const router = useRouter();

// 響應式數據
const windows = ref([]);
const loading = ref(false);
const windowStatus = ref({
  isLocked: false,
  lockedWindowTitle: "",
  isLockedWindowActive: false,
  isWindowSizePositionLocked: false,
  lockedSizePositionWindowTitle: "",
});

// 視窗編輯相關
const windowEditorVisible = ref(false);
const selectedWindow = ref(null);
const windowEditor = ref({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
});

// 折疊狀態
const isExpanded = ref(false);

// 初始化時設定預設值
const initializeData = () => {
  windows.value = [];
  windowStatus.value = {
    isLocked: false,
    lockedWindowTitle: "",
    isLockedWindowActive: false,
    isWindowSizePositionLocked: false,
    lockedSizePositionWindowTitle: "",
  };
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
    await getWindowStatus();
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

// 獲取視窗狀態
const getWindowStatus = async () => {
  try {
    const response = await axios.get("http://localhost:8080/api/window/status");
    if (response.data) {
      windowStatus.value = response.data;
    }
    
    // 獲取大小位置鎖定狀態
    const sizePositionResponse = await axios.get("http://localhost:8080/api/window/size-position-status");
    if (sizePositionResponse.data) {
      // 更新視窗列表中的鎖定狀態
      windows.value.forEach(window => {
        window.isSizePositionLocked = sizePositionResponse.data.isSizePositionLocked && 
          window.title === sizePositionResponse.data.lockedSizePositionWindowTitle;
      });
    }
  } catch (error) {
    console.error("獲取視窗狀態失敗:", error);
    // 不顯示錯誤訊息，因為這是在背景定期執行的
  }
};

// 鎖定視窗
const lockWindow = async (window) => {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/window/lock",
      null,
      {
        params: { windowHandle: window.handle },
      },
    );

    if (response.status === 200) {
      snackbar.value = {
        show: true,
        text: `視窗已鎖定: ${window.title}`,
        color: "success",
      };
      await getWindowStatus();
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

// 解鎖視窗
const unlockWindow = async () => {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/window/unlock",
    );

    if (response.status === 200) {
      snackbar.value = {
        show: true,
        text: "視窗已解鎖",
        color: "success",
      };
      await getWindowStatus();
    }
  } catch (error) {
    console.error("解鎖視窗失敗:", error);
    snackbar.value = {
      show: true,
      text: error.response?.data || "解鎖視窗失敗",
      color: "error",
    };
  }
};

// 將視窗帶到前台
const bringToFront = async (window) => {
  try {
    // 如果有鎖定的視窗，使用原有的邏輯
    if (windowStatus.value.isLocked) {
      const response = await axios.post(
        "http://localhost:8080/api/window/bring-to-front",
      );

      if (response.status === 200) {
        snackbar.value = {
          show: true,
          text: "視窗已帶到前台",
          color: "success",
        };
      }
    } else {
      // 如果沒有鎖定的視窗，直接將指定視窗帶到前台
      const response = await axios.post(
        "http://localhost:8080/api/window/bring-to-front-direct",
        null,
        {
          params: { windowHandle: window.handle },
        },
      );

      if (response.status === 200) {
        snackbar.value = {
          show: true,
          text: `視窗已帶到前台: ${window.title}`,
          color: "success",
        };
      }
    }
  } catch (error) {
    console.error("將視窗帶到前台失敗:", error);
    const errorMessage = error.response?.data || "將視窗帶到前台失敗";
    snackbar.value = {
      show: true,
      text: errorMessage,
      color: "error",
    };
  }
};

// 快捷鍵處理
const handleKeyDown = (event) => {
  // F11: 解鎖視窗
  if (event.key === "F11") {
    event.preventDefault();
    if (windowStatus.value.isLocked) {
      unlockWindow();
    }
  }

  // F12: 將鎖定視窗帶到前台
  if (event.key === "F12") {
    event.preventDefault();
    if (windowStatus.value.isLocked) {
      bringToFront(); // 不需要傳入視窗參數
    } else {
      snackbar.value = {
        show: true,
        text: "請先播放腳本來鎖定視窗",
        color: "warning",
      };
    }
  }
};

// 生命週期
onMounted(() => {
  initializeData();
  refreshWindows();
  window.addEventListener("keydown", handleKeyDown);

  // 定期更新視窗狀態
  const statusInterval = setInterval(getWindowStatus, 2000);

  onUnmounted(() => {
    clearInterval(statusInterval);
  });
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

// 返回首頁
const goHome = () => {
  router.push("/");
};

// 折疊功能
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

// 視窗編輯功能
const openWindowEditor = (window) => {
  selectedWindow.value = window;
  windowEditor.value = {
    x: window.x,
    y: window.y,
    width: window.width,
    height: window.height,
  };
  windowEditorVisible.value = true;
};

const closeWindowEditor = () => {
  windowEditorVisible.value = false;
  selectedWindow.value = null;
};

const resetWindowPosition = () => {
  if (selectedWindow.value) {
    windowEditor.value.x = selectedWindow.value.x;
    windowEditor.value.y = selectedWindow.value.y;
  }
};

const saveWindowChanges = async () => {
  if (!selectedWindow.value) return;

  try {
    // 檢查是否有位置或大小變更
    const hasPositionChange =
      windowEditor.value.x !== selectedWindow.value.x ||
      windowEditor.value.y !== selectedWindow.value.y;
    const hasSizeChange =
      windowEditor.value.width !== selectedWindow.value.width ||
      windowEditor.value.height !== selectedWindow.value.height;

    if (hasPositionChange && hasSizeChange) {
      // 同時修改位置和大小
      const response = await axios.post(
        "http://localhost:8080/api/window/set-position",
        null,
        {
          params: {
            windowHandle: selectedWindow.value.handle,
            x: windowEditor.value.x,
            y: windowEditor.value.y,
            width: windowEditor.value.width,
            height: windowEditor.value.height,
          },
        },
      );
      if (response.status === 200) {
        snackbar.value = {
          show: true,
          text: "視窗位置和大小修改成功",
          color: "success",
        };
      }
    } else if (hasPositionChange) {
      // 只修改位置
      const response = await axios.post(
        "http://localhost:8080/api/window/set-position",
        null,
        {
          params: {
            windowHandle: selectedWindow.value.handle,
            x: windowEditor.value.x,
            y: windowEditor.value.y,
          },
        },
      );
      if (response.status === 200) {
        snackbar.value = {
          show: true,
          text: "視窗位置修改成功",
          color: "success",
        };
      }
    } else if (hasSizeChange) {
      // 只修改大小
      const response = await axios.post(
        "http://localhost:8080/api/window/set-size",
        null,
        {
          params: {
            windowHandle: selectedWindow.value.handle,
            width: windowEditor.value.width,
            height: windowEditor.value.height,
          },
        },
      );
      if (response.status === 200) {
        snackbar.value = {
          show: true,
          text: "視窗大小修改成功",
          color: "success",
        };
      }
    } else {
      snackbar.value = {
        show: true,
        text: "沒有變更需要儲存",
        color: "info",
      };
      return;
    }

    // 重新整理視窗列表
    await refreshWindows();
    closeWindowEditor();
  } catch (error) {
    console.error("修改視窗失敗:", error);
    snackbar.value = {
      show: true,
      text: error.response?.data || "修改視窗失敗",
      color: "error",
    };
  }
};

// 鎖定/解鎖大小位置
const toggleSizePositionLock = async (window) => {
  try {
    let response;
    if (window.isSizePositionLocked) {
      // 解鎖
      response = await axios.post("http://localhost:8080/api/window/unlock-size-position");
    } else {
      // 鎖定
      response = await axios.post(
        "http://localhost:8080/api/window/lock-size-position",
        null,
        {
          params: { windowHandle: window.handle },
        },
      );
    }

    if (response.status === 200) {
      window.isSizePositionLocked = !window.isSizePositionLocked;
      snackbar.value = {
        show: true,
        text: `視窗大小位置已${window.isSizePositionLocked ? '鎖定' : '解鎖'}`,
        color: "success",
      };
      await getWindowStatus(); // 更新狀態
    }
  } catch (error) {
    console.error("鎖定/解鎖大小位置失敗:", error);
    snackbar.value = {
      show: true,
      text: error.response?.data || "鎖定/解鎖大小位置失敗",
      color: "error",
    };
  }
};

// 解鎖大小位置
const unlockSizePosition = async () => {
  try {
    const response = await axios.post("http://localhost:8080/api/window/unlock-size-position");
    if (response.status === 200) {
      snackbar.value = {
        show: true,
        text: "視窗大小位置已解鎖",
        color: "success",
      };
      await getWindowStatus(); // 更新狀態
    }
  } catch (error) {
    console.error("解鎖大小位置失敗:", error);
    snackbar.value = {
      show: true,
      text: error.response?.data || "解鎖大小位置失敗",
      color: "error",
    };
  }
};
</script>

<style scoped>
/* 視窗管理折疊相關樣式 */
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

/* 表格樣式優化 */
:deep(.v-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.v-table th) {
  background-color: rgba(var(--v-theme-primary), 0.05);
  font-weight: 600;
  color: var(--v-theme-primary);
  padding: 8px 4px !important;
}

:deep(.v-table td) {
  border-bottom: 1px solid rgba(var(--v-theme-border-color), 0.12);
  padding: 6px 4px !important;
}

:deep(.v-table tr:hover) {
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

/* 文字截斷優化 */
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
