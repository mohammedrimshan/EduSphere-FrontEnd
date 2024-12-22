import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';

export function MediaPreviewModal({ isOpen, onClose, mediaUrl, onSend, isLoading = false, mediaType }) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    if (!mediaUrl) return;
    
    if (mediaType === 'video') {
      const video = document.createElement('video');
      video.src = mediaUrl;
      video.onloadedmetadata = () => {
        setDimensions({
          width: video.videoWidth,
          height: video.videoHeight
        });
      };
    } else {
      const img = new Image();
      img.src = mediaUrl;
      img.onload = () => {
        setDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
    }
  }, [mediaUrl, mediaType]);

  const calculateFitDimensions = () => {
    if (!dimensions.width || !dimensions.height) return {};
    
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.8;
    
    let finalWidth = dimensions.width;
    let finalHeight = dimensions.height;
    
    if (finalWidth > maxWidth) {
      const ratio = maxWidth / finalWidth;
      finalWidth = maxWidth;
      finalHeight = finalHeight * ratio;
    }
    
    if (finalHeight > maxHeight) {
      const ratio = maxHeight / finalHeight;
      finalHeight = maxHeight;
      finalWidth = finalWidth * ratio;
    }
    
    return {
      width: `${finalWidth}px`,
      height: `${finalHeight}px`
    };
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl">
          <div className="relative p-2" style={calculateFitDimensions()}>
            {mediaType === 'video' ? (
              <video 
                src={mediaUrl}
                controls
                autoPlay={false}
                className="max-w-full max-h-full rounded-lg"
                style={calculateFitDimensions()}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={mediaUrl}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-lg"
                style={calculateFitDimensions()}
              />
            )}
          </div>
          <div className="flex justify-between p-4 border-t">
            <Dialog.Title className="text-sm text-gray-500">
              {dimensions.width > 0 && `Original size: ${dimensions.width}×${dimensions.height}`}
            </Dialog.Title>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700"
              >
                Cancel
              </button>
              <button
                onClick={onSend}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 disabled:opacity-50"
              >
                {isLoading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}