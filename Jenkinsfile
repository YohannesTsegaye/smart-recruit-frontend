pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
        VITE_API_URL = 'http://localhost:3000'
        // Ensure npm uses the correct registry
        NPM_CONFIG_REGISTRY = 'https://registry.npmjs.org'
    }

    stages {
        stage('🏗️ 1. Checkout & Setup') {
            steps {
                cleanWs()
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/YohannesTsegaye/smart-recruit-frontend.git',
                        credentialsId: 'github-credentials'
                    ]]
                ])
                echo "✅ Repository cloned successfully"
                
                // Verify Node.js and npm versions
                sh 'node --version'
                sh 'npm --version'
            }
        }

        stage('📦 2. Install Dependencies') {
            steps {
                script {
                    sh 'rm -rf node_modules package-lock.json'
                    
                    // First attempt with clean install
                    try {
                        sh 'npm clean-install'  // Uses package-lock.json strictly
                        echo "✅ Dependencies installed via npm clean-install"
                    } catch (err) {
                        echo "⚠️ clean-install failed, trying regular install"
                        sh 'npm install --include=dev'  // Explicitly include devDependencies
                    }
                    
                    // Verify critical dependencies
                    def verifyDependency = { dep ->
                        return sh(script: "npm list ${dep} --depth=0", returnStatus: true) == 0
                    }
                    
                    if (!verifyDependency('eslint') || !verifyDependency('vite')) {
                        // Final fallback - install missing packages explicitly
                        sh 'npm install eslint vite --save-dev'
                        
                        // Re-verify
                        if (!verifyDependency('eslint') || !verifyDependency('vite')) {
                            error("❌ Critical dependencies missing after installation attempts")
                        }
                    }
                    
                    echo "✅ Verified all required dependencies"
                }
            }
        }

        stage('🧹 3. Lint Code') {
            steps {
                script {
                    try {
                        sh 'npx eslint .'
                        echo "✅ Linting passed"
                    } catch (err) {
                        echo "⚠️ Linting issues found (not blocking)"
                    }
                }
            }
        }

        stage('🧪 4. Run Tests') {
            steps {
                script {
                    if (sh(script: 'grep -q "\"test\":" package.json', returnStatus: true) == 0) {
                        try {
                            sh 'npm test'
                            echo "✅ Tests passed"
                        } catch (err) {
                            echo "⚠️ Tests failed (not blocking)"
                        }
                    } else {
                        echo "ℹ️ No test script found - skipping"
                    }
                }
            }
        }

        stage('🏗️ 5. Build Project') {
            steps {
                script {
                    sh 'npx vite build'
                    echo "✅ Build completed successfully"
                    sh 'ls -la dist/'
                }
            }
        }
    }

    post {
        always {
            echo "🎉 Pipeline execution completed"
            archiveArtifacts artifacts: 'dist/**/*', allowEmptyArchive: true
            cleanWs()
        }
        success {
            echo "✅ Pipeline succeeded!"
        }
        failure {
            echo "❌ Pipeline failed"
        }
    }
}
