const DataDistribution = require('./data.distribute');
const User = require('./user.model');
const ExcelParser = require('../../utils/excelParser'); // Update path according to your structure
const mongoose = require('mongoose');
const path = require('path'); // Add this import

class BulkDataOperations {

    //generate Analytics
    static async generateAnalytics() {
        try {
            const totalDataCount = await DataDistribution.countDocuments({});
            const assignedDataCount = await DataDistribution.countDocuments({ distributionStatus: 'assigned' });
            const pendingDataCount = await DataDistribution.countDocuments({ distributionStatus: 'pending' });
            const completedDataCount = await DataDistribution.countDocuments({ distributionStatus: 'completed' });
            
            return {
                success: true,
                data: {
                    totalDataCount,
                    assignedDataCount,
                    pendingDataCount,
                    completedDataCount
                }
            };
        } catch (error) {
            console.error('❌ [BulkOperations] Generate analytics error:', error);
            return {
                success: false,
                error: error.message || 'Failed to generate analytics'
            };
        }
    }


    //get distributioncounts
    static async getDistributionCounts() {
        try {
            const counts = await DataDistribution.aggregate([
                {
                    $group: {
                        _id: '$distributionStatus',
                        count: { $sum: 1 }
                    }
                }
            ]);
            
            const result = {};
            counts.forEach(item => {
                result[item._id] = item.count;
            });
            
            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('❌ [BulkOperations] Get distribution counts error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get distribution counts'
            };
        }
    }

