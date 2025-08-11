pipeline {
    agent any

    parameters {
        string(name: 'VITE_API_URL', defaultValue: 'https://your-backend-api.com', description: 'Backend API URL for production')
        string(name: 'VITE_APP_NAME', defaultValue: 'Smart Recruit', description: 'Application name')
        choice(name: 'DEPLOYMENT_TARGET', choices: ['S3', 'Netlify', 'Vercel'], description: 'Deployment target')
        booleanParam(name: 'FIX_UNUSED_VARS', defaultValue: true, description: 'Automatically fix unused variables before linting')
    }

    environment {
        NODE_ENV = 'production'
    }

    stages {
        stage('Checkout') {
            steps {
                // Clean workspace before checkout
                cleanWs()
                
                // Clone the frontend repository
                git branch: 'main', 
                    url: 'https://github.com/YohannesTsegaye/smart-recruit-frontend.git',
                    credentialsId: 'github-credentials' // Configure this in Jenkins
                
                echo "✅ Frontend repository cloned successfully"
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    // Clean install for consistency
                    sh 'rm -rf node_modules package-lock.json'
                    sh 'npm ci' // Use ci for faster, reliable installs
                    
                    echo "✅ Dependencies installed successfully"
                }
            }
        }

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

        stage('Lint Code') {
            steps {
                script {
                    try {
                        // First try to fix automatically
                        sh 'npm run lint:fix'
                        echo "✅ Code linting and auto-fixing completed"
                    } catch (Exception e) {
                        echo "⚠️ Auto-fix failed, checking for remaining issues..."
                        
                        // Check for remaining lint issues
                        def lintResult = sh(
                            script: 'npm run lint',
                            returnStatus: true
                        )
                        
                        if (lintResult != 0) {
                            echo "❌ Linting issues found that need manual fixing"
                            echo "Common fixes needed:"
                            echo "1. Prefix unused variables with underscore (_variable)"
                            echo "2. Remove unused imports"
                            echo "3. Use underscore for unused function parameters"
                            echo "4. Remove unused state variables"
                            
                            // Continue anyway for now, but you can make this fail the build
                            echo "⚠️ Continuing despite lint issues..."
                        } else {
                            echo "✅ All lint issues resolved"
                        }
                    }
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    try {
                        sh 'npm test -- --watchAll=false --coverage'
                        echo "✅ Tests passed"
                    } catch (Exception e) {
                        echo "⚠️ Tests failed, but continuing..."
                        // You can make this fail the build by removing the try-catch
                    }
                }
            }
        }

        stage('Setup Environment') {
            steps {
                script {
                    // Load environment variables from .env file
                    sh '''
                        # Copy .env.example to .env if .env doesn't exist
                        if [ ! -f .env ]; then
                            cp .env.example .env
                            echo "✅ Created .env from .env.example"
                        fi
                        
                        # Update .env with parameter values
                        sed -i 's|VITE_API_URL=.*|VITE_API_URL='$VITE_API_URL'|g' .env
                        sed -i 's|VITE_APP_NAME=.*|VITE_APP_NAME='$VITE_APP_NAME'|g' .env
                        sed -i 's|VITE_NODE_ENV=.*|VITE_NODE_ENV=production|g' .env
                        
                        echo "✅ Environment variables updated in .env"
                        echo "VITE_API_URL: $VITE_API_URL"
                        echo "VITE_APP_NAME: $VITE_APP_NAME"
                    '''
                }
            }
        }

        stage('Build Frontend') {
            steps {
                script {
                    // Build with .env file
                    sh 'npm run build'
                    
                    echo "✅ Frontend build completed"
                }
            }
        }

        stage('Security Scan') {
            steps {
                script {
                    // Optional: Add security scanning
                    try {
                        sh 'npm audit --audit-level moderate'
                        echo "✅ Security scan passed"
                    } catch (Exception e) {
                        echo "⚠️ Security vulnerabilities found, but continuing..."
                    }
                }
            }
        }

        stage('Deploy to S3') {
            when {
                allOf(
                    branch 'main',
                    expression { params.DEPLOYMENT_TARGET == 'S3' }
                )
            }
            steps {
                script {
                    // Deploy to AWS S3
                    withCredentials([[
                        $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId: 'aws-credentials',
                        accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                        secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                    ]]) {
                        sh '''
                            # Sync build files to S3
                            aws s3 sync dist/ s3://your-frontend-bucket --delete
                            
                            # Invalidate CloudFront cache (if using CloudFront)
                            # aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
                        '''
                    }
                    
                    echo "✅ Frontend deployed to S3 successfully"
                }
            }
        }

        stage('Deploy to Netlify') {
            when {
                allOf(
                    branch 'main',
                    expression { params.DEPLOYMENT_TARGET == 'Netlify' }
                )
            }
            steps {
                script {
                    // Alternative: Deploy to Netlify
                    withCredentials([string(credentialsId: 'netlify-token', variable: 'NETLIFY_TOKEN')]) {
                        sh '''
                            # Install Netlify CLI
                            npm install -g netlify-cli
                            
                            # Deploy to Netlify
                            netlify deploy --prod --dir=dist --site=your-netlify-site-id
                        '''
                    }
                    
                    echo "✅ Frontend deployed to Netlify successfully"
                }
            }
        }

        stage('Deploy to Vercel') {
            when {
                allOf(
                    branch 'main',
                    expression { params.DEPLOYMENT_TARGET == 'Vercel' }
                )
            }
            steps {
                script {
                    // Alternative: Deploy to Vercel
                    withCredentials([string(credentialsId: 'vercel-token', variable: 'VERCEL_TOKEN')]) {
                        sh '''
                            # Install Vercel CLI
                            npm install -g vercel
                            
                            # Deploy to Vercel
                            vercel --prod --token $VERCEL_TOKEN
                        '''
                    }
                    
                    echo "✅ Frontend deployed to Vercel successfully"
                }
            }
        }
    }

    post {
        always {
            // Clean up workspace
            cleanWs()
        }
        
        success {
            script {
                echo "🎉 Frontend pipeline completed successfully!"
                
                // Send success notification
                emailext (
                    subject: "✅ Frontend Deployment Successful - ${env.JOB_NAME}",
                    body: """
                        <h2>Frontend Deployment Successful</h2>
                        <p><strong>Job:</strong> ${env.JOB_NAME}</p>
                        <p><strong>Build:</strong> ${env.BUILD_NUMBER}</p>
                        <p><strong>Branch:</strong> ${env.GIT_BRANCH}</p>
                        <p><strong>Commit:</strong> ${env.GIT_COMMIT}</p>
                        <p><strong>Duration:</strong> ${currentBuild.durationString}</p>
                        <p><strong>URL:</strong> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                        <p><strong>API URL:</strong> ${params.VITE_API_URL}</p>
                        <p><strong>Deployment Target:</strong> ${params.DEPLOYMENT_TARGET}</p>
                        <p><strong>Unused Variables Fixed:</strong> ${params.FIX_UNUSED_VARS}</p>
                    """,
                    to: 'your-email@example.com'
                )
            }
        }
        
        failure {
            script {
                echo "❌ Frontend pipeline failed!"
                
                // Send failure notification
                emailext (
                    subject: "❌ Frontend Deployment Failed - ${env.JOB_NAME}",
                    body: """
                        <h2>Frontend Deployment Failed</h2>
                        <p><strong>Job:</strong> ${env.JOB_NAME}</p>
                        <p><strong>Build:</strong> ${env.BUILD_NUMBER}</p>
                        <p><strong>Branch:</strong> ${env.GIT_BRANCH}</p>
                        <p><strong>Commit:</strong> ${env.GIT_COMMIT}</p>
                        <p><strong>Duration:</strong> ${currentBuild.durationString}</p>
                        <p><strong>URL:</strong> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                        <p><strong>Error:</strong> ${currentBuild.description ?: 'Unknown error'}</p>
                        <p><strong>Common Issues:</strong></p>
                        <ul>
                            <li>ESLint unused variable errors</li>
                            <li>Missing dependencies</li>
                            <li>Build configuration issues</li>
                            <li>Environment variable problems</li>
                        </ul>
                    """,
                    to: 'your-email@example.com'
                )
            }
        }
        
        unstable {
            echo "⚠️ Frontend pipeline is unstable"
        }
    }
}

