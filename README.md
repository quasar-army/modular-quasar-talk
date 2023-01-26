# modular-quasar-talk
Repo to support the modular Quasar Talk

## The Api
You'll need php, composer and docker installed to get the api running.
```sh
cd api
composer install
sail up
```

## The App
The app is setup to use pnpm. Install dependencies, and run it!
```sh
cd app
pnpm install
pnpm dev
```

## A few places to look!
- take a look at how env vars are handled in `/env`, `quasar.config.js` and `src/env.d.ts`
- all hygen generators sit inside the `app/_templates` directory
- we have strong linting setup within `.eslintrc.js` (line 47). Also take a look at how we enforce tag order at line 99!
- we're using unocss so that we're ready when additional styles are needed
- configs are organized in their own folders within `app/config`
- we can run all our component tests with `p test:component`
