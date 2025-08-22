FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY . .
RUN npm run build
ENV PORT=8083
EXPOSE 8083
CMD ["node", "dist/index.js"]