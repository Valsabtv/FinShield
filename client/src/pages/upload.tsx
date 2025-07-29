import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload as UploadIcon, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface UploadResult {
  processed: number;
  alertsGenerated: number;
  transactions: any[];
}

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (transactions: any[]) => {
      setUploadProgress(10);
      const response = await apiRequest("POST", "/api/transactions/upload", { transactions });
      return response.json();
    },
    onSuccess: (data: UploadResult) => {
      setUploadProgress(100);
      toast({
        title: "Upload Successful",
        description: `Processed ${data.processed} transactions, generated ${data.alertsGenerated} alerts`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      setFile(null);
      setUploadProgress(0);
    },
    onError: (error) => {
      setUploadProgress(0);
      toast({
        title: "Upload Failed",
        description: "Failed to process transactions. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('Invalid CSV format');
    
    const headers = lines[0].split(',').map(h => h.trim());
    const transactions = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) continue;
      
      const transaction: any = {};
      headers.forEach((header, index) => {
        transaction[header] = values[index];
      });
      
      // Convert to expected format
      const formattedTransaction = {
        transactionId: transaction.transaction_id || `TXN-${Date.now()}-${i}`,
        accountId: transaction.account_id || transaction.accountId || 'unknown',
        amount: parseFloat(transaction.amount) || 0,
        timestamp: transaction.timestamp || new Date().toISOString(),
        ipAddress: transaction.ip_address || transaction.ipAddress,
        ipCountry: transaction.ip_country || transaction.ipCountry,
        billingCountry: transaction.billing_country || transaction.billingCountry,
        merchantCategory: transaction.merchant_category || transaction.merchantCategory,
        deviceFingerprint: transaction.device_fingerprint || transaction.deviceFingerprint,
        failedAttempts: parseInt(transaction.failed_attempts) || 0,
        emailAge: parseInt(transaction.email_age) || 0,
        emailDomain: transaction.email_domain || transaction.emailDomain,
        phoneVerified: transaction.phone_verified === 'true' || false,
        socialProfilePresence: transaction.social_profile_presence === 'true' || false,
        transactionVelocity: parseInt(transaction.transaction_velocity) || 0,
        geoVelocity: parseFloat(transaction.geo_velocity) || 0,
        timeOfDay: new Date(transaction.timestamp || Date.now()).getHours(),
      };
      
      transactions.push(formattedTransaction);
    }
    
    return transactions;
  };

  const handleUpload = async () => {
    if (!file) return;
    
    try {
      setUploadProgress(5);
      const text = await file.text();
      
      let transactions: any[] = [];
      
      if (file.name.endsWith('.csv')) {
        transactions = parseCSV(text);
      } else if (file.name.endsWith('.json')) {
        const data = JSON.parse(text);
        transactions = Array.isArray(data) ? data : [data];
      } else {
        throw new Error('Unsupported file format');
      }
      
      setUploadProgress(50);
      uploadMutation.mutate(transactions);
    } catch (error) {
      toast({
        title: "File Processing Error",
        description: "Failed to parse file. Please check the format.",
        variant: "destructive",
      });
      setUploadProgress(0);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transaction Upload</h1>
        <p className="text-muted-foreground">
          Upload transaction data for fraud detection analysis
        </p>
      </div>

      {/* Upload Area */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Upload Transaction Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-primary"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg mb-2">
              {file ? file.name : "Drop files here or click to browse"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports CSV, JSON formats (Max 10MB)
            </p>
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
          </div>

          {file && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Ready</Badge>
              </div>

              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="w-full"
              >
                {uploadMutation.isPending ? "Processing..." : "Upload & Analyze"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Guidelines */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Data Format Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Required Fields</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• transaction_id</li>
                <li>• account_id</li>
                <li>• amount</li>
                <li>• timestamp</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Optional Fields</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• ip_address, ip_country</li>
                <li>• billing_country</li>
                <li>• merchant_category</li>
                <li>• device_fingerprint</li>
                <li>• failed_attempts</li>
                <li>• email_age, email_domain</li>
                <li>• phone_verified</li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Processing Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Rule-based filtering applied</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>ML scoring with SHAP explanations</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span>Automatic alert generation</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ML Model Information */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>ML Model Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This system integrates with the Money Laundering Detection model for advanced fraud scoring.
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <Badge className="bg-green-100 text-green-800">Model Status: Active</Badge>
              <span className="text-muted-foreground">Last Updated: 2 hours ago</span>
              <span className="text-muted-foreground">Version: v2.1.3</span>
            </div>
            <div className="text-sm">
              <strong>GitHub Repository:</strong>{" "}
              <a
                href="https://github.com/mvram123/Money_Laundering_Detection"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                mvram123/Money_Laundering_Detection
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
