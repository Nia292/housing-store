FROM docker.io/eclipse-temurin:26-jre-alpine
RUN mkdir /opt/app
run mkdir /opt/persistent
ENV SPRING_DATASOURCE_URL "jdbc:h2:file:/opt/persistent/housing.db;DB_CLOSE_ON_EXIT=FALSE;AUTO_RECONNECT=TRUE"

COPY build/libs/housingdb-0.0.1-SNAPSHOT.jar /opt/app/housingdb.jar

CMD ["java", "-jar", "/opt/app/housingdb.jar"]