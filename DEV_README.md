# Steps to Initialize Project
1. Clone sourcecode from git
2. Run commands `npm install` and `npm install -g typescript eslint jsdoc` (requires npm)

# Dev Build Steps
1. Run `npm run dev:pack`
2. Run `npm run dev:start`
3. The game is now playable at http://localhost:3000/

# Prod Build Steps
1. Run `npm run prod:webpack`
2. Run `npm run prod:build`
3. Run `node dist/nodejs/src/server/server.js`
4. The game is now playable on port 3000