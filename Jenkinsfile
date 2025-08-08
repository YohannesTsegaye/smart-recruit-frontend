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
            }
        }

        stage('📦 2. Install Dependencies') {
            steps {
                script {
                    sh 'rm -rf node_modules'
                    
                    // Install all dependencies including devDependencies
                    sh 'npm install'
                    echo "✅ All dependencies installed"
                    
                    // Verify critical tools are installed
                    def eslintInstalled = sh(script: 'npm list eslint', returnStatus: true) == 0
                    def viteInstalled = sh(script: 'npm list vite', returnStatus: true) == 0
                    
                    if (!eslintInstalled || !viteInstalled) {
                        error("❌ Critical dependencies missing - eslint: ${eslintInstalled}, vite: ${viteInstalled}")
                    }
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
