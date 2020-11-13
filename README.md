# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (similar to bit.ly).

It has analytics to see number of visits, number of unique visitors and a visitor log with timestamp and IP address. It tracks on the edit URL page after someone has visited the shortURL formatted link eg /u/2d567H. The next time the URL edit page is refreshed it will show analytics data for visitors.

A live version of it can be tested here, note that the JSON database won't save since heroku users an ephemeral filesystem and resets.
https://marcelmueller-tinyapp.herokuapp.com/

## Final Product

!["screenshot description"](https://github.com/marcellmueller/tinyapp/blob/master/docs/tinyapp1.png)
!["screenshot description"](https://github.com/marcellmueller/tinyapp/blob/master/docs/tinyapp2.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- method-override

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
