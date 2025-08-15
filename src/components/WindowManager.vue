<template>
  <v-card class="mb-4">
    <v-card-title class="d-flex justify-space-between align-center" @click="toggleExpanded">
      <div class="d-flex align-center">
        <v-icon start>mdi-window-maximize</v-icon>
        <span class="text-h6">視窗管理</span>
      </div>
      <div class="d-flex align-center">
        <v-btn
          color="primary"
          @click.stop="refreshWindows"
          prepend-icon="mdi-refresh"
          size="small"
          :loading="loading"
          class="me-2"
        >
          重新整理
        </v-btn>
        <v-btn
          icon
          @click.stop="toggleExpanded"
          variant="text"
          size="small"
        >
          <v-icon>{{ isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </v-btn>
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
            狀態：{{ windowStatus.isLockedWindowActive ? '活動中' : '非活動' }}
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

      <!-- 視窗列表 -->
                          <v-data-table
                      :headers="headers"
                      :items="windows"
                      :loading="loading"
                      class="elevation-1 compact-table"
                      density="compact"
                      hover
                      :items-per-page="-1"
                      hide-default-footer
                    >
        <template v-slot:item.title="{ item }">
          <div class="d-flex align-center">
            <v-icon
              :color="getItemValue(item, 'isActive') ? 'primary' : 'grey'"
              size="small"
              class="me-2"
            >
              {{ getItemValue(item, 'isActive') ? 'mdi-window-maximize' : 'mdi-window-minimize' }}
            </v-icon>
            <span
              :class="{ 'font-weight-bold': getItemValue(item, 'isActive') }"
              class="text-truncate"
              style="max-width: 120px"
              :title="getItemValue(item, 'title')"
            >
              {{ getItemValue(item, 'title') }}
            </span>
          </div>
        </template>

        <template v-slot:item.className="{ item }">
          <span class="text-caption text-grey" style="max-width: 80px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" :title="getItemValue(item, 'className')">
            {{ getItemValue(item, 'className') }}
          </span>
        </template>

        <template v-slot:item.position="{ item }">
          <span class="text-caption">
            {{ getItemValue(item, 'x') }},{{ getItemValue(item, 'y') }}
          </span>
        </template>

        <template v-slot:item.size="{ item }">
          <span class="text-caption">
            {{ getItemValue(item, 'width') }}×{{ getItemValue(item, 'height') }}
          </span>
        </template>

        <template v-slot:item.actions="{ item }">
           <v-tooltip
             :text="!windowStatus.isLocked ? '請先鎖定一個視窗' : '將鎖定視窗帶到前台'"
             location="top"
           >
             <template v-slot:activator="{ props }">
                                             <v-btn
               color="secondary"
               variant="text"
               size="x-small"
               @click="bringToFront(getItemData(item))"
               :disabled="!windowStatus.isLocked"
               prepend-icon="mdi-window-maximize"
               v-bind="props"
             >
               前台
             </v-btn>
           </template>
         </v-tooltip>
         
         <v-btn
           color="info"
           variant="text"
           size="x-small"
           @click="openWindowEditor(getItemData(item))"
           prepend-icon="mdi-cog"
           class="ml-1"
         >
           編輯
         </v-btn>
           </template>
        
        <template v-slot:no-data>
          <div class="text-center pa-4">
            <v-icon size="large" color="grey" class="mb-2">mdi-window-close</v-icon>
            <div class="text-body-1 text-grey">沒有找到視窗</div>
            <div class="text-caption text-grey mt-1">請確保後端服務正在運行</div>
          </div>
        </template>
      </v-data-table>

      <!-- 快捷鍵說明 -->
      <v-expansion-panels class="mt-4">
        <v-expansion-panel>
                     <v-expansion-panel-title>
             <v-icon start>mdi-keyboard</v-icon>
             視窗管理快捷鍵
           </v-expansion-panel-title>
          <v-expansion-panel-text>
                                    <v-list density="compact">
                          
                          <v-list-item>
                            <template v-slot:prepend>
                              <v-icon color="error">mdi-keyboard</v-icon>
                            </template>
                            <v-list-item-title>F11</v-list-item-title>
                            <v-list-item-subtitle>解鎖視窗</v-list-item-subtitle>
                          </v-list-item>
                          <v-list-item>
                            <template v-slot:prepend>
                              <v-icon color="secondary">mdi-keyboard</v-icon>
                            </template>
                            <v-list-item-title>F12</v-list-item-title>
                            <v-list-item-subtitle>將鎖定視窗帶到前台</v-list-item-subtitle>
                          </v-list-item>
                        </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>
              </v-expansion-panels>
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
        <v-btn
          icon
          @click="closeWindowEditor"
          variant="text"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-alert
          type="info"
          variant="tonal"
          class="mb-4"
        >
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
              :rules="[v => v >= 0 || '座標不能為負數']"
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
              :rules="[v => v >= 0 || '座標不能為負數']"
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
              :rules="[v => v > 0 || '寬度必須大於 0']"
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
              :rules="[v => v > 0 || '高度必須大於 0']"
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
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue'
import axios from 'axios'

const snackbar = inject('snackbar')

// 響應式數據
const windows = ref([])
const loading = ref(false)
const windowStatus = ref({
  isLocked: false,
  lockedWindowTitle: '',
  isLockedWindowActive: false
})

// 視窗編輯相關
const windowEditorVisible = ref(false)
const selectedWindow = ref(null)
const windowEditor = ref({
  x: 0,
  y: 0,
  width: 0,
  height: 0
})

            // 折疊狀態
            const isExpanded = ref(false)

// 初始化時設定預設值
const initializeData = () => {
  windows.value = []
  windowStatus.value = {
    isLocked: false,
    lockedWindowTitle: '',
    isLockedWindowActive: false
  }
}

// 表格標題
const headers = [
  { title: '視窗標題', key: 'title', sortable: true },
  { title: '類別', key: 'className', sortable: true },
  { title: '位置', key: 'position', sortable: false },
  { title: '大小', key: 'size', sortable: false },
  { title: '操作', key: 'actions', sortable: false, width: '200px' }
]

// 安全地獲取資料項的值
const getItemValue = (item, key) => {
  if (item && item.raw) {
    return item.raw[key]
  }
  if (item && item[key] !== undefined) {
    return item[key]
  }
  return null
}

// 安全地獲取完整的資料項
const getItemData = (item) => {
  if (item && item.raw) {
    return item.raw
  }
  return item
}

// 獲取視窗列表
const refreshWindows = async () => {
  loading.value = true
  try {
    const response = await axios.get('http://localhost:8080/api/window/list')
    if (response.data && Array.isArray(response.data)) {
      windows.value = response.data
    } else {
      windows.value = []
    }
    await getWindowStatus()
  } catch (error) {
    console.error('獲取視窗列表失敗:', error)
    windows.value = []
    snackbar.value = {
      show: true,
      text: '獲取視窗列表失敗，請確保後端服務正在運行',
      color: 'error'
    }
  } finally {
    loading.value = false
  }
}

// 獲取視窗狀態
const getWindowStatus = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/window/status')
    if (response.data) {
      windowStatus.value = response.data
    }
  } catch (error) {
    console.error('獲取視窗狀態失敗:', error)
    // 不顯示錯誤訊息，因為這是在背景定期執行的
  }
}

