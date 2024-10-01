# <img src="/original-wordmark-logo.svg" alt="EverGoGreen?" height="60" />
ExpressJS web app for tracking vegetation health across the world, using SQLite3, Express-Validator, and more.

## prerequisites

- GitHub CLI or GitBash (optional)
- Node.js >= v16.14.2
- Postman (for test api)

## installation

You can download this project by clicking "Code" button on GitHub or open terminal/cmd prompt in desired destination and type the following command:

```
git clone https://github.com/nilimeshpatra/evergogreen.git
```

After downloading/cloning the repository. Go into project directory by typing the following command:

```
cd evergogreen
```

Now, type the following command to install the dependencies:

```
npm i
```

To start the server, type:

```
npm start
```

This should print a message to terminal/cmd prompt that server has started at port number specified in `config.json` file. (default is 3000)

Type the following URL in any browser's address bar to access the running project:

```
https://localhost:3000/
```

API endpoints follow this route:

```
https://localhost:3000/api/*
```

### Users

```
https://localhost:3000/api/users/*
```

### VHI

```
https://localhost:3000/api/vhi/*
```

## testing

Additionally you can use Postman Desktop Client for testing API.

