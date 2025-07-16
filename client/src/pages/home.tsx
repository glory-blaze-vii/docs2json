import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import ProcessingStatus from "@/components/ProcessingStatus";
import JsonOutput from "@/components/JsonOutput";
import RecentHistory from "@/components/RecentHistory";
import { useQuery } from "@tanstack/react-query";
import { FileText, Settings, Cog } from "lucide-react";
import { Conversion } from "@shared/schema";

export default function Home() {
  const [selectedConversion, setSelectedConversion] = useState<Conversion | null>(null);
  const [processingOptions, setProcessingOptions] = useState({
    outputStructure: "auto-detect",
    processingMode: "fast",
    preserveFormatting: false,
  });

  const { data: conversions = [], refetch } = useQuery({
    queryKey: ["/api/conversions"],
  });

  const handleConversionComplete = (conversion: Conversion) => {
    setSelectedConversion(conversion);
    refetch();
  };

  const handleConversionSelect = (conversion: Conversion) => {
    setSelectedConversion(conversion);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary rounded-lg p-2">
                <FileText className="text-white text-lg" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900">Document to JSON Converter</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-500">Powered by OpenAI GPT</span>
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <Settings className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload and Processing */}
          <div className="space-y-6">
            <FileUpload
              onConversionComplete={handleConversionComplete}
              processingOptions={processingOptions}
              onProcessingOptionsChange={setProcessingOptions}
            />
          </div>

          {/* Right Column - Status and Results */}
          <div className="space-y-6">
            <ProcessingStatus
              conversions={conversions}
              selectedConversion={selectedConversion}
            />
            
            {selectedConversion && (
              <JsonOutput conversion={selectedConversion} />
            )}
          </div>
        </div>

        {/* Recent History */}
        <div className="mt-8">
          <RecentHistory
            conversions={conversions}
            onConversionSelect={handleConversionSelect}
            onConversionDeleted={refetch}
          />
        </div>
      </main>
    </div>
  );
}
