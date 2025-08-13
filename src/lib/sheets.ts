import { google } from 'googleapis';

// This function is now for testing access, not getting data
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
    throw new Error('Missing Google Sheets credentials');
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
  try {
    const sheets = getGoogleSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: '相簿!A2:E', // Skip header row, get all data
    });

    const rows = response.data.values || [];
    
    return rows.map((row): Album => ({
      AlbumID: row[0] || '',
      Title: row[1] || '',
      Date: row[2] || '',
      Description: row[3] || '',
      AlbumURL: row[4] || '',
    }));
  } catch (error) {
    console.error('Error fetching albums:', error);
    return [];
  }
}

// Get Transactions data from the "收支明細" worksheet
export async function getTransactions(): Promise<Transaction[]> {
  try {
    const sheets = getGoogleSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: '收支明細!A2:H', // Skip header row, get all data - using same sheet for now
    });

    const rows = response.data.values || [];
    
    return rows.map((row): Transaction => ({
      TransactionID: row[0] || '',
      Date: row[1] || '',
      Description: row[2] || '',
      Type: (row[3] as '收入' | '支出') || '支出',
      Amount: parseFloat(row[4]) || 0,
      Handler: row[5] || '',
      ReceiptURL: row[6] || undefined,
      Balance: parseFloat(row[7]) || 0,
    }));
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

