# 資料庫架構設計 - Google Sheets Schema

## 📊 總覽

本系統使用 Google Sheets 作為資料庫，透過 Google Sheets API 進行資料操作。所有資料表都在同一個試算表檔案中，以不同的工作表 (worksheets) 區分。

**試算表檔案**: `海盜大叔收費管理系統`  
**Google Sheets ID**: `將由實際建立時產生`  
**服務帳戶權限**: `https://www.googleapis.com/auth/spreadsheets` (讀寫權限)

## 🗂 工作表架構總覽

```
海盜大叔收費管理系統.xlsx
├── 可註冊人員列表 (AuthorizedMembers)
├── 已註冊成員 (RegisteredMembers)  
├── 待審核申請 (PendingRegistrations)
├── 活動管理 (Events)
├── 收費追蹤 (PaymentTracking)
├── 交易記錄 (Transactions) - 擴充現有
└── 相簿 (Albums) - 保持現有
```

## 📋 詳細資料表設計

### 1. 可註冊人員列表 (AuthorizedMembers)

**目的**: 管控誰可以註冊使用系統，由管理員維護  
**工作表名稱**: `可註冊人員列表`

| 欄位 | 型別 | 說明 | 範例 | 必填 |
|------|------|------|------|------|
| A: ID | 數字 | 自動編號 | 1, 2, 3... | ✅ |
| B: RealName | 文字 | 真實姓名，用於配對 | 王小明 | ✅ |
| C: LineDisplayName | 文字 | LINE 顯示名稱，輔助配對 | 小明 | ❌ |
| D: Phone | 文字 | 手機號碼 | 0912345678 | ❌ |
| E: Role | 文字 | 預設角色 | admin/collector/member | ✅ |
| F: Department | 文字 | 部門或組別 | 財務組, 活動組 | ❌ |
| G: AuthorizedBy | 文字 | 授權人 | 管理員A | ✅ |
| H: AuthorizedDate | 日期 | 授權日期 | 2025-08-17 | ✅ |
| I: Status | 文字 | 狀態 | active/inactive | ✅ |
| J: Notes | 文字 | 備註 | 新加入成員 | ❌ |

**資料驗證規則**:
```
E欄 (Role): 下拉選單 = admin,collector,member
I欄 (Status): 下拉選單 = active,inactive
H欄 (AuthorizedDate): 日期格式 YYYY-MM-DD
```

### 2. 已註冊成員 (RegisteredMembers)

**目的**: 儲存已完成 LINE 認證的成員資料  
**工作表名稱**: `已註冊成員`

| 欄位 | 型別 | 說明 | 範例 | 必填 |
|------|------|------|------|------|
| A: MemberID | 數字 | 自動編號 | 1, 2, 3... | ✅ |
| B: LineUserID | 文字 | LINE 使用者 ID (唯一) | U1234567890abcdef | ✅ |
| C: LineDisplayName | 文字 | LINE 顯示名稱 | 王小明 | ✅ |
| D: LinePictureURL | 文字 | LINE 頭像網址 | https://profile.line-scdn.net/... | ❌ |
| E: RealName | 文字 | 配對後的真實姓名 | 王小明 | ✅ |
| F: Role | 文字 | 實際角色 | admin/collector/member | ✅ |
| G: RegisterDate | 日期時間 | 註冊日期 | 2025-08-17 14:30:00 | ✅ |
| H: LastLoginDate | 日期時間 | 最後登入 | 2025-08-17 15:45:00 | ✅ |
| I: Status | 文字 | 狀態 | active/inactive | ✅ |
| J: MatchedFromID | 數字 | 來自可註冊清單的 ID | 5 | ✅ |

**資料驗證規則**:
```
B欄 (LineUserID): 唯一值檢查
F欄 (Role): 下拉選單 = admin,collector,member
I欄 (Status): 下拉選單 = active,inactive
G,H欄: 日期時間格式 YYYY-MM-DD HH:MM:SS
```

### 3. 待審核申請 (PendingRegistrations)

**目的**: 暫存無法自動配對的註冊申請，等待管理員審核  
**工作表名稱**: `待審核申請`

| 欄位 | 型別 | 說明 | 範例 | 必填 |
|------|------|------|------|------|
| A: RequestID | 數字 | 申請編號 | 1, 2, 3... | ✅ |
| B: LineUserID | 文字 | LINE 使用者 ID | U1234567890abcdef | ✅ |
| C: LineDisplayName | 文字 | LINE 顯示名稱 | 王小明 | ✅ |
| D: LinePictureURL | 文字 | LINE 頭像網址 | https://profile.line-scdn.net/... | ❌ |
| E: RequestDate | 日期時間 | 申請時間 | 2025-08-17 14:30:00 | ✅ |
| F: Status | 文字 | 審核狀態 | pending/approved/rejected | ✅ |
| G: ReviewedBy | 文字 | 審核人 LINE ID | U0987654321fedcba | ❌ |
| H: ReviewDate | 日期時間 | 審核時間 | 2025-08-17 16:00:00 | ❌ |
| I: SelectedAuthorizedID | 數字 | 選擇的授權清單 ID | 3 | ❌ |
| J: Notes | 文字 | 審核備註 | 確認為王小明(財務組) | ❌ |

