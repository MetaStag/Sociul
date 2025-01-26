## Sociul

A demo social media app.

#### Tech-Stack
- **Next.js** - Frontend
- **Firebase** - Backend (as a service)
- **Shadcn/ui** - UI Components 

#### Features
- **Login/Signup** using email/password or **google oauth**
- **Edit profile details** - username, description, gender, website link, pfp link
- **See your profile** and see what posts you have made
- **Search profiles**, See other people's profiles and **follow them**
- **Global feed** for all feeds
- Open individual posts, read comments and **like, comment, share and reshare**
- **Sign out** safely

#### Database Schema
userData table
```
username: ""
description: ""
imageURL: ""
gender: "male|female|others"
website: ""
followers: []
following: []
```

posts table
```
title: ""
description: ""
date: Date
author: ""
likes: []
comments: [] (array of objects of type { author: "", comment : ""})
```

#### Limitations

- Ability to upload profile pictures is missing because firebase storage costs money

- instead the ability to set an image url as profile pic has been provided
