'use client';
import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function Transactions() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [transactionType, setTransactionType] = useState('income');
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfUploadResult, setPdfUploadResult] = useState(null);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'income', label: 'Income' },
    { id: 'expense', label: 'Expenses' }
  ];

  const incomeCategories = [
    'Salary',
    'Freelance',
    'Investment',
    'Business',
    'Rental',
    'Other'
  ];

  const expenseCategories = [
    'Food & Dining',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Healthcare',
    'Utilities',
    'Education',
    'Other'
  ];

  // Fetch transactions from API
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/transactions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(data.transactions);
    } catch (error) {
      setError('Failed to load transactions');
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: transactionType,
          category: formData.category,
          amount: parseFloat(formData.amount),
          description: formData.description,
          date: formData.date
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }

      // Reset form and close modal
      setFormData({
        description: '',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddModal(false);
      
      // Refresh transactions
      fetchTransactions();
    } catch (error) {
      console.error('Error creating transaction:', error);
      setError('Failed to create transaction');
    }
  };

  // Reset form when modal opens
  const openModal = () => {
    setFormData({
      description: '',
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
    setTransactionType('income');
    setShowAddModal(true);
  };

  /**
   * Handles PDF file upload for transaction history
   * Processes PDF files containing tabular transaction data
   */
  const handlePdfUpload = async () => {
    if (!pdfFile) {
      setError('Please select a PDF file');
      return;
    }

    setPdfUploading(true);
    setPdfUploadResult(null);
    setError('');

    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);

      const response = await fetch('/api/transactions/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload PDF');
      }

      const result = await response.json();
      setPdfUploadResult(result);
      
      // Refresh transactions list
      fetchTransactions();
      
      // Reset form
      setPdfFile(null);
      
    } catch (error) {
      console.error('PDF upload error:', error);
      setError(`PDF upload failed: ${error.message}`);
    } finally {
      setPdfUploading(false);
    }
  };

  // Handle PDF file selection
  const handlePdfFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setError('');
    } else {
      setError('Please select a valid PDF file');
      setPdfFile(null);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = activeFilter === 'all' || transaction.type === activeFilter;
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Transactions</h1>
            <p className="text-muted-foreground">Manage your income and expenses</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setShowPdfModal(true)}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload PDF
            </Button>
            <Button variant="primary" onClick={openModal}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex space-x-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === filter.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Transactions List */}
        <Card>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-400 mt-2">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-white mb-2">No transactions found</h4>
              <p className="text-gray-400 mb-4">
                {searchTerm || activeFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start by adding your first transaction'
                }
              </p>
              {!searchTerm && activeFilter === 'all' && (
                <Button 
                  variant="primary"
                  onClick={openModal}
                >
                  Add First Transaction
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Description</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Category</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Amount</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Date</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {transaction.type === 'income' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              )}
                            </svg>
                          </div>
                          <div>
                            <p className="text-white font-medium">{transaction.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                          {transaction.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`font-semibold ${
                          transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                        }`}>
                                                      {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-300">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Add Transaction Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Add Transaction</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Type</label>
                  <div className="flex space-x-2">
                    <button 
                      type="button" 
                      onClick={() => setTransactionType('income')}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        transactionType === 'income' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      Income
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setTransactionType('expense')}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        transactionType === 'expense' 
                          ? 'bg-red-600 text-white' 
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      Expense
                    </button>
                  </div>
                </div>

                <Input
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter transaction description"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Category</label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-white"
                    required
                  >
                    <option value="">Select a category</option>
                    {(transactionType === 'income' ? incomeCategories : expenseCategories).map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  required
                />

                <Input
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />

                <div className="flex space-x-3 pt-4">
                  <Button variant="outline" className="flex-1" type="button" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" className="flex-1" type="submit">
                    Add Transaction
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* PDF Upload Modal */}
        {showPdfModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-foreground">Upload Transaction History PDF</h3>
                <button
                  onClick={() => {
                    setShowPdfModal(false);
                    setPdfFile(null);
                    setPdfUploadResult(null);
                    setError('');
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Select PDF File
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfFileChange}
                    className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload a PDF containing transaction history in tabular format
                  </p>
                </div>

                {pdfFile && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-foreground">
                      <strong>Selected:</strong> {pdfFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Size: {(pdfFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                )}

                {pdfUploadResult && (
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="text-sm font-semibold text-green-800 mb-2">Upload Successful!</h4>
                      <div className="text-sm text-green-700">
                        <p>• {pdfUploadResult.summary.successful} transactions imported</p>
                        <p>• {pdfUploadResult.summary.failed} errors encountered</p>
                        <p>• From file: {pdfUploadResult.summary.filename}</p>
                      </div>
                    </div>
                    
                    {pdfUploadResult.errors.length > 0 && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="text-sm font-semibold text-yellow-800 mb-2">Errors:</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {pdfUploadResult.errors.slice(0, 5).map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                          {pdfUploadResult.errors.length > 5 && (
                            <li>• ... and {pdfUploadResult.errors.length - 5} more</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    type="button" 
                    onClick={() => {
                      setShowPdfModal(false);
                      setPdfFile(null);
                      setPdfUploadResult(null);
                      setError('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    className="flex-1" 
                    type="button"
                    onClick={handlePdfUpload}
                    disabled={!pdfFile || pdfUploading}
                  >
                    {pdfUploading ? 'Processing...' : 'Upload PDF'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 