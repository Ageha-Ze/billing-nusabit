"use client";

import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadCloud, XCircle, FileText } from 'lucide-react';
import Image from 'next/image';

interface FileUploadProps {
  label: string;
  onFileChange: (file: File | null) => void;
  currentFileUrl?: string | null;
  acceptedFileTypes?: string; // e.g., "image/*,application/pdf"
  className?: string;
  disabled?: boolean;
}

export default function FileUpload({
  label,
  onFileChange,
  currentFileUrl,
  acceptedFileTypes = "image/*,application/pdf",
  className,
  disabled,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentFileUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentFileUrl || null);
  }, [currentFileUrl]);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onFileChange(file);
    } else {
      setPreview(null);
      onFileChange(null);
    }
  };

  const handleRemoveFile = () => {
    setPreview(null);
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isImage = preview && (preview.startsWith('data:image') || currentFileUrl?.match(/\.(jpeg|jpg|png|gif|webp)$/i));

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center space-x-2">
        <Input
          type="file"
          accept={acceptedFileTypes}
          onChange={handleFileSelect}
          ref={fileInputRef}
          className="hidden" // Hide default input
          disabled={disabled}
        />
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex items-center gap-2"
        >
          <UploadCloud className="h-4 w-4" /> Select File
        </Button>
        {preview && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleRemoveFile}
            disabled={disabled}
            className="flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" /> Remove
          </Button>
        )}
      </div>

      {preview && (
        <div className="mt-4 border rounded-md p-2 flex items-center justify-center bg-gray-50 relative w-48 h-48 overflow-hidden">
          {isImage ? (
            <Image
              src={preview}
              alt="File preview"
              layout="fill"
              objectFit="contain"
              className="rounded-md"
            />
          ) : (
            <div className="flex flex-col items-center text-gray-500">
              <FileText className="h-12 w-12" />
              <span className="text-sm mt-2">PDF File</span>
              {currentFileUrl && (
                <a href={currentFileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs mt-1">View Current File</a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}