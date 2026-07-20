# live : https://roxiler-assignment-sandy.vercel.app/
- Note : added .env.example file for guidance
  
# Frontend 
- Using React Vite :
    - Commands 
        - cd frontend
        - npm install
        - npm run build
        - npm run dev
# Backend
- Using express and Node.js
    - Commands
        - cd backend
        - npm install
        - npx prisma migrate dev (first add db url to .env)
        - npm run build (will also generate prisma client)
        - npm run dev 
  
# Pages 
- /signup
- /login
- /ratings
    - Admin can view all ratings by all the users
    - Owner can view only ratings to their own store
    - Users can view only their own ratings given to different stores
- /stores
    - All type of users can view all the stores
    - only USER can rate or update their ratings
- /users
    - Admin can see all the users including their types
    - Owner can see all those users who rated their store including their given rating
