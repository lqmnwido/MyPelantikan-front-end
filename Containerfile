# Use official Node.js image for build
FROM node:23 AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Use Nginx to serve the built files
FROM nginx:alpine AS production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy custom nginx config if needed (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

#nerdctl build --platform linux/amd64 -t terung.kai.2enapps.my/jpm/mypelantikan/mypelantikan-ui:0.2 .
#nerdctl run -p 8080:80 terung.kai.2enapps.my/jpm/mypelantikan/mypelantikan-ui:0.2
#nerdctl push terung.kai.2enapps.my/jpm/mypelantikan/mypelantikan-ui:0.2