# Stage 1: Build the application
FROM maven:4.0.0-rc-5-amazoncorretto-25 AS build
WORKDIR /app
# Copy the pom.xml and source code
COPY pom.xml .
COPY src ./src
# Package the application (skipping tests for faster builds during dev)
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM amazoncorretto:25
WORKDIR /app
# Copy the built jar from the previous stage
COPY --from=build /app/target/*.jar app.jar
# Expose the port
EXPOSE 9090
# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]