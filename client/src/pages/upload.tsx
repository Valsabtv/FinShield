import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload as UploadIcon, FileText, AlertTriangle, CheckCircle, Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Form schema for single transaction upload
const singleTransactionSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
  accountId: z.string().min(1, "Account ID is required"),
  amount: z.string().min(1, "Amount is required"),
  currency: z.string().length(3, "Currency must be 3 characters"),
  transactionType: z.enum(["DEPOSIT", "WITHDRAWAL", "TRANSFER", "PAYMENT"]),
  merchantName: z.string().optional(),
  merchantCategory: z.string().optional(),
  location: z.string().optional(),
  deviceId: z.string().optional(),
  ipAddress: z.string().optional(),
  timestamp: z.string().min(1, "Timestamp is required"),
});

interface UploadResult {
  message: string;
  summary: {
    totalRows: number;
    processed: number;
    errors: number;
    flagged: number;
  };
  errors: Array<{
    row: number;
    data: any;
    error: string;
  }>;
}

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [activeTab, setActiveTab] = useState<'csv' | 'single'>('csv');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form for single transaction upload
  const form = useForm<z.infer<typeof singleTransactionSchema>>({
    resolver: zodResolver(singleTransactionSchema),
    defaultValues: {
      transactionId: "",
      accountId: "",
      amount: "",
      currency: "USD",
      transactionType: "PAYMENT",
      merchantName: "",
      merchantCategory: "",
      location: "",
      deviceId: "",
      ipAddress: "",
      timestamp: new Date().toISOString().slice(0, 16),
    },
  });

  // CSV Upload mutation
  const csvUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('csvFile', file);
      
      const response = await fetch('/api/transactions/upload-csv', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data: UploadResult) => {
      setUploadProgress(100);
      setUploadResult(data);
      toast({
        title: "CSV Upload Successful",
        description: `Processed ${data.summary.processed} transactions, ${data.summary.flagged} flagged`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
    onError: (error) => {
      setUploadProgress(0);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to process CSV file",
        variant: "destructive",
      });
    },
  });

  // Single transaction mutation
  const singleTransactionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof singleTransactionSchema>) => {
      const response = await fetch('/api/transactions/single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Transaction Created",
        description: `Transaction ${data.transactionId} processed with ${data.riskLevel} risk level`,
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Transaction",
        description: error instanceof Error ? error.message : "Unknown error",
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
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV file only",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV file only",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = () => {
    if (file) {
      setUploadProgress(10);
      csvUploadMutation.mutate(file);
    }
  };

  const onSubmitSingle = (data: z.infer<typeof singleTransactionSchema>) => {
    singleTransactionMutation.mutate(data);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transaction Upload</h1>
          <p className="text-muted-foreground mt-2">
            Upload transaction data for fraud detection analysis
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'csv' ? 'default' : 'outline'}
            onClick={() => setActiveTab('csv')}
          >
            <FileText className="w-4 h-4 mr-2" />
            CSV Upload
          </Button>
          <Button
            variant={activeTab === 'single' ? 'default' : 'outline'}
            onClick={() => setActiveTab('single')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Single Transaction
          </Button>
        </div>
      </div>

      {activeTab === 'csv' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CSV Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle>CSV File Upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {file ? file.name : "Drop your CSV file here"}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  or click to browse files
                </p>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <Label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Choose File
                </Label>
              </div>

              {file && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFile(null)}
                    >
                      Remove
                    </Button>
                  </div>

                  {uploadProgress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Processing...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}

                  <Button
                    onClick={handleUpload}
                    disabled={csvUploadMutation.isPending}
                    className="w-full"
                  >
                    {csvUploadMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <UploadIcon className="w-4 h-4 mr-2" />
                        Upload CSV
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CSV Format Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>CSV Format Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Your CSV file should include the following columns:
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium text-green-600">Required:</div>
                  <div></div>
                  <div>transactionId</div>
                  <div>accountId</div>
                  <div>amount</div>
                  <div>currency</div>
                  <div>transactionType</div>
                  <div>timestamp</div>
                  
                  <div className="font-medium text-blue-600 mt-2">Optional:</div>
                  <div></div>
                  <div>merchantName</div>
                  <div>merchantCategory</div>
                  <div>location</div>
                  <div>deviceId</div>
                  <div>ipAddress</div>
                </div>
                
                <div className="bg-yellow-50 p-3 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Transaction Types:</strong> DEPOSIT, WITHDRAWAL, TRANSFER, PAYMENT
                  </p>
                  <p className="text-sm text-yellow-800 mt-1">
                    <strong>Timestamp Format:</strong> ISO 8601 (YYYY-MM-DDTHH:mm:ss)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'single' && (
        <Card>
          <CardHeader>
            <CardTitle>Add Single Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitSingle)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="transactionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transaction ID</FormLabel>
                        <FormControl>
                          <Input placeholder="TXN-12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="accountId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account ID</FormLabel>
                        <FormControl>
                          <Input placeholder="ACC-67890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="1000.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <FormControl>
                          <Input placeholder="USD" maxLength={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="transactionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transaction Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DEPOSIT">Deposit</SelectItem>
                            <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                            <SelectItem value="TRANSFER">Transfer</SelectItem>
                            <SelectItem value="PAYMENT">Payment</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="timestamp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timestamp</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="merchantName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Merchant Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Amazon" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="merchantCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Merchant Category (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Retail" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="New York, NY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="ipAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IP Address (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="192.168.1.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={singleTransactionMutation.isPending}
                  className="w-full"
                >
                  {singleTransactionMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Transaction
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Upload Results */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Upload Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {uploadResult.summary.totalRows}
                </div>
                <div className="text-sm text-gray-500">Total Rows</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {uploadResult.summary.processed}
                </div>
                <div className="text-sm text-gray-500">Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {uploadResult.summary.flagged}
                </div>
                <div className="text-sm text-gray-500">Flagged</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {uploadResult.summary.errors}
                </div>
                <div className="text-sm text-gray-500">Errors</div>
              </div>
            </div>

            {uploadResult.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-red-600 mb-2">
                  Processing Errors (showing first 10):
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {uploadResult.errors.map((error, index) => (
                    <div key={index} className="p-2 bg-red-50 rounded text-sm">
                      <span className="font-medium">Row {error.row}:</span> {error.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}