**資料驗證規則**:
```
F欄 (Status): 下拉選單 = pending,approved,rejected
E,H欄: 日期時間格式 YYYY-MM-DD HH:MM:SS
```

### 4. 活動管理 (Events)

**目的**: 儲存所有活動的基本資訊和收費設定  
**工作表名稱**: `活動管理`

| 欄位 | 型別 | 說明 | 範例 | 必填 |
|------|------|------|------|------|
| A: EventID | 文字 | 活動編號 | E2025001 | ✅ |
| B: EventName | 文字 | 活動名稱 | 2025夏季聯賽 | ✅ |
| C: EventDate | 日期 | 活動日期 | 2025-08-20 | ✅ |
| D: EventType | 文字 | 活動類型 | 比賽/聚餐/其他 | ✅ |
| E: RequiredAmount | 數字 | 收費金額 | 500 | ✅ |
| F: Description | 文字 | 活動說明 | 夏天最熱血的比賽 | ❌ |
| G: Status | 文字 | 活動狀態 | planning/active/completed/cancelled | ✅ |
| H: CreatedBy | 文字 | 建立者 LINE ID | U1234567890abcdef | ✅ |
| I: CreatedDate | 日期時間 | 建立時間 | 2025-08-17 14:30:00 | ✅ |
| J: UpdatedDate | 日期時間 | 最後更新 | 2025-08-17 15:00:00 | ✅ |
| K: ParticipantCount | 數字 | 參與人數 | 15 | ✅ |
| L: CollectedAmount | 數字 | 已收金額 | 7500 | ✅ |

**資料驗證規則**:
```
A欄 (EventID): 格式 E + YYYY + 3位數字
D欄 (EventType): 下拉選單 = 比賽,聚餐,其他
G欄 (Status): 下拉選單 = planning,active,completed,cancelled
E,K,L欄: 數字格式
C欄: 日期格式 YYYY-MM-DD
I,J欄: 日期時間格式 YYYY-MM-DD HH:MM:SS
```

### 5. 收費追蹤 (PaymentTracking)

**目的**: 追蹤每個活動中每位成員的繳費狀態  
**工作表名稱**: `收費追蹤`

| 欄位 | 型別 | 說明 | 範例 | 必填 |
|------|------|------|------|------|
| A: TrackingID | 文字 | 追蹤編號 | PT2025001001 | ✅ |
| B: EventID | 文字 | 關聯活動 | E2025001 | ✅ |
| C: MemberLineUserID | 文字 | 成員 LINE ID | U1234567890abcdef | ✅ |
| D: MemberDisplayName | 文字 | 成員顯示名稱 | 王小明 | ✅ |
| E: RequiredAmount | 數字 | 應收金額 | 500 | ✅ |
| F: PaidAmount | 數字 | 已收金額 | 500 | ✅ |
| G: PaymentStatus | 文字 | 繳費狀態 | unpaid/partial/paid | ✅ |
| H: PaymentDate | 日期時間 | 繳費時間 | 2025-08-18 09:30:00 | ❌ |
| I: CollectedBy | 文字 | 收費人 LINE ID | U0987654321fedcba | ❌ |
| J: CollectorName | 文字 | 收費人名稱 | 張收費員 | ❌ |
| K: PaymentMethod | 文字 | 付款方式 | cash/transfer/other | ✅ |
| L: Notes | 文字 | 備註 | 現金繳費 | ❌ |
| M: CreatedDate | 日期時間 | 建立時間 | 2025-08-17 14:30:00 | ✅ |
| N: UpdatedDate | 日期時間 | 最後更新 | 2025-08-18 09:30:00 | ✅ |

**資料驗證規則**:
```
A欄 (TrackingID): 格式 PT + EventID 後7碼 + 3位序號
G欄 (PaymentStatus): 下拉選單 = unpaid,partial,paid
K欄 (PaymentMethod): 下拉選單 = cash,transfer,other
E,F欄: 數字格式
H,M,N欄: 日期時間格式 YYYY-MM-DD HH:MM:SS
```

### 6. 交易記錄 (Transactions) - 擴充現有

**目的**: 擴充現有交易記錄，加入收費管理系統整合  
**工作表名稱**: `收支明細` (保持現有名稱)

現有欄位保持不變，新增以下欄位:

