# ESLint Unused Variable Fixes Guide

This guide helps you fix ESLint unused variable errors that can cause Jenkins pipeline failures.

## 🚀 Quick Fix Commands

```bash
# Auto-fix unused variables
npm run fix-unused

# Auto-fix all ESLint issues
npm run lint:fix

# Check for remaining issues
npm run lint
```

## 🔧 Common Fixes

### 1. Unused useState Variables

**Problem:**
```jsx
const [error, setError] = useState(null);
// error is never used, only setError is used
```

**Solution:**
```jsx
// Option 1: Prefix with underscore
const [_error, setError] = useState(null);

// Option 2: Use underscore in destructuring
const [, setError] = useState(null);

// Option 3: Remove if truly unused
const [setError] = useState(null);
```

### 2. Unused useNavigate

**Problem:**
```jsx
const navigate = useNavigate();
// navigate is imported but never used
```

**Solution:**
```jsx
// Option 1: Prefix with underscore
const _navigate = useNavigate();

// Option 2: Remove if not needed
// Remove the entire line if navigate is not used
```

### 3. Unused Function Parameters

**Problem:**
```jsx
const handleClick = (event, data) => {
  // event is not used
  console.log(data);
};
```

**Solution:**
```jsx
// Option 1: Prefix with underscore
const handleClick = (_event, data) => {
  console.log(data);
};

// Option 2: Use underscore in destructuring
const handleClick = (_, data) => {
  console.log(data);
};
```

### 4. Unused Error Variables in Catch Blocks

**Problem:**
```jsx
try {
  // some code
} catch (error) {
  console.log('Something went wrong');
  // error is not used
}
```

**Solution:**
```jsx
try {
  // some code
} catch (_error) {
  console.log('Something went wrong');
}
```

### 5. Unused Imports

**Problem:**
```jsx
import { useState, useEffect, useCallback } from 'react';
// useCallback is imported but never used
```

**Solution:**
```jsx
import { useState, useEffect } from 'react';
// Remove useCallback from import
```

## 📋 ESLint Configuration

The project uses a custom ESLint configuration that ignores variables starting with underscore:

```javascript
'no-unused-vars': [
  'error', 
  { 
    varsIgnorePattern: '^_',
    argsIgnorePattern: '^_',
    caughtErrorsIgnorePattern: '^_',
    destructuredArrayIgnorePattern: '^_'
  }
]
```

This means you can prefix any unused variable with `_` to suppress the warning.

## 🛠️ Automated Fixes

### Using the Fix Script

The project includes an automated script to fix common unused variable patterns:

```bash
npm run fix-unused
```

This script will:
- Fix unused useState variables
- Fix unused navigate variables  
- Fix unused error variables in catch blocks
- Fix unused function parameters

### Manual Fixes

If the automated script doesn't catch everything, you can manually fix:

1. **Search for unused variables:**
   ```bash
   npm run lint
   ```

2. **Look for patterns like:**
   - `const [variable, setVariable] = useState`
   - `const navigate = useNavigate()`
   - `} catch (error) {`
   - Unused imports

3. **Apply the fixes from the examples above**

## 🚨 Jenkins Pipeline Integration

The Jenkins pipeline includes automatic unused variable fixing:

```groovy
stage('Fix Unused Variables') {
    when {
        expression { params.FIX_UNUSED_VARS == true }
    }
    steps {
        script {
            try {
                sh 'npm run fix-unused'
                echo "✅ Unused variables fixed automatically"
            } catch (Exception e) {
                echo "⚠️ Could not auto-fix unused variables, continuing with manual fixes..."
            }
        }
    }
}
```

## 📝 Best Practices

1. **Use underscore prefix** for intentionally unused variables
2. **Remove truly unused code** instead of just suppressing warnings
3. **Review imports regularly** and remove unused ones
4. **Use the automated script** before committing code
5. **Run linting locally** before pushing to avoid pipeline failures

## 🔍 Common Patterns to Watch For

### React Components
```jsx
// ❌ Bad
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// ✅ Good (if only setters are used)
const [_, setLoading] = useState(false);
const [_, setError] = useState(null);
```

### Event Handlers
```jsx
// ❌ Bad
const handleSubmit = (event) => {
  // event not used
  submitForm();
};

// ✅ Good
const handleSubmit = (_event) => {
  submitForm();
};
```

### Async Functions
```jsx
// ❌ Bad
const fetchData = async () => {
  try {
    const response = await api.getData();
    return response.data;
  } catch (error) {
    // error not used
    return null;
  }
};

// ✅ Good
const fetchData = async () => {
  try {
    const response = await api.getData();
    return response.data;
  } catch (_error) {
    return null;
  }
};
```

## 🎯 Quick Reference

| Pattern | Problem | Solution |
|---------|---------|----------|
| `const [var, setVar]` | `var` unused | `const [_, setVar]` |
| `const navigate = useNavigate()` | `navigate` unused | `const _navigate = useNavigate()` |
| `} catch (error) {` | `error` unused | `} catch (_error) {` |
| `const func = (param) =>` | `param` unused | `const func = (_param) =>` |
| `import { a, b, c }` | `c` unused | `import { a, b }` |

## 🚀 Pipeline Success Tips

1. **Run fixes locally first:**
   ```bash
   npm run fix-unused
   npm run lint:fix
   npm run lint
   ```

2. **Commit the fixes:**
   ```bash
   git add .
   git commit -m "Fix ESLint unused variable warnings"
   git push
   ```

3. **Monitor Jenkins pipeline** for any remaining issues

4. **Use the FIX_UNUSED_VARS parameter** in Jenkins for automatic fixing

This guide should help you resolve all ESLint unused variable issues and ensure your Jenkins pipeline runs successfully! 🎉
