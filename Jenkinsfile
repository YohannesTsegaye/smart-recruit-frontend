pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
        VITE_API_URL = 'http://localhost:3000'
    }

    stages {
        stage('🏗️ 1. Checkout Code') {
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
                    
                    // Check if package-lock.json exists
                    def lockFileExists = fileExists('package-lock.json')
                    
                    if (lockFileExists) {
                        try {
                            sh 'npm ci --omit=dev'
                            echo "✅ Dependencies installed (ci mode)"
                        } catch (err) {
                            echo "⚠️ npm ci failed, falling back to npm install"
                            sh 'npm install --omit=dev'
                        }
                    } else {
                        sh 'npm install --omit=dev'
                        echo "✅ Dependencies installed (npm install)"
                    }
                }
            }
        }

        stage('🧹 3. Lint Code') {
            steps {
                script {
                    // Check if lint script exists
                    def hasLintScript = sh(script: 'grep -q "\"lint\":" package.json && echo "yes" || echo "no"', returnStdout: true).trim()
                    
                    if (hasLintScript == "yes") {
                        sh 'npm run lint || echo "Lint issues found"'
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
                    def hasTestScript = sh(script: 'grep -q "\"test\":" package.json && echo "yes" || echo "no"', returnStdout: true).trim()
                    
                    if (hasTestScript == "yes") {
                        try {
                            sh 'npm test'
                            echo "✅ Tests passed"
                        } catch (err) {
                            error("❌ Tests failed - aborting pipeline")
                        }
                    } else {
                        echo "ℹ️ No test script found - skipping tests"
                    }
                }
            }
        }

        stage('🏗️ 5. Build Project') {
            steps {
                script {
                    // Check if build script exists
                    def hasBuildScript = sh(script: 'grep -q "\"build\":" package.json && echo "yes" || echo "no"', returnStdout: true).trim()
                    
                    if (hasBuildScript == "yes") {
                        sh 'npm run build'
                        echo "✅ Build completed successfully"
                        sh 'ls -la dist/ || ls -la build/'
                    } else {
                        error("❌ No build script found - cannot continue")
                    }
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
            emailext (
                subject: "✅ Frontend Pipeline Success - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Frontend build completed successfully\nBuild URL: ${env.BUILD_URL}",
                to: 'your-email@example.com'
            )
        }
        failure {
            echo "❌ Pipeline failed"
            emailext (
                subject: "❌ Frontend Pipeline Failed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Frontend build failed\nBuild URL: ${env.BUILD_URL}",
                to: 'your-email@example.com'
            )
        }
    }
}
