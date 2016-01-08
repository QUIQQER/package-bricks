
QUIQQER Bausteine
========


Paketname:

    quiqqer/bricks


Features
--------

- Baustein-Verwaltung
- Einer Seite können verschiedene Bausteine zugewiesen werden
- Bausteine können für jedes Projekt eigens angelegt und verwaltet werden

Installation
------------

Der Paketname ist: quiqqer/bricks

Nutzung des Simple Google Maps Baustein:
- GoogleMap Key: https://console.developers.google.com/apis/library
- Benötigtte APIS:  Google Maps Embed API, Google Maps JavaScript API, Google Static Maps API 


Mitwirken
----------

- Project: https://dev.quiqqer.com/quiqqer/package-bricks
- Issue Tracker: https://dev.quiqqer.com/quiqqer/package-bricks/issues
- Source Code: https://dev.quiqqer.com/quiqqer/package-bricks/tree/master


Support
-------

Falls Sie ein Fehler gefunden haben oder Verbesserungen wünschen,
Dann können Sie gerne an support@pcsg.de eine E-Mail schreiben.


License
-------

GPL-3.0+

Entwickler
--------

PHP - Eigenen Baustein

```php
<?php

class Baustein extends QUI\Control
{
    public function __construct($attributes = array())
    {
    
    }
    
    public function getBody()
    {
        return '<p>html</p>';
    }
}

?>
```


Template Area

```html
{brickarea assign="bricks" area="footer" Site=$Site}
```