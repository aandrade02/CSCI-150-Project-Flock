# Docker instructions

## Install Docker and Docker Compose
sudo apt update  
sudo apt install -y docker.io docker-compose-v2  
sudo usermod -aG docker $USER  
newgrp docker  

## CD into Frontend directory 
cd frontend

## Run Docker Compose and check container status
docker compose up -d --build  
docker compose ps  

The container will make the frontend available on port 5173 of your local machine.  
To connect to it on your local machine enter 127.0.0.1:5173 in a web browser.  



# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
