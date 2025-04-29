import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Upload.css';
import * as XLSX from 'xlsx';

const dbName = "TariffDB";
const storeName = "files";

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
      console.error('Error loading files:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setSupplyChainFile(selectedFile);
    setPreviewType('upload');
    
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      
      if (fileExtension === 'csv') {
        // Handle CSV files
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target.result;
          const lines = content.split('\n');
          
          const headerRow = lines[0].split(',').map(header => header.trim());
          setHeaders(headerRow);

          const dataRows = lines.slice(1).map(line => 
            line.split(',').map(cell => cell.trim())
          );
          setRows(dataRows.slice(0, 10)); // Show first 10 rows
        };
        reader.readAsText(selectedFile);
      } else if (['xlsx', 'xls'].includes(fileExtension)) {
        // Handle Excel files
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          if (jsonData.length > 0) {
            setHeaders(jsonData[0]);
            setRows(jsonData.slice(1, 11)); // Show first 10 rows
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
    if (supplyChainFile) {
      try {
        const db = await initDB();
        const newFileId = `00${savedFiles.length + 1}`.slice(-3);
        
        const fileData = {
          id: newFileId,
          headers: headers,
          rows: rows,
          fileName: supplyChainFile.name,
          fileType: 'supplyChain',
          uploadDate: new Date().toISOString()
        };

        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        await store.add(fileData);

        setUploadStatus(`File uploaded successfully! Saved with ID: ${newFileId}`);
        await loadSavedFiles();
        
        setSupplyChainFile(null);
        setHeaders([]);
        setRows([]);
      } catch (error) {
        setUploadStatus('Error saving file: ' + error.message);
      }
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

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="upload-page">
      <div className="header">
        <img src="/images/mu-sigma-logo-1.png" alt="Mu Sigma" className="musigma-logo" />
        <button className="back-btn" onClick={handleBack}>Back to Dashboard</button>
      </div>
      
      <div className="upload-container">
        <div className="upload-content">
          <div className="upload-title">Upload Supply Chain Data</div>
          
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

            <div className="templates-section">
              <div className="section-title">Sample Template</div>
              <div className="section-content">
                <p>Download the sample template to see the expected format:</p>
                <ul className="template-list">
                  <li><a href="#">Supply Chain Template</a></li>
                </ul>
              </div>
            </div>

            <div className="file-upload-container">
              <section className="file-upload-section">
                <div className="section-title">Supply Chain Data</div>
                <div 
                  className="file-drop-zone"
                  onDrop={handleDrop}
                  onDragOver={preventDefault}
                  onDragEnter={preventDefault}
                >
                  <h3 className="drop-zone-title">Drag and Drop or Select File</h3>
                  <p className="file-requirements">CSV or Excel files only</p>
                  <input 
                    type="file" 
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
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
              </section>
            </div>

            <div className="action-section">
              <button 
                className="upload-submit-btn" 
                onClick={handleUpload}
                disabled={!supplyChainFile}
              >
                Upload File
              </button>
              
              {uploadStatus && (
                <div className={`upload-status ${uploadStatus.includes('Error') ? 'error' : 'success'}`}>
                  {uploadStatus}
                </div>
              )}
            </div>

            <div className="preview-section">
              <div className='section-title'>Data Preview</div>
              <div className="section-content">
                {headers.length === 0 && <p>Select a file to preview...</p>}
              </div>
              {headers.length > 0 && (
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
              )}
            </div>

            <div className="sample-data-section">
              <div className='section-title'>Sample Data Available</div>
              <div className="section-content">
                <p>You can use the following sample data file from the data folder:</p>
                <ul className="sample-data-list">
                  <li>Supply Chain: DataCo Smart Supply Chain Dataset.zip</li>
                </ul>
              </div>
            </div>

            <div className="saved-files-section">
              <div className='section-title'>Saved Files ({savedFiles.length})</div>
              <div className="saved-files-list">
                <table className="saved-files-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>File Name</th>
                      <th>Type</th>
                      <th>Upload Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedFiles.map((savedFile) => (
                      <tr key={savedFile.id}>
                        <td>{savedFile.id}</td>
                        <td>{savedFile.fileName}</td>
                        <td>{savedFile.fileType || 'N/A'}</td>
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
    </div>
  );
};

export default Upload;