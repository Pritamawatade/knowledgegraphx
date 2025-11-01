"use client"
import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";

import { Button } from '@/components/ui/button';
const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export const FileUpload = ({
  onChange,
}: {
  onChange?: (files: File[]) => void;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [indexing, setIndexing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [phase, setPhase] = useState<'idle' | 'upload' | 'ingest' | 'done'>('idle');
  const [uploadResults, setUploadResults] = useState<any[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
  const router = useRouter();

  // const handleFileChange = (newFiles: File[]) => {
  //   setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  //   onChange && onChange(newFiles);
  // };


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement> | { target: { files: File[] } }) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles || selectedFiles.length === 0) return;

    // Validate file types and sizes
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/csv'
    ];
    
    const maxSize = 50 * 1024 * 1024; // 50MB per file
    const maxFiles = 10; // Maximum 10 files

    if (selectedFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed at once.`);
      return;
    }

    // Validate each file
    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        setError(`Unsupported file type: ${file.name}. Please upload only PDF, DOCX, or CSV files.`);
        return;
      }
      if (file.size > maxSize) {
        setError(`File ${file.name} is too large. Maximum size is 50MB.`);
        return;
      }
    }

    setFiles(selectedFiles);
    setUploading(true);
    setError(null);
    setProgress(0);
    setPhase('upload');
    setCurrentFileIndex(0);

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      // Upload all files
      const uploadJson = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/upload');
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const pct = Math.round((evt.loaded / evt.total) * 60); // cap upload at 60%
            setProgress(pct);
          }
        };
        xhr.onload = () => {
          try {
            const resp = JSON.parse(xhr.responseText || '{}');
            if (xhr.status >= 200 && xhr.status < 300) {
              setProgress(60);
              resolve(resp);
            } else {
              reject(new Error(resp.error || 'Upload failed'));
            }
          } catch (e: any) {
            reject(new Error('Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
      });

      if (!uploadJson.success) {
        throw new Error(uploadJson.error || 'Upload failed');
      }

      setUploadResults(uploadJson.uploadedFiles);

      // Trigger batch ingestion
      if (uploadJson.uploadedFiles && uploadJson.uploadedFiles.length > 0) {
        try {
          setIndexing(true);
          setPhase('ingest');
          
          const metadataIds = uploadJson.uploadedFiles.map((file: any) => file.metadataId);
          
          // Simulate progress from 60% to 95%
          let simulated = 60;
          const timer = setInterval(() => {
            simulated = Math.min(simulated + 2, 95);
            setProgress(simulated);
          }, 500);

          const ingestRes = await fetch('/api/ingest-batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ metadataIds }),
          });
          
          const ingestJson = await ingestRes.json();
          clearInterval(timer);
          
          if (!ingestRes.ok) {
            throw new Error(ingestJson.error || 'Ingestion failed');
          }

          setProgress(100);
          setPhase('done');
          
          // Show success message with details
          if (ingestJson.errors && ingestJson.errors.length > 0) {
            setError(`Processed ${ingestJson.processedFiles}/${ingestJson.totalFiles} files successfully. Some files had issues: ${ingestJson.errors.join(', ')}`);
          }
          
          // Redirect to chat after short delay
          setTimeout(() => {
            router.push('/query');
          }, 1500);
        } catch (e: any) {
          setError(e.message);
        } finally {
          setIndexing(false);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };



  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: true,
    noClick: true,
    maxFiles: 10,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/csv': ['.csv'],
      'application/csv': ['.csv']
    },
    onDrop: (acceptedFiles, fileRejections) => {
      if (acceptedFiles.length > 0) {
        handleFileChange({ target: { files: acceptedFiles } } as any);
      }
    },
    onDropRejected: (rejections) => {
      const errors = rejections.map(rejection => 
        `${rejection.file.name}: ${rejection.errors.map(e => e.message).join(', ')}`
      );
      setError(`File validation failed: ${errors.join('; ')}`);
    },
  });

  

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          accept=".pdf,.docx,.csv"
          multiple
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <GridPattern />
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base">
            Upload file
          </p>
          <p className="relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base mt-2">
            Drag or drop your PDF, DOCX, or CSV files here or click to upload (max 10 files)
          </p>
          <div className="relative w-full mt-10 max-w-xl mx-auto">
            {files.length > 0 &&
              files.map((file, idx) => (
                <motion.div
                  key={"file" + idx}
                  layoutId={idx === 0 ? "file-upload" : "file-upload-" + idx}
                  className={cn(
                    "relative overflow-hidden z-40 bg-white dark:bg-neutral-900 flex flex-col items-start justify-start md:h-24 p-4 mt-4 w-full mx-auto rounded-md",
                    "shadow-sm"
                  )}
                >
                  <div className="flex justify-between w-full items-center gap-4">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="text-base text-neutral-700 dark:text-neutral-300 truncate max-w-xs"
                    >
                      {file.name}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="rounded-lg px-2 py-1 w-fit shrink-0 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-white shadow-input"
                    >
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </motion.p>
                  </div>

                  <div className="flex text-sm md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between text-neutral-600 dark:text-neutral-400">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 "
                    >
                      {file.type}
                    </motion.p>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                    >
                      modified{" "}
                      {new Date(file.lastModified).toLocaleDateString()}
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            {!files.length && (
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  "relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md",
                  "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                )}
              >
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-neutral-600 flex flex-col items-center"
                  >
                    Drop files here
                    <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  </motion.p>
                ) : (
                  <div className="flex flex-col items-center">
                    <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                    {files.length > 0 && (
                      <span className="text-xs text-neutral-500 mt-1">
                        {files.length} file{files.length !== 1 ? 's' : ''} selected
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {!files.length && (
              <motion.div
                variants={secondaryVariant}
                className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
              ></motion.div>
            )}
          </div>
        {error && (
          <div className="w-full max-w-xl mx-auto mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {(uploading || indexing) && (
          <div className="w-full max-w-xl mx-auto mt-6">
            <div className="flex items-center justify-between mb-2 text-sm text-neutral-600 dark:text-neutral-300">
              <span>
                {phase === 'upload' ? `Uploading ${files.length} file${files.length > 1 ? 's' : ''}…` : 
                 phase === 'ingest' ? `Processing ${files.length} file${files.length > 1 ? 's' : ''}…` : 
                 'Completed'}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-2 bg-neutral-900 dark:bg-white transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            {uploadResults.length > 0 && (
              <div className="mt-3 text-xs text-neutral-500">
                Successfully uploaded: {uploadResults.map(f => f.originalName).join(', ')}
              </div>
            )}
          </div>
        )}
        <Button
          className={cn(
            "mt-12 font-semibold px-6 py-2 rounded-lg border border-transparent transition-colors",
            "bg-neutral-900 text-white hover:bg-neutral-700",
            "dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          )}
          disabled={uploading}
        >
          {uploading ? `Uploading ${files.length} file${files.length !== 1 ? 's' : ''}...` : 
           files.length > 0 ? `Upload ${files.length} file${files.length !== 1 ? 's' : ''}` : 'Upload Files'}
        </Button>
        </div>
      </motion.div>
    </div>
  );
};

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px  scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}
