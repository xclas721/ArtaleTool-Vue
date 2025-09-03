<template>
  <v-card class="mb-4">
    <v-card-title class="d-flex justify-space-between align-center">
      <div class="d-flex align-center">
        <v-icon start>mdi-mouse</v-icon>
        <span class="text-h6">滑鼠面板</span>
      </div>
      <v-btn
        color="primary"
        @click="goHome"
        prepend-icon="mdi-home"
        size="small"
        class="font-weight-bold"
      >
        返回首頁
      </v-btn>
    </v-card-title>
    <v-card-text>
      <!-- 滑鼠錄製控制 -->
      <v-card variant="outlined" class="mb-4">
        <v-card-text>
          <div class="d-flex align-center mb-2">
            <v-icon start color="purple">mdi-mouse</v-icon>
            <span class="font-weight-bold">滑鼠錄製控制</span>
          </div>
          <v-btn-group class="mb-3">
            <v-btn
              color="purple"
              :disabled="isMouseRecording"
              @click="startMouseRecording"
              prepend-icon="mdi-record"
              size="small"
              class="font-weight-bold"
            >
              開始錄製(F1)
            </v-btn>
            <v-btn
              color="error"
              :disabled="!isMouseRecording"
              @click="stopMouseRecording"
              prepend-icon="mdi-stop"
              size="small"
              class="font-weight-bold"
            >
              停止錄製(F2)
            </v-btn>
            <v-btn
              color="primary"
              :disabled="!recordedMouseEvents.length"
              @click="saveMouseScript"
              prepend-icon="mdi-content-save"
              size="small"
              class="font-weight-bold"
            >
              儲存腳本
            </v-btn>
          </v-btn-group>
        </v-card-text>
      </v-card>

      <!-- 滑鼠播放控制 -->
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
                v-model="isMouseLooping"
                label="循環播放"
                :disabled="isMousePlaying"
                color="primary"
                hide-details
                class="mb-2"
                density="compact"
              ></v-switch>
              <v-text-field
                v-if="isMouseLooping"
                v-model="mouseLoopCount"
                label="循環次數 (0=無限)"
                type="number"
                min="0"
                :disabled="isMousePlaying"
                hide-details
                class="mb-2"
                density="compact"
                variant="outlined"
              ></v-text-field>
              <v-btn-group>
                <v-btn
                  color="teal"
                  :disabled="!loadedMouseScript || isMousePlaying"
                  @click="playMouseScript"
                  prepend-icon="mdi-play"
                  size="small"
                  class="font-weight-bold"
                >
                  播放腳本
                </v-btn>
                <v-btn
                  color="warning"
                  :disabled="!isMousePlaying"
                  @click="pauseMouseScript"
                  prepend-icon="mdi-pause"
                  size="small"
                  class="font-weight-bold"
                >
                  暫停
                </v-btn>
                <v-btn
                  color="error"
                  :disabled="!isMousePlaying"
                  @click="stopMouseScript"
                  prepend-icon="mdi-stop"
                  size="small"
                  class="font-weight-bold"
                >
                  停止
                </v-btn>
              </v-btn-group>
            </v-col>

            <!-- 播放設定 -->
            <v-col cols="4">
              <div class="d-flex align-center mb-2">
                <v-icon start color="green">mdi-cog</v-icon>
                <span class="font-weight-bold">播放設定</span>
              </div>
              <v-text-field
                v-model="mousePlaybackSpeed"
                label="播放速度倍率"
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                :disabled="isMousePlaying"
                hide-details
                class="mb-2"
                density="compact"
                variant="outlined"
              ></v-text-field>
              <v-text-field
                v-model="mouseDelayOffset"
                label="延遲偏移 (毫秒)"
                type="number"
                min="-1000"
                max="1000"
                step="50"
                :disabled="isMousePlaying"
                hide-details
                class="mb-2"
                density="compact"
                variant="outlined"
              ></v-text-field>
            </v-col>

            <!-- 狀態顯示 -->
            <v-col cols="4">
              <div class="d-flex align-center mb-2">
                <v-icon start color="orange">mdi-information</v-icon>
                <span class="font-weight-bold">狀態資訊</span>
              </div>
              <div class="text-body-2">
                <div class="mb-1">
                  <strong>錄製狀態:</strong>
                  <v-chip
                    :color="isMouseRecording ? 'error' : 'success'"
                    size="small"
                    class="ml-2"
                  >
                    {{ isMouseRecording ? '錄製中' : '未錄製' }}
                  </v-chip>
                </div>
                <div class="mb-1">
                  <strong>播放狀態:</strong>
                  <v-chip
                    :color="isMousePlaying ? 'warning' : 'success'"
                    size="small"
                    class="ml-2"
                  >
                    {{ isMousePlaying ? '播放中' : '未播放' }}
                  </v-chip>
                </div>
                <div class="mb-1">
                  <strong>已錄製事件:</strong>
                  <v-chip color="info" size="small" class="ml-2">
                    {{ recordedMouseEvents.length }}
                  </v-chip>
                </div>
                <div class="mb-1">
                  <strong>已載入腳本:</strong>
                  <v-chip
                    :color="loadedMouseScript ? 'success' : 'grey'"
                    size="small"
                    class="ml-2"
                  >
                    {{ loadedMouseScript ? '已載入' : '未載入' }}
                  </v-chip>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- 腳本管理 -->
      <v-card variant="outlined" class="mb-4">
        <v-card-text>
          <div class="d-flex align-center mb-3">
            <v-icon start color="indigo">mdi-file-document</v-icon>
            <span class="font-weight-bold">腳本管理</span>
          </div>
          <v-row>
            <v-col cols="6">
              <v-file-input
                v-model="mouseScriptFile"
                label="載入腳本檔案"
                accept=".json"
                prepend-icon="mdi-file-upload"
                hide-details
                class="mb-3"
                density="compact"
                variant="outlined"
                @change="loadMouseScriptFromFile"
              ></v-file-input>
              <v-btn
                color="info"
                @click="exportMouseScript"
                prepend-icon="mdi-download"
                size="small"
                class="font-weight-bold"
                :disabled="!recordedMouseEvents.length"
              >
                匯出腳本
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="mouseScriptName"
                label="腳本名稱"
                placeholder="輸入腳本名稱"
                hide-details
                class="mb-3"
                density="compact"
                variant="outlined"
              ></v-text-field>
              <v-btn
                color="success"
                @click="saveMouseScriptAs"
                prepend-icon="mdi-content-save-as"
                size="small"
                class="font-weight-bold"
                :disabled="!recordedMouseEvents.length || !mouseScriptName"
              >
                另存為
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- 錄製事件列表 -->
      <v-card variant="outlined" class="mb-4">
        <v-card-text>
          <div class="d-flex align-center mb-3">
            <v-icon start color="deep-purple">mdi-format-list-bulleted</v-icon>
            <span class="font-weight-bold">錄製事件列表</span>
            <v-spacer></v-spacer>
            <v-btn
              color="error"
              variant="outlined"
              size="small"
              @click="clearMouseEvents"
              prepend-icon="mdi-delete"
              :disabled="!recordedMouseEvents.length"
            >
              清空列表
            </v-btn>
          </div>
          <v-data-table
            :headers="mouseEventHeaders"
            :items="recordedMouseEvents"
            :items-per-page="10"
            class="elevation-1"
            density="compact"
          >
            <template v-slot:item.type="{ item }">
              <v-chip
                :color="getMouseEventTypeColor(item.type)"
                size="small"
                class="font-weight-bold"
              >
                {{ getMouseEventTypeText(item.type) }}
              </v-chip>
            </template>
            <template v-slot:item.button="{ item }">
              <v-chip
                :color="getMouseButtonColor(item.button)"
                size="small"
                class="font-weight-bold"
              >
                {{ getMouseButtonText(item.button) }}
              </v-chip>
            </template>
            <template v-slot:item.timestamp="{ item }">
              <span class="text-caption">{{ formatTimestamp(item.timestamp) }}</span>
            </template>
            <template v-slot:item.actions="{ item, index }">
              <v-btn
                icon="mdi-delete"
                size="small"
                color="error"
                variant="text"
                @click="removeMouseEvent(index)"
              ></v-btn>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>

      <!-- 即時滑鼠位置顯示 -->
      <v-card variant="outlined" class="mb-4">
        <v-card-text>
          <div class="d-flex align-center mb-2">
            <v-icon start color="teal">mdi-crosshairs-gps</v-icon>
            <span class="font-weight-bold">即時滑鼠位置</span>
          </div>
          <v-row>
            <v-col cols="3">
              <v-text-field
                v-model="currentMouseX"
                label="X 座標"
                readonly
                hide-details
                density="compact"
                variant="outlined"
                prepend-icon="mdi-arrow-right"
              ></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-text-field
                v-model="currentMouseY"
                label="Y 座標"
                readonly
                hide-details
                density="compact"
                variant="outlined"
                prepend-icon="mdi-arrow-down"
              ></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-text-field
                v-model="currentMouseButton"
                label="按鍵狀態"
                readonly
                hide-details
                density="compact"
                variant="outlined"
                prepend-icon="mdi-mouse"
              ></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-text-field
                v-model="currentMouseWheel"
                label="滾輪狀態"
                readonly
                hide-details
                density="compact"
                variant="outlined"
                prepend-icon="mdi-mouse-scroll"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- 進階設定 -->
      <v-card variant="outlined" class="mb-4">
        <v-card-text>
          <div class="d-flex align-center mb-3">
            <v-icon start color="brown">mdi-tune</v-icon>
            <span class="font-weight-bold">進階設定</span>
          </div>
          <v-row>
            <v-col cols="4">
              <v-switch
                v-model="enableMouseHotkeys"
                label="啟用熱鍵"
                color="primary"
                hide-details
                class="mb-2"
                density="compact"
              ></v-switch>
              <v-switch
                v-model="enableMouseRecording"
                label="啟用錄製"
                color="primary"
                hide-details
                class="mb-2"
                density="compact"
              ></v-switch>
            </v-col>
            <v-col cols="4">
              <v-switch
                v-model="enableMousePlayback"
                label="啟用播放"
                color="primary"
                hide-details
                class="mb-2"
                density="compact"
              ></v-switch>
              <v-switch
                v-model="enableMousePositionTracking"
                label="啟用位置追蹤"
                color="primary"
                hide-details
                class="mb-2"
                density="compact"
              ></v-switch>
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model="mouseRecordingInterval"
                label="錄製間隔 (毫秒)"
                type="number"
                min="10"
                max="1000"
                step="10"
                hide-details
                density="compact"
                variant="outlined"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'MousePanel',
  data() {
    return {
      // 錄製狀態
      isMouseRecording: false,
      recordedMouseEvents: [],
      
      // 播放狀態
      isMousePlaying: false,
      isMouseLooping: false,
      mouseLoopCount: 1,
      mousePlaybackSpeed: 1.0,
      mouseDelayOffset: 0,
      
      // 腳本管理
      loadedMouseScript: null,
      mouseScriptFile: null,
      mouseScriptName: '',
      
      // 即時位置
      currentMouseX: 0,
      currentMouseY: 0,
      currentMouseButton: '無',
      currentMouseWheel: '無',
      
      // 進階設定
      enableMouseHotkeys: true,
      enableMouseRecording: true,
      enableMousePlayback: true,
      enableMousePositionTracking: true,
      mouseRecordingInterval: 50,
      
      // 表格標題
      mouseEventHeaders: [
        { title: '類型', key: 'type', sortable: true },
        { title: '按鍵', key: 'button', sortable: true },
        { title: 'X 座標', key: 'x', sortable: true },
        { title: 'Y 座標', key: 'y', sortable: true },
        { title: '時間戳', key: 'timestamp', sortable: true },
        { title: '延遲', key: 'delay', sortable: true },
        { title: '操作', key: 'actions', sortable: false }
      ]
    };
  },
  
  mounted() {
    this.initializeMousePanel();
  },
  
  methods: {
    initializeMousePanel() {
      // 初始化滑鼠面板
      console.log('滑鼠面板已初始化');
      
      // 設定熱鍵監聽
      if (this.enableMouseHotkeys) {
        this.setupMouseHotkeys();
      }
      
      // 開始位置追蹤
      if (this.enableMousePositionTracking) {
        this.startMousePositionTracking();
      }
    },
    
    setupMouseHotkeys() {
      // 設定 F1 開始錄製，F2 停止錄製
      document.addEventListener('keydown', (event) => {
        if (event.key === 'F1' && this.enableMouseHotkeys) {
          event.preventDefault();
          this.startMouseRecording();
        } else if (event.key === 'F2' && this.enableMouseHotkeys) {
          event.preventDefault();
          this.stopMouseRecording();
        }
      });
    },
    
    startMousePositionTracking() {
      // 開始追蹤滑鼠位置
      setInterval(() => {
        if (this.enableMousePositionTracking) {
          // 這裡應該從後端獲取滑鼠位置
          // 暫時使用模擬數據
          this.currentMouseX = Math.floor(Math.random() * 1920);
          this.currentMouseY = Math.floor(Math.random() * 1080);
        }
      }, 100);
    },
    
    startMouseRecording() {
      if (!this.enableMouseRecording) return;
      
      this.isMouseRecording = true;
      this.recordedMouseEvents = [];
      console.log('開始錄製滑鼠事件');
      
      // 這裡應該連接到後端開始錄製
      // 暫時使用模擬數據
      this.simulateMouseRecording();
    },
    
    stopMouseRecording() {
      this.isMouseRecording = false;
      console.log('停止錄製滑鼠事件');
      console.log('已錄製事件數量:', this.recordedMouseEvents.length);
    },
    
    simulateMouseRecording() {
      // 模擬錄製滑鼠事件（僅用於測試）
      const simulateEvent = () => {
        if (this.isMouseRecording) {
          const event = {
            type: Math.random() > 0.5 ? 'click' : 'move',
            button: Math.random() > 0.5 ? 'left' : 'right',
            x: Math.floor(Math.random() * 1920),
            y: Math.floor(Math.random() * 1080),
            timestamp: Date.now(),
            delay: Math.floor(Math.random() * 100)
          };
          
          this.recordedMouseEvents.push(event);
          
          // 繼續模擬
          setTimeout(simulateEvent, this.mouseRecordingInterval);
        }
      };
      
      simulateEvent();
    },
    
    playMouseScript() {
      if (!this.loadedMouseScript || this.isMousePlaying) return;
      
      this.isMousePlaying = true;
      console.log('開始播放滑鼠腳本');
      
      // 這裡應該連接到後端播放腳本
      // 暫時使用模擬播放
      this.simulateMousePlayback();
    },
    
    pauseMouseScript() {
      this.isMousePlaying = false;
      console.log('暫停播放滑鼠腳本');
    },
    
    stopMouseScript() {
      this.isMousePlaying = false;
      console.log('停止播放滑鼠腳本');
    },
    
    simulateMousePlayback() {
      // 模擬播放滑鼠腳本（僅用於測試）
      let currentIndex = 0;
      
      const playNextEvent = () => {
        if (!this.isMousePlaying || currentIndex >= this.recordedMouseEvents.length) {
          this.isMousePlaying = false;
          console.log('播放完成');
          return;
        }
        
        const event = this.recordedMouseEvents[currentIndex];
        console.log('播放事件:', event);
        
        currentIndex++;
        
        // 計算下一個事件的延遲
        const delay = event.delay * this.mousePlaybackSpeed + this.mouseDelayOffset;
        setTimeout(playNextEvent, delay);
      };
      
      playNextEvent();
    },
    
    saveMouseScript() {
      if (!this.recordedMouseEvents.length) return;
      
      const script = {
        name: this.mouseScriptName || '未命名腳本',
        events: this.recordedMouseEvents,
        createdAt: new Date().toISOString(),
        version: '1.0'
      };
      
      // 下載腳本檔案
      const blob = new Blob([JSON.stringify(script, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${script.name}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      console.log('腳本已儲存');
    },
    
    saveMouseScriptAs() {
      if (!this.recordedMouseEvents.length || !this.mouseScriptName) return;
      this.saveMouseScript();
    },
    
    exportMouseScript() {
      this.saveMouseScript();
    },
    
    loadMouseScriptFromFile(file) {
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const script = JSON.parse(e.target.result);
          this.loadedMouseScript = script;
          this.recordedMouseEvents = script.events || [];
          this.mouseScriptName = script.name || '';
          console.log('腳本已載入:', script);
        } catch (error) {
          console.error('載入腳本失敗:', error);
          alert('載入腳本失敗，請檢查檔案格式');
        }
      };
      reader.readAsText(file);
    },
    
    clearMouseEvents() {
      this.recordedMouseEvents = [];
      this.loadedMouseScript = null;
      console.log('已清空事件列表');
    },
    
    removeMouseEvent(index) {
      this.recordedMouseEvents.splice(index, 1);
      console.log('已移除事件，索引:', index);
    },
    
    goHome() {
      this.$router.push('/');
    },
    
    // 輔助方法
    getMouseEventTypeColor(type) {
      const colors = {
        'click': 'primary',
        'move': 'info',
        'drag': 'warning',
        'scroll': 'success'
      };
      return colors[type] || 'grey';
    },
    
    getMouseEventTypeText(type) {
      const texts = {
        'click': '點擊',
        'move': '移動',
        'drag': '拖拽',
        'scroll': '滾輪'
      };
      return texts[type] || type;
    },
    
    getMouseButtonColor(button) {
      const colors = {
        'left': 'blue',
        'right': 'red',
        'middle': 'green'
      };
      return colors[button] || 'grey';
    },
    
    getMouseButtonText(button) {
      const texts = {
        'left': '左鍵',
        'right': '右鍵',
        'middle': '中鍵'
      };
      return texts[button] || button;
    },
    
    formatTimestamp(timestamp) {
      return new Date(timestamp).toLocaleTimeString();
    }
  }
};
</script>

<style scoped>
.v-data-table {
  max-height: 400px;
  overflow-y: auto;
}

.v-btn-group .v-btn {
  margin-right: 4px;
}

.v-btn-group .v-btn:last-child {
  margin-right: 0;
}
</style>
