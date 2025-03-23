# CS5500-Group8-Tourism-Web-App | Backend
This web-based platform enables admins to manage tourism spot posts (create, read, update, delete) and allows users to star their favorite spots. It aims to ensure a seamless user experience, maintain data integrity, and support scalability. 

# Create .env file
```cd backend```
```touch .env```

# Add the following to the .env file
```
DATABASE_URL="postgresql://<user>:<password>@localhost:3306/postsdb"
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

