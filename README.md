# ShareXServer
This is a very simple Node.js script using Express to allow file uploads.

This project was created due to frustration with how bloated some of these other ShareX servers are.

## Features
- Upload files with a simple token using ShareX
- Generate a random file name with a specific length
- View those files
- Redirect to another page if a file is not found

## Installation
As always, I recommend using Docker containers, or Pterodactyl if you are not too experienced with it.

1. Ensure you have Node.js 16+ installed (`node -v` in a terminal)
2. Clone this project `git clone git@github.com:NotGeri/ShareXServer`
3. Install its dependencies: `cd ShareXServer; npm i`
4. Create your environment file: `cp .env.dist .env` and fill it out with your details
5. Start the server `node index.js`
6. Download the [example.sxcu](./example.sxcu) file and open it in a text editor. You will want to change anything in `<>` brackets, and then save the file.
7. Double file to allow ShareX to import it as a destination.
8. Use your screenshot/upload tool to ensure everything works!
