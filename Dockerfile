FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# 显式注入生产环境所需的 Vite 变量
ARG VITE_SUPABASE_URL=https://jzvpilyvupnichmdkizu.supabase.co
ARG VITE_SUPABASE_ANON_KEY=sb_publishable_G3MQ5B-Mp61ecNOc3GrZRQ_S7rSK8V6
ARG VITE_AUTH_REDIRECT_URL=https://react.study-tracker.asia/

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_AUTH_REDIRECT_URL=$VITE_AUTH_REDIRECT_URL

RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
