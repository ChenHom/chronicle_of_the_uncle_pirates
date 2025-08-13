/**
 * Google Apps Script 程式碼
 * 用於從 Google Sheets 觸發 GitHub Actions 部署
 * 
 * 所需權限範疇：
 * - https://www.googleapis.com/auth/spreadsheets.currentonly (存取當前試算表)
 * - https://www.googleapis.com/auth/script.external_request (呼叫外部API)
 * 
 * 設定步驟：
 * 1. 在 Google Apps Script 中建立新專案
 * 2. 將此程式碼貼入
 * 3. 執行一次 authorizeScript() 函式來設定權限
 * 4. 設定以下腳本屬性 (Script Properties)：
 *    - GITHUB_TOKEN: GitHub Personal Access Token
 *    - GITHUB_OWNER: GitHub 使用者名稱
 *    - GITHUB_REPO: GitHub 儲存庫名稱
 * 5. 在 Google Sheets 中插入按鈕並指派此函式
 */

/**
 * 權限授權函式
 * 請先執行此函式來獲得必要權限
 */
function authorizeScript() {
  try {
    // 測試試算表存取權限
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    console.log('✅ 試算表權限正常，名稱：', spreadsheet.getName());
    
    // 測試外部請求權限
    const testResponse = UrlFetchApp.fetch('https://api.github.com');
    console.log('✅ 外部請求權限正常，狀態碼：', testResponse.getResponseCode());
    
    // 測試屬性服務權限
    const scriptProperties = PropertiesService.getScriptProperties();
    console.log('✅ 屬性服務權限正常');
    
    // 測試用戶會話權限
    const userEmail = Session.getActiveUser().getEmail();
    console.log('✅ 用戶會話權限正常，用戶：', userEmail);
    
    spreadsheet.toast('✅ 所有權限授權成功！現在可以使用其他功能了。', '權限檢查', 5);
    
    return true;
  } catch (error) {
    console.error('❌ 權限授權失敗：', error.toString());
    return false;
  }
}

/**
 * 主要函式：觸發網站更新
 * 這是綁定到 Google Sheets 按鈕的主要函式
 */
function updateWebsite() {
  try {
    // 顯示開始訊息
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    spreadsheet.toast('正在觸發網站更新...', '更新網站 🚀', 3);
    
    // 記錄觸發時間和用戶
    console.log(`網站更新觸發於: ${new Date().toLocaleString('zh-TW')}`);
    console.log(`觸發用戶: ${Session.getActiveUser().getEmail()}`);
    
    // 觸發 GitHub Actions
    const result = triggerGitHubAction();
    
    if (result.success) {
      spreadsheet.toast(
        '網站更新已成功觸發！\n請等待 3-5 分鐘讓 GitHub Actions 完成部署。\n\n💡 可到 GitHub Repository → Actions 查看建置進度',
        '更新成功 ✅',
        15
      );
      
      // 記錄成功日誌
      console.log('GitHub Actions triggered successfully at:', new Date());
    } else {
      spreadsheet.toast(
        '觸發更新時發生錯誤：\n' + result.error + '\n\n請檢查腳本屬性設定或查看執行日誌',
        '更新失敗 ❌',
        15
      );
      
      // 記錄錯誤日誌
      console.error('Failed to trigger GitHub Actions:', result.error);
    }
    
  } catch (error) {
    spreadsheet.toast(
      '執行時發生未預期的錯誤：\n' + error.toString() + '\n\n請檢查腳本權限或聯絡管理員',
      '系統錯誤 ❌',
      15
    );
    console.error('Unexpected error in updateWebsite:', error);
  }
}

/**
 * 觸發 GitHub Actions 的核心函式
 */