| 欄位 | 型別 | 說明 | 範例 | 必填 |
|------|------|------|------|------|
| I: EventID | 文字 | 關聯活動編號 | E2025001 | ❌ |
| J: GeneratedFrom | 文字 | 產生來源 | PaymentTracking/Manual | ✅ |
| K: TrackingID | 文字 | 來源追蹤編號 | PT2025001001 | ❌ |

**資料驗證規則**:
```
J欄 (GeneratedFrom): 下拉選單 = PaymentTracking,Manual
```

### 7. 相簿 (Albums) - 保持現有

**目的**: 保持現有相簿功能不變  
**工作表名稱**: `相簿` (無變更)

現有欄位結構完全保持不變。

## 🔗 資料關聯設計

### 主要關聯關係
```
AuthorizedMembers (1) ← → (1) RegisteredMembers
    ↓ (通過 MatchedFromID)

RegisteredMembers (1) → (N) Events
    ↓ (通過 CreatedBy)

Events (1) → (N) PaymentTracking
    ↓ (通過 EventID)

PaymentTracking (1) → (N) Transactions
    ↓ (通過 TrackingID)

RegisteredMembers (1) → (N) PaymentTracking
    ↓ (通過 MemberLineUserID)
```

### 資料完整性約束
```
外鍵約束 (邏輯層面實作):
- PaymentTracking.EventID → Events.EventID
- PaymentTracking.MemberLineUserID → RegisteredMembers.LineUserID
- Transactions.TrackingID → PaymentTracking.TrackingID
- RegisteredMembers.MatchedFromID → AuthorizedMembers.ID

唯一性約束:
- RegisteredMembers.LineUserID (唯一)
- Events.EventID (唯一)
- PaymentTracking.TrackingID (唯一)
- Transactions.TransactionID (唯一)
```

## 📊 索引策略

由於 Google Sheets 沒有傳統資料庫的索引概念，我們透過以下方式優化查詢效能:

### 資料排序建議
```
AuthorizedMembers: 按 Status, RealName 排序
RegisteredMembers: 按 Status, RegisterDate 排序
Events: 按 EventDate DESC, Status 排序
PaymentTracking: 按 EventID, PaymentStatus, UpdatedDate 排序
Transactions: 按 Date DESC 排序 (保持現有)
```

### 快取策略
```
高頻讀取 (5分鐘快取):
- 活躍事件列表
- 已註冊成員清單
- 收費狀態統計

中頻讀取 (10分鐘快取):
- 授權成員清單
- 待審核申請

低頻讀取 (15分鐘快取):
- 歷史交易記錄
- 完成活動資料
```

## 🔄 資料遷移計劃

### 階段 1: 準備工作
1. 備份現有 Google Sheets
2. 建立新的工作表
3. 設定欄位標題和格式
4. 建立資料驗證規則

### 階段 2: 資料初始化
1. 匯入授權成員清單 (手動建立)
2. 保持現有相簿和交易記錄
3. 設定初始管理員帳戶
4. 測試資料完整性

### 階段 3: 系統整合
1. 更新 Google Sheets API 權限
2. 調整現有程式碼讀取邏輯
3. 實作新的寫入功能
4. 建立資料同步機制

## 📈 容量規劃

### Google Sheets 限制
```
單一工作表限制:
- 最大 1000萬個儲存格
- 最大 18,278 欄
- 最大 400,000 列

預估資料量 (以50人團隊，每年20個活動計算):
- AuthorizedMembers: ~100 列 (包含歷史)
- RegisteredMembers: ~50 列
- Events: ~20 列/年
- PaymentTracking: ~1000 列/年 (50人 × 20活動)
- Transactions: 現有 + 收費記錄

預估5年內資料量不會超過限制。
```

### API 配額管理
```
Google Sheets API 限制:
- 每100秒100次請求/使用者
- 每日無限制 (在合理範圍內)

優化策略:
- 批次操作減少 API 調用
- 快取機制減少讀取頻率
- 非即時操作使用背景處理
```

## 🛡️ 資料安全與備份

### 安全措施
```
存取控制:
- 服務帳戶最小權限原則
- API 金鑰加密儲存
- 定期檢查權限設定

資料保護:
- 敏感資料欄位識別
- PII 資料處理規範
- 錯誤日誌脫敏處理
```

### 備份策略
```
自動備份 (Google Drive):
- Google Sheets 自動版本控制
- 每日自動儲存快照

手動備份:
- 重要操作前手動備份
- 大量資料異動前備份
- 系統升級前完整備份

災難復原:
- 錯誤操作回復程序
- 資料遺失復原計劃
- 緊急存取備用方案
```

---

**文件版本**: v1.0  
**建立日期**: 2025年8月17日  
**最後更新**: 2025年8月17日  
**維護負責**: 開發團隊