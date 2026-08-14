# Stage 1: Build application
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy maven wrapper & pom
COPY .mvn .mvn
COPY mvnw mvnw.cmd pom.xml ./
RUN ./mvnw dependency:go-offline -B

# Copy source code & package
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
