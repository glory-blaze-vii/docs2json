import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Conversion } from "@shared/schema";

interface JsonOutputProps {
  conversion: Conversion;
}

export default function JsonOutput({ conversion }: JsonOutputProps) {
  const { toast } = useToast();

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(conversion.jsonOutput, null, 2));
      toast({
        title: "Copied to clipboard",
        description: "JSON output has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy JSON to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
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

  const formatJsonForDisplay = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  const highlightJson = (jsonString: string) => {
    return jsonString
      .replace(/("([^"\\]|\\.)*")\s*:/g, '<span class="text-green-400">$1</span>:')
      .replace(/:\s*("([^"\\]|\\.)*")/g, ': <span class="text-yellow-400">$1</span>')
      .replace(/:\s*(-?\d+\.?\d*)/g, ': <span class="text-purple-400">$1</span>')
      .replace(/:\s*(true|false)/g, ': <span class="text-purple-400">$1</span>')
      .replace(/:\s*(null)/g, ': <span class="text-gray-400">$1</span>')
      .replace(/([{}[\],])/g, '<span class="text-blue-400">$1</span>');
  };

  if (!conversion.jsonOutput) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">JSON Output</h3>
            <span className="text-sm text-slate-500">Step 3 of 3</span>
          </div>
          <div className="text-center py-8 text-slate-500">
            <p>No JSON output available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">JSON Output</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-500">Step 3 of 3</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyToClipboard}
                className="text-slate-400 hover:text-slate-600"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="text-slate-400 hover:text-slate-600"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="h-96">
            <div className="bg-slate-900 rounded-lg p-4">
              <pre
                className="text-sm font-mono text-slate-100 overflow-x-auto whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: highlightJson(formatJsonForDisplay(conversion.jsonOutput))
                }}
              />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Export Options</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex items-center justify-center space-x-2 p-3"
            >
              <Download className="h-4 w-4" />
              <span>JSON File</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyToClipboard}
              className="flex items-center justify-center space-x-2 p-3"
            >
              <Copy className="h-4 w-4" />
              <span>Copy JSON</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