// 鎖定視窗
const lockWindow = async (window) => {
  try {
    const response = await axios.post('http://localhost:8080/api/window/lock', null, {
      params: { windowHandle: window.handle }
    })
    
    if (response.status === 200) {
      snackbar.value = {
        show: true,
        text: `視窗已鎖定: ${window.title}`,
        color: 'success'
      }
      await getWindowStatus()
    }
  } catch (error) {
    console.error('鎖定視窗失敗:', error)
    snackbar.value = {
      show: true,
      text: error.response?.data || '鎖定視窗失敗',
      color: 'error'
    }
  }
}

// 解鎖視窗
const unlockWindow = async () => {
  try {
    const response = await axios.post('http://localhost:8080/api/window/unlock')
    
    if (response.status === 200) {
      snackbar.value = {
        show: true,
        text: '視窗已解鎖',
        color: 'success'
      }
      await getWindowStatus()
    }
  } catch (error) {
    console.error('解鎖視窗失敗:', error)
    snackbar.value = {
      show: true,
      text: error.response?.data || '解鎖視窗失敗',
      color: 'error'
    }
  }
}

// 將視窗帶到前台
const bringToFront = async (window) => {
  try {
    // 檢查是否有鎖定的視窗
    if (!windowStatus.value.isLocked) {
      snackbar.value = {
        show: true,
        text: '請先鎖定一個視窗',
        color: 'warning'
      }
      return
    }
    
    const response = await axios.post('http://localhost:8080/api/window/bring-to-front')
    
    if (response.status === 200) {
      snackbar.value = {
        show: true,
        text: '視窗已帶到前台',
        color: 'success'
      }
    }
  } catch (error) {
    console.error('將視窗帶到前台失敗:', error)
    const errorMessage = error.response?.data || '將視窗帶到前台失敗'
    snackbar.value = {
      show: true,
      text: errorMessage,
      color: 'error'
    }
  }
}

                         // 快捷鍵處理
             const handleKeyDown = (event) => {
               // F11: 解鎖視窗
               if (event.key === 'F11') {
                 event.preventDefault()
                 if (windowStatus.value.isLocked) {
                   unlockWindow()
                 }
               }
               
               // F12: 將鎖定視窗帶到前台
               if (event.key === 'F12') {
                 event.preventDefault()
                 if (windowStatus.value.isLocked) {
                   bringToFront(null) // 傳入 null 因為不需要特定視窗
                 } else {
                   snackbar.value = {
                     show: true,
                     text: '請先播放腳本來鎖定視窗',
                     color: 'warning'
                   }
                 }
               }
             }

