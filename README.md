# Dump1090-Web-Modern

The goal of this project is to create a clean and modern interface for dump1090. The current one actually dates from more than 10 years ago.

This web service will work with this version of dump1090 :
  - [tar1090](https://github.com/wiedehopf/tar1090)

It will also be possible to connect a **discord webhook** in order to receive information from your ADS-B directly on a discord server.

This project is currently being developed and many things can be changed, if you have any ideas for additions do not hesitate to contact me !
This website therefore aims to be very simple to set up and allow as many people as possible to benefit from a web version in tune with the times and which does not look like a good old windows 98.

I'm using script from https://github.com/Slord6/1090webclient to show airplane on the map.

## Interface

Here are some images of the interface, as you can see, you can have access to a lot of information such as altitude, speed, heading, etc... but also the image of the plane and its type, its operator or even its manufacturer !

<img src="https://zupimages.net/up/22/31/xu1i.png" width="500"></img>
<img src="https://zupimages.net/up/22/31/w2fw.png" width="500"></img>

## Errors

There are errors that can occur in the operation of this service.
Indeed if you do not see any plane, check the console of your browser.
This is surely due to the following error:

```
Access-Control-Allow-Origin' header is present on the requested resource.
```

In order to adjust this error you must go to the repository [tar1090] (https://github.com/wiedehopf/tar1090) and modify the file `88-tar1090.conf` and add the following line:

```conf
$HTTP["url"] =~ "^/INSTANCE/data/aircraft\.json$" {
    setenv.add-response-header += (
      "Access-Control-Allow-Origin" => "*",  # <-- Add this line
      "Cache-Control" => "public, no-cache",
    )
}
```

If it does not work, you can try to install the following extension on your browser :
[Moesif Origin & CORS Changer](https://chrome.google.com/webstore/detail/moesif-origin-cors-change/digfbfaphojjndkpccljibejjbppifbc)

## Sources

### Database

You can use the database provided in the folder `databate` of the repository.
This database lists any information on aircraft from their ICAO code (Hex) (register, type, model, manufacturer ...) and date of 2018.


**Please note: if you want a more recent and much more supplied database (last update : 06/08/22) you can download it from the following link (download hosting on mega.nz) and replace the existing one in the folder `database`. This new database is obviously compatible and I strongly advise you to install it !**

- [Nouvelle Database](https://mega.nz/file/keZHQYwT#ZizpRH-k9WsoMk4b7Rgoj2czCrp5PSdVF0JyGr3e42k)

**Do not hesitate to put a star if you like the project !**
