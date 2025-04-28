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
  const [supplyChainFile, setSupplyChainFile] = useState(null);
  const [pricingProductFile, setPricingProductFile] = useState(null);
  const [financialFile, setFinancialFile] = useState(null);
  const [channelPartnersFile, setChannelPartnersFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [savedFiles, setSavedFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewType, setPreviewType] = useState('');
  const [activeFileType, setActiveFileType] = useState('');

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

  const handleFileChange = (e, setFile, fileType) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setActiveFileType(fileType);
    setPreviewType('upload');
    
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        const lines = content.split('\n');
        
        const headerRow = lines[0].split(',').map(header => header.trim());
        setHeaders(headerRow);

        const dataRows = lines.slice(1, 11).map(line => 
          line.split(',').map(cell => cell.trim())
        );
        setRows(dataRows);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleDrop = (e, setFile, fileType) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      setActiveFileType(fileType);
      setPreviewType('upload');
      
      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target.result;
          const lines = content.split('\n');
          
          const headerRow = lines[0].split(',').map(header => header.trim());
          setHeaders(headerRow);

          const dataRows = lines.slice(1, 11).map(line => 
            line.split(',').map(cell => cell.trim())
          );
          setRows(dataRows);
        };
        reader.readAsText(selectedFile);
      }
    }
  };

  const preventDefault = (e) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    let fileToUpload;
    switch(activeFileType) {
      case 'supplyChain': fileToUpload = supplyChainFile; break;
      case 'pricingProduct': fileToUpload = pricingProductFile; break;
      case 'financial': fileToUpload = financialFile; break;
      case 'channelPartners': fileToUpload = channelPartnersFile; break;
      default: fileToUpload = null;
    }
    
    if (fileToUpload) {
      try {
        const db = await initDB();
        const newFileId = `00${savedFiles.length + 1}`.slice(-3);
        
        const fileData = {
          id: newFileId,
          headers: headers,
          rows: rows,
          fileName: fileToUpload.name,
          fileType: activeFileType,
          uploadDate: new Date().toISOString()
        };

        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        await store.add(fileData);

        setUploadStatus(`File uploaded successfully! Saved with ID: ${newFileId}`);
        await loadSavedFiles();
        
        // Reset form
        switch(activeFileType) {
          case 'supplyChain': setSupplyChainFile(null); break;
          case 'pricingProduct': setPricingProductFile(null); break;
          case 'financial': setFinancialFile(null); break;
          case 'channelPartners': setChannelPartnersFile(null); break;
        }
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
    if (!supplyChainFile && !pricingProductFile && !financialFile && !channelPartnersFile) {
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
          <div className="upload-title">Upload Your Data</div>
          
          <div className="upload-grid">
            <div className="info-section">
              <section className="about-section">
                <div className="section-title">About Data Upload</div>
                <div className="section-content">
                  <p>
                    Upload data files to enhance your simulation with real-world data. 
                    The simulator accepts CSV and Excel files for various data categories.
                  </p>
                  <p>
                    Each file type is used for different aspects of the tariff calculation.
                  </p>
                </div>
              </section>
            </div>

            <div className="templates-section">
              <div className="section-title">Sample Templates</div>
              <div className="section-content">
                <p>Download these sample templates to see the expected format for each data type:</p>
                <ul className="template-list">
                  <li><a href="#">Supply Chain Template</a></li>
                  <li><a href="#">Pricing/Product Template</a></li>
                  <li><a href="#">Financial Template</a></li>
                  <li><a href="#">Channel Partners Template</a></li>
                </ul>
              </div>
            </div>

            <div className="file-upload-container">
              <section className="file-upload-section">
                <div className="section-title">Supply Chain Data</div>
                <div 
                  className="file-drop-zone"
                  onDrop={(e) => handleDrop(e, setSupplyChainFile, 'supplyChain')}
                  onDragOver={preventDefault}
                  onDragEnter={preventDefault}
                >
                  <h3 className="drop-zone-title">Drag and Drop or Select File</h3>
                  <p className="file-requirements">CSV or Excel files only</p>
                  <input 
                    type="file" 
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => handleFileChange(e, setSupplyChainFile, 'supplyChain')}
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

              <section className="file-upload-section">
                <div className="section-title">Pricing/Product Data</div>
                <div 
                  className="file-drop-zone"
                  onDrop={(e) => handleDrop(e, setPricingProductFile, 'pricingProduct')}
                  onDragOver={preventDefault}
                  onDragEnter={preventDefault}
                >
                  <div className="drop-zone-title">Drag and Drop or Select File</div>
                  <p className="file-requirements">CSV or Excel files only</p>
                  <input 
                    type="file" 
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => handleFileChange(e, setPricingProductFile, 'pricingProduct')}
                    className="file-input"
                    id="pricingProductInput"
                  />
                  <label htmlFor="pricingProductInput" className="file-select-button">
                    Select File
                  </label>
                  {pricingProductFile && (
                    <p className="file-info">Selected: {pricingProductFile.name}</p>
                  )}
                </div>
              </section>

              <section className="file-upload-section">
                <div className="section-title">Financial Data</div>
                <div 
                  className="file-drop-zone"
                  onDrop={(e) => handleDrop(e, setFinancialFile, 'financial')}
                  onDragOver={preventDefault}
                  onDragEnter={preventDefault}
                >
                  <h3 className="drop-zone-title">Drag and Drop or Select File</h3>
                  <p className="file-requirements">CSV or Excel files only</p>
                  <input 
                    type="file" 
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => handleFileChange(e, setFinancialFile, 'financial')}
                    className="file-input"
                    id="financialInput"
                  />
                  <label htmlFor="financialInput" className="file-select-button">
                    Select File
                  </label>
                  {financialFile && (
                    <p className="file-info">Selected: {financialFile.name}</p>
                  )}
                </div>
              </section>

              <section className="file-upload-section">
                <div className="section-title">Channel Partners Data</div>
                <div 
                  className="file-drop-zone"
                  onDrop={(e) => handleDrop(e, setChannelPartnersFile, 'channelPartners')}
                  onDragOver={preventDefault}
                  onDragEnter={preventDefault}
                >
                  <h3 className="drop-zone-title">Drag and Drop or Select File</h3>
                  <p className="file-requirements">CSV or Excel files only</p>
                  <input 
                    type="file" 
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => handleFileChange(e, setChannelPartnersFile, 'channelPartners')}
                    className="file-input"
                    id="channelPartnersInput"
                  />
                  <label htmlFor="channelPartnersInput" className="file-select-button">
                    Select File
                  </label>
                  {channelPartnersFile && (
                    <p className="file-info">Selected: {channelPartnersFile.name}</p>
                  )}
                </div>
              </section>
            </div>

            <div className="action-section">
              <button 
                className="upload-submit-btn" 
                onClick={handleUpload}
                disabled={!supplyChainFile && !pricingProductFile && !financialFile && !channelPartnersFile}
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
                <p>Select File to Preview:</p>
                {headers.length === 0 && <p>Select a file to preview...</p>}
                </div>
                <button className="download-btn">Download Selected Data</button>

              
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
              <p>You can use the following sample data files from the data folder:</p>
              <ul className="sample-data-list">
                <li>Supply Chain: DataCo Smart Supply Chain Dataset.zip</li>
                <li>Pricing/Product: Sample Sales Data.zip</li>
                <li>Financial: Financial Statement Data Sets 2025q1.zip</li>
                <li style={{borderBottom:"none"}}>Channel Partners: BusinessPartners.csv</li>
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