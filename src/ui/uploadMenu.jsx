import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { MediaPreviewModal } from '@/Pages/USER/Common/ImagePreviewModal';
import { toast } from 'sonner';

export function UploadMenu({ onUpload }) {
    const theme = useSelector((state) => state.theme.theme);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [mediaType, setMediaType] = useState(null);
    const fileInputRef = useRef(null);
    const mediaInputRef = useRef(null);
  
    const handleFileSelect = async (file) => {
      if (!file) return;
      
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const MAX_SIZE = 50 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
          toast.error('File size exceeds 50MB limit');
          return;
        }
        
        setSelectedFile(file);
        setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        try {
          setIsUploading(true);
          const url = await onUpload(file);
          console.log('Uploaded successfully:', url);
          toast.success('File uploaded successfully');
        } catch (error) {
          console.error('Upload failed:', error);
          toast.error('Failed to upload file');
        } finally {
          setIsUploading(false);
        }
      }
    };
  
    const handleSendMedia = async () => {
      if (!selectedFile) return;
      
      try {
        setIsUploading(true);
        const url = await onUpload(selectedFile);
        console.log('Uploaded successfully:', url);
        toast.success('File uploaded successfully');
      } catch (error) {
        console.error('Upload failed:', error);
        toast.error('Failed to upload file');
      } finally {
        setIsUploading(false);
        setSelectedFile(null);
        setPreviewUrl("");
        setMediaType(null);
      }
    };
  
    const cleanupPreview = () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl("");
      setSelectedFile(null);
      setMediaType(null);
    };

    // Theme-based classes
    const buttonBaseClasses = `
      inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium
      focus:outline-none focus:ring-2 focus:ring-offset-2 
      ${theme === 'dark' 
        ? 'border-gray-600 text-gray-200 bg-gray-800 hover:bg-gray-700 focus:ring-gray-500'
        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-indigo-500'
      }
    `.trim();

    const spinnerClasses = `
      animate-spin rounded-full h-5 w-5 border-b-2
      ${theme === 'dark' ? 'border-gray-200' : 'border-gray-900'}
    `.trim();
  
    return (
      <>
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt"
          aria-label="Upload Document"
        />
        <input
          type="file"
          ref={mediaInputRef}
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
          accept="image/*,video/*"
          aria-label="Upload Media"
        />
        <div className="relative inline-block text-left">
          <button
            type="button"
            onClick={() => mediaInputRef.current?.click()}
            disabled={isUploading}
            className={buttonBaseClasses}
          >
            {isUploading ? (
              <div className={spinnerClasses} />
            ) : (
              <svg 
                className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
            )}
          </button>
        </div>
        <MediaPreviewModal
          isOpen={!!previewUrl}
          onClose={cleanupPreview}
          mediaUrl={previewUrl}
          mediaType={mediaType}
          onSend={handleSendMedia}
          isLoading={isUploading}
        />
      </>
    );
}