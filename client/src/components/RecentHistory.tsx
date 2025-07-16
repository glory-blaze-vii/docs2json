import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Download, Eye, Trash2, FileText, File } from "lucide-react";
import { Conversion } from "@shared/schema";

interface RecentHistoryProps {
  conversions: Conversion[];
  onConversionSelect: (conversion: Conversion) => void;
  onConversionDeleted: () => void;
}

export default function RecentHistory({ conversions, onConversionSelect, onConversionDeleted }: RecentHistoryProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/conversions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversions"] });
      onConversionDeleted();
      toast({
        title: "Conversion deleted",
        description: "The conversion has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDownload = async (conversion: Conversion) => {
    try {
      const response = await apiRequest("GET", `/api/conversions/${conversion.id}/download`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${conversion.originalName}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download started",
        description: "JSON file download has started.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download JSON file.",
        variant: "destructive",
      });
    }
  };

  const handleView = (conversion: Conversion) => {
    onConversionSelect(conversion);
  };

  const handleDelete = (conversion: Conversion) => {
    if (confirm(`Are you sure you want to delete the conversion for "${conversion.originalName}"?`)) {
      deleteMutation.mutate(conversion.id);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === "application/pdf") {
      return <File className="h-5 w-5 text-red-600" />;
    }
    return <FileText className="h-5 w-5 text-blue-600" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case "processing":
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Processing</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getDocumentType = (conversion: Conversion) => {
    if (conversion.jsonOutput?.document?.type) {
      return conversion.jsonOutput.document.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return "Document";
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const conversionDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - conversionDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Recent Conversions</h3>
          <Button variant="ghost" size="sm" className="text-primary hover:text-blue-700">
            View All
          </Button>
        </div>
        
        {conversions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No conversions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3 font-medium text-slate-700">Document</th>
                  <th className="text-left p-3 font-medium text-slate-700">Type</th>
                  <th className="text-left p-3 font-medium text-slate-700">Status</th>
                  <th className="text-left p-3 font-medium text-slate-700">Date</th>
                  <th className="text-left p-3 font-medium text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {conversions.map((conversion) => (
                  <tr key={conversion.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                          {getFileIcon(conversion.fileType)}
                        </div>
                        <span className="font-medium text-slate-900">{conversion.originalName}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600">{getDocumentType(conversion)}</td>
                    <td className="p-3">{getStatusBadge(conversion.status)}</td>
                    <td className="p-3 text-slate-600">{formatDate(conversion.createdAt!)}</td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        {conversion.status === "completed" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(conversion)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(conversion)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(conversion)}
                          className="text-slate-400 hover:text-red-600"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
