# 1. Use an official Node.js image as the base
FROM node:18-alpine

# 2. Set working directory inside container
WORKDIR /app

# 3. Copy package.json and package-lock.json
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of your code
COPY . .

# 6. Build TypeScript into JavaScript
RUN npm run build

# 7. Expose port (ensure it's same as in your app)
EXPOSE 3000

# 8. Run the app
CMD ["node", "dist/index.js"]
