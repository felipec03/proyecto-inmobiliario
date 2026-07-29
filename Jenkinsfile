pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'milocal-test'
    }

    triggers {
        githubPush()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh '''
                    echo "Branch: $(git branch --show-current)"
                    echo "Commit:  $(git rev-parse --short HEAD)"
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    docker compose down --remove-orphans || true
                    docker rm -f milocal-db milocal-api milocal-web 2>/dev/null || true
                    docker builder prune -f || true
                    docker compose build --no-cache
                    docker compose up -d
                    docker compose ps
                '''
            }
        }

        stage('Healthcheck') {
            steps {
                sh '''
                    curl -s -o /dev/null -w "  Frontend: %{http_code}\\n" http://localhost:3001
                    echo "Backend (esperando hasta 60s):"
                    for i in $(seq 1 12); do
                        STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/ 2>/dev/null || echo "000")
                        if [ "$STATUS" = "200" ]; then
                            echo "  Status: 200 OK (intento $i)"
                            break
                        fi
                        echo "  Esperando... intento $i - status: $STATUS"
                        sleep 5
                    done
                    echo ""
                    docker compose ps
                '''
            }
        }
    }

    post {
        success {
            echo 'Deploy desplegado exitosamente'
        }
        failure {
            echo 'Deploy fallo. Revisa los logs.'
        }
    }
}
