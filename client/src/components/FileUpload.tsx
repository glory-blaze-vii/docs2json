import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CloudUpload, FileText, File, X, Cog } from "lucide-react";
import { Conversion } from "@shared/schema";

interface FileUploadProps {
  onConversionComplete: (conversion: Conversion) => void;
  processingOptions: {
    outputStructure: string;
    processingMode: string;
    preserveFormatting: boolean;
  };
  onProcessingOptionsChange: (options: any) => void;
}

interface UploadedFile {
  file: File;
  id: string;
  status: "ready" | "uploading" | "processing" | "completed" | "error";
  progress: number;
  conversion?: Conversion;
}

export default function FileUpload({
  onConversionComplete,
  processingOptions,
  onProcessingOptionsChange,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (fileData: { file: File } & typeof processingOptions) => {
      const formData = new FormData();
      formData.append("file", fileData.file);
      formData.append("outputStructure", fileData.outputStructure);
      formData.append("processingMode", fileData.processingMode);
      formData.append("preserveFormatting", fileData.preserveFormatting.toString());

      const response = await apiRequest("POST", "/api/conversions", formData);
      return response.json();
    },
    onSuccess: (conversion: Conversion, variables) => {
      const fileId = variables.file.name + Date.now();
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: "processing", conversion }
          : f
      ));
      
      // Poll for completion
      pollConversionStatus(conversion.id, fileId);
    },
    onError: (error, variables) => {
      const fileId = variables.file.name + Date.now();
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: "error", progress: 0 }
          : f
      ));
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const pollConversionStatus = useCallback(async (conversionId: number, fileId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await apiRequest("GET", `/api/conversions/${conversionId}`);
        const conversion = await response.json();
        
        if (conversion.status === "completed") {
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { ...f, status: "completed", progress: 100, conversion }
              : f
          ));
          onConversionComplete(conversion);
          clearInterval(pollInterval);
          toast({
            title: "Document processed successfully!",
            description: `${conversion.originalName} has been converted to JSON.`,
          });
        } else if (conversion.status === "failed") {
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { ...f, status: "error", progress: 0, conversion }
              : f
          ));
          clearInterval(pollInterval);
          toast({
            title: "Processing failed",
            description: conversion.errorMessage || "Unknown error occurred",
            variant: "destructive",
          });
        } else if (conversion.status === "processing") {
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { ...f, progress: Math.min(90, f.progress + 10) }
              : f
          ));
        }
      } catch (error) {
        clearInterval(pollInterval);
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: "error", progress: 0 }
            : f
        ));
      }
    }, 2000);
  }, [onConversionComplete, toast]);

  const handleFileSelect = useCallback((files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type === "application/pdf" || 
                         file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type. Please upload PDF or DOCX files.`,
          variant: "destructive",
        });
      }
      
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `${file.name} is too large. Maximum file size is 10MB.`,
          variant: "destructive",
        });
      }
      
      return isValidType && isValidSize;
    });

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      id: file.name + Date.now(),
      status: "ready",
      progress: 0,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const processDocuments = () => {
    const readyFiles = uploadedFiles.filter(f => f.status === "ready");
    
    readyFiles.forEach(uploadedFile => {
      setUploadedFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, status: "uploading", progress: 20 }
          : f
      ));
      
      uploadMutation.mutate({
        file: uploadedFile.file,
        ...processingOptions,
      });
    });
  };

  const clearAll = () => {
    setUploadedFiles([]);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === "application/pdf") {
      return <File className="text-red-600" />;
    }
    return <FileText className="text-blue-600" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready": return "text-green-600 bg-green-100";
      case "uploading": return "text-blue-600 bg-blue-100";
      case "processing": return "text-blue-600 bg-blue-100";
      case "completed": return "text-green-600 bg-green-100";
      case "error": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ready": return "Ready";
      case "uploading": return "Uploading";
      case "processing": return "Processing";
      case "completed": return "Completed";
      case "error": return "Error";
      default: return "Unknown";
    }
  };

  return (
    <>
      {/* Upload Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Upload Document</h2>
            <span className="text-sm text-slate-500">Step 1 of 3</span>
          </div>
          
          {/* File Upload Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragOver 
                ? "border-primary bg-blue-50" 
                : "border-slate-300 hover:border-primary hover:bg-slate-50"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleBrowseClick}
          >
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                <CloudUpload className="h-8 w-8 text-slate-400" />
              </div>
              <div>
                <p className="text-base font-medium text-slate-900">Drop files here or click to browse</p>
                <p className="text-sm text-slate-500 mt-1">Supports .docx and .pdf files up to 10MB</p>
              </div>
              <Button className="bg-primary text-white hover:bg-blue-700">
                Browse Files
              </Button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx"
            className="hidden"
            onChange={handleFileInputChange}
          />

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6 space-y-3">
              {uploadedFiles.map((uploadedFile) => (
                <div key={uploadedFile.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      {getFileIcon(uploadedFile.file.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{uploadedFile.file.name}</p>
                      <p className="text-xs text-slate-500">{(uploadedFile.file.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(uploadedFile.status)}`}>
                      {getStatusText(uploadedFile.status)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadedFile.id)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Options */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Processing Options</h3>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-slate-700">Output Structure</Label>
              <Select 
                value={processingOptions.outputStructure} 
                onValueChange={(value) => onProcessingOptionsChange({...processingOptions, outputStructure: value})}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto-detect">Auto-detect structure</SelectItem>
                  <SelectItem value="custom">Custom schema</SelectItem>
                  <SelectItem value="table">Table extraction</SelectItem>
                  <SelectItem value="key-value">Key-value pairs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2">Processing Mode</Label>
              <RadioGroup 
                value={processingOptions.processingMode} 
                onValueChange={(value) => onProcessingOptionsChange({...processingOptions, processingMode: value})}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fast" id="fast" />
                  <Label htmlFor="fast">Fast</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="accurate" id="accurate" />
                  <Label htmlFor="accurate">Accurate</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="preserve-formatting"
                checked={processingOptions.preserveFormatting}
                onCheckedChange={(checked) => onProcessingOptionsChange({...processingOptions, preserveFormatting: checked})}
              />
              <Label htmlFor="preserve-formatting" className="text-sm text-slate-700">Preserve formatting</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button 
          onClick={processDocuments} 
          disabled={uploadedFiles.filter(f => f.status === "ready").length === 0}
          className="flex-1 bg-primary text-white hover:bg-blue-700"
        >
          <Cog className="mr-2 h-4 w-4" />
          Process Documents
        </Button>
        <Button 
          onClick={clearAll} 
          variant="outline"
          className="px-6"
        >
          Clear All
        </Button>
      </div>
    </>
  );
}
