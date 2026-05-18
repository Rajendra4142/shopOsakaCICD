FROM eclipse-temurin:21

WORKDIR /app

COPY target/ShopOsaka-0.0.1-SNAPSHOT.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]