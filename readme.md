# Starting
## API
Requirements:
- JRE 26: ``winget install -e --id EclipseAdoptium.Temurin.26.JDK``

Steps:
1. ``./gradlew bootRun``

## Webapp
Requirements:
- NodeJS: ``winget install -e --id OpenJS.NodeJS.LTS``

Steps:
1. ``cd src/main/react/houses-ui``
2. ``npm install``
3. ``npm run dev``

## Using

Simple open your browser on http://localhost:5173/ for live dev server.
To view the prebuilt, current production UI go to http://localhost:8080/index.html

User is pre-configured.
username: ``user``
passsword: ``pass``

# Dev
- Backend source code is in ``/src/main/java``
- Frontend source code is in ``/src/main/react``

Technologies used are:
- H2 Database
- Spring Boot
- React
- Prime React

# Deploying app into spring pre-build
1. Build the webapp
2. Copy webapp into src/main/resources/static
3. Push to GH for build