<p align="center">
    <img alt="ALPS Logo" width="128px" src="https://raw.githubusercontent.com/hpi-dhc/alps/master/docs/images/logo_vertical.svg">
</p>

# A Web Platform for Analyzing Multimodal Sensor Data

![Preprocessing Screen](/docs/images/preprocess_screen.png)

The Internet of Things enables us to record a vast amount of information about activities, the environment and the physiological state of a person.
In particular, wearables promise the development of new methods for prevention and treatment of diseases.
Clinical studies often involve multiple devices from different manufacturers, which make use of different data formats and usually offer no way to synchronize them.
Additionally, existing analysis tools are often tailored to a very specific use case.
Thus, professionals working with data collection and analysis execute a lot of manual work to gather and combine the recorded data.
This paper presents an extensible web platform with an integrated event-based synchronization method that enables researchers with clinical and engineering background to analyze multimodal sensor data.
Plug-ins for new devices, filtering and analysis methods allow the customization for different research scenarios.
A case study on Heart Rate Variability (HRV) shows that the platform simplifies the comparative analysis of multiple signals and supports the exploration of data from different wearables.

Read the full paper:  
[ALPS: A Web Platform For Analyzing Multimodal Sensor Data in the Context of Digital Health](https://doi.org/10.1109/ICHI48887.2020.9374371)

## Demo

You can find some videos demonstrating the interface on the [GitHub page](https://hpi-dhc.github.io/alps/).

## Getting Started

The repository contains two docker-compose files for development and production. In the following, the setup is explained for each.

### Development

1. Clone git repository.
   ```sh
   git clone git@github.com:hpi-dhc/alps.git
   cd alps
   ```
2. Build and start services.
   ```sh
   docker-compose up -d
   ```
3. Populate database with necessary tables.
    ```sh
    docker-compose exec backend python manage.py migrate --noinput
    ```
4. Generate admin user.
    ```sh
    docker-compose exec backend python manage.py createsuperuser
    ```
5. The frontend should be available under http://localhost:3000 and the backend under http://localhost:8000.


### Production [WIP]

1. Clone git repository.
   ```sh
   git clone git@github.com:hpi-dhc/alps.git
   cd alps
   ```
2. In the `docker-compose.production.yml` adjust the build argument `REACT_APP_BACKEND_URL` to the URL where the backend will be located.
3. Configure the environment variables in `production.env` according to your setup. A secret key for Django can be generated under https://djecrety.ir/.
4. If necessary, adjust the `nginx.conf` and port mapping.
5. Start the services. The frontend will be built with the specified backend URL.
   ```sh
   docker-compose -f docker-compose.production.yml up -d
   ```
6. Copy static files of backend to servable location.
    ```sh
    docker-compose exec backend python manage.py collectstatic
    ```
7. Populate database with necessary tables.
    ```sh
    docker-compose exec backend python manage.py migrate --noinput
    ```
8. Generate admin user.
    ```sh
    docker-compose exec backend python manage.py createsuperuser
    ```
9. You should be able to login with your generated user.