function triggerGitHubAction() {
  try {
    // 從腳本屬性獲取設定
    const scriptProperties = PropertiesService.getScriptProperties();
    const githubToken = scriptProperties.getProperty('GITHUB_TOKEN');
    const githubOwner = scriptProperties.getProperty('GITHUB_OWNER');
    const githubRepo = scriptProperties.getProperty('GITHUB_REPO');
    
    // 驗證必要設定
    if (!githubToken || !githubOwner || !githubRepo) {
      return {
        success: false,
        error: '缺少必要的 GitHub 設定。請檢查 GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO 是否已正確設定。'
      };
    }
    
    // 準備 GitHub API 請求
    const url = `https://api.github.com/repos/${githubOwner}/${githubRepo}/dispatches`;
    
    const payload = {
      event_type: 'update-website',
      client_payload: {
        trigger_source: 'google_sheets',
        timestamp: new Date().toISOString(),
        triggered_by: Session.getActiveUser().getEmail()
      }
    };
    
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.everest-preview+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Chronicle-Pirates-Google-Apps-Script/1.0'
      },
      payload: JSON.stringify(payload)
    };
    
    // 發送請求
    const response = UrlFetchApp.fetch(url, options);
    
    if (response.getResponseCode() === 204) {
      return { success: true };
    } else {
      return {
        success: false,
        error: `GitHub API 回應錯誤 ${response.getResponseCode()}: ${response.getContentText()}`
      };
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * 測試函式：檢查 GitHub API 連接
 */
function testGitHubConnection() {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const githubToken = scriptProperties.getProperty('GITHUB_TOKEN');
    const githubOwner = scriptProperties.getProperty('GITHUB_OWNER');
    const githubRepo = scriptProperties.getProperty('GITHUB_REPO');
    
    if (!githubToken || !githubOwner || !githubRepo) {
      console.log('❌ 設定檢查失敗：缺少必要的 GitHub 設定');
      return;
    }
    
    // 測試 GitHub API 連接
    const url = `https://api.github.com/repos/${githubOwner}/${githubRepo}`;
    
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Chronicle-Pirates-Google-Apps-Script/1.0'
      }
    };
    
    const response = UrlFetchApp.fetch(url, options);
    
    if (response.getResponseCode() === 200) {
      const repoData = JSON.parse(response.getContentText());
      console.log('✅ GitHub 連接測試成功');
      console.log(`儲存庫: ${repoData.full_name}`);
      console.log(`描述: ${repoData.description || '無描述'}`);
      console.log(`預設分支: ${repoData.default_branch}`);
    } else {
      console.log('❌ GitHub 連接測試失敗');
      console.log(`回應代碼: ${response.getResponseCode()}`);
      console.log(`回應內容: ${response.getContentText()}`);
    }
    
  } catch (error) {
    console.log('❌ 測試時發生錯誤:', error.toString());
  }
}

/**
 * 檢查最近的部署狀態
 */
