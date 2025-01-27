# Steps to Initialize Project
1. Clone sourcecode from git
2. Run commands `npm install` and `npm install -g` (requires npm)

# Dev Build Steps
1. If configs changed/added run `genconfig`
2. Run `npm run dev`
3. Run `npm run devStart`
4. The game is now playable at http://localhost:3000/

# Prod Build Steps
1. If configs changed/added run `genconfig`
2. Run `npm run prod`
3. Run `node src/server/server.js`
4. The game is now playable on port 3000