// 生命週期
onMounted(() => {
  initializeData()
  refreshWindows()
  window.addEventListener('keydown', handleKeyDown)
  
  // 定期更新視窗狀態
  const statusInterval = setInterval(getWindowStatus, 2000)
  
  onUnmounted(() => {
    clearInterval(statusInterval)
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// 折疊功能
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

// 視窗編輯功能
const openWindowEditor = (window) => {
  selectedWindow.value = window
  windowEditor.value = {
    x: window.x,
    y: window.y,
    width: window.width,
    height: window.height
  }
  windowEditorVisible.value = true
}

const closeWindowEditor = () => {
  windowEditorVisible.value = false
  selectedWindow.value = null
}

const resetWindowPosition = () => {
  if (selectedWindow.value) {
    windowEditor.value.x = selectedWindow.value.x
    windowEditor.value.y = selectedWindow.value.y
  }
}

const saveWindowChanges = async () => {
  if (!selectedWindow.value) return

  try {
    // 檢查是否有位置或大小變更
    const hasPositionChange = windowEditor.value.x !== selectedWindow.value.x || 
                             windowEditor.value.y !== selectedWindow.value.y
    const hasSizeChange = windowEditor.value.width !== selectedWindow.value.width || 
                         windowEditor.value.height !== selectedWindow.value.height

    if (hasPositionChange && hasSizeChange) {
      // 同時修改位置和大小
      const response = await axios.post('http://localhost:8080/api/window/set-position', null, {
        params: {
          windowHandle: selectedWindow.value.handle,
          x: windowEditor.value.x,
          y: windowEditor.value.y,
          width: windowEditor.value.width,
          height: windowEditor.value.height
        }
      })
      if (response.status === 200) {
        snackbar.value = {
          show: true,
          text: '視窗位置和大小修改成功',
          color: 'success'
        }
      }
    } else if (hasPositionChange) {
      // 只修改位置
      const response = await axios.post('http://localhost:8080/api/window/set-position', null, {
        params: {
          windowHandle: selectedWindow.value.handle,
          x: windowEditor.value.x,
          y: windowEditor.value.y
        }
      })
      if (response.status === 200) {
        snackbar.value = {
          show: true,
          text: '視窗位置修改成功',
          color: 'success'
        }
      }
    } else if (hasSizeChange) {
      // 只修改大小
      const response = await axios.post('http://localhost:8080/api/window/set-size', null, {
        params: {
          windowHandle: selectedWindow.value.handle,
          width: windowEditor.value.width,
          height: windowEditor.value.height
        }
      })
      if (response.status === 200) {
        snackbar.value = {
          show: true,
          text: '視窗大小修改成功',
          color: 'success'
        }
      }
    } else {
      snackbar.value = {
        show: true,
        text: '沒有變更需要儲存',
        color: 'info'
      }
      return
    }

    // 重新整理視窗列表
    await refreshWindows()
    closeWindowEditor()
  } catch (error) {
    console.error('修改視窗失敗:', error)
    snackbar.value = {
      show: true,
      text: error.response?.data || '修改視窗失敗',
      color: 'error'
    }
  }
}
</script>

<style scoped>
.v-data-table {
  max-height: 350px;
  overflow-y: auto;
}

.v-card-title {
  cursor: pointer;
  user-select: none;
}

.v-card-title:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

/* 緊湊表格樣式 */
.compact-table {
  font-size: 0.875rem;
}

.compact-table .v-data-table__td {
  padding: 8px 12px;
}

.compact-table .v-data-table__th {
  padding: 8px 12px;
  font-size: 0.8rem;
}

/* 小螢幕優化 */
@media (max-width: 768px) {
  .compact-table {
    font-size: 0.8rem;
  }
  
  .compact-table .v-data-table__td {
    padding: 6px 8px;
  }
  
  .compact-table .v-data-table__th {
    padding: 6px 8px;
    font-size: 0.75rem;
  }
}

/* 按鈕組優化 */
.v-btn--size-x-small {
  min-width: auto;
  padding: 0 8px;
  font-size: 0.75rem;
}

/* 文字截斷優化 */
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
