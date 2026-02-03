import Papa from 'papaparse';

export interface UsageRecord {
    month: string;
    [publisher: string]: string | number;
}

export interface SheetData {
    records: UsageRecord[];
    publishers: string[];
}

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSpo7h-HSoZ6knQ7hib7GdKNEJgEPUGaFPXPZ5bKyrByUQ2ap_xmNuP8W94rD_j4A/pub?output=csv';

export const fetchSheetData = async (): Promise<SheetData> => {
    return new Promise((resolve, reject) => {
        Papa.parse(SHEET_URL, {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const records = results.data as Record<string, string>[];

                if (!records.length) {
                    resolve({ records: [], publishers: [] });
                    return;
                }

                // Clean keys: trim spaces
                const cleanedRecords = records.map(record => {
                    const newRecord: Record<string, any> = {};
                    Object.keys(record).forEach(key => {
                        const cleanKey = key.trim();
                        // Basic value cleaning
                        let value: string | number = record[key];
                        if (typeof value === 'string') {
                            value = value.trim();
                            // Replace '- ' or similar with 0
                            if (value === '-' || value === '- ' || value === '') {
                                value = 0;
                            } else {
                                // Try to parse number if possible, but keep month as string
                                if (cleanKey.toLowerCase() !== 'months') {
                                    const num = parseFloat(value.replace(/,/g, ''));
                                    if (!isNaN(num)) value = num;
                                }
                            }
                        }
                        newRecord[cleanKey] = value;
                    });
                    return newRecord as UsageRecord;
                });

                // Filter out "Total" row if it exists
                const dataRecords = cleanedRecords.filter(r => r['Months'] && r['Months'].toString().toLowerCase() !== 'total');

                // Extract publishers from headers (excluding 'Months')
                // We use the first record to get keys, assuming headers were parsed correctly
                const firstRecord = cleanedRecords[0];
                const publishers = Object.keys(firstRecord).filter(k => k.toLowerCase() !== 'months' && k !== '');

                resolve({ records: dataRecords, publishers });
            },
            error: (error: any) => {
                reject(error);
            }
        });
    });
};
