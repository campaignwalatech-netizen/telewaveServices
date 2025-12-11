import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle, Download, AlertCircle } from 'lucide-react';
import dataService from '../../../services/dataService';

const UploadDataPage = () => {
  const [uploadMethod, setUploadMethod] = useState('manual');
  const [manualData, setManualData] = useState([{ name: '', contact: '' }]);
  const [file, setFile] = useState(null);
  const [batchName, setBatchName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  
  const addManualRow = () => {
    setManualData([...manualData, { name: '', contact: '' }]);
  };
  
  const removeManualRow = (index) => {
    if (manualData.length > 1) {
      const newData = [...manualData];
      newData.splice(index, 1);
      setManualData(newData);
    }
  };
  
  const updateManualRow = (index, field, value) => {
    const newData = [...manualData];
    newData[index][field] = value;
    setManualData(newData);
  };
  
  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        alert('Please upload a CSV file');
        return;
      }
      setFile(selectedFile);
    }
  };
  
  const handleUpload = async () => {
  // Validation
  if (uploadMethod === 'manual') {
    const validData = manualData.filter(row => row.name.trim() && row.contact.trim());
    if (validData.length === 0) {
      alert('Please enter at least one valid data row');
      return;
    }
    
    // Validate phone numbers
    for (const row of validData) {
      if (!dataService.validatePhoneNumber(row.contact)) {
        alert(`Invalid phone number: ${row.contact}. Must be 10 digits.`);
        return;
      }
    }
  } else {
    if (!file) {
      alert('Please select a CSV file');
      return;
    }
  }
  
  setUploading(true);
  
  try {
    let uploadResult;
    
    if (uploadMethod === 'manual') {
      const dataToUpload = manualData.filter(row => row.name.trim() && row.contact.trim());
      uploadResult = await dataService.addBulkData(dataToUpload, batchName || null);
    } else {
      uploadResult = await dataService.importDataFromCSV(file, {
        batchName: batchName || undefined
      });
    }
    
    setResult(uploadResult);
    
    if (uploadResult.success) {
      alert(`Successfully uploaded ${uploadResult.data?.count || 'data'} records`);
      // Reset form
      setManualData([{ name: '', contact: '' }]);
      setFile(null);
      setBatchName('');
    } else {
      alert(`Error: ${uploadResult.error || 'Upload failed'}`);
    }
  } catch (error) {
    console.error('Upload error:', error);
    alert('An error occurred during upload');
  }
  
  setUploading(false);
};
  
  const downloadTemplate = () => {
    dataService.downloadTemplate();
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Upload Data</h1>
        <p className="text-gray-600">Add new data records to the system</p>
      </div>
      
      {/* Upload Method Selection */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Upload Method</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setUploadMethod('manual')}
            className={`p-4 rounded-lg border-2 transition-all ${
              uploadMethod === 'manual'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg mr-4 ${
                uploadMethod === 'manual' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <FileText className={uploadMethod === 'manual' ? 'text-blue-600' : 'text-gray-600'} />
              </div>
              <div className="text-left">
                <div className="font-medium">Manual Entry</div>
                <div className="text-sm text-gray-600">Enter data manually</div>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setUploadMethod('csv')}
            className={`p-4 rounded-lg border-2 transition-all ${
              uploadMethod === 'csv'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg mr-4 ${
                uploadMethod === 'csv' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Upload className={uploadMethod === 'csv' ? 'text-blue-600' : 'text-gray-600'} />
              </div>
              <div className="text-left">
                <div className="font-medium">CSV Upload</div>
                <div className="text-sm text-gray-600">Upload CSV file</div>
              </div>
            </div>
          </button>
        </div>
        
        {/* Batch Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Batch Name (Optional)
          </label>
          <input
            type="text"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            placeholder="e.g., December_Batch_1"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-gray-500 text-sm mt-1">Leave empty for auto-generated batch name</p>
        </div>
        
        {/* Manual Entry Form */}
        {uploadMethod === 'manual' && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Data Entries</h3>
              <button
                onClick={addManualRow}
                className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm font-medium"
              >
                + Add Row
              </button>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto p-2">
              {manualData.map((row, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Name"
                      value={row.name}
                      onChange={(e) => updateManualRow(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Contact (10 digits)"
                      value={row.contact}
                      onChange={(e) => updateManualRow(index, 'contact', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => removeManualRow(index)}
                    className="p-2 text-gray-400 hover:text-red-500"
                    disabled={manualData.length === 1}
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <AlertCircle size={14} className="inline mr-1" />
              Enter name and 10-digit contact number for each record
            </div>
          </div>
        )}
        
        {/* CSV Upload Form */}
        {uploadMethod === 'csv' && (
          <div className="mb-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {file ? (
                <div className="flex items-center justify-center space-x-3">
                  <FileText className="text-green-600" size={24} />
                  <div className="text-left">
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto text-gray-400 mb-4" size={32} />
                  <p className="text-gray-600 mb-2">Drag & drop CSV file here</p>
                  <p className="text-gray-500 text-sm mb-4">or</p>
                  <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                    Browse Files
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </>
              )}
            </div>
            
            <div className="mt-4">
              <button
                onClick={downloadTemplate}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
              >
                <Download size={14} className="mr-1" />
                Download CSV Template
              </button>
              <p className="text-gray-500 text-sm mt-2">
                CSV format: Name,Contact (10 digits). First row should be headers.
              </p>
            </div>
          </div>
        )}
        
        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload size={18} />
              <span>Upload Data</span>
            </>
          )}
        </button>
      </div>
      
      {/* Result Display */}
      {result && (
        <div className={`rounded-xl p-6 ${
          result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start">
            <div className={`p-2 rounded-lg mr-4 ${
              result.success ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {result.success ? (
                <CheckCircle className="text-green-600" size={24} />
              ) : (
                <AlertCircle className="text-red-600" size={24} />
              )}
            </div>
            <div>
              <h3 className={`font-semibold ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.success ? 'Upload Successful!' : 'Upload Failed'}
              </h3>
              <p className={`mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.data?.message || result.error}
              </p>
              {result.success && result.data && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white/50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Records Uploaded</div>
                    <div className="font-bold">{result.data.count}</div>
                  </div>
                  <div className="bg-white/50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Batch Number</div>
                    <div className="font-bold">{result.data.batchNumber}</div>
                  </div>
                  <div className="bg-white/50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Status</div>
                    <div className="font-bold text-green-600">Pending</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadDataPage;