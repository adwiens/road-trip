# Road Trip

## Usage

1. Run `npm install` or `yarn` in root folder.
2. Run `npm start` or `yarn start` to start both the Angular app and the RESTful API server.
3. Open `localhost:4200` in a browser.

The app starts with the given example with Adriana, Bao, and Camden.

Any number of people and expenses can be added.

## Solver

I solved the problem for any number of people by writing a linear program in [solver.ts](apps/api/src/app/solver.ts) that minimizes the total sum of money transferred between people.

The linear program can be thought of as minimizing the sum of the  edges in a fully connected graph where each node is a person, each edge is the amount of money transferred from one person to another, and there is a non-negative edge in each direction between each pair of nodes.

Unit tests for the solver are in [solver.spec.ts](apps/api/src/app/solver.spec.ts).
