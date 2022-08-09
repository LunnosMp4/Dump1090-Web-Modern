# Frontend

If you want to change the place where the `aircraft.json` file is located (the file that contains the information on the planes), you can modify it in the file` js/main.js` to the ** line 45**.
The basic location is `http://{Your Raspberry IP}/Tar1090/Data/Aircraft.json`

You can also do the same thing to change the location of the database of the database in the same file at ** line 56 **.

## Hosting

Je vous conseille d'héberger ce serveur sur un serveur Raspberry Pi a l'aide d'Apache.
    
```bash
    sudo apt-get update
    sudo apt-get install apache2
    sudo service apache2 restart
```
Vous pouvez ensuite mettre le contenu du dossier `frontend` dans le dossier `/var/www/html/`
Vous pourrez ensuite acceder au site via le lien suivant :

*http://{Your Raspberry IP}/index.html*