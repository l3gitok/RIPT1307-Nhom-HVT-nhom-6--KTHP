pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "l3igitok/gamehub-backend:latest"
    }

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/l3gitok/gamehub-backend.git'
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE}")
                }
            }
        }
        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    script {
                        docker.withRegistry('', 'dockerhub') {
                            docker.image("${DOCKER_IMAGE}").push()
                        }
                    }
                }
            }
        }
        stage('Deploy') {
            steps {
                // SSH vào server và chạy docker-compose pull/up hoặc dùng plugin SSH
                sh 'ssh user@your-server "cd /path/to/project && docker-compose pull && docker-compose up -d"'
            }
        }
    }
}