    /**
     * Import data from file (CSV/Excel)
     */
    static async importDataFromFile(filePath, adminId, options = {}) {
        try {
            console.log('📁 [BulkOperations] Importing from file:', filePath);
            
            const fs = require('fs');
            
            if (!fs.existsSync(filePath)) {
                return {
                    success: false,
                    error: 'File not found'
                };
            }
            
            // const fileExtension = path.extname(filePath).toLowerCase();
            // Instead of using path.extname(), you can use:
            const fileExtension = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
            console.log(`📁 [BulkOperations] File extension: ${fileExtension}`);
            
            let parsedData;
            try {
                parsedData = await ExcelParser.parseFile(filePath);
            } catch (parseError) {
                // Clean up file
                ExcelParser.deleteFile(filePath);
                return {
                    success: false,
                    error: parseError.message || 'Failed to parse file'
                };
            }
            
            console.log(`📁 [BulkOperations] Parsed ${parsedData.length} rows`);
            
            if (parsedData.length === 0) {
                ExcelParser.deleteFile(filePath);
                return {
                    success: false,
                    error: 'File is empty or contains no data'
                };
            }
            
            const dataArray = [];
            const errors = [];
            let batchNumber;
            
            // Generate batch number
            if (options.batchName) {
                const cleanBatchName = options.batchName
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '_')
                    .toUpperCase();
                batchNumber = `${cleanBatchName}_${Date.now()}`;
            } else {
                batchNumber = `BATCH_${Date.now()}`;
            }
            
            // Process each row
            for (let i = 0; i < parsedData.length; i++) {
                const row = parsedData[i];
                
                try {
                    // Extract data from row
                    const { name, contact } = ExcelParser.extractDataFromRow(row);
                    
                    if (!name || name.trim() === '') {
                        errors.push(`Row ${i + 2}: Missing name`);
                        continue;
                    }
                    
                    if (!contact || contact.trim() === '') {
                        errors.push(`Row ${i + 2}: Missing contact`);
                        continue;
                    }
                    
                    // Clean and validate contact number
                    const cleanContact = ExcelParser.cleanContact(contact);
                    
                    if (!ExcelParser.validateContact(cleanContact)) {
                        errors.push(`Row ${i + 2}: Invalid phone number: ${contact} → ${cleanContact} (must be 10 digits)`);
                        continue;
                    }
                    
                    // Check for duplicate contact in this batch
                    const duplicate = dataArray.find(item => item.contact === cleanContact);
                    if (duplicate) {
                        errors.push(`Row ${i + 2}: Duplicate contact number: ${cleanContact}`);
                        continue;
                    }
                    
                    dataArray.push({
                        name: name.trim(),
                        contact: cleanContact
                    });
                } catch (rowError) {
                    errors.push(`Row ${i + 2}: ${rowError.message}`);
                }
            }
            
            console.log(`📁 [BulkOperations] Valid rows: ${dataArray.length}, Errors: ${errors.length}`);
            
            if (dataArray.length === 0) {
                ExcelParser.deleteFile(filePath);
                return {
                    success: false,
                    error: 'No valid data found in file',
                    details: errors
                };
            }
            
            // Check for existing contacts in database
            const existingContacts = await DataDistribution.find({
                contact: { $in: dataArray.map(item => item.contact) }
            }).select('contact');
            
            const existingContactNumbers = existingContacts.map(c => c.contact);
            const duplicatesInDB = [];
            const filteredData = [];
            
            dataArray.forEach((item, index) => {
                if (existingContactNumbers.includes(item.contact)) {
                    duplicatesInDB.push(`Row ${index + 2}: Contact ${item.contact} already exists in database`);
                } else {
                    filteredData.push(item);
                }
            });
            
            if (filteredData.length === 0) {
                ExcelParser.deleteFile(filePath);
                return {
                    success: false,
                    error: 'All contacts already exist in database',
                    details: [...errors, ...duplicatesInDB]
                };
            }
            
            // Prepare data for bulk insertion
            const dataToInsert = filteredData.map(item => ({
                name: item.name,
                contact: item.contact,
                batchNumber: batchNumber,
                distributionStatus: 'pending',
                assignedBy: adminId,
                createdBy: adminId,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                source: fileExtension === '.csv' ? 'csv_import' : 'excel_import',
                priority: 'medium'
            }));
            
            // Insert data in bulk
            const insertedData = await DataDistribution.insertMany(dataToInsert);
            
            console.log(`✅ [BulkOperations] Imported ${insertedData.length} records`);
            
            // Clean up the uploaded file
            ExcelParser.deleteFile(filePath);
            
            return {
                success: true,
                data: {
                    count: insertedData.length,
                    batchNumber: batchNumber,
                    fileType: fileExtension.replace('.', '').toUpperCase(),
                    errors: errors.length > 0 ? errors.slice(0, 10) : undefined, // Show first 10 errors
                    duplicatesInDB: duplicatesInDB.length > 0 ? duplicatesInDB.slice(0, 10) : undefined,
                    totalErrors: errors.length,
                    totalDuplicates: duplicatesInDB.length,
                    message: `Successfully imported ${insertedData.length} records from ${fileExtension.replace('.', '').toUpperCase()} file`
                }
            };
            
        } catch (error) {
            console.error('❌ [BulkOperations] File import error:', error);
            
            // Clean up file if it exists
            try {
                ExcelParser.deleteFile(filePath);
            } catch (cleanupError) {
                console.error('Failed to cleanup file:', cleanupError);
            }
            
            return {
                success: false,
                error: error.message || 'Failed to import file',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            };
        }
    }

    /**
     * Export data to Excel
     */
    static async exportDataToExcel(filter = {}) {
        try {
            const data = await DataDistribution.find(filter)
                .populate('assignedToInfo', 'name email')
                .populate('assignedByInfo', 'name email')
                .sort({ createdAt: -1 })
                .limit(10000); // Limit to prevent memory issues
            
            if (data.length === 0) {
                return {
                    success: false,
                    error: 'No data found to export'
                };
            }
            
            // Convert to Excel buffer
            const excelBuffer = ExcelParser.convertToExcel(data);
            
            return {
                success: true,
                data: excelBuffer,
                fileName: `data-export-${new Date().toISOString().split('T')[0]}.xlsx`,
                count: data.length
            };
            
        } catch (error) {
            console.error('❌ [BulkOperations] Export to Excel error:', error);
            return {
                success: false,
                error: error.message || 'Failed to export data to Excel'
            };
        }
    }
    
    /**
     * Generate Excel template for import
     */
    static generateExcelTemplate() {
        try {
            const templateBuffer = ExcelParser.generateTemplate();
            
            return {
                success: true,
                data: templateBuffer,
                fileName: 'data-import-template.xlsx',
                message: 'Excel template generated successfully'
            };
            
        } catch (error) {
            console.error('❌ [BulkOperations] Generate template error:', error);
            return {
                success: false,
                error: error.message || 'Failed to generate Excel template'
            };
        }
    }
    /**
     * Import data from CSV file
     */
    static async importDataFromCSV(filePath, adminId, options = {}) {
        try {
            console.log('📁 [BulkOperations] Importing from CSV:', filePath);
            
            const fs = require('fs');
            const csv = require('csv-parser');
            
            if (!fs.existsSync(filePath)) {
                return {
                    success: false,
                    error: 'CSV file not found'
                };
            }
            
            const dataArray = [];
            const errors = [];
            let batchNumber;
            
            // Generate batch number
            if (options.batchName) {
                const cleanBatchName = options.batchName
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '_')
                    .toUpperCase();
                batchNumber = `${cleanBatchName}_${Date.now()}`;
            } else {
                batchNumber = `BATCH_${Date.now()}`;
            }
            
            // Read and parse CSV file
            const results = await new Promise((resolve, reject) => {
                const rows = [];
                fs.createReadStream(filePath)
                    .pipe(csv())
                    .on('data', (row) => {
                        rows.push(row);
                    })
                    .on('end', () => {
                        resolve(rows);
                    })
                    .on('error', (error) => {
                        reject(error);
                    });
            });
            
            console.log(`📁 [BulkOperations] CSV parsed, ${results.length} rows found`);
            
            // Process each row
            for (let i = 0; i < results.length; i++) {
                const row = results[i];
                
                try {
                    // Extract data from CSV row
                    const name = row.Name || row.name || row['Full Name'] || row['Full name'] || '';
                    let contact = row.Contact || row.contact || row.Phone || row.PhoneNumber || row['Phone Number'] || row.phone || '';
                    
                    // Clean contact number
                    if (contact) {
                        contact = contact.toString().replace(/\D/g, '');
                    }
                    
                    if (!name.trim()) {
                        errors.push(`Row ${i + 1}: Missing name`);
                        continue;
                    }
                    
                    if (!contact.trim()) {
                        errors.push(`Row ${i + 1}: Missing contact`);
                        continue;
                    }
                    
                    // Validate phone number (10 digits)
                    const phoneRegex = /^[0-9]{10}$/;
                    if (!phoneRegex.test(contact)) {
                        errors.push(`Row ${i + 1}: Invalid phone number format: ${contact} (must be 10 digits)`);
                        continue;
                    }
                    
                    // Check for duplicate contact in this batch
                    const duplicate = dataArray.find(item => item.contact === contact);
                    if (duplicate) {
                        errors.push(`Row ${i + 1}: Duplicate contact number: ${contact} (also found in row ${dataArray.indexOf(duplicate) + 1})`);
                        continue;
                    }
                    
                    dataArray.push({
                        name: name.trim(),
                        contact: contact
                    });
                } catch (rowError) {
                    errors.push(`Row ${i + 1}: ${rowError.message}`);
                }
            }
            
            console.log(`📁 [BulkOperations] Valid rows: ${dataArray.length}, Errors: ${errors.length}`);
            
            if (dataArray.length === 0) {
                // Clean up file
                fs.unlinkSync(filePath);
                return {
                    success: false,
                    error: 'No valid data found in CSV file',
                    details: errors
                };
            }
            
            // Check for existing contacts in database
            const existingContacts = await DataDistribution.find({
                contact: { $in: dataArray.map(item => item.contact) }
            }).select('contact');
            
            const existingContactNumbers = existingContacts.map(c => c.contact);
            const duplicatesInDB = [];
            const filteredData = [];
            
            dataArray.forEach((item, index) => {
                if (existingContactNumbers.includes(item.contact)) {
                    duplicatesInDB.push(`Row ${index + 1}: Contact ${item.contact} already exists in database`);
                } else {
                    filteredData.push(item);
                }
            });
            
            if (filteredData.length === 0) {
                fs.unlinkSync(filePath);
                return {
                    success: false,
                    error: 'All contacts already exist in database',
                    details: [...errors, ...duplicatesInDB]
                };
            }
            
            // Prepare data for bulk insertion
            const dataToInsert = filteredData.map(item => ({
                name: item.name,
                contact: item.contact,
                batchNumber: batchNumber,
                distributionStatus: 'pending', // Initially pending, not assigned to anyone
                assignedBy: adminId, // Admin who uploaded the data
                // assignedType is NOT set here - it will be set when assigned to someone
                // assignedTo is NOT set here - it will be set when assigned to someone
                createdBy: adminId,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                source: 'csv_import',
                priority: 'medium'
            }));
            
            // Insert data in bulk
            const insertedData = await DataDistribution.insertMany(dataToInsert);
            
            console.log(`✅ [BulkOperations] Imported ${insertedData.length} records`);
            
            // Clean up the uploaded file
            fs.unlinkSync(filePath);
            
            return {
                success: true,
                data: {
                    count: insertedData.length,
                    batchNumber: batchNumber,
                    errors: errors.length > 0 ? errors : undefined,
                    duplicatesInDB: duplicatesInDB.length > 0 ? duplicatesInDB : undefined,
                    message: `Successfully imported ${insertedData.length} records${errors.length > 0 ? ` (with ${errors.length} errors)` : ''}`
                }
            };
            
        } catch (error) {
            console.error('❌ [BulkOperations] CSV import error:', error);
            
            // Clean up file if it exists
            try {
                const fs = require('fs');
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (cleanupError) {
                console.error('Failed to cleanup file:', cleanupError);
            }
            
            return {
                success: false,
                error: error.message || 'Failed to import CSV file',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            };
        }
    }


    /**
 * Admin withdraws data from TL or User
 */
