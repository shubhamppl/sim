import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Upload.css';

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
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [fileId, setFileId] = useState('');
  const [savedFiles, setSavedFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewType, setPreviewType] = useState(''); // 'upload' or 'saved'

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
    setFile(selectedFile);
    setPreviewType('upload');
    
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        const lines = content.split('\n');
        
        // Get headers from first row
        const headerRow = lines[0].split(',').map(header => header.trim());
        setHeaders(headerRow);

        // Get data rows (limit to first 10 rows for preview)
        const dataRows = lines.slice(1, 11).map(line => 
          line.split(',').map(cell => cell.trim())
        );
        setRows(dataRows);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (file) {
      try {
        const db = await initDB();
        const newFileId = `00${savedFiles.length + 1}`.slice(-3);
        
        const fileData = {
          id: newFileId,
          headers: headers,
          rows: rows,
          fileName: file.name,
          uploadDate: new Date().toISOString()
        };

        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        await store.add(fileData);

        setUploadStatus(`File uploaded successfully! Saved with ID: ${newFileId}`);
        await loadSavedFiles();
        
        // Reset form
        setFile(null);
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
    if (!file) {
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
      <div className="upload-content">
        <h2>Upload Data</h2>
        <div className="upload-form">
          <input type="file" onChange={handleFileChange} accept=".csv,.xlsx,.xls" />
          <button 
            className="upload-submit-btn" 
            onClick={handleUpload}
            disabled={!file}
          >
            Upload File
          </button>
          {uploadStatus && (
            <div className={`upload-status ${uploadStatus.includes('Error') ? 'error' : 'success'}`}>
              {uploadStatus}
            </div>
          )}
        </div>
        
        {/* Single Preview Section */}
        {(headers.length > 0 || previewFile) && (
          <div className="preview-section">
            <div className="preview-header">
              <h3>
                {previewType === 'upload' ? 'File Preview' : `Preview: ${previewFile?.fileName}`}
              </h3>
              <button className="clear-preview-btn" onClick={clearPreview}>
                Close Preview
              </button>
            </div>
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
          </div>
        )}

        <div className="saved-files-section">
          <h3>Saved Files ({savedFiles.length})</h3>
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
                {savedFiles.map((savedFile) => (
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
  );
};

export default Upload;