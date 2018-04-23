A continuation of nwHacks 2018. An image recognition waste sorting system that
uses AWS Rekognition to identify what category (garbage, recycling, or compost)
a piece of trash belongs to. The system will then open the corresponding waste
bin for proper trash disposal.


Functionalities:
------

- Waste categorization using image recognition
- Supports multiple waste bins using a unique id assigned to each bin

- Two operation modes, automatic and manual:

#### Automatic mode:

- Opens the correct bin (i.e. garbage, recycling, or compost) based on the type
 of waste thrown away
- Remembers the previous state of each bin when it was in manual mode

#### Manual:

- User can manually toggle each bin open and closed
- Manual control done through both the website and app
- Shows a log of when each bin was accessed
- User can access different bins using their respective ids
- Log kept of when each bin was accessed
- Count of the number of items that have been deposited into the bins and reset button


Technologies:
------

####  Server:

- AWS Rekognition
- Ubuntu 16.04 VPS (on AWS Lightsail)
- Node.js
- Express
- SQLite
- Languages: Javascript / SQL

#### Website:

- Bootstrap
- jQuery
- Chart.js
- Languages: HTML / CSS / Javascript

#### Mobile app:

- React Native
- Languages: Javascript

#### Raspberry Pi:

- Pigpio daemon (software timed PWM)
- Requests package
- Languages: Python
