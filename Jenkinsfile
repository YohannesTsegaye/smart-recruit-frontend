pipeline {
  agent any

  environment {
    NODE_ENV = 'production'
    REACT_APP_API_URL = 'https://your-backend-api.com' // Set your production API URL
  }

  stages {
    stage('Clone Frontend Repo') {
      steps {
        git branch: 'main', url: 'https://github.com/YohannesTsegaye/frontend-repo.git'
      }
    }

    stage('Install Dependencies') {
      steps {
        // Clean install for consistency
        sh 'rm -rf node_modules package-lock.json'
        sh 'npm install'
      }
    }

    stage('Run Frontend Tests') {
      steps {
        sh 'npm test'
      }
    }

    stage('Build Frontend') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Deploy Frontend') {
      steps {
        // Add your deployment steps here (e.g., S3 sync, Netlify CLI, etc.)
        // Example for S3:
        // sh 'aws s3 sync build/ s3://your-bucket-name'
      }
    }
  }

  post {
    failure {
      echo "❌ Frontend build failed!"
      // Optional: Send notification
    }
    success {
      echo "✅ Frontend deployed successfully!"
      // Optional: Send notification
    }
  }
}