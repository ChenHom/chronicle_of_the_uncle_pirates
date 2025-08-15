import { google } from 'googleapis';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Cache store
const cache = new Map<string, { data: unknown; timestamp: number }>();

// Cache utility functions
function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
  if (isExpired) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

function setCachedData<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
    console.log(`🗑️ Cleared cache for: ${key}`);
  } else {
    cache.clear();
    console.log('🗑️ Cleared all cache');
  }
}

// Types for our data structures
export interface Album {
  AlbumID: string;
  Title: string;
  Date: string;
  Description: string;
  AlbumURL: string;
}

export interface Transaction {
  TransactionID: string;
  Date: string;
  Source: string; // Added 'Source' field
  Description: string;
  Type: '收入' | '支出';
  Amount: number;
  Handler: string;
  ReceiptURL?: string;
  Balance: number;
}

// Initialize Google Sheets client
function getGoogleSheetsClient() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY!;
  
  if (!serviceAccountEmail || !privateKey) {
    // 在建置時如果沒有認證，返回 null 而不是拋出錯誤
    console.warn('⚠️  Google Sheets credentials not found - using mock data for build');
    return null;
  }

  // Fix private key format
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n');

  const jwt = new google.auth.JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  return google.sheets({ version: 'v4', auth: jwt });
}

// Get Albums data from the "相簿" worksheet
export async function getAlbums(): Promise<Album[]> {
  const cacheKey = 'albums';
  
  // Check cache first
  const cachedAlbums = getCachedData<Album[]>(cacheKey);
  if (cachedAlbums) {
    console.log('📦 Using cached albums data');
    return cachedAlbums;
  }

  try {
    const sheets = getGoogleSheetsClient();
    
    // 如果沒有認證 (建置時)，返回空陣列
    if (!sheets) {
      return [];
    }
    
    console.log('🔄 Fetching fresh albums data from Google Sheets');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: '相簿!A2:E', // Skip header row, get all data
    });

    const rows = response.data.values || [];
    
    const albums = rows.map((row): Album => ({
      AlbumID: row[0] || '',
      Title: row[1] || '',
      Date: row[2] || '',
      Description: row[3] || '',
      AlbumURL: row[4] || '',
    }));

    // Cache the result
    setCachedData(cacheKey, albums);
    
    return albums;
  } catch (error) {
    console.error('Error fetching albums:', error);
    return [];
  }
}

// Get Transactions data from the "收支明細" worksheet
export async function getTransactions(): Promise<Transaction[]> {
  const cacheKey = 'transactions';
  
  // Check cache first
  const cachedTransactions = getCachedData<Transaction[]>(cacheKey);
  if (cachedTransactions) {
    console.log('📦 Using cached transactions data');
    return cachedTransactions;
  }

  try {
    const sheets = getGoogleSheetsClient();
    
    // 如果沒有認證 (建置時)，返回空陣列
    if (!sheets) {
      return [];
    }
    
    console.log('🔄 Fetching fresh transactions data from Google Sheets');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: '收支明細!A2:I', // Skip header row, get all data - using same sheet for now
    });

    const rows = response.data.values || [];
    
    const transactions = rows.map((row): Transaction => ({
      TransactionID: row[0] || '',
      Date: row[1] || '',
      Source: row[2] || '', // Added Source field
      Description: row[3] || '',
      Type: (row[4] as '收入' | '支出') || '支出',
      Amount: parseFloat(row[5]) || 0,
      Handler: row[6] || '',
      ReceiptURL: row[7] || undefined,
      Balance: parseFloat(row[8]) || 0,
    }));

    // Cache the result
    setCachedData(cacheKey, transactions);
    
    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

// Get financial summary
export async function getFinancialSummary() {
  const transactions = await getTransactions();
  
  const totalIncome = transactions
    .filter(t => t.Type === '收入')
    .reduce((sum, t) => sum + t.Amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.Type === '支出')
    .reduce((sum, t) => sum + t.Amount, 0);
    
  const currentBalance = transactions.length > 0 
    ? transactions[transactions.length - 1].Balance 
    : 0;
    
  return {
    totalIncome,
    totalExpense,
    currentBalance,
    transactionCount: transactions.length
  };
}

// Test function (keep for debugging)
export async function testSheetAccess() {
  try {
    const sheets = getGoogleSheetsClient();
    
    // 如果沒有認證 (建置時)，返回 null
    if (!sheets) {
      console.warn('⚠️  Cannot test sheet access - no credentials');
      return null;
    }
    
    console.log("--- Testing sheet access ---");
    const response = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
    });
    
    console.log("Spreadsheet title:", response.data.properties?.title);
    console.log("Available sheets:", response.data.sheets?.map(s => s.properties?.title));
    
    return response.data;
  } catch (err: unknown) {
    console.error("Sheet access test failed:", err instanceof Error ? err.message : 'Unknown error');
    return null;
  }
}

// Export cache management functions for development/debugging
export const cacheManager = {
  clear: clearCache,
  getCacheSize: () => cache.size,
  getCacheKeys: () => Array.from(cache.keys()),
  getCacheInfo: () => {
    const entries = Array.from(cache.entries()).map(([key, value]) => ({
      key,
      age: Math.floor((Date.now() - value.timestamp) / 1000),
      remainingSeconds: Math.floor((CACHE_DURATION - (Date.now() - value.timestamp)) / 1000)
    }));
    return entries;
  }
};

