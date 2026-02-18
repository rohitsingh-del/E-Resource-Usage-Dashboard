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

// Newspaper Data GIDs (March 2025 onwards)
export const NEWSPAPER_DATASETS = {
    'March 2025': '621847070',
    'April 2025': '786694274',
    'May 2025': '1348093130',
    'July 2025': '1690480486',
    'August 2025': '1801053725',
    'September 2025': '781167202',
    'October 2025': '1070440802',
    'November 2025': '1847238740',
    'December 2025': '1824142180'
};

export interface NewspaperRecord {
    name: string;
    totalCopies: number;
    totalPrice: number;
}

export const fetchNewspaperData = async (gid: string): Promise<NewspaperRecord[]> => {
    const url = `https://docs.google.com/spreadsheets/d/e/2PACX-1vRNxjWC8Ju39ezX9omxJl2FIyGwoB3g4svtaPFaI5Mq5X471Zv5XIKQWCsagKJC7g/pub?gid=${gid}&single=true&output=csv`;

    return new Promise((resolve, reject) => {
        Papa.parse(url, {
            download: true,
            header: false,
            skipEmptyLines: true,
            complete: (results) => {
                const rows = results.data as string[][];

                if (!rows.length) {
                    resolve([]);
                    return;
                }

                // 1. Find the Header Row (containing "Date" or "Days")
                // Based on CSV, it seems to be around row 2 or 3.
                // We look for a row that has "Price" or "No.of Days"
                let headerRowIndex = -1;

                // Strategy: Look for the row that contains "Total Price" or "No.of Days"
                for (let i = 0; i < Math.min(rows.length, 10); i++) {
                    const rowStr = rows[i].join(' ').toLowerCase();
                    if (rowStr.includes('total price') && rowStr.includes('days')) {
                        headerRowIndex = i;
                        break;
                    }
                }

                if (headerRowIndex === -1) {
                    // Fallback: Look for "Date" if above fails
                    const dateRow = rows.findIndex(r => r[0] === 'Date');
                    if (dateRow !== -1) headerRowIndex = dateRow + 1; // The row AFTER "Date" usually has the column headers for Data
                    else {
                        // Absolute fallback, try row 2 (index 2, 0-based) as per visual check
                        headerRowIndex = 2;
                    }
                }

                if (headerRowIndex === -1 || headerRowIndex >= rows.length) {
                    resolve([]);
                    return;
                }

                const headerRow = rows[headerRowIndex];

                // Find Indices
                // "Total Price" might be split into two lines in the cell ("Total \n Price"), so we clean it
                const cleanHeader = headerRow.map(h => h ? h.replace(/\n| /g, '').toLowerCase() : '');


                // "Total Price" index
                const priceIndex = cleanHeader.findIndex(h => h.includes('totalprice') || h.includes('price'));
                // "No. of Days" / "Total Received Paper" index
                let copiesIndex = cleanHeader.findIndex(h => h.includes('no.ofdays') || h.includes('days') || (h.includes('received') && h.includes('paper')));


                const dataRows = rows.slice(headerRowIndex + 1);
                const records: NewspaperRecord[] = [];

                dataRows.forEach(row => {
                    const name = row[0]; // Newspaper Name is usually first column
                    if (!name || name.trim() === '' || name.toLowerCase().includes('total') || name.toLowerCase().includes('month')) return;

                    let priceVal = 0;
                    let copiesVal = 0;

                    if (priceIndex !== -1 && row[priceIndex]) {
                        priceVal = parseFloat(row[priceIndex].replace(/,/g, '')) || 0;
                    } else {
                        // Try last column
                        const lastVal = row[row.length - 1];
                        priceVal = parseFloat(lastVal?.replace(/,/g, '')) || 0;
                    }

                    if (copiesIndex !== -1 && row[copiesIndex]) {
                        copiesVal = parseFloat(row[copiesIndex].replace(/,/g, '')) || 0;
                    } else {
                        // Try 2nd to last
                        const val = row[row.length - 2];
                        copiesVal = parseFloat(val?.replace(/,/g, '')) || 0;
                    }

                    // Only add if it looks like a valid record (has a name and at least one non-zero value or is a known paper)
                    if (name.length > 2) {
                        records.push({
                            name: name.trim(),
                            totalCopies: copiesVal,
                            totalPrice: priceVal
                        });
                    }
                });

                resolve(records);
            },
            error: (err: any) => reject(err)
        });
    });
};

export type Language = 'Hindi' | 'English' | 'Other';

export interface MonthlyAggregation {
    month: string;
    totalIsr: number; // Total Copies
    totalPrice: number;
    records: NewspaperRecord[];
}

export const getNewspaperLanguage = (name: string): Language => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('hindi') ||
        lowerName.includes('jagran') ||
        lowerName.includes('ujala') ||
        lowerName.includes('nav bharat') ||
        lowerName.includes('sahara') ||
        lowerName.includes('aaj') ||
        lowerName.includes('jansatta')) {
        return 'Hindi';
    }
    if (lowerName.includes('times') ||
        lowerName.includes('hindu') ||
        lowerName.includes('pioneer') ||
        lowerName.includes('express') ||
        lowerName.includes('mail') ||
        lowerName.includes('tribune') ||
        lowerName.includes('standard') ||
        lowerName.includes('mint')) {
        return 'English';
    }
    return 'Other';
};

export const fetchAllNewspaperMonths = async (): Promise<MonthlyAggregation[]> => {
    const months = Object.keys(NEWSPAPER_DATASETS) as Array<keyof typeof NEWSPAPER_DATASETS>;

    // Create an array of promises
    const promises = months.map(async (month) => {
        try {
            const records = await fetchNewspaperData(NEWSPAPER_DATASETS[month]);
            const totalCopies = records.reduce((sum, r) => sum + r.totalCopies, 0);
            const totalPrice = records.reduce((sum, r) => sum + r.totalPrice, 0);

            return {
                month,
                totalIsr: totalCopies,
                totalPrice,
                records
            };
        } catch (error) {
            console.error(`Failed to fetch data for ${month}`, error);
            return {
                month,
                totalIsr: 0,
                totalPrice: 0,
                records: []
            };
        }
    });

    return Promise.all(promises);
};
