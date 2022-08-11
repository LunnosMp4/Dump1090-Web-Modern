# Frontend

If you want to change the place where the `aircraft.json` file is located (the file that contains the information on the planes), you can modify it in the file` js/main.js` to the ** line 45**.
The basic location is `http://{Your Raspberry IP}/Tar1090/Data/Aircraft.json`

You can also do the same thing to change the location of the database of the database in the same file at ** line 56 **.

## Hosting

I advise you to host this server on a Raspberry Pi server using Apache.
    
```bash
    sudo apt-get update
    sudo apt-get install apache2
    sudo service apache2 restart
```
You can then put the content of the folder `frontend` in the folder `/var/www/html/`
You can then access the site via the following link:

*http://{Your Raspberry IP}/index.html*