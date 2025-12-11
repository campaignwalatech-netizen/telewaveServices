const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

class ExcelParser {
    /**
     * Parse Excel/CSV file and return data as JSON
     * @param {string} filePath - Path to the uploaded file
     * @returns {Promise<Array>} - Parsed data as array of objects
     */
    static parseFile(filePath) {
        try {
            const fileExtension = path.extname(filePath).toLowerCase();
            
            if (fileExtension === '.csv' || fileExtension === '.txt') {
                return this.parseCSVFile(filePath);
            } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
                return this.parseExcelFile(filePath);
            } else {
                throw new Error(`Unsupported file format: ${fileExtension}. Please use CSV or Excel files.`);
            }
        } catch (error) {
            throw new Error(`Failed to parse file: ${error.message}`);
        }
    }
    
    /**
     * Parse Excel file
     */
    static parseExcelFile(filePath) {
        try {
            // Read the file
            const workbook = xlsx.readFile(filePath);
            
            // Get the first sheet
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Convert to JSON
            const data = xlsx.utils.sheet_to_json(worksheet, {
                raw: false, // Parse dates and numbers properly
                defval: '' // Default value for empty cells
            });
            
            console.log(`📊 [ExcelParser] Parsed ${data.length} rows from Excel file`);
            
            // Normalize column names (remove spaces, make lowercase)
            return data.map(row => {
                const normalizedRow = {};
                for (const key in row) {
                    if (row.hasOwnProperty(key)) {
                        const normalizedKey = key.toString().trim().toLowerCase().replace(/\s+/g, '_');
                        normalizedRow[normalizedKey] = row[key];
                    }
                }
                return normalizedRow;
            });
        } catch (error) {
            throw new Error(`Failed to parse Excel file: ${error.message}`);
        }
    }
    
    /**
     * Parse CSV file
     */
    static parseCSVFile(filePath) {
        return new Promise((resolve, reject) => {
            const results = [];
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    console.log(`📊 [ExcelParser] Parsed ${results.length} rows from CSV file`);
                    
                    // Normalize column names
                    const normalizedResults = results.map(row => {
                        const normalizedRow = {};
                        for (const key in row) {
                            if (row.hasOwnProperty(key)) {
                                const normalizedKey = key.toString().trim().toLowerCase().replace(/\s+/g, '_');
                                normalizedRow[normalizedKey] = row[key];
                            }
                        }
                        return normalizedRow;
                    });
                    
                    resolve(normalizedResults);
                })
                .on('error', (error) => {
                    reject(new Error(`Failed to parse CSV file: ${error.message}`));
                });
        });
    }
    
    /**
     * Delete uploaded file after processing
     * @param {string} filePath - Path to the file to delete
     */
    static deleteFile(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    }
    
    /**
     * Validate required fields in parsed data
     * @param {Array} data - Parsed data array
     * @param {Array} requiredFields - Array of required field names
     * @returns {Object} - { isValid, missingFields, invalidRows }
     */
    static validateRequiredFields(data, requiredFields) {
        const missingFields = new Set();
        const invalidRows = [];
        
        data.forEach((row, index) => {
            const rowNumber = index + 2; // +2 because of header row and 0-based index
            const rowMissingFields = [];
            
            requiredFields.forEach(field => {
                if (!row[field] || row[field].toString().trim() === '') {
                    missingFields.add(field);
                    rowMissingFields.push(field);
                }
            });
            
            if (rowMissingFields.length > 0) {
                invalidRows.push({
                    row: rowNumber,
                    missingFields: rowMissingFields,
                    data: row
                });
            }
        });
        
        return {
            isValid: invalidRows.length === 0,
            missingFields: Array.from(missingFields),
            invalidRows
        };
    }
    
    /**
     * Extract name and contact from row with flexible column names
     */
    static extractDataFromRow(row) {
        // Common column name patterns (lowercase, underscore separated)
        const namePatterns = [
            'name', 'full_name', 'fullname', 'person_name', 'contact_name',
            'customer_name', 'client_name', 'contact_person', 'first_name', 'last_name'
        ];
        
        const contactPatterns = [
            'contact', 'phone', 'phone_number', 'mobile', 'mobile_number',
            'contact_number', 'phone_no', 'mobile_no', 'telephone', 'cell',
            'contact_no', 'whatsapp', 'whatsapp_number'
        ];
        
        let name = '';
        let contact = '';
        
        // Find name
        for (const pattern of namePatterns) {
            if (row[pattern] !== undefined && row[pattern] !== null && row[pattern] !== '') {
                name = String(row[pattern]).trim();
                break;
            }
        }
        
        // Find contact
        for (const pattern of contactPatterns) {
            if (row[pattern] !== undefined && row[pattern] !== null && row[pattern] !== '') {
                contact = String(row[pattern]).trim();
                break;
            }
        }
        
        // If still not found, try case-insensitive partial matching
        if (!name) {
            const rowKeys = Object.keys(row);
            for (const key of rowKeys) {
                if (key.toLowerCase().includes('name') && row[key]) {
                    name = String(row[key]).trim();
                    break;
                }
            }
        }
        
        if (!contact) {
            const rowKeys = Object.keys(row);
            for (const key of rowKeys) {
                const lowerKey = key.toLowerCase();
                if ((lowerKey.includes('phone') || lowerKey.includes('mobile') || lowerKey.includes('contact')) && row[key]) {
                    contact = String(row[key]).trim();
                    break;
                }
            }
        }
        
        // Last resort: use first two columns if they exist
        if (!name || !contact) {
            const columns = Object.values(row).filter(val => val !== '' && val !== null);
            if (columns.length >= 2) {
                if (!name && columns[0]) {
                    name = String(columns[0]).trim();
                }
                if (!contact && columns[1]) {
                    contact = String(columns[1]).trim();
                }
            }
        }
        
        return { name, contact };
    }
    
    /**
     * Generate Excel template
     */
    static generateTemplate() {
        const templateData = [
            ['Name', 'Contact'],
            ['John Doe', '9876543210'],
            ['Jane Smith', '9876543211'],
            ['Mike Johnson', '9876543212'],
            ['Note:', ''],
            ['1. First row must contain headers', ''],
            ['2. Contact must be 10 digits', ''],
            ['3. Remove this note before uploading', '']
        ];
        
        // Create workbook
        const wb = xlsx.utils.book_new();
        
        // Create worksheet
        const ws = xlsx.utils.aoa_to_sheet(templateData);
        
        // Style the note rows
        if (ws['!ref']) {
            const range = xlsx.utils.decode_range(ws['!ref']);
            for (let i = 4; i <= range.e.r; i++) {
                const cellAddress = xlsx.utils.encode_cell({ r: i, c: 0 });
                if (ws[cellAddress]) {
                    ws[cellAddress].s = { font: { color: { rgb: "FF0000" }, italic: true } };
                }
            }
        }
        
        // Set column widths
        ws['!cols'] = [
            { wch: 30 }, // Name column width
            { wch: 15 }  // Contact column width
        ];
        
        // Add worksheet to workbook
        xlsx.utils.book_append_sheet(wb, ws, 'Data Template');
        
        // Generate buffer
        return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    }
    
    /**
     * Convert data to Excel buffer
     */
    static convertToExcel(data, sheetName = 'Data Export') {
        try {
            // Prepare data for Excel
            const excelData = data.map(item => ({
                'Name': item.name || '',
                'Contact': item.contact || '',
                'Batch Number': item.batchNumber || '',
                'Status': item.distributionStatus || '',
                'Assigned To': item.assignedToInfo?.name || 'Not Assigned',
                'Assigned At': item.assignedAt ? new Date(item.assignedAt).toLocaleString() : '',
                'Created At': item.createdAt ? new Date(item.createdAt).toLocaleString() : '',
                'Source': item.source || '',
                'Priority': item.priority || ''
            }));
            
            // Convert to worksheet
            const ws = xlsx.utils.json_to_sheet(excelData);
            
            // Set column widths
            ws['!cols'] = [
                { wch: 25 }, // Name
                { wch: 15 }, // Contact
                { wch: 20 }, // Batch Number
                { wch: 15 }, // Status
                { wch: 20 }, // Assigned To
                { wch: 25 }, // Assigned At
                { wch: 25 }, // Created At
                { wch: 15 }, // Source
                { wch: 10 }  // Priority
            ];
            
            // Create workbook
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, sheetName);
            
            // Generate buffer
            return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
            
        } catch (error) {
            console.error('❌ [ExcelParser] Convert to Excel error:', error);
            throw error;
        }
    }
    
    /**
     * Validate contact numbers
     */
    static validateContact(contact) {
        if (!contact) return false;
        
        // Remove all non-digit characters
        const cleanContact = contact.toString().replace(/\D/g, '');
        
        // Check if it's exactly 10 digits
        return /^[0-9]{10}$/.test(cleanContact);
    }
    
    /**
     * Clean contact number
     */
    static cleanContact(contact) {
        if (!contact) return '';
        return contact.toString().replace(/\D/g, '');
    }
}

module.exports = ExcelParser;