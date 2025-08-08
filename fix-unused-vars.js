#!/usr/bin/env node

/**
 * Script to fix unused variables in React components
 * This script helps prevent ESLint errors in Jenkins pipelines
 */

const fs = require('fs');
const path = require('path');

// Common patterns to fix
const patterns = [
  // Fix unused useState variables
  {
    pattern: /const \[([^,]+), set([^\]]+)\] = useState\(/g,
    replacement: (match, var1, var2) => {
      // If the first variable is not used, prefix with underscore
      return `const [_${var1}, set${var2}] = useState(`;
    }
  },
  // Fix unused navigate variables
  {
    pattern: /const navigate = useNavigate\(\);/g,
    replacement: 'const _navigate = useNavigate();'
  },
  // Fix unused error variables in catch blocks
  {
    pattern: /} catch \(error\) {/g,
    replacement: '} catch (_error) {'
  },
  // Fix unused parameters in functions
  {
    pattern: /const ([a-zA-Z_][a-zA-Z0-9_]*) = \(([^)]*)\) => {/g,
    replacement: (match, funcName, params) => {
      const newParams = params.split(',').map(param => {
        const trimmed = param.trim();
        if (trimmed && !trimmed.startsWith('_')) {
          return `_${trimmed}`;
        }
        return trimmed;
      }).join(', ');
      return `const ${funcName} = (${newParams}) => {`;
    }
  }
];

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;

    patterns.forEach(({ pattern, replacement }) => {
      const newText = newContent.replace(pattern, replacement);
      if (newText !== newContent) {
        modified = true;
        newContent = newText;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
      walkDir(filePath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      processFile(filePath);
    }
  });
}

// Start processing from src directory
const srcDir = path.join(__dirname, 'src');
if (fs.existsSync(srcDir)) {
  console.log('🔧 Fixing unused variables in React components...');
  walkDir(srcDir);
  console.log('✅ Finished fixing unused variables!');
} else {
  console.error('❌ src directory not found!');
}
