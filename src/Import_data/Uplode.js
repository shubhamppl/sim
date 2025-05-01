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
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [productFile, setProductFile] = useState(null);
  const [fileType, setFileType] = useState(''); // 'supply' or 'product'

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
          const content = event.target.result;
          const lines = content.split('\n');
          
          const headerRow = lines[0].split(',').map(header => header.trim());
          setHeaders(headerRow);

          const dataRows = lines.slice(1).map(line => 
            line.split(',').map(cell => cell.trim())
          );
          setRows(dataRows); // Show all rows
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
        
        fileType === 'supply' ? setSupplyChainFile(null) : setProductFile(null);
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
            </div>

            {/* Saved Files Sections */}
            <div className="saved-files-section">
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