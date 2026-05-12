# Step 1: The Build Stage
FROM maven:4.0.0-rc-5-amazoncorretto-25 AS build
WORKDIR /app

# Copy only the pom.xml first to cache dependencies (Efficiency)
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy the source code
COPY src ./src

# Run the package command - removing -DskipTests for a second 
# just to see if Maven actually starts. If it fails, you'll see why.
RUN mvn clean package -DskipTests

# Step 2: The Final Run Stage
FROM amazoncorretto:25
WORKDIR /app

# IMPORTANT: Check the path. If your pom.xml defines a specific 
# finalName, use that instead of the wildcard.
COPY --from=build /app/target/*.jar app.jar

EXPOSE 9090
ENTRYPOINT ["java", "-jar", "app.jar"]