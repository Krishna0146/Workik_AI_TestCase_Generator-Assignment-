import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Github, 
  FileCode2, 
  Sparkles, 
  Play, 
  Download,
  GitBranch,
  Zap,
  Code,
  TestTube,
  Rocket
} from 'lucide-react';
import GitHubAuth from './components/GitHubAuth';
import FileExplorer from './components/FileExplorer';
import TestCaseGenerator from './components/TestCaseGenerator';
import TestCaseViewer from './components/TestCaseViewer';
import LoadingAnimation from './components/LoadingAnimation';
import ParticleBackground from './components/ParticleBackground';

/**
 * Main Application Component
 * Handles the overall state management and navigation between different screens
 */
function App() {
  // State Management
  const [currentStep, setCurrentStep] = useState('auth'); // auth, files, generate, view
  const [githubToken, setGithubToken] = useState('');
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [testCaseSummaries, setTestCaseSummaries] = useState([]);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('github_token');
    if (savedToken) {
      setGithubToken(savedToken);
      setCurrentStep('files');
    }
  }, []);

  /**
   * Handle successful GitHub authentication
   */
  const handleAuthSuccess = (token, repo) => {
    setGithubToken(token);
    setSelectedRepo(repo);
    localStorage.setItem('github_token', token);
    setCurrentStep('files');
  };

  /**
   * Handle file selection from GitHub repository
   */
  const handleFilesSelected = (files) => {
    setSelectedFiles(files);
    setCurrentStep('generate');
  };

  /**
   * Handle test case generation completion
   */
  const handleTestCasesGenerated = (summaries) => {
    setTestCaseSummaries(summaries);
  };

  /**
   * Handle individual test case code generation
   */
  const handleCodeGenerated = (code) => {
    setGeneratedCode(code);
    setCurrentStep('view');
  };

  /**
   * Reset application to initial state
   */
  const handleReset = () => {
    setCurrentStep('auth');
    setGithubToken('');
    setSelectedRepo(null);
    setSelectedFiles([]);
    setTestCaseSummaries([]);
    setGeneratedCode('');
    localStorage.removeItem('github_token');
  };

  /**
   * Navigation header component
   */
  const NavigationHeader = () => (
    <motion.header 
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 p-6"
    >
      <nav className="max-w-7xl mx-auto flex justify-between items-center">
        <motion.div 
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.05 }}
        >
          <div className="p-2 bg-gradient-to-r from-workik-primary to-workik-secondary rounded-xl">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Workik AI
            </h1>
            <p className="text-gray-400 text-sm">Test Case Generator</p>
          </div>
        </motion.div>

        <div className="flex items-center space-x-4">
          {currentStep !== 'auth' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Reset
            </motion.button>
          )}
          
          <div className="flex items-center space-x-2 text-gray-400">
            <Github className="w-5 h-5" />
            <span className="text-sm">
              {selectedRepo ? selectedRepo.name : 'Not Connected'}
            </span>
          </div>
        </div>
      </nav>
    </motion.header>
  );

  /**
   * Progress indicator component
   */
  const ProgressIndicator = () => {
    const steps = [
      { id: 'auth', label: 'Connect GitHub', icon: Github },
      { id: 'files', label: 'Select Files', icon: FileCode2 },
      { id: 'generate', label: 'Generate Tests', icon: TestTube },
      { id: 'view', label: 'View Code', icon: Code }
    ];

    const currentIndex = steps.findIndex(step => step.id === currentStep);

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto mb-8 px-6"
      >
        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentIndex;
              const isCurrent = index === currentIndex;
              
              return (
                <React.Fragment key={step.id}>
                  <motion.div
                    className={`flex items-center space-x-3 ${
                      isActive ? 'text-workik-primary' : 'text-gray-500'
                    }`}
                    animate={{
                      scale: isCurrent ? 1.1 : 1,
                      opacity: isActive ? 1 : 0.6
                    }}
                  >
                    <div className={`p-3 rounded-full ${
                      isActive 
                        ? 'bg-gradient-to-r from-workik-primary to-workik-secondary text-white' 
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{step.label}</span>
                  </motion.div>
                  
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 rounded-full ${
                      index < currentIndex 
                        ? 'bg-gradient-to-r from-workik-primary to-workik-secondary' 
                        : 'bg-gray-700'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <ParticleBackground />
      
      {/* Main Content */}
      <div className="relative z-10">
        <NavigationHeader />
        <ProgressIndicator />
        
        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && <LoadingAnimation />}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-6 pb-12">
          <AnimatePresence mode="wait">
            {currentStep === 'auth' && (
              <motion.div
                key="auth"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <GitHubAuth 
                  onAuthSuccess={handleAuthSuccess}
                  setIsLoading={setIsLoading}
                />
              </motion.div>
            )}

            {currentStep === 'files' && (
              <motion.div
                key="files"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <FileExplorer
                  githubToken={githubToken}
                  selectedRepo={selectedRepo}
                  onFilesSelected={handleFilesSelected}
                  setIsLoading={setIsLoading}
                />
              </motion.div>
            )}

            {currentStep === 'generate' && (
              <motion.div
                key="generate"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <TestCaseGenerator
                  selectedFiles={selectedFiles}
                  onTestCasesGenerated={handleTestCasesGenerated}
                  onCodeGenerated={handleCodeGenerated}
                  setIsLoading={setIsLoading}
                />
              </motion.div>
            )}

            {currentStep === 'view' && (
              <motion.div
                key="view"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <TestCaseViewer
                  generatedCode={generatedCode}
                  githubToken={githubToken}
                  selectedRepo={selectedRepo}
                  setIsLoading={setIsLoading}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;