function checkDeploymentStatus() {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const githubToken = scriptProperties.getProperty('GITHUB_TOKEN');
    const githubOwner = scriptProperties.getProperty('GITHUB_OWNER');
    const githubRepo = scriptProperties.getProperty('GITHUB_REPO');
    
    if (!githubToken || !githubOwner || !githubRepo) {
      SpreadsheetApp.getActiveSpreadsheet().toast(
        '缺少必要的 GitHub 設定。請先完成腳本屬性設定。',
        '設定錯誤 ⚠️',
        10
      );
      return;
    }
    
    // 取得最新的 workflow runs
    const url = `https://api.github.com/repos/${githubOwner}/${githubRepo}/actions/runs?per_page=5`;
    
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Chronicle-Pirates-Google-Apps-Script/1.0'
      }
    };
    
    const response = UrlFetchApp.fetch(url, options);
    
    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      const runs = data.workflow_runs;
      
      if (runs.length === 0) {
        SpreadsheetApp.getActiveSpreadsheet().toast(
          '目前沒有任何部署記錄',
          '部署狀態 📊',
          5
        );
        return;
      }
      
      const latestRun = runs[0];
      const status = latestRun.status;
      const conclusion = latestRun.conclusion;
      const createdAt = new Date(latestRun.created_at).toLocaleString('zh-TW');
      
      let statusEmoji = '⏳';
      let statusText = status;
      
      if (status === 'completed') {
        if (conclusion === 'success') {
          statusEmoji = '✅';
          statusText = '部署成功';
        } else if (conclusion === 'failure') {
          statusEmoji = '❌';
          statusText = '部署失敗';
        } else {
          statusEmoji = '⚠️';
          statusText = `部署${conclusion}`;
        }
      } else if (status === 'in_progress') {
        statusEmoji = '🔄';
        statusText = '正在部署中';
      }
      
      SpreadsheetApp.getActiveSpreadsheet().toast(
        `最新部署狀態：${statusText}\\n時間：${createdAt}\\n\\n💡 詳細資訊請查看 GitHub Actions`,
        `部署狀態 ${statusEmoji}`,
        12
      );
      
      console.log(`部署狀態檢查 - 狀態：${status}，結果：${conclusion}，時間：${createdAt}`);
      
    } else {
      SpreadsheetApp.getActiveSpreadsheet().toast(
        `GitHub API 回應錯誤 ${response.getResponseCode()}`,
        '查詢失敗 ❌',
        8
      );
    }
    
  } catch (error) {
    SpreadsheetApp.getActiveSpreadsheet().toast(
      '檢查部署狀態時發生錯誤：' + error.toString(),
      '查詢錯誤 ❌',
      10
    );
    console.error('檢查部署狀態錯誤:', error);
  }
}

/**
 * 快速測試函式：驗證所有設定
 */
function quickTest() {
  console.log('=== 快速測試開始 ===');
  
  // 測試 1: 檢查腳本屬性
  console.log('測試 1: 檢查腳本屬性');
  const scriptProperties = PropertiesService.getScriptProperties();
  const githubToken = scriptProperties.getProperty('GITHUB_TOKEN');
  const githubOwner = scriptProperties.getProperty('GITHUB_OWNER');
  const githubRepo = scriptProperties.getProperty('GITHUB_REPO');
  
  console.log(`GITHUB_TOKEN: ${githubToken ? '✅ 已設定' : '❌ 未設定'}`);
  console.log(`GITHUB_OWNER: ${githubOwner || '❌ 未設定'}`);
  console.log(`GITHUB_REPO: ${githubRepo || '❌ 未設定'}`);
  
  if (!githubToken || !githubOwner || !githubRepo) {
    console.log('❌ 設定不完整，請先完成腳本屬性設定');
    return;
  }
  
  // 測試 2: GitHub 連接
  console.log('測試 2: GitHub 連接');
  testGitHubConnection();
  
  // 測試 3: 權限檢查
  console.log('測試 3: 權限檢查');
  try {
    const user = Session.getActiveUser().getEmail();
    console.log(`✅ 當前用戶: ${user}`);
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    console.log(`✅ 試算表存取: ${spreadsheet.getName()}`);
    
  } catch (error) {
    console.log('❌ 權限檢查失敗:', error.toString());
  }
  
  console.log('=== 快速測試完成 ===');
}

/**
 * 一次性設定函式：初始化腳本屬性
 * 執行此函式後請刪除或註解掉，以免意外覆蓋設定
 */
function setupScriptProperties() {
  const scriptProperties = PropertiesService.getScriptProperties();
  
  // ⚠️ 請替換成你的實際值
  scriptProperties.setProperties({
    'GITHUB_TOKEN': 'ghp_your_github_personal_access_token_here',
    'GITHUB_OWNER': 'your_github_username',
    'GITHUB_REPO': 'chronicle_of_the_uncle_pirates'
  });
  
  console.log('✅ 腳本屬性設定完成');
  console.log('請確認設定正確後執行 testGitHubConnection() 來測試連接');
}