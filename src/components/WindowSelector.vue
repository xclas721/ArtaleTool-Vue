<template>
  <v-dialog v-model="dialog" max-width="800px" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <div class="d-flex align-center">
          <v-icon start>mdi-window-maximize</v-icon>
          <span class="text-h6">選擇要鎖定的視窗</span>
        </div>
        <v-btn
          icon
          @click="closeDialog"
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
             <strong>重要提示：</strong>選擇的視窗將被鎖定並自動帶到前台，腳本只會在該視窗中執行。
             <div class="text-caption mt-1">
               建議選擇腳本錄製時的目標視窗，以確保操作準確性。
             </div>
           </div>
        </v-alert>

        <!-- 視窗列表 -->
        <v-data-table
          :headers="headers"
          :items="windows"
          :loading="loading"
          class="elevation-1"
          density="compact"
          hover
          :items-per-page="8"
          :items-per-page-options="[5, 8, 15, 30]"
          @click:row="selectWindow"
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
                style="max-width: 300px"
                :title="getItemValue(item, 'title')"
              >
                {{ getItemValue(item, 'title') }}
              </span>
            </div>
          </template>

          <template v-slot:item.className="{ item }">
            <span class="text-caption text-grey">{{ getItemValue(item, 'className') }}</span>
          </template>

          <template v-slot:item.size="{ item }">
            <span class="text-caption">
              {{ getItemValue(item, 'width') }} × {{ getItemValue(item, 'height') }}
            </span>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn
              color="primary"
              variant="outlined"
              size="small"
              @click.stop="selectWindow(getItemData(item))"
              prepend-icon="mdi-check"
            >
              選擇
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
      </v-card-text>
      
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          variant="text"
          @click="closeDialog"
        >
          取消
        </v-btn>
        <v-btn
          color="warning"
          variant="text"
          @click="playWithoutLock"
          prepend-icon="mdi-play-circle"
        >
          不鎖定視窗播放
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import axios from 'axios'

const snackbar = inject('snackbar')

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'window-selected', 'play-without-lock'])

// 響應式數據
const dialog = ref(false)
const windows = ref([])
const loading = ref(false)

// 表格標題
const headers = [
  { title: '視窗標題', key: 'title', sortable: true },
  { title: '類別名稱', key: 'className', sortable: true },
  { title: '大小', key: 'size', sortable: false },
  { title: '操作', key: 'actions', sortable: false, width: '120px' }
]

// 監聽 modelValue 變化
const updateDialog = (value) => {
  dialog.value = value
  if (value) {
    refreshWindows()
  }
}

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

// 選擇視窗
const selectWindow = async (window) => {
  try {
    // 先鎖定視窗
    const lockResponse = await axios.post('http://localhost:8080/api/window/lock', null, {
      params: { windowHandle: window.handle }
    })
    
    if (lockResponse.status === 200) {
      // 再將視窗帶到前台
      const frontResponse = await axios.post('http://localhost:8080/api/window/bring-to-front')
      
      if (frontResponse.status === 200) {
        snackbar.value = {
          show: true,
          text: `已鎖定並將視窗帶到前台: ${window.title}`,
          color: 'success'
        }
      } else {
        snackbar.value = {
          show: true,
          text: `已鎖定視窗: ${window.title}`,
          color: 'success'
        }
      }
      
      emit('window-selected', window)
      closeDialog()
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

// 不鎖定視窗播放
const playWithoutLock = () => {
  emit('play-without-lock')
  closeDialog()
}

// 關閉對話框
const closeDialog = () => {
  dialog.value = false
  emit('update:modelValue', false)
}

// 監聽 props 變化
import { watch } from 'vue'
watch(() => props.modelValue, updateDialog)
</script>

<style scoped>
.v-data-table {
  max-height: 400px;
  overflow-y: auto;
}
</style>
