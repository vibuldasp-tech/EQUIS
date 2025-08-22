FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY . .
RUN npm run build
ENV PORT=8082
EXPOSE 8082
CMD ["node", "dist/index.js"]