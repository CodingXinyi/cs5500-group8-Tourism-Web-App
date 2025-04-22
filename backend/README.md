# CS5500-Group8-Tourism-Web-App | Backend
This web-based platform enables admins to manage tourism spot posts (create, read, update, delete) and allows users to star their favorite spots. It aims to ensure a seamless user experience, maintain data integrity, and support scalability. 

# Create .env file
```cd backend```
```touch .env```

# Add the following to the .env file
```
<!-- DATABASE_URL="mysql://<user>:<password>@localhost:3306/postsdb" -->
DATABASE_URL="postgresql://xinyi:fa6G4iygGlK6n87eiAvYyAhsxMe7aFk6@dpg-d03ciamuk2gs73fk2g90-a.oregon-postgres.render.com/wonderdb_drhd"
GEMINI_API_KEY="<API_KEY>"
```
# Prisma generate
```cd backend```
```npx prisma generate --schema=server/prisma/schema.prisma```
# Prisma push
```cd backend```
```npx prisma db push --schema=server/prisma/schema.prisma```

# Command to run the server
```cd backend```
```npx nodemon server/api.js```

# Command to run the prisma studio
```cd backend```
```npx prisma studio --schema=server/prisma/schema.prisma```

# Endpoints
## public URL
```https://cs5500-group8-tourism-web-app.onrender.com```

## Posts
- `GET /posts` - Get all tourism spots
- `GET /posts/:id` - Get details of a specific spot
- `GET /posts/:postId/comments` - Get all comments for a specific spot
- `POST /posts` - Create a new spot
  - Required params: userId, postName, location, introduction, description, policy, pictureUrl
- `PUT /posts/:id` - Update spot information
- `DELETE /posts/:id` - Delete a spot

## Users
- `POST /user` - Create a new user
  - Required params: email, name, username, password
- `GET /user/:id` - Get user information (including user's posts, ratings and comments)
- `POST /user/login` - User login
  - Required params: username, password

## Comments
- `POST /comments` - Create a new comment
  - Required params: userId, postId, comment
- `PUT /comments/:id` - Update comment content
  - Required params: comment
- `DELETE /comments/:id` - Delete a comment