static async adminWithdrawData(dataIds, adminId, reason = '') {
    try {
        if (!Array.isArray(dataIds) || dataIds.length === 0) {
            return {
                success: false,
                error: 'Data IDs array is required'
            };
        }
        
        const dataRecords = await DataDistribution.find({
            _id: { $in: dataIds },
            isActive: true
        });
        
        if (dataRecords.length === 0) {
            return {
                success: false,
                error: 'No data found'
            };
        }
        
        const withdrawalResults = [];
        const errors = [];
        
        // Withdraw each data record
        for (const data of dataRecords) {
            try {
                const result = await data.withdrawData(adminId, reason);
                withdrawalResults.push(result);
            } catch (error) {
                errors.push(`Data ${data._id}: ${error.message}`);
            }
        }
        
        return {
            success: true,
            data: {
                withdrawnCount: withdrawalResults.length,
                errors: errors.length > 0 ? errors : undefined,
                reason: reason,
                message: `Withdrawn ${withdrawalResults.length} records`
            }
        };
        
    } catch (error) {
        console.error('❌ [BulkOperations] Admin withdraw error:', error);
        return {
            success: false,
            error: error.message || 'Failed to withdraw data'
        };
    }
}
    
    /**
     * Add bulk data manually
     */
    static async addBulkData(dataArray, adminId, batchName = null) {
        try {
            if (!Array.isArray(dataArray) || dataArray.length === 0) {
                return {
                    success: false,
                    error: 'Data array is required and must not be empty'
                };
            }
            
            // Generate batch number
            let batchNumber;
            if (batchName) {
                const cleanBatchName = batchName
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '_')
                    .toUpperCase();
                batchNumber = `${cleanBatchName}_${Date.now()}`;
            } else {
                batchNumber = `MANUAL_BATCH_${Date.now()}`;
            }
            
            const validatedData = [];
            const errors = [];
            
            // Validate each data item
            dataArray.forEach((item, index) => {
                if (!item.name || !item.contact) {
                    errors.push(`Row ${index + 1}: Missing name or contact`);
                    return;
                }
                
                const phoneRegex = /^[0-9]{10}$/;
                if (!phoneRegex.test(item.contact.toString().replace(/\D/g, ''))) {
                    errors.push(`Row ${index + 1}: Invalid phone number: ${item.contact} (must be 10 digits)`);
                    return;
                }
                
                validatedData.push({
                    name: item.name.trim(),
                    contact: item.contact.toString().replace(/\D/g, '')
                });
            });
            
            if (validatedData.length === 0) {
                return {
                    success: false,
                    error: 'No valid data found',
                    details: errors
                };
            }
            
            // Check for duplicates in database
            const existingContacts = await DataDistribution.find({
                contact: { $in: validatedData.map(item => item.contact) }
            }).select('contact');
            
            const existingContactNumbers = existingContacts.map(c => c.contact);
            const duplicatesInDB = [];
            const filteredData = [];
            
            validatedData.forEach((item, index) => {
                if (existingContactNumbers.includes(item.contact)) {
                    duplicatesInDB.push(`Contact ${item.contact} already exists in database`);
                } else {
                    filteredData.push(item);
                }
            });
            
            if (filteredData.length === 0) {
                return {
                    success: false,
                    error: 'All contacts already exist in database',
                    details: [...errors, ...duplicatesInDB]
                };
            }
            
            // Prepare data for insertion
            const dataToInsert = filteredData.map(item => ({
                name: item.name,
                contact: item.contact,
                batchNumber: batchNumber,
                distributionStatus: 'pending',
                assignedBy: adminId,
                createdBy: adminId,
                isActive: true,
                source: 'manual_entry',
                priority: 'medium'
            }));
            
            const insertedData = await DataDistribution.insertMany(dataToInsert);
            
            return {
                success: true,
                data: {
                    count: insertedData.length,
                    batchNumber: batchNumber,
                    errors: errors.length > 0 ? errors : undefined,
                    duplicatesInDB: duplicatesInDB.length > 0 ? duplicatesInDB : undefined,
                    message: `Successfully added ${insertedData.length} records`
                }
            };
            
        } catch (error) {
            console.error('❌ [BulkOperations] Add bulk data error:', error);
            return {
                success: false,
                error: error.message || 'Failed to add bulk data'
            };
        }
    }
    
    /**
     * Assign data to TL
     */
    static async assignDataToTL(count, tlId, adminId) {
        try {
            if (!count || count <= 0 || !tlId) {
                return {
                    success: false,
                    error: 'Valid count and TL ID are required'
                };
            }
            
            // Check if TL exists and has TL role
            const tl = await User.findOne({ _id: tlId, role: 'TL', status: 'active' });
            if (!tl) {
                return {
                    success: false,
                    error: 'TL not found or not active'
                };
            }
            
            // Find pending data
            const pendingData = await DataDistribution.find({
                distributionStatus: 'pending',
                isActive: true
            }).limit(count);
            
            if (pendingData.length === 0) {
                return {
                    success: false,
                    error: 'No pending data available'
                };
            }
            
            const dataIds = pendingData.map(data => data._id);
            
            // Update data to assign to TL
            await DataDistribution.updateMany(
                { _id: { $in: dataIds } },
                {
                    $set: {
                        assignedTo: tlId,
                        assignedType: 'tl',
                        assignedBy: adminId,
                        assignedAt: new Date(),
                        distributionStatus: 'assigned',
                        updatedAt: new Date()
                    }
                }
            );
            
            return {
                success: true,
                data: {
                    count: pendingData.length,
                    tlId: tlId,
                    tlName: tl.name,
                    assignedAt: new Date(),
                    message: `Successfully assigned ${pendingData.length} records to TL ${tl.name}`
                }
            };
            
        } catch (error) {
            console.error('❌ [BulkOperations] Assign to TL error:', error);
            return {
                success: false,
                error: error.message || 'Failed to assign data to TL'
            };
        }
    }
    
    /**
     * Assign data directly to user
     */
    static async assignDataToUser(count, userId, adminId) {
        try {
            if (!count || count <= 0 || !userId) {
                return {
                    success: false,
                    error: 'Valid count and User ID are required'
                };
            }
            
            // Check if user exists and is active
            const user = await User.findOne({ _id: userId, role: 'user', status: 'active' });
            if (!user) {
                return {
                    success: false,
                    error: 'User not found or not active'
                };
            }
            
            // Find pending data
            const pendingData = await DataDistribution.find({
                distributionStatus: 'pending',
                isActive: true
            }).limit(count);
            
            if (pendingData.length === 0) {
                return {
                    success: false,
                    error: 'No pending data available'
                };
            }
            
            const dataIds = pendingData.map(data => data._id);
            
            // Update data to assign directly to user
            await DataDistribution.updateMany(
                { _id: { $in: dataIds } },
                {
                    $set: {
                        assignedTo: userId,
                        assignedType: 'direct_user',
                        assignedBy: adminId,
                        assignedAt: new Date(),
                        distributionStatus: 'assigned',
                        updatedAt: new Date()
                    },
                    $push: {
                        teamAssignments: {
                            teamMember: userId,
                            assignedBy: adminId,
                            status: 'pending',
                            assignedAt: new Date()
                        }
                    }
                }
            );
            
            // Update user statistics
            await User.findByIdAndUpdate(userId, {
                $inc: {
                    'statistics.totalLeads': pendingData.length,
                    'statistics.pendingLeads': pendingData.length,
                    'statistics.todaysLeads': pendingData.length
                }
            });
            
            return {
                success: true,
                data: {
                    count: pendingData.length,
                    userId: userId,
                    userName: user.name,
                    assignedAt: new Date(),
                    message: `Successfully assigned ${pendingData.length} records to user ${user.name}`
                }
            };
            
        } catch (error) {
            console.error('❌ [BulkOperations] Assign to user error:', error);
            return {
                success: false,
                error: error.message || 'Failed to assign data to user'
            };
        }
    }
    
    /**
     * TL distributes data to team members
     */
    static async tlDistributeDataToTeam(tlId, dataIds, teamMemberIds, distributionMethod = 'manual') {
        try {
            if (!Array.isArray(dataIds) || dataIds.length === 0) {
                return {
                    success: false,
                    error: 'Data IDs array is required'
                };
            }
            
            if (!Array.isArray(teamMemberIds) || teamMemberIds.length === 0) {
                return {
                    success: false,
                    error: 'Team member IDs array is required'
                };
            }
            
            // Verify TL exists
            const tl = await User.findById(tlId);
            if (!tl || tl.role !== 'TL') {
                return {
                    success: false,
                    error: 'TL not found'
                };
            }
            
            // Get data assigned to this TL
            const dataRecords = await DataDistribution.find({
                _id: { $in: dataIds },
                assignedTo: tlId,
                assignedType: 'tl',
                distributionStatus: 'assigned',
                isActive: true
            });
            
            if (dataRecords.length === 0) {
                return {
                    success: false,
                    error: 'No data found or data not assigned to you'
                };
            }
            
            // Verify team members belong to this TL
            const teamMembers = await User.find({
                _id: { $in: teamMemberIds },
                reportingTo: tlId,
                role: 'user',
                status: 'active'
            });
            
            if (teamMembers.length === 0) {
                return {
                    success: false,
                    error: 'No valid team members found'
                };
            }
            
            // Distribute data based on method
            const distributionResults = [];
            const errors = [];
            
            if (distributionMethod === 'manual') {
                // Manual distribution: equal distribution among team members
                const dataPerMember = Math.ceil(dataRecords.length / teamMembers.length);
                
                for (let i = 0; i < teamMembers.length; i++) {
                    const member = teamMembers[i];
                    const startIdx = i * dataPerMember;
                    const endIdx = Math.min(startIdx + dataPerMember, dataRecords.length);
                    const memberData = dataRecords.slice(startIdx, endIdx);
                    
                    for (const data of memberData) {
                        try {
                            const result = await data.distributeToTeamMember(member._id, tlId, distributionMethod);
                            distributionResults.push(result);
                        } catch (error) {
                            errors.push(`Data ${data._id}: ${error.message}`);
                        }
                    }
                }
            } else if (distributionMethod === 'equal') {
                // Equal distribution
                const dataPerMember = Math.floor(dataRecords.length / teamMembers.length);
                let remaining = dataRecords.length % teamMembers.length;
                
                let dataIndex = 0;
                for (const member of teamMembers) {
                    let memberCount = dataPerMember;
                    if (remaining > 0) {
                        memberCount++;
                        remaining--;
                    }
                    
                    for (let j = 0; j < memberCount; j++) {
                        if (dataIndex < dataRecords.length) {
                            try {
                                const result = await dataRecords[dataIndex].distributeToTeamMember(member._id, tlId, distributionMethod);
                                distributionResults.push(result);
                            } catch (error) {
                                errors.push(`Data ${dataRecords[dataIndex]._id}: ${error.message}`);
                            }
                            dataIndex++;
                        }
                    }
                }
            } else {
                // For other methods, distribute sequentially
                for (let i = 0; i < dataRecords.length; i++) {
                    const data = dataRecords[i];
                    const memberIndex = i % teamMembers.length;
                    const member = teamMembers[memberIndex];
                    
                    try {
                        const result = await data.distributeToTeamMember(member._id, tlId, distributionMethod);
                        distributionResults.push(result);
                    } catch (error) {
                        errors.push(`Data ${data._id}: ${error.message}`);
                    }
                }
            }
            
            return {
                success: true,
                data: {
                    distributedCount: distributionResults.length,
                    errors: errors.length > 0 ? errors : undefined,
                    teamMemberIds: teamMemberIds,
                    distributionMethod: distributionMethod,
                    message: `Distributed ${distributionResults.length} records to ${teamMembers.length} team members`
                }
            };
            
        } catch (error) {
            console.error('❌ [BulkOperations] TL distribute error:', error);
            return {
                success: false,
                error: error.message || 'Failed to distribute data'
            };
        }
    }
    
    /**
     * TL withdraws data from team members
     */
    static async tlWithdrawDataFromTeam(tlId, dataIds, teamMemberIds, reason = '') {
        try {
            if (!Array.isArray(dataIds) || dataIds.length === 0) {
                return {
                    success: false,
                    error: 'Data IDs array is required'
                };
            }
            
            if (!Array.isArray(teamMemberIds) || teamMemberIds.length === 0) {
                return {
                    success: false,
                    error: 'Team member IDs array is required'
                };
            }
            
            // Get data assigned to this TL
            const dataRecords = await DataDistribution.find({
                _id: { $in: dataIds },
                assignedTo: tlId,
                assignedType: 'tl',
                isActive: true
            });
            
            if (dataRecords.length === 0) {
                return {
                    success: false,
                    error: 'No data found or data not assigned to you'
                };
            }
            
            const withdrawalResults = [];
            const errors = [];
            
            // Withdraw data from team members
            for (const data of dataRecords) {
                for (const teamMemberId of teamMemberIds) {
                    try {
                        const result = await data.withdrawFromTeamMember(teamMemberId, tlId, reason);
                        withdrawalResults.push(result);
                    } catch (error) {
                        // Check if data is assigned to this team member
                        const isAssigned = data.teamAssignments.some(ta => 
                            ta.teamMember.toString() === teamMemberId.toString() && !ta.withdrawn
                        );
                        
                        if (!isAssigned) {
                            errors.push(`Data ${data._id}: Not assigned to team member ${teamMemberId}`);
                        } else {
                            errors.push(`Data ${data._id}: ${error.message}`);
                        }
                    }
                }
            }
            
            return {
                success: true,
                data: {
                    withdrawnCount: withdrawalResults.length,
                    errors: errors.length > 0 ? errors : undefined,
                    teamMemberIds: teamMemberIds,
                    reason: reason,
                    message: `Withdrawn ${withdrawalResults.length} records from team members`
                }
            };
            
        } catch (error) {
            console.error('❌ [BulkOperations] TL withdraw error:', error);
            return {
                success: false,
                error: error.message || 'Failed to withdraw data'
            };
        }
    }
    
    /**
     * Get batch statistics
     */
    static async getBatchStatistics(batchNumber) {
        try {
            if (!batchNumber) {
                return {
                    success: false,
                    error: 'Batch number is required'
                };
            }
            
            const stats = await DataDistribution.getBatchStats(batchNumber);
            
            return {
                success: true,
                data: stats
            };
            
        } catch (error) {
            console.error('❌ [BulkOperations] Get batch stats error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get batch statistics'
            };
        }
    }
    
    /**
     * Get TL statistics
     */
    static async getTLStatistics(tlId) {
        try {
            const stats = await DataDistribution.getTLDataStats(tlId);
            
            return {
                success: true,
                data: stats
            };
            
        } catch (error) {
            console.error('❌ [BulkOperations] Get TL stats error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get TL statistics'
            };
        }
    }
    
    /**
     * Bulk assign data based on criteria
     */
    static async bulkAssignData(assignmentType, adminId, options = {}) {
        try {
            let userQuery = {};
            let assignmentMessage = '';
            
            switch (assignmentType) {
                case 'all_active':
                    userQuery = { role: 'user', status: 'active' };
                    assignmentMessage = 'all active users';
                    break;
                    
                case 'present_today':
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    userQuery = {
                        role: 'user',
                        status: 'active',
                        'attendance.todayStatus': 'present',
                        'attendance.todayMarkedAt': { $gte: today }
                    };
                    assignmentMessage = 'users present today';
                    break;
                    
                case 'without_data':
                    const todayDate = new Date();
                    todayDate.setHours(0, 0, 0, 0);
                    userQuery = {
                        role: 'user',
                        status: 'active',
                        $or: [
                            { 'leadDistribution.lastLeadDistributionDate': { $lt: todayDate } },
                            { 'leadDistribution.lastLeadDistributionDate': { $exists: false } }
                        ]
                    };
                    assignmentMessage = 'users without data today';
                    break;
                    
                default:
                    return {
                        success: false,
                        error: 'Invalid assignment type'
                    };
            }
            
            // Get users
            const users = await User.find(userQuery);
            
            if (users.length === 0) {
                return {
                    success: false,
                    error: `No ${assignmentMessage} found`
                };
            }
            
            // Get pending data
            const dataPerUser = options.dataPerUser || 5; // Default 5 per user
            const totalDataNeeded = users.length * dataPerUser;
            
            const pendingData = await DataDistribution.find({
                distributionStatus: 'pending',
                isActive: true
            }).limit(totalDataNeeded);
            
            if (pendingData.length === 0) {
                return {
                    success: false,
                    error: 'No pending data available'
                };
            }
            
            const dataIds = pendingData.map(data => data._id);
            
            // Create bulk write operations
            const bulkOps = [];
            let dataIndex = 0;
            
            for (const user of users) {
                for (let i = 0; i < dataPerUser; i++) {
                    if (dataIndex >= dataIds.length) break;
                    
                    bulkOps.push({
                        updateOne: {
                            filter: { _id: dataIds[dataIndex] },
                            update: {
                                $set: {
                                    assignedTo: user._id,
                                    assignedType: 'direct_user',
                                    assignedBy: adminId,
                                    assignedAt: new Date(),
                                    distributionStatus: 'assigned',
                                    updatedAt: new Date()
                                },
                                $push: {
                                    teamAssignments: {
                                        teamMember: user._id,
                                        assignedBy: adminId,
                                        status: 'pending',
                                        assignedAt: new Date()
                                    }
                                }
                            }
                        }
                    });
                    
                    dataIndex++;
                }
            }
            
            if (bulkOps.length === 0) {
                return {
                    success: false,
                    error: 'No data to assign'
                };
            }
            
            // Execute bulk write
            const result = await DataDistribution.bulkWrite(bulkOps);
            
            // Update user statistics
            const userUpdateOps = users.map(user => ({
                updateOne: {
                    filter: { _id: user._id },
                    update: {
                        $inc: {
                            'statistics.totalLeads': dataPerUser,
                            'statistics.pendingLeads': dataPerUser,
                            'statistics.todaysLeads': dataPerUser
                        }
                    }
                }
            }));
            
            await User.bulkWrite(userUpdateOps);
            
            return {
                success: true,
                data: {
                    assignedCount: result.modifiedCount,
                    userCount: users.length,
                    dataPerUser: dataPerUser,
                    assignmentType: assignmentType,
                    message: `Assigned ${result.modifiedCount} records to ${users.length} users (${assignmentMessage})`
                }
            };
            
        } catch (error) {
            console.error('❌ [BulkOperations] Bulk assign error:', error);
            return {
                success: false,
                error: error.message || 'Failed to bulk assign data'
            };
        }
    }

    /**
   * Get users who are present today
   */
  static async getPresentUsersToday() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return await User.find({
            role: 'user',
            status: 'active',
            'attendance.todayStatus': 'present',
            'attendance.todayMarkedAt': { $gte: today },
            'attendance.todayStatus': 'present'
        }).select('_id name email phoneNumber attendance statistics');
    } catch (error) {
        console.error('Error getting present users:', error);
        return [];
    }
}

    /**
   * Get users who are present but didn't get data today
   */
  static async getUsersWithoutDataToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await User.find({
      role: 'user',
      status: 'active',
      'attendance.todayStatus': 'present',
      'attendance.todayMarkedAt': { $gte: today },
      $or: [
        { 'leadDistribution.lastLeadDistributionDate': { $lt: today } },
        { 'leadDistribution.lastLeadDistributionDate': { $exists: false } }
      ]
    }).select('_id name email phoneNumber attendance leadDistribution');
  }

  /**
   * Get all team leaders
   */
  static async getAllTeamLeaders() {
    return await User.find({
      role: 'TL',
      status: 'active'
    }).select('_id name email phoneNumber');
  }

  /**
   * Get all active HR users
   */
  static async getAllActiveUsers() {
    return await User.find({
      role: 'user',
      status: 'active'
    }).select('_id name email phoneNumber status');
  }
    
    /**
     * Get all batches summary
     */
    static async getAllBatches() {
        try {
            const batches = await DataDistribution.aggregate([
                {
                    $group: {
                        _id: '$batchNumber',
                        total: { $sum: 1 },
                        pending: {
                            $sum: { $cond: [{ $eq: ['$distributionStatus', 'pending'] }, 1, 0] }
                        },
                        assigned: {
                            $sum: { $cond: [{ $eq: ['$distributionStatus', 'assigned'] }, 1, 0] }
                        },
                        distributed: {
                            $sum: { $cond: [{ $eq: ['$distributionStatus', 'distributed'] }, 1, 0] }
                        },
                        withdrawn: {
                            $sum: { $cond: [{ $eq: ['$distributionStatus', 'withdrawn'] }, 1, 0] }
                        },
                        createdAt: { $first: '$createdAt' },
                        createdBy: { $first: '$createdBy' }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'createdBy',
                        foreignField: '_id',
                        as: 'creatorInfo'
                    }
                },
                {
                    $unwind: {
                        path: '$creatorInfo',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        batchNumber: '$_id',
                        _id: 0,
                        total: 1,
                        pending: 1,
                        assigned: 1,
                        distributed: 1,
                        withdrawn: 1,
                        createdAt: 1,
                        creatorName: '$creatorInfo.name',
                        creatorEmail: '$creatorInfo.email'
                    }
                },
                {
                    $sort: { createdAt: -1 }
                }
            ]);
            
            return batches;
            
        } catch (error) {
            console.error('❌ [BulkOperations] Get batches error:', error);
            throw error;
        }
    }
}

module.exports = BulkDataOperations;