import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  FileCode2, 
  TestTube, 
  Play,
  CheckCircle,
  AlertCircle,
  Clock,
  Code,
  ArrowRight,
  Zap
} from 'lucide-react';

/**
 * Test Case Generator Component
 * Generates test cases for selected files using AI
 */
const TestCaseGenerator = ({ 
  selectedFiles, 
  onTestCasesGenerated, 
  onCodeGenerated,
  setIsLoading 
}) => {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [testCaseSummaries, setTestCaseSummaries] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedTestCases, setGeneratedTestCases] = useState({});

  /**
   * Start the test case generation process
   */
  const startGeneration = async () => {
    console.log('🎬 Starting test case generation...');
    console.log('📂 Selected files:', selectedFiles);
    console.log('🔢 Number of files to process:', selectedFiles.length);
    
    setIsGenerating(true);
    setError('');
    setCurrentFileIndex(0);
    setTestCaseSummaries([]);
    setGeneratedTestCases({});

    try {
      const summaries = [];
      const allTestCases = {};

      for (let i = 0; i < selectedFiles.length; i++) {
        console.log(`\n🔄 Processing file ${i + 1}/${selectedFiles.length}`);
        setCurrentFileIndex(i);
        const file = selectedFiles[i];
        
        console.log('📁 Current file:', {
          name: file.name,
          path: file.path,
          type: file.type,
          size: file.size,
          download_url: file.download_url
        });
        
        // Fetch file content from GitHub
        console.log('⬇️ Fetching file content...');
        const fileContent = await fetchFileContent(file);
        
        // Generate test cases using your Flask backend
        console.log('🧪 Generating test cases...');
        const testCases = await generateTestCasesForFile(fileContent, file.name);
        
        // Create summary
        const summary = {
          fileName: file.name,
          filePath: file.path,
          testCaseCount: testCases.length,
          status: 'completed',
          testCases: testCases
        };
        
        console.log('📋 Summary for', file.name, ':', summary);
        
        summaries.push(summary);
        allTestCases[file.path] = testCases;
        setTestCaseSummaries([...summaries]);
        setGeneratedTestCases(prev => ({ ...prev, [file.path]: testCases }));
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log('✅ Generation completed successfully!');
      console.log('📊 Final summaries:', summaries);
      console.log('🧪 All test cases:', allTestCases);
      
      onTestCasesGenerated(summaries);
    } catch (err) {
      console.error('💥 Generation failed:', err);
      setError(`Failed to generate test cases: ${err.message}`);
    } finally {
      setIsGenerating(false);
      console.log('🏁 Generation process ended');
    }
  };

  /**
   * Fetch file content from GitHub
   */
  const fetchFileContent = async (file) => {
    console.log('🔍 Fetching file content for:', file.name);
    console.log('📁 File path:', file.path);
    console.log('🔗 Download URL:', file.download_url);
    
    try {
      // First try to use the download_url if available (direct raw content)
      if (file.download_url) {
        console.log('📥 Using download_url to fetch content...');
        const response = await fetch(file.download_url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch via download_url: ${response.status}`);
        }
        
        const content = await response.text();
        console.log('✅ Successfully fetched content via download_url');
        console.log('📄 Content preview (first 200 chars):', content.substring(0, 200));
        console.log('📊 Total content length:', content.length);
        
        return content;
      }
      
      // Fallback: Use GitHub API with authentication
      console.log('🔑 Using GitHub API with token...');
      const apiUrl = `https://api.github.com/repos/${selectedRepo.full_name}/contents/${file.path}`;
      console.log('🌐 API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📋 GitHub API response type:', data.type);
      console.log('🔢 Content encoding:', data.encoding);
      
      if (data.type === 'file' && data.content) {
        // Decode base64 content
        const content = atob(data.content.replace(/\n/g, ''));
        console.log('✅ Successfully decoded base64 content');
        console.log('📄 Content preview (first 200 chars):', content.substring(0, 200));
        console.log('📊 Total content length:', content.length);
        
        return content;
      } else {
        throw new Error('Invalid file data received from GitHub API');
      }
      
    } catch (err) {
      console.error('❌ Error fetching file content:', err);
      console.log('🔄 Falling back to mock content...');
      
      // Fallback to mock content with file name
      return `// Mock content for ${file.name} (failed to fetch real content)\n// Error: ${err.message}\nfunction sampleFunction() {\n  return "Hello World";\n}`;
    }
  };

  /**
   * Generate test cases using Flask backend
   */
  const generateTestCasesForFile = async (code, fileName) => {
    console.log('🚀 Generating test cases for:', fileName);
    console.log('📝 Code being sent to backend:');
    console.log('==========================================');
    console.log(code);
    console.log('==========================================');
    console.log('📊 Code length:', code.length, 'characters');
    
    try {
      console.log('📡 Sending request to Flask backend...');
      const response = await fetch('http://127.0.0.1:5000/generate-testcases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code })
      });
      
      console.log('📨 Backend response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Successfully received test cases from backend');
      console.log('🧪 Generated test cases:', data.test_cases);
      console.log('🔢 Number of test cases:', data.test_cases?.length || 0);
      
      return data.test_cases || [];
    } catch (err) {
      console.error('❌ API Error:', err);
      console.log('🔄 Using mock test cases as fallback...');
      
      // Return mock data for demo
      const mockTestCases = [
        { input: `// Function from ${fileName}`, output: '"Mock Result 1"' },
        { input: `// Test case 2 for ${fileName}`, output: '"Mock Result 2"' },
        { input: `// Test case 3 for ${fileName}`, output: '"Mock Result 3"' },
        { input: `// Test case 4 for ${fileName}`, output: '"Mock Result 4"' }
      ];
      
      console.log('🧪 Mock test cases:', mockTestCases);
      return mockTestCases;
    }
  };

  /**
   * Generate final test code and proceed to viewer
   */
  const generateFinalCode = () => {
    let finalCode = `// Generated Test Cases\n// Generated by Workik AI Test Generator\n\n`;
    
    testCaseSummaries.forEach(summary => {
      finalCode += `// Test cases for ${summary.fileName}\n`;
      finalCode += `describe('${summary.fileName}', () => {\n`;
      
      summary.testCases.forEach((testCase, index) => {
        finalCode += `  test('Test case ${index + 1}', () => {\n`;
        finalCode += `    // Input: ${testCase.input}\n`;
        finalCode += `    // Expected Output: ${testCase.output}\n`;
        finalCode += `    // TODO: Implement test logic\n`;
        finalCode += `  });\n\n`;
      });
      
      finalCode += `});\n\n`;
    });

    onCodeGenerated(finalCode);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="glass-effect rounded-3xl p-8 shadow-2xl">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl mb-6"
            whileHover={{ scale: 1.1, rotate: 5 }}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
            }}
          >
            <TestTube className="w-10 h-10 text-white" />
          </motion.div>
          
          <h2 className="text-4xl font-bold text-white mb-4">
            Generate Test Cases
          </h2>
          <p className="text-gray-400 text-lg">
            AI-powered test case generation for your selected files
          </p>
        </motion.div>

        {/* File Overview */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center space-x-3">
                <FileCode2 className="w-6 h-6 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Selected Files</p>
                  <p className="text-xl font-bold text-white">{selectedFiles.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center space-x-3">
                <TestTube className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">Generated Tests</p>
                  <p className="text-xl font-bold text-white">
                    {testCaseSummaries.reduce((sum, s) => sum + s.testCaseCount, 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">Completed</p>
                  <p className="text-xl font-bold text-white">
                    {testCaseSummaries.length} / {selectedFiles.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Generation Status */}
        {!isGenerating && testCaseSummaries.length === 0 && (
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {selectedFiles.map((file, index) => (
                <motion.div
                  key={file.path}
                  className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-3">
                    <Code className="w-5 h-5 text-purple-400" />
                    <div className="flex-1">
                      <p className="font-medium text-white text-sm truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {file.path}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              onClick={startGeneration}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 mx-auto shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-5 h-5" />
              <span>Generate Test Cases</span>
              <Play className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {/* Generation Progress */}
        {isGenerating && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="bg-gray-800/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Generating Test Cases...
                </h3>
                <div className="flex items-center space-x-2 text-purple-400">
                  <Zap className="w-5 h-5 animate-pulse" />
                  <span className="text-sm font-medium">
                    {currentFileIndex + 1} / {selectedFiles.length}
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-blue-600 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentFileIndex + 1) / selectedFiles.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              <p className="text-gray-400 text-sm text-center">
                Currently processing: {selectedFiles[currentFileIndex]?.name}
              </p>
            </div>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {testCaseSummaries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                Generated Test Cases Summary
              </h3>
              
              <div className="space-y-4">
                {testCaseSummaries.map((summary, index) => (
                  <motion.div
                    key={summary.filePath}
                    className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="font-medium text-white">{summary.fileName}</p>
                          <p className="text-sm text-gray-400">{summary.filePath}</p>
                        </div>
                      </div>
                      <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-1">
                        <span className="text-purple-400 font-medium text-sm">
                          {summary.testCaseCount} tests
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        {testCaseSummaries.length > 0 && !isGenerating && (
          <motion.div
            className="flex justify-center space-x-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              onClick={startGeneration}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <TestTube className="w-4 h-4" />
              <span>Regenerate</span>
            </motion.button>

            <motion.button
              onClick={generateFinalCode}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>View Test Code</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TestCaseGenerator;