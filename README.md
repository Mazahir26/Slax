# SLAX

It's an open source next js project, which helps people remember birthdays via email.

## Table of Contents

- [About](#about)
- [Getting Started](#getting-started)
- [Features](#features)

## About

This is a fun personal project, which I made to solve a simple problem which was forgetting dates. This website solves that exact problem.

## Getting Started

I recommend you to host your own version SLAX. but if you just wanna try it out then you can check it out [here](https://www.slax.studio). if you want to host your own version of this website you can follow the steps below.

### 1. Step 1

- Make an account on [vercel](https://vercel.com)
- Make an MongoDb Atlas account [Atlas](https://www.mongodb.com/atlas), i.e Create a Database.

### 2. Step 2

- Clone the repo `$ git clone https://github.com/Mazahir26/Slax.git`

- Install dependencies `$ npm install` or `$ yarn install`

- Create a .env.local file and add all the required values (Refer /.env.example)

- run `$ npm run dev` or `$ yarn run dev` to locally host. (Check if there are no errors)

- You can change the logo(/public) or name(\components\layout\navbar.tsx)

- If no errors pop up, Then the project is ready to be hosted. (For real) :wink:.

### 3. Step 3

- Go to your vercel dashboard create a project and follow the steps.

- But to add the reminder feature you can use [cronhub](https://cronhub.io/) to set up cron job feature. (you can use github action as well)

- Schedule it to run every 24hrs, and Target Url is `yourprojectname.vercel.app/api/sendEmail` (or your domain). Make sure that the req is a POST and json body should consist of key (same as you defined in .env.local)

- Thats it, Feel free to contact me if you face an issue.

## Features

- Email Notification Support
- Multi device Support
- Minimal design
- and much more..

## Found a Bug

- if you find any bugs, please raise an issue
- or, [contact me](http://mazahir26.github.io/)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Thank You

Thanks for checking out my project, I would love to see your implementations of the project, you can [contact](http://mazahir26.github.io/) me via Mail or Telegram.
