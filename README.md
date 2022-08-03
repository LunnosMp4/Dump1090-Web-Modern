# dump1090-Web-Modern

The goal of this project is to create a clean and modern interface for dump1090. The current one actually dates from more than 10 years ago.

This web service will work with this version of dump1090 :
  - [tar1090](https://github.com/wiedehopf/tar1090)

It will also be possible to connect a **discord webhook** in order to receive information from your ADS-B directly on a discord server.

This project is currently being developed and many things can be changed, if you have any ideas for additions do not hesitate to contact me !
This website therefore aims to be very simple to set up and allow as many people as possible to benefit from a web version in tune with the times and which does not look like a good old windows 98.

I'm using script from https://github.com/Slord6/1090webclient to show airplane on the map.

## Errors

There are errors that can occur in the operation of this service.
Indeed if you do not see any plane, check the console of your browser.
This is surely due to the following error:

```
Access-Control-Allow-Origin' header is present on the requested resource.
```

In order to adjust this error you must go to the restitory [tar1090] (https://github.com/wiedehopf/tar1090) and modify the file `88-tar1090.conf` and add the following line:

```conf
$HTTP["url"] =~ "^/INSTANCE/data/aircraft\.json$" {
    setenv.add-response-header += (
      "Access-Control-Allow-Origin" => "*",  # <-- Add this line
      "Cache-Control" => "public, no-cache",
    )
}
```

Si toute fois cela ne fonctionne pas, vous pouvez essayez d'installer l'extension suivante sur votre navigateur :
[Moesif Origin & CORS Changer](https://chrome.google.com/webstore/detail/moesif-origin-cors-change/digfbfaphojjndkpccljibejjbppifbc)

## Sources

Sun, J. (2017). World Aircraft Database. 
Retrieved from http://junzis.com/adb/data 

**Do not hesitate to put a star if you like the project !**
