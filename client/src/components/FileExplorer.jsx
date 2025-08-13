import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileCode2, 
  Folder, 
  FolderOpen, 
  CheckSquare, 
  Square, 
  Search,
  Filter,
  ArrowRight,
  Code,
  FileText
} from 'lucide-react';
import axios from 'axios';

/**
 * File Explorer Component
 * Displays repository files in a tree structure with selection capabilities
 */
const FileExplorer = ({ githubToken, selectedRepo, onFilesSelected, setIsLoading }) => {
  const [fileTree, setFileTree] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, code, test
  const [error, setError] = useState('');

  // Supported file extensions for test generation
  const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go'];
  const testExtensions = ['.test.js', '.spec.js', '.test.ts', '.spec.ts', '.test.py'];

  /**
   * Fetch repository contents recursively
   */
  useEffect(() => {
    if (githubToken && selectedRepo) {
      fetchRepoContents();
    }
  }, [githubToken, selectedRepo]);

  const fetchRepoContents = async (path = '') => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${selectedRepo.full_name}/contents${path ? `/${path}` : ''}`,
        {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      const processedFiles = await processFileTree(response.data);
      setFileTree(processedFiles);
    } catch (err) {
      setError('Failed to fetch repository contents');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Process file tree data recursively
   */
  const processFileTree = async (items, basePath = '') => {
    const processed = [];
    
    for (const item of items) {
      const processedItem = {
        ...item,
        fullPath: basePath ? `${basePath}/${item.name}` : item.name,
        isCodeFile: codeExtensions.some(ext => item.name.endsWith(ext)),
        isTestFile: testExtensions.some(ext => item.name.endsWith(ext)),
        children: item.type === 'dir' ? [] : null
      };
      
      processed.push(processedItem);
    }
    
    return processed.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'dir' ? -1 : 1;
    });
  };

  /**
   * Fetch folder contents when expanded
   */
  const fetchFolderContents = async (folder) => {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${selectedRepo.full_name}/contents/${folder.path}`,
        {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      const processedChildren = await processFileTree(response.data, folder.fullPath);
      
      // Update the file tree with the folder contents
      const updateTree = (items) => {
        return items.map(item => {
          if (item.path === folder.path) {
            return { ...item, children: processedChildren };
          }
          if (item.children) {
            return { ...item, children: updateTree(item.children) };
          }
          return item;
        });
      };
      
      setFileTree(updateTree(fileTree));
    } catch (err) {
      console.error('Failed to fetch folder contents:', err);
    }
  };

  /**
   * Toggle folder expansion
   */
  const toggleFolder = (folder) => {
    const newExpanded = new Set(expandedFolders);
    
    if (newExpanded.has(folder.path)) {
      newExpanded.delete(folder.path);
    } else {
      newExpanded.add(folder.path);
      if (!folder.children || folder.children.length === 0) {
        fetchFolderContents(folder);
      }
    }
    
    setExpandedFolders(newExpanded);
  };

  /**
   * Toggle file selection
   */
  const toggleFileSelection = (file) => {
    const newSelected = [...selectedFiles];
    const index = newSelected.findIndex(f => f.path === file.path);
    
    if (index > -1) {
      newSelected.splice(index, 1);
    } else {
      newSelected.push(file);
    }
    
    setSelectedFiles(newSelected);
  };

  /**
   * Filter files based on search and filter type
   */
  const filterFiles = (items) => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterType === 'code') return matchesSearch && item.isCodeFile;
      if (filterType === 'test') return matchesSearch && item.isTestFile;
      
      return matchesSearch;
    });
  };

  /**
   * Get file icon based on extension
   */
  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const iconMap = {
      'js': '🟨', 'jsx': '⚛️', 'ts': '🔷', 'tsx': '⚛️',
      'py': '🐍', 'java': '☕', 'cpp': '🔧', 'c': '🔧',
      'cs': '🔷', 'php': '🐘', 'rb': '💎', 'go': '🐹',
      'html': '🌐', 'css': '🎨', 'json': '📋', 'md': '📝'
    };
    return iconMap[ext] || '📄';
  };

  /**
   * Render file tree item
   */
  const renderFileItem = (item, depth = 0) => {
    const isExpanded = expandedFolders.has(item.path);
    const isSelected = selectedFiles.some(f => f.path === item.path);
    const paddingLeft = depth * 24;

    return (
      <motion.div
        key={item.path}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: depth * 0.05 }}
      >
        {/* File/Folder Item */}
        <div
          className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-800/50 ${
            isSelected ? 'bg-workik-primary/20 border border-workik-primary/30' : ''
          }`}
          style={{ paddingLeft: `${paddingLeft + 12}px` }}
          onClick={() => {
            if (item.type === 'dir') {
              toggleFolder(item);
            } else if (item.isCodeFile) {
              toggleFileSelection(item);
            }
          }}
        >
          {/* Icon */}
          <div className="flex-shrink-0">
            {item.type === 'dir' ? (
              isExpanded ? (
                <FolderOpen className="w-5 h-5 text-workik-primary" />
              ) : (
                <Folder className="w-5 h-5 text-gray-400" />
              )
            ) : (
              <span className="text-lg">{getFileIcon(item.name)}</span>
            )}
          </div>

          {/* Checkbox for files */}
          {item.type === 'file' && item.isCodeFile && (
            <div className="flex-shrink-0">
              {isSelected ? (
                <CheckSquare className="w-4 h-4 text-workik-primary" />
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
            </div>
          )}

          {/* File/Folder Name */}
          <span className={`flex-1 text-sm ${
            item.type === 'dir' 
              ? 'text-white font-medium' 
              : item.isCodeFile 
                ? 'text-gray-200' 
                : 'text-gray-500'
          }`}>
            {item.name}
          </span>

          {/* File Size */}
          {item.type === 'file' && (
            <span className="text-xs text-gray-500">
              {(item.size / 1024).toFixed(1)}KB
            </span>
          )}
        </div>

        {/* Children (for expanded folders) */}
        <AnimatePresence>
          {item.type === 'dir' && isExpanded && item.children && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {item.children.map(child => renderFileItem(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="glass-effect rounded-3xl p-8 shadow-2xl">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Select Files for Testing
            </h2>
            <p className="text-gray-400">
              Choose code files to generate test cases for from <strong>{selectedRepo?.name}</strong>
            </p>
          </div>
          
          <motion.div
            className="bg-workik-primary/20 border border-workik-primary/30 rounded-xl p-4"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-workik-primary">
                {selectedFiles.length}
              </div>
              <div className="text-sm text-gray-400">Selected</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          className="flex flex-col md:flex-row gap-4 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-workik-primary focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-workik-primary"
            >
              <option value="all">All Files</option>
              <option value="code">Code Files</option>
              <option value="test">Test Files</option>
            </select>
          </div>
        </motion.div>

        {/* File Tree */}
        <div className="bg-gray-900/50 rounded-2xl p-4 max-h-96 overflow-y-auto">
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-400">{error}</p>
            </div>
          ) : fileTree.length === 0 ? (
            <div className="text-center py-8">
              <Code className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Loading repository files...</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filterFiles(fileTree).map(item => renderFileItem(item))}
            </div>
          )}
        </div>

        {/* Selected Files Summary */}
        {selectedFiles.length > 0 && (
          <motion.div
            className="mt-6 p-4 bg-workik-primary/10 border border-workik-primary/30 rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-lg font-semibold text-workik-primary mb-3">
              Selected Files ({selectedFiles.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {selectedFiles.map(file => (
                <div
                  key={file.path}
                  className="flex items-center space-x-2 p-2 bg-gray-800/50 rounded-lg"
                >
                  <span className="text-sm">{getFileIcon(file.name)}</span>
                  <span className="text-sm text-gray-300 truncate">{file.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Button */}
        <motion.div
          className="mt-8 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            onClick={() => onFilesSelected(selectedFiles)}
            disabled={selectedFiles.length === 0}
            className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 ${
              selectedFiles.length > 0
                ? 'bg-gradient-to-r from-workik-primary to-workik-secondary text-white hover:from-workik-secondary hover:to-workik-primary transform hover:scale-105 shine-effect'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
            whileHover={selectedFiles.length > 0 ? { scale: 1.05 } : {}}
            whileTap={selectedFiles.length > 0 ? { scale: 0.95 } : {}}
          >
            <span>Generate Test Cases</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default FileExplorer;