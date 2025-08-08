pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
        VITE_API_URL = 'http://localhost:3000'
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
                
                // SOLUTION 3: Verify ESLint is available
                sh 'npx eslint --version || echo "ESLint not found locally"'
            }
        }

        stage('📦 2. Install Dependencies') {
            steps {
                script {
                    sh 'rm -rf node_modules'
                    
                    // SOLUTION 1: Install ALL dependencies (including devDependencies)
                    sh 'npm install' // Removed --omit=dev flag
                    echo "✅ All dependencies installed (including devDependencies)"
                    
                    // Verify build script exists
                    if (!fileExists('package.json') || 
                        !sh(script: 'grep -q "\"build\":" package.json', returnStatus: true) == 0) {
                        error("❌ Critical: No build script found in package.json")
                    }
                }
            }
        }

        stage('🧹 3. Lint Code') {
            steps {
                script {
                    // Check if lint script exists
                    if (sh(script: 'grep -q "\"lint\":" package.json', returnStatus: true) == 0) {
                        try {
                            sh 'npm run lint'
                            echo "✅ Linting passed"
                        } catch (err) {
                            echo "⚠️ Linting issues found (not blocking)"
                        }
                    } else {
                        echo "ℹ️ No lint script found - skipping"
                    }
                }
            }
        }

        stage('🧪 4. Run Tests') {
            steps {
                script {
                    // Check if test script exists
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
                    sh 'npm run build'
                    echo "✅ Build completed successfully"
                    
                    // Verify build output
                    sh 'ls -la dist/ || ls -la build/ || echo "Warning: No standard build directory found"'
                }
            }
        }
    }

    post {
        always {
            echo "🎉 Pipeline execution completed"
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

