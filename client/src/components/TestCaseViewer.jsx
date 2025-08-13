import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, 
  Download, 
  Copy,
  GitBranch,
  Upload,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  FileText,
  Sparkles,
  Github
} from 'lucide-react';

/**
 * Test Case Viewer Component
 * Displays generated test code and provides options to download or push to GitHub
 */
const TestCaseViewer = ({ 
  generatedCode, 
  githubToken, 
  selectedRepo, 
  setIsLoading 
}) => {
  const [showCode, setShowCode] = useState(true);
  const [copied, setCopied] = useState(false);
  const [pushStatus, setPushStatus] = useState(''); // success, error, pushing
  const [pushMessage, setPushMessage] = useState('');
  const [fileName, setFileName] = useState('generated-tests.test.js');
  const [commitMessage, setCommitMessage] = useState('Add generated test cases by Workik AI');
  const [branchName, setBranchName] = useState('workik-test-cases');

  /**
   * Copy code to clipboard
   */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  /**
   * Download code as file
   */
  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Push test cases to GitHub repository
   */
  const pushToGitHub = async () => {
    setPushStatus('pushing');
    setPushMessage('');
    setIsLoading(true);

    try {
      // Check if branch exists, create if not
      await createBranchIfNotExists();
      
      // Create or update file
      await createOrUpdateFile();
      
      setPushStatus('success');
      setPushMessage(`Successfully pushed test cases to ${selectedRepo.name}/${branchName}`);
    } catch (err) {
      setPushStatus('error');
      setPushMessage(`Failed to push to GitHub: ${err.message}`);
      console.error('Push error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create branch if it doesn't exist
   */
  const createBranchIfNotExists = async () => {
    try {
      // Get default branch SHA
      const defaultBranchResponse = await fetch(
        `https://api.github.com/repos/${selectedRepo.full_name}/git/ref/heads/${selectedRepo.default_branch}`,
        {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (!defaultBranchResponse.ok) {
        throw new Error('Failed to get default branch');
      }

      const defaultBranchData = await defaultBranchResponse.json();
      const sha = defaultBranchData.object.sha;

      // Try to create new branch
      const createBranchResponse = await fetch(
        `https://api.github.com/repos/${selectedRepo.full_name}/git/refs`,
        {
          method: 'POST',
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ref: `refs/heads/${branchName}`,
            sha: sha
          })
        }
      );

      // If branch already exists, that's fine
      if (!createBranchResponse.ok && createBranchResponse.status !== 422) {
        throw new Error('Failed to create branch');
      }
    } catch (err) {
      console.error('Branch creation error:', err);
      // Continue anyway, branch might already exist
    }
  };

  /**
   * Create or update file in repository
   */
  const createOrUpdateFile = async () => {
    // Check if file exists
    let existingFileSha = null;
    try {
      const existingFileResponse = await fetch(
        `https://api.github.com/repos/${selectedRepo.full_name}/contents/${fileName}?ref=${branchName}`,
        {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (existingFileResponse.ok) {
        const existingFileData = await existingFileResponse.json();
        existingFileSha = existingFileData.sha;
      }
    } catch (err) {
      // File doesn't exist, which is fine
    }

    // Create or update file
    const fileContent = btoa(unescape(encodeURIComponent(generatedCode)));
    
    const requestBody = {
      message: commitMessage,
      content: fileContent,
      branch: branchName
    };

    if (existingFileSha) {
      requestBody.sha = existingFileSha;
    }

    const response = await fetch(
      `https://api.github.com/repos/${selectedRepo.full_name}/contents/${fileName}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create/update file');
    }
  };

  /**
   * Get file extension for syntax highlighting
   */
  const getFileExtension = () => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ext || 'js';
  };

  /**
   * Format code with line numbers
   */
  const formatCodeWithLineNumbers = () => {
    const lines = generatedCode.split('\n');
    return lines.map((line, index) => ({
      number: index + 1,
      content: line
    }));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="glass-effect rounded-3xl p-8 shadow-2xl">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl mb-6"
            whileHover={{ scale: 1.1, rotate: 5 }}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Code className="w-10 h-10 text-white" />
          </motion.div>
          
          <h2 className="text-4xl font-bold text-white mb-4">
            Generated Test Cases
          </h2>
          <p className="text-gray-400 text-lg">
            Review, download, or push your AI-generated test code
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Lines of Code</p>
                <p className="text-xl font-bold text-white">
                  {generatedCode.split('\n').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Characters</p>
                <p className="text-xl font-bold text-white">
                  {generatedCode.length.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center space-x-3">
              <Github className="w-6 h-6 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Repository</p>
                <p className="text-lg font-bold text-white truncate">
                  {selectedRepo?.name || 'Not Connected'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            onClick={() => setShowCode(!showCode)}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showCode ? 'Hide' : 'Show'} Code</span>
          </motion.button>

          <motion.button
            onClick={copyToClipboard}
            className={`px-6 py-3 rounded-xl transition-all flex items-center space-x-2 ${
              copied 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </motion.button>

          <motion.button
            onClick={downloadCode}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </motion.button>
        </motion.div>

        {/* GitHub Push Configuration */}
        <motion.div
          className="bg-gray-800/30 rounded-2xl p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <GitBranch className="w-5 h-5 text-green-400" />
            <span>Push to GitHub</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                File Name
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="generated-tests.test.js"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Branch Name
              </label>
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="workik-test-cases"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Commit Message
            </label>
            <input
              type="text"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Add generated test cases by Workik AI"
            />
          </div>

          {/* Push Status */}
          {pushStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 p-4 rounded-xl border ${
                pushStatus === 'success' 
                  ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                  : pushStatus === 'error'
                    ? 'bg-red-500/20 border-red-500/50 text-red-400'
                    : 'bg-blue-500/20 border-blue-500/50 text-blue-400'
              }`}
            >
              <div className="flex items-center space-x-3">
                {pushStatus === 'success' && <CheckCircle className="w-5 h-5" />}
                {pushStatus === 'error' && <AlertCircle className="w-5 h-5" />}
                {pushStatus === 'pushing' && <Upload className="w-5 h-5 animate-pulse" />}
                <p>{pushMessage || (pushStatus === 'pushing' ? 'Pushing to GitHub...' : '')}</p>
              </div>
            </motion.div>
          )}

          <motion.button
            onClick={pushToGitHub}
            disabled={pushStatus === 'pushing' || !githubToken}
            className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3 ${
              pushStatus === 'pushing' || !githubToken
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700 transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
            }`}
            whileHover={pushStatus !== 'pushing' && githubToken ? { scale: 1.02 } : {}}
            whileTap={pushStatus !== 'pushing' && githubToken ? { scale: 0.98 } : {}}
          >
            <Upload className="w-5 h-5" />
            <span>
              {pushStatus === 'pushing' ? 'Pushing...' : 'Push Test Cases to GitHub'}
            </span>
          </motion.button>
        </motion.div>

        {/* Code Display */}
        <AnimatePresence>
          {showCode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-900/50 rounded-2xl p-4 border border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-green-400" />
                  <span>{fileName}</span>
                </h3>
                
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span>{getFileExtension().toUpperCase()}</span>
                  <span>•</span>
                  <span>{generatedCode.split('\n').length} lines</span>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <pre className="p-4 text-sm">
                    <code className="text-gray-300 font-mono leading-6">
                      {formatCodeWithLineNumbers().map((line, index) => (
                        <div key={index} className="flex">
                          <span className="text-gray-500 mr-4 select-none w-8 text-right">
                            {line.number}
                          </span>
                          <span className="flex-1">{line.content || ' '}</span>
                        </div>
                      ))}
                    </code>
                  </pre>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TestCaseViewer;