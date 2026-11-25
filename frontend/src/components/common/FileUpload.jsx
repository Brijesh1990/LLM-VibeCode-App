import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, X } from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

export default function FileUpload({
  label = 'Upload Document or Study Material',
  file,
  onFileSelect,
  accept,
  hint = 'Supported formats: PDF, PPTX, DOCX, ZIP, PNG, JPG, MP4 (Max 50MB)',
}) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles?.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept,
  });

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
          {label}
        </label>
      )}
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-[#4F46E5] bg-indigo-50/60'
              : 'border-slate-200 hover:border-[#4F46E5] bg-slate-50/60'
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="w-8 h-8 text-[#4F46E5] mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800">
            {isDragActive ? 'Drop the file here...' : 'Drag & drop a file here, or click to browse'}
          </p>
          <p className="text-xs text-slate-500 mt-1">{hint}</p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#4F46E5] text-white flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 truncate max-w-xs">{file.name}</p>
              <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onFileSelect(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
