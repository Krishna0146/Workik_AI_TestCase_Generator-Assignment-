import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Key, Zap, Shield, Globe, Code2 } from 'lucide-react';
import axios from 'axios';

/**
 * GitHub Authentication Component
 * Handles OAuth flow and repository selection
 */
const GitHubAuth = ({ onAuthSuccess, setIsLoading }) => {
  const [token, setToken] = useState('');
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState('token'); // token, repos, success

  /**
   * Validate GitHub token and fetch repositories
   */
  const handleTokenSubmit = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please enter a valid GitHub token');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Test token validity and fetch repositories
      const response = await axios.get('https://api.github.com/user/repos', {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        params: {
          sort: 'updated',
          per_page: 50
        }
      });

      setRepos(response.data);
      setStep('repos');
    } catch (err) {
      setError('Invalid token or failed to fetch repositories. Please check your token.');
      console.error('GitHub API Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle repository selection
   */
  const handleRepoSelect = (repo) => {
    setSelectedRepo(repo);
    onAuthSuccess(token, repo);
  };

  /**
   * Token input step
   */
  const TokenStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="glass-effect rounded-3xl p-8 shadow-2xl">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-workik-primary to-workik-secondary rounded-2xl mb-6 animate-glow"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Github className="w-10 h-10 text-white" />
          </motion.div>
          
          <h2 className="text-4xl font-bold text-white mb-4">
            Connect to GitHub
          </h2>
          <p className="text-gray-400 text-lg">
            Enter your GitHub Personal Access Token to get started
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-2 gap-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[
            { icon: Shield, title: 'Secure', desc: 'Token stored safely' },
            { icon: Zap, title: 'Fast', desc: 'Quick repository access' },
            { icon: Globe, title: 'Public/Private', desc: 'Access all repos' },
            { icon: Code2, title: 'AI Powered', desc: 'Smart test generation' }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <feature.icon className="w-6 h-6 text-workik-primary mb-2" />
              <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
              <p className="text-gray-400 text-xs">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Token Form */}
        <motion.form 
          onSubmit={handleTokenSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="relative mb-6">
            <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
<input               
    type="password"               
    value={token}               
    onChange={(e) => setToken(e.target.value)}               
    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"               
    autoComplete="off"
    className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-workik-primary focus:border-transparent transition-all"             
  />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-workik-primary to-workik-secondary text-white font-semibold rounded-xl hover:from-workik-secondary hover:to-workik-primary transition-all duration-300 transform hover:scale-105 shine-effect"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Connect to GitHub
          </motion.button>
        </motion.form>

        {/* Help Text */}
        <motion.div
          className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-blue-400 text-sm">
            <strong>Need a token?</strong> Go to GitHub Settings → Developer settings → Personal access tokens → Generate new token.
            Required scopes: <code className="bg-gray-800 px-1 rounded">repo</code>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );

  /**
   * Repository selection step
   */
  const RepoStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="glass-effect rounded-3xl p-8 shadow-2xl">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Select Repository
          </h2>
          <p className="text-gray-400">
            Choose a repository to generate test cases for
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repos.map((repo, index) => (
            <motion.div
              key={repo.id}
              className="p-6 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:border-workik-primary/50 cursor-pointer hover-lift shine-effect"
              onClick={() => handleRepoSelect(repo)}
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-lg mb-2 truncate">
                    {repo.name}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                    {repo.description || 'No description available'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  {repo.language && (
                    <span className="flex items-center">
                      <div className="w-3 h-3 bg-workik-primary rounded-full mr-2"></div>
                      {repo.language}
                    </span>
                  )}
                  <span>⭐ {repo.stargazers_count}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  repo.private 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {repo.private ? 'Private' : 'Public'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {repos.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-gray-400">No repositories found</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div>
      {step === 'token' && <TokenStep />}
      {step === 'repos' && <RepoStep />}
    </div>
  );
};

export default GitHubAuth;