# Estágio de Build
FROM node:16-alpine AS build

# Instalar dependências para compilação (necessário para alguns pacotes npm)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copia arquivos de definição de pacotes
COPY package*.json ./

# Instala as dependências (ignora scripts de lint para evitar erros de compilação no docker)
RUN npm install --ignore-scripts

# Copia o código fonte
COPY . .

# Gera a versão Web do painel
RUN npm run build:web

# Estágio de Execução (Nginx)
FROM nginx:stable-alpine

# Copia o build gerado para a pasta do servidor
COPY --from=build /app/dist/web /usr/share/nginx/html

# Exposição da porta padrão
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
