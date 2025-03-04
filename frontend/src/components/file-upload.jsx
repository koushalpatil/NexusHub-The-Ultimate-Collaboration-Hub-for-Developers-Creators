import React, { useState, useRef } from "react";
import uploadImage from '../assets/upload.jpg';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FileUploadDropzone = ({ onUploadError, onUpload }) => {
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

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Uploaded to Cloudinary: ", data.fileDetails.fileUrl);
      onUpload(data.fileDetails.fileUrl);
      setUploadedFileUrl(data.fileDetails.fileUrl);

      setIsUploading(false);
      setIsUploaded(true);

      toast.success("File successfully uploaded to Cloudinary!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error("Error uploading file: ", error);
      if (onUploadError) {
        onUploadError(error);
      } else {
        toast.error(`Error: ${error.message}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const isImageFile = (file) => {
    return file && file.type.startsWith("image/");
  };

  return (
    <div
      style={{
        border: `2px dashed ${isUploaded ? "#4CAF50" : "#ccc"}`,
        padding: "20px",
        textAlign: "center",
        borderRadius: "8px",
        backgroundColor: isDragging ? "#f0f0f0" : "#fff",
        cursor: "pointer",
        transition: "border-color 0.3s ease",
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
                isImageFile(file) ? (
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
                  <div>
                    <p>File uploaded: {file.name}</p>
                    <a href={uploadedFileUrl} target="_blank" rel="noopener noreferrer">
                      View File
                    </a>
                  </div>
                )
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

             
              <button
                onClick={handleUpload}
                disabled={isUploading || isUploaded}
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  backgroundColor: isUploaded ? "#4CAF50" : "#4CAF50",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: isUploading || isUploaded ? "not-allowed" : "pointer",
                  opacity: isUploaded ? 0.7 : 1,
                }}
              >
                {isUploaded ? "Uploaded ✅" : "Upload"}
              </button>

              {isUploaded && (
                <div style={{ color: "#4CAF50", fontWeight: "bold", marginTop: "10px" }}>
                  File Uploaded Successfully!
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

FileUploadDropzone.defaultProps = {
  onUploadError: (error) => {
    console.error("Upload error:", error);
    toast.error(`Error: ${error.message}`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  },
};

export default FileUploadDropzone;