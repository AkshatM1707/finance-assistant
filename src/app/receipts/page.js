'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Upload, FileText, Eye, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function Receipts() {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processedReceipts, setProcessedReceipts] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch processed receipts
  const fetchReceipts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/receipts');
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch receipts');
      }

      const data = await response.json();
      setProcessedReceipts(data.receipts);
      setError('');
    } catch (error) {
      console.error('Error fetching receipts:', error);
      setError('Failed to load receipts');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = async (files) => {
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf';
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) {
      setError('Please select valid image or PDF files (max 10MB)');
      return;
    }

    const newFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      status: 'uploading'
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsProcessing(true);

    // Process each file
    for (const fileObj of newFiles) {
      try {
        // Update status to processing
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileObj.id ? { ...f, status: 'processing' } : f
          )
        );

        const formData = new FormData();
        formData.append('receipt', fileObj.file);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

        const response = await fetch('/api/receipts/process', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        // Update status to completed
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileObj.id ? { 
              ...f, 
              status: 'completed',
              result: result.receipt
            } : f
          )
        );

        // Refresh receipts list
        fetchReceipts();

      } catch (error) {
        console.error('Error processing file:', fileObj.name, error);
        
        let errorMessage = 'Processing failed';
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error - check connection';
        } else {
          errorMessage = error.message || 'Unknown error occurred';
        }
        
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileObj.id ? { ...f, status: 'failed', error: errorMessage } : f
          )
        );
      }
    }

    setIsProcessing(false);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'processing':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Receipt Processing</h1>
          <p className="text-muted-foreground">Upload receipts to automatically extract expense data</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Upload Receipts</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Drag and Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Drop receipts here or click to upload
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Supports JPG, PNG, and PDF files up to 10MB
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('file-upload').click()}
                  >
                    Select Files
                  </Button>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                </div>

                {/* Upload Queue */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-foreground mb-3">Upload Queue</h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(file.status)}
                            <div>
                              <p className="text-sm font-medium text-foreground">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)} • {file.status}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                            disabled={file.status === 'processing'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Processed Receipts */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Processed Receipts</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Loading receipts...</p>
                  </div>
                ) : processedReceipts.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-foreground mb-2">No receipts processed yet</h4>
                    <p className="text-muted-foreground">Upload your first receipt to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {processedReceipts.map((receipt) => (
                      <div key={receipt.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-foreground">{receipt.filename}</p>
                              <p className="text-sm text-muted-foreground">{receipt.merchant}</p>
                            </div>
                          </div>
                          {getStatusBadge(receipt.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="ml-2 font-medium text-foreground">₹{receipt.amount.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Date:</span>
                            <span className="ml-2 text-foreground">
                              {new Date(receipt.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {receipt.extractedData?.items && receipt.extractedData.items.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-foreground mb-2">Items:</p>
                            <div className="space-y-1">
                              {receipt.extractedData.items.slice(0, 3).map((item, index) => (
                                <div key={index} className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">{item.name}</span>
                                  <span className="text-foreground">₹{item.price.toFixed(2)}</span>
                                </div>
                              ))}
                              {receipt.extractedData.items.length > 3 && (
                                <p className="text-xs text-muted-foreground">
                                  +{receipt.extractedData.items.length - 3} more items
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-4">
                          <span className="text-xs text-muted-foreground">
                            Processed {new Date(receipt.createdAt).toLocaleDateString()}
                          </span>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}