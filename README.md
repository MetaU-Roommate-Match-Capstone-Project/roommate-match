# Roomify - A roommate matching web application

This web application is designed to help interns and new grads find roommates. It is a simple and easy-to-use platform that recommends people individual based roommate recommendations, or optimal groups of roommates.

## Project Documentation

Project Plan (**required**): [Roomify Project Plan](https://docs.google.com/document/d/16vlOeixRl765HqjoHOrlddstkpDiZVMz_vsW1B8fjA8/edit?usp=sharing)
Technical Challenges Documentation: [Roomify Technical Challenges](https://docs.google.com/document/d/1f9lq1fQQ2rHf0PlS3mazFINteZk_Dk40Gpoffj_iBzg/edit?usp=sharing)

## Deployed application

To use the deployed application, please visit the following link: [Roomify](https://roomify-metau.onrender.com/)
- Note: The deployed application will continuously update as the project is developed. Everytime the project is redeployed, images that were previously uploaded will be removed due to limitations with the free tier of persistent disk storage on Render.

## How to run this application:

1. Clone this repository to your local machine.
2. Open a split terminal window to run the backend and frontend at the same time.
3. Run the backend server by entering the following commands:
   ```
   cd server
   npm install
   npm run dev
   ```
4. Run the frontend by entering the following commands:
   ```
   cd client
   npm install
   npm run dev
   ```
5. To view the database, enter the following commands in a new terminal window:
   ```
    cd server
    npx prisma generate
    npx prisma studio
   ```
6. Open a browser and navigate to http://localhost:5173 to view the application.
