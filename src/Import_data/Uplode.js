import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Upload.css';
import * as XLSX from 'xlsx';

const dbName = "TariffDB";
const storeName = "files";

// Backend API URL
const API_URL = "http://localhost:8000";

const initDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" });
      }
    };
  });
};

const Upload = () => {
  const navigate = useNavigate();
  const [supplyChainFile, setSupplyChainFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [savedFiles, setSavedFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewType, setPreviewType] = useState('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [productFile, setProductFile] = useState(null);
  const [fileType, setFileType] = useState(''); // 'supply' or 'product'
  const [apiResponse, setApiResponse] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadSavedFiles();
  }, []);

  const loadSavedFiles = async () => {
    try {
      const db = await initDB();
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        setSavedFiles(request.result);
      };
    } catch (error) {
      setUploadStatus('Error loading files: ' + error.message);
    }
  };
 
  const handleFileChange = (e, type) => {
    const selectedFile = e.target.files[0];
    type === 'supply' ? setSupplyChainFile(selectedFile) : setProductFile(selectedFile);
    setFileType(type);
    setPreviewType('upload');
    
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      
      if (fileExtension === 'csv') {
        // Handle CSV files
        const reader = new FileReader();
        reader.onload = (event) => {
          // Get the raw content of the file as text
          const content = event.target.result;
          // Split the content by new lines to separate each row
          const lines = content.split('\n');
          
          // Extract the first line as headers, remove whitespace from each header
          const headerRow = lines[0].split(',').map(header => header.trim());
          setHeaders(headerRow);

          // Process all remaining lines as data rows
          // For each line: split by comma and trim whitespace from each cell
          const dataRows = lines.slice(1).map(line => 
            line.split(',').map(cell => cell.trim())
          );
          // Save all processed rows to state
          setRows(dataRows); // Show all rows
        };
        // Start reading the file as text
        reader.readAsText(selectedFile);
      } else if (['xlsx', 'xls'].includes(fileExtension)) {
        // Handle Excel files
        const reader = new FileReader();
        reader.onload = (event) => {
          // Convert the file content to a binary array
          const data = new Uint8Array(event.target.result);
          // Parse the Excel file using XLSX library
          const workbook = XLSX.read(data, { type: 'array' });
          // Get the first worksheet from the workbook
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          // Convert the worksheet to JSON format with array structure
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          if (jsonData.length > 0) {
            setHeaders(jsonData[0]);
            setRows(jsonData.slice(1)); // Show all rows
          }
        };
        reader.readAsArrayBuffer(selectedFile);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleFileChange({ target: { files: [e.dataTransfer.files[0]] } });
    }
  };

  const preventDefault = (e) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    const fileToUpload = fileType === 'supply' ? supplyChainFile : productFile;
    if (fileToUpload) {
      try {
        setIsProcessing(true);
        const db = await initDB();
        const newFileId = `${fileType === 'supply' ? 'S' : 'P'}${savedFiles.length + 1}`.padStart(3, '0');
        
        const fileData = {
          id: newFileId,
          headers: headers,
          rows: rows,
          fileName: fileToUpload.name,
          fileType: fileType === 'supply' ? 'supplyChain' : 'product',
          uploadDate: new Date().toISOString()
        };

        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        await store.add(fileData);

        setUploadStatus(`File uploaded successfully! Saved with ID: ${newFileId}`);
        await loadSavedFiles();
        
        // If it's a supply chain file, also send it to the backend API
        if (fileType === 'supply') {
          await sendToBackend(fileData);
        }

        fileType === 'supply' ? setSupplyChainFile(null) : setProductFile(null);
        setHeaders([]);
        setRows([]);
      } catch (error) {
        setUploadStatus('Error saving file: ' + error.message);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Function to send data to backend API
  const sendToBackend = async (fileData) => {
    try {
      const response = await fetch(`${API_URL}/process-supply-data/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          headers: fileData.headers,
          rows: fileData.rows
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setApiResponse(result);
      
      if (result.success) {
        setUploadStatus(prevStatus => `${prevStatus} - ${result.message}`);
      } else {
        setUploadStatus(prevStatus => `${prevStatus} - API Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error sending data to backend:', error);
      setUploadStatus(prevStatus => `${prevStatus} - Failed to connect to backend: ${error.message}`);
    }
  };

  // Function to send a file to the backend for processing
  const processWithBackend = async (fileId) => {
    try {
      setIsProcessing(true);
      
      const db = await initDB();
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(fileId);
      
      request.onsuccess = async () => {
        const fileData = request.result;
        
        if (fileData && fileData.fileType === 'supplyChain') {
          await sendToBackend(fileData);
          setUploadStatus(`File ${fileId} sent to backend for processing`);
        } else {
          setUploadStatus('Only supply chain files can be processed with the backend');
        }
      };
    } catch (error) {
      setUploadStatus('Error processing with backend: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (idToDelete) => {
    try {
      const db = await initDB();
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      await store.delete(idToDelete);
      
      setUploadStatus('File deleted successfully');
      await loadSavedFiles();
    } catch (error) {
      setUploadStatus('Error deleting file: ' + error.message);
    }
  };

  const handlePreview = async (fileId) => {
    try {
      const db = await initDB();
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(fileId);
      
      request.onsuccess = () => {
        setPreviewFile(request.result);
        setHeaders(request.result.headers);
        setRows(request.result.rows);
        setPreviewType('saved');
        setIsPreviewModalOpen(true);
      };
    } catch (error) {
      setUploadStatus('Error loading preview: ' + error.message);
    }
  };

  const clearPreview = () => {
    setPreviewType('');
    setPreviewFile(null);
    if (!supplyChainFile) {
      setHeaders([]);
      setRows([]);
    }
  };

  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
    clearPreview();
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  // Modify the saved files table to add "Process" button
  const renderSupplyChainFiles = () => (
    <>
      <div className='section-title'>Saved Supply Chain Files</div>
      <div className="saved-files-list">
        <table className="saved-files-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>File Name</th>
              <th>Upload Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {savedFiles.filter(file => file.fileType === 'supplyChain').map((savedFile) => (
              <tr key={savedFile.id}>
                <td>{savedFile.id}</td>
                <td>{savedFile.fileName}</td>
                <td>{new Date(savedFile.uploadDate).toLocaleDateString()}</td>
                <td className="action-buttons">
                  <button 
                    className="preview-btn"
                    onClick={() => handlePreview(savedFile.id)}
                  >
                    Preview
                  </button>
                  <button 
                    className="process-btn"
                    onClick={() => processWithBackend(savedFile.id)}
                    disabled={isProcessing}
                  >
                    Process
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(savedFile.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  return (
    <div className="upload-page">
      <div className="header">
        <img src="/images/mu-sigma-logo-1.png" alt="Mu Sigma" className="musigma-logo" />
        <button className="back-btn" onClick={handleBack}>Back to Dashboard</button>
      </div>
      
      <div className="upload-container">
        <div className="upload-content">
          <div className="upload-title">Upload Data</div>
          
          <div className="upload-grid">
            <div className="info-section">
              <section className="about-section">
                <div className="section-title">About Supply Chain Data Upload</div>
                <div className="section-content">
                  <p>
                    Upload supply chain data files to enhance your simulation with real-world data. 
                    The simulator accepts CSV and Excel files for supply chain analysis.
                  </p>
                </div>
              </section>
            </div>

            <div className="info-section">
              <section className="about-section">
                <div className="section-title">About Product Data Upload</div>
                <div className="section-content">
                  <p>
                    Upload product data files containing details about your products, pricing, 
                    and specifications. The simulator accepts CSV and Excel files for product analysis.
                  </p>
                </div>
              </section>
            </div>

            <div className="templates-section">
              <div className="section-title">Sample Templates</div>
              <div className="section-content">
                <p>Download the sample templates to see the expected format:</p>
                <ul className="template-list">
                  <li><a href="#">Supply Chain Template</a></li>
                  <li><a href="#">Product Data Template</a></li>
                </ul>
              </div>
            </div>

            {/* Supply Chain Upload Section */}
            <div className="file-upload-container">
              <section className="file-upload-section">
                <div className="section-title">Supply Chain Data</div>
                <div 
                  className="file-drop-zone"
                  onDrop={(e) => { e.preventDefault(); handleFileChange({ target: { files: [e.dataTransfer.files[0]] } }, 'supply'); }}
                  onDragOver={preventDefault}
                  onDragEnter={preventDefault}
                >
                  <h3 className="drop-zone-title">Drag and Drop or Select Supply Chain File</h3>
                  <p className="file-requirements">CSV or Excel files only</p>
                  <input 
                    type="file" 
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => handleFileChange(e, 'supply')}
                    className="file-input"
                    id="supplyChainInput"
                  />
                  <label htmlFor="supplyChainInput" className="file-select-button">
                    Select File
                  </label>
                  {supplyChainFile && (
                    <p className="file-info">Selected: {supplyChainFile.name}</p>
                  )}
                </div>
                <button 
                  className="upload-submit-btn" 
                  onClick={() => { setFileType('supply'); handleUpload(); }}
                  disabled={!supplyChainFile}
                >
                  Upload Supply Chain File
                </button>
              </section>
            </div>

            {/* Product Data Upload Section */}
            <div className="file-upload-container">
              <section className="file-upload-section">
                <div className="section-title">Product Data</div>
                <div 
                  className="file-drop-zone"
                  onDrop={(e) => { e.preventDefault(); handleFileChange({ target: { files: [e.dataTransfer.files[0]] } }, 'product'); }}
                  onDragOver={preventDefault}
                  onDragEnter={preventDefault}
                >
                  <h3 className="drop-zone-title">Drag and Drop or Select Product File</h3>
                  <p className="file-requirements">CSV or Excel files only</p>
                  <input 
                    type="file" 
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => handleFileChange(e, 'product')}
                    className="file-input"
                    id="productInput"
                  />
                  <label htmlFor="productInput" className="file-select-button">
                    Select File
                  </label>
                  {productFile && (
                    <p className="file-info">Selected: {productFile.name}</p>
                  )}
                </div>
                <button 
                  className="upload-submit-btn" 
                  onClick={() => { setFileType('product'); handleUpload(); }}
                  disabled={!productFile}
                >
                  Upload Product File
                </button>
              </section>
            </div>

            <div className="action-section">
              {uploadStatus && (
                <div className={`upload-status ${uploadStatus.includes('Error') ? 'error' : 'success'}`}>
                  {uploadStatus}
                </div>
              )}
              {isProcessing && (
                <div className="processing-indicator">
                  Processing data, please wait...
                </div>
              )}
              {apiResponse && (
                <div className="api-response">
                  <h3>Backend Processing Result</h3>
                  <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
                </div>
              )}
            </div>

            <div className="saved-files-section">
              {renderSupplyChainFiles()}
            </div>

            <div className="saved-files-section">
              <div className='section-title'>Saved Product Files</div>
              <div className="saved-files-list">
                <table className="saved-files-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>File Name</th>
                      <th>Upload Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* View Product Table - Displays all saved product files */}
                    {savedFiles.filter(file => file.fileType === 'product').map((savedFile) => (
                      <tr key={savedFile.id}>
                        <td>{savedFile.id}</td>
                        <td>{savedFile.fileName}</td>
                        <td>{new Date(savedFile.uploadDate).toLocaleDateString()}</td>
                        <td className="action-buttons">
                          <button 
                            className="preview-btn"
                            onClick={() => handlePreview(savedFile.id)}
                          >
                            Preview
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDelete(savedFile.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isPreviewModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Data Preview</h2>
              <button className="close-modal" onClick={closePreviewModal}>&times;</button>
            </div>
            <div className="modal-body">
              {headers.length > 0 ? (
                <div className="table-container">
                  <table className="preview-table">
                    <thead>
                      <tr>
                        {headers.map((header, index) => (
                          <th key={index} className="preview-header">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="preview-row">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="preview-cell">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No data to preview</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;