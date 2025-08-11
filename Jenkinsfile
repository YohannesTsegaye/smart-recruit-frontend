pipeline {
    agent any

    environment {
        VITE_API_URL = 'http://localhost:3000'
        NPM_CONFIG_REGISTRY = 'https://registry.npmjs.org'
        NODE_OPTIONS = "--experimental-vm-modules --no-warnings"
    }

    stages {
        stage('🚀 1. Environment Setup') {
            steps {
                cleanWs()
                script {
                    echo "ℹ️ Node.js: ${sh(script: 'node --version', returnStdout: true).trim()}"
                    echo "ℹ️ npm: ${sh(script: 'npm --version', returnStdout: true).trim()}"

                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: '*/main']],
                        userRemoteConfigs: [[
                            url: 'https://github.com/YohannesTsegaye/smart-recruit-frontend.git',
                            credentialsId: 'github-credentials'
                        ]]
                    ])
                    if (!fileExists('package.json')) {
                        error("❌ package.json not found")
                    }
                    echo "✅ Repository cloned successfully"
                }
            }
        }

        stage('📦 2. Install Dependencies') {
            steps {
                script {
                    sh 'rm -rf node_modules package-lock.json .npmrc'

                    try {
                        // Ensure devDependencies are installed
                        sh 'npm ci --include=dev --no-audit'
                        echo "✅ Dependencies installed via npm ci"
                    } catch (err) {
                        echo "⚠️ npm ci failed, falling back to npm install"
                        sh 'npm install --include=dev --legacy-peer-deps --no-audit --prefer-offline'
                    }

                    // Ensure ESLint, Vite, and @eslint/js exist
                    sh 'npm install --save-dev eslint @eslint/js vite'
                }
            }
        }

        stage('🧹 3. Lint') {
            steps {
                script {
                    try {
                        sh 'npx eslint . --max-warnings=0'
                        echo "✅ Lint passed"
                    } catch (err) {
                        echo "⚠️ Lint issues found (not blocking build)"
                    }
                }
            }
        }

        stage('🏗️ 4. Build') {
            steps {
                script {
                    sh 'npx vite build --emptyOutDir'
                    if (!fileExists('dist/index.html')) {
                        error("❌ Build output not found")
                    }
                    echo "✅ Build completed successfully"
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'dist/**/*', allowEmptyArchive: true
            cleanWs()
        }
        success {
            echo "🎉 Pipeline succeeded!"
        }
        failure {
            echo "❌ Pipeline failed"
        }
    }
}
