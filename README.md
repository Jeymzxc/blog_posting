My final project for ASIA

Peñaflor, James Marlo B. - NT-3201 <br/>
Database - MySQL <br/>
Application - Xampp <br/>

Basic API Security - User authentication (registration & login) using JWT token <br/>
Rate limiter - 100 transactions every 2 minutes <br/>

Setup Instructions:
1. Clone the repository.
2. Run `npm install` to install dependencies:
    - express 
    - mysql2 
    - bcrypt 
    - jsonwebtoken 
    - express-rate-limit
    - dotenv 

    > 📌 Note: Do this step only when the 'node_modules' folder is not included when you cloned the project. Without this step, the project will not work due to missing dependencies.

3. Start your XAMPP server (Apache & MySQL)
4. Open a browser then go to localhost/phpmyadmin/
5. Create a database named pblog_db, then import pblog_db.sql
5. Create a `.env` file and generate your secret key by running in terminal:
    - node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    - then copy the generated key to the .env
    - Format: SECRET_KEY=your_generated_key
6. Run the server in the terminal using `node index.js` or `nodemon index.js` if you have nodemon installed.

Method and Endpoints  <br/> 
User registration -  POST - http://localhost:3000/register <br/> 
User login - POST - http://localhost:3000/login <br/> 
Retrieve all blog posts- GET - http://localhost:3000/posts <br/> 
Retrive specific blog post - GET - http://localhost:3000/posts/:id <br/> 
Create new blog post - POST - http://localhost:3000/posts <br/> 
Update an existing blog post - PATCH - http://localhost:3000/posts/:id <br/> 
Delete a blog post - DELETE - http://localhost:3000/posts/:id <br/> 

Drive video link - (batstateu domain)  
https://drive.google.com/drive/folders/1rrYKgObKnYcx5K0RcZTnMuzv9JZV8tQW?usp=sharing