FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev=false
COPY . .
ENV PORT=5174
EXPOSE 5174
CMD ["npm", "run", "dev"]