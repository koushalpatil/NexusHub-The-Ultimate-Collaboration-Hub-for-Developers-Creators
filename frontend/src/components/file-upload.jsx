import React, { useState, useRef } from "react";
import uploadImage from '../assets/upload.jpg'
import { X } from "lucide-react";


const FileUploadDropzone = ({ onClientUploadComplete, onUploadError, onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      await handleFileSelect(e.dataTransfer.files[0]);
    }
    setIsDragging(false);
  };

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setIsUploaded(false);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    try {
      setIsUploading(true);
      console.log("Uploading file: ", file);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Uploaded to Cloudinary: ", data.fileDetails.fileUrl);
      onUpload(data.fileDetails.fileUrl);
      setUploadedFileUrl(data.fileDetails.fileUrl)

      setIsUploading(false);
      setIsUploaded(true);


      onClientUploadComplete([data]);

      alert("File successfully uploaded to Cloudinary!");
    } catch (error) {
      console.error("Error uploading file: ", error);
      onUploadError(error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      style={{
        border: "2px dashed #ccc",
        padding: "20px",
        textAlign: "center",
        borderRadius: "8px",
        backgroundColor: isDragging ? "#f0f0f0" : "#fff",
        cursor: "pointer",
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      {isUploading ? (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <img
            src={uploadImage}
            alt="Upload"
            style={{
              marginBottom: "1rem",
              width: "30%",
              height: "30%",
              objectFit: "cover",
              borderRadius: "10px",
            }}
          />
          <p>Uploading...</p>
        </div>

      ) : (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          {!file ? (
            <>
              <img
                src={uploadImage}
                alt="Upload"
                style={{
                  marginBottom: "1rem",
                  width: "30%",
                  height: "30%",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}

              />

              <p>Drag and drop a file here, or click to select a file</p>
              {/* Hidden file input, triggered by the div */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileInputChange}
              />
            </>
          ) : (
            <>
              {isUploaded ? (
               
                  <img
                    src={uploadedFileUrl}
                    alt="Upload"
                    style={{
                      marginBottom: "1rem",
                      width: "30%",
                      height: "30%",
                      objectFit: "cover",
                      borderRadius: "10px",
                    }}

                  />
                  
                

              ) : (
                <img
                  src={uploadImage}
                  alt="Upload"
                  style={{
                    marginBottom: "1rem",
                    width: "30%",
                    height: "30%",
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}

                />
              )}

              <p>File selected: {file.name}</p>
              <button
                onClick={handleUpload}
                disabled={isUploading || isUploaded}
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  backgroundColor: "#4CAF50",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: isUploading || isUploaded ? "not-allowed" : "pointer",
                  filter: isUploaded ? "blur(0.5px)" : "none",
                }}
              >
                {isUploaded ? "Upload" : "Upload"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploadDropzone;
