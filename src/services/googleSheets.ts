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
            header: false, // Parse as arrays first to handle the title row
            skipEmptyLines: true,
            complete: (results) => {
                const rawRows = results.data as string[][];

                if (!rawRows.length) {
                    resolve({ records: [], publishers: [] });
                    return;
                }

                // Find the header row (contains 'Months')
                const headerRowIndex = rawRows.findIndex(row =>
                    row.some(cell => cell && typeof cell === 'string' && cell.trim().toLowerCase().includes('months'))
                );

                if (headerRowIndex === -1) {
                    // Fallback: assume first row if 'Months' not found (unlikely based on known schema)
                    console.error("Could not find header row containing 'Months'");
                    resolve({ records: [], publishers: [] });
                    return;
                }

                const headers = rawRows[headerRowIndex].map(h => h ? h.trim() : '');
                const dataRows = rawRows.slice(headerRowIndex + 1);

                // Map rows to objects based on headers
                const cleanedRecords = dataRows.map(row => {
                    const newRecord: Record<string, any> = {};

                    headers.forEach((header, index) => {
                        if (!header) return; // Skip empty headers

                        // value at this index (or empty string if row is short)
                        let value: string | number = row[index] || '';

                        if (typeof value === 'string') {
                            value = value.trim();
                            // Replace '- ' or similar with 0
                            if (value === '-' || value === '- ' || value === '') {
                                value = 0;
                            } else {
                                // Try to parse number if possible, but keep month as string
                                // Check if this specific header is NOT 'Months'
                                if (header.toLowerCase() !== 'months' && !header.toLowerCase().includes('months')) {
                                    const num = parseFloat(value.replace(/,/g, ''));
                                    if (!isNaN(num)) value = num;
                                }
                            }
                        }
                        newRecord[header] = value;
                    });
                    return newRecord as UsageRecord;
                });

                // Filter out "Total" row if it exists
                // key might be "Months" or "Months " -> we trimmed headers so it should be "Months"
                const monthKey = headers.find(h => h.toLowerCase().includes('months')) || 'Months';
                const dataRecords = cleanedRecords.filter((r: any) =>
                    r[monthKey] && r[monthKey].toString().toLowerCase() !== 'total'
                );

                // Extract publishers from headers (excluding 'Months')
                const publishers = headers.filter(k =>
                    k && k.toLowerCase() !== 'months' && !k.toLowerCase().includes('month')
                );

                resolve({ records: dataRecords, publishers });
            },
            error: (error: any) => {
                reject(error);
            }
        });
    });
};
