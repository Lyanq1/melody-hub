"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
// import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Clock, Download, RefreshCw, Database, FileSpreadsheet } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ScraperPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [history, setHistory] = useState<any>(null);
  const [isScrapingRunning, setIsScrapingRunning] = useState<boolean>(false);
  const [isSavingToDb, setIsSavingToDb] = useState<boolean>(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Form states
  const [scheduleEnabled, setScheduleEnabled] = useState<boolean>(false);
  const [cronExpression, setCronExpression] = useState<string>('0 0 * * *');
  const [autoSaveToDb, setAutoSaveToDb] = useState<boolean>(false);
  
  // Add a new state for status message
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  // Load configuration
  useEffect(() => {
    fetchConfig();
    fetchHistory();
    
    return () => {
      // Clean up polling interval when component unmounts
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);
  
  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/scrape/config`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        // Add cache control to prevent caching issues
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setConfig(data.config);
        setScheduleEnabled(data.config.schedule.enabled);
        setCronExpression(data.config.schedule.cronExpression);
        setAutoSaveToDb(data.config.schedule.autoSaveToDb);
      } else {
        setError('Failed to load configuration');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Config fetch error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/scrape/history`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        // Add cache control to prevent caching issues
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setHistory(data);
      }
    } catch (err) {
      console.error('History fetch error:', err);
      // Don't show error UI for history failures, just log them
    }
  };
  
  const handleUpdateConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/scrape/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schedule: {
            enabled: scheduleEnabled,
            cronExpression,
            autoSaveToDb
          }
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setConfig(data.config);
        setSuccess('Configuration updated successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Failed to update configuration');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const startPolling = () => {
    // Clear any existing polling interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    // Set up polling to check for completion
    const interval = setInterval(async () => {
      try {
        // Fetch the current scraping status
        const response = await fetch(`${API_URL}/scrape/status`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          cache: 'no-store'
        });
        
        if (!response.ok) {
          console.error(`Error fetching status: ${response.status}`);
          return;
        }
        
        const data = await response.json();
        
        if (data.success && data.status) {
          // Update status message
          setStatusMessage(data.status.message || 'Scraping in progress...');
          
          // If scraping is no longer running, update UI
          if (!data.status.isRunning) {
            setIsScrapingRunning(false);
            setSuccess(data.status.message || 'Scraping completed successfully');
            clearInterval(interval);
            setPollingInterval(null);
            
            // Refresh history to get the latest data
            fetchHistory();
            return;
          }
        }
      } catch (err) {
        console.error('Error during polling:', err);
      }
    }, 2000); // Check every 2 seconds
    
    setPollingInterval(interval);
    
    // Safety timeout - stop polling after 3 minutes max
    setTimeout(() => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
        setIsScrapingRunning(false);
        setStatusMessage('');
        fetchHistory();
      }
    }, 3 * 60 * 1000);
  };
  
  const handleRunScraping = async (saveToDb: boolean) => {
    try {
      setIsScrapingRunning(true);
      setError(null);
      setStatusMessage('Starting scraping process...');
      
      const response = await fetch(`${API_URL}/scrape/run`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ saveToDb }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(`Scraping process started${saveToDb ? ' with database update' : ''}`);
        setStatusMessage('Scraping in progress...');
        
        // Start polling for completion
        startPolling();
        
        // Fallback timeout to reset the UI state if polling fails
        setTimeout(() => {
          setIsScrapingRunning(false);
          setStatusMessage('');
          fetchHistory();
        }, 3 * 60 * 1000); // 3 minutes timeout
      } else {
        setError(data.message || 'Failed to start scraping');
        setIsScrapingRunning(false);
        setStatusMessage('');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error connecting to server: ${errorMessage}`);
      console.error('Scraping error:', err);
      setIsScrapingRunning(false);
      setStatusMessage('');
    }
  };
  
  const handleSaveToDatabase = async () => {
    try {
      setIsSavingToDb(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/scrape/save-to-db`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(`Products saved to database: ${data.results.added} added, ${data.results.updated} updated, ${data.results.unchanged} unchanged`);
        setTimeout(() => setSuccess(null), 5000);
        fetchHistory();
      } else {
        setError(data.message || 'Failed to save to database');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error connecting to server: ${errorMessage}`);
      console.error('Database save error:', err);
    } finally {
      setIsSavingToDb(false);
    }
  };
  
  const downloadCsv = () => {
    window.open(`${API_URL}/scrape/download-csv`, '_blank');
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Product Scraper Management</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700">Success</AlertTitle>
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="control">
        <TabsList className="mb-4">
          <TabsTrigger value="control">Control Panel</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="control">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Manual Scraping</CardTitle>
                <CardDescription>
                  Run scraping process manually to collect product data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  This will scrape products from configured sources and save the results to CSV.
                </p>
                <div className="flex items-center space-x-2 mb-4">
                  <Switch 
                    id="auto-save-db"
                    checked={autoSaveToDb}
                    onCheckedChange={setAutoSaveToDb}
                  />
                  <Label htmlFor="auto-save-db">Save to database after scraping</Label>
                </div>
                {isScrapingRunning && (
                  <div className="text-sm bg-amber-50 border border-amber-200 rounded-md p-3 flex items-center gap-2 mt-4 mb-2">
                    <RefreshCw className="h-5 w-5 text-amber-600 animate-spin" />
                    <div>
                      <p className="font-medium text-amber-800">{statusMessage || 'Scraping in progress...'}</p>
                      <p className="text-amber-600 text-xs mt-1">This may take a few minutes. Please wait.</p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  onClick={() => handleRunScraping(autoSaveToDb)}
                  disabled={isScrapingRunning}
                >
                  {isScrapingRunning ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Run Scraper
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={fetchHistory}
                  disabled={isScrapingRunning}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Refresh Status
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Manage scraped data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Download the latest CSV data or save the scraped data to the database.
                </p>
                {history?.csvFile ? (
                  <div className="text-sm text-gray-500 mb-4">
                    <p>Last modified: {formatDate(history.csvFile.modified)}</p>
                    <p>Size: {Math.round(history.csvFile.size / 1024)} KB</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-4">No CSV file available</p>
                )}
                {isSavingToDb && (
                  <div className="text-sm text-amber-600 flex items-center gap-2 mt-2">
                    <Database className="h-4 w-4 animate-pulse" />
                    <span>Saving to database...</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={downloadCsv}
                  disabled={!history?.csvFile || isScrapingRunning}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </Button>
                <Button 
                  onClick={handleSaveToDatabase}
                  disabled={isSavingToDb || !history?.csvFile || isScrapingRunning}
                >
                  {isSavingToDb ? (
                    <>
                      <Database className="mr-2 h-4 w-4 animate-pulse" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Save to Database
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Scheduler Settings</CardTitle>
              <CardDescription>
                Configure automatic scraping schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="schedule-enabled"
                    checked={scheduleEnabled}
                    onCheckedChange={setScheduleEnabled}
                  />
                  <Label htmlFor="schedule-enabled">Enable scheduled scraping</Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cron-expression">Cron Expression</Label>
                  <Input 
                    id="cron-expression"
                    value={cronExpression}
                    onChange={(e) => setCronExpression(e.target.value)}
                    placeholder="0 0 * * *"
                    disabled={!scheduleEnabled}
                  />
                  <p className="text-sm text-gray-500">
                    Example: "0 0 * * *" for daily at midnight
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="auto-save-to-db"
                    checked={autoSaveToDb}
                    onCheckedChange={setAutoSaveToDb}
                    disabled={!scheduleEnabled}
                  />
                  <Label htmlFor="auto-save-to-db">Automatically save to database</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleUpdateConfig}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardFooter>
          </Card>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Cron Expression Examples</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expression</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><code>0 0 * * *</code></TableCell>
                  <TableCell>Daily at midnight</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>0 */6 * * *</code></TableCell>
                  <TableCell>Every 6 hours</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>0 9 * * 1-5</code></TableCell>
                  <TableCell>Weekdays at 9 AM</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>0 0 1 * *</code></TableCell>
                  <TableCell>Monthly on the 1st at midnight</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>*/30 * * * *</code></TableCell>
                  <TableCell>Every 30 minutes</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Scraping History</CardTitle>
              <CardDescription>
                View past scraping operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history ? (
                <div>
                  <div className="mb-4">
                    <p className="font-medium">Last Run:</p>
                    <p>{formatDate(history.lastRun)}</p>
                  </div>
                  
                  {history.csvFile && (
                    <div className="mb-4">
                      <p className="font-medium">CSV File:</p>
                      <p>Last modified: {formatDate(history.csvFile.modified)}</p>
                      <p>Size: {Math.round(history.csvFile.size / 1024)} KB</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={downloadCsv}
                      >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Download CSV
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p>No history available</p>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline"
                onClick={fetchHistory}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh History
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 