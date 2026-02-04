import Papa from 'papaparse';

export interface UsageRecord {
    month: string;
    [publisher: string]: string | number;
}

export interface SheetData {
    records: UsageRecord[];
    publishers: string[];
}

// Dataset URLs
export const DATASETS = {
    '2025 Data': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSpo7h-HSoZ6knQ7hib7GdKNEJgEPUGaFPXPZ5bKyrByUQ2ap_xmNuP8W94rD_j4A/pub?output=csv',
    'Jan 2026 (School Wise)': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSpo7h-HSoZ6knQ7hib7GdKNEJgEPUGaFPXPZ5bKyrByUQ2ap_xmNuP8W94rD_j4A/pub?gid=4218642&single=true&output=csv'
};

export const fetchSheetData = async (url: string = DATASETS['2025 Data']): Promise<SheetData> => {
    return new Promise((resolve, reject) => {
        Papa.parse(url, {
            download: true,
            header: false, // Parse as arrays first to handle the title row
            skipEmptyLines: true,
            complete: (results) => {
                const rawRows = results.data as string[][];

                if (!rawRows.length) {
                    resolve({ records: [], publishers: [] });
                    return;
                }

                // Check for "Group" header (Jan 2026 School Wise Data)
                const groupHeaderIndex = rawRows.findIndex(row =>
                    row.some(cell => cell && typeof cell === 'string' && cell.trim() === 'Group')
                );

                if (groupHeaderIndex !== -1) {
                    // --- TRANSPOSE LOGIC FOR SCHOOL DATA ---
                    const originalHeaders = rawRows[groupHeaderIndex].map(h => h ? h.trim() : '');
                    const originalDataRows = rawRows.slice(groupHeaderIndex + 1);

                    // We want Schools (values in 'Group' column) to become the new "Publishers"
                    // We want Metrics (other headers) to become the new "Months" (Rows)

                    const groupColIndex = originalHeaders.indexOf('Group');

                    // Extract School Names
                    const schools = originalDataRows
                        .map(row => row[groupColIndex])
                        .filter(s => s && s.trim() !== '' && s.toLowerCase() !== 'total'); // Exclude empty or Total rows

                    // Extract Metric Names (exclude Group)
                    const metrics = originalHeaders.filter((h, i) => i !== groupColIndex && h !== '');

                    // Create new Transposed Records
                    const transposedRecords: UsageRecord[] = metrics.map(metric => {
                        const newRecord: any = { month: metric }; // 'month' key holds the Metric Name

                        schools.forEach((school, schoolIndex) => {
                            // Find the row for this school
                            const schoolRow = originalDataRows[schoolIndex];
                            if (schoolRow) {
                                // Find the value for this metric
                                const metricIndex = originalHeaders.indexOf(metric);
                                let val: string | number = schoolRow[metricIndex] || '0';

                                if (typeof val === 'string') {
                                    // Remove commas and try to parse
                                    const parsed = parseFloat(val.replace(/,/g, ''));
                                    if (!isNaN(parsed)) {
                                        val = parsed;
                                    } else {
                                        val = 0;
                                    }
                                }
                                newRecord[school] = val;
                            }
                        });
                        return newRecord;
                    });

                    resolve({ records: transposedRecords, publishers: schools });
                    return;
                }

                // --- EXISTING LOGIC FOR 2025 DATA ---

                // Find the header row (contains 'Months')
                const headerRowIndex = rawRows.findIndex(row =>
                    row.some(cell => cell && typeof cell === 'string' && cell.trim().toLowerCase().includes('months'))
                );

                if (headerRowIndex === -1) {
                    // Fallback: assume first row
                    console.error("Could not find header row containing 'Months' or 'Group'");
                    resolve({ records: [], publishers: [] });
                    return;
                }

                const headers = rawRows[headerRowIndex].map(h => h ? h.trim() : '');
                const dataRows = rawRows.slice(headerRowIndex + 1);

                const cleanedRecords = dataRows.map(row => {
                    const newRecord: Record<string, any> = {};

                    headers.forEach((header, index) => {
                        if (!header) return;
                        let value: string | number = row[index] || '';

                        if (typeof value === 'string') {
                            value = value.trim();
                            if (value === '-' || value === '- ' || value === '') {
                                value = 0;
                            } else {
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

                const monthKey = headers.find(h => h.toLowerCase().includes('months')) || 'Months';
                const dataRecords = cleanedRecords.filter((r: any) =>
                    r[monthKey] && r[monthKey].toString().toLowerCase() !== 'total'
                );

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
