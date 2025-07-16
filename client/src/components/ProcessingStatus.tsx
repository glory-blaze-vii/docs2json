import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Loader2, AlertCircle, FileText, File } from "lucide-react";
import { Conversion } from "@shared/schema";

interface ProcessingStatusProps {
  conversions: Conversion[];
  selectedConversion: Conversion | null;
}

export default function ProcessingStatus({ conversions, selectedConversion }: ProcessingStatusProps) {
  const recentConversions = conversions.slice(0, 5);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "processing":
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Loader2 className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50";
      case "processing":
        return "bg-blue-50";
      case "failed":
        return "bg-red-50";
      default:
        return "bg-gray-50";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "processing":
        return "Processing with GPT...";
      case "failed":
        return "Failed";
      default:
        return "Pending";
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === "application/pdf") {
      return <File className="h-5 w-5 text-red-600" />;
    }
    return <FileText className="h-5 w-5 text-blue-600" />;
  };

  const getProcessingProgress = (conversion: Conversion) => {
    switch (conversion.status) {
      case "completed":
        return 100;
      case "processing":
        return 75;
      case "failed":
        return 0;
      default:
        return 0;
    }
  };

  const getProcessingTime = (conversion: Conversion) => {
    if (conversion.processingTime) {
      return `${conversion.processingTime}s`;
    }
    if (conversion.status === "processing") {
      const elapsed = Math.floor((Date.now() - new Date(conversion.createdAt!).getTime()) / 1000);
      return `${elapsed}s`;
    }
    return "";
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Processing Status</h3>
          <span className="text-sm text-slate-500">Step 2 of 3</span>
        </div>
        
        {recentConversions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No documents uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentConversions.map((conversion) => (
              <div key={conversion.id} className={`p-3 rounded-lg ${getStatusColor(conversion.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      {conversion.status === "processing" ? (
                        <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                      ) : (
                        getStatusIcon(conversion.status)
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{conversion.originalName}</p>
                      <p className="text-xs text-slate-500">
                        {getStatusText(conversion.status)}
                        {getProcessingTime(conversion) && ` • ${getProcessingTime(conversion)}`}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    {getProcessingProgress(conversion)}%
                  </span>
                </div>
                
                {conversion.status === "processing" && (
                  <div className="mt-2">
                    <Progress value={getProcessingProgress(conversion)} className="h-2" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
