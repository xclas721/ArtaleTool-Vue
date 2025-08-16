<template>
  <router-view />
</template>

<script setup>
// 空的 script setup，因為路由會處理所有頁面
</script>

<style>
.v-application {
  font-family: "Microsoft JhengHei", sans-serif !important;
  font-size: 0.875rem !important;
}

.v-main {
  background-color: #f5f5f5;
}

/* 全域字體大小調整 */
* {
  font-size: 0.875rem !important;
}

/* 標題字體調整 */
.text-h1 {
  font-size: 1.5rem !important;
}
.text-h2 {
  font-size: 1.25rem !important;
}
.text-h3 {
  font-size: 1.125rem !important;
}
.text-h4 {
  font-size: 1rem !important;
}
.text-h5 {
  font-size: 0.875rem !important;
}
.text-h6 {
  font-size: 0.8rem !important;
}

/* 按鈕大小調整 */
.v-btn {
  font-size: 0.8rem !important;
  height: auto !important;
  min-height: 24px !important;
}

.v-btn--size-small {
  font-size: 0.75rem !important;
  min-height: 20px !important;
}

.v-btn--size-x-small {
  font-size: 0.7rem !important;
  min-height: 18px !important;
}

/* 輸入框調整 */
.v-text-field {
  font-size: 0.8rem !important;
}

.v-text-field .v-field__input {
  font-size: 0.8rem !important;
  min-height: 32px !important;
}

/* 定時按鈕輸入框的字體調整 */
.v-text-field .v-field__prefix,
.v-text-field .v-field__suffix {
  font-size: 0.7rem !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* 表格調整 */
.v-data-table {
  font-size: 0.8rem !important;
}

.v-data-table .v-data-table__td {
  padding: 6px 8px !important;
}

.v-data-table .v-data-table__th {
  padding: 6px 8px !important;
  font-size: 0.75rem !important;
}

/* 卡片調整 */
.v-card-title {
  font-size: 0.9rem !important;
  padding: 12px 16px !important;
}

.v-card-text {
  font-size: 0.8rem !important;
  padding: 12px 16px !important;
}

/* 對話框調整 */
.v-dialog .v-card-title {
  font-size: 0.9rem !important;
  padding: 12px 16px !important;
}

.v-dialog .v-card-text {
  font-size: 0.8rem !important;
  padding: 12px 16px !important;
}

/* 選單調整 */
.v-menu .v-list-item {
  font-size: 0.8rem !important;
  min-height: 32px !important;
}

/* 標籤調整 */
.v-label {
  font-size: 0.8rem !important;
}

/* 工具提示調整 */
.v-tooltip {
  font-size: 0.75rem !important;
}

/* 警告框調整 */
.v-alert {
  font-size: 0.8rem !important;
}

.v-alert .v-alert__content {
  font-size: 0.8rem !important;
}

/* 分頁調整 */
.v-pagination {
  font-size: 0.8rem !important;
}

.v-pagination .v-btn {
  font-size: 0.75rem !important;
  min-width: 28px !important;
  min-height: 28px !important;
}

/* 展開面板調整 */
.v-expansion-panel-title {
  font-size: 0.85rem !important;
  min-height: 40px !important;
}

.v-expansion-panel-text {
  font-size: 0.8rem !important;
  padding: 8px 16px !important;
}

/* 列表調整 */
.v-list-item {
  font-size: 0.8rem !important;
  min-height: 36px !important;
}

.v-list-item-title {
  font-size: 0.8rem !important;
}

.v-list-item-subtitle {
  font-size: 0.75rem !important;
}

/* 容器調整 */
.v-container {
  padding: 8px !important;
}

/* 欄位調整 */
.v-col {
  padding: 4px !important;
}

/* 行調整 */
.v-row {
  margin: -4px !important;
}
